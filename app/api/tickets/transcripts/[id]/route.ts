import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";
import {randomBytes} from "node:crypto";
import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/auth";
import {ticketRoles,guildBotToken} from "@/lib/ticket-transcript-access";
export const dynamic="force-dynamic";
// Explicit per-guild Discord role allowlist; never trust cached roles or login alone.
async function highRank(guildId:string,discordId:string|null){
 if(!discordId)return false;
 try{
  const roles=await ticketRoles(guildId);
  const token=await guildBotToken(guildId);
  if(!token||!Array.isArray(roles)||!roles.length||!roles.every((r:unknown)=>typeof r==="string"&&/^\d{17,22}$/.test(r)&&r!==guildId))return false;
  const r=await fetch("https://discord.com/api/v10/guilds/"+guildId+"/members/"+discordId,{headers:{Authorization:"Bot "+token},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(!r.ok)return false;
  const member=await r.json();
  return member.user?.id===discordId&&Array.isArray(member.roles)&&member.roles.some((id:string)=>roles.includes(id));
 }catch{return false;}
}
const origin="https://www.axyon.es";
const secureHeaders={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
function screen(message:string,path:string,status:number){
 return new NextResponse('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Axyon · Transcripciones</title><style>body{background:#0b1220;color:#e2e8f0;font:16px system-ui;display:grid;place-items:center;min-height:90vh}main{max-width:440px;padding:32px;background:#111827;border-radius:16px}a{display:inline-block;background:#5865f2;color:white;padding:12px 20px;border-radius:8px;text-decoration:none}</style><main><h1>AXYON · Tickets</h1><p>'+message+'</p><a href="'+path+'?discord=1">Identificarme con Discord</a></main></html>',{status,headers:{...secureHeaders,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}
export async function GET(req:Request,{params}:{params:{id:string}}){
 const authSecret=process.env.JWT_SECRET||process.env.AUTH_SECRET||"";
 if(authSecret.length<32||authSecret==="avenix-secure-jwt-key-2026-production")return NextResponse.json({error:"Acceso temporalmente no disponible"},{status:503,headers:{"Cache-Control":"no-store"}});
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(params.id))return new NextResponse(null,{status:404});
 const path="/api/tickets/transcripts/"+params.id;
 const url=new URL(req.url);
 const cookieStore=cookies();
 const stateName="axyon_ticket_state",identityName="axyon_ticket_identity";
 const clientId=process.env.DISCORD_CLIENT_ID,clientSecret=process.env.DISCORD_CLIENT_SECRET;
 const callback=origin+"/api/tickets/discord/callback";
 // A fixed OAuth callback redirects back to this exact transcript. Identity is
 // scoped to tickets only and cannot grant a dashboard session.
 if(url.searchParams.get("discord")==="1"){
  if(!clientId||!clientSecret)return screen("La identificación con Discord todavía no está configurada. Contacta con el administrador.",path,503);
  const nonce=randomBytes(32).toString("hex");
  const state=jwt.sign({id:params.id,nonce},authSecret,{expiresIn:"10m",audience:"ticket-oauth-state"});
  const auth=new URL("https://discord.com/oauth2/authorize");
  auth.search=new URLSearchParams({client_id:clientId,redirect_uri:callback,response_type:"code",scope:"identify",state}).toString();
  const res=NextResponse.redirect(auth);res.cookies.set(stateName,nonce,{httpOnly:true,secure:true,sameSite:"lax",path:"/api/tickets",maxAge:600});return res;
 }
 let discordId:string|null=null;
 try{const token=cookieStore.get(identityName)?.value;if(token){const p=jwt.verify(token,authSecret,{audience:"ticket-discord-identity",algorithms:["HS256"]}) as {discordId?:string};if(typeof p.discordId==="string"&&/^\d{17,22}$/.test(p.discordId))discordId=p.discordId;}}catch{}
 const session=await getCurrentUser();
 const user=session?await prisma.user.findFirst({where:{id:session.id,isActive:true},select:{id:true,discordId:true}}):null;
 if(!discordId&&!user)return screen("Identifícate con la cuenta de Discord con la que abriste el ticket o con un rango autorizado.",path,401);
 const record=await prisma.ticketTranscript.findUnique({where:{id:params.id},include:{ticket:{select:{guildId:true,creatorDiscordId:true,creatorId:true}}}});
 if(!record)return screen("La transcripción no está disponible o no tienes permiso para verla.",path,404);
 const t=record.ticket;
 const identity=discordId||user?.discordId||null;
 const allowed=(!discordId&&!!user&&t.creatorId===user.id)||(!!identity&&t.creatorDiscordId===identity)||await highRank(t.guildId,identity);
 if(!allowed)return screen("La transcripción no está disponible o esta cuenta no tiene permiso. Puedes identificarte con otra cuenta de Discord.",path,404);
 return new NextResponse(record.htmlContent,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Content-Security-Policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src https://cdn.discordapp.com https://media.discordapp.net; base-uri 'none'; form-action 'none'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"}});
}
