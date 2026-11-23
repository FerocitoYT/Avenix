import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const key = (id: string) => `integration:woocommerce:${id}`;
const input = z.object({
  storeName: z.string().trim().min(1).max(100),
  discordWebhookUrl: z.string().url().refine(value => {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && ["discord.com", "discordapp.com"].includes(u.hostname) &&
        /^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(u.pathname) &&
        !u.username && !u.password && !u.search && !u.hash;
    } catch { return false; }
  }, "Debes indicar una URL de webhook oficial de Discord"),
  enabled: z.boolean().default(true),
});
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
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const setting = await prisma.setting.findUnique({ where: { key: key(params.id) } });
  if (!setting) return NextResponse.json({ configured: false });
  const data = JSON.parse(setting.value);
  return NextResponse.json({
    configured: true, enabled: data.enabled, storeName: data.storeName,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/integrations/woocommerce/${data.integrationId}`,
    discordDestinationConfigured: true,
  });
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos de integración inválidos", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const existing = await prisma.setting.findUnique({ where: { key: key(params.id) } });
  const old = existing ? JSON.parse(existing.value) : null;
  const secret = randomBytes(32).toString("hex");
  const integrationId = old?.integrationId || randomUUID();
  const record = {
    integrationId, botId: params.id, storeName: parsed.data.storeName,
    enabled: parsed.data.enabled, discordWebhookEncrypted: encryptSecret(parsed.data.discordWebhookUrl),
    signingSecretEncrypted: encryptSecret(secret),
  };
  await prisma.setting.upsert({
    where: { key: key(params.id) },
    create: { key: key(params.id), category: "WOOCOMMERCE_INTEGRATION", value: JSON.stringify(record) },
    update: { value: JSON.stringify(record) },
  });
  return NextResponse.json({
    success: true,
    webhookPath: `/api/integrations/woocommerce/${integrationId}`,
    signingSecret: secret,
    message: "Guarda el secreto ahora: no volverá a mostrarse. Actualizar esta integración rota el secreto y debes cambiarlo en WooCommerce.",
  });
}
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  await prisma.setting.deleteMany({ where: { key: key(params.id) } });
  return NextResponse.json({ success: true });
}
