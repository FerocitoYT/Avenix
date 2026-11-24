import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
 try {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error:"No autorizado"},{status:401});
  const now = new Date();
  const [subscriptions,services,invoices,orders,tickets,notifications] = await Promise.all([
   prisma.subscription.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"}}),
   prisma.service.findMany({where:{userId:user.id},include:{botInstance:true},orderBy:{createdAt:"desc"}}),
   prisma.invoice.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"}}),
   prisma.order.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:5}),
   prisma.supportTicket.count({where:{userId:user.id,status:{in:["OPEN","IN_PROGRESS","WAITING_CLIENT"]}}}),
   prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:5})
  ]);
  const activeSubscriptions=subscriptions.filter(s=>["ACTIVE","TRIALING"].includes(s.status)&&s.currentPeriodEnd>now);
  const activeIds=new Set(activeSubscriptions.map(s=>s.serviceId).filter(Boolean));
  return NextResponse.json({
   subscriptions:subscriptions.map(s=>({id:s.id,planName:s.planName,status:s.status,statusLabel:s.currentPeriodEnd<=now?"Caducada":s.status==="ACTIVE"?"Activa":s.status,renewalDate:s.currentPeriodEnd,amountCents:s.amountCents,interval:s.interval==="MONTH"?"mes":"año",cancelAtPeriodEnd:s.cancelAtPeriodEnd,isActive:activeSubscriptions.some(a=>a.id===s.id)})),
   services:services.map(s=>{
    const relatedSubs=subscriptions.filter(sub=>sub.serviceId===s.id).sort((a,b)=>b.currentPeriodEnd.getTime()-a.currentPeriodEnd.getTime());
    const latestSub=relatedSubs[0]||null;
    const hasActiveSubscription=activeIds.has(s.id);
    const effectiveActive=s.status==="ACTIVE"&&hasActiveSubscription;
    let statusReason:string|null=null;
    if(s.status==="SUSPENDED") statusReason="Suspendido por la administración";
    else if(s.status==="TERMINATED") statusReason="Servicio finalizado";
    else if(latestSub?.status==="PAST_DUE") statusReason="Impago";
    else if(latestSub?.status==="CANCELLED") statusReason="Suscripción cancelada";
    else if(latestSub && latestSub.currentPeriodEnd<=now) statusReason="Suscripción vencida";
    else if(!latestSub) statusReason="Sin suscripción activa";
    return {
      id:s.id,name:s.name,type:s.serviceType,status:s.status,
      statusLabel:effectiveActive?"Activo":s.status==="SUSPENDED"?"Suspendido":latestSub?.status==="PAST_DUE"?"Impago":latestSub?.status==="CANCELLED"?"Cancelado":"Inactivo",
      statusReason,
      identifier:s.id,planName:s.planName,hiringDate:s.createdAt,
      renewalDate:hasActiveSubscription?s.renewalDate:null,
      node:s.botInstance?.nodeHost||"Pendiente de asignación",
      monthlyCostCents:s.monthlyCostCents,botId:s.botInstance?.id,
      botStatus:effectiveActive?(s.botInstance?.status||"STOPPED"):"STOPPED",
      hasSubscription:hasActiveSubscription,isActive:effectiveActive
    };
   }),
   invoices:invoices.map(i=>({id:i.id,invoiceNumber:i.invoiceNumber,description:"Servicio Axyon",createdAt:i.createdAt,baseAmountCents:i.amountCents,vatAmountCents:i.vatAmountCents,totalAmountCents:i.totalAmountCents,statusLabel:i.status==="PAID"?"Pagada":i.status})),
   overview:{servicesCount:services.filter(s=>s.status==="ACTIVE"&&activeIds.has(s.id)).length,subscriptionsCount:activeSubscriptions.length,pendingInvoicesCount:invoices.filter(i=>i.status==="ISSUED").length,activeOrdersCount:orders.filter(o=>["PENDING","ACCEPTED","IN_DEVELOPMENT","IN_REVIEW"].includes(o.status)).length,openTicketsCount:tickets,notifications,recentOrders:orders,activeServices:services.filter(s=>s.status==="ACTIVE"&&activeIds.has(s.id)&&s.botInstance).map(s=>({id:s.id,name:s.name,node:s.botInstance?.nodeHost,planName:s.planName,botId:s.botInstance?.id,botStatus:s.botInstance?.status||"STOPPED"}))}
  });
 }catch(error){console.error("Customer overview:",error);return NextResponse.json({error:"No se pudieron cargar los datos de la cuenta"},{status:500});}
}
