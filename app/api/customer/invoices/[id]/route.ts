import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {invoicePdf} from "@/lib/invoice-pdf";
import {readInvoiceIssuer} from "@/lib/invoice-issuer";
import {NextResponse} from "next/server";
import {z} from "zod";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const party=z.object({name:z.string().trim().min(1).max(100),taxId:z.string().trim().min(1).max(40),address:z.string().trim().min(1).max(140)});
const snapshotSchema=z.object({issuer:party,customer:z.object({name:z.string().max(100),taxId:z.string().max(40),address:z.string().max(140)}),concept:z.string().max(140),method:z.string().max(30)});
const formatDate=(d:Date)=>d.toLocaleDateString("es-ES",{timeZone:"Europe/Madrid"});
export async function GET(_req:Request,{params}:{params:{id:string}}){
 const u=await getCurrentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 try{
 const invoice=await prisma.invoice.findFirst({where:{id:params.id,...(u.role==="ADMIN"?{}:{userId:u.id})},include:{user:{select:{name:true,companyName:true,taxId:true,address:true,city:true,postalCode:true,country:true}},subscription:{select:{planName:true}},order:{select:{services:{select:{planName:true},take:1}}}}});
 if(!invoice)return NextResponse.json({error:"Factura no encontrada"},{status:404});
 if(invoice.status!=="PAID")return NextResponse.json({error:"La factura no está confirmada como pagada."},{status:409});
 if(invoice.amountCents+invoice.vatAmountCents!==invoice.totalAmountCents)return NextResponse.json({error:"Factura pendiente de revisión de importes."},{status:409});
 const key="invoice:document:"+invoice.id;
 let stored=await prisma.setting.findUnique({where:{key}});
 if(!stored){
  const issuer=await readInvoiceIssuer();
  if(!issuer.success)return NextResponse.json({error:"Datos fiscales del emisor pendientes de configuración. Contacta con soporte."},{status:409});
  const customer={name:(invoice.user.companyName||invoice.user.name).slice(0,100),taxId:(invoice.user.taxId||"").slice(0,40),address:[invoice.user.address,invoice.user.postalCode,invoice.user.city,invoice.user.country].filter(Boolean).join(", ").slice(0,140)};
  const concept=(invoice.subscription?.planName||invoice.order?.services[0]?.planName||"Servicios Axyon").slice(0,140);
  const method=invoice.stripePaymentIntentId?.startsWith("PAYPAL-")?"PayPal":invoice.stripeInvoiceId||invoice.stripePaymentIntentId?"Stripe":"No especificado";
  stored=await prisma.setting.upsert({where:{key},create:{key,value:JSON.stringify({issuer:issuer.data,customer,concept,method}),category:"INVOICE_PRIVATE",isPublic:false},update:{}});
 }
 const snap=snapshotSchema.parse(JSON.parse(stored.value));
 const pdf=invoicePdf({number:invoice.invoiceNumber,date:formatDate(invoice.createdAt),paidDate:invoice.paidAt?formatDate(invoice.paidAt):"No consta",issuer:[snap.issuer.name,"NIF: "+snap.issuer.taxId,snap.issuer.address],customer:[snap.customer.name,...(snap.customer.taxId?["NIF: "+snap.customer.taxId]:[]),snap.customer.address],concept:snap.concept,currency:invoice.currency,base:invoice.amountCents,tax:invoice.vatAmountCents,total:invoice.totalAmountCents,method:snap.method});
 return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="'+invoice.invoiceNumber.replace(/[^A-Za-z0-9_-]/g,"_")+'.pdf"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch(e){console.error("[Invoice PDF]",e instanceof Error?e.name:"Error");return NextResponse.json({error:"No se pudo generar la factura"},{status:500});}
}
