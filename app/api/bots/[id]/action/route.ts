import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const actionSchema = z.object({ action: z.enum(["START", "STOP", "RESTART"]) });

/**
 * Discloud TYPE=bot does not expose a public HTTP API. Send commands through
 * the shared Neon database; the bot host reconciles within ~10 seconds and
 * updates the observed status when the action is actually applied.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });

    const parsed = actionSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    const { action } = parsed.data;

    const bot = await prisma.botInstance.findUnique({
      where: { id: params.id },
      include: {
        configuration: true,
        service: { include: { subscriptions: true } },
      },
    });
    if (!bot || (user.role !== "ADMIN" && bot.service.userId !== user.id)) {
      return NextResponse.json({ error: "Bot no encontrado" }, { status: 404 });
    }

    if (action !== "STOP") {
      const now = new Date();
      const valid = bot.service.status === "ACTIVE" &&
        bot.service.serviceType === "DISCORD_BOT" &&
        bot.service.subscriptions.some(sub =>
          sub.userId === bot.service.userId &&
          ["ACTIVE", "TRIALING"].includes(sub.status) &&
          sub.currentPeriodStart <= now &&
          sub.currentPeriodEnd > now
        );
      if (!valid) return NextResponse.json({ error: "La suscripción del bot no está vigente" }, { status: 403 });
      if (!bot.botClientId || !bot.guildId || !bot.configuration?.tokenSecretRef) {
        return NextResponse.json({ error: "Configura Client ID, servidor y token antes de iniciar" }, { status: 400 });
      }
    }

    const queuedStatus = action === "STOP" ? "MAINTENANCE" : "RESTARTING";
    await prisma.botInstance.update({
      where: { id: bot.id },
      data: { status: queuedStatus },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `BOT_${action}_REQUESTED`,
        entityType: "BOT",
        entityId: bot.id,
        detailsJson: { action, status: "QUEUED", transport: "NEON" },
      },
    }).catch(error => console.error("[BotAction] Audit log error", error));

    return NextResponse.json({
      accepted: true,
      success: true,
      applied: false,
      action,
      status: queuedStatus,
      message: "Solicitud registrada. Discloud confirmará el resultado cuando procese la orden.",
    }, { status: 202 });
  } catch (error) {
    console.error("[BotAction] Request failed", error);
    return NextResponse.json({ error: "No se pudo enviar la orden al bot" }, { status: 500 });
  }
}
