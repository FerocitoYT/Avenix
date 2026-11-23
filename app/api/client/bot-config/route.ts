import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";
const configSchema = z.object({
  serviceId: z.string().min(1),
  applicationId: z.string().regex(/^\d{17,20}$/, "ID de aplicación no válido"),
  guildId: z.string().regex(/^\d{17,20}$/, "Introduce un ID de servidor válido"),
  botToken: z.string().min(30).max(300).optional().or(z.literal("")),
});
const active = (s: {status:string;currentPeriodEnd:Date}) =>
  ["ACTIVE","TRIALING"].includes(s.status) && s.currentPeriodEnd > new Date();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error:"No autorizado"},{status:401});
  const services = await prisma.service.findMany({
    where: {userId:user.id,serviceType:"DISCORD_BOT"},
    include: {subscriptions:true,botInstance:{include:{configuration:true}}},
    orderBy:{createdAt:"desc"}
  });
  return NextResponse.json({success:true,services:services.map(s=>({
    id:s.id,name:s.name,planName:s.planName,
    subscriptionActive:s.subscriptions.some(active),
    expiresAt:s.subscriptions.filter(active).sort((a,b)=>b.currentPeriodEnd.getTime()-a.currentPeriodEnd.getTime())[0]?.currentPeriodEnd ?? null,
    bot:s.botInstance?{
      observedStatus: s.botInstance.status === "RUNNING" && (!s.botInstance.lastPingAt || Date.now() - new Date(s.botInstance.lastPingAt).getTime() > 90000) ? "OFFLINE" : s.botInstance.status,
      lastPingAt: s.botInstance.lastPingAt,
      id:s.botInstance.id,applicationId:s.botInstance.botClientId,
      guildId:s.botInstance.guildId,status:s.botInstance.status,
      tokenConfigured:!!s.botInstance.configuration?.tokenSecretRef
    }:null
  }))});
}

export async function POST(req:Request) {
  const user=await getCurrentUser();
  if(!user) return NextResponse.json({error:"No autorizado"},{status:401});
  const parsed=configSchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Datos de configuración inválidos",fields:parsed.error.flatten().fieldErrors},{status:400});
  const {serviceId,applicationId,guildId,botToken}=parsed.data;
  const service=await prisma.service.findFirst({
    where:{id:serviceId,userId:user.id,serviceType:"DISCORD_BOT"},
    include:{subscriptions:true,botInstance:{include:{configuration:true}}}
  });
  if(!service) return NextResponse.json({error:"Servicio no encontrado"},{status:404});
  if(!service.subscriptions.some(active)) return NextResponse.json({error:"Suscripción no vigente"},{status:403});
  if(!service.botInstance) return NextResponse.json({error:"Instancia no provisionada"},{status:409});
  if(!botToken && !service.botInstance.configuration?.tokenSecretRef)
    return NextResponse.json({error:"Introduce el token del bot"},{status:400});
  await prisma.$transaction(async tx=>{
    await tx.botInstance.update({where:{id:service.botInstance!.id},data:{
      botClientId:applicationId,guildId,status:"RESTARTING"
    }});
    await tx.botConfiguration.upsert({
      where:{botInstanceId:service.botInstance!.id},
      create:{botInstanceId:service.botInstance!.id,tokenSecretRef:botToken?encryptSecret(botToken):null},
      update:botToken?{tokenSecretRef:encryptSecret(botToken)}:{}
    });
    await tx.auditLog.create({data:{userId:user.id,action:"BOT_CONFIGURATION_UPDATED",entityType:"BOT",entityId:service.botInstance!.id}});
  });
  return NextResponse.json({success:true,status:"RESTARTING",message:"Configuración guardada. Inicio solicitado a Discloud; el estado cambiará cuando Discord confirme la conexión."});
}
