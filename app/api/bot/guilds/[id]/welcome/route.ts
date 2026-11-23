import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guildId = params.id;
    const data = await req.json();

    const config = await prisma.welcomeConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        enabled: data.welcomeEnabled ?? true,
        channelId: data.welcomeChannelId || null,
        messageText: data.welcomeMessage || "¡Bienvenido {user} a **{server}**! Eres el miembro #{memberCount}.",
        leaveEnabled: data.leaveEnabled ?? false,
        leaveChannelId: data.leaveChannelId || null,
        leaveMessageText: data.leaveMessage || "{user} ha abandonado el servidor.",
        sendDirectMessage: !!data.dmEnabled,
        dmMessageText: data.dmMessage || null,
      },
      update: {
        enabled: data.welcomeEnabled,
        channelId: data.welcomeChannelId || null,
        messageText: data.welcomeMessage,
        leaveEnabled: data.leaveEnabled,
        leaveChannelId: data.leaveChannelId || null,
        leaveMessageText: data.leaveMessage,
        sendDirectMessage: data.dmEnabled,
        dmMessageText: data.dmMessage || null,
      },
    });

    if (data.autoRoleId) {
      const existingRole = await prisma.autoRole.findFirst({
        where: { guildId, roleId: data.autoRoleId },
      });
      if (existingRole) {
        await prisma.autoRole.update({
          where: { id: existingRole.id },
          data: { roleId: data.autoRoleId },
        });
      } else {
        await prisma.autoRole.create({
          data: {
            guildId,
            roleId: data.autoRoleId,
            delaySeconds: 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("Error actualizando bienvenida:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración de bienvenida" },
      { status: 500 }
    );
  }
}
