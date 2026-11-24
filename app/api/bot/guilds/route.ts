import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    let allowedGuildIds: string[] | undefined;
    if (user.role !== "ADMIN") {
      const now = new Date();
      const activeInstances = await prisma.botInstance.findMany({
        where: {
          guildId: { not: null },
          service: {
            userId: user.id,
            serviceType: "DISCORD_BOT",
            status: "ACTIVE",
            subscriptions: {
              some: {
                userId: user.id,
                status: { in: ["ACTIVE", "TRIALING"] },
                currentPeriodStart: { lte: now },
                currentPeriodEnd: { gt: now },
              },
            },
          },
        },
        select: { guildId: true },
      });
      allowedGuildIds = activeInstances.flatMap(instance => instance.guildId ? [instance.guildId] : []);
      if (!allowedGuildIds.length) return NextResponse.json({ success: true, guilds: [] });
    }

    const guilds = await prisma.guild.findMany({
      where: {
        isActive: true,
        ...(allowedGuildIds ? { id: { in: allowedGuildIds } } : {}),
      },
      include: {
        securityConfig: true,
        welcomeConfig: true,
        ticketCategories: true,
        _count: {
          select: {
            tickets: true,
            modCases: true,
            economyUsers: true,
            levelUsers: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, guilds });
  } catch (error) {
    console.error("Error al obtener servidores de Discord:", error);
    return NextResponse.json(
      { error: "Error al consultar la base de datos de servidores" },
      { status: 500 }
    );
  }
}
