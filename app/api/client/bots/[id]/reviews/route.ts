import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
const schema=z.object({invoiceId:z.string().min(1).max(100),target:z.enum(["SERVICE","DEVELOPER"]),developerId:z.string().max(100).optional(),stars:z.number().int().min(1).max(5),comment:z.string().trim().max(700).optional()});
const prefix="bot-review:";
async function context(botId:string){
 const user=await getCurrentUser();if(!user)return null;
 const bot=await prisma.botInstance.findFirst({where:{id:botId,service:{userId:user.id,serviceType:"DISCORD_BOT"}},include:{service:{include:{subscriptions:{select:{id:true}}}}}});
 if(!bot)return null;
 const invoices=await prisma.invoice.findMany({where:{userId:user.id,status:"PAID",paidAt:{not:null},totalAmountCents:{gt:0},OR:[{subscriptionId:{in:bot.service.subscriptions.map(s=>s.id)}},...(bot.service.orderId?[{orderId:bot.service.orderId,subscriptionId:null}]:[])]},select:{id:true,invoiceNumber:true,paidAt:true},orderBy:{paidAt:"desc"},take:50});
 const developers=await prisma.user.findMany({where:{isActive:true,role:{in:["EMPLOYEE","ADMIN"]}},select:{id:true,name:true},orderBy:{name:"asc"}});
 return {user,bot,invoices,developers};
}
export async function GET(_req:Request,{params}:{params:{id:string}}){
 const ctx=await context(params.id);if(!ctx)return NextResponse.json({error:"Acceso no autorizado"},{status:403});
 const records=await prisma.setting.findMany({where:{key:{startsWith:prefix+ctx.bot.id+":"}}});
 const reviews=records.map(r=>{try{const v=JSON.parse(r.value);return {invoiceId:v.invoiceId,target:v.target,developerId:v.developerId,stars:v.stars};}catch{return null;}}).filter(Boolean);
 return NextResponse.json({invoices:ctx.invoices,developers:ctx.developers,reviews});
}
export async function POST(req:Request,{params}:{params:{id:string}}){
 const ctx=await context(params.id);if(!ctx)return NextResponse.json({error:"Acceso no autorizado"},{status:403});
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Reseña inválida"},{status:400});
 const d=parsed.data,invoice=ctx.invoices.find(i=>i.id===d.invoiceId);
 if(!invoice)return NextResponse.json({error:"Se requiere una factura pagada de este servicio."},{status:403});
 const developer=d.target==="DEVELOPER"?ctx.developers.find(x=>x.id===d.developerId):null;
 if(d.target==="DEVELOPER"&&!developer)return NextResponse.json({error:"Selecciona un desarrollador disponible."},{status:400});
 const key=prefix+ctx.bot.id+":"+invoice.id+":"+d.target+(developer?":"+developer.id:"");
 const value=JSON.stringify({botId:ctx.bot.id,invoiceId:invoice.id,target:d.target,developerId:developer?.id||null,developerName:developer?.name||null,stars:d.stars,comment:d.comment||"",serviceName:ctx.bot.service.name,customerName:ctx.user.name,customerDiscordId:ctx.user.discordId||null,status:"PENDING",createdAt:new Date().toISOString()});
 try{await prisma.setting.create({data:{key,value,category:"BOT_REVIEW",isPublic:false}});}catch(e:any){if(e?.code==="P2002")return NextResponse.json({error:"Ya has valorado este destinatario para ese pago."},{status:409});throw e;}
 return NextResponse.json({success:true,message:"Reseña registrada. Gracias por tu valoración."});
}
