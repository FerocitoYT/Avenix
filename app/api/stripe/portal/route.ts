import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: "/dashboard/facturacion",
        mock: true,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Find customer in Stripe by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No se encontró historial previo de pagos en Stripe para este usuario." },
        { status: 404 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${baseUrl}/dashboard/facturacion`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error al conectar con el portal de facturación de Stripe" },
      { status: 500 }
    );
  }
}
