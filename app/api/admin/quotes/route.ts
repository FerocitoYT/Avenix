import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      quotes: quotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        guestName: q.guestName,
        guestEmail: q.guestEmail,
        serviceType: q.serviceType,
        estimatedBudget: q.estimatedBudget,
        projectDescription: q.projectDescription,
        selectedFeatures: q.selectedFeatures,
        status: q.status,
        proposedPriceCents: q.proposedPriceCents || undefined,
        adminNotes: q.adminNotes || undefined,
        createdAt: q.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar presupuestos" }, { status: 500 });
  }
}
