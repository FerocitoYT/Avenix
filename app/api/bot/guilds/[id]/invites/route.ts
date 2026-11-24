import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const schema=z.object({enabled:z.boolean(),logChannelId:z.string().regex(/^(\d{17,22})?$/)});
export async function GET(_req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [cfg,rows]=await Promise.all([prisma.setting.findUnique({where:{key:"invites:config:"+params.id}}),prisma.setting.findMany({where:{category:"INVITE_EVENT",key:{startsWith:"invites:event:"+params.id+":"}},orderBy:{updatedAt:"desc"},take:1000})]);
 const events=rows.map(r=>JSON.parse(r.value) as {memberId:string;inviterId:string|null;code:string|null;at:number});
 const counts:Record<string,number>={};for(const e of events)if(e.inviterId)counts[e.inviterId]=(counts[e.inviterId]||0)+1;
 return NextResponse.json({config:cfg?schema.parse(JSON.parse(cfg.value)):{enabled:false,logChannelId:""},events:events.slice(0,100),sampleSize:events.length,ranking:Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([userId,count])=>({userId,count}))});
}
export async function PUT(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Configuración inválida"},{status:400});
 const key="invites:config:"+params.id,value=JSON.stringify(p.data);
 await prisma.setting.upsert({where:{key},create:{key,value,category:"INVITES",isPublic:false},update:{value}});
 return NextResponse.json({success:true});
}
