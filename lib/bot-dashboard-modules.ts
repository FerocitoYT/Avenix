export type BotDashboardModule = {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  group: "GENERAL" | "DISCORD" | "AUTOMATION" | "INTEGRATIONS" | "SYSTEM";
  order: number;
  href: (botId: string, guildId?: string | null) => string;
  requiresGuild?: boolean;
};

export const BOT_DASHBOARD_MODULES: BotDashboardModule[] = [
  {
    key: "overview", label: "Resumen del bot", shortLabel: "Resumen",
    description: "Estado, suscripción, conexión, servidor asignado y accesos rápidos.",
    icon: "layout-dashboard", group: "GENERAL", order: 10,
    href: botId => `/dashboard/bot/${botId}`,
  },
  {
    key: "credentials", label: "Configuración general", shortLabel: "Configuración",
    description: "Token, Application ID, servidor, presencia y datos básicos de la instancia.",
    icon: "settings", group: "GENERAL", order: 20,
    href: botId => `/dashboard/bots/configuracion?botId=${encodeURIComponent(botId)}`,
  },
  {
    key: "security", label: "Seguridad y moderación", shortLabel: "Seguridad",
    description: "Antispam, antiraid, simulación y registros de moderación.",
    icon: "shield", group: "DISCORD", order: 30, requiresGuild: true,
    href: botId => `/dashboard/bot/${botId}?section=security`,
  },
  {
    key: "tickets", label: "Tickets", shortLabel: "Tickets",
    description: "Paneles, categorías, formularios, roles de soporte y mensajes.",
    icon: "ticket", group: "DISCORD", order: 40, requiresGuild: true,
    href: (botId, guildId) => `/dashboard/bots/tickets?botId=${encodeURIComponent(botId)}${guildId ? `&guildId=${encodeURIComponent(guildId)}` : ""}`,
  },
  {
    key: "welcome", label: "Bienvenidas y autoroles", shortLabel: "Bienvenidas",
    description: "Mensajes de entrada y salida, mensajes privados y asignación automática de roles.",
    icon: "user-check", group: "DISCORD", order: 50, requiresGuild: true,
    href: (botId, guildId) => `/dashboard/bots/editor?botId=${encodeURIComponent(botId)}&section=welcome${guildId ? `&guildId=${encodeURIComponent(guildId)}` : ""}`,
  },
  {
    key: "verification", label: "Verificación", shortLabel: "Verificación",
    description: "Verificación mediante reacción o cuenta, rol automático y acceso opcional a un servidor destino.",
    icon: "shield", group: "DISCORD", order: 55, requiresGuild: true,
    href: botId => `/dashboard/bot/${botId}?section=verification`,
  },
  {
    key: "studio", label: "Studio de mensajes", shortLabel: "Studio",
    description: "Embeds y mensajes visuales preparados para Discord.",
    icon: "palette", group: "DISCORD", order: 60, requiresGuild: true,
    href: botId => `/dashboard/bot/${botId}?section=studio`,
  },
  {
    key: "automations", label: "Automatizaciones", shortLabel: "Automatizaciones",
    description: "Flujos, condiciones y acciones automáticas del servidor y servicios externos.",
    icon: "workflow", group: "AUTOMATION", order: 70, requiresGuild: true,
    href: (botId, guildId) => `/dashboard/bot/${botId}?section=automations${guildId ? `&guildId=${encodeURIComponent(guildId)}` : ""}`,
  },
  {
    key: "integrations", label: "Ecommerce e integraciones", shortLabel: "Integraciones",
    description: "WooCommerce, APIs externas, webhooks, eventos y próximas integraciones.",
    icon: "shopping-bag", group: "INTEGRATIONS", order: 80,
    href: botId => `/dashboard/bots/integraciones?botId=${encodeURIComponent(botId)}`,
  },
  {
    key: "deliveries", label: "Historial de eventos", shortLabel: "Entregas",
    description: "Notificaciones recibidas, entregas a Discord, errores y reintentos.",
    icon: "history", group: "INTEGRATIONS", order: 90,
    href: botId => `/dashboard/bots/integraciones/historial?botId=${encodeURIComponent(botId)}`,
  },
  {
    key: "logs", label: "Sistema de logs", shortLabel: "Logs",
    description: "Canales separados para registros generales, moderación, tickets, pagos y eventos internos del bot.",
    icon: "history", group: "SYSTEM", order: 95, requiresGuild: true,
    href: botId => `/dashboard/bot/${botId}?section=logs`,
  },
  {
    key: "diagnostics", label: "Diagnóstico", shortLabel: "Diagnóstico",
    description: "Heartbeat, intents, credenciales y estado observado por la infraestructura.",
    icon: "activity", group: "SYSTEM", order: 100, requiresGuild: true,
    href: (botId, guildId) => `/dashboard/bots/diagnostico?botId=${encodeURIComponent(botId)}${guildId ? `&guildId=${encodeURIComponent(guildId)}` : ""}`,
  },
];

export const orderedBotDashboardModules = () =>
  [...BOT_DASHBOARD_MODULES].sort((a, b) => a.order - b.order);
