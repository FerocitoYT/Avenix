import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {paypalKey,paypalSchema,paypalSettings} from "@/lib/paypal-settings";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
async function admin(){const u=await getCurrentUser();return u?prisma.user.findFirst({where:{id:u.id,role:"ADMIN",isActive:true},select:{id:true}}):null;}
export async function GET(){try{if(!await admin())return reply({error:"No autorizado"},403);return reply(await paypalSettings());}catch{return reply({error:"No se pudo cargar PayPal"},500)}}
export async function PUT(req:Request){try{const u=await admin();if(!u)return reply({error:"No autorizado"},403);const d=paypalSchema.safeParse(await req.json());if(!d.success)return reply({error:"Introduce un correo PayPal válido"},400);const value=JSON.stringify(d.data);await prisma.$transaction(async tx=>{await tx.setting.upsert({where:{key:paypalKey},create:{key:paypalKey,value,category:"PAYMENTS",isPublic:false},update:{value,isPublic:false}});await tx.auditLog.create({data:{userId:u.id,action:"PAYPAL_SETTINGS_UPDATED",entityType:"SETTING",detailsJson:{enabled:d.data.enabled}}});});return reply(d.data);}catch{return reply({error:"No se pudo guardar PayPal"},500)}}
