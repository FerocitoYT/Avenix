"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Service = { id:string; name:string; subscriptionActive:boolean; bot?:{id:string}|null };
export default function ApiIntegrationPage() {
 const [services,setServices]=useState<Service[]>([]);
 const [botId,setBotId]=useState("");
 const [name,setName]=useState("");
 const [destination,setDestination]=useState("");
 const [enabled,setEnabled]=useState(true);
 const [path,setPath]=useState("");
 const [secret,setSecret]=useState("");
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [saving,setSaving]=useState(false);
 useEffect(()=>{fetch("/api/client/bot-config").then(r=>r.json()).then(d=>{
  const list=(d.services||[]).filter((s:Service)=>s.subscriptionActive&&s.bot?.id);
  setServices(list);if(list.length)setBotId(list[0].bot!.id);
 }).catch(()=>setError("No se pudieron cargar los servicios"));},[]);
 useEffect(()=>{if(!botId)return;setSecret("");fetch(`/api/bots/${botId}/integrations/api`,{cache:"no-store"}).then(r=>r.json()).then(d=>{
  setName(d.name||"");setEnabled(d.enabled??true);setPath(d.webhookPath?window.location.origin+d.webhookPath:"");
 }).catch(()=>setError("No se pudo cargar la integración"));},[botId]);
 async function save(){
  setSaving(true);setError("");setMessage("");
  try{
   const response=await fetch(`/api/bots/${botId}/integrations/api`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,enabled,discordWebhookUrl:destination})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"No se pudo guardar");
   setPath(window.location.origin+data.webhookPath);setSecret(data.signingSecret);setDestination("");setMessage(data.message);
  }catch(e){setError(e instanceof Error?e.message:"Error");}
  finally{setSaving(false);}
 }
 return <main className="mx-auto max-w-4xl p-6 text-white space-y-6">
  <Link href="/dashboard/bots/integraciones" className="text-indigo-400 text-sm">← Volver a integraciones</Link>
  <h1 className="text-3xl font-bold">API personalizada → Discord</h1>
  <p className="text-slate-400">Recibe eventos de tu propia web, CRM o aplicación y publica un embed en Discord. No es necesario reiniciar el bot.</p>
  <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
   <label className="block text-sm">Bot<select value={botId} onChange={e=>setBotId(e.target.value)} className="block w-full mt-2 bg-slate-950 border border-slate-700 p-3 rounded-lg">{services.map(s=><option key={s.id} value={s.bot!.id}>{s.name}</option>)}</select></label>
   <label className="block text-sm">Nombre de la integración<input value={name} onChange={e=>setName(e.target.value)} className="block w-full mt-2 bg-slate-950 border border-slate-700 p-3 rounded-lg" placeholder="Mi aplicación"/></label>
   <label className="block text-sm">Webhook de Discord (destino)<input type="password" autoComplete="off" value={destination} onChange={e=>setDestination(e.target.value)} className="block w-full mt-2 bg-slate-950 border border-slate-700 p-3 rounded-lg" placeholder="https://discord.com/api/webhooks/…"/></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Integración activa</label>
   <p className="text-xs text-amber-300">Al guardar de nuevo se rota el secreto de firma. Actualízalo también en la aplicación emisora.</p>
   <button disabled={!botId||!name.trim()||!destination||saving} onClick={()=>void save()} className="bg-indigo-600 rounded-lg px-5 py-3 disabled:opacity-50">{saving?"Guardando…":"Guardar integración"}</button>
   {error&&<p role="alert" className="text-red-400">{error}</p>}{message&&<p role="status" className="text-emerald-400">{message}</p>}
   {path&&<div className="space-y-1"><p className="text-sm font-semibold">Endpoint POST</p><code className="block break-all bg-slate-950 p-3 rounded-lg text-xs">{path}</code><button className="text-sm text-indigo-400" onClick={()=>navigator.clipboard.writeText(path)}>Copiar endpoint</button></div>}
   {secret&&<div className="border border-amber-700 p-4 rounded-lg space-y-2"><strong>Secreto HMAC (solo visible ahora)</strong><code className="block break-all text-xs">{secret}</code><button className="text-sm text-indigo-400" onClick={()=>navigator.clipboard.writeText(secret)}>Copiar secreto</button></div>}
  </div>
  <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-3">
   <h2 className="font-bold">Formato de la petición</h2>
   <p className="text-sm text-slate-400">Envía JSON por POST, añade <code>x-axyon-event-id</code> único y <code>x-axyon-signature</code> con HMAC-SHA256 hexadecimal calculado sobre los bytes exactos del cuerpo usando el secreto.</p>
   <pre className="overflow-auto text-xs bg-slate-950 rounded-lg p-4">{JSON.stringify({event:"order.paid",message:"Se ha recibido un nuevo pago",reference:"PED-123"},null,2)}</pre>
  </div>
 </main>;
}
