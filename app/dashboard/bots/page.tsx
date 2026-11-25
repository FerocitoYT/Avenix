"use client";
import {RestartBotButton} from "@/components/dashboard/restart-bot-button";

import { useEffect, useState } from "react";
import Link from "next/link";
import {BotTokenWarning} from "@/components/dashboard/bot-token-warning";
import { orderedBotDashboardModules } from "@/lib/bot-dashboard-modules";
import { Bot, AlertCircle, ArrowRight, Server, CreditCard, CheckCircle2 } from "lucide-react";

type Service = {
  id: string;
  name: string;
  planName: string;
  subscriptionActive: boolean;
  expiresAt: string | null;
  bot: {
    id: string;
    guildId: string | null;
    applicationId: string | null;
    status: string;
    observedStatus?: string;
    tokenConfigured: boolean;
    tokenHealth?:string|null;
  } | null;
};

export default function BotsPage() {
  const modules=orderedBotDashboardModules().filter(m=>m.key!=="overview");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/client/bot-config", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar tus bots");
        if (active) setServices(data.services || []);
      })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "Error cargando bots"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <main className="mx-auto max-w-7xl p-4 md:p-10 text-white space-y-7">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold">Gestión de Bots</h1>
        <p className="mt-2 text-sm text-slate-400">Selecciona una instancia para abrir su panel individual, configuraciones, integraciones y diagnóstico.</p>
      </div>
      <Link href="/#tarifas" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500">Contratar otro bot</Link>
    </div>

    {error && <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
    {loading ? <div className="rounded-2xl border border-slate-800 bg-[#111827] p-8 text-sm text-slate-400">Cargando tus bots…</div> :
    services.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-[#111827] p-8 text-center space-y-3">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center"><Bot className="w-6 h-6"/></div>
      <h2 className="font-bold">No tienes servicios de bot</h2>
      <p className="text-sm text-slate-400">Cuando contrates uno aparecerá aquí automáticamente.</p>
    </div> :
    <div className="grid xl:grid-cols-2 gap-5">
      {services.map(service => {
        const observed = service.bot?.observedStatus || service.bot?.status || "STOPPED";
        return <article key={service.id} className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center"><Bot className="w-5 h-5"/></div>
              <div><h2 className="font-bold">{service.name}</h2><p className="mt-1 text-xs text-slate-400">{service.planName}</p></div>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${service.subscriptionActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
              {service.subscriptionActive ? "Suscripción activa" : "Suscripción vencida"}
            </span>
          </div>

          {service.subscriptionActive&&service.bot&&<BotTokenWarning botId={service.bot.id} health={service.bot.tokenHealth}/>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="text-slate-500 flex items-center gap-1.5"><Server className="w-3.5 h-3.5"/>Servidor</span><p className="mt-2 truncate text-slate-200">{service.bot?.guildId || "Sin configurar"}</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="text-slate-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5"/>Vigencia</span><p className="mt-2 text-slate-200">{service.expiresAt ? new Date(service.expiresAt).toLocaleDateString("es-ES") : "Finalizada"}</p></div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-400"><CheckCircle2 className="w-4 h-4"/>{observed === "RUNNING" ? "Conectado" : observed === "RESTARTING" ? "Iniciando" : observed === "ERROR" ? "Error de conexión" : "Detenido"}</span>
            {service.subscriptionActive && service.bot ? <Link href={`/dashboard/bot/${service.bot.id}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500">Abrir panel <ArrowRight className="w-4 h-4"/></Link>
            : <span className="inline-flex items-center gap-2 rounded-xl border border-amber-800 bg-amber-950/30 px-4 py-2.5 text-amber-300"><AlertCircle className="w-4 h-4"/>Administración bloqueada</span>}
          </div>
          {service.subscriptionActive&&service.bot&&<RestartBotButton id={service.bot.id} disabled={!service.bot.tokenConfigured||observed==="RESTARTING"} onRequested={()=>setServices(prev=>prev.map(s=>s.id===service.id&&s.bot?{...s,bot:{...s.bot,status:"RESTARTING",observedStatus:"RESTARTING"}}:s))}/>}
          {service.subscriptionActive&&service.bot&&<details className="rounded-xl border border-slate-700 p-3" open><summary className="cursor-pointer font-semibold text-sm">Todos los módulos ({modules.length})</summary><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">{modules.map(m=><Link key={m.key} href={m.href(service.bot!.id,service.bot!.guildId)} className="min-w-0 rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-blue-500"><span className="block text-sm font-semibold break-words">{m.label}</span><span className="block text-xs text-slate-400 mt-1">{m.requiresGuild&&!service.bot!.guildId?"Requiere vincular servidor":m.description}</span></Link>)}</div></details>}
        </article>;
      })}
    </div>}
  </main>;
}
