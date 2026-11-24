import { authorizeGuild } from "@/lib/bot-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";
const snowflake = z.string().regex(/^\d{17,22}$/);
const schema = z.object({
  enabled: z.boolean(),
  channelId: snowflake,
  verifiedRoleId: snowflake,
  embedTitle: z.string().trim().min(1).max(256),
  embedDescription: z.string().trim().min(1).max(2000),
  buttonLabel: z.string().trim().min(1).max(80),
  targetGuildId: z.union([snowflake,z.literal(""),z.null()]).optional(),
  dmAfterVerify: z.boolean(),
});

export async function GET(req: Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const instance=await prisma.botInstance.findFirst({
    where:{guildId:params.id},
    include:{configuration:true}
  });
  if(!instance)return NextResponse.json({error:"Instancia de bot no encontrada"},{status:404});
  const licensedIds=[params.id,...instance.allowedGuildIds.slice(0,Math.max(0,instance.additionalGuildSlots))];
  const [config,count,records,guilds,jobs]=await Promise.all([
    prisma.verificationConfig.findUnique({where:{guildId:params.id}}),
    prisma.verificationRecord.count({where:{guildId:params.id,revokedAt:null,scopes:{has:"guilds.join"}}}),
    prisma.verificationRecord.findMany({where:{guildId:params.id},orderBy:{verifiedAt:"desc"},take:25,select:{id:true,discordUserId:true,discordUsername:true,discordAvatar:true,verifiedAt:true,revokedAt:true,tokenExpiresAt:true,scopes:true}}),
    prisma.guild.findMany({where:{id:{in:licensedIds}},select:{id:true,name:true,icon:true}}),
    prisma.memberRestoreJob.findMany({where:{botInstanceId:instance.id},orderBy:{createdAt:"desc"},take:10}),
  ]);
  const origin=new URL(req.url).origin;
  return NextResponse.json({
    success:true,
    oauthConfigured:!!instance.configuration?.oauthClientSecretRef,
    applicationId:instance.botClientId,
    verificationUrl:`${origin}/api/verify/discord/start?guildId=${encodeURIComponent(params.id)}`,
    config:config||{enabled:false,channelId:"",messageId:null,verifiedRoleId:"",embedTitle:"Verificación segura",embedDescription:"Pulsa el botón para verificarte mediante Discord.",buttonLabel:"Verificar con Discord",targetGuildId:"",dmAfterVerify:true},
    verifiedCount:count,records,licensedGuilds:guilds,jobs,
  });
}

export async function POST(req:Request,{params}:{params:{id:string}}){
  const access=await authorizeGuild(params.id);
  if(!access.ok)return NextResponse.json({error:access.error},{status:access.status});
  const body=await req.json().catch(()=>null);
  if(body?.action==="SAVE_OAUTH_SECRET"){
    const clientSecret=typeof body.clientSecret==="string"?body.clientSecret.trim():"";
    if(clientSecret.length<10||clientSecret.length>300)return NextResponse.json({error:"Introduce un Client Secret OAuth2 válido"},{status:400});
    const instance=await prisma.botInstance.findFirst({where:{guildId:params.id},include:{configuration:true}});
    if(!instance)return NextResponse.json({error:"Instancia no encontrada"},{status:404});
    await prisma.botConfiguration.upsert({
      where:{botInstanceId:instance.id},
      create:{botInstanceId:instance.id,oauthClientSecretRef:encryptSecret(clientSecret)},
      update:{oauthClientSecretRef:encryptSecret(clientSecret)}
    });
    return NextResponse.json({success:true,oauthConfigured:true,message:"Client Secret OAuth2 guardado y cifrado"});
  }
  if(body?.action==="SAVE"){
    const parsed=schema.safeParse(body.config);
    if(!parsed.success)return NextResponse.json({error:"Configuración inválida",fields:parsed.error.flatten().fieldErrors},{status:400});
    const instance=await prisma.botInstance.findFirst({where:{guildId:params.id},include:{configuration:true}});
    if(!instance)return NextResponse.json({error:"Instancia no encontrada"},{status:404});
    if(parsed.data.enabled&&!instance.configuration?.oauthClientSecretRef)return NextResponse.json({error:"Configura primero el Client Secret OAuth2 de la aplicación de Discord"},{status:409});
    const licensed=[params.id,...instance.allowedGuildIds.slice(0,Math.max(0,instance.additionalGuildSlots))];
    const target=parsed.data.targetGuildId||null;
    if(target&&!licensed.includes(target))return NextResponse.json({error:"El servidor destino no está incluido en la licencia de esta instancia"},{status:403});
    const saved=await prisma.verificationConfig.upsert({
      where:{guildId:params.id},
      create:{guildId:params.id,enabled:parsed.data.enabled,mode:"OAUTH",channelId:parsed.data.channelId,verifiedRoleId:parsed.data.verifiedRoleId,embedTitle:parsed.data.embedTitle,embedDescription:parsed.data.embedDescription,buttonLabel:parsed.data.buttonLabel,targetGuildId:target,dmAfterVerify:parsed.data.dmAfterVerify,requireGuildJoin:true},
      update:{enabled:parsed.data.enabled,mode:"OAUTH",channelId:parsed.data.channelId,verifiedRoleId:parsed.data.verifiedRoleId,embedTitle:parsed.data.embedTitle,embedDescription:parsed.data.embedDescription,buttonLabel:parsed.data.buttonLabel,targetGuildId:target,dmAfterVerify:parsed.data.dmAfterVerify,requireGuildJoin:true},
    });
    return NextResponse.json({success:true,config:saved,message:"Verificación OAuth guardada"});
  }
  if(body?.action==="RESTORE"){
    const targetGuildId=typeof body.targetGuildId==="string"?body.targetGuildId:"";
    const instance=await prisma.botInstance.findFirst({where:{guildId:params.id}});
    if(!instance)return NextResponse.json({error:"Instancia no encontrada"},{status:404});
    const licensed=[params.id,...instance.allowedGuildIds.slice(0,Math.max(0,instance.additionalGuildSlots))];
    if(!targetGuildId||targetGuildId===params.id||!licensed.includes(targetGuildId))return NextResponse.json({error:"Selecciona un servidor destino licenciado distinto al servidor origen"},{status:400});
    const total=await prisma.verificationRecord.count({where:{guildId:params.id,revokedAt:null,scopes:{has:"guilds.join"},refreshTokenEncrypted:{not:null}}});
    if(!total)return NextResponse.json({error:"No hay usuarios OAuth restaurables"},{status:409});
    const existing=await prisma.memberRestoreJob.findFirst({where:{botInstanceId:instance.id,status:{in:["PENDING","PROCESSING"]}}});
    if(existing)return NextResponse.json({error:"Ya existe una restauración en curso",job:existing},{status:409});
    const job=await prisma.memberRestoreJob.create({data:{botInstanceId:instance.id,sourceGuildId:params.id,targetGuildId,total}});
    return NextResponse.json({success:true,job,message:"Restauración añadida a la cola"});
  }
  return NextResponse.json({error:"Acción no válida"},{status:400});
}
