import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const snowflake = z.string().regex(/^\d{17,22}$/);
const schema = z.object({
  antiSpamEnabled: z.boolean().optional(),
  antiRaidEnabled: z.boolean().optional(),
  raidThreshold: z.number().int().min(2).max(100).optional(),
  modLogChannelId: z.union([snowflake, z.literal(""), z.null()]).optional(),
  blockInviteLinks: z.boolean().optional(),
  blockAllLinks: z.boolean().optional(),
  filterRepeatedText: z.boolean().optional(),
  antiMassMentionCount: z.number().int().min(2).max(50).optional(),
  minAccountAgeDays: z.number().int().min(0).max(365).optional(),
  bannedWords: z.array(z.string().trim().min(1).max(100)).max(200).optional(),
  exemptRoleIds: z.array(snowflake).max(50).optional(),
  exemptChannelIds: z.array(snowflake).max(50).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración de seguridad inválida", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  const data = {
    ...(d.antiSpamEnabled !== undefined ? { antispamEnabled: d.antiSpamEnabled } : {}),
    ...(d.antiRaidEnabled !== undefined ? { antiraidEnabled: d.antiRaidEnabled } : {}),
    ...(d.raidThreshold !== undefined ? { antiraidJoinThreshold: d.raidThreshold } : {}),
    ...(d.modLogChannelId !== undefined ? { logChannelId: d.modLogChannelId || null } : {}),
    ...(d.blockInviteLinks !== undefined ? { blockInviteLinks: d.blockInviteLinks } : {}),
    ...(d.blockAllLinks !== undefined ? { blockAllLinks: d.blockAllLinks } : {}),
    ...(d.filterRepeatedText !== undefined ? { filterRepeatedText: d.filterRepeatedText } : {}),
    ...(d.antiMassMentionCount !== undefined ? { antiMassMentionCount: d.antiMassMentionCount } : {}),
    ...(d.minAccountAgeDays !== undefined ? { minAccountAgeDays: d.minAccountAgeDays } : {}),
    ...(d.bannedWords !== undefined ? { bannedWords: d.bannedWords } : {}),
    ...(d.exemptRoleIds !== undefined ? { exemptRoleIds: d.exemptRoleIds } : {}),
    ...(d.exemptChannelIds !== undefined ? { exemptChannelIds: d.exemptChannelIds } : {}),
  };
  try {
    const config = await prisma.securityConfig.upsert({
      where: { guildId: params.id },
      create: { guildId: params.id, ...data },
      update: data,
    });
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("[Security] Error guardando configuración", error);
    return NextResponse.json({ error: "No se pudo guardar la configuración de seguridad" }, { status: 500 });
  }
}
