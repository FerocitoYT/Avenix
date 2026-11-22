import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const botInstances = await prisma.botInstance.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      instances: botInstances.map((inst) => ({
        id: inst.id,
        botName: inst.service.name,
        clientEmail: inst.service.user.email,
        node: inst.nodeHost || "eu-node-01.avenix.dev",
        status: inst.status,
        ramMb: inst.memoryUsageMb,
        ramLimitMb: inst.memoryLimitMb,
        cpuPercent: inst.cpuUsagePercent,
        pingMs: 20,
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar infraestructura" }, { status: 500 });
  }
}
