import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {authorizeGuild} from "@/lib/bot-access";
import {ticketRoles,roleKey,discordGuildRoles} from "@/lib/ticket-transcript-access";
import {z} from "zod";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
async function allowed(id:string){const secret=process.env.JWT_SECRET||process.env.AUTH_SECRET||"";if(secret.length<32||secret==="avenix-secure-jwt-key-2026-production")return false;const a=await authorizeGuild(id);return a.ok&&!!await prisma.user.findFirst({where:{id:a.user.id,isActive:true},select:{id:true}});}
export async function GET(_req:Request,{params}:{params:{id:string}}){try{if(!await allowed(params.id))return reply({error:"No autorizado"},403);const selected=await ticketRoles(params.id);try{return reply({selected,roles:await discordGuildRoles(params.id),available:true});}catch{return reply({selected,roles:[],available:false});}}catch{return reply({error:"No se pudo cargar"},500);}}
export async function PUT(req:Request,{params}:{params:{id:string}}){try{if(!await allowed(params.id))return reply({error:"No autorizado"},403);const d=z.object({roles:z.array(z.string().regex(/^\d{17,22}$/)).max(50)}).strict().safeParse(await req.json());if(!d.success)return reply({error:"Roles inválidos"},400);const roles=[...new Set(d.data.roles)];if(roles.length){const available=await discordGuildRoles(params.id);if(roles.some(id=>!available.some(r=>r.id===id)))return reply({error:"Algún rol no pertenece al servidor"},400);}const key=roleKey(params.id),value=JSON.stringify(roles);await prisma.setting.upsert({where:{key},create:{key,value,category:"TICKETS",isPublic:false},update:{value,isPublic:false}});return reply({selected:roles});}catch{return reply({error:"No se pudieron guardar los roles. Comprueba la conexión del bot."},500);}}
