import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {authorizeGuild} from "@/lib/bot-access";
import {discordGuildRoles} from "@/lib/ticket-transcript-access";
import {z} from "zod";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
const sf=z.string().regex(/^\d{17,22}$/);
const config=z.object({enabled:z.boolean(),staffRoles:z.array(sf).max(30),managerRoles:z.array(sf).max(30)});
const action=z.discriminatedUnion("action",[z.object({action:z.literal("CONFIG"),config}),z.object({action:z.literal("TASK"),title:z.string().trim().min(3).max(120),description:z.string().trim().max(1500),assignee:sf,priority:z.enum(["LOW","NORMAL","HIGH"])}),z.object({action:z.literal("NOTICE"),title:z.string().trim().min(3).max(120),message:z.string().trim().min(3).max(1500),recipient:z.union([sf,z.literal("all")])}),z.object({action:z.literal("REVIEW"),id:z.string().uuid(),accept:z.boolean()})]);
const reply=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"private, no-store"}});
async function allowed(id:string){const secret=process.env.JWT_SECRET||process.env.AUTH_SECRET||"";if(secret.length<32||secret==="avenix-secure-jwt-key-2026-production")return false;const a=await authorizeGuild(id);return a.ok&&!!await prisma.user.findFirst({where:{id:a.user.id,isActive:true},select:{id:true}});}
const defaults={enabled:false,staffRoles:[],managerRoles:[]};
export async function GET(_r:Request,{params}:{params:{id:string}}){try{if(!await allowed(params.id))return reply({error:"No autorizado"},403);const prefix="staff:"+params.id+":";const rows=await prisma.setting.findMany({where:{key:{startsWith:prefix}},orderBy:{updatedAt:"desc"}});const data=rows.map(r=>({key:r.key,value:JSON.parse(r.value)}));let roles:{id:string;name:string}[]=[];try{roles=await discordGuildRoles(params.id)}catch{}return reply({config:data.find(r=>r.key===prefix+"config")?.value||defaults,roles,tasks:data.filter(r=>r.key.startsWith(prefix+"task:")).map(r=>r.value),notices:data.filter(r=>r.key.startsWith(prefix+"notice:")).map(r=>r.value),shifts:data.filter(r=>r.key.startsWith(prefix+"shift:")).map(r=>r.value)});}catch{return reply({error:"No se pudo cargar staff"},500)}}
export async function POST(req:Request,{params}:{params:{id:string}}){try{if(!await allowed(params.id))return reply({error:"No autorizado"},403);const p=action.safeParse(await req.json());if(!p.success)return reply({error:"Datos inválidos"},400);const d=p.data,prefix="staff:"+params.id+":";
if(d.action==="CONFIG"){const roles=await discordGuildRoles(params.id);if([...d.config.staffRoles,...d.config.managerRoles].some(id=>!roles.some(r=>r.id===id)))return reply({error:"Rol no pertenece al servidor"},400);}
await prisma.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${prefix}))`;let key="",value:unknown;
if(d.action==="CONFIG"){key=prefix+"config";value=d.config;}
else if(d.action==="TASK"){const id=randomUUID();key=prefix+"task:"+id;value={id,title:d.title,description:d.description,assignee:d.assignee,priority:d.priority,status:"PENDING",createdAt:new Date().toISOString()};}
else if(d.action==="NOTICE"){const id=randomUUID();key=prefix+"notice:"+id;value={id,title:d.title,message:d.message,recipient:d.recipient,readBy:[],createdAt:new Date().toISOString()};}
else {key=prefix+"task:"+d.id;const row=await tx.setting.findUnique({where:{key}});if(!row)throw Error("TASK");const task=JSON.parse(row.value);if(task.status!=="REVIEW")throw Error("TASK");value={...task,status:d.accept?"COMPLETED":"PENDING",reviewedAt:new Date().toISOString()};}
const v=JSON.stringify(value);await tx.setting.upsert({where:{key},create:{key,value:v,category:"STAFF",isPublic:false},update:{value:v,isPublic:false}});});return reply({success:true});}catch{return reply({error:"No se pudo guardar la operación"},400)}}
