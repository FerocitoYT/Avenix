"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, RotateCcw, Search, Send, XCircle } from "lucide-react";

type Delivery = {
  id: string;
  integrationId: string;
  provider: string;
  eventType: string;
  status: "PENDING" | "PROCESSING" | "RETRYING" | "DELIVERED" | "FAILED" | string;
  attempts: number;
  nextAttemptAt: string;
  lastError: string | null;
  deliveredAt: string | null;
  createdAt: string;
};
type DeliveryResponse = {
  success: boolean;
  deliveries: Delivery[];
  totals: Record<string, number>;
};

const statusLabel: Record<string,string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  RETRYING: "Reintentando",
  DELIVERED: "Entregado",
  FAILED: "Fallido",
};
const statusClasses: Record<string,string> = {
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  PROCESSING: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  RETRYING: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  DELIVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-300",
};

export function BotDeliveriesPanel({ botId }: { botId: string }) {
  const [data,setData]=useState<DeliveryResponse|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [status,setStatus]=useState("ALL");
  const [provider,setProvider]=useState("ALL");
  const [query,setQuery]=useState("");
  const [retrying,setRetrying]=useState("");

  const refresh=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try{
      const response=await fetch(`/api/bots/${botId}/integrations/deliveries`,{cache:"no-store"});
      const json=await response.json();
      if(!response.ok)throw new Error(json.error||"No se pudo cargar el historial de entregas");
      setData(json);
      setError("");
    }catch(e){
      setError(e instanceof Error?e.message:"Error consultando entregas");
    }finally{
      if(!silent)setLoading(false);
    }
  },[botId]);

  useEffect(()=>{
    void refresh();
    const timer=setInterval(()=>void refresh(true),15000);
    return()=>clearInterval(timer);
  },[refresh]);

  const providers=useMemo(()=>Array.from(new Set((data?.deliveries||[]).map(item=>item.provider))).sort(),[data]);
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return (data?.deliveries||[]).filter(item=>{
      if(status!=="ALL"&&item.status!==status)return false;
      if(provider!=="ALL"&&item.provider!==provider)return false;
      if(q&&![
        item.id,item.integrationId,item.provider,item.eventType,item.status,item.lastError||""
      ].join(" ").toLowerCase().includes(q))return false;
      return true;
    });
  },[data,status,provider,query]);

  async function retry(deliveryId:string){
    setRetrying(deliveryId);setError("");
    try{
      const response=await fetch(`/api/bots/${botId}/integrations/deliveries`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({deliveryId}),
      });
      const json=await response.json();
      if(!response.ok)throw new Error(json.error||"No se pudo reintentar la entrega");
      await refresh(true);
    }catch(e){
      setError(e instanceof Error?e.message:"Error solicitando reintento");
    }finally{
      setRetrying("");
    }
  }

  const totals=data?.totals||{};
  const cards=[
    {key:"PENDING",label:"Pendientes",value:(totals.PENDING||0)+(totals.PROCESSING||0),icon:Clock3},
    {key:"RETRYING",label:"Reintentando",value:totals.RETRYING||0,icon:RotateCcw},
    {key:"DELIVERED",label:"Entregadas",value:totals.DELIVERED||0,icon:CheckCircle2},
    {key:"FAILED",label:"Fallidas",value:totals.FAILED||0,icon:XCircle},
  ];

  return <div className="space-y-5">
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map(card=>{
        const Icon=card.icon;
        return <div key={card.key} className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between"><span className="text-xs text-slate-400">{card.label}</span><Icon className="w-4 h-4 text-slate-500"/></div>
          <p className="mt-3 text-2xl font-extrabold text-white">{card.value}</p>
        </div>;
      })}
    </div>

    <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar evento, ID, proveedor o error…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/>
        </div>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm">
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="PROCESSING">Procesando</option>
          <option value="RETRYING">Reintentando</option>
          <option value="DELIVERED">Entregados</option>
          <option value="FAILED">Fallidos</option>
        </select>
        <select value={provider} onChange={e=>setProvider(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm">
          <option value="ALL">Todos los proveedores</option>
          {providers.map(item=><option key={item} value={item}>{item}</option>)}
        </select>
        <button onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>Actualizar
        </button>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Se actualiza automáticamente cada 15 segundos. Solo se muestran entregas pertenecientes a este bot.</p>
    </div>

    {error&&<div className="flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0"/><span>{error}</span></div>}

    <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div><h3 className="font-bold text-white">Entregas</h3><p className="text-xs text-slate-500 mt-1">{filtered.length} de {data?.deliveries.length||0} eventos recientes</p></div>
      </div>
      {loading&&!data?<div className="p-8 text-center text-sm text-slate-400">Cargando entregas…</div>:
      filtered.length===0?<div className="p-10 text-center space-y-2"><Send className="mx-auto w-7 h-7 text-slate-600"/><p className="text-sm font-semibold text-slate-300">No hay entregas que mostrar</p><p className="text-xs text-slate-500">Cuando WooCommerce o una API envíen eventos, aparecerán aquí.</p></div>:
      <div className="divide-y divide-slate-800">{filtered.map(item=><article key={item.id} className="p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{item.eventType}</span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">{item.provider}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClasses[item.status]||"border-slate-700 bg-slate-900 text-slate-300"}`}>{statusLabel[item.status]||item.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span>Recibido: {new Date(item.createdAt).toLocaleString("es-ES")}</span>
              <span>Intentos: {item.attempts}</span>
              {item.deliveredAt&&<span>Entregado: {new Date(item.deliveredAt).toLocaleString("es-ES")}</span>}
              {(item.status==="RETRYING"||item.status==="PENDING")&&<span>Próximo intento: {new Date(item.nextAttemptAt).toLocaleString("es-ES")}</span>}
            </div>
            <p className="font-mono text-[10px] text-slate-600 break-all">{item.id}</p>
            {item.lastError&&<div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300"><strong>Error:</strong> {item.lastError}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.status==="FAILED"&&<button disabled={!!retrying} onClick={()=>void retry(item.id)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"><RotateCcw className={`w-3.5 h-3.5 ${retrying===item.id?"animate-spin":""}`}/>{retrying===item.id?"Reintentando…":"Reintentar ahora"}</button>}
          </div>
        </div>
      </article>)}</div>}
    </div>
  </div>;
}
