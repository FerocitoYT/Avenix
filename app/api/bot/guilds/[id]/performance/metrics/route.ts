import {authorizeGuild} from "@/lib/bot-access";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
export const dynamic="force-dynamic";
type C={params:{id:string}};
export async function GET(_r:Request,{params}:C){
 const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const [signals,metrics]=await Promise.all([prisma.setting.findMany({where:{category:"BOT_SYNC",key:{startsWith:"sync:revision:"+params.id+":"}},select:{key:true,value:true}}),prisma.setting.findMany({where:{category:"BOT_SYNC_METRIC",key:{startsWith:"sync:metric:"+params.id+":"}},select:{key:true,value:true}})]);
 const byModule=new Map(metrics.map(r=>[r.key.split(":").pop(),JSON.parse(r.value)]));
 return NextResponse.json({rows:signals.map(r=>{const module=r.key.split(":").pop(),signal=JSON.parse(r.value),metric=byModule.get(module);return {module,signal,metric:metric?.revision===signal.revision?metric:null}}),serverTime:Date.now()});
}
export async function POST(_r:Request,{params}:C){
 const started=Date.now();const a=await authorizeGuild(params.id);if(!a.ok)return NextResponse.json({error:a.error},{status:a.status});
 const key="sync:revision:"+params.id+":probe",revision=randomUUID(),at=Date.now(),value=JSON.stringify({revision,at,apiMs:at-started});
 const old=await prisma.setting.findUnique({where:{key}});
 if(old&&Date.now()-old.updatedAt.getTime()<10000)return NextResponse.json({error:"Espera diez segundos entre pruebas."},{status:429});
 await prisma.setting.upsert({where:{key},create:{key,value,category:"BOT_SYNC",isPublic:false},update:{value}});
 return NextResponse.json({revision,at});
}
