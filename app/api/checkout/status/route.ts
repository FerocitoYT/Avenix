import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("order");
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id");

    if (!orderNumber && !orderId && !sessionId) {
      return NextResponse.json(
        { error: "Se requiere order, orderId o session_id" },
        { status: 400 }
      );
    }

    let order = null;

    if (orderNumber) {
      order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { invoices: true, services: { include: { botInstance: true } } },
      });
    } else if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { invoices: true, services: { include: { botInstance: true } } },
      });
    }

    // If order was not found directly, but we have a Stripe session ID
    if (!order && sessionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const metaOrderId = session.metadata?.orderId;
        const metaOrderNumber = session.metadata?.orderNumber;

        if (metaOrderId) {
          order = await prisma.order.findUnique({
            where: { id: metaOrderId },
            include: { invoices: true, services: { include: { botInstance: true } } },
          });
        } else if (metaOrderNumber) {
          order = await prisma.order.findUnique({
            where: { orderNumber: metaOrderNumber },
            include: { invoices: true, services: { include: { botInstance: true } } },
          });
        }
      } catch (stripeErr) {
        console.error("Error retrieving Stripe session in status check:", stripeErr);
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // If order is still PENDING, but customer completed Stripe Checkout session:
    // Sync status right away to prevent customer from waiting unnecessarily
    if (order.status === "PENDING" && sessionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          const transactionId = (session.payment_intent as string) || session.id;
          await fulfillOrder({
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            paymentGateway: "STRIPE",
            gatewayTransactionId: transactionId,
            amountPaidCents: session.amount_total || order.totalAmountCents,
            planId: session.metadata?.priceId,
          });

          // Reload order
          order = await prisma.order.findUnique({
            where: { id: order.id },
            include: { invoices: true, services: { include: { botInstance: true } } },
          });
        }
      } catch (syncErr) {
        console.error("Error synchronizing Stripe session status:", syncErr);
      }
    }

    const isPaid = order!.status === "ACCEPTED" || order!.status === "COMPLETED";
    const invoice = order!.invoices?.[0];
    const service = order!.services?.[0];
    const botInstance = service?.botInstance;

    return NextResponse.json({
      success: true,
      orderNumber: order!.orderNumber,
      status: order!.status,
      isPaid,
      totalAmountCents: order!.totalAmountCents,
      currency: order!.currency,
      invoiceNumber: invoice?.invoiceNumber || null,
      invoiceStatus: invoice?.status || null,
      serviceActive: service?.status === "ACTIVE",
      botRunning: botInstance?.status === "RUNNING",
      createdAt: order!.createdAt,
    });
  } catch (err: any) {
    console.error("Error checking order status:", err);
    return NextResponse.json(
      { error: err.message || "Error al comprobar el estado del pedido" },
      { status: 500 }
    );
  }
}
