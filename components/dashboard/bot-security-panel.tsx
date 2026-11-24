"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Save, Shield, Siren } from "lucide-react";

type Config = {
  antiSpamEnabled:boolean; spamThreshold:number; spamTimeWindowSeconds:number; repeatThreshold:number;
  automodAction:"DELETE"|"WARN"|"TIMEOUT"|"KICK"; automodTimeoutSeconds:number; simulationMode:boolean;
  antiRaidEnabled:boolean; raidThreshold:number; raidWindowSeconds:number; raidAction:"TIMEOUT"|"KICK";
  modLogChannelId:string; blockInviteLinks:boolean; blockAllLinks:boolean; filterRepeatedText:boolean;
  antiMassMentionCount:number; minAccountAgeDays:number; bannedWords:string[]; exemptRoleIds:string[]; exemptChannelIds:string[];
};
const defaults:Config={antiSpamEnabled:true,spamThreshold:6,spamTimeWindowSeconds:5,repeatThreshold:4,automodAction:"TIMEOUT",automodTimeoutSeconds:300,simulationMode:false,antiRaidEnabled:false,raidThreshold:10,raidWindowSeconds:10,raidAction:"TIMEOUT",modLogChannelId:"",blockInviteLinks:true,blockAllLinks:false,filterRepeatedText:true,antiMassMentionCount:5,minAccountAgeDays:3,bannedWords:[],exemptRoleIds:[],exemptChannelIds:[]};

