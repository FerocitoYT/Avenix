"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Save, ShieldCheck } from "lucide-react";

type VerificationConfig = {
  enabled: boolean;
  mode: "REACTION" | "ACCOUNT";
  channelId: string;
  messageId?: string | null;
  verifiedRoleId: string;
  reactionEmoji: string;
  embedTitle: string;
  embedDescription: string;
  buttonLabel: string;
  targetInviteUrl: string;
  dmAfterVerify: boolean;
};

const defaults: VerificationConfig = {
  enabled: false,
  mode: "REACTION",
  channelId: "",
  verifiedRoleId: "",
  reactionEmoji: "✅",
  embedTitle: "Verificación",
  embedDescription: "Reacciona o pulsa el botón para verificar tu cuenta.",
  buttonLabel: "Verificar cuenta",
  targetInviteUrl: "",
  dmAfterVerify: true,
};

export function BotVerificationPanel({ guildId }: { guildId: string }) {
  const [config,setConfig]=useState<VerificationConfig>(defaults);
  const [verifiedCount,setVerifiedCount]=useState(0);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      setLoading(true);
      try{
        const response=await fetch(`/api/bot/guilds/${guildId}/verification`,{cache:"no-store"});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error||"No se pudo cargar la verificación");
        if(active){
          setConfig({...defaults,...data.config,targetInviteUrl:data.config?.targetInviteUrl||""});
          setVerifiedCount(data.verifiedCount||0);
          setError("");
        }
      }catch(e){
        if(active)setError(e instanceof Error?e.message:"Error cargando la configuración");
      }finally{if(active)setLoading(false)}
    };
    void load();
    return()=>{active=false};
  },[guildId]);

  async function save(){
    setSaving(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/bot/guilds/${guildId}/verification`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"SAVE",config}),
      });
      const data=await response.json();
      if(!response.ok){
        const details=data.fields&&typeof data.fields==="object"
          ? Object.values(data.fields as Record<string,string[]>).flat().filter(Boolean).join(". ")
          : "";
        throw new Error(details||data.error||"No se pudo guardar");
      }
      setConfig(prev=>({...prev,...data.config,targetInviteUrl:data.config?.targetInviteUrl||""}));
      setMessage("Configuración de verificación guardada correctamente.");
    }catch(e){
      setError(e instanceof Error?e.message:"Error guardando verificación");
    }finally{setSaving(false)}
  }

  if(loading)return <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 text-sm text-slate-400">Cargando sistema de verificación…</div>;

  return <div className="space-y-5">
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs text-slate-500">Estado</p>
        <p className={`mt-2 font-bold ${config.enabled?"text-emerald-300":"text-slate-300"}`}>{config.enabled?"Activo":"Desactivado"}</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs text-slate-500">Modo</p>
        <p className="mt-2 font-bold text-white">{config.mode==="REACTION"?"Reacción de emoji":"Cuenta / botón"}</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
        <p className="text-xs text-slate-500">Usuarios verificados</p>
        <p className="mt-2 text-2xl font-extrabold text-white">{verifiedCount}</p>
      </div>
    </div>

    {error&&<div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
    {message&&<div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300"><CheckCircle2 className="w-4 h-4"/>{message}</div>}

    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h3 className="font-bold text-white">Sistema de verificación</h3>
          <p className="mt-1 text-xs text-slate-400">Verifica usuarios en este servidor y, opcionalmente, envíalos a un segundo servidor mediante una invitación privada.</p>
        </div>
        <button type="button" onClick={()=>setConfig(prev=>({...prev,enabled:!prev.enabled}))} className={`relative h-7 w-12 rounded-full transition-colors ${config.enabled?"bg-blue-600":"bg-slate-700"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${config.enabled?"left-6":"left-1"}`}/>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm text-slate-300">Método de verificación
          <select value={config.mode} onChange={e=>setConfig({...config,mode:e.target.value as "REACTION"|"ACCOUNT"})} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3">
            <option value="REACTION">Reacción de emoji en embed</option>
            <option value="ACCOUNT">Verificación por cuenta / botón</option>
          </select>
        </label>
        <label className="text-sm text-slate-300">ID del canal
          <input value={config.channelId} onChange={e=>setConfig({...config,channelId:e.target.value})} placeholder="123456789012345678" className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono"/>
        </label>
        <label className="text-sm text-slate-300">ID del rol verificado
          <input value={config.verifiedRoleId} onChange={e=>setConfig({...config,verifiedRoleId:e.target.value})} placeholder="123456789012345678" className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono"/>
        </label>
        {config.mode==="REACTION"?<label className="text-sm text-slate-300">Emoji de verificación
          <input value={config.reactionEmoji} onChange={e=>setConfig({...config,reactionEmoji:e.target.value})} placeholder="✅" className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/>
        </label>:<label className="text-sm text-slate-300">Texto del botón
          <input value={config.buttonLabel} onChange={e=>setConfig({...config,buttonLabel:e.target.value})} maxLength={80} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/>
        </label>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm text-slate-300">Título del embed
          <input value={config.embedTitle} onChange={e=>setConfig({...config,embedTitle:e.target.value})} maxLength={256} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/>
        </label>
        <label className="text-sm text-slate-300">Invitación al servidor destino
          <input value={config.targetInviteUrl} onChange={e=>setConfig({...config,targetInviteUrl:e.target.value})} placeholder="https://discord.gg/..." className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/>
        </label>
      </div>

      <label className="block text-sm text-slate-300">Descripción del embed
        <textarea rows={5} value={config.embedDescription} onChange={e=>setConfig({...config,embedDescription:e.target.value})} maxLength={2000} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        <input type="checkbox" checked={config.dmAfterVerify} onChange={e=>setConfig({...config,dmAfterVerify:e.target.checked})} className="h-4 w-4"/>
        Enviar confirmación por MD y, si existe, la invitación al servidor destino.
      </label>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-relaxed text-slate-300">
        <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 w-4 h-4 shrink-0 text-blue-400"/><p>La identidad se valida mediante el Discord User ID. El rol configurado se entrega únicamente en este servidor; la redirección al segundo servidor se realiza enviando una invitación privada al usuario ya verificado.</p></div>
      </div>

      <button onClick={()=>void save()} disabled={saving||!config.channelId||!config.verifiedRoleId} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
        <Save className="w-4 h-4"/>{saving?"Guardando…":"Guardar verificación"}
      </button>
    </section>
  </div>;
}
