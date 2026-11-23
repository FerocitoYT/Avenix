"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Check = { key:string; label:string; status:"ok"|"pending"|"error"; detail:string };
type Result = { status:string; lastHeartbeatAt:string|null; checks:Check[]; limitations:string[] };
export default function DiagnosticsPage() {
  const [guilds,setGuilds]=useState<{id:string;name:string}[]>([]);
  const [guildId,setGuildId]=useState("");
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    fetch("/api/client/bot-config",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      const list=(d.services||[]).filter((s:any)=>s.subscriptionActive&&s.bot?.guildId).map((s:any)=>({id:s.bot.guildId,name:s.name}));
      setGuilds(list);if(list.length)setGuildId(list[0].id);
    }).catch(()=>setError("No se pudieron cargar los servicios."));
  },[]);
  useEffect(()=>{
    if(!guildId)return;
    let active=true;
    const refresh=async()=>{
      setLoading(true);
      try{
        const response=await fetch(`/api/bot/guilds/${guildId}/diagnostics`,{cache:"no-store"});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Error consultando el bot");
        if(active){setResult(data);setError("");}
      }catch(e){if(active){setError(e instanceof Error?e.message:"Error desconocido");setResult(null);}}
      finally{if(active)setLoading(false);}
    };
    void refresh();
    const interval=setInterval(()=>void refresh(),15000);
    return()=>{active=false;clearInterval(interval);};
  },[guildId]);
  return <main className="mx-auto max-w-4xl p-6 text-white space-y-6">
    <Link href="/dashboard/bots" className="text-indigo-400 text-sm">← Volver al panel</Link>
    <div><h1 className="text-3xl font-bold">Diagnóstico del bot</h1><p className="text-slate-400 mt-2">Estado observado desde Neon, actualizado cada 15 segundos. No muestra credenciales.</p></div>
    <label className="block text-sm space-y-2">Servidor<select className="block w-full rounded-xl bg-slate-900 border border-slate-700 p-3" value={guildId} onChange={e=>setGuildId(e.target.value)}>{!guilds.length&&<option value="">Sin servicios activos</option>}{guilds.map(g=><option key={g.id} value={g.id}>{g.name} ({g.id})</option>)}</select></label>
    {error&&<p role="alert" className="p-4 rounded-xl bg-red-950 text-red-200">{error}</p>}
    {result&&<><div className="rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Estado del host</p><p className="text-2xl font-bold mt-2">{result.status==="CONNECTED"?"Conectado":result.status==="STARTING"?"Iniciando":"Sin conexión confirmada"}</p><p className="text-sm text-slate-400 mt-2">Último heartbeat: {result.lastHeartbeatAt?new Date(result.lastHeartbeatAt).toLocaleString("es-ES"):"Sin datos"}</p></div>
    <div className="grid gap-3">{result.checks.map(check=><div key={check.key} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-start gap-4"><span className={check.status==="ok"?"text-emerald-400":check.status==="error"?"text-red-400":"text-amber-400"}>{check.status==="ok"?"✓":check.status==="error"?"✕":"!"}</span><div><h2 className="font-semibold">{check.label}</h2><p className="text-sm text-slate-400 mt-1">{check.detail}</p></div></div>)}</div>
    <p className="text-xs text-slate-500">{result.limitations.join(" ")}</p></>}
    {loading&&<p className="text-xs text-slate-500">Consultando estado…</p>}
  </main>;
}
