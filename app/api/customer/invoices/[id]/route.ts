import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {stripe} from "@/lib/stripe";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(_req:Request,{params}:{params:{id:string}}){
 const u=await getCurrentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const invoice=await prisma.invoice.findFirst({where:{id:params.id,...(u.role==="ADMIN"?{}:{userId:u.id})},select:{stripeInvoiceId:true,invoiceNumber:true}});
 if(!invoice)return NextResponse.json({error:"Factura no encontrada"},{status:404});
 if(!invoice.stripeInvoiceId)return NextResponse.json({error:"Esta factura todavía no tiene un PDF asociado. Contacta con soporte."},{status:409});
 try{const remote=await stripe.invoices.retrieve(invoice.stripeInvoiceId);if(!remote.invoice_pdf)return NextResponse.json({error:"PDF pendiente de emisión"},{status:409});const url=new URL(remote.invoice_pdf);if(url.protocol!=="https:"||!(url.hostname==="stripe.com"||url.hostname.endsWith(".stripe.com")))throw Error("URL inválida");return NextResponse.redirect(url,{headers:{"Cache-Control":"private, no-store"}})}catch(e){console.error("[Invoice PDF]",e);return NextResponse.json({error:"No se pudo recuperar el PDF"},{status:502});}
}
