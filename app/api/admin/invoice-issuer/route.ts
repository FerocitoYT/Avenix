import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {issuerKey,issuerSchema,readInvoiceIssuer} from "@/lib/invoice-issuer";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
async function admin(){
 const u=await getCurrentUser();
 if(!u)return null;
 return prisma.user.findFirst({where:{id:u.id,isActive:true,role:"ADMIN"},select:{id:true}});
}
export async function GET(){try{
 if(!await admin())return reply({error:"Acceso no autorizado"},403);
 const issuer=await readInvoiceIssuer();
 return reply({issuer:issuer.success?issuer.data:{name:"",taxId:"",address:""},configured:issuer.success});
 }catch{return reply({error:"No se pudo cargar la configuración fiscal"},500)}}
export async function PUT(req:Request){try{
 const u=await admin();if(!u)return reply({error:"Acceso no autorizado"},403);
 const input=issuerSchema.safeParse(await req.json().catch(()=>null));
 if(!input.success)return reply({error:"Completa los tres campos fiscales con datos válidos."},400);
 const value=JSON.stringify(input.data);
 await prisma.$transaction(async tx=>{
 await tx.setting.upsert({where:{key:issuerKey},create:{key:issuerKey,value,category:"INVOICE_PRIVATE",isPublic:false},update:{value,category:"INVOICE_PRIVATE",isPublic:false}});
 await tx.auditLog.create({data:{userId:u.id,action:"INVOICE_ISSUER_UPDATED",entityType:"SETTING",detailsJson:{fields:["name","taxId","address"]}}});
 });
 return reply({issuer:input.data,configured:true});
 }catch{return reply({error:"No se pudo guardar la configuración fiscal"},500)}}
