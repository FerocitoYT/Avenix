import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";
import {randomBytes} from "node:crypto";
import {ticketReference,ticketIdFromReference} from "@/lib/ticket-reference";
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
 const ref=path.split("/").pop()||"";
 return new NextResponse(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Axyon | Archivo de tickets</title><style>
 *{box-sizing:border-box}body{margin:0;background:#080e19;color:#e2e8f0;font:15px/1.65 system-ui,sans-serif;min-height:100vh;background-image:radial-gradient(ellipse at 50% 30%,#172b4c 0%,transparent 55%)}header{max-width:1120px;margin:auto;padding:25px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #23324a}.brand{display:flex;align-items:center;gap:12px;font-weight:850;letter-spacing:3px;font-size:19px}.brand svg{width:39px;height:39px}.brand small{display:block;font-size:10px;color:#94a3b8;letter-spacing:2px}.secure{font-size:12px;color:#a5b4fc}main{max-width:520px;margin:clamp(45px,12vh,125px) auto 40px;padding:0 20px}.panel{padding:36px;background:#111b2c;border:1px solid #2b3d58;border-radius:22px;box-shadow:0 24px 80px #0005}.symbol{width:56px;height:56px;border-radius:16px;background:#20365a;color:#93c5fd;display:grid;place-items:center;margin-bottom:24px}.eyebrow{font-size:11px;color:#93c5fd;letter-spacing:2px;font-weight:700}h1{font-size:27px;line-height:1.2;margin:8px 0 15px;letter-spacing:-.7px}p{color:#a8b7cc;margin:0 0 22px}.reference{padding:13px 15px;border:1px solid #2a3a52;background:#0b1423;border-radius:10px;margin-bottom:24px}.reference small{display:block;color:#94a3b8;font-size:11px}.reference strong{font:600 13px monospace;overflow-wrap:anywhere;color:#dbeafe}a.action{display:flex;justify-content:center;align-items:center;gap:12px;background:#5865f2;color:white;text-decoration:none;border-radius:10px;padding:14px;font-weight:650}a.action:hover{background:#4752c4}.note{margin:20px 0 0;font-size:12px;text-align:center;color:#93a4bd}footer{text-align:center;font-size:12px;color:#64748b;padding:20px}footer a{color:#93a4bd;text-decoration:none}@media(max-width:480px){header{padding:18px}.secure{display:none}.panel{padding:24px}}
 </style></head><body><header><div class="brand"><svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="avxGrad1" x1="50" y1="5" x2="10" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#60A5FA" />
            <stop offset="100%" stop-color="#1D4ED8" />
          </linearGradient>
          <linearGradient id="avxGrad2" x1="50" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#93C5FD" />
            <stop offset="60%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#1E3A8A" />
          </linearGradient>
          <linearGradient id="avxGradBridge" x1="28" y1="62" x2="72" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="50%" stop-color="#60A5FA" />
            <stop offset="100%" stop-color="#3B82F6" />
          </linearGradient>
          <linearGradient id="avxGlowPeak" x1="50" y1="2" x2="50" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#60A5FA" />
          </linearGradient>
        </defs>

        
        <polygon
          points="50,6 92,88 74,88 50,40 26,88 8,88"
          fill="url(#avxGrad1)"
          opacity="0.2"
        />

        
        <polygon
          points="50,8 14,86 28,86 50,42"
          fill="url(#avxGrad1)"
        />

        
        <polygon
          points="50,8 50,42 72,86 86,86"
          fill="url(#avxGrad2)"
        />

        
        <polygon
          points="31,64 69,64 64,72 36,72"
          fill="url(#avxGradBridge)"
        />

        
        <polygon
          points="50,4 56,16 50,22 44,16"
          fill="url(#avxGlowPeak)"
        />

        
        <circle cx="50" cy="53" r="3.5" fill="#60A5FA" />
      </svg><div>AXYON<small>ARCHIVO DE TICKETS</small></div></div><span class="secure">● Acceso protegido</span></header><main><section class="panel"><div class="symbol"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg></div><div class="eyebrow">EXPEDIENTE CONFIDENCIAL</div><h1>Consulta tu transcripción</h1><p>${message}</p><div class="reference"><small>REFERENCIA SOLICITADA</small><strong>${ref}</strong></div><a class="action" href="${path}?discord=1">Continuar con Discord →</a><p class="note">Solo el creador del ticket y los rangos autorizados pueden acceder.</p></section></main><footer>AXYON · Centro de soporte &nbsp; · &nbsp; <a href="https://www.axyon.es">Sitio oficial</a></footer></body></html>`,{status,headers:{...secureHeaders,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
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
 const ticketId=ticketIdFromReference(params.id);
 const record=await prisma.ticketTranscript.findUnique({where:ticketId?{ticketId}:{id:params.id},include:{ticket:{select:{guildId:true,creatorDiscordId:true,creatorId:true}}}});
 if(!record)return screen("La transcripción no está disponible o no tienes permiso para verla.",path,404);
 const t=record.ticket;
 const identity=discordId||user?.discordId||null;
 const allowed=(!discordId&&!!user&&t.creatorId===user.id)||(!!identity&&t.creatorDiscordId===identity)||await highRank(t.guildId,identity);
 if(!allowed)return screen("La transcripción no está disponible o esta cuenta no tiene permiso. Puedes identificarte con otra cuenta de Discord.",path,404);
 const reference=ticketReference(record.ticketId);
 const html=record.htmlContent.replace(/Avenix Control/g,"Axyon Control").replace(/Avenix Bot/g,"Axyon Bot").replace(/Avenix Development/g,"Axyon").replace(/ID Ticket: [a-zA-Z0-9_-]+/g,"Expediente: "+reference);
 return new NextResponse(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Content-Security-Policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src https://cdn.discordapp.com https://media.discordapp.net; base-uri 'none'; form-action 'none'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"}});
}
