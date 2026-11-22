import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  priceId: z.string(),
  productName: z.string(),
  amountCents: z.number().int().positive(),
  billingType: z.enum(["ONE_TIME", "RECURRING"]),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para procesar una contratación o pago." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: validated.billingType === "RECURRING" ? "subscription" : "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: validated.productName,
              description: `Servicio oficial Avenix — Ref: ${validated.priceId}`,
            },
            unit_amount: validated.amountCents,
            ...(validated.billingType === "RECURRING"
              ? { recurring: { interval: "month" } }
              : {}),
          },
          quantity: 1,
        },
      ],
      success_url: validated.successUrl || `${baseUrl}/dashboard/pedidos?success=true`,
      cancel_url: validated.cancelUrl || `${baseUrl}/precios?cancelled=true`,
      metadata: {
        userId: user.id,
        priceId: validated.priceId,
        productName: validated.productName,
      },
      billing_address_collection: "required",
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos incorrectos para el checkout" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Error al generar la sesión de pago de Stripe" },
      { status: 500 }
    );
  }
}