const protections = [["antiNuke","Anti-Nuke"],["antiBot","Anti-Bot"],["antiWebhook","Anti-Webhook"],["antiPermissions","Anti-Permisos"]] as const;
type Rule={enabled:boolean;threshold:number;windowSeconds:number;action:"WARN"|"KICK"|"REMOVE_ROLES"};
type Advanced={simulationMode:boolean;trustedUsers:string[];trustedRoles:string[]}&Record<typeof protections[number][0],Rule>;
const defaultRule:Rule={enabled:false,threshold:3,windowSeconds:30,action:"WARN"};
const advancedDefaults:Advanced={simulationMode:true,trustedUsers:[],trustedRoles:[],antiNuke:defaultRule,antiBot:defaultRule,antiWebhook:defaultRule,antiPermissions:defaultRule};
const ids=(value:string)=>value.split(/[\s,]+/).map(x=>x.trim()).filter(Boolean);
export function BotSecurityPanel({guildId}:{guildId:string}){
  const [config,setConfig]=useState<Config>(defaults);
  const [advanced,setAdvanced]=useState<Advanced>(advancedDefaults);
  const [trustedUsers,setTrustedUsers]=useState("");
  const [trustedRoles,setTrustedRoles]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [cases,setCases]=useState<any[]>([]);
  const [banned,setBanned]=useState("");
  const [roles,setRoles]=useState("");
  const [channels,setChannels]=useState("");
  const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");const [message,setMessage]=useState("");

  useEffect(()=>{let alive=true;setLoading(true);setLoaded(false);(async()=>{try{
    const r=await fetch(`/api/bot/guilds/${guildId}/security`,{cache:"no-store"});const d=await r.json();
    if(!r.ok)throw new Error(d.error||"No se pudo cargar Seguridad");
    if(!alive)return;const x=d.config||{};
    setConfig({...defaults,...x,antiSpamEnabled:x.antispamEnabled??true,antiRaidEnabled:x.antiraidEnabled??false,raidThreshold:x.antiraidJoinThreshold??x.raidThreshold??10,modLogChannelId:x.logChannelId||""});
    setBanned((x.bannedWords||[]).join(", "));setRoles((x.exemptRoleIds||[]).join(", "));setChannels((x.exemptChannelIds||[]).join(", "));
    setCases(d.recentCases||[]);const a=d.advanced||advancedDefaults;setAdvanced(a);setTrustedUsers(a.trustedUsers.join(', '));setTrustedRoles(a.trustedRoles.join(', '));setLoaded(true);
  }catch(e){if(alive)setError(e instanceof Error?e.message:"Error cargando Seguridad")}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[guildId]);

  const save=async()=>{setSaving(true);setError("");setMessage("");try{
    const payload={...config,advanced:{...advanced,trustedUsers:ids(trustedUsers),trustedRoles:ids(trustedRoles)},bannedWords:banned.split(",").map(x=>x.trim()).filter(Boolean),exemptRoleIds:ids(roles),exemptChannelIds:ids(channels)};
    const r=await fetch(`/api/bot/guilds/${guildId}/security`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const d=await r.json();if(!r.ok){const detail=d.fields?Object.values(d.fields as Record<string,string[]>).flat().filter(Boolean).join(". "):"";throw new Error(detail||d.error||"No se pudo guardar")}
    setMessage("Seguridad actualizada. El bot aplicará los cambios sin reiniciar.");
  }catch(e){setError(e instanceof Error?e.message:"Error guardando Seguridad")}finally{setSaving(false)}};

  if(loading)return <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 text-sm text-slate-400">Cargando Seguridad…</div>;
  return <div className="space-y-5">
    {error&&<div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
    {message&&<div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300"><CheckCircle2 className="w-4 h-4"/>{message}</div>}
    <div className="grid lg:grid-cols-2 gap-5">
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400"/><h3 className="font-bold">Anti-Spam y AutoMod</h3></div><input type="checkbox" checked={config.antiSpamEnabled} onChange={e=>setConfig({...config,antiSpamEnabled:e.target.checked})}/></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-xs text-slate-400">Mensajes<input type="number" min={3} max={30} value={config.spamThreshold} onChange={e=>setConfig({...config,spamThreshold:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
          <label className="text-xs text-slate-400">Ventana (s)<input type="number" min={2} max={60} value={config.spamTimeWindowSeconds} onChange={e=>setConfig({...config,spamTimeWindowSeconds:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
          <label className="text-xs text-slate-400">Repeticiones<input type="number" min={2} max={20} value={config.repeatThreshold} onChange={e=>setConfig({...config,repeatThreshold:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-slate-400">Acción<select value={config.automodAction} onChange={e=>setConfig({...config,automodAction:e.target.value as Config["automodAction"]})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"><option value="DELETE">Solo eliminar</option><option value="WARN">Advertir</option><option value="TIMEOUT">Timeout</option><option value="KICK">Expulsar</option></select></label>
          <label className="text-xs text-slate-400">Timeout (segundos)<input type="number" min={10} max={604800} value={config.automodTimeoutSeconds} onChange={e=>setConfig({...config,automodTimeoutSeconds:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.blockInviteLinks} onChange={e=>setConfig({...config,blockInviteLinks:e.target.checked})}/>Bloquear invitaciones Discord</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.blockAllLinks} onChange={e=>setConfig({...config,blockAllLinks:e.target.checked})}/>Bloquear todos los enlaces</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.filterRepeatedText} onChange={e=>setConfig({...config,filterRepeatedText:e.target.checked})}/>Filtrar texto repetido</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.simulationMode} onChange={e=>setConfig({...config,simulationMode:e.target.checked})}/>Modo simulación</label>
        </div>
        <label className="block text-xs text-slate-400">Menciones masivas desde<input type="number" min={2} max={50} value={config.antiMassMentionCount} onChange={e=>setConfig({...config,antiMassMentionCount:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Siren className="w-5 h-5 text-red-400"/><h3 className="font-bold">Anti-Raid</h3></div><input type="checkbox" checked={config.antiRaidEnabled} onChange={e=>setConfig({...config,antiRaidEnabled:e.target.checked})}/></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-slate-400">Entradas máximas<input type="number" min={2} max={100} value={config.raidThreshold} onChange={e=>setConfig({...config,raidThreshold:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
          <label className="text-xs text-slate-400">Ventana (s)<input type="number" min={2} max={300} value={config.raidWindowSeconds} onChange={e=>setConfig({...config,raidWindowSeconds:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
          <label className="text-xs text-slate-400">Edad mínima cuenta (días)<input type="number" min={0} max={3650} value={config.minAccountAgeDays} onChange={e=>setConfig({...config,minAccountAgeDays:+e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
          <label className="text-xs text-slate-400">Acción<select value={config.raidAction} onChange={e=>setConfig({...config,raidAction:e.target.value as Config["raidAction"]})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"><option value="TIMEOUT">Timeout</option><option value="KICK">Expulsar</option></select></label>
        </div>
        <label className="block text-xs text-slate-400">Canal de logs<input value={config.modLogChannelId} onChange={e=>setConfig({...config,modLogChannelId:e.target.value})} placeholder="ID del canal" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono"/></label>
        <label className="block text-xs text-slate-400">Palabras bloqueadas (separadas por coma)<textarea rows={3} value={banned} onChange={e=>setBanned(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"/></label>
        <label className="block text-xs text-slate-400">Roles exentos (IDs)<textarea rows={2} value={roles} onChange={e=>setRoles(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono"/></label>
        <label className="block text-xs text-slate-400">Canales exentos (IDs)<textarea rows={2} value={channels} onChange={e=>setChannels(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono"/></label>
      </section>
    </div>
    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
      <h3 className="font-bold">Seguridad avanzada</h3>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={advanced.simulationMode} onChange={e=>setAdvanced(a=>({...a,simulationMode:e.target.checked}))}/>Modo simulación (sin sanciones)</label>
      {!advanced.simulationMode&&<p className="text-amber-400 text-sm">Las sanciones seleccionadas se aplicarán realmente. Revisa las excepciones.</p>}
      <div className="grid lg:grid-cols-2 gap-4">{protections.map(([key,label])=><div key={key} className="rounded-xl border border-slate-700 p-4 space-y-3">
      <label className="flex justify-between font-semibold">{label}<input type="checkbox" checked={advanced[key].enabled} onChange={e=>setAdvanced(a=>({...a,[key]:{...a[key],enabled:e.target.checked}}))}/></label>
      <div className="grid grid-cols-2 gap-3">{(["threshold","windowSeconds"] as const).map(field=><label key={field} className="text-xs text-slate-400">{field==="threshold"?"Eventos":"Ventana (segundos)"}<input className="mt-2 w-full rounded-xl bg-slate-950 p-3" type="number" min={field==="threshold"?1:5} max={field==="threshold"?50:300} value={advanced[key][field]} onChange={e=>setAdvanced(a=>({...a,[key]:{...a[key],[field]:+e.target.value}}))}/></label>)}</div>
      <label className="text-xs text-slate-400">Acción<select className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={advanced[key].action} onChange={e=>setAdvanced(a=>({...a,[key]:{...a[key],action:e.target.value as Rule["action"]}}))}><option value="WARN">Solo aviso</option><option value="KICK">Expulsar</option><option value="REMOVE_ROLES">Retirar roles peligrosos</option></select></label></div>)}</div>
      <label className="block text-xs text-slate-400">Usuarios de confianza (IDs)<textarea className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={trustedUsers} onChange={e=>setTrustedUsers(e.target.value)}/></label>
      <label className="block text-xs text-slate-400">Roles de confianza (IDs)<textarea className="mt-2 w-full rounded-xl bg-slate-950 p-3" value={trustedRoles} onChange={e=>setTrustedRoles(e.target.value)}/></label>
    </section>
    <button onClick={()=>void save()} disabled={saving||!loaded} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"><Save className="w-4 h-4"/>{saving?"Guardando…":"Guardar Seguridad"}</button>

    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
      <h3 className="font-bold">Expedientes recientes</h3>
      {cases.length===0?<p className="mt-3 text-sm text-slate-500">No hay sanciones registradas.</p>:<div className="mt-4 space-y-2">{cases.map(c=><div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"><div className="flex justify-between gap-3"><span className="font-bold text-white">#{c.caseNumber} · {c.action}</span><span className="text-slate-500">{new Date(c.createdAt).toLocaleString("es-ES")}</span></div><p className="mt-1 text-slate-400">{c.targetTag} · {c.reason}</p></div>)}</div>}
    </section>
  </div>;
}
