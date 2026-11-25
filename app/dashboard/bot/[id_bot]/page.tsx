"use client";
import {RestartBotButton} from "@/components/dashboard/restart-bot-button";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {BotTokenWarning} from "@/components/dashboard/bot-token-warning";
import { useParams, useSearchParams } from "next/navigation";
import {
  Activity, Bot, CheckCircle2, Clock3, History, LayoutDashboard, Palette,
  Settings, Shield, ShoppingBag, Ticket, UserCheck, Workflow, AlertCircle,
  Server, CreditCard, ExternalLink,
} from "lucide-react";
import { orderedBotDashboardModules } from "@/lib/bot-dashboard-modules";
import { BotDeliveriesPanel } from "@/components/dashboard/bot-deliveries-panel";
import { BotStudioPanel } from "@/components/dashboard/bot-studio-panel";
import { BotVerificationPanel } from "@/components/dashboard/bot-verification-panel";
import { BotAbsencePanel } from "@/components/dashboard/bot-absence-panel";
import { BotRecruitmentPanel } from "@/components/dashboard/bot-recruitment-panel";
import { BotEmployeesPanel } from "@/components/dashboard/bot-employees-panel";
import { BotAutomationsPanel } from "@/components/dashboard/bot-automations-panel";
import { BotAnalyticsPanel } from "@/components/dashboard/bot-analytics-panel";
import { BotScheduledMessagesPanel } from "@/components/dashboard/bot-scheduled-messages-panel";
import { BotInvitesPanel } from "@/components/dashboard/bot-invites-panel";
import { BotEventsPanel } from "@/components/dashboard/bot-events-panel";
import { BotPollsPanel } from "@/components/dashboard/bot-polls-panel";
import { BotVoicePanel } from "@/components/dashboard/bot-voice-panel";
import { BotPerformancePanel } from "@/components/dashboard/bot-performance-panel";
import { BotSecurityPanel } from "@/components/dashboard/bot-security-panel";
import { BotLogsPanel } from "@/components/dashboard/bot-logs-panel";

type Service = {
  id: string; name: string; planName: string; subscriptionActive: boolean; expiresAt: string | null;
  bot: { id: string; applicationId: string | null; guildId: string | null; guildName?: string | null; guildIcon?: string | null; serverLimit?: number; status: string; observedStatus?: string; lastPingAt?: string | null; tokenConfigured: boolean; tokenHealth?:string|null } | null;
};

const icons: Record<string, any> = {
  "layout-dashboard": LayoutDashboard,
  settings: Settings,
  shield: Shield,
  ticket: Ticket,
  "user-check": UserCheck,
  palette: Palette,
  workflow: Workflow,
  "shopping-bag": ShoppingBag,
  history: History,
  activity: Activity,
};

const groupLabels: Record<string, string> = {
  GENERAL: "General",
  DISCORD: "Discord",
  AUTOMATION: "Automatización",
  INTEGRATIONS: "Integraciones",
  SYSTEM: "Sistema",
};

