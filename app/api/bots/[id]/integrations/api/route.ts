import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const key = (id: string) => `integration:api:${id}`;
const schema = z.object({
  name: z.string().trim().min(1).max(100),
  enabled: z.boolean().default(true),
  discordWebhookUrl: z.string().url().refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && ["discord.com", "discordapp.com"].includes(url.hostname) &&
        /^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) &&
        !url.search && !url.hash && !url.username && !url.password;
    } catch { return false; }
  }, "Introduce una URL de webhook oficial de Discord"),
});
async function authorize(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const now = new Date();
  const bot = await prisma.botInstance.findFirst({ where: { id, service: {
    userId: user.id, serviceType: "DISCORD_BOT", status: "ACTIVE",
    subscriptions: { some: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] },
      currentPeriodStart: { lte: now }, currentPeriodEnd: { gt: now } } },
  } }, select: { id: true } });
  if (!bot) return { error: NextResponse.json({ error: "Suscripción o instancia no disponible" }, { status: 403 }) };
  return { bot };
}
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const stored = await prisma.setting.findUnique({ where: { key: key(params.id) } });
  if (!stored) return NextResponse.json({ configured: false });
  const data = JSON.parse(stored.value);
  return NextResponse.json({ configured: true, enabled: data.enabled, name: data.name,
    webhookPath: `/api/integrations/events/${data.integrationId}` });
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Configuración inválida", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const stored = await prisma.setting.findUnique({ where: { key: key(params.id) } });
  const old = stored ? JSON.parse(stored.value) : null;
  const signingSecret = randomBytes(32).toString("hex");
  const integrationId = old?.integrationId || randomUUID();
  const record = {
    integrationId, botId: params.id, name: parsed.data.name, enabled: parsed.data.enabled,
    discordWebhookEncrypted: encryptSecret(parsed.data.discordWebhookUrl),
    signingSecretEncrypted: encryptSecret(signingSecret),
  };
  await prisma.setting.upsert({ where: { key: key(params.id) },
    create: { key: key(params.id), category: "CUSTOM_API_INTEGRATION", value: JSON.stringify(record) },
    update: { value: JSON.stringify(record) },
  });
  return NextResponse.json({ success: true, webhookPath: `/api/integrations/events/${integrationId}`,
    signingSecret, message: "Copia el secreto ahora. Guardar de nuevo lo rota y exige actualizar el emisor." });
}
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if (access.error) return access.error;
  await prisma.setting.deleteMany({ where: { key: key(params.id) } });
  return NextResponse.json({ success: true });
}
