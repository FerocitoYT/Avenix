import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";
export const dynamic="force-dynamic";
const origin="https://www.axyon.es";
export async function GET(req:Request){
 const secret=process.env.JWT_SECRET||process.env.AUTH_SECRET||"";
 const clientId=process.env.DISCORD_CLIENT_ID,clientSecret=process.env.DISCORD_CLIENT_SECRET;
 const url=new URL(req.url),state=url.searchParams.get("state"),code=url.searchParams.get("code");
 const fail=()=>NextResponse.json({error:"No se pudo verificar la identidad de Discord. Vuelve a abrir el enlace original del ticket."},{status:400,headers:{"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 if(secret.length<32||secret==="avenix-secure-jwt-key-2026-production"||!clientId||!clientSecret||!state||!code)return fail();
 try{
  const p=jwt.verify(state,secret,{audience:"ticket-oauth-state",algorithms:["HS256"]}) as {id?:string;nonce?:string};
  if(!p.id||! /^[a-zA-Z0-9_-]{1,100}$/.test(p.id)||!p.nonce||cookies().get("axyon_ticket_state")?.value!==p.nonce)return fail();
  const response=await fetch("https://discord.com/api/v10/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,grant_type:"authorization_code",code,redirect_uri:origin+"/api/tickets/discord/callback"}),signal:AbortSignal.timeout(10000),cache:"no-store"});
  if(!response.ok)return fail();const token=await response.json();if(typeof token.access_token!=="string")return fail();
  const me=await fetch("https://discord.com/api/v10/users/@me",{headers:{Authorization:"Bearer "+token.access_token},cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(!me.ok)return fail();const user=await me.json();if(typeof user.id!=="string"||!/^\d{17,22}$/.test(user.id))return fail();
  const res=NextResponse.redirect(origin+"/api/tickets/transcripts/"+p.id);
  res.headers.set("Cache-Control","no-store");res.headers.set("Referrer-Policy","no-referrer");
  res.cookies.set("axyon_ticket_state","",{httpOnly:true,secure:true,sameSite:"lax",path:"/api/tickets",maxAge:0});
  res.cookies.set("axyon_ticket_identity",jwt.sign({discordId:user.id},secret,{audience:"ticket-discord-identity",expiresIn:"1h"}),{httpOnly:true,secure:true,sameSite:"lax",path:"/api/tickets",maxAge:3600});
  return res;
 }catch{return fail();}
}
