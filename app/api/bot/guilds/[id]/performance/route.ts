import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const schema=z.object({profile:z.enum(["FAST","BALANCED","ECO"]),analytics:z.boolean()});
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [cfg,analytics]=await Promise.all([prisma.setting.findUnique({where:{key:"performance:config:"+params.id}}),prisma.setting.findUnique({where:{key:"analytics:config:"+params.id}})]);
 return NextResponse.json({profile:cfg?JSON.parse(cfg.value).profile:"BALANCED",analytics:analytics?JSON.parse(analytics.value).enabled!==false:true});
}
export async function PUT(r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const p=schema.safeParse(await r.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 const key="performance:config:"+params.id,value=JSON.stringify({profile:p.data.profile}),ak="analytics:config:"+params.id,av=JSON.stringify({enabled:p.data.analytics});
 await prisma.$transaction([prisma.setting.upsert({where:{key},create:{key,value,category:"PERFORMANCE",isPublic:false},update:{value}}),prisma.setting.upsert({where:{key:ak},create:{key:ak,value:av,category:"ANALYTICS",isPublic:false},update:{value:av}})]);
 return NextResponse.json({success:true});
}
