"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import { orderedBotDashboardModules } from "@/lib/bot-dashboard-modules";
import {
  Activity, ArrowLeft, Bot, History, LayoutDashboard, Menu, Palette,
  Settings, Shield, ShoppingBag, Ticket, UserCheck, Workflow, X, ChevronDown, Users, ClipboardList
} from "lucide-react";

type BotInfo = { id:string; name:string; guildId:string|null; status:string };
const icons: Record<string, React.ComponentType<{className?:string}>> = {
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

export function BotManagerShell({ children, botIdOverride }: { children: React.ReactNode; botIdOverride?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const botId = botIdOverride || pathname.match(/^\/dashboard\/bot\/([^/]+)/)?.[1] || searchParams.get("botId") || "";
  const section =
    pathname === "/dashboard/bots/configuracion" ? "credentials" :
    pathname === "/dashboard/bots/tickets" ? "tickets" :
    pathname === "/dashboard/bots/diagnostico" ? "diagnostics" :
    pathname === "/dashboard/bots/integraciones/historial" ? "deliveries" :
    pathname === "/dashboard/bots/integraciones" ? "integrations" :
    pathname === "/dashboard/bots/editor" ? (searchParams.get("section") || "security") :
    searchParams.get("section") || "overview";
  const [bot, setBot] = useState<BotInfo|null>(null);
  const [mobileOpen,setMobileOpen] = useState(false);
  const modules = useMemo(()=>orderedBotDashboardModules(),[]);
  const groups = [
    {title:"General",keys:["overview","credentials"],icon:LayoutDashboard},
    {title:"Comunidad",keys:["tickets","welcome","verification","studio","invites","polls","voice"],icon:Users},
    {title:"Personal",keys:["absences","recruitment","employees"],icon:ClipboardList},
    {title:"Automatización",keys:["automations","scheduled-messages","events","reminders","ai"],icon:Workflow},
    {title:"Integraciones",keys:["integrations","social","deliveries"],icon:ShoppingBag},
    {title:"Seguridad y sistema",keys:["security","analytics","logs","diagnostics"],icon:Shield}
  ];
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});
  useEffect(()=>{const group=groups.find(g=>g.keys.includes(section));if(group)setExpanded(prev=>({...prev,[group.title]:true}));},[section]);

  useEffect(()=>{
    let active=true;
    fetch("/api/client/bot-config",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{
      if(!active||!data)return;
      const service=(data.services||[]).find((s:any)=>s.subscriptionActive&&s.bot?.id===botId);
      if(service?.bot)setBot({id:service.bot.id,name:service.name,guildId:service.bot.guildId||null,status:service.bot.observedStatus||service.bot.status||"STOPPED"});
    }).catch(()=>{});
    return()=>{active=false};
  },[botId]);

  const routeFor=(key:string)=>`/dashboard/bot/${botId}${key==="overview"?"":`?section=${encodeURIComponent(key)}`}`;
  const renderModule=(module:typeof modules[number])=>{
      const Icon=icons[module.icon]||Settings;
      const disabled=module.requiresGuild&&!bot?.guildId;
      const active=section===module.key;
      return disabled ? (
        <div key={module.key} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-slate-600 cursor-not-allowed">
          <Icon className="w-4 h-4"/><span>{module.shortLabel}</span>
        </div>
      ) : (
        <Link key={module.key} href={routeFor(module.key)} onClick={()=>setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${active?"bg-blue-600 text-white shadow-md shadow-blue-500/20":"text-slate-400 hover:bg-slate-800/70 hover:text-white"}`}>
          <Icon className="w-4 h-4"/><span>{module.shortLabel}</span>
        </Link>
      );
    };
  const remaining=modules.filter(m=>!groups.some(g=>g.keys.includes(m.key)));
  const nav = <nav aria-label="Gestión del bot" className="space-y-2">
    {[...groups,...(remaining.length?[{title:"Otros módulos",keys:remaining.map(m=>m.key),icon:Settings}]:[])].map(group=>{
      const items=modules.filter(m=>group.keys.includes(m.key));
      if(!items.length)return null;
      const open=expanded[group.title]??items.some(m=>m.key===section);
      const active=items.some(m=>m.key===section);
      const GroupIcon=group.icon;
      return <div key={group.title} className="rounded-xl border border-slate-800/80 bg-[#101a2a] overflow-hidden">
        <button type="button" aria-expanded={open} onClick={()=>setExpanded(prev=>({...prev,[group.title]:!open}))} className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-left ${active?"text-blue-300":"text-slate-300"}`}>
          <GroupIcon className="w-4 h-4 shrink-0"/><span className="flex-1">{group.title}</span><span className="text-[10px] text-slate-500">{items.length}</span><ChevronDown className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`}/>
        </button>
        {open&&<div className="px-2 pb-2 space-y-1">{items.map(renderModule)}</div>}
      </div>;
    })}
  </nav>;

  return <div className="min-h-screen bg-[#070d18] text-slate-200 flex">
    <aside className="hidden lg:flex sticky top-0 h-dvh w-72 shrink-0 border-r border-slate-800 bg-[#0b1322] p-5 flex-col">
      <div className="pb-5 border-b border-slate-800"><AvenixLogo/></div>
      <div className="py-5 border-b border-slate-800">
        <p className="text-[10px] uppercase tracking-[0.18em] text-blue-400 font-bold">Axyon Bot Manager</p>
        <div className="mt-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 flex items-center justify-center"><Bot className="w-5 h-5"/></div>
          <div className="min-w-0"><p className="text-sm font-bold text-white truncate">{bot?.name||"Cargando bot…"}</p><p className="text-[10px] text-slate-500 font-mono truncate">{botId}</p></div>
        </div>
      </div>
      <div className="flex-1 min-h-0 py-4 overflow-y-auto">{nav}</div>
      <div className="pt-4 border-t border-slate-800">
        <Link href="/dashboard/bots" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
          <ArrowLeft className="w-4 h-4"/><span>Volver al panel de cliente</span>
        </Link>
      </div>
    </aside>

    <div className="flex-1 min-w-0">
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#0b1322] px-4 py-3">
        <div className="flex items-center gap-3"><AvenixLogo size="sm"/><span className="text-xs text-slate-400">Bot Manager</span></div>
        <button onClick={()=>setMobileOpen(true)} className="p-2 text-slate-300"><Menu className="w-5 h-5"/></button>
      </header>
      {mobileOpen&&<div className="lg:hidden fixed inset-0 z-50 bg-[#0b1322] flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800"><div><p className="text-xs font-bold text-white">{bot?.name||"Bot"}</p><p className="text-[10px] text-slate-500">{botId}</p></div><button onClick={()=>setMobileOpen(false)} className="p-2"><X className="w-5 h-5"/></button></div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4">{nav}</div>
        <Link href="/dashboard/bots" onClick={()=>setMobileOpen(false)} className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 mb-[env(safe-area-inset-bottom)] text-xs text-slate-300"><ArrowLeft className="w-4 h-4"/>Volver al panel de cliente</Link>
      </div>}
      <main className="min-h-screen overflow-y-auto">{children}</main>
    </div>
  </div>;
}
