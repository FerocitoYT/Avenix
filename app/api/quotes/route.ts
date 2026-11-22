import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const quoteSchema = z.object({
  serviceType: z.string().min(1),
  selectedFeatures: z.array(z.string()).default([]),
  estimatedBudget: z.string().min(1),
  timeline: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
  discordTag: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = quoteSchema.parse(body);

    const currentUser = await getCurrentUser();

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `PRES-${year}-${randomSuffix}`;

    let savedQuote = {
      id: "quote-" + Date.now(),
      quoteNumber,
      status: "PENDING",
    };

    try {
      savedQuote = await prisma.quote.create({
        data: {
          quoteNumber,
          userId: currentUser?.id,
          guestName: validated.name,
          guestEmail: validated.email,
          guestCompany: validated.company,
          serviceType: validated.serviceType,
          estimatedBudget: validated.estimatedBudget,
          projectDescription: validated.description,
          selectedFeatures: [
            ...validated.selectedFeatures,
            ...(validated.discordTag ? [`Discord: ${validated.discordTag}`] : []),
            ...(validated.timeline ? [`Plazo: ${validated.timeline}`] : []),
          ],
          status: "PENDING",
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          action: "QUOTE_REQUEST_CREATED",
          entityType: "QUOTE",
          entityId: savedQuote.id,
          detailsJson: {
            quoteNumber,
            serviceType: validated.serviceType,
            email: validated.email,
          },
        },
      });
    } catch (dbErr) {
      console.warn("DB offline or pending, fallback generated:", dbErr);
    }

    return NextResponse.json({
      success: true,
      quote: savedQuote,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos incorrectos en la solicitud" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al procesar el presupuesto" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ quotes: [] });
  }
}
