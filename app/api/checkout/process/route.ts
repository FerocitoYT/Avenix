import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICIAL_CATALOG } from "@/lib/catalog";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  planId: z.string().min(1, "Plan requerido"),
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Correo electrónico no válido"),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const email = validated.customerEmail.toLowerCase().trim();

    // 1. Identify or create User
    const currentUser=await getCurrentUser();
    if(!currentUser)return NextResponse.json({error:"Inicia sesión o crea una cuenta antes de contratar."},{status:401});
    if(currentUser.email.toLowerCase()!==email)return NextResponse.json({error:"El correo debe coincidir con tu cuenta."},{status:400});
    // 2. Identify Product & Price
    let selectedPrice: any = null;
    let selectedProduct: any = null;

    for (const prod of OFFICIAL_CATALOG) {
      const p = prod.prices.find((pr) => pr.id === validated.planId);
      if (p) {
        selectedPrice = p;
        selectedProduct = prod;
        break;
      }
    }

    // Fallbacks for standard bot plans
    if (!selectedPrice) {
      if (validated.planId === "bot_mensual_9" || validated.planId === "price-bot-monthly") {
        selectedPrice = {
          id: "price-bot-monthly",
          name: "Avenix Bot Mensual",
          billingType: "RECURRING",
          interval: "MONTH",
          priceCents: 900,
          vatIncluded: true,
          vatRatePercent: 21.0,
        };
        selectedProduct = {
          id: "prod-bot-subscription",
          name: "Avenix Bot Multiuso",
          category: "DISCORD_BOT",
        };
      } else if (validated.planId === "bot_anual_70" || validated.planId === "price-bot-annual") {
        selectedPrice = {
          id: "price-bot-annual",
          name: "Avenix Bot Anual",
          billingType: "RECURRING",
          interval: "YEAR",
          priceCents: 7000,
          vatIncluded: true,
          vatRatePercent: 21.0,
        };
        selectedProduct = {
          id: "prod-bot-subscription",
          name: "Avenix Bot Multiuso",
          category: "DISCORD_BOT",
        };
      } else {
        return NextResponse.json(
          { error: "El plan seleccionado no es válido." },
          { status: 400 }
        );
      }
    }

    const totalAmountCents = selectedPrice.priceCents;
    const vatRate = selectedPrice.vatRatePercent || 21.0;
    const baseAmountCents = Math.round(totalAmountCents / (1 + vatRate / 100));
    const vatAmountCents = totalAmountCents - baseAmountCents;

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AVX-${year}-${randomSuffix}`;
    const invoiceNumber = `FAC-${year}-${randomSuffix}`;

    // 3. Create Pending Order in Neon Database
    // Note: The order stays PENDING and will NOT be activated until Stripe Webhook or PayPal IPN confirms payment!
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: currentUser.id,
        status: "PENDING",
        totalAmountCents,
        currency: "EUR",
        notes: `Pendiente de confirmación de pago vía ${validated.paymentMethod}. ${validated.notes || ""}`.trim(),
      },
    });

    // 4. Create Initial Invoice (status: ISSUED / Unpaid)
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: currentUser.id,
        orderId: order.id,
        amountCents: baseAmountCents,
        vatAmountCents,
        totalAmountCents,
        status: "ISSUED",
        dueDate: new Date(),
        currency: "EUR",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 5. Route to Gateway (Stripe or PayPal)
    if (validated.paymentMethod === "STRIPE") {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey.includes("placeholder")) {
        return NextResponse.json(
          {
            error:
              "La pasarela de Stripe no está configurada aún en las variables de entorno del servidor. Por favor, configura STRIPE_SECRET_KEY o utiliza PayPal.",
          },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: selectedPrice.billingType === "RECURRING" ? "subscription" : "payment",
        customer_email: currentUser.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${selectedProduct.name} — ${selectedPrice.name}`,
                description: `Servicio oficial Avenix con soporte continuo. Ref: ${orderNumber}`,
              },
              unit_amount: totalAmountCents,
              ...(selectedPrice.billingType === "RECURRING"
                ? { recurring: { interval: selectedPrice.interval === "YEAR" ? "year" : "month" } }
                : {}),
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/checkout/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?plan=${validated.planId}&cancelled=true`,
        metadata: {
          orderId: order.id,
          orderNumber,
          userId: currentUser.id,
          priceId: selectedPrice.id,
          productName: selectedProduct.name,
        },
        billing_address_collection: "required",
      });

      const response = NextResponse.json({
        success: true,
        orderNumber,
        redirectUrl: session.url,
      });



      return response;
    }

    if (validated.paymentMethod === "PAYPAL") {
      const isSandbox =
        process.env.PAYPAL_ENV === "sandbox" ||
        process.env.NODE_ENV !== "production";

      const paypalBase = isSandbox
        ? "https://www.sandbox.paypal.com/cgi-bin/webscr"
        : "https://www.paypal.com/cgi-bin/webscr";

      const receiverEmail =
        process.env.PAYPAL_RECEIVER_EMAIL ||
        process.env.PAYPAL_EMAIL ||
        "pagos@avenix.dev";

      const paypalParams = new URLSearchParams({
        cmd: "_xclick",
        business: receiverEmail,
        item_name: `${selectedProduct.name} - ${selectedPrice.name}`,
        item_number: orderNumber,
        amount: (totalAmountCents / 100).toFixed(2),
        currency_code: "EUR",
        no_shipping: "1",
        custom: JSON.stringify({
          orderId: order.id,
          userId: currentUser.id,
          orderNumber,
        }),
        notify_url: `${baseUrl}/api/webhooks/paypal`,
        return: `${baseUrl}/checkout/success?order=${orderNumber}&gateway=paypal`,
        cancel_return: `${baseUrl}/checkout?plan=${validated.planId}&cancelled=true`,
        rm: "2",
        charset: "utf-8",
      });

      const paypalUrl = `${paypalBase}?${paypalParams.toString()}`;

      const response = NextResponse.json({
        success: true,
        orderNumber,
        redirectUrl: paypalUrl,
      });



      return response;
    }

    return NextResponse.json(
      { error: "Método de pago no válido." },
      { status: 400 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos incompletos en el formulario de compra" },
        { status: 400 }
      );
    }
    console.error("Checkout process error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al procesar la contratación." },
      { status: 500 }
    );
  }
}
