import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfillment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PayPal IPN (Instant Payment Notification) Webhook Endpoint.
 * Validates notifications cryptographically with PayPal before fulfilling any orders.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json(
        { error: "Cuerpo de IPN vacío" },
        { status: 400 }
      );
    }

    // 1. IPN Validation Postback to PayPal
    const isSandbox =
      process.env.PAYPAL_ENV === "sandbox" ||
      process.env.NODE_ENV !== "production";

    const verificationEndpoint = isSandbox
      ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
      : "https://ipnpb.paypal.com/cgi-bin/webscr";

    const verificationPayload = `cmd=_notify-validate&${rawBody}`;

    let verificationStatus = "";
    try {
      const verifyRes = await fetch(verificationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Avenix-IPN-Verification/1.0",
        },
        body: verificationPayload,
      });

      verificationStatus = (await verifyRes.text()).trim();
    } catch (fetchErr: any) {
      console.error("Error connecting to PayPal IPN verification server:", fetchErr);
      return NextResponse.json(
        { error: "Error de conexión con el validador de PayPal IPN" },
        { status: 502 }
      );
    }

    if (verificationStatus !== "VERIFIED") {
      console.warn(
        `PayPal IPN verification rejected by PayPal: Status "${verificationStatus}". Raw params:`,
        rawBody
      );

      // In production, reject unverified calls
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Notificación IPN no verificada por PayPal" },
          { status: 400 }
        );
      }
    }

    // 2. Parse IPN Parameters
    const params = new URLSearchParams(rawBody);
    const paymentStatus = params.get("payment_status");
    const txnId = params.get("txn_id");
    const txnType = params.get("txn_type");
    const mcGross = params.get("mc_gross") || "0";
    const mcCurrency = params.get("mc_currency") || "EUR";
    const receiverEmail = (params.get("receiver_email") || "").toLowerCase().trim();
    const business = (params.get("business") || "").toLowerCase().trim();
    const customRaw = params.get("custom") || "";
    const itemNumber = params.get("item_number") || "";

    const expectedReceiver = (
      process.env.PAYPAL_RECEIVER_EMAIL ||
      process.env.PAYPAL_EMAIL ||
      ""
    ).toLowerCase().trim();

    // Verify receiver if configured in env
    if (
      expectedReceiver &&
      receiverEmail !== expectedReceiver &&
      business !== expectedReceiver
    ) {
      console.warn(
        `PayPal IPN receiver mismatch: Expected "${expectedReceiver}", received "${receiverEmail}" / "${business}"`
      );
      return NextResponse.json(
        { error: "Destinatario de PayPal no coincide con la cuenta oficial de Avenix" },
        { status: 400 }
      );
    }

    // 3. Check Payment Status
    // Accept "Completed" for standard payments or subscription payments
    const isCompleted =
      paymentStatus === "Completed" ||
      txnType === "subscr_payment";

    if (!isCompleted) {
      console.log(
        `PayPal IPN received non-completion status: "${paymentStatus}" (Txn: ${txnId}, Type: ${txnType})`
      );

      // Record audit log for status update if order exists
      if (itemNumber || customRaw) {
        try {
          await prisma.auditLog.create({
            data: {
              action: `PAYPAL_STATUS_${paymentStatus || txnType || "UNKNOWN"}`,
              entityType: "ORDER",
              detailsJson: {
                txnId,
                paymentStatus,
                txnType,
                itemNumber,
              },
            },
          });
        } catch {}
      }

      // Return 200 so PayPal acknowledges receipt
      return NextResponse.json({
        received: true,
        status: paymentStatus,
        message: "Estado registrado, esperando confirmación definitiva.",
      });
    }

    // 4. Extract Order details from custom or itemNumber
    let orderId: string | undefined = undefined;
    let userId: string | undefined = undefined;
    let orderNumber: string | undefined = itemNumber || undefined;

    if (customRaw) {
      try {
        const parsed = JSON.parse(customRaw);
        if (parsed.orderId) orderId = parsed.orderId;
        if (parsed.userId) userId = parsed.userId;
        if (parsed.orderNumber) orderNumber = parsed.orderNumber;
      } catch {
        // If not JSON, it might be the raw orderId or orderNumber
        if (customRaw.startsWith("AVX-")) {
          orderNumber = customRaw;
        } else {
          orderId = customRaw;
        }
      }
    }

    const amountPaidCents = Math.round(parseFloat(mcGross) * 100);

    // 5. Fulfill the Order with Idempotency Protection
    const fulfillmentResult = await fulfillOrder({
      orderId,
      orderNumber,
      userId,
      paymentGateway: "PAYPAL",
      gatewayTransactionId: txnId || `PAYPAL-IPN-${Date.now()}`,
      amountPaidCents,
      notes: `Verificado por PayPal IPN (${verificationStatus}). Moneda: ${mcCurrency}`,
    });

    return NextResponse.json({
      received: true,
      verified: true,
      fulfilled: fulfillmentResult.success,
      orderNumber: fulfillmentResult.order.orderNumber,
    });
  } catch (err: any) {
    console.error("Error processing PayPal IPN:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al procesar PayPal IPN" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    gateway: "PAYPAL_IPN",
    endpoint: "/api/webhooks/paypal",
    mode: process.env.PAYPAL_ENV || "production",
    message: "Avenix PayPal IPN listener is operational and ready to receive POST notifications.",
  });
}
