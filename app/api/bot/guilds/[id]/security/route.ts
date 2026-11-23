import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const access = await authorizeGuild(guildId);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    const data = await req.json();

    const config = await prisma.securityConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        antispamEnabled: data.antiSpamEnabled ?? true,
        antiraidEnabled: data.antiRaidEnabled ?? false,
        antiraidJoinThreshold: data.raidThreshold ?? 10,
        logChannelId: data.modLogChannelId || null,
        filterRepeatedText: true,
        blockInviteLinks: true,
      },
      update: {
        antispamEnabled: data.antiSpamEnabled,
        antiraidEnabled: data.antiRaidEnabled,
        antiraidJoinThreshold: data.raidThreshold,
        logChannelId: data.modLogChannelId || null,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("Error actualizando seguridad:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración de seguridad" },
      { status: 500 }
    );
  }
}
