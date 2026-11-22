import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        user: l.user?.name || l.user?.email || "Sistema / Superadmin",
        ipAddress: l.ipAddress || "127.0.0.1",
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar auditoría" }, { status: 500 });
  }
}
