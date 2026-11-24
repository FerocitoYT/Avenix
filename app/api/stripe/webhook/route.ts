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

        // Fulfill using centralized fulfillment engine
        await fulfillOrder({
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
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Manage recurring renewal payment
        try {
          if (invoice.subscription) {
            const subscription = await prisma.subscription.findFirst({
              where: { stripeSubscriptionId: invoice.subscription as string },
            });

            if (subscription) {
              await queuePaymentLogsForUser({
                userId:subscription.userId,
                title:"Renovación pagada",
                description:`Stripe ha confirmado una renovación de ${((invoice.amount_paid||0)/100).toFixed(2)} €.`,
                metadata:{stripeInvoiceId:invoice.id,subscriptionId:subscription.id}
              });
              // Extend period
              const newEnd = new Date();
              if (subscription.interval === "YEAR") {
                newEnd.setFullYear(newEnd.getFullYear() + 1);
              } else {
                newEnd.setMonth(newEnd.getMonth() + 1);
              }

              await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  status: "ACTIVE",
                  currentPeriodEnd: newEnd,
                },
              });
            }
          }

          await prisma.auditLog.create({
            data: {
              action: "STRIPE_INVOICE_PAYMENT_SUCCEEDED",
              entityType: "INVOICE",
              detailsJson: {
                stripeInvoiceId: invoice.id,
                amountPaid: invoice.amount_paid,
                subscription: invoice.subscription,
              },
            },
          });
        } catch (subErr) {
          console.error("Error updating subscription period from invoice:", subErr);
        }
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
