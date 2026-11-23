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
   services:services.map(s=>({id:s.id,name:s.name,type:s.serviceType,status:s.status,statusLabel:s.status==="ACTIVE"?"Activo":s.status,identifier:s.id,planName:s.planName,hiringDate:s.createdAt,renewalDate:s.renewalDate,node:s.botInstance?.nodeHost||"Pendiente de asignación",monthlyCostCents:s.monthlyCostCents,botId:s.botInstance?.id,botStatus:s.botInstance?.status||"STOPPED",hasSubscription:activeIds.has(s.id)})),
   invoices:invoices.map(i=>({id:i.id,invoiceNumber:i.invoiceNumber,description:"Servicio Axyon",createdAt:i.createdAt,baseAmountCents:i.amountCents,vatAmountCents:i.vatAmountCents,totalAmountCents:i.totalAmountCents,statusLabel:i.status==="PAID"?"Pagada":i.status})),
   overview:{servicesCount:services.filter(s=>s.status==="ACTIVE"&&activeIds.has(s.id)).length,subscriptionsCount:activeSubscriptions.length,pendingInvoicesCount:invoices.filter(i=>i.status==="ISSUED").length,activeOrdersCount:orders.filter(o=>["PENDING","ACCEPTED","IN_DEVELOPMENT","IN_REVIEW"].includes(o.status)).length,openTicketsCount:tickets,notifications,recentOrders:orders,activeServices:services.filter(s=>s.status==="ACTIVE"&&activeIds.has(s.id)&&s.botInstance).map(s=>({id:s.id,name:s.name,node:s.botInstance?.nodeHost,planName:s.planName,botId:s.botInstance?.id,botStatus:s.botInstance?.status||"STOPPED"}))}
  });
 }catch(error){console.error("Customer overview:",error);return NextResponse.json({error:"No se pudieron cargar los datos de la cuenta"},{status:500});}
}
