import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Firma de webhook o secreto no configurado" },
      { status: 400 }
    );
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Firma inválida: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle specific webhook event types
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;
        const productName = session.metadata?.productName;

        if (userId) {
          const year = new Date().getFullYear();
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const orderNumber = `AVX-${year}-${randomSuffix}`;
          const invoiceNumber = `FAC-${year}-${randomSuffix}`;

          // Create verified Order & Invoice in Database
          try {
            const order = await prisma.order.create({
              data: {
                orderNumber,
                userId,
                status: "ACCEPTED",
                totalAmountCents: session.amount_total || 0,
                notes: `Pago verificado por Stripe (Session: ${session.id})`,
              },
            });

            // Create Invoice
            const totalCents = session.amount_total || 0;
            const baseCents = Math.round(totalCents / 1.21);
            const vatCents = totalCents - baseCents;

            await prisma.invoice.create({
              data: {
                invoiceNumber,
                userId,
                orderId: order.id,
                amountCents: baseCents,
                vatAmountCents: vatCents,
                totalAmountCents: totalCents,
                status: "PAID",
                stripePaymentIntentId: session.payment_intent as string,
                paidAt: new Date(),
                dueDate: new Date(),
              },
            });

            // Audit log
            await prisma.auditLog.create({
              data: {
                userId,
                action: "STRIPE_CHECKOUT_CONFIRMED_SERVER_SIDE",
                entityType: "ORDER",
                entityId: order.id,
                detailsJson: {
                  orderNumber,
                  invoiceNumber,
                  amount: totalCents,
                },
              },
            });
          } catch (dbErr) {
            console.error("Error creating order/invoice from webhook:", dbErr);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Subscription recurring renewal payment succeeded
        try {
          await prisma.auditLog.create({
            data: {
              action: "STRIPE_INVOICE_PAYMENT_SUCCEEDED",
              entityType: "INVOICE",
              detailsJson: {
                stripeInvoiceId: invoice.id,
                amountPaid: invoice.amount_paid,
              },
            },
          });
        } catch {}
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
        } catch {}
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Error handling Stripe event:", err);
    return NextResponse.json(
      { error: "Error interno al procesar el evento de webhook" },
      { status: 500 }
    );
  }
}
