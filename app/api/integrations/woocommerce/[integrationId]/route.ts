import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (message: string, status: number) => NextResponse.json({ error: message }, { status });
const supported = new Set(["order.created", "order.updated", "order.deleted"]);
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function str(value: unknown, max = 120): string {
  return String(value ?? "").replace(/[@\x00-\x1f\x7f]/g, "").slice(0, max);
}
export async function POST(request: Request, { params }: { params: { integrationId: string } }) {
  if (!idPattern.test(params.integrationId)) return json("Integración desconocida", 404);
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > 256_000) return json("Evento demasiado grande", 413);
  const signature = request.headers.get("x-wc-webhook-signature");
  const topic = request.headers.get("x-wc-webhook-topic") || "";
  if (!signature || !supported.has(topic)) return json("Evento no admitido", 400);

  // The public UUID is not an authorization credential; only HMAC authenticates WooCommerce.
  const configs = await prisma.setting.findMany({ where: { category: "WOOCOMMERCE_INTEGRATION" } });
  const entry = configs.map(s => {
    try { return { key: s.key, value: JSON.parse(s.value) }; } catch { return null; }
  }).find(v => v?.value.integrationId === params.integrationId);
  if (!entry || !entry.value.enabled) return json("Integración desactivada", 404);

  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: { id: entry.value.botId, service: {
      status: "ACTIVE", serviceType: "DISCORD_BOT",
      subscriptions: { some: { status: { in: ["ACTIVE", "TRIALING"] },
        currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
    } }, select: { id: true },
  });
  if (!bot) return json("Servicio no disponible", 403);

  const secret = decryptSecret(entry.value.signingSecretEncrypted);
  const expected = createHmac("sha256", secret).update(raw).digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, "base64"); } catch { return json("Firma inválida", 401); }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return json("Firma inválida", 401);

  let order: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    order = parsed;
  } catch { return json("JSON inválido", 400); }

  const deliveryId = request.headers.get("x-wc-webhook-delivery-id");
  if (!deliveryId || !/^\d{1,32}$/.test(deliveryId)) return json("Identificador de entrega inválido", 400);
  const dedupeKey = `integration:wc:delivery:${params.integrationId}:${deliveryId}`;
  const prior = await prisma.setting.findUnique({ where: { key: dedupeKey } });
  if (prior?.value === "sent") return NextResponse.json({ success: true, duplicate: true });
  // Reserve before sending to avoid duplicate simultaneous notifications.
  if (!prior) {
    try {
      await prisma.setting.create({ data: { key: dedupeKey, value: "processing", category: "WC_DELIVERY" } });
    } catch { return json("Entrega en curso, reintentar", 503); }
  } else {
    // A retry can recover after a transient Discord error or a crashed invocation.
    if (prior.value === "processing" && Date.now() - prior.updatedAt.getTime() < 120_000) return json("Entrega en curso, reintentar", 503);
    await prisma.setting.update({ where: { key: dedupeKey }, data: { value: "processing" } });
  }

  const orderId = str(order.number || order.id, 40);
  const currency = str(order.currency, 8);
  const total = str(order.total, 30);
  const status = str(order.status, 60);
  const fields = [
    { name: "Pedido", value: orderId || "Sin ID", inline: true },
    { name: "Estado", value: status || "Desconocido", inline: true },
    { name: "Importe", value: `${total || "—"} ${currency}`, inline: true },
  ];
  const payload = {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: topic === "order.created" ? "🛒 Nuevo pedido" : topic === "order.deleted" ? "🗑️ Pedido eliminado" : "📦 Pedido actualizado",
      description: `Tienda: ${str(entry.value.storeName, 100)}`,
      color: topic === "order.created" ? 0x22c55e : 0x5865f2,
      fields,
      footer: { text: "Axyon Control · WooCommerce" },
      timestamp: new Date().toISOString(),
    }],
  };
  try {
    const destination = decryptSecret(entry.value.discordWebhookEncrypted);
    const response = await fetch(destination, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Discord HTTP ${response.status}`);
    await prisma.setting.update({ where: { key: dedupeKey }, data: { value: "sent" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WooCommerce] Error entregando aviso", error);
    // Preserve retry opportunity without disclosing Discord secrets.
    await prisma.setting.deleteMany({ where: { key: dedupeKey, value: "processing" } });
    return json("No se pudo entregar el aviso, reintentar", 503);
  }
}
