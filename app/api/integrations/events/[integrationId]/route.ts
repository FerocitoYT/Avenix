import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { clean } from "@/lib/integrations/discord-events";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });
export async function POST(request: Request, { params }: { params: { integrationId: string } }) {
  if (!uuid.test(params.integrationId)) return error("Integración no encontrada", 404);
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 64_000) return error("Evento demasiado grande", 413);
  const signature = request.headers.get("x-axyon-signature");
  const eventId = request.headers.get("x-axyon-event-id");
  if (!signature || !eventId || !/^[A-Za-z0-9_-]{1,100}$/.test(eventId)) return error("Faltan cabeceras de autenticación", 401);
  const stored = await prisma.setting.findMany({ where: { category: "CUSTOM_API_INTEGRATION" } });
  const entry = stored.map(row => { try { return JSON.parse(row.value); } catch { return null; } })
    .find(config => config?.integrationId === params.integrationId && config.enabled);
  if (!entry) return error("Integración no disponible", 404);
  const secret = decryptSecret(entry.signingSecretEncrypted);
  const expected = createHmac("sha256", secret).update(body).digest();
  if (!/^[a-f0-9]{64}$/i.test(signature)) return error("Firma inválida", 401);
  const received = Buffer.from(signature, "hex");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) return error("Firma inválida", 401);
  let data: Record<string, unknown>;
  try {
    const value = JSON.parse(body);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    data = value;
  } catch { return error("JSON inválido", 400); }
  const type = clean(data.event, 80);
  if (!/^[A-Za-z0-9_.-]{1,80}$/.test(type)) return error("Nombre de evento inválido", 400);
  const now = new Date();
  const active = await prisma.botInstance.findFirst({ where: { id: entry.botId, service: {
    serviceType: "DISCORD_BOT", status: "ACTIVE",
    subscriptions: { some: { userId: { not: "" }, status: { in: ["ACTIVE", "TRIALING"] },
      currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
  } }, select: { id: true } });
  if (!active) return error("Servicio no disponible", 403);
  // Only retain the safe event metadata needed for a Discord notification.
  // Deduplication is enforced by the database, even during concurrent requests.
  try {
    const delivery = await prisma.integrationDelivery.create({
      data: {
        botId: active.id,
        integrationId: params.integrationId,
        eventId,
        provider: "CUSTOM_API",
        eventType: type,
        payload: {
          message: clean(data.message || "Evento recibido desde API", 1000),
          reference: clean(data.reference || eventId, 100),
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, queued: true, deliveryId: delivery.id }, { status: 202 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ success: true, duplicate: true });
    }
    console.error("[Axyon API] Could not enqueue event:", err);
    return error("No se pudo guardar el evento; reintenta con el mismo ID", 503);
  }
}
