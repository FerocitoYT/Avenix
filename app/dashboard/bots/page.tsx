"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Shield,
  Ticket,
  UserCheck,
  Palette,
  Server,
  Play,
  Square,
  RotateCw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Terminal,
  Activity,
  HardDrive,
  Users,
  Eye,
  Settings,
  Lock,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  securityConfig?: any;
  welcomeConfig?: any;
  ticketCategories?: any[];
  _count?: {
    tickets: number;
    modCases: number;
  };
}

export default function BotControlDashboardPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"security" | "tickets" | "welcome" | "studio" | "custom_bot">("security");
  const [loading, setLoading] = useState<boolean>(true);
  const [hostStatus, setHostStatus] = useState<{status:string;lastPingAt:string|null}|null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Security State
  const [security, setSecurity] = useState({
    antiSpamEnabled: true,
    spamThreshold: 5,
    spamTimeWindow: 5,
    antiSpamAction: "TIMEOUT",
    antiRaidEnabled: false,
    raidThreshold: 10,
    raidTimeWindow: 10,
    isSimulationMode: false,
    modLogChannelId: "",
  });
  const [modCases, setModCases] = useState<any[]>([]);

  // Tickets State
  const [ticketCategories, setTicketCategories] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📩");

  // Welcome State
  const [welcome, setWelcome] = useState({
    welcomeEnabled: true,
    welcomeChannelId: "",
    welcomeMessage: "¡Bienvenido {user} a **{server}**! Eres el miembro #{memberCount}.",
    leaveEnabled: false,
    leaveChannelId: "",
    leaveMessage: "{user} ha abandonado el servidor.",
    autoRoleId: "",
    autoRoleName: "",
  });

  // Embed Studio State
  const [embed, setEmbed] = useState({
    name: "Anuncio Oficial",
    title: "⚡ Anuncio de la Comunidad",
    description: "Este es un mensaje interactivo diseñado desde el **Studio de Avenix Control**.\nPuedes personalizar colores, campos y botones con actualización en vivo.",
    color: "#3B82F6",
    authorName: "Avenix Development",
    authorIcon: "",
    footerText: "Avenix Control • Enterprise Discord System",
    thumbnailUrl: "",
    imageUrl: "",
    fields: [
      { name: "🛡️ Seguridad", value: "Protegido por Avenix Shield", inline: true },
      { name: "🎫 Soporte", value: "Tickets 24/7 disponibles", inline: true },
    ],
  });

  // Custom Bot Instance State
  const [customBot, setCustomBot] = useState({
    applicationId: "",
    botName: "",
    botToken: "",
    tokenMask: "",
    statusText: "Avenix Control | /help",
    activityType: "WATCHING",
    status: "STOPPED",
    memoryUsageMb: 0,
    pingMs: 0,
  });
  const [customLogs, setCustomLogs] = useState<any[]>([]);

  // This indicator shows the actual host-observed state, never a hardcoded Online label.
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/client/bot-config", { cache: "no-store" });
        if (!response.ok) throw new Error("Status unavailable");
        const data = await response.json();
        const bot = selectedGuildId ? data.services?.find((s: any) => s.bot?.guildId === selectedGuildId)?.bot : data.services?.find((s: any) => s.bot)?.bot;
        if (active) setHostStatus(bot ? { status: bot.observedStatus || "OFFLINE", lastPingAt: bot.lastPingAt } : null);
      } catch { if (active) setHostStatus(null); }
    };
    void refresh();
    const interval = setInterval(() => void refresh(), 10000);
    return () => { active = false; clearInterval(interval); };
  }, [selectedGuildId]);

  // Load all guilds
  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bot/guilds");
      const data = await res.json();
      if (data.success && data.guilds?.length > 0) {
        setGuilds(data.guilds);
        setSelectedGuildId(data.guilds[0].id);
        loadGuildDetails(data.guilds[0].id);
      }
    } catch (err) {
      console.error("Error al cargar servidores:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuildDetails = async (guildId: string) => {
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}`);
      const data = await res.json();
      if (data.success && data.guild) {
        const g = data.guild;
        if (g.securityConfig) {
          setSecurity({
            antiSpamEnabled: g.securityConfig.antiSpamEnabled ?? true,
            spamThreshold: g.securityConfig.spamThreshold ?? 5,
            spamTimeWindow: g.securityConfig.spamTimeWindow ?? 5,
            antiSpamAction: g.securityConfig.antiSpamAction ?? "TIMEOUT",
            antiRaidEnabled: g.securityConfig.antiRaidEnabled ?? false,
            raidThreshold: g.securityConfig.raidThreshold ?? 10,
            raidTimeWindow: g.securityConfig.raidTimeWindow ?? 10,
            isSimulationMode: g.securityConfig.isSimulationMode ?? false,
            modLogChannelId: g.securityConfig.modLogChannelId || "",
          });
        }
        if (g.welcomeConfig) {
          setWelcome({
            welcomeEnabled: g.welcomeConfig.welcomeEnabled ?? true,
            welcomeChannelId: g.welcomeConfig.welcomeChannelId || "",
            welcomeMessage: g.welcomeConfig.welcomeMessage || "",
            leaveEnabled: g.welcomeConfig.leaveEnabled ?? false,
            leaveChannelId: g.welcomeConfig.leaveChannelId || "",
            leaveMessage: g.welcomeConfig.leaveMessage || "",
            autoRoleId: g.autoRoles?.[0]?.roleId || "",
            autoRoleName: g.autoRoles?.[0]?.roleName || "",
          });
        }
        setTicketCategories(g.ticketCategories || []);
        setModCases(data.recentModCases || []);
        setRecentTickets(data.recentTickets || []);

        if (g.customBot) {
          setCustomBot(g.customBot);
        }
      }
    } catch (err) {
      console.error("Error al cargar detalles de servidor:", err);
    }
  };

  const handleGuildChange = (id: string) => {
    setSelectedGuildId(id);
    loadGuildDetails(id);
  };

  const notifySave = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const saveSecurity = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bot/guilds/${selectedGuildId}/security`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(security),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.fields ? Object.values(result.fields).flat().join(". ") || result.error : result.error || "No se pudieron guardar los cambios");
      notifySave("Configuración de seguridad guardada correctamente.");
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Error guardando la configuración");
    } finally {
      setSaving(false);
    }
  };

  const saveWelcome = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bot/guilds/${selectedGuildId}/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(welcome),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.fields ? Object.values(result.fields).flat().join(". ") || result.error : result.error || "No se pudieron guardar los cambios");
      notifySave("Configuración de bienvenidas guardada correctamente.");
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Error guardando la configuración");
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async () => {
    if (!selectedGuildId || !newCategoryName) return;
    try {
      const res = await fetch(`/api/bot/guilds/${selectedGuildId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CATEGORY",
          name: newCategoryName,
          emoji: newCategoryEmoji,
        }),
      });
      const data = await res.json();
      if (data.success && data.category) {
        setTicketCategories((prev) => [...prev, data.category]);
        setNewCategoryName("");
        notifySave("Categoría creada con éxito.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!selectedGuildId) return;
    try {
      const res = await fetch(`/api/bot/guilds/${selectedGuildId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_CATEGORY",
          categoryId,
        }),
      });
      if (res.ok) {
        setTicketCategories((prev) => prev.filter((c) => c.id !== categoryId));
        notifySave("Categoría eliminada.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveCustomBot = async () => {
    if (!selectedGuildId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bot/custom-instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuildId,
          applicationId: customBot.applicationId,
          botName: customBot.botName,
          botToken: customBot.botToken,
          statusText: customBot.statusText,
          activityType: customBot.activityType,
        }),
      });
      if (res.ok) {
        notifySave("Instancia personalizada actualizada y cifrada (AES-256-GCM).");
        loadGuildDetails(selectedGuildId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const currentGuild = guilds.find((g) => g.id === selectedGuildId);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <Link href="/dashboard/bots/configuracion" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">⚙ Configurar mi bot (token e ID de cliente)</Link>
      <Link href="/dashboard/bots/tickets" className="ml-3 inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">🎫 Configurar paneles y tickets</Link>
      {/* Header & Server Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Avenix Control — Panel del Bot
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${hostStatus?.status === "RUNNING" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : hostStatus?.status === "RESTARTING" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700"}`} title={hostStatus?.lastPingAt ? `Última confirmación: ${new Date(hostStatus.lastPingAt).toLocaleString("es-ES")}` : "Sin confirmación reciente de Discloud"}>
              {hostStatus?.status === "RUNNING" ? "Conectado" : hostStatus?.status === "RESTARTING" ? "Iniciando" : hostStatus?.status === "STOPPED" ? "Detenido" : hostStatus?.status === "ERROR" ? "Error de conexión" : "Sin conexión"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configuración integral en tiempo real: Seguridad, Tickets, Bienvenidas, Studio y Bot White-label.
          </p>
        </div>

        {/* Server Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {guilds.length > 0 ? (
            <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs">
              <Server className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 font-medium">Servidor:</span>
              <select
                value={selectedGuildId}
                onChange={(e) => handleGuildChange(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                {guilds.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>No hay servidores registrados aún. Usa /ping o invita el bot a un servidor.</span>
            </div>
          )}

          <a
            href="https://discord.com/oauth2/authorize?client_id=1442111100064501902&scope=bot+applications.commands&permissions=8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#5865F2]/20"
          >
            <Bot className="w-4 h-4" />
            <span>Invitar Bot a Servidor</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: "security", label: "Seguridad & AutoMod", icon: Shield },
          { id: "tickets", label: "Sistema de Tickets", icon: Ticket },
          { id: "welcome", label: "Bienvenidas & AutoRoles", icon: UserCheck },
          { id: "studio", label: "Studio de Embeds", icon: Palette },
          { id: "custom_bot", label: "Bot Personalizado", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SEGURIDAD & AUTOMOD */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AntiSpam Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Filtro Anti-Spam Inteligente</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.antiSpamEnabled}
                    onChange={(e) => setSecurity({ ...security, antiSpamEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Umbral de Mensajes permitidos ({security.spamThreshold} mensajes):
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={security.spamThreshold}
                    onChange={(e) => setSecurity({ ...security, spamThreshold: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Ventana de Tiempo ({security.spamTimeWindow} segundos):
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={security.spamTimeWindow}
                    onChange={(e) => setSecurity({ ...security, spamTimeWindow: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Acción automática al detectar infracción:</label>
                  <select
                    value={security.antiSpamAction}
                    onChange={(e) => setSecurity({ ...security, antiSpamAction: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="TIMEOUT">Aislamiento Temporal (Timeout 5 min)</option>
                    <option value="WARN">Registrar Advertencia Formal (/warn)</option>
                    <option value="KICK">Expulsar del Servidor (Kick)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulation Mode & AntiRaid */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Modo Simulación (Shadow Audit)</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.isSimulationMode}
                    onChange={(e) => setSecurity({ ...security, isSimulationMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Cuando el **Modo Simulación** está activo, Avenix Bot registrará cualquier infracción detectada (spam, menciones masivas o raids) en los logs de auditoría sin aplicar sanciones reales a los usuarios. Ideal para calibrar reglas antes de aplicarlas en producción.
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Escudo Anti-Raid</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.antiRaidEnabled}
                      onChange={(e) => setSecurity({ ...security, antiRaidEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bloquea temporalmente el servidor si detecta más de 10 nuevos miembros en 10 segundos.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSecurity}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Configuración de Seguridad"}</span>
            </button>
          </div>

          {/* Recent ModCases Table */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Expedientes Disciplinarios Recientes (/cases)</h3>
            {modCases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-2">Caso #</th>
                      <th className="pb-2">Acción</th>
                      <th className="pb-2">Usuario Sancionado</th>
                      <th className="pb-2">Moderador</th>
                      <th className="pb-2">Motivo</th>
                      <th className="pb-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {modCases.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 font-mono text-blue-400">#{c.caseNumber}</td>
                        <td className="py-2.5 font-bold">{c.action}</td>
                        <td className="py-2.5">{c.targetTag}</td>
                        <td className="py-2.5 text-slate-400">{c.moderatorTag}</td>
                        <td className="py-2.5 text-slate-300 truncate max-w-xs">{c.reason}</td>
                        <td className="py-2.5 text-slate-500">{new Date(c.createdAt).toLocaleDateString("es-ES")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No hay sanciones registradas en este servidor todavía.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SISTEMA DE TICKETS */}
      {activeTab === "tickets" && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-7 space-y-4">
          <h3 className="text-xl font-bold text-white">🎫 Configuración completa del sistema de tickets</h3>
          <p className="text-sm text-slate-400">Configura desde la web dónde se publicará el panel, su embed, los botones de apertura, categorías privadas, roles de soporte y preguntas para los usuarios. El bot aplica los cambios automáticamente en Discord.</p>
          <Link href="/dashboard/bots/tickets" className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
            Abrir editor de tickets
          </Link>
        </div>
      )}

      {/* TAB 3: BIENVENIDAS & AUTOROLES */}
      {activeTab === "welcome" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Welcome Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Mensaje de Bienvenida</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={welcome.welcomeEnabled}
                    onChange={(e) => setWelcome({ ...welcome, welcomeEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">ID del Canal de Bienvenida:</label>
                  <input
                    type="text"
                    value={welcome.welcomeChannelId}
                    onChange={(e) => setWelcome({ ...welcome, welcomeChannelId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
                    placeholder="Ej. 123456789012345678"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Plantilla de Mensaje:</label>
                  <textarea
                    rows={4}
                    value={welcome.welcomeMessage}
                    onChange={(e) => setWelcome({ ...welcome, welcomeMessage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Variables: <code className="text-blue-400">{"{user}"}</code>, <code className="text-blue-400">{"{server}"}</code>, <code className="text-blue-400">{"{memberCount}"}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* AutoRoles Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">AutoRoles al Unirse</h3>
                <p className="text-xs text-slate-400">Asigna automáticamente un rol a cada nuevo miembro.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">ID del Rol a otorgar:</label>
                  <input
                    type="text"
                    value={welcome.autoRoleId}
                    onChange={(e) => setWelcome({ ...welcome, autoRoleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
                    placeholder="Ej. 987654321098765432"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nombre o Etiqueta del Rol:</label>
                  <input
                    type="text"
                    value={welcome.autoRoleName}
                    onChange={(e) => setWelcome({ ...welcome, autoRoleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
                    placeholder="Ej. Miembro"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveWelcome}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Configuración de Bienvenidas"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: STUDIO DE EMBEDS */}
      {activeTab === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Editor */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Editor de Diseño Visual</h3>

            <div>
              <label className="text-slate-400 block mb-1">Título del Embed:</label>
              <input
                type="text"
                value={embed.title}
                onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Descripción (Markdown soportado):</label>
              <textarea
                rows={4}
                value={embed.description}
                onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Color de Acento Hex:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={embed.color}
                    onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={embed.color}
                    onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Autor / Encabezado:</label>
                <input
                  type="text"
                  value={embed.authorName}
                  onChange={(e) => setEmbed({ ...embed, authorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Pie de Página (Footer):</label>
              <input
                type="text"
                value={embed.footerText}
                onChange={(e) => setEmbed({ ...embed, footerText: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none"
              />
            </div>
          </div>

          {/* Live Preview Discord Dark Mockup */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Previsualización en Vivo de Discord</span>
            </h3>

            {/* Discord Embed Container */}
            <div className="bg-[#2B2D31] p-4 rounded-lg font-sans text-slate-100 max-w-md shadow-2xl border-l-4" style={{ borderColor: embed.color }}>
              {embed.authorName && (
                <p className="text-xs font-semibold text-slate-300 mb-1">{embed.authorName}</p>
              )}
              {embed.title && (
                <h4 className="text-sm font-bold text-white mb-2">{embed.title}</h4>
              )}
              {embed.description && (
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                  {embed.description}
                </p>
              )}
              {embed.fields.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {embed.fields.map((f, i) => (
                    <div key={i} className="bg-[#1E1F22] p-2 rounded">
                      <p className="text-[11px] font-bold text-slate-300">{f.name}</p>
                      <p className="text-[11px] text-slate-400">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {embed.footerText && (
                <p className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-2">
                  {embed.footerText}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BOT PERSONALIZADO — real hosted instances only */}
      {activeTab === "custom_bot" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Credenciales y actividad del bot</h3>
            <p className="text-sm text-slate-400">Configura el Client ID, servidor, token y presencia (Jugando, Viendo, Escuchando o Compitiendo). Estos datos se aplican al bot alojado en Discloud.</p>
            <Link href="/dashboard/bots/configuracion" className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
              Configurar mi bot y su actividad
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Estado real de la instancia</h3>
            <p className="text-2xl font-bold text-white">{hostStatus?.status === "RUNNING" ? "Conectado" : hostStatus?.status === "RESTARTING" ? "Iniciando" : hostStatus?.status === "STOPPED" ? "Detenido" : hostStatus?.status === "ERROR" ? "Error" : "Sin comunicación"}</p>
            <p className="text-sm text-slate-400">Última confirmación del proceso: {hostStatus?.lastPingAt ? new Date(hostStatus.lastPingAt).toLocaleString("es-ES") : "Todavía no recibida"}</p>
            <p className="text-xs text-slate-500">La web no muestra ping, memoria ni versión inventados. El estado depende del heartbeat de Discloud.</p>
          </div>
        </div>
      )}
    </div>
  );
}
