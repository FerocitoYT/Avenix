import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret,encryptSecret } from "@/lib/crypto";
import { verificationRedirectUri,verifyVerificationState } from "@/lib/verification-oauth";

export const dynamic="force-dynamic";
export async function GET(req:Request){
  const url=new URL(req.url);const code=url.searchParams.get("code");const state=url.searchParams.get("state");
  const parsed=state?verifyVerificationState(state):null;
  const fail=(message:string)=>NextResponse.redirect(new URL(`/verify/discord?status=error&message=${encodeURIComponent(message)}`,url.origin));
  if(!code||!parsed)return fail("Solicitud OAuth inválida o caducada");
  const instance=await prisma.botInstance.findFirst({where:{guildId:parsed.guildId},include:{configuration:true}});
  const config=await prisma.verificationConfig.findUnique({where:{guildId:parsed.guildId}});
  if(!instance?.botClientId||!instance.configuration?.oauthClientSecretRef||!instance.configuration?.tokenSecretRef||!config?.enabled)return fail("Verificación no disponible");
  try{
    const clientSecret=decryptSecret(instance.configuration.oauthClientSecretRef);
    const form=new URLSearchParams({client_id:instance.botClientId,client_secret:clientSecret,grant_type:"authorization_code",code,redirect_uri:verificationRedirectUri()});
    const tokenRes=await fetch("https://discord.com/api/v10/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:form,cache:"no-store"});
    const token:any=await tokenRes.json();if(!tokenRes.ok||!token.access_token||!token.refresh_token)throw new Error("Discord no concedió la autorización");
    const meRes=await fetch("https://discord.com/api/v10/users/@me",{headers:{Authorization:`Bearer ${token.access_token}`},cache:"no-store"});
    const me:any=await meRes.json();if(!meRes.ok||!me.id)throw new Error("No se pudo identificar la cuenta de Discord");
    const scopes=String(token.scope||"").split(/\s+/).filter(Boolean);
    if(!scopes.includes("guilds.join"))throw new Error("Falta el permiso guilds.join");
    const botToken=decryptSecret(instance.configuration.tokenSecretRef);
    const join=await fetch(`https://discord.com/api/v10/guilds/${parsed.guildId}/members/${me.id}`,{method:"PUT",headers:{Authorization:`Bot ${botToken}`,"Content-Type":"application/json"},body:JSON.stringify({access_token:token.access_token})});
    if(!join.ok&&join.status!==204)throw new Error("No se pudo confirmar la membresía en el servidor");
    if(config.verifiedRoleId){
      const role=await fetch(`https://discord.com/api/v10/guilds/${parsed.guildId}/members/${me.id}/roles/${config.verifiedRoleId}`,{method:"PUT",headers:{Authorization:`Bot ${botToken}`}});
      if(!role.ok&&role.status!==204)throw new Error("Autorizado, pero el bot no pudo asignar el rol verificado");
    }
    await prisma.verificationRecord.upsert({
      where:{guildId_discordUserId:{guildId:parsed.guildId,discordUserId:me.id}},
      create:{guildId:parsed.guildId,discordUserId:me.id,discordUsername:me.global_name||me.username,discordAvatar:me.avatar||null,method:"OAUTH",accessTokenEncrypted:encryptSecret(token.access_token),refreshTokenEncrypted:encryptSecret(token.refresh_token),tokenExpiresAt:new Date(Date.now()+Number(token.expires_in||604800)*1000),scopes,revokedAt:null,lastUsedAt:new Date()},
      update:{discordUsername:me.global_name||me.username,discordAvatar:me.avatar||null,method:"OAUTH",accessTokenEncrypted:encryptSecret(token.access_token),refreshTokenEncrypted:encryptSecret(token.refresh_token),tokenExpiresAt:new Date(Date.now()+Number(token.expires_in||604800)*1000),scopes,revokedAt:null,lastUsedAt:new Date(),verifiedAt:new Date()},
    });
    return NextResponse.redirect(new URL("/verify/discord?status=success",url.origin));
  }catch(error){console.error("[Verification OAuth]",error);return fail(error instanceof Error?error.message:"No se pudo completar la verificación")}
}
