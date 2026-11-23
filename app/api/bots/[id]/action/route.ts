import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["START", "STOP", "RESTART"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = actionSchema.parse(body);

    const botId = params.id;
    const instance = await prisma.botInstance.findUnique({
      where: { id: botId },
      include: { service: { include: { subscriptions: true } } },
    });
    if (!instance || (instance.service.userId !== user.id && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Bot no encontrado" }, { status: 404 });
    }
    const hasSubscription = instance.service.subscriptions.some(
      (sub) => ["ACTIVE", "TRIALING"].includes(sub.status) && sub.currentPeriodEnd > new Date()
    );
    if (!hasSubscription) {
      return NextResponse.json({ error: "Suscripción no vigente" }, { status: 403 });
    }
    if (!process.env.AVENIX_BOT_API_URL || !process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "Host de bots no configurado" }, { status: 503 });
    }

    const bot = await prisma.botInstance.findUnique({ where: { id: botId }, include: { service: { include: { subscriptions: true } } } });
    if (!bot || (user.role !== "ADMIN" && bot.service.userId !== user.id)) return NextResponse.json({ error: "Bot no encontrado" }, { status: 404 });
    const active = bot.service.subscriptions.some((sub) => (sub.status === "ACTIVE" || sub.status === "TRIALING") && sub.currentPeriodEnd > new Date());
    if (!active) return NextResponse.json({ error: "La suscripción del bot no está vigente" }, { status: 403 });

    // Dispatch to local Avenix Bot API if active
    const botApiUrl = process.env.AVENIX_BOT_API_URL || "http://localhost:4000";
    const internalSecret = process.env.INTERNAL_API_SECRET;
    let dispatchedToBotService = false;

    try {
      const botResponse = await fetch(`${botApiUrl}/api/instances/${botId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(internalSecret ? { Authorization: `Bearer ${internalSecret}` } : {}),
        },
        body: JSON.stringify({ action }),
        signal: AbortSignal.timeout(2000),
      });
      if (botResponse.ok) {
        dispatchedToBotService = true;
      }
    } catch {
      // Handled gracefully if local bot is offline or in development
    }

    if (!dispatchedToBotService) return NextResponse.json({ error: "El host no confirmó la operación. No se ha cambiado el estado del bot.", dispatchedToBotService: false }, { status: 503 });

    if (!dispatchedToBotService) {
      return NextResponse.json({ error: "El host no confirmó la operación" }, { status: 502 });
    }

    // Log the action to audit logs
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: `BOT_CONTAINER_${action}`,
          entityType: "BOT",
          entityId: botId,
          detailsJson: {
            userEmail: user.email,
            action,
            node: "eu-node-01.avenix.dev",
            dispatchedToBotService,
          },
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Acción ${action} enviada a la infraestructura del bot con éxito.`,
      status: action === "STOP" ? "STOPPED" : "RUNNING",
      dispatchedToBotService,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Acción de bot no válida" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno al ejecutar comando de infraestructura" },
      { status: 500 }
    );
  }
}
