import {NextResponse} from "next/server";
import {z} from "zod";
import {randomUUID} from "node:crypto";
import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/auth";
import {encryptSecret,encryptionKeyReady} from "@/lib/crypto";
export const dynamic="force-dynamic";
const snow=z.string().regex(/^\d{17,22}$/);
const prize=z.object({label:z.string().trim().min(1).max(100),mode:z.enum(["MANUAL","TEXT","STOCK"]),text:z.string().max(1500).optional(),sourceId:z.string().max(100).optional(),productKey:z.string().max(200).optional(),quantity:z.number().int().min(1).max(10).default(1)});
const schema=z.object({title:z.string().trim().min(3).max(120),description:z.string().trim().max(1500),channelId:snow,requiredRoleId:z.union([snow,z.literal("")]).optional(),pingRoleId:z.union([snow,z.literal("")]).optional(),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),buttonLabel:z.string().trim().min(1).max(60),duration:z.number().int().min(1).max(43200),footer:z.string().trim().max(200).default("Axyon"),author:z.string().trim().max(100).default(""),logoPosition:z.enum(["NONE","LEFT","RIGHT"]).default("RIGHT"),showTimestamp:z.boolean().default(false),showFooterCount:z.boolean().default(true),prizes:z.array(prize).min(1).max(20)});
async function access(id:string){const u=await getCurrentUser();if(!u)return null;const now=new Date();const bot=await prisma.botInstance.findFirst({where:{id,service:{userId:u.id,serviceType:"DISCORD_BOT",status:"ACTIVE",subscriptions:{some:{userId:u.id,status:{in:["ACTIVE","TRIALING"]},currentPeriodStart:{lte:now},currentPeriodEnd:{gt:now}}}}}});return bot?.guildId?{bot,u,guildId:bot.guildId}:null;}
const prefix=(id:string)=>"web-giveaway:"+id+":";
function publicRecord(v:any){return {id:v.id,title:v.title,description:v.description,footer:v.footer||"",author:v.author||"",logoPosition:v.logoPosition||"NONE",showTimestamp:!!v.showTimestamp,showFooterCount:v.showFooterCount!==false,channelId:v.channelId,status:v.status,endsAt:v.endsAt,createdAt:v.createdAt,prizes:v.prizes.map((p:any)=>({label:p.label,mode:p.mode,quantity:p.quantity,winner:p.winner||null,delivery:p.delivery||null})),participants:(v.participants||[]).length,lastError:v.lastError||null};}
export async function GET(_req:Request,{params}:{params:{id:string}}){
 const a=await access(params.id);if(!a)return NextResponse.json({error:"Acceso no autorizado"},{status:403});
 encryptionKeyReady();
 const [rows,sources]=await Promise.all([prisma.setting.findMany({where:{key:{startsWith:prefix(a.bot.id)}},orderBy:{updatedAt:"desc"},take:100}),prisma.deliverySource.findMany({where:{botId:a.bot.id,enabled:true},select:{id:true,name:true,stockItems:{where:{status:"AVAILABLE"},select:{productKey:true}}}})]);
 const stock=sources.flatMap(s=>{const counts=new Map<string,number>();for(const i of s.stockItems)counts.set(i.productKey,(counts.get(i.productKey)||0)+1);return Array.from(counts,([productKey,available])=>({sourceId:s.id,sourceName:s.name,productKey,available}));});
 return NextResponse.json({giveaways:rows.map(r=>publicRecord(JSON.parse(r.value))),stock},{headers:{"Cache-Control":"private, no-store, max-age=0","Pragma":"no-cache"}});
}
export async function POST(req:Request,{params}:{params:{id:string}}){
 const a=await access(params.id);if(!a)return NextResponse.json({error:"Acceso no autorizado"},{status:403});
 const raw=await req.json().catch(()=>null);
 if(raw?.action==="cancel"||raw?.action==="retry"){
 const id=z.string().uuid().safeParse(raw.id);if(!id.success)return NextResponse.json({error:"ID inválido"},{status:400});
 try{await prisma.$transaction(async tx=>{
 const key=prefix(a.bot.id)+id.data;await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text AS locked`;
 const row=await tx.setting.findUnique({where:{key}});if(!row)throw Error("NOT_FOUND");const v=JSON.parse(row.value);
 if(raw.action==="cancel"){if(!["QUEUED","ACTIVE","PUBLISH_FAILED"].includes(v.status))throw Error("INVALID_STATE");v.status="CANCELLED";await tx.internalStockItem.updateMany({where:{reservationKey:{startsWith:"giveaway:"+v.id+":"},status:"RESERVED"},data:{status:"AVAILABLE",reservationKey:null}});}
 else{if(v.status==="PUBLISH_FAILED")v.status="QUEUED";else if(v.status==="ENDED"){for(const p of v.prizes)if(p.delivery==="FAILED")p.delivery="PENDING";}else throw Error("INVALID_STATE");}
 v.lastError=null;await tx.setting.update({where:{key},data:{value:JSON.stringify(v)}});
 });return NextResponse.json({success:true});}catch{return NextResponse.json({error:"No se pudo realizar esta acción en el estado actual."},{status:409});}
 }
 const parsed=schema.safeParse(raw);if(!parsed.success)return NextResponse.json({error:"Revisa los campos del sorteo y los premios."},{status:400});
 const d=parsed.data,id=randomUUID(),key=prefix(a.bot.id)+id;
 if(d.prizes.some(p=>p.mode!=="MANUAL")&&!encryptionKeyReady())return NextResponse.json({error:"La entrega automática no está disponible temporalmente. El equipo técnico debe revisar la configuración."},{status:503});
 try{await prisma.$transaction(async tx=>{
 const places:any[]=[];
 for(let i=0;i<d.prizes.length;i++){
 const p=d.prizes[i];
 const item:any={label:p.label,mode:p.mode,quantity:p.quantity,delivery:null};
 if(p.mode==="TEXT"){if(!p.text?.trim())throw Error("TEXT");const privateText=p.text.trim();const publicFields=[d.title,d.description,d.footer,d.author,d.buttonLabel,...d.prizes.map(x=>x.label)];if(publicFields.some(x=>x.includes(privateText)))throw Error("PUBLIC_SECRET");item.secret=encryptSecret(p.text);}
 if(p.mode==="STOCK"){
 if(!p.sourceId||!p.productKey)throw Error("STOCK");
 const source=await tx.deliverySource.findFirst({where:{id:p.sourceId,botId:a.bot.id,enabled:true},select:{id:true}});if(!source)throw Error("STOCK");
 const candidates=await tx.internalStockItem.findMany({where:{sourceId:source.id,productKey:p.productKey,status:"AVAILABLE"},orderBy:{createdAt:"asc"},take:p.quantity,select:{id:true}});
 if(candidates.length!==p.quantity)throw Error("STOCK");
 const reservationKey="giveaway:"+id+":"+i;
 const reserved=await tx.internalStockItem.updateMany({where:{id:{in:candidates.map(c=>c.id)},status:"AVAILABLE"},data:{status:"RESERVED",reservationKey}});
 if(reserved.count!==p.quantity)throw Error("STOCK");
 item.reservationKey=reservationKey;
 }
 places.push(item);
 }
 const v={id,botId:a.bot.id,guildId:a.guildId,createdAt:new Date().toISOString(),hostedBy:a.u.discordId||null,title:d.title,description:d.description,channelId:d.channelId,requiredRoleId:d.requiredRoleId||null,pingRoleId:d.pingRoleId||null,color:d.color,buttonLabel:d.buttonLabel,footer:d.footer,author:d.author,logoPosition:d.logoPosition,showTimestamp:d.showTimestamp,showFooterCount:d.showFooterCount,duration:d.duration,prizes:places,participants:[],status:"QUEUED",endsAt:null};
 await tx.setting.create({data:{key,value:JSON.stringify(v),category:"WEB_GIVEAWAY",isPublic:false}});
 },{timeout:15000});return NextResponse.json({success:true,id},{headers:{"Cache-Control":"private, no-store"}});}
 catch(e){return NextResponse.json({error:e instanceof Error&&e.message==="STOCK"?"Stock insuficiente o no pertenece a este bot.":e instanceof Error&&e.message==="TEXT"?"Introduce el contenido privado del premio.":e instanceof Error&&e.message==="PUBLIC_SECRET"?"El contenido privado del premio no puede aparecer en campos públicos.":"No se pudo guardar el sorteo."},{status:409});}
}
