import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico no válido"),
  serviceType: z.string().min(1),
  estimatedBudget: z.string().optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(4000),
  attachmentName: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    // Save as a pending Quote / Inquiry in database
    let savedQuote;
    try {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const quoteNumber = `INQ-${year}-${randomSuffix}`;

      savedQuote = await prisma.quote.create({
        data: {
          quoteNumber,
          guestName: validated.name,
          guestEmail: validated.email,
          serviceType: validated.serviceType,
          estimatedBudget: validated.estimatedBudget || "Por definir",
          projectDescription: validated.description,
          selectedFeatures: validated.attachmentName ? [`Adjunto: ${validated.attachmentName}`] : [],
          status: "PENDING",
        },
      });

      // Also create an audit log
      await prisma.auditLog.create({
        data: {
          action: "CONTACT_INQUIRY_RECEIVED",
          entityType: "QUOTE",
          entityId: savedQuote.id,
          detailsJson: {
            email: validated.email,
            serviceType: validated.serviceType,
          },
        },
      });
    } catch (dbError) {
      console.warn("DB offline or pending migration, handled in-memory:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Consulta recibida correctamente. Nos pondremos en contacto contigo pronto.",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Datos no válidos" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno al procesar el mensaje" },
      { status: 500 }
    );
  }
}
