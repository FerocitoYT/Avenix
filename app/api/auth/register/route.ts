import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  discordUsername: z.string().max(100).optional(),
  companyName: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const email = validated.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este correo electrónico" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email,
        passwordHash,
        role: "CLIENT", // Always starts as CLIENT
        discordUsername: validated.discordUsername,
        companyName: validated.companyName,
        isActive: true,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      discordId: newUser.discordId,
      discordUsername: newUser.discordUsername,
      companyName: newUser.companyName,
    };

    const token = signToken(sessionPayload);
    await setSessionCookie(token);

    // Create a welcome notification
    try {
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: "Bienvenido a Avenix Control",
          message: "Tu cuenta ha sido creada exitosamente. Desde aquí podrás gestionar tus servicios, facturas y pedidos.",
          type: "SUCCESS",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTERED",
          entityType: "USER",
          entityId: newUser.id,
        },
      });
    } catch {}

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set("avenix_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos incorrectos" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error de servidor al registrar la cuenta" },
      { status: 500 }
    );
  }
}
