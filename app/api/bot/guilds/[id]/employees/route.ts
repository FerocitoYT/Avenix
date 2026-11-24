import {withBotChange} from "@/lib/bot-change-signal";
import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
const id=z.string().regex(/^\d{17,22}$/);
const config=z.object({enabled:z.boolean(),logChannelId:z.union([id,z.literal("")])});
const defaults={enabled:false,logChannelId:""};
type C={params:{id:string}};
export async function GET(_req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [cfg,employees,activities]=await Promise.all([prisma.setting.findUnique({where:{key:"employees:config:"+params.id}}),prisma.setting.findMany({where:{key:{startsWith:"employees:member:"+params.id+":"}},take:500,orderBy:{updatedAt:"desc"}}),prisma.setting.findMany({where:{key:{startsWith:"employees:activity:"+params.id+":"}},take:100,orderBy:{updatedAt:"desc"}})]);
 return NextResponse.json({config:cfg?config.parse(JSON.parse(cfg.value)):defaults,employees:employees.map(x=>JSON.parse(x.value)),activities:activities.map(x=>JSON.parse(x.value))});
}
const command=z.discriminatedUnion("action",[
 z.object({action:z.literal("CONFIG"),config}),
 z.object({action:z.literal("UPSERT"),userId:id,name:z.string().trim().min(1).max(100),position:z.string().trim().min(1).max(100),status:z.enum(["ACTIVE","INACTIVE"]),note:z.string().max(1000)}),
 z.object({action:z.literal("ACTIVITY"),userId:id,description:z.string().trim().min(1).max(1000),minutes:z.number().int().min(1).max(1440)})
]);
async function handlePOST(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=command.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Datos inválidos"},{status:400});
 const d=parsed.data;const guild=params.id;const cfgKey="employees:config:"+guild;
 if(d.action==="CONFIG"){const value=JSON.stringify(d.config);await prisma.setting.upsert({where:{key:cfgKey},create:{key:cfgKey,value,category:"EMPLOYEES",isPublic:false},update:{value}});return NextResponse.json({success:true});}
 const cfgRow=await prisma.setting.findUnique({where:{key:cfgKey}});const cfg=cfgRow?config.parse(JSON.parse(cfgRow.value)):defaults;
 if(!cfg.enabled)return NextResponse.json({error:"Activa primero el sistema"},{status:400});
 const key="employees:member:"+guild+":"+d.userId;
 const actor=a.user.id;
 await prisma.$transaction(async tx=>{
 const existing=await tx.setting.findUnique({where:{key}});
 const old=existing?JSON.parse(existing.value):null;
 if(d.action==="ACTIVITY"&&old?.status!=="ACTIVE")throw new Error("Empleado no activo");
 const eventId=randomUUID();
 const event=d.action==="UPSERT"?{id:eventId,userId:d.userId,type:"EMPLOYEE",description:old?"Actualización: "+d.position+" / "+d.status:"Alta: "+d.position,minutes:0,actor,at:Date.now()}:{id:eventId,userId:d.userId,type:"ACTIVITY",description:d.description,minutes:d.minutes,actor,at:Date.now()};
 if(d.action==="UPSERT"){const value=JSON.stringify({userId:d.userId,name:d.name,position:d.position,status:d.status,note:d.note,joinedAt:old?.joinedAt??Date.now()});await tx.setting.upsert({where:{key},create:{key,value,category:"EMPLOYEES",isPublic:false},update:{value}});}
 await tx.setting.create({data:{key:"employees:activity:"+guild+":"+eventId,value:JSON.stringify({...event,logChannelId:cfg.logChannelId,logPending:!!cfg.logChannelId}),category:"EMPLOYEES",isPublic:false}});
 }).catch(e=>{throw e});
 return NextResponse.json({success:true});
}

export const POST=withBotChange("employees",handlePOST);
