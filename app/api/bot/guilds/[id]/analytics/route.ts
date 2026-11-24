import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
type C={params:{id:string}};
export async function GET(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const days=Number(new URL(req.url).searchParams.get("days")||30);
 if(![7,30,90].includes(days))return NextResponse.json({error:"Periodo inválido"},{status:400});
 const since=new Date();since.setUTCHours(0,0,0,0);since.setUTCDate(since.getUTCDate()-days+1);
 const [daily,setting]=await Promise.all([prisma.serverAnalyticsDaily.findMany({where:{guildId:params.id,date:{gte:since}},orderBy:{date:"asc"}}),prisma.setting.findUnique({where:{key:"analytics:config:"+params.id}})]);
 return NextResponse.json({daily,enabled:setting?JSON.parse(setting.value).enabled!==false:true});
}
export async function PUT(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=z.object({enabled:z.boolean()}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 const key="analytics:config:"+params.id,value=JSON.stringify(parsed.data);
 await prisma.setting.upsert({where:{key},create:{key,value,category:"ANALYTICS",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}
