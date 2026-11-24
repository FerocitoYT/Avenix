import { prisma } from "@/lib/prisma";
import { queuePaymentLogsForUser } from "@/lib/discord-log-events";

export interface FulfillOrderParams {
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  paymentGateway: "STRIPE" | "PAYPAL";
  gatewayTransactionId: string;
  amountPaidCents: number;
  planId?: string;
  planName?: string;
  notes?: string;
}

/**
 * Centralized, idempotent order fulfillment engine.
 * Only called when a verified payment event is confirmed via Stripe Webhook or PayPal IPN.
 */
export async function fulfillOrder(params: FulfillOrderParams) {
  const {
    orderId,
    orderNumber,
    userId,
    paymentGateway,
    gatewayTransactionId,
    amountPaidCents,
    planId,
    planName,
  } = params;

  // 1. Locate Order
  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, invoices: true, services: true },
    });
  }

  if (!order && orderNumber) {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { user: true, invoices: true, services: true },
    });
  }

  // Fallback: If no order exists yet (e.g. Stripe checkout created without pre-creating order)
  if (!order && userId) {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedOrderNumber = `AVX-${year}-${randomSuffix}`;

    order = await prisma.order.create({
      data: {
        orderNumber: generatedOrderNumber,
        userId,
        status: "PENDING",
        totalAmountCents: amountPaidCents,
        currency: "EUR",
        notes: `Orden creada automáticamente para pago verificado de ${paymentGateway} (${gatewayTransactionId})`,
      },
      include: { user: true, invoices: true, services: true },
    });
  }

  if (!order) {
    throw new Error(
      `No se pudo encontrar ni crear el pedido para cumplir la orden (orderId: ${orderId}, orderNumber: ${orderNumber})`
    );
  }

  if (!Number.isSafeInteger(amountPaidCents) || amountPaidCents <= 0 || order.totalAmountCents !== amountPaidCents) throw new Error("Payment amount mismatch");
  const effectiveUserId = order.userId;

  // 2. Idempotency Check:
  // If a ready-made bot order is already completed (or an older record is still ACCEPTED)
  // and has a provisioned service, do not duplicate provision.
  const existingService = await prisma.service.findFirst({
    where: { orderId: order.id },
    include: { botInstance: true },
  });

  if ((order.status === "ACCEPTED" || order.status === "COMPLETED") && existingService) {
    return {
      success: true,
      alreadyFulfilled: true,
      order,
      service: existingService,
      message: "La orden ya había sido cumplida previamente de forma idempotente.",
    };
  }

  // 3. Payment accepted. Ready-made bot orders will be marked COMPLETED after provisioning.
  let updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "ACCEPTED",
      notes: `${order.notes ? order.notes + " | " : ""}Pago verificado por ${paymentGateway} (Txn: ${gatewayTransactionId})`,
    },
  });

  // 4. Update or Create Invoice (mark as PAID)
  const totalCents = order.totalAmountCents;
  const baseCents = Math.round(totalCents / 1.21);
  const vatCents = totalCents - baseCents;
  const paymentRef = paymentGateway === "STRIPE" ? gatewayTransactionId : "PAYPAL-" + gatewayTransactionId;
  const invoice = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(8242091)`;
    const existing = await tx.invoice.findFirst({where:{orderId:order.id}});
    if(existing?.status==="PAID")return existing;
    if(existing)return tx.invoice.update({where:{id:existing.id},data:{status:"PAID",paidAt:new Date(),stripePaymentIntentId:paymentRef}});
    const year = new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"Europe/Madrid"}).format(new Date());
    const prefix = "FAC-A-"+year+"-";
    const rows=await tx.invoice.findMany({where:{invoiceNumber:{startsWith:prefix}},select:{invoiceNumber:true}});
    const next=1+rows.reduce((max,r)=>Math.max(max,Number(r.invoiceNumber.slice(prefix.length))||0),0);
    return tx.invoice.create({data:{invoiceNumber:prefix+String(next).padStart(6,"0"),userId:effectiveUserId,orderId:order.id,amountCents:baseCents,vatAmountCents:vatCents,totalAmountCents:totalCents,status:"PAID",paidAt:new Date(),dueDate:new Date(),currency:order.currency,stripePaymentIntentId:paymentRef}});
  });

  // 5. Provision Service & BotInstance
  let service = existingService;
  if (!service) {
    // Determine interval and plan name
    const isAnnual =
      planId === "price-bot-annual" ||
      planId === "bot_anual_70" ||
      totalCents >= 5000;

    const resolvedPlanName =
      planName || (isAnnual ? "Avenix Bot Anual" : "Avenix Bot Mensual");

    const renewalDate = new Date();
    if (isAnnual) {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const randomBotNum = Math.floor(1000 + Math.random() * 9000);

    service = await prisma.service.create({
      data: {
        userId: effectiveUserId,
        orderId: order.id,
        name: `Avenix Bot (${resolvedPlanName})`,
        serviceType: "DISCORD_BOT",
        status: "ACTIVE",
        planName: resolvedPlanName,
        renewalDate,
        monthlyCostCents: isAnnual ? 7000 : 900,
      },
      include: { botInstance: true },
    });

    // Provision running BotInstance
    const botInst = await prisma.botInstance.create({
      data: {
        serviceId: service.id,
        name: `Avenix Bot #${randomBotNum}`,
        status: "RUNNING",
        nodeHost: "eu-node-01.avenix.dev",
        memoryLimitMb: 512,
        memoryUsageMb: 142,
        cpuLimitPercent: 50,
        cpuUsagePercent: 3.2,
        uptimeSeconds: 60,
        currentLogs: [
          `[${new Date().toISOString()}] [INFO] [Core] Pago verificado con éxito vía ${paymentGateway} (Txn: ${gatewayTransactionId}).`,
          `[${new Date().toISOString()}] [INFO] [Core] Instancia Avenix Bot desplegada en nodo eu-node-01.avenix.dev.`,
          `[${new Date().toISOString()}] [INFO] [Auth] Licencia y suscripción activada para el pedido ${order.orderNumber}.`,
          `[${new Date().toISOString()}] [INFO] [Gateway] Shard 0 inicializado y listo para conectar con Discord.`,
        ],
      },
    });

    // Create BotConfiguration
    await prisma.botConfiguration.create({
      data: {
        botInstanceId: botInst.id,
        prefix: "!",
        embedColorHex: "#3B82F6",
        modulesEnabled: ["moderation", "tickets", "utility"],
      },
    });

    // Create Subscription record
    await prisma.subscription.create({
      data: {
        userId: effectiveUserId,
        serviceId: service.id,
        planName: resolvedPlanName,
        amountCents: totalCents,
        interval: isAnnual ? "YEAR" : "MONTH",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: renewalDate,
        stripeSubscriptionId:
          paymentGateway === "STRIPE" && gatewayTransactionId.startsWith("sub_")
            ? gatewayTransactionId
            : undefined,
      },
    });
  }

  // Standard Axyon bots are ready-made products: once the service has been
  // provisioned there is no development/review phase. Complete the order immediately.
  const isReadyMadeBot = service.serviceType === "DISCORD_BOT" && (
    planId === "price-bot-monthly" ||
    planId === "price-bot-annual" ||
    planId === "bot_mensual_9" ||
    planId === "bot_anual_70" ||
    ["mensual", "anual", "avenix bot mensual", "avenix bot anual"].includes(service.planName.toLowerCase())
  );
  if (isReadyMadeBot && updatedOrder.status !== "COMPLETED") {
    updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    });
  }

  // 6. User Notification
  await prisma.notification.create({
    data: {
      userId: effectiveUserId,
      title: "¡Pago verificado y bot activado!",
      message: `Tu pago de ${(totalCents / 100).toFixed(2)} € ha sido verificado satisfactoriamente mediante ${paymentGateway}. Tu bot de Discord ya se encuentra en ejecución en tu panel Avenix Control.`,
      type: "ORDER",
      link: "/dashboard/bots",
    },
  });

  await queuePaymentLogsForUser({
    userId:effectiveUserId,
    title:"Pago confirmado",
    description:`Pago de ${(totalCents/100).toFixed(2)} € confirmado mediante ${paymentGateway} para el pedido ${order.orderNumber}.`,
    metadata:{orderId:order.id,orderNumber:order.orderNumber,invoiceNumber:invoice?.invoiceNumber,gateway:paymentGateway,serviceId:service.id}
  });

  // 7. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: effectiveUserId,
      action: `${paymentGateway}_PAYMENT_CONFIRMED_AND_FULFILLED`,
      entityType: "ORDER",
      entityId: order.id,
      detailsJson: {
        orderNumber: order.orderNumber,
        invoiceNumber: invoice?.invoiceNumber,
        gateway: paymentGateway,
        gatewayTransactionId,
        amountPaidCents: totalCents,
        serviceId: service.id,
      },
    },
  });

  return {
    success: true,
    order: updatedOrder,
    invoice,
    service,
  };
}
