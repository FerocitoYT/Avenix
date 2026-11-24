import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signVerificationState,verificationRedirectUri } from "@/lib/verification-oauth";
import crypto from "crypto";

export const dynamic="force-dynamic";
export async function GET(req:Request){
  const url=new URL(req.url);const guildId=url.searchParams.get("guildId")||"";
  if(!/^\d{17,22}$/.test(guildId))return NextResponse.json({error:"Servidor inválido"},{status:400});
  const config=await prisma.verificationConfig.findUnique({where:{guildId}});
  const instance=await prisma.botInstance.findFirst({where:{guildId},include:{configuration:true,service:{include:{subscriptions:true}}}});
  const now=new Date();
  const entitled=instance?.service.status==="ACTIVE"&&instance.service.subscriptions.some(s=>["ACTIVE","TRIALING"].includes(s.status)&&s.currentPeriodStart<=now&&s.currentPeriodEnd>now);
  if(!config?.enabled||!["CAPTCHA","OAUTH"].includes(config.mode)||!instance?.botClientId||!instance.configuration?.oauthClientSecretRef||!entitled)return NextResponse.json({error:"La verificación web no está disponible"},{status:404});
  const mode=config.mode as "CAPTCHA"|"OAUTH";
  const state=signVerificationState({guildId,mode,nonce:crypto.randomBytes(16).toString("hex"),exp:Date.now()+10*60*1000});
  const auth=new URL("https://discord.com/oauth2/authorize");
  auth.searchParams.set("client_id",instance.botClientId);
  auth.searchParams.set("redirect_uri",verificationRedirectUri());
  auth.searchParams.set("response_type","code");
  auth.searchParams.set("scope",mode==="OAUTH"?"identify guilds.join":"identify");
  auth.searchParams.set("state",state);
  auth.searchParams.set("prompt","consent");
  return NextResponse.redirect(auth);
}
