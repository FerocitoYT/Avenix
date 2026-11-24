import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
export const dynamic="force-dynamic";
export const runtime="nodejs";
async function authorize(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: { id, service: {
      userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
      subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] },
        currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
    } }, select: { id: true },
  });
  if (!bot) return { error: NextResponse.json({ error: "Instancia o suscripción no disponible" }, { status: 403 }) };
  return { bot, user };
}


const input=z.object({integrationId:z.string().uuid().optional(),platform:z.enum(["youtube","twitch","kick","tiktok","instagram","x"]),name:z.string().trim().min(1).max(100),channelId:z.string().trim().min(1).max(100),enabled:z.boolean(),message:z.string().max(500),discordWebhookUrl:z.string().optional()});
type C={params:{id:string}};
const prefix=(id:string)=>"integration:social:"+id+":";
async function list(id:string){return (await prisma.setting.findMany({where:{category:"SOCIAL_INTEGRATION",key:{startsWith:prefix(id)}}})).map(r=>JSON.parse(r.value)).filter(r=>r.botId===id);}
export async function GET(_req:Request,{params}:C){const a=await authorize(params.id);if(a.error)return a.error;return NextResponse.json({subscriptions:(await list(params.id)).map(({discordWebhookEncrypted,...r})=>({...r,destinationConfigured:!!discordWebhookEncrypted,detector:r.platform==="youtube"?"YOUTUBE_API_KEY":"PENDING_PROVIDER"}))});}
export async function PUT(req:Request,{params}:C){
 const a=await authorize(params.id);if(a.error)return a.error;
 const parsed=input.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 const d=parsed.data;if(d.platform==="youtube"&&!/^UC[A-Za-z0-9_-]{22}$/.test(d.channelId))return NextResponse.json({error:"YouTube requiere el ID del canal UC..."},{status:400});
 const records=await list(params.id);const old=records.find(r=>r.integrationId===d.integrationId);
 if(d.integrationId&&!old)return NextResponse.json({error:"Suscripción no encontrada"},{status:404});
 if(!old&&records.length>=20)return NextResponse.json({error:"Máximo 20 suscripciones por bot"},{status:409});
 let encrypted=old?.discordWebhookEncrypted;
 if(d.discordWebhookUrl){try{const u=new URL(d.discordWebhookUrl);if(u.protocol!=="https:"||!["discord.com","discordapp.com"].includes(u.hostname)||!/^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)||u.username||u.password||u.search||u.hash)throw Error();encrypted=encryptSecret(d.discordWebhookUrl);}catch{return NextResponse.json({error:"Webhook de Discord inválido"},{status:400});}}
 if(!encrypted)return NextResponse.json({error:"Introduce el webhook de Discord"},{status:400});
 const integrationId=old?.integrationId||randomUUID();const key=prefix(params.id)+integrationId;
 const {discordWebhookUrl,...safe}=d;
 const value=JSON.stringify({...safe,integrationId,botId:params.id,discordWebhookEncrypted:encrypted});
 await prisma.setting.upsert({where:{key},create:{key,value,category:"SOCIAL_INTEGRATION",isPublic:false},update:{value}});
 if(old&&(old.channelId!==d.channelId||old.platform!==d.platform))await prisma.setting.deleteMany({where:{key:key+":cursor"}});
 return NextResponse.json({success:true,integrationId});
}
export async function DELETE(req:Request,{params}:C){const a=await authorize(params.id);if(a.error)return a.error;const id=new URL(req.url).searchParams.get("integrationId");if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"ID inválido"},{status:400});const key=prefix(params.id)+id;await prisma.setting.deleteMany({where:{key:{in:[key,key+":cursor"]}}});return NextResponse.json({success:true});}
