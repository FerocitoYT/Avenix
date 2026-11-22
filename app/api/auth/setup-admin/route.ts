import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie, ensureCatalogInitialized } from "@/lib/auth";

const setupAdminSchema = z.object({
  setupToken: z.string().min(8, "Token de configuración requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(10, "La contraseña de administrador debe tener al menos 10 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = setupAdminSchema.parse(body);

    const expectedToken = process.env.ADMIN_INITIAL_SETUP_TOKEN;
    if (!expectedToken || validated.setupToken !== expectedToken) {
      return NextResponse.json(
        { error: "Token de inicialización de administrador no válido o no configurado en .env" },
        { status: 403 }
      );
    }

    // Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error:
            "El sistema ya cuenta con un administrador inicial registrado. Por motivos de seguridad este procedimiento está permanentemente cerrado.",
        },
        { status: 400 }
      );
    }

    // Initialize initial catalog products and prices if not already seeded
    await ensureCatalogInitialized();

    const passwordHash = await hashPassword(validated.password);
    const email = validated.email.toLowerCase().trim();

    const adminUser = await prisma.user.create({
      data: {
        name: validated.name,
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "INITIAL_SUPERADMIN_SETUP_COMPLETED",
        entityType: "USER",
        entityId: adminUser.id,
        detailsJson: { email: adminUser.email },
      },
    });

    const sessionPayload = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      discordId: null,
      discordUsername: null,
      companyName: "Avenix Development Staff",
    };

    const token = signToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Superadministrador inicial configurado con éxito.",
      user: sessionPayload,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos incorrectos" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno al inicializar el administrador" },
      { status: 500 }
    );
  }
}
