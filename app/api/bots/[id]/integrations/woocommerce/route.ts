import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { DEFAULT_RULES } from "@/lib/integrations/discord-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prefix = (botId: string) => `integration:woocommerce:${botId}`;
const uuid = z.string().uuid();
const eventRule = z.object({
  event: z.enum(["order.created", "order.updated", "order.deleted"]),
  enabled: z.boolean(),
  title: z.string().trim().max(256).optional(),
  minTotal: z.number().nonnegative().max(1e9).optional(),
  statuses: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});
const webhookUrl = z.string().url().refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["discord.com", "discordapp.com"].includes(url.hostname) &&
      /^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) &&
      !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}, "Webhook de Discord inválido");
const input = z.object({
  integrationId: uuid.optional(),
  storeName: z.string().trim().min(1).max(100),
  discordWebhookUrl: webhookUrl.optional(),
  enabled: z.boolean().default(true),
  rotateSecret: z.boolean().optional(),
  rules: z.array(eventRule).max(3).optional(),
});
type Stored = {
  integrationId: string;
  botId: string;
  storeName: string;
  enabled: boolean;
  rules?: z.infer<typeof eventRule>[];
  signingSecretEncrypted: string;
  discordWebhookEncrypted: string;
};

async function authorize(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({
    where: { id, service: {
      userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
      subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] },
        currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
    } }, select: { id: true },
  });
  if (!bot) return { error: NextResponse.json({ error: "Instancia o suscripción no disponible" }, { status: 403 }) };
  return { bot, user };
}

async function listStores(botId: string) {
  // Legacy key (one store per bot) and new per-store keys coexist.
  const records = await prisma.setting.findMany({
    where: { category: "WOOCOMMERCE_INTEGRATION", key: { startsWith: prefix(botId) } },
    orderBy: { updatedAt: "desc" },
  });
  return records.flatMap(record => {
    try {
      const data = JSON.parse(record.value) as Stored;
      if (data.botId !== botId || !uuid.safeParse(data.integrationId).success) return [];
      return [{ key: record.key, data }];
    } catch { return []; }
  });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const stores = await listStores(params.id);
  const publicStores = stores.map(({ data }) => ({
    integrationId: data.integrationId,
    storeName: data.storeName,
    enabled: data.enabled,
    rules: data.rules || DEFAULT_RULES,
    webhookPath: `/api/integrations/woocommerce/${data.integrationId}`,
    discordDestinationConfigured: Boolean(data.discordWebhookEncrypted),
  }));
  // Maintain compatibility with the original single-store UI/API.
  const first = publicStores[0];
  return NextResponse.json({
    configured: stores.length > 0,
    stores: publicStores,
    ...(first ? {
      integrationId: first.integrationId,
      storeName: first.storeName,
      enabled: first.enabled,
      rules: first.rules,
      webhookUrl: first.webhookPath,
      discordDestinationConfigured: true,
    } : {}),
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({
    error: "Datos de integración inválidos", fields: parsed.error.flatten().fieldErrors,
  }, { status: 400 });

  const data = parsed.data;
  const stores = await listStores(params.id);
  const old = data.integrationId
    ? stores.find(s => s.data.integrationId === data.integrationId)
    : null;
  if (data.integrationId && !old) return NextResponse.json({ error: "Tienda no encontrada en este bot" }, { status: 404 });
  if (!old && stores.length >= 10) return NextResponse.json({ error: "Límite de 10 tiendas por bot alcanzado" }, { status: 409 });
  if (!old && !data.discordWebhookUrl) return NextResponse.json({ error: "Introduce el webhook de Discord" }, { status: 400 });

  const integrationId = old?.data.integrationId || randomUUID();
  const secret = !old || data.rotateSecret ? randomBytes(32).toString("hex") : undefined;
  const record: Stored = {
    integrationId, botId: params.id,
    storeName: data.storeName, enabled: data.enabled,
    rules: data.rules || old?.data.rules || DEFAULT_RULES,
    discordWebhookEncrypted: data.discordWebhookUrl
      ? encryptSecret(data.discordWebhookUrl)
      : old!.data.discordWebhookEncrypted,
    signingSecretEncrypted: secret ? encryptSecret(secret) : old!.data.signingSecretEncrypted,
  };
  const settingKey = old?.key || `${prefix(params.id)}:${integrationId}`;
  await prisma.setting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, category: "WOOCOMMERCE_INTEGRATION", value: JSON.stringify(record) },
    update: { value: JSON.stringify(record) },
  });
  return NextResponse.json({
    success: true, integrationId,
    webhookPath: `/api/integrations/woocommerce/${integrationId}`,
    ...(secret ? { signingSecret: secret } : {}),
    message: secret
      ? "Guarda el secreto ahora y configúralo en WooCommerce. Solo se muestra una vez."
      : "Tienda actualizada sin cambiar el secreto de WooCommerce.",
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const integrationId = new URL(request.url).searchParams.get("integrationId");
  if (!integrationId || !uuid.safeParse(integrationId).success) {
    return NextResponse.json({ error: "Indica qué tienda quieres eliminar" }, { status: 400 });
  }
  const stores = await listStores(params.id);
  const store = stores.find(s => s.data.integrationId === integrationId);
  if (!store) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  // Remove delivery history first via the tenant-specific integration ID, then configuration.
  // Do not remove queued records: the worker will mark undeliverable events FAILED.
  await prisma.setting.delete({ where: { key: store.key } });
  return NextResponse.json({ success: true });
}
