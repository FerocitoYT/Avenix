import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        stripeSubId: s.stripeSubscriptionId || "sub_internal",
        clientName: s.user.name,
        clientEmail: s.user.email,
        planName: s.planName || "Avenix Bot",
        amountCents: s.amountCents,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : undefined,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar suscripciones" }, { status: 500 });
  }
}
