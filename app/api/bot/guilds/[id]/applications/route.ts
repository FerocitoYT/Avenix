import { authorizeGuild } from "@/lib/bot-access";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
export const dynamic="force-dynamic";
const snowflake=z.string().regex(/^\d{17,22}$/);
const formSchema=z.object({enabled:z.boolean(),title:z.string().trim().min(1).max(100),description:z.string().max(1000),channelId:z.union([snowflake,z.literal("")]),questions:z.array(z.string().trim().min(1).max(45)).min(1).max(5)});
const defaults={enabled:false,title:"Contrataciones",description:"Completa el formulario para presentar tu candidatura.",channelId:"",questions:["¿Por qué quieres entrar?"]};
type Context={params:{id:string}};
export async function GET(_req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [form,records]=await Promise.all([prisma.setting.findUnique({where:{key:"recruitment:config:"+params.id}}),prisma.setting.findMany({where:{key:{startsWith:"recruitment:record:"+params.id+":"}},orderBy:{updatedAt:"desc"},take:100})]);
 return NextResponse.json({config:form?formSchema.parse(JSON.parse(form.value)):defaults,records:records.map(r=>({id:r.key.split(":").pop(),...JSON.parse(r.value)}))});
}
export async function POST(req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=formSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Formulario inválido: entre 1 y 5 preguntas de hasta 45 caracteres."},{status:400});
 if(parsed.data.enabled&&!parsed.data.channelId)return NextResponse.json({error:"Indica el canal de publicación"},{status:400});
 const key="recruitment:config:"+params.id,value=JSON.stringify(parsed.data);
 await prisma.setting.upsert({where:{key},create:{key,value,category:"RECRUITMENT",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}
export async function PUT(req:Request,{params}:Context){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=z.discriminatedUnion("action",[z.object({action:z.literal("PUBLISH")}),z.object({action:z.literal("REVIEW"),id:snowflake,status:z.enum(["ACCEPTED","REJECTED"]),note:z.string().max(1000)})]).safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Acción inválida"},{status:400});
 const d=parsed.data;
 if(d.action==="PUBLISH"){
 const cfg=await prisma.setting.findUnique({where:{key:"recruitment:config:"+params.id}});
 if(!cfg||!JSON.parse(cfg.value).enabled)return NextResponse.json({error:"Activa y guarda el formulario primero"},{status:400});
 const key="recruitment:publish:"+params.id;
 try{await prisma.setting.create({data:{key,value:JSON.stringify({requestedAt:Date.now()}),category:"RECRUITMENT",isPublic:false}});}catch{return NextResponse.json({error:"Ya hay una publicación pendiente"},{status:409});}
 }else{
 const key="recruitment:record:"+params.id+":"+d.id;
 const record=await prisma.setting.findUnique({where:{key}});
 if(!record||JSON.parse(record.value).status!=="PENDING")return NextResponse.json({error:"Candidatura no disponible"},{status:409});
 const changed=await prisma.setting.updateMany({where:{key,value:record.value},data:{value:JSON.stringify({...JSON.parse(record.value),status:d.status,note:d.note,reviewedAt:Date.now(),notificationPending:true})}});
 if(!changed.count)return NextResponse.json({error:"La candidatura ya se ha revisado"},{status:409});
 }
 return NextResponse.json({success:true},{status:202});
}
