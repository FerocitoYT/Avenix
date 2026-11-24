import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const snow=z.string().regex(/^(\d{17,22})?$/);
const schema=z.object({enabled:z.boolean(),triggerId:snow,categoryId:snow,name:z.string().trim().min(1).max(70),userLimit:z.number().int().min(0).max(99),private:z.boolean()});
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [cfg,rooms]=await Promise.all([prisma.setting.findUnique({where:{key:"voice:config:"+params.id}}),prisma.setting.findMany({where:{category:"TEMP_VOICE",key:{startsWith:"voice:room:"+params.id+":"}},take:100,orderBy:{updatedAt:"desc"}})]);
 return NextResponse.json({config:cfg?JSON.parse(cfg.value):{enabled:false,triggerId:"",categoryId:"",name:"Sala de {user}",userLimit:0,private:false},rooms:rooms.map(r=>JSON.parse(r.value))});
}
export async function PUT(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 if(p.data.enabled&&!p.data.triggerId)return NextResponse.json({error:"Indica un canal de entrada"},{status:400});
 const key="voice:config:"+params.id,value=JSON.stringify(p.data);
 await prisma.setting.upsert({where:{key},create:{key,value,category:"TEMP_VOICE_CONFIG",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}
