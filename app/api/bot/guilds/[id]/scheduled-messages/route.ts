import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const prefix=(id:string)=>"schedule:message:"+id+":";
const schema=z.object({id:z.string().uuid().optional(),name:z.string().trim().min(1).max(100),channelId:z.string().regex(/^\d{17,22}$/),content:z.string().trim().min(1).max(2000),nextAt:z.number().int().positive(),repeat:z.enum(["ONCE","DAILY","WEEKLY"]),enabled:z.boolean()});
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const records=await prisma.setting.findMany({where:{category:"SCHEDULED_MESSAGE",key:{startsWith:prefix(params.id)}},orderBy:{updatedAt:"desc"},take:100});
 return NextResponse.json({messages:records.map(r=>JSON.parse(r.value))});
}
export async function PUT(r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=schema.safeParse(await r.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Datos del mensaje inválidos"},{status:400});
 const d=parsed.data;
 if(d.enabled&&d.nextAt<=Date.now())return NextResponse.json({error:"Selecciona una fecha futura"},{status:400});
 const id=d.id||randomUUID(),key=prefix(params.id)+id;
 const existing=await prisma.setting.findUnique({where:{key}});
 if(d.id&&!existing)return NextResponse.json({error:"Mensaje no encontrado"},{status:404});
 if(existing&&JSON.parse(existing.value).status==="PROCESSING")return NextResponse.json({error:"Envío en curso; vuelve a consultar el estado"},{status:409});
 if(!existing&&await prisma.setting.count({where:{key:{startsWith:prefix(params.id)},category:"SCHEDULED_MESSAGE"}})>=100)return NextResponse.json({error:"Máximo 100 mensajes por servidor"},{status:409});
 const old=existing?JSON.parse(existing.value):{};
 const value=JSON.stringify({...d,id,status:d.enabled?"PENDING":"PAUSED",lastSentAt:old.lastSentAt||null,lastError:null,attempts:0});
 if(existing){const changed=await prisma.setting.updateMany({where:{key,value:existing.value},data:{value}});if(!changed.count)return NextResponse.json({error:"El mensaje cambió; actualiza el panel"},{status:409});}
 else await prisma.setting.create({data:{key,value,category:"SCHEDULED_MESSAGE",isPublic:false}});
 return NextResponse.json({success:true,id});
}
export async function DELETE(r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const id=new URL(r.url).searchParams.get("id");if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"ID inválido"},{status:400});
 const key=prefix(params.id)+id;const row=await prisma.setting.findUnique({where:{key}});
 if(!row)return NextResponse.json({error:"No encontrado"},{status:404});
 if(JSON.parse(row.value).status==="PROCESSING")return NextResponse.json({error:"Envío en curso"},{status:409});
 const deleted=await prisma.setting.deleteMany({where:{key,value:row.value}});return NextResponse.json(deleted.count?{success:true}:{error:"El mensaje cambió"},{status:deleted.count?200:409});
}
