import {withBotChange} from "@/lib/bot-change-signal";
import { authorizeGuild } from "@/lib/bot-access";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
export const dynamic="force-dynamic";
const id=z.string().regex(/^\d{17,22}$/);
const configSchema=z.object({enabled:z.boolean(),roleId:z.union([id,z.literal("")]),logChannelId:z.union([id,z.literal("")]),maxDays:z.number().int().min(1).max(30)});
const defaults={enabled:false,roleId:"",logChannelId:"",maxDays:7};
type Context={params:{id:string}};
export async function GET(req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [config,records]=await Promise.all([prisma.setting.findUnique({where:{key:"absence:config:"+params.id}}),prisma.setting.findMany({where:{key:{startsWith:"absence:record:"+params.id+":"}},orderBy:{updatedAt:"desc"},take:100})]);
 return NextResponse.json({config:config?configSchema.parse(JSON.parse(config.value)):defaults,records:records.map(r=>({id:r.key.split(":").pop(),...JSON.parse(r.value)}))});
}
async function handlePOST(req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const body=await req.json().catch(()=>null);const parsed=configSchema.safeParse(body);
 if(!parsed.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 if(parsed.data.enabled&&!parsed.data.roleId)return NextResponse.json({error:"Selecciona el rol de ausencia"},{status:400});
 const key="absence:config:"+params.id,value=JSON.stringify(parsed.data);
 await prisma.setting.upsert({where:{key},create:{key,value,category:"ABSENCES",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}
async function handlePUT(req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=z.discriminatedUnion("action",[z.object({action:z.literal("START"),userId:id,reason:z.string().trim().min(1).max(500),days:z.number().int().min(1).max(30)}),z.object({action:z.literal("END"),userId:id})]).safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Solicitud inválida"},{status:400});
 const d=parsed.data,key="absence:record:"+params.id+":"+d.userId;
 const existing=await prisma.setting.findUnique({where:{key}});
 if(d.action==="START"){
 const setting=await prisma.setting.findUnique({where:{key:"absence:config:"+params.id}});
 const cfg=setting?configSchema.parse(JSON.parse(setting.value)):defaults;
 if(!cfg.enabled||!cfg.roleId||d.days>cfg.maxDays)return NextResponse.json({error:"Sistema desactivado o duración no permitida"},{status:400});
 if(existing&&!["ENDED","ERROR"].includes(JSON.parse(existing.value).status))return NextResponse.json({error:"Ya existe una ausencia pendiente o activa"},{status:409});
 const value=JSON.stringify({userId:d.userId,reason:d.reason,roleId:cfg.roleId,logChannelId:cfg.logChannelId,status:"PENDING",startAt:Date.now(),endAt:Date.now()+d.days*86400000});
 if(existing){const changed=await prisma.setting.updateMany({where:{key,value:existing.value},data:{value}});if(!changed.count)return NextResponse.json({error:"Registro modificado, actualiza el panel"},{status:409});}
 else {try{await prisma.setting.create({data:{key,value,category:"ABSENCES",isPublic:false}});}catch{return NextResponse.json({error:"Ya existe una solicitud"},{status:409});}}
 }else{
 if(!existing||JSON.parse(existing.value).status!=="ACTIVE")return NextResponse.json({error:"No hay ausencia activa"},{status:409});
 const changed=await prisma.setting.updateMany({where:{key,value:existing.value},data:{value:JSON.stringify({...JSON.parse(existing.value),status:"ENDING"})}});
 if(!changed.count)return NextResponse.json({error:"Registro modificado"},{status:409});
 }
 return NextResponse.json({success:true},{status:202});
}

export const POST=withBotChange("absences",handlePOST);
export const PUT=withBotChange("absences",handlePUT);
