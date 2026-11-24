import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/fulfillment";
import { queuePaymentLogsForUser } from "@/lib/discord-log-events";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Firma de webhook o secreto de Stripe no configurado en el servidor." },
      { status: 400 }
    );
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Firma inválida de Stripe: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle specific webhook event types
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const orderId = session.metadata?.orderId;
        const orderNumber = session.metadata?.orderNumber;
        const priceId = session.metadata?.priceId;
        const productName = session.metadata?.productName;

        const amountTotal = session.amount_total || 0;
        const transactionId =
          (session.payment_intent as string) || session.id;

        if(session.payment_status!=="paid")break;
        if(!orderId&&!orderNumber)throw Error("Checkout sin pedido asociado");
        const result=await fulfillOrder({
          orderId,
          orderNumber,
          userId,
          paymentGateway: "STRIPE",
          gatewayTransactionId: transactionId,
          amountPaidCents: amountTotal,
          planId: priceId,
          planName: productName,
          notes: `Stripe Checkout Session completada (${session.id})`,
        });
        if(session.subscription&&result.service){
          const stripeSub=await stripe.subscriptions.retrieve(String(session.subscription));
          await prisma.subscription.updateMany({where:{serviceId:result.service.id,userId},data:{stripeSubscriptionId:stripeSub.id,stripeCustomerId:typeof stripeSub.customer==="string"?stripeSub.customer:stripeSub.customer.id,currentPeriodStart:new Date(stripeSub.current_period_start*1000),currentPeriodEnd:new Date(stripeSub.current_period_end*1000),cancelAtPeriodEnd:stripeSub.cancel_at_period_end}});
          if(session.invoice){
            const stripeInvoice=await stripe.invoices.retrieve(String(session.invoice));
            await prisma.invoice.updateMany({where:{orderId:result.order.id,userId,stripeInvoiceId:null},data:{stripeInvoiceId:stripeInvoice.id,pdfUrl:stripeInvoice.invoice_pdf||null}});
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if(!invoice.subscription)break;
        const sub=await prisma.subscription.findFirst({where:{stripeSubscriptionId:String(invoice.subscription)},include:{service:true}});
        if(!sub)throw Error("Suscripción aún no vinculada");
        const remote=await stripe.subscriptions.retrieve(String(invoice.subscription));
        await prisma.$transaction(async tx=>{
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(8242091)`;
          const existing=await tx.invoice.findFirst({where:{stripeInvoiceId:invoice.id}});
          const initial=invoice.billing_reason==="subscription_create"&&sub.service?.orderId?await tx.invoice.findFirst({where:{orderId:sub.service.orderId,userId:sub.userId}}):null;
          if(initial&&!existing){await tx.invoice.update({where:{id:initial.id},data:{stripeInvoiceId:invoice.id,pdfUrl:invoice.invoice_pdf||null,subscriptionId:sub.id}});}
          else if(!existing){
            const total=Number(invoice.total??invoice.amount_paid??0),tax=Number(invoice.tax??0);
            const prefix="FAC-R-"+new Date(invoice.created*1000).getUTCFullYear()+"-";
            const rows=await tx.invoice.findMany({where:{invoiceNumber:{startsWith:prefix}},select:{invoiceNumber:true}});
            const next=1+rows.reduce((max,r)=>Math.max(max,Number(r.invoiceNumber.slice(prefix.length))||0),0);
            await tx.invoice.create({data:{invoiceNumber:prefix+String(next).padStart(6,"0"),userId:sub.userId,subscriptionId:sub.id,amountCents:total-tax,vatAmountCents:tax,vatRatePercent:total>tax?tax/(total-tax)*100:0,totalAmountCents:total,currency:String(invoice.currency||"eur").toUpperCase(),status:"PAID",paidAt:new Date((invoice.status_transitions?.paid_at||invoice.created)*1000),dueDate:new Date((invoice.due_date||invoice.created)*1000),stripeInvoiceId:invoice.id,pdfUrl:invoice.invoice_pdf||null}});
            await tx.notification.create({data:{userId:sub.userId,title:"Renovación pagada",message:"Stripe ha confirmado el pago de tu renovación. Consulta tu factura.",type:"INVOICE",link:"/dashboard/facturacion"}});
          }
          if(remote.status==="active"||remote.status==="trialing"){
            const end=new Date(remote.current_period_end*1000);
            await tx.subscription.update({where:{id:sub.id},data:{status:remote.status==="trialing"?"TRIALING":"ACTIVE",currentPeriodStart:new Date(remote.current_period_start*1000),currentPeriodEnd:end,cancelAtPeriodEnd:remote.cancel_at_period_end}});
            if(sub.serviceId)await tx.service.update({where:{id:sub.serviceId},data:{renewalDate:end}});
          }
        });
        break;
      }
      case "invoice.payment_failed":{
        const invoice=event.data.object;
        if(!invoice.subscription)break;
        const sub=await prisma.subscription.findFirst({where:{stripeSubscriptionId:String(invoice.subscription)}});
        if(!sub)throw Error("Suscripción aún no vinculada");
        const remote=await stripe.subscriptions.retrieve(String(invoice.subscription));
        if(remote.status!=="past_due"&&remote.status!=="unpaid")break;
        await prisma.$transaction(async tx=>{
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(8242091)`;
          const marker="stripe:event:"+event.id;
          if(await tx.setting.findUnique({where:{key:marker}}))return;
          await tx.subscription.update({where:{id:sub.id},data:{status:"PAST_DUE"}});
          await tx.notification.create({data:{userId:sub.userId,title:"Pago de renovación fallido",message:"No se ha podido procesar tu renovación. Actualiza el método de pago para recuperar el acceso.",type:"WARNING",link:"/dashboard/facturacion"}});
          await tx.setting.create({data:{key:marker,value:"processed",category:"PAYMENTS",isPublic:false}});
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // Manage cancellation
        try {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "CANCELLED" },
          });

          await prisma.auditLog.create({
            data: {
              action: "STRIPE_SUBSCRIPTION_CANCELLED",
              entityType: "SUBSCRIPTION",
              detailsJson: {
                stripeSubscriptionId: subscription.id,
              },
            },
          });
        } catch (cancelErr) {
          console.error("Error cancelling subscription:", cancelErr);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Error handling Stripe event:", err);
    return NextResponse.json(
      { error: "Error interno al procesar el evento de webhook de Stripe" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    gateway: "STRIPE_WEBHOOK",
    endpoint: "/api/stripe/webhook",
    configured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}
