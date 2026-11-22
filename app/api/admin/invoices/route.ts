import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, taxId: true } },
        subscription: { select: { planName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.user.name,
        clientTaxId: inv.user.taxId || undefined,
        concept: inv.subscription?.planName || "Servicios Tecnológicos Avenix",
        baseAmountCents: inv.amountCents,
        vatAmountCents: inv.vatAmountCents,
        totalAmountCents: inv.totalAmountCents,
        status: inv.status,
        paymentProvider: inv.stripePaymentIntentId ? "STRIPE" : "MANUAL",
        stripeVerified: inv.status === "PAID",
        createdAt: inv.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar facturas" }, { status: 500 });
  }
}
