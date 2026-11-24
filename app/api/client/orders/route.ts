import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [orders, orphanServices] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true } } } },
        services: {
          select: {
            id: true, name: true, planName: true, status: true, renewalDate: true,
            serviceType: true, monthlyCostCents: true,
            subscriptions: {
              orderBy: { currentPeriodEnd: "desc" },
              take: 1,
              select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
            },
          },
        },
      },
    }),
    prisma.service.findMany({
      where: { userId: user.id, orderId: null },
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { currentPeriodEnd: "desc" },
          take: 1,
          select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
        },
      },
    }),
  ]);

  const normalizedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    productName: order.items[0]?.productName || order.items[0]?.product?.name || order.services[0]?.name || "Servicio Axyon",
    totalAmountCents: order.totalAmountCents,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    deliveryEstimatedDate: order.deliveryDate,
    notes: order.notes,
    source: "ORDER" as const,
    services: order.services.map(service => ({
      id: service.id,
      name: service.name,
      planName: service.planName,
      status: service.status,
      serviceType: service.serviceType,
      renewalDate: service.renewalDate,
      subscription: service.subscriptions[0] ?? null,
    })),
  }));

  const syntheticOrders = orphanServices.map(service => {
    const sub = service.subscriptions[0] ?? null;
    const active = !!sub && ["ACTIVE", "TRIALING"].includes(sub.status) && sub.currentPeriodEnd > new Date();
    return {
      id: `service:${service.id}`,
      orderNumber: `SERV-${service.id.slice(-8).toUpperCase()}`,
      productName: service.name,
      totalAmountCents: service.monthlyCostCents,
      currency: "EUR",
      status: active ? "ACCEPTED" : "COMPLETED",
      createdAt: service.createdAt,
      deliveryEstimatedDate: service.renewalDate,
      notes: active ? `Servicio contratado · ${service.planName}` : `Servicio no vigente · ${service.planName}`,
      source: "SERVICE" as const,
      services: [{
        id: service.id,
        name: service.name,
        planName: service.planName,
        status: service.status,
        serviceType: service.serviceType,
        renewalDate: service.renewalDate,
        subscription: sub,
      }],
    };
  });

  return NextResponse.json({
    success: true,
    orders: [...normalizedOrders, ...syntheticOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });
}
