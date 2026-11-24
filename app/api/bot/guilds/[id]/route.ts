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

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        securityConfig: true,
        securityRules: { orderBy: { createdAt: "desc" } },
        welcomeConfig: true,
        autoRoles: true,
        levelConfig: true,
        ticketCategories: true,
        ticketPanels: true,
        customBot: {
          select: {
            id: true,
            botName: true,
            botAvatarUrl: true,
            tokenMask: true,
            statusText: true,
            activityType: true,
            status: true,
            memoryUsageMb: true,
            pingMs: true,
            lastHeartbeat: true,
            version: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            modCases: true,
            economyUsers: true,
            levelUsers: true,
          },
        },
      },
    });

    if (!guild) {
      return NextResponse.json(
        { error: "Servidor no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    const welcomeOptions=await prisma.setting.findUnique({where:{key:"welcome:options:"+guildId}});
    const welcomePreferences={imageCard:false,includeBots:true,...(welcomeOptions?JSON.parse(welcomeOptions.value):{})};
    // Get recent cases
    const recentModCases = await prisma.modCase.findMany({
      where: { guildId },
      orderBy: { caseNumber: "desc" },
      take: 10,
    });

    // Get recent tickets
    const recentTickets = await prisma.ticket.findMany({
      where: { guildId },
      include: { category: true },
      orderBy: { ticketNumber: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      guild: {...guild,welcomeOptions:welcomePreferences},
      recentModCases,
      recentTickets,
    });
  } catch (error: any) {
    console.error(`Error al consultar servidor ${params.id}:`, error);
    return NextResponse.json(
      { error: "Error al cargar configuración del servidor" },
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

    const updated = await prisma.guild.update({
      where: { id: guildId },
      data: {
        locale: body.locale,
      },
    });

    return NextResponse.json({ success: true, guild: updated });
  } catch (error: any) {
    console.error(`Error al actualizar servidor ${params.id}:`, error);
    return NextResponse.json(
      { error: "Error al actualizar servidor" },
      { status: 500 }
    );
  }
}
