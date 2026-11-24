import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
const snowflake = z.string().regex(/^\d{17,22}$/);
const optionalId = z.union([snowflake, z.literal(""), z.null()]).optional();
const schema = z.object({
  welcomeEnabled: z.boolean().optional(),
  welcomeChannelId: optionalId,
  welcomeMessage: z.string().max(2000).optional(),
  leaveEnabled: z.boolean().optional(),
  leaveChannelId: optionalId,
  leaveMessage: z.string().max(2000).optional(),
  dmEnabled: z.boolean().optional(),
  dmMessage: z.string().max(2000).optional(),
  autoRoleId: optionalId,
  sendEmbed: z.boolean().optional(),
  imageCard: z.boolean().optional(),
  includeBots: z.boolean().optional(),
  imageBackgroundUrl: z.union([z.string().url().refine(v => v.startsWith("https://")), z.literal(""), z.null()]).optional(),
  imagePrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración de bienvenida inválida", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  const data = {
    ...(d.welcomeEnabled !== undefined ? { enabled: d.welcomeEnabled } : {}),
    ...(d.welcomeChannelId !== undefined ? { channelId: d.welcomeChannelId || null } : {}),
    ...(d.welcomeMessage !== undefined ? { messageText: d.welcomeMessage } : {}),
    ...(d.leaveEnabled !== undefined ? { leaveEnabled: d.leaveEnabled } : {}),
    ...(d.leaveChannelId !== undefined ? { leaveChannelId: d.leaveChannelId || null } : {}),
    ...(d.leaveMessage !== undefined ? { leaveMessageText: d.leaveMessage } : {}),
    ...(d.dmEnabled !== undefined ? { sendDirectMessage: d.dmEnabled } : {}),
    ...(d.dmMessage !== undefined ? { dmMessageText: d.dmMessage || null } : {}),
    ...(d.sendEmbed !== undefined ? { sendEmbed: d.sendEmbed } : {}),
    ...(d.imageBackgroundUrl !== undefined ? { imageBackgroundUrl: d.imageBackgroundUrl || null } : {}),
    ...(d.imagePrimaryColor !== undefined ? { imagePrimaryColor: d.imagePrimaryColor } : {}),
  };
  try {
    const config = await prisma.welcomeConfig.upsert({
      where: { guildId: params.id },
      create: { guildId: params.id, ...data },
      update: data,
    });
    if(d.imageCard!==undefined||d.includeBots!==undefined){
      const key="welcome:options:"+params.id;
      const old=await prisma.setting.findUnique({where:{key}});
      const value=JSON.stringify({...{imageCard:false,includeBots:true},...(old?JSON.parse(old.value):{}),...(d.imageCard!==undefined?{imageCard:d.imageCard}:{}),...(d.includeBots!==undefined?{includeBots:d.includeBots}:{})});
      await prisma.setting.upsert({where:{key},create:{key,value,category:"WELCOME",isPublic:false},update:{value}});
    }
    if (d.autoRoleId) {
      const existing = await prisma.autoRole.findFirst({ where: { guildId: params.id, roleId: d.autoRoleId } });
      if (!existing) await prisma.autoRole.create({ data: { guildId: params.id, roleId: d.autoRoleId, delaySeconds: 0 } });
    }
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("[Welcome] Error guardando configuración", error);
    return NextResponse.json({ error: "No se pudo guardar la configuración de bienvenida" }, { status: 500 });
  }
}
