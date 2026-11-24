import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const prefix=(id:string)=>"events:config:"+id+":";
const schema=z.object({id:z.string().uuid().optional(),title:z.string().trim().min(1).max(100),description:z.string().max(1000),channelId:z.string().regex(/^\d{17,22}$/),startsAt:z.number().int().positive(),reminderMinutes:z.number().int().min(0).max(10080),enabled:z.boolean()});
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [rows,attendance]=await Promise.all([prisma.setting.findMany({where:{category:"GUILD_EVENT",key:{startsWith:prefix(params.id)}},take:100,orderBy:{updatedAt:"desc"}}),prisma.setting.findMany({where:{category:"EVENT_RSVP",key:{startsWith:"events:rsvp:"+params.id+":"}},take:5000})]);
 const votes=attendance.map(r=>JSON.parse(r.value));
 return NextResponse.json({events:rows.map(r=>{const e=JSON.parse(r.value);return {...e,attendees:votes.filter(v=>v.eventId===e.id)};}),attendanceLimited:attendance.length===5000});
}
export async function PUT(r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const p=schema.safeParse(await r.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Evento inválido"},{status:400});
 const d=p.data;if(d.enabled&&d.startsAt<=Date.now())return NextResponse.json({error:"Selecciona una fecha futura"},{status:400});
 const id=d.id||randomUUID(),key=prefix(params.id)+id,old=await prisma.setting.findUnique({where:{key}});
 if(d.id&&!old)return NextResponse.json({error:"Evento no encontrado"},{status:404});
 const previous=old?JSON.parse(old.value):null;
 if(previous?.processing)return NextResponse.json({error:"Operación en curso"},{status:409});
 if(previous?.messageId&&previous.channelId!==d.channelId)return NextResponse.json({error:"No puedes cambiar el canal de un evento publicado; crea otro."},{status:400});
 if(!old&&await prisma.setting.count({where:{category:"GUILD_EVENT",key:{startsWith:prefix(params.id)}}})>=100)return NextResponse.json({error:"Máximo 100 eventos"},{status:409});
 const value=JSON.stringify({...d,id,messageId:previous?.messageId||null,dirty:true,reminded:previous?.startsAt===d.startsAt&&previous?.reminderMinutes===d.reminderMinutes?!!previous.reminded:false,processing:false,error:null});
 if(old){if(!(await prisma.setting.updateMany({where:{key,value:old.value},data:{value}})).count)return NextResponse.json({error:"Evento modificado, actualiza el panel"},{status:409});}
 else await prisma.setting.create({data:{key,value,category:"GUILD_EVENT",isPublic:false}});
 return NextResponse.json({success:true});
}
