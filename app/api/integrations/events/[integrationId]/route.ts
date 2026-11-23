import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { reserveDelivery, finishDelivery, clean } from "@/lib/integrations/discord-events";

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
  const deliveryKey = `integration:api:delivery:${params.integrationId}:${eventId}`;
  const reserved = await reserveDelivery(deliveryKey);
  if (reserved === "duplicate") return NextResponse.json({ success: true, duplicate: true });
  if (reserved === "busy") return error("Entrega en curso", 503);
  try {
    const url = decryptSecret(entry.discordWebhookEncrypted);
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowed_mentions: { parse: [] }, embeds: [{
        title: `🔔 ${type}`, description: clean(data.message || "Evento recibido desde API", 1000),
        color: 0x5865f2, fields: [
          { name: "Origen", value: clean(entry.name, 100), inline: true },
          { name: "Referencia", value: clean(data.reference || eventId, 100), inline: true },
        ], timestamp: new Date().toISOString(), footer: { text: "Axyon Control · API" },
      }] }), signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Discord HTTP ${response.status}`);
    await finishDelivery(deliveryKey, true);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Axyon API events] Delivery failed", err);
    await finishDelivery(deliveryKey, false);
    return error("No se pudo entregar el evento", 503);
  }
}
