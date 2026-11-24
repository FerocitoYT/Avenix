import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {fulfillOrder} from "@/lib/fulfillment";
import {createHash} from "node:crypto";
export const dynamic="force-dynamic";
const reply=(status:number)=>NextResponse.json({received:status===200},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(req:Request){try{
 const raw=await req.text();if(!raw||raw.length>65536)return reply(400);
 const verified=await fetch("https://ipnpb.paypal.com/cgi-bin/webscr",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Axyon-IPN/1.0"},body:"cmd=_notify-validate&"+raw,signal:AbortSignal.timeout(15000)});
 if(!verified.ok)return reply(503);
 if((await verified.text()).trim()!=="VERIFIED")return reply(400);
 const p=new URLSearchParams(raw);
 if(p.get("test_ipn")==="1")return reply(400);
 if(p.get("payment_status")!=="Completed")return reply(200);
 if(p.get("txn_type")!=="web_accept")return reply(200);
 const txn=p.get("txn_id")||"",number=p.get("item_number")||"",gross=p.get("mc_gross")||"";
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(txn)||!/^\d{1,8}\.\d{2}$/.test(gross)||p.get("mc_currency")!=="EUR")return reply(400);
 const order=await prisma.order.findUnique({where:{orderNumber:number}});
 if(!order)return reply(400);
 const setting=await prisma.setting.findUnique({where:{key:"paypal:order:"+order.id}});
 if(!setting)return reply(400);
 const expected=JSON.parse(setting.value);
 const cents=Number(gross.replace(".",""));
 if(p.get("receiver_email")?.trim().toLowerCase()!==expected.receiver||cents!==expected.amount||cents!==order.totalAmountCents||order.currency!=="EUR")return reply(400);
 const key="paypal:txn:"+createHash("sha256").update(txn).digest("hex");
 const claim=await prisma.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(8242092)`;
 const prior=await tx.setting.findUnique({where:{key}});
 if(prior){const v=JSON.parse(prior.value);if(v.orderId!==order.id)return "conflict";if(v.done)return "done";if(Date.now()-v.started<300000)return "busy";}
 const orderKey="paypal:claim:"+order.id;
 const previous=await tx.setting.findUnique({where:{key:orderKey}});
 if(previous&&previous.value!==key)return "conflict";
 if(!previous&&order.status!=="PENDING")return "conflict";
 await tx.setting.upsert({where:{key:orderKey},create:{key:orderKey,value:key,category:"PAYMENTS",isPublic:false},update:{}});
 const value=JSON.stringify({orderId:order.id,started:Date.now(),done:false});
 await tx.setting.upsert({where:{key},create:{key,value,category:"PAYMENTS",isPublic:false},update:{value}});
 return "claimed";
 });
 if(claim==="done")return reply(200);
 if(claim==="busy")return reply(503);
 if(claim!=="claimed")return reply(400);
 await fulfillOrder({orderId:order.id,paymentGateway:"PAYPAL",gatewayTransactionId:txn,amountPaidCents:cents,planId:expected.planId});
 await prisma.setting.update({where:{key},data:{value:JSON.stringify({orderId:order.id,done:true})}});
 return reply(200);
 }catch{console.error("[PayPal IPN] Processing failed");return reply(503);}}
export async function GET(){return NextResponse.json({status:"online"},{headers:{"Cache-Control":"no-store"}});}
