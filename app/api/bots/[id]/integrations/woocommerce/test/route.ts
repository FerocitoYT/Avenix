import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const input = z.object({ integrationId: z.string().uuid() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: {
      id: params.id,
      service: {
        userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
        subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] },
          currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
      },
    },
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Instancia o suscripción no disponible" }, { status: 403 });
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tienda inválida" }, { status: 400 });
  const records = await prisma.setting.findMany({
    where: {
      category: "WOOCOMMERCE_INTEGRATION",
      key: { startsWith: `integration:woocommerce:${params.id}` },
    },
  });
  const found = records.some(record => {
    try {
      const config = JSON.parse(record.value);
      return config.botId === params.id &&
        config.integrationId === parsed.data.integrationId && config.enabled;
    } catch { return false; }
  });
  if (!found) return NextResponse.json({ error: "Tienda desactivada o no encontrada" }, { status: 404 });

  const since = new Date(Date.now() - 60_000);
  const recent = await prisma.integrationDelivery.count({
    where: {
      botId: params.id, integrationId: parsed.data.integrationId,
      eventId: { startsWith: "test-" }, createdAt: { gte: since },
    },
  });
  if (recent >= 2) return NextResponse.json({
    error: "Límite de dos pruebas por minuto para esta tienda",
  }, { status: 429 });

  const delivery = await prisma.integrationDelivery.create({
    data: {
      botId: params.id,
      integrationId: parsed.data.integrationId,
      eventId: `test-${randomUUID()}`,
      provider: "WOOCOMMERCE",
      eventType: "order.created",
      payload: { number: "PRUEBA-AXYON", status: "testing", total: "0.00", currency: "EUR" },
    },
    select: { id: true },
  });
  return NextResponse.json({
    success: true, queued: true, deliveryId: delivery.id,
    message: "Prueba encolada. Comprueba Discord y el historial de entregas.",
  }, { status: 202 });
}
