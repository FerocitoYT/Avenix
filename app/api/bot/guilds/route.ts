import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guilds = await prisma.guild.findMany({
      where: { isActive: true },
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
  } catch (error: any) {
    console.error("Error al obtener servidores de Discord:", error);
    return NextResponse.json(
      { error: "Error al consultar la base de datos de servidores" },
      { status: 500 }
    );
  }
}
