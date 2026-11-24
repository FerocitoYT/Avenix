import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeGuild } from "@/lib/bot-access";
import { prisma } from "@/lib/prisma";

export const dynamic="force-dynamic";
const BOT_LOG_GUILD="1574110968584077454";
const optionalSnowflake=z.union([z.string().regex(/^\d{17,22}$/),z.literal(""),z.null()]);
const schema=z.object({
  generalChannelId:optionalSnowflake.optional(),
  moderationChannelId:optionalSnowflake.optional(),
  ticketsChannelId:optionalSnowflake.optional(),
  paymentsChannelId:optionalSnowflake.optional(),
  botsChannelId:optionalSnowflake.optional(),
});

export async function GET(_req:Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const config=await prisma.guildLogConfig.findUnique({where:{guildId:params.id}});
  return NextResponse.json({
    success:true,
    canConfigureBotLogs:params.id===BOT_LOG_GUILD,
    config:config||{generalChannelId:"",moderationChannelId:"",ticketsChannelId:"",paymentsChannelId:"",botsChannelId:""}
  });
}

export async function POST(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const parsed=schema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Configuración de logs inválida",fields:parsed.error.flatten().fieldErrors},{status:400});
  const d=parsed.data;
  if(params.id!==BOT_LOG_GUILD && d.botsChannelId){
    return NextResponse.json({error:"Los logs de bots solo pueden configurarse en el servidor autorizado de Axyon"},{status:403});
  }
  const data={
    generalChannelId:d.generalChannelId||null,
    moderationChannelId:d.moderationChannelId||null,
    ticketsChannelId:d.ticketsChannelId||null,
    paymentsChannelId:d.paymentsChannelId||null,
    ...(params.id===BOT_LOG_GUILD?{botsChannelId:d.botsChannelId||null}:{botsChannelId:null})
  };
  const config=await prisma.guildLogConfig.upsert({where:{guildId:params.id},create:{guildId:params.id,...data},update:data});
  await prisma.discordLogEvent.create({data:{guildId:params.id,category:"GENERAL",title:"Configuración de logs actualizada",description:"Los canales de registro del servidor se han actualizado desde Axyon Control."}});
  return NextResponse.json({success:true,config,message:"Configuración de logs guardada"});
}
