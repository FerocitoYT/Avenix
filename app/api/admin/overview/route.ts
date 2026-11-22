import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const [
      registeredClients,
      totalSalesCount,
      invoicesAggregate,
      subscriptions,
      pendingOrdersCount,
      activeSubscriptionsCount,
      openTicketsCount,
      operationalServicesCount,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { totalAmountCents: true },
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { amountCents: true, interval: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CLIENT"] } },
      }),
      prisma.service.count({ where: { status: "ACTIVE" } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    const totalInvoicedCents = invoicesAggregate._sum.totalAmountCents || 0;
    const mrrCents = subscriptions.reduce((acc, s) => {
      return acc + (s.interval === "YEAR" ? Math.round(s.amountCents / 12) : s.amountCents);
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        registeredClients,
        totalSalesCount,
        totalInvoicedCents,
        mrrCents,
        pendingOrdersCount,
        activeSubscriptionsCount,
        openTicketsCount,
        operationalServicesCount,
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        user: log.user?.name || log.user?.email || "Sistema / Superadmin",
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    console.error("Admin overview error:", err);
    return NextResponse.json(
      { error: "Error al obtener indicadores reales de administración" },
      { status: 500 }
    );
  }
}
