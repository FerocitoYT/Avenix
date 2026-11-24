import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const snowflake = z.string().regex(/^\d{17,22}$/);
const action = z.enum(["DELETE","WARN","TIMEOUT","KICK"]);
const rule = z.object({ enabled:z.boolean(), threshold:z.number().int().min(1).max(50), windowSeconds:z.number().int().min(5).max(300), action:z.enum(["WARN","KICK","REMOVE_ROLES"]) });
const advancedSchema = z.object({ simulationMode:z.boolean(), trustedUsers:z.array(snowflake).max(100), trustedRoles:z.array(snowflake).max(100), antiNuke:rule, antiBot:rule, antiWebhook:rule, antiPermissions:rule });
const defaultRule = { enabled:false, threshold:3, windowSeconds:30, action:"WARN" as const };
const advancedDefaults = { simulationMode:true, trustedUsers:[], trustedRoles:[], antiNuke:defaultRule, antiBot:defaultRule, antiWebhook:defaultRule, antiPermissions:defaultRule };
const schema = z.object({
  advanced: advancedSchema.optional(),
  antiSpamEnabled: z.boolean().optional(),
  spamThreshold: z.number().int().min(3).max(30).optional(),
  spamTimeWindowSeconds: z.number().int().min(2).max(60).optional(),
  repeatThreshold: z.number().int().min(2).max(20).optional(),
  automodAction: action.optional(),
  automodTimeoutSeconds: z.number().int().min(10).max(604800).optional(),
  simulationMode: z.boolean().optional(),
  antiRaidEnabled: z.boolean().optional(),
  raidThreshold: z.number().int().min(2).max(100).optional(),
  raidWindowSeconds: z.number().int().min(2).max(300).optional(),
  raidAction: z.enum(["TIMEOUT","KICK"]).optional(),
  modLogChannelId: z.union([snowflake, z.literal(""), z.null()]).optional(),
  blockInviteLinks: z.boolean().optional(),
  blockAllLinks: z.boolean().optional(),
  filterRepeatedText: z.boolean().optional(),
  antiMassMentionCount: z.number().int().min(2).max(50).optional(),
  minAccountAgeDays: z.number().int().min(0).max(3650).optional(),
  bannedWords: z.array(z.string().trim().min(1).max(100)).max(200).optional(),
  exemptRoleIds: z.array(snowflake).max(100).optional(),
  exemptChannelIds: z.array(snowflake).max(100).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const [config, recentCases, advancedSetting] = await Promise.all([
    prisma.securityConfig.findUnique({ where: { guildId: params.id } }),
    prisma.modCase.findMany({ where: { guildId: params.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.setting.findUnique({where:{key:'security:advanced:'+params.id}}),
  ]);
  return NextResponse.json({
    success: true,
    config: config ?? {
      antispamEnabled: true, spamThreshold: 6, spamTimeWindowSeconds: 5, repeatThreshold: 4,
      automodAction: "TIMEOUT", automodTimeoutSeconds: 300, simulationMode: false,
      antiraidEnabled: false, antiraidJoinThreshold: 10, raidWindowSeconds: 10, raidAction: "TIMEOUT",
      antiMassMentionCount: 5, blockInviteLinks: true, blockAllLinks: false, filterRepeatedText: true,
      minAccountAgeDays: 3, bannedWords: [], exemptRoleIds: [], exemptChannelIds: [], logChannelId: null,
    },
    recentCases,
    advanced: advancedSetting ? advancedSchema.parse(JSON.parse(advancedSetting.value)) : advancedDefaults,
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración de seguridad inválida", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  const data = {
    ...(d.antiSpamEnabled !== undefined ? { antispamEnabled: d.antiSpamEnabled } : {}),
    ...(d.spamThreshold !== undefined ? { spamThreshold: d.spamThreshold } : {}),
    ...(d.spamTimeWindowSeconds !== undefined ? { spamTimeWindowSeconds: d.spamTimeWindowSeconds } : {}),
    ...(d.repeatThreshold !== undefined ? { repeatThreshold: d.repeatThreshold } : {}),
    ...(d.automodAction !== undefined ? { automodAction: d.automodAction } : {}),
    ...(d.automodTimeoutSeconds !== undefined ? { automodTimeoutSeconds: d.automodTimeoutSeconds } : {}),
    ...(d.simulationMode !== undefined ? { simulationMode: d.simulationMode } : {}),
    ...(d.antiRaidEnabled !== undefined ? { antiraidEnabled: d.antiRaidEnabled } : {}),
    ...(d.raidThreshold !== undefined ? { antiraidJoinThreshold: d.raidThreshold } : {}),
    ...(d.raidWindowSeconds !== undefined ? { raidWindowSeconds: d.raidWindowSeconds } : {}),
    ...(d.raidAction !== undefined ? { raidAction: d.raidAction } : {}),
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
    const config = await prisma.$transaction(async tx => {
    const config = await tx.securityConfig.upsert({
      where: { guildId: params.id },
      create: { guildId: params.id, ...data },
      update: data,
    });
    if(d.advanced){const key='security:advanced:'+params.id;const value=JSON.stringify(d.advanced);await tx.setting.upsert({where:{key},create:{key,value,category:'SECURITY',isPublic:false},update:{value}});}
    return config;
    });
    return NextResponse.json({ success: true, config, message: "Configuración de seguridad actualizada" });
  } catch (error) {
    console.error("[Security] Error guardando configuración", error);
    return NextResponse.json({ error: "No se pudo guardar la configuración de seguridad" }, { status: 500 });
  }
}
