import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize(botId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: { id: botId, service: {
      userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
      subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] },
        currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
    } },
    select: { id: true },
  });
  if (!bot) return { error: NextResponse.json({ error: "Instancia o suscripción no disponible" }, { status: 403 }) };
  return { bot, user };
}
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const deliveries = await prisma.integrationDelivery.findMany({
    where: { botId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, integrationId: true, provider: true, eventType: true,
      status: true, attempts: true, nextAttemptAt: true,
      lastError: true, deliveredAt: true, createdAt: true,
    },
  });
  const statusCounts = await prisma.integrationDelivery.groupBy({
    by: ["status"], where: { botId: params.id }, _count: { _all: true },
  });
  return NextResponse.json({
    success: true, deliveries,
    totals: Object.fromEntries(statusCounts.map(row => [row.status, row._count._all])),
  });
}

const retrySchema = z.object({ deliveryId: z.string().cuid() });
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const parsed = retrySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Entrega inválida" }, { status: 400 });
  const updated = await prisma.integrationDelivery.updateMany({
    where: { id: parsed.data.deliveryId, botId: params.id, status: "FAILED" },
    data: { status: "PENDING", attempts: 0, nextAttemptAt: new Date(), lastError: null },
  });
  if (!updated.count) return NextResponse.json({ error: "Solo pueden reintentarse entregas fallidas del bot seleccionado" }, { status: 409 });
  return NextResponse.json({ success: true, message: "Entrega añadida a la cola de reintentos" });
}
