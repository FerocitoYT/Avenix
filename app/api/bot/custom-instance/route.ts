import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret, maskToken } from "@/lib/crypto";

export const dynamic = "force-dynamic";
export async function GET(req:Request) {
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"No autorizado"},{status:401});
 const guildId=new URL(req.url).searchParams.get("guildId");
 const where=user.role==="ADMIN"?(guildId?{guildId}:{}):(guildId?{guildId,userId:user.id}:{userId:user.id});
 const instances=await prisma.customBotInstance.findMany({where,select:{
  id:true,guildId:true,userId:true,applicationId:true,botName:true,tokenMask:true,status:true,
  statusText:true,activityType:true,memoryUsageMb:true,pingMs:true,lastHeartbeat:true
 }});
 return NextResponse.json({success:true,...(guildId?{instance:instances[0]||null}:{instances})});
}
export async function POST(req:Request) {
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"No autorizado"},{status:401});
 const body=await req.json().catch(()=>null);
 if(!body||typeof body.guildId!=="string"||!/^\\d{17,20}$/.test(body.guildId)||
 typeof body.applicationId!=="string"||!/^\\d{17,20}$/.test(body.applicationId)||
 typeof body.botName!=="string"||!body.botName.trim())
 return NextResponse.json({error:"Datos de configuración inválidos"},{status:400});
 const {guildId,applicationId,botName,botToken,statusText,activityType}=body;
 const guild=await prisma.guild.findUnique({where:{id:guildId}});
 if(!guild)return NextResponse.json({error:"Servidor no registrado"},{status:404});
 const permitted=user.role==="ADMIN"||!!(await prisma.guildMember.findFirst({where:{guildId,userId:user.id}}));
 if(!permitted)return NextResponse.json({error:"No tienes acceso al servidor"},{status:403});
 const existing=await prisma.customBotInstance.findUnique({where:{guildId}});
 if(existing&&existing.userId!==user.id&&user.role!=="ADMIN")
 return NextResponse.json({error:"Instancia de otro cliente"},{status:403});
 const sub=await prisma.subscription.findFirst({where:{userId:user.id,status:{in:["ACTIVE","TRIALING"]},currentPeriodEnd:{gt:new Date()},service:{serviceType:"DISCORD_BOT"}}});
 if(!sub&&user.role!=="ADMIN")return NextResponse.json({error:"Suscripción no vigente"},{status:403});
 if(botToken!==undefined&&botToken!==""&&(typeof botToken!=="string"||botToken.length<30||botToken.length>300))
 return NextResponse.json({error:"Token inválido"},{status:400});
 const encryptedToken=botToken?encryptSecret(botToken):existing?.encryptedBotToken;
 const tokenMask=botToken?maskToken(botToken):existing?.tokenMask;
 if(!encryptedToken||!tokenMask)return NextResponse.json({error:"Introduce el token del bot"},{status:400});
 const instance=await prisma.customBotInstance.upsert({where:{guildId},create:{
  guildId,userId:user.id,applicationId,encryptedBotToken:encryptedToken,tokenMask,botName:botName.trim(),
  statusText:typeof statusText==="string"?statusText:"Axyon Control | /help",
  activityType:typeof activityType==="string"?activityType:"WATCHING",status:"STOPPED"
 },update:{applicationId,encryptedBotToken:encryptedToken,tokenMask,botName:botName.trim(),
  statusText:typeof statusText==="string"?statusText:undefined,
  activityType:typeof activityType==="string"?activityType:undefined,status:"STOPPED"
 },select:{id:true,guildId:true,applicationId:true,botName:true,tokenMask:true,status:true}});
 await prisma.auditLog.create({data:{userId:user.id,action:"CUSTOM_BOT_CONFIG_UPDATED",entityType:"BOT",entityId:instance.id}});
 return NextResponse.json({success:true,instance});
}
