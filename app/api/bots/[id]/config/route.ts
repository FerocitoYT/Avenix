import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";
const schema = z.object({
  clientId: z.string().regex(/^\d{17,22}$/),
  guildId: z.string().regex(/^\d{17,22}$/),
  token: z.string().min(20).max(300).optional().or(z.literal("")),
});

async function ownedBot(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const bot = await prisma.botInstance.findUnique({ where: { id }, include: { configuration: true, service: { include: { subscriptions: true } } } });
  if (!bot || (bot.service.userId !== user.id && user.role !== "ADMIN")) return { error: NextResponse.json({ error: "Bot no encontrado" }, { status: 404 }) };
  const valid = bot.service.subscriptions.some(s => ["ACTIVE", "TRIALING"].includes(s.status) && s.currentPeriodEnd > new Date());
  if (!valid) return { error: NextResponse.json({ error: "Suscripción caducada o inactiva" }, { status: 403 }) };
  return { bot };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const result = await ownedBot(params.id);
  if (result.error) return result.error;
  const bot = result.bot!;
  return NextResponse.json({ id: bot.id, name: bot.name, clientId: bot.botClientId || "", guildId: bot.guildId || "", tokenConfigured: !!bot.configuration?.tokenSecretRef, status: bot.status, expiresAt: bot.service.subscriptions.filter(s => ["ACTIVE", "TRIALING"].includes(s.status)).map(s => s.currentPeriodEnd).sort((a,b) => b.getTime()-a.getTime())[0] || null });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const result = await ownedBot(params.id);
  if (result.error) return result.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ID de aplicación, servidor o token inválidos" }, { status: 400 });
  const { clientId, guildId, token } = parsed.data;
  if (token && !process.env.ENCRYPTION_MASTER_KEY) return NextResponse.json({ error: "Falta ENCRYPTION_MASTER_KEY en el servidor" }, { status: 503 });
  const bot = result.bot!;
  const credentialsChanged = bot.botClientId !== clientId || bot.guildId !== guildId || Boolean(token);
  const mustStart = bot.status === "STOPPED" || bot.status === "ERROR";
  const needsReconnect = credentialsChanged || mustStart;
  await prisma.$transaction(async tx => {
    if (credentialsChanged) {
      await tx.botInstance.update({ where: { id: params.id }, data: { botClientId: clientId, guildId, status: "RESTARTING" } });
    } else if (mustStart) {
      await tx.botInstance.update({ where: { id: params.id }, data: { status: "RESTARTING" } });
    }
    await tx.botConfiguration.upsert({
      where: { botInstanceId: params.id },
      create: { botInstanceId: params.id, ...(token ? { tokenSecretRef: encryptSecret(token) } : {}) },
      update: token ? { tokenSecretRef: encryptSecret(token) } : {},
    });
  });
  return NextResponse.json({ success: true, status: needsReconnect ? "RESTARTING" : bot.status,
    message: needsReconnect ? "Configuración guardada. El host procesará el inicio o la reconexión." : "Configuración guardada sin reiniciar el bot." });
}