export default function BotInstanceDashboardPage() {
  const params = useParams<{ id_bot: string }>();
  const searchParams = useSearchParams();
  const botId = params.id_bot;
  const requestedSection = searchParams.get("section") || "overview";
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleSearch,setModuleSearch]=useState("");
  const modules = useMemo(() => orderedBotDashboardModules(), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/client/bot-config", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar tus bots");
        const match = (data.services || []).find((item: Service) => item.bot?.id === botId);
        if (!match) throw new Error("Este bot no pertenece a tu cuenta.");
        if (!match.subscriptionActive) throw new Error("La suscripción de este bot no está vigente.");
        if (active) { setService(match); setError(""); }
      } catch (err) {
        if (active) { setService(null); setError(err instanceof Error ? err.message : "No se pudo abrir el bot"); }
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [botId]);

  const selectedModule = modules.find(module => module.key === requestedSection) || modules[0];

  if (loading) return <main className="p-6 md:p-10 text-slate-400">Cargando panel del bot…</main>;

  if (!service || error) return <main className="mx-auto max-w-4xl p-6 md:p-10 text-white space-y-5">
    <Link href="/dashboard/bots" className="text-sm text-blue-400">← Volver a Gestión de Bots</Link>
    <div className="rounded-2xl border border-amber-800 bg-amber-950/30 p-6">
      <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-300 mt-0.5"/><div>
        <h1 className="text-xl font-bold text-amber-200">No puedes administrar este bot</h1>
        <p className="mt-2 text-sm text-slate-300">{error || "No hay una suscripción activa asociada a esta instancia."}</p>
      </div></div>
    </div>
  </main>;

  const observed = service.bot?.observedStatus || service.bot?.status || "OFFLINE";
  const connected = observed === "RUNNING";
  return <main className="mx-auto w-full min-w-0 max-w-7xl p-4 md:p-10 text-white space-y-6">
    {service.bot&&<BotTokenWarning botId={service.bot.id} health={service.bot.tokenHealth}/> }
    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 border-b border-slate-800 pb-6">
      <div className="flex items-start gap-4">
        {service.bot?.guildId && service.bot?.guildIcon ? <img src={service.bot.guildIcon.startsWith("http") ? service.bot.guildIcon : `https://cdn.discordapp.com/icons/${service.bot.guildId}/${service.bot.guildIcon}.png?size=128`} alt={service.bot.guildName || "Servidor de Discord"} className="w-12 h-12 rounded-2xl border border-slate-700 object-cover"/> : <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center"><Bot className="w-6 h-6"/></div>}
        <div>
          <Link href="/dashboard/bots" className="text-xs text-blue-400">Gestión de Bots /</Link>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">{service.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>{service.planName}</span><span>•</span><span className="font-mono">{service.bot?.id}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{service.bot&&<RestartBotButton id={service.bot.id} disabled={!service.bot.tokenConfigured||observed==="RESTARTING"} onRequested={()=>setService(prev=>prev?.bot?{...prev,bot:{...prev.bot,status:"RESTARTING",observedStatus:"RESTARTING"}}:prev)}/>}
        <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : observed === "ERROR" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
          {connected ? "Conectado" : observed === "RESTARTING" ? "Iniciando" : observed === "ERROR" ? "Error" : "Detenido"}
        </span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">Suscripción activa</span>
      </div>
    </div>

    {selectedModule.key==="overview"&&<section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><Server className="w-4 h-4"/>Servidor</div><p className="mt-3 text-sm font-semibold break-all">{service.bot?.guildId || "Sin configurar"}</p></div>
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><CreditCard className="w-4 h-4"/>Renovación</div><p className="mt-3 text-sm font-semibold">{service.expiresAt ? new Date(service.expiresAt).toLocaleDateString("es-ES") : "Sin fecha"}</p></div>
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle2 className="w-4 h-4"/>Token</div><p className="mt-3 text-sm font-semibold">{service.bot?.tokenHealth==="VALID"?"Válido":service.bot?.tokenHealth==="INVALID"?"Inválido":service.bot?.tokenHealth==="MISMATCH"?"Aplicación incorrecta":service.bot?.tokenHealth==="UNREADABLE"?"No disponible":service.bot?.tokenHealth==="UNAVAILABLE"?"Sin verificar":service.bot?.tokenConfigured?"Configurado":"Pendiente"}</p></div>
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5"><div className="flex items-center gap-2 text-xs text-slate-400"><Clock3 className="w-4 h-4"/>Heartbeat</div><p className="mt-3 text-sm font-semibold">{service.bot?.lastPingAt ? new Date(service.bot.lastPingAt).toLocaleString("es-ES") : "Sin datos"}</p></div>
    </section>}

    <section className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex items-start gap-4">
          {(() => { const Icon = icons[selectedModule.icon] || Settings; return <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center"><Icon className="w-5 h-5"/></div>; })()}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">{groupLabels[selectedModule.group]}</p>
            <h2 className="mt-1 text-xl font-bold">{selectedModule.label}</h2>
            <p className="mt-2 text-sm text-slate-400">{selectedModule.description}</p>
          </div>
        </div>
      </div>

      {selectedModule.key === "overview" ? (
        <div className="space-y-5"><label className="block text-sm text-slate-400">Buscar entre {modules.length-1} módulos<input value={moduleSearch} onChange={e=>setModuleSearch(e.target.value)} placeholder="Encuestas, invitaciones, eventos…" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-base text-white"/></label><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {modules.filter(module => module.key !== "overview" && (module.label+" "+module.description).toLowerCase().includes(moduleSearch.trim().toLowerCase())).map(module => {
            const Icon = icons[module.icon] || Settings;
            const disabled = module.requiresGuild && !service.bot?.guildId;
            const managerHref = module.href(botId, service.bot?.guildId);
            return <Link key={module.key} href={disabled ? "#" : managerHref} aria-disabled={disabled}
              className={`rounded-2xl border bg-[#111827] p-5 transition-all ${disabled ? "border-slate-800 opacity-40 pointer-events-none" : "border-slate-800 hover:border-blue-500/40 hover:-translate-y-0.5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 flex items-center justify-center"><Icon className="w-5 h-5"/></div>
                <ExternalLink className="w-4 h-4 text-slate-600"/>
              </div>
              <h3 className="mt-4 font-bold">{module.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{module.description}</p>
            </Link>;
          })}
        </div></div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-3 sm:p-6 space-y-4 min-w-0">
          <p className="text-sm text-slate-300">Estás administrando exclusivamente <strong>{service.name}</strong>. Los cambios de esta sección se aplican únicamente a esta instancia.</p>
          {selectedModule.requiresGuild&&!service.bot?.guildId ? (<div className="rounded-xl border border-amber-800 p-4 text-sm">Vincula primero un servidor de Discord. <Link className="text-blue-400 underline" href={modules.find(m=>m.key==="credentials")!.href(botId)}>Configurar servidor</Link></div>) : selectedModule.key === "deliveries" ? (
            <BotDeliveriesPanel botId={botId} />
          ) : selectedModule.key === "absences" && service.bot?.guildId ? (
            <BotAbsencePanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "recruitment" && service.bot?.guildId ? (
            <BotRecruitmentPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "employees" && service.bot?.guildId ? (
            <BotEmployeesPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "automations" && service.bot?.guildId ? (
            <BotAutomationsPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "analytics" && service.bot?.guildId ? (
            <BotAnalyticsPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "scheduled-messages" && service.bot?.guildId ? (
            <BotScheduledMessagesPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "invites" && service.bot?.guildId ? (
            <BotInvitesPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "events" && service.bot?.guildId ? (
            <BotEventsPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "polls" && service.bot?.guildId ? (
            <BotPollsPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "voice" && service.bot?.guildId ? (
            <BotVoicePanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "performance" && service.bot?.guildId ? (
            <BotPerformancePanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "security" && service.bot?.guildId ? (
            <BotSecurityPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "verification" && service.bot?.guildId ? (
            <BotVerificationPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "logs" && service.bot?.guildId ? (
            <BotLogsPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "studio" && service.bot?.guildId ? (
            <BotStudioPanel guildId={service.bot.guildId} />
          ) : selectedModule.key === "automations" ? (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-slate-300">
              El constructor visual de automatizaciones se integrará directamente aquí dentro del Bot Manager.
            </div>
          ) : (
            <Link href={selectedModule.href(botId, service.bot?.guildId)} className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">
              Abrir editor de {selectedModule.shortLabel}
            </Link>
          )}
        </div>
      )}
    </section>
  </main>;
}
