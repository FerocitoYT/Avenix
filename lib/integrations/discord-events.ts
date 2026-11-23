import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

export type EventRule = { event: string; enabled: boolean; title?: string; minTotal?: number; statuses?: string[] };
export type IntegrationConfig = {
  integrationId: string; botId: string; storeName: string; enabled: boolean;
  discordWebhookEncrypted: string; signingSecretEncrypted: string;
  rules?: EventRule[];
};
export const DEFAULT_RULES: EventRule[] = [
  { event: "order.created", enabled: true },
  { event: "order.updated", enabled: true },
  { event: "order.deleted", enabled: false },
];
export function eventAllowed(config: IntegrationConfig, event: string, order: Record<string, unknown>): boolean {
  const rule = (config.rules || DEFAULT_RULES).find(r => r.event === event);
  if (!rule?.enabled) return false;
  if (rule.statuses?.length && !rule.statuses.includes(String(order.status || ""))) return false;
  if (rule.minTotal !== undefined && Number(order.total || 0) < rule.minTotal) return false;
  return true;
}
export function clean(value: unknown, max = 120): string {
  return String(value ?? "").replace(/[@\x00-\x1f\x7f]/g, "").slice(0, max);
}
export async function deliverOrderEmbed(config: IntegrationConfig, topic: string, order: Record<string, unknown>) {
  const fields = [
    { name: "Pedido", value: clean(order.number || order.id, 40) || "Sin ID", inline: true },
    { name: "Estado", value: clean(order.status, 60) || "Desconocido", inline: true },
    { name: "Importe", value: `${clean(order.total, 30) || "—"} ${clean(order.currency, 8)}`, inline: true },
  ];
  const rule = (config.rules || DEFAULT_RULES).find(r => r.event === topic);
  const payload = {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: clean(rule?.title || (topic === "order.created" ? "🛒 Nuevo pedido" : topic === "order.deleted" ? "🗑️ Pedido eliminado" : "📦 Pedido actualizado"), 256),
      description: `Tienda: ${clean(config.storeName, 100)}`,
      color: topic === "order.created" ? 0x22c55e : 0x5865f2,
      fields, footer: { text: "Axyon Control · Ecommerce" },
      timestamp: new Date().toISOString(),
    }],
  };
  const destination = decryptSecret(config.discordWebhookEncrypted);
  const response = await fetch(destination, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Discord HTTP ${response.status}`);
}
export async function reserveDelivery(key: string): Promise<"duplicate" | "busy" | "reserved"> {
  const prior = await prisma.setting.findUnique({ where: { key } });
  if (prior?.value === "sent") return "duplicate";
  if (prior?.value === "processing" && Date.now() - prior.updatedAt.getTime() < 120000) return "busy";
  if (!prior) {
    try { await prisma.setting.create({ data: { key, category: "INTEGRATION_DELIVERY", value: "processing" } }); }
    catch { return "busy"; }
  } else {
    // Conditional update prevents two concurrent retries claiming the same stale reservation.
    const claimed = await prisma.setting.updateMany({
      where: { key, value: prior.value, updatedAt: prior.updatedAt },
      data: { value: "processing" },
    });
    if (!claimed.count) return "busy";
  }
  return "reserved";
}
export async function finishDelivery(key: string, sent: boolean) {
  if (sent) await prisma.setting.update({ where: { key }, data: { value: "sent" } });
  else await prisma.setting.deleteMany({ where: { key, value: "processing" } });
}
