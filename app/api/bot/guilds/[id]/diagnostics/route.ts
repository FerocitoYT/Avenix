import { authorizeGuild } from "@/lib/bot-access";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const access = await authorizeGuild(params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const now = Date.now();
  const [instance, panels, welcome, security, categories] = await Promise.all([
    prisma.botInstance.findFirst({ where: { guildId: params.id, service: { userId: access.user.id, serviceType: "DISCORD_BOT" } }, include: { configuration: { select: { tokenSecretRef: true } } } }),
    prisma.ticketPanel.findMany({ where: { guildId: params.id }, select: { id: true, title: true, channelId: true, messageId: true, _count: { select: { categories: true } } } }),
    prisma.welcomeConfig.findUnique({ where: { guildId: params.id } }),
    prisma.securityConfig.findUnique({ where: { guildId: params.id } }),
    prisma.ticketCategory.count({ where: { guildId: params.id } }),
  ]);
  const heartbeatAgeSeconds = instance?.lastPingAt ? Math.max(0, Math.round((now - instance.lastPingAt.getTime()) / 1000)) : null;
  const connected = instance?.status === "RUNNING" && heartbeatAgeSeconds !== null && heartbeatAgeSeconds <= 90;
  const checks = [
    { key: "instance", label: "Instancia contratada", status: instance ? "ok" : "error", detail: instance ? "Instancia localizada" : "No hay una instancia asociada al servidor" },
    { key: "token", label: "Credenciales", status: instance?.configuration?.tokenSecretRef && instance.botClientId ? "ok" : "error", detail: instance?.configuration?.tokenSecretRef ? "Token configurado y cifrado (no se muestra)" : "Falta configurar el token" },
    { key: "connection", label: "Comunicación con Discloud", status: connected ? "ok" : instance?.status === "RESTARTING" ? "pending" : "error", detail: connected ? "Heartbeat reciente" : `Estado: ${instance?.status || "SIN INSTANCIA"}; último heartbeat: ${heartbeatAgeSeconds ?? "sin datos"} s` },
    { key: "tickets", label: "Paneles de tickets", status: panels.length && panels.every(p => p.messageId && p._count.categories > 0) ? "ok" : "pending", detail: `${panels.filter(p => !!p.messageId).length}/${panels.length} paneles con mensaje registrado; ${categories} categorías` },
    { key: "welcome", label: "Bienvenidas", status: !welcome?.enabled || !!welcome.channelId ? "ok" : "error", detail: welcome?.enabled ? welcome.channelId ? "Canal configurado" : "Activas sin canal de bienvenida" : "Desactivadas" },
    { key: "security", label: "Moderación", status: security ? "ok" : "pending", detail: security ? "Reglas almacenadas en Neon" : "Configuración predeterminada" },
  ];
  return NextResponse.json({
    success: true, instanceId: instance?.id ?? null,
    status: connected ? "CONNECTED" : instance?.status === "RESTARTING" ? "STARTING" : "OFFLINE",
    lastHeartbeatAt: instance?.lastPingAt ?? null,
    checks,
    limitations: [
      "El heartbeat confirma comunicación del host, no prueba que el bot pueda escribir en todos los canales.",
      "Los permisos de Discord, intents y entrega de mensajes requieren una comprobación dentro del servidor.",
    ],
  });
}
