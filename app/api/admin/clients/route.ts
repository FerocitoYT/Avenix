import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        discordUsername: true,
        companyName: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      clients: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        discordUsername: u.discordUsername || undefined,
        companyName: u.companyName || undefined,
        isActive: u.isActive,
        registeredAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    console.error("Admin clients error:", err);
    return NextResponse.json({ error: "Error al cargar clientes" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}
