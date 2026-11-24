import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
const snowflake = z.string().regex(/^\d{17,22}$/);
const invite = z.union([
  z.string().url().refine(v => /^https:\/\/(discord\.gg|discord\.com\/invite)\//i.test(v)),
  z.literal(""),
  z.null(),
]).optional();

const schema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["REACTION","ACCOUNT"]),
  channelId: snowflake,
  verifiedRoleId: snowflake,
  reactionEmoji: z.string().min(1).max(32).optional(),
  embedTitle: z.string().trim().min(1).max(256),
  embedDescription: z.string().trim().min(1).max(2000),
  buttonLabel: z.string().trim().min(1).max(80),
  targetInviteUrl: invite,
  dmAfterVerify: z.boolean(),
});

export async function GET(_req: Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const [config,count]=await Promise.all([
    prisma.verificationConfig.findUnique({where:{guildId:params.id}}),
    prisma.verificationRecord.count({where:{guildId:params.id}}),
  ]);
  return NextResponse.json({
    success:true,
    config:config||{
      enabled:false,mode:"REACTION",channelId:"",messageId:null,verifiedRoleId:"",
      reactionEmoji:"✅",embedTitle:"Verificación",
      embedDescription:"Reacciona o pulsa el botón para verificar tu cuenta.",
      buttonLabel:"Verificar cuenta",targetInviteUrl:"",dmAfterVerify:true,
    },
    verifiedCount:count,
  });
}

export async function POST(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const body=await req.json().catch(()=>null);
  const action=body?.action;
  if(action==="SAVE"){
    const parsed=schema.safeParse(body.config);
    if(!parsed.success)return NextResponse.json({error:"Configuración inválida",fields:parsed.error.flatten().fieldErrors},{status:400});
    const d=parsed.data;
    const saved=await prisma.verificationConfig.upsert({
      where:{guildId:params.id},
      create:{guildId:params.id,...d,targetInviteUrl:d.targetInviteUrl||null},
      update:{...d,targetInviteUrl:d.targetInviteUrl||null},
    });
    return NextResponse.json({success:true,config:saved,message:"Configuración de verificación guardada"});
  }
  if(action==="PUBLISH"){
    const config=await prisma.verificationConfig.findUnique({where:{guildId:params.id}});
    if(!config||!config.enabled||!config.channelId||!config.verifiedRoleId){
      return NextResponse.json({error:"Completa y activa la configuración antes de publicar"},{status:400});
    }
    return NextResponse.json({success:true,queued:true,message:"El bot publicará o actualizará el panel de verificación automáticamente."});
  }
  return NextResponse.json({error:"Acción no válida"},{status:400});
}
