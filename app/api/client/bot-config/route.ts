import {maintenanceState} from "@/lib/maintenance";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";
const configSchema = z.object({
  serviceId: z.string().min(1),
  applicationId: z.string().regex(/^\d{17,20}$/, "ID de aplicación no válido"),
  guildId: z.string().regex(/^\d{17,20}$/, "Introduce un ID de servidor válido"),
  botToken: z.string().min(30).max(300).optional().or(z.literal("")),
  oauthClientSecret: z.string().min(10).max(300).optional().or(z.literal("")),
});
const active = (s: {status:string;currentPeriodEnd:Date}) =>
  ["ACTIVE","TRIALING"].includes(s.status) && s.currentPeriodEnd > new Date();

export async function GET() {
  const user = await getCurrentUser();
  if(user&&(await maintenanceState()).mode!=="OFF")return NextResponse.json({error:"Panel en mantenimiento"},{status:503});
  if (!user) return NextResponse.json({error:"No autorizado"},{status:401});
  const services = await prisma.service.findMany({
    where: {userId:user.id,serviceType:"DISCORD_BOT"},
    include: {subscriptions:true,botInstance:{include:{configuration:true}}},
    orderBy:{createdAt:"desc"}
  });
  const guildIds = services.flatMap(s => s.botInstance?.guildId ? [s.botInstance.guildId] : []);
  const guilds = guildIds.length ? await prisma.guild.findMany({ where: { id: { in: guildIds } }, select: { id:true,name:true,icon:true } }) : [];
  const guildMap = new Map(guilds.map(g => [g.id,g]));
  return NextResponse.json({success:true,services:services.map(s=>({
    id:s.id,name:s.name,planName:s.planName,
    subscriptionActive:s.subscriptions.some(active),
    expiresAt:s.subscriptions.filter(active).sort((a,b)=>b.currentPeriodEnd.getTime()-a.currentPeriodEnd.getTime())[0]?.currentPeriodEnd ?? null,
    bot:s.botInstance?{
      observedStatus: s.botInstance.status === "RUNNING" && (!s.botInstance.lastPingAt || Date.now() - new Date(s.botInstance.lastPingAt).getTime() > 90000) ? "OFFLINE" : s.botInstance.status,
      lastPingAt: s.botInstance.lastPingAt,
      id:s.botInstance.id,applicationId:s.botInstance.botClientId,
      guildId:s.botInstance.guildId,status:s.botInstance.status,
      guildName:s.botInstance.guildId?guildMap.get(s.botInstance.guildId)?.name??null:null,
      guildIcon:s.botInstance.guildId?guildMap.get(s.botInstance.guildId)?.icon??null:null,
      serverLimit:1+s.botInstance.additionalGuildSlots,
      oauthConfigured:!!s.botInstance.configuration?.oauthClientSecretRef,
      tokenConfigured:!!s.botInstance.configuration?.tokenSecretRef
    }:null
  }))});
}

export async function POST(req:Request) {
  const user=await getCurrentUser();
  if(user&&(await maintenanceState()).mode!=="OFF")return NextResponse.json({error:"Panel en mantenimiento"},{status:503});
  if(!user) return NextResponse.json({error:"No autorizado"},{status:401});
  const parsed=configSchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Datos de configuración inválidos",fields:parsed.error.flatten().fieldErrors},{status:400});
  const {serviceId,applicationId,guildId,botToken,oauthClientSecret}=parsed.data;
  const service=await prisma.service.findFirst({
    where:{id:serviceId,userId:user.id,serviceType:"DISCORD_BOT"},
    include:{subscriptions:true,botInstance:{include:{configuration:true}}}
  });
  if(!service) return NextResponse.json({error:"Servicio no encontrado"},{status:404});
  if(!service.subscriptions.some(active)) return NextResponse.json({error:"Suscripción no vigente"},{status:403});
  if(!service.botInstance) return NextResponse.json({error:"Instancia no provisionada"},{status:409});
  if(!botToken && !service.botInstance.configuration?.tokenSecretRef)
    return NextResponse.json({error:"Introduce el token del bot"},{status:400});
  // Saving an unchanged configuration must not disconnect a live Discord client.
  const current = service.botInstance;
  let tokenChanged = Boolean(botToken);
  let oauthSecretChanged = Boolean(oauthClientSecret);
  if (botToken && current.configuration?.tokenSecretRef) {
    try { tokenChanged = decryptSecret(current.configuration.tokenSecretRef) !== botToken; }
    catch { tokenChanged = true; } // Unreadable existing token must be replaced.
  }
  if (oauthClientSecret && current.configuration?.oauthClientSecretRef) {
    try { oauthSecretChanged = decryptSecret(current.configuration.oauthClientSecretRef) !== oauthClientSecret; }
    catch { oauthSecretChanged = true; }
  }
  const credentialsChanged = current.botClientId !== applicationId ||
    current.guildId !== guildId || tokenChanged;
  const mustStart = current.status === "STOPPED" || current.status === "ERROR";
  const requestStart = credentialsChanged || mustStart;
  await prisma.$transaction(async tx=>{
    if (credentialsChanged) {
      await tx.botInstance.update({where:{id:current.id},data:{
        botClientId:applicationId,guildId,status:"RESTARTING"
      }});
    } else if (mustStart) {
      await tx.botInstance.update({where:{id:current.id},data:{status:"RESTARTING"}});
    }
    await tx.botConfiguration.upsert({
      where:{botInstanceId:current.id},
      create:{botInstanceId:current.id,tokenSecretRef:botToken?encryptSecret(botToken):null,oauthClientSecretRef:oauthClientSecret?encryptSecret(oauthClientSecret):null},
      update:{
        ...(tokenChanged&&botToken?{tokenSecretRef:encryptSecret(botToken)}:{}),
        ...(oauthSecretChanged&&oauthClientSecret?{oauthClientSecretRef:encryptSecret(oauthClientSecret)}:{})
      }
    });
    await tx.auditLog.create({data:{userId:user.id,action:"BOT_CONFIGURATION_UPDATED",entityType:"BOT",entityId:current.id,
      detailsJson:{credentialsChanged,restartRequested:requestStart,oauthSecretUpdated:oauthSecretChanged}}});
  });
  return NextResponse.json({success:true,status:requestStart?"RESTARTING":current.status,
    message:requestStart?"Configuración guardada. Se ha solicitado el inicio o reconexión del bot.":"Configuración guardada sin reiniciar el bot."});
}
