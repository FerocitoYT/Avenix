import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { name: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        clientName: t.user.name,
        clientEmail: t.user.email,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assignedStaff: "Equipo Soporte",
        createdAt: t.createdAt.toISOString(),
        messages: t.messages.map((m) => ({
          id: m.id,
          sender: m.sender?.name || (m.isStaffReply ? "Staff Avenix" : "Cliente"),
          isStaff: m.isStaffReply,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar tickets" }, { status: 500 });
  }
}
