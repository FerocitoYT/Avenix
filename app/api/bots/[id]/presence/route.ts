import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const schema = z.object({
  activityType: z.enum(["PLAYING", "WATCHING", "LISTENING", "COMPETING"]),
  activityText: z.string().trim().min(1).max(128),
  availability: z.enum(["online", "idle", "dnd", "invisible"]),
});

async function authorized(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión" }, { status: 401 }) };
  const bot = await prisma.botInstance.findUnique({
    where: { id },
    include: { service: { include: { subscriptions: true } } },
  });
  if (!bot || (bot.service.userId !== user.id && user.role !== "ADMIN")) {
    return { error: NextResponse.json({ error: "Bot no encontrado" }, { status: 404 }) };
  }
  const now = new Date();
  const valid = bot.service.status === "ACTIVE" && bot.service.serviceType === "DISCORD_BOT" &&
    bot.service.subscriptions.some(s => s.userId === bot.service.userId &&
      ["ACTIVE", "TRIALING"].includes(s.status) && s.currentPeriodStart <= now && s.currentPeriodEnd > now);
  if (!valid) return { error: NextResponse.json({ error: "Suscripción no vigente" }, { status: 403 }) };
  return { bot, user };
}

const keyFor = (id: string) => `bot:presence:${id}`;
const defaults = { activityType: "WATCHING", activityText: "Axyon Control", availability: "online" };

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const access = await authorized(params.id);
  if (access.error) return access.error;
  const setting = await prisma.setting.findUnique({ where: { key: keyFor(params.id) } });
  try {
    return NextResponse.json({ ...defaults, ...(setting ? schema.parse(JSON.parse(setting.value)) : {}) });
  } catch {
    return NextResponse.json(defaults);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const access = await authorized(params.id);
  if (access.error) return access.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado de Discord inválido", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  await prisma.setting.upsert({
    where: { key: keyFor(params.id) },
    create: { key: keyFor(params.id), category: "BOT_PRESENCE", value: JSON.stringify(parsed.data) },
    update: { value: JSON.stringify(parsed.data) },
  });
  return NextResponse.json({ success: true, message: "Presencia guardada. Se aplicará al bot conectado en los próximos segundos.", ...parsed.data });
}
