import {withBotChange} from "@/lib/bot-change-signal";
import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {z} from "zod";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
type C={params:{id:string}};
const snow=z.string().regex(/^\d{17,22}$/);
const schema=z.discriminatedUnion("action",[
z.object({action:z.literal("CREATE"),title:z.string().trim().min(1).max(150),options:z.array(z.string().trim().min(1).max(60)).min(2).max(5),channelId:snow,endsAt:z.number().int().positive()}),
z.object({action:z.literal("CLOSE"),id:z.string().uuid()}),
z.object({action:z.literal("CONFIG"),enabled:z.boolean(),channelId:z.union([snow,z.literal("")])}),
z.object({action:z.literal("REVIEW"),id:snow,status:z.enum(["ACCEPTED","REJECTED"]),note:z.string().max(500)})
]);
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const g=params.id;
 const [polls,votes,config,suggestions]=await Promise.all([
 prisma.setting.findMany({where:{category:"GUILD_POLL",key:{startsWith:"poll:config:"+g+":"}},orderBy:{updatedAt:"desc"},take:100}),
 prisma.setting.findMany({where:{category:"POLL_VOTE",key:{startsWith:"poll:vote:"+g+":"}},take:10000}),
 prisma.setting.findUnique({where:{key:"suggestion:config:"+g}}),
 prisma.setting.findMany({where:{category:"GUILD_SUGGESTION",key:{startsWith:"suggestion:entry:"+g+":"}},orderBy:{updatedAt:"desc"},take:100})]);
 const counts=new Map<string,number[]>();
 for(const r of votes){const v=JSON.parse(r.value);if(!Number.isInteger(v.option)||v.option<0||v.option>4)continue;const c=counts.get(v.pollId)||[0,0,0,0,0];c[v.option]++;counts.set(v.pollId,c);}
 return NextResponse.json({polls:polls.map(r=>{const p=JSON.parse(r.value);return {...p,counts:(counts.get(p.id)||[0,0,0,0,0]).slice(0,p.options.length)}}),limited:votes.length===10000,config:config?JSON.parse(config.value):{enabled:false,channelId:""},suggestions:suggestions.map(r=>JSON.parse(r.value))});
}
async function handlePOST(req:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Datos inválidos"},{status:400});
 const d=parsed.data,g=params.id;
 if(d.action==="CREATE"){
 if(d.endsAt<=Date.now()||d.endsAt>Date.now()+30*86400000||new Set(d.options.map(x=>x.toLowerCase())).size!==d.options.length)return NextResponse.json({error:"Fecha futura de hasta 30 días y opciones distintas requeridas"},{status:400});
 if(await prisma.setting.count({where:{category:"GUILD_POLL",key:{startsWith:"poll:config:"+g+":"}}})>=100)return NextResponse.json({error:"Límite de 100 encuestas"},{status:409});
 const id=randomUUID();await prisma.setting.create({data:{key:"poll:config:"+g+":"+id,category:"GUILD_POLL",isPublic:false,value:JSON.stringify({id,title:d.title,options:d.options,channelId:d.channelId,endsAt:d.endsAt,status:"OPEN",dirty:true})}});
 }else if(d.action==="CONFIG"){
 if(d.enabled&&!d.channelId)return NextResponse.json({error:"Indica el canal de sugerencias"},{status:400});
 const key="suggestion:config:"+g,value=JSON.stringify({enabled:d.enabled,channelId:d.channelId});await prisma.setting.upsert({where:{key},create:{key,value,category:"SUGGESTIONS",isPublic:false},update:{value}});
 }else{
 const key=d.action==="CLOSE"?"poll:config:"+g+":"+d.id:"suggestion:entry:"+g+":"+d.id;
 const row=await prisma.setting.findUnique({where:{key}});if(!row)return NextResponse.json({error:"Registro no encontrado"},{status:404});
 const old=JSON.parse(row.value);if(old.processing|| (d.action==="REVIEW"&&old.status!=="PENDING"))return NextResponse.json({error:"Registro no disponible"},{status:409});
 const next=d.action==="CLOSE"?{...old,status:"CLOSED",dirty:true}:{...old,status:d.status,note:d.note,dirty:true};
 if(!(await prisma.setting.updateMany({where:{key,value:row.value},data:{value:JSON.stringify(next)}})).count)return NextResponse.json({error:"Actualiza el panel"},{status:409});
 }
 return NextResponse.json({success:true});
}

export const POST=withBotChange("polls",handlePOST);
