import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_avenix_2026";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia" as any,
  appInfo: {
    name: "Avenix Platform",
    version: "1.0.0",
  },
});

export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  lineItems,
  successUrl,
  cancelUrl,
  mode = "payment",
  metadata = {},
}: {
  userId: string;
  userEmail: string;
  userName: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  mode?: "payment" | "subscription";
  metadata?: Record<string, string>;
}) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode,
    customer_email: userEmail,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
    billing_address_collection: "required",
    tax_id_collection: {
      enabled: true,
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
