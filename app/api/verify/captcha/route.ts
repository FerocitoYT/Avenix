import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captchaAnswerHash } from "@/lib/verification-oauth";
import { decryptSecret } from "@/lib/crypto";

export const dynamic="force-dynamic";
export async function GET(req:Request){
 const token=new URL(req.url).searchParams.get("token")||"";
 const session=await prisma.verificationCaptchaSession.findUnique({where:{token},select:{question:true,expiresAt:true,completedAt:true}});
 if(!session||session.expiresAt<new Date()||session.completedAt)return NextResponse.json({error:"Captcha inválido o caducado"},{status:404});
 return NextResponse.json({success:true,question:session.question});
}
export async function POST(req:Request){
 const body=await req.json().catch(()=>null);const token=typeof body?.token==="string"?body.token:"";const answer=String(body?.answer??"").trim();
 const session=await prisma.verificationCaptchaSession.findUnique({where:{token}});
 if(!session||session.expiresAt<new Date()||session.completedAt)return NextResponse.json({error:"Captcha inválido o caducado"},{status:410});
 if(captchaAnswerHash(token,answer)!==session.answerHash)return NextResponse.json({error:"Respuesta incorrecta"},{status:400});
 const [config,instance]=await Promise.all([
  prisma.verificationConfig.findUnique({where:{guildId:session.guildId}}),
  prisma.botInstance.findFirst({where:{guildId:session.guildId},include:{configuration:true}})
 ]);
 if(!config?.enabled||config.mode!=="CAPTCHA"||!config.verifiedRoleId||!instance?.configuration?.tokenSecretRef)return NextResponse.json({error:"La verificación ya no está disponible"},{status:409});
 const botToken=decryptSecret(instance.configuration.tokenSecretRef);
 const role=await fetch(`https://discord.com/api/v10/guilds/${session.guildId}/members/${session.discordUserId}/roles/${config.verifiedRoleId}`,{method:"PUT",headers:{Authorization:`Bot ${botToken}`}});
 if(!role.ok&&role.status!==204)return NextResponse.json({error:"El bot no pudo asignar el rol. Revisa permisos y jerarquía."},{status:409});
 await prisma.$transaction([
  prisma.verificationCaptchaSession.update({where:{token},data:{completedAt:new Date()}}),
  prisma.verificationRecord.upsert({
   where:{guildId_discordUserId:{guildId:session.guildId,discordUserId:session.discordUserId}},
   create:{guildId:session.guildId,discordUserId:session.discordUserId,discordUsername:session.discordUsername,discordAvatar:session.discordAvatar,method:"CAPTCHA",scopes:[]},
   update:{discordUsername:session.discordUsername,discordAvatar:session.discordAvatar,method:"CAPTCHA",accessTokenEncrypted:null,refreshTokenEncrypted:null,tokenExpiresAt:null,scopes:[],revokedAt:null,lastUsedAt:new Date(),verifiedAt:new Date()}
  })
 ]);
 return NextResponse.json({success:true,message:"Captcha superado. Ya estás verificado."});
}
