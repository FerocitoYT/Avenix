import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciales de acceso incorrectas" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Esta cuenta se encuentra desactivada por seguridad. Contacta con soporte." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales de acceso incorrectas" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      companyName: user.companyName,
    };

    const token = signToken(sessionPayload);
    await setSessionCookie(token);

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_LOGIN_SUCCESS",
          entityType: "USER",
          entityId: user.id,
          detailsJson: { email: user.email, role: user.role },
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
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
      { error: "Error de servidor al iniciar sesión" },
      { status: 500 }
    );
  }
}
