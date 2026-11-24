"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Service = { id:string; name:string; subscriptionActive:boolean; bot?:{id:string}|null };
export default function IntegrationsPage(){
 const [services,setServices]=useState<Service[]>([]);
 const [botId,setBotId]=useState("");
 const [storeName,setStoreName]=useState("");
 const [discordWebhookUrl,setDiscordWebhookUrl]=useState("");
 const [enabled,setEnabled]=useState(true);
 const [configured,setConfigured]=useState(false);
 const [signingSecret,setSigningSecret]=useState("");
 const [webhookPath,setWebhookPath]=useState("");
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [saving,setSaving]=useState(false);
 const [rules,setRules]=useState<{event:string;enabled:boolean}[]>([{event:"order.created",enabled:true},{event:"order.updated",enabled:true},{event:"order.deleted",enabled:false}]);
 useEffect(()=>{fetch("/api/client/bot-config",{cache:"no-store"}).then(r=>r.json()).then(d=>{
  const list=(d.services||[]).filter((s:Service)=>s.subscriptionActive&&s.bot?.id);
  setServices(list);if(list.length)setBotId(list[0].bot!.id);
 }).catch(()=>setError("No se pudieron cargar los servicios"));},[]);
 useEffect(()=>{if(!botId)return;setSigningSecret("");setWebhookPath("");fetch(`/api/bots/${botId}/integrations/woocommerce`,{cache:"no-store"}).then(r=>r.json()).then(d=>{
  setConfigured(Boolean(d.configured));setStoreName(d.storeName||"");setEnabled(d.enabled??true);
  if(d.webhookUrl)setWebhookPath(d.webhookUrl);
  if(Array.isArray(d.rules))setRules(d.rules);
 }).catch(()=>setError("No se pudo consultar la integración"));},[botId]);
 const save=async()=>{
  setSaving(true);setError("");setMessage("");
  try{
   const response=await fetch(`/api/bots/${botId}/integrations/woocommerce`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({storeName,discordWebhookUrl,enabled,rules})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"No se pudo guardar");
   setConfigured(true);setSigningSecret(data.signingSecret);
   setWebhookPath(window.location.origin+data.webhookPath);setDiscordWebhookUrl("");
   setMessage(data.message);
  }catch(e){setError(e instanceof Error?e.message:"Error guardando integración")}
  finally{setSaving(false)}
 };
 return <main className="mx-auto max-w-4xl p-6 text-white space-y-6">
  <Link href="/dashboard/bots" className="text-sm text-indigo-400">← Volver al panel</Link>
  <div><h1 className="text-3xl font-bold">Integraciones · Ecommerce</h1><p className="mt-2 text-slate-400">Conecta una tienda WordPress con WooCommerce a Discord. Cada pedido genera un aviso con formato embed, sin reiniciar el bot.</p></div>
  <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
   <h2 className="text-xl font-bold">WooCommerce → Discord</h2>
   <label className="block text-sm space-y-2">Bot contratado<select className="block w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={botId} onChange={e=>setBotId(e.target.value)}>{services.map(s=><option key={s.id} value={s.bot!.id}>{s.name}</option>)}</select></label>
   <label className="block text-sm space-y-2">Nombre de la tienda<input className="block w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="Mi tienda"/></label>
   <label className="block text-sm space-y-2">URL del webhook de Discord (canal de avisos)<input type="password" autoComplete="off" className="block w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={discordWebhookUrl} onChange={e=>setDiscordWebhookUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/…"/></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Integración activa</label>
   <div className="space-y-2"><p className="text-sm font-semibold">Avisos que quieres recibir</p>{rules.map((rule,i)=><label key={rule.event} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={rule.enabled} onChange={e=>setRules(old=>old.map((r,j)=>j===i?{...r,enabled:e.target.checked}:r))}/>{rule.event==="order.created"?"Nuevo pedido":rule.event==="order.updated"?"Pedido actualizado":"Pedido eliminado"}</label>)}</div>
   <p className="text-xs text-amber-300">Guardar vuelve a generar el secreto de firma. Tendrás que actualizarlo en los webhooks de WooCommerce.</p>
   <button disabled={saving||!botId||!storeName.trim()||!discordWebhookUrl} onClick={()=>void save()} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold disabled:opacity-50">{saving?"Guardando…":configured?"Actualizar y rotar secreto":"Crear integración"}</button>
   {error&&<p role="alert" className="text-red-400">{error}</p>}
   {message&&<p role="status" className="text-emerald-300">{message}</p>}
   {webhookPath&&<div className="space-y-2"><p className="text-sm font-semibold">URL de entrega para WooCommerce</p><code className="block break-all rounded-lg bg-slate-950 p-3 text-xs">{webhookPath}</code><button onClick={()=>navigator.clipboard.writeText(webhookPath)} className="text-indigo-400 text-sm">Copiar URL</button></div>}
   {signingSecret&&<div className="rounded-lg border border-amber-700 bg-amber-950/30 p-4 space-y-2"><strong>Secreto de firma (solo se muestra ahora)</strong><code className="block break-all text-xs">{signingSecret}</code><button className="text-indigo-300 text-sm" onClick={()=>navigator.clipboard.writeText(signingSecret)}>Copiar secreto</button></div>}
  </section>
  <Link href="/dashboard/bots/integraciones/api" className="inline-flex rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold">Conectar API personalizada → Discord</Link>
  <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
   <h2 className="font-bold">Configurar en WordPress</h2>
   <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-300">
    <li>Instala o activa WooCommerce en WordPress.</li>
    <li>En WooCommerce → Ajustes → Avanzado → Webhooks, crea un webhook activo.</li>
    <li>Selecciona el tema «Pedido creado» (order.created) y pega la URL de entrega de arriba.</li>
    <li>Pega el secreto de firma generado. Repite con «Pedido actualizado» si deseas avisos de cambios de estado.</li>
    <li>En Discord, crea un webhook en el canal donde quieres recibir los avisos y pega su URL en este formulario.</li>
   </ol>
   <p className="text-xs text-slate-500">Esta primera integración notifica eventos de pedidos. No modifica pedidos ni solicita claves de administrador de WordPress.</p>
  </section>
 </main>;
}
