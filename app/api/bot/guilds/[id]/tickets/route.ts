import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const access = await authorizeGuild(guildId);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const categories = await prisma.ticketCategory.findMany({
      where: { guildId },
      orderBy: { createdAt: "asc" },
    });

    const panels = await prisma.ticketPanel.findMany({
      where: { guildId },
      include: { categories: true },
    });

    const tickets = await prisma.ticket.findMany({
      where: { guildId },
      include: { category: true },
      orderBy: { ticketNumber: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, categories, panels, tickets });
  } catch (error: any) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json(
      { error: "Error al consultar módulo de tickets" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const access = await authorizeGuild(guildId);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const body = await req.json();

    if (body.action === "CREATE_CATEGORY") {
      const category = await prisma.ticketCategory.create({
        data: {
          guildId,
          name: body.name || "Soporte General",
          emoji: body.emoji || "📩",
          description: body.description || "Atención al cliente",
          discordCategoryId: body.discordCategoryId || guildId,
          maxOpenPerUser: body.maxOpenPerUser || 1,
          welcomeMessage: body.welcomeMessage || "¡Gracias por contactar con soporte!",
        },
      });
      return NextResponse.json({ success: true, category });
    }

    if (body.action === "DELETE_CATEGORY") {
      await prisma.ticketCategory.delete({
        where: { id: body.categoryId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en tickets:", error);
    return NextResponse.json(
      { error: "Error al gestionar categoría de ticket" },
      { status: 500 }
    );
  }
}
