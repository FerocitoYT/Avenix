"use client";

import React, {useEffect,useState} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Service = {id:string;name:string;planName:string;subscriptionActive:boolean;expiresAt:string|null;bot:{id:string;applicationId:string|null;guildId:string|null;status:string;observedStatus?:string;lastPingAt?:string|null;tokenConfigured:boolean;oauthConfigured?:boolean}|null};
export default function ConfiguracionBot() {
 const searchParams=useSearchParams();
 const requestedBotId=searchParams.get("botId")||"";
 const [services,setServices]=useState<Service[]>([]);
 const [selected,setSelected]=useState("");
 const [applicationId,setApplicationId]=useState("");
 const [guildId,setGuildId]=useState("");
 const [botToken,setBotToken]=useState("");
 const [oauthClientSecret,setOauthClientSecret]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [presence,setPresence]=useState({activityType:"PLAYING",activityText:"prueba",availability:"online"});
 const [presenceSaving,setPresenceSaving]=useState(false);
 const load=async()=>{
   try {
     const res=await fetch("/api/client/bot-config",{cache:"no-store"});
     if(!res.ok) throw new Error("No se pudieron cargar tus servicios");
     const data=await res.json();
     const activeServices=(data.services||[]).filter((service:Service)=>service.subscriptionActive);
     setServices(activeServices);
     const requestedService=activeServices.find((service:Service)=>service.bot?.id===requestedBotId);
     setSelected((prev:string)=>requestedService?.id||(activeServices.some((service:Service)=>service.id===prev)?prev:activeServices?.[0]?.id||""));
   }catch(e){setError(e instanceof Error?e.message:"Error de conexión");}
   finally{setLoading(false);}
 };
 useEffect(()=>{void load()},[requestedBotId]);
 useEffect(()=>{
   const instanceId=services.find(s=>s.id===selected)?.bot?.id;
   if(!instanceId)return;
   void fetch("/api/bots/"+instanceId+"/presence",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{
     if(d?.activityType)setPresence({activityType:d.activityType,activityText:d.activityText,availability:d.availability});
   }).catch(()=>{});
 },[selected,services.map(s=>s.bot?.id).join(",")]);
 const savePresence=async()=>{
   const instanceId=services.find(s=>s.id===selected)?.bot?.id;
   if(!instanceId)return;
   setPresenceSaving(true);setError("");setMessage("");
   try {
     const r=await fetch("/api/bots/"+instanceId+"/presence",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(presence)});
     const d=await r.json();
     if(!r.ok)throw new Error(d.error||"No se pudo actualizar la actividad");
     setMessage(d.message||"Actividad guardada");
   }catch(e){setError(e instanceof Error?e.message:"Error guardando presencia")}
   finally{setPresenceSaving(false);}
 };
 const service=services.find(s=>s.id===selected);
 useEffect(()=>{
   setApplicationId(service?.bot?.applicationId||"");
   setGuildId(service?.bot?.guildId||"");
   setBotToken("");setOauthClientSecret("");setMessage("");setError("");
 },[selected]);
 const save=async(e:React.FormEvent)=>{
   e.preventDefault();setSaving(true);setError("");setMessage("");
   try {
     const res=await fetch("/api/client/bot-config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceId:selected,applicationId,guildId,botToken,oauthClientSecret})});
     const data=await res.json();
     if(!res.ok) { const details = data.fields && typeof data.fields === "object" ? Object.values(data.fields as Record<string, string[]>).flat().filter(Boolean).join(". ") : ""; throw new Error(details || data.error || "No se pudo guardar"); }
     setMessage(data.message);setBotToken("");setOauthClientSecret("");
     await load();
   }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}
   finally{setSaving(false);}
 };
 return <main className="max-w-3xl mx-auto p-5 md:p-10 text-slate-100 space-y-6">
   <div><Link href="/dashboard/bots" className="text-sm text-blue-400">← Volver al panel</Link><h1 className="text-3xl font-bold mt-3">Configurar bot de cliente</h1><p className="text-slate-400 mt-2">Cada bot tiene su propia configuración y utiliza la infraestructura compartida de Axyon.</p></div>
   {loading?<p>Cargando servicios…</p>:services.length===0?<div className="rounded-xl border border-amber-800 bg-amber-950/30 p-6 space-y-2"><h2 className="font-bold text-amber-300">No tienes una suscripción de bot activa</h2><p className="text-sm text-slate-400">Las opciones de administración se bloquean automáticamente cuando termina la suscripción. Al renovar, volverán a estar disponibles.</p></div>:<>
     <label className="block text-sm">Servicio<select className="block mt-2 w-full rounded-lg bg-slate-900 border border-slate-700 p-3" value={selected} onChange={e=>setSelected(e.target.value)}>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
     {service&&!service.subscriptionActive?<p className="rounded-xl bg-amber-950 p-4 text-amber-300">La suscripción no está vigente. No puedes modificar el bot.</p>:service&&<form onSubmit={save} className="space-y-5 rounded-2xl bg-slate-900 border border-slate-800 p-5">
       <div className="flex flex-wrap gap-3 text-sm"><span className="text-emerald-400">Suscripción activa</span><span className="text-slate-400">Hasta {service.expiresAt?new Date(service.expiresAt).toLocaleDateString("es-ES"):"—"}</span><span className="text-slate-400">Estado real: {service.bot?.observedStatus==="RUNNING"?"Conectado":service.bot?.observedStatus==="RESTARTING"?"Iniciando":service.bot?.observedStatus==="ERROR"?"Error de conexión":service.bot?.observedStatus==="OFFLINE"?"Sin conexión con Discloud":service.bot?.status==="STOPPED"?"Detenido":"Sin confirmar"}</span></div>
       <label className="block text-sm">ID de aplicación (Client ID)<input required pattern="[0-9]{17,20}" value={applicationId} onChange={e=>setApplicationId(e.target.value)} placeholder="ID de aplicación de Discord" className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/></label>
       <label className="block text-sm">ID del servidor de Discord<input required pattern="[0-9]{17,20}" value={guildId} onChange={e=>setGuildId(e.target.value)} placeholder="Guild ID" className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/></label>
       <label className="block text-sm">Client Secret OAuth2<input type="password" autoComplete="new-password" value={oauthClientSecret} onChange={e=>setOauthClientSecret(e.target.value)} placeholder={service.bot?.oauthConfigured?"Client Secret guardado •••• (dejar vacío para mantener)":"Client Secret de OAuth2 de Discord"} className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/><span className="text-xs text-slate-400 mt-1 block">Necesario para la verificación OAuth y restauración de miembros. Se cifra y nunca vuelve a mostrarse.</span></label>
       <label className="block text-sm">Token del bot<input type="password" autoComplete="new-password" value={botToken} onChange={e=>setBotToken(e.target.value)} placeholder={service.bot?.tokenConfigured?"Token guardado •••• (dejar vacío para mantener)":"Introduce el token de Discord"} className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/><span className="text-xs text-slate-400 mt-1 block">Se cifra en el servidor y no vuelve a mostrarse. No lo compartas en tickets ni mensajes.</span></label>
       <p className="text-sm text-amber-300">Al guardar se solicita automáticamente el inicio. El estado cambiará a RUNNING cuando Discloud confirme la conexión con Discord.</p>
       <button disabled={saving||!service.bot} className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3 font-semibold">{saving?"Guardando…":"Guardar configuración"}</button>
     </form>}
     {service?.bot && <section className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-5">
       <h2 className="text-lg font-bold">Actividad y estado de Discord</h2>
       <p className="text-sm text-slate-400">Personaliza lo que aparece debajo del nombre de tu bot. Se sincroniza sin reiniciarlo.</p>
       <label className="block text-sm">Actividad
         <select value={presence.activityType} onChange={e=>setPresence({...presence,activityType:e.target.value})} className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3">
           <option value="PLAYING">Jugando a...</option><option value="WATCHING">Viendo...</option><option value="LISTENING">Escuchando...</option><option value="COMPETING">Compitiendo en...</option>
         </select>
       </label>
       <label className="block text-sm">Texto de la actividad
         <input value={presence.activityText} maxLength={128} onChange={e=>setPresence({...presence,activityText:e.target.value})} placeholder="prueba" className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/>
       </label>
       <label className="block text-sm">Disponibilidad
         <select value={presence.availability} onChange={e=>setPresence({...presence,availability:e.target.value})} className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3">
           <option value="online">En línea</option><option value="idle">Ausente</option><option value="dnd">No molestar</option><option value="invisible">Invisible</option>
         </select>
       </label>
       <p className="text-sm text-slate-400">Vista previa: {presence.activityType==="PLAYING"?"Jugando a ":presence.activityType==="WATCHING"?"Viendo ":presence.activityType==="LISTENING"?"Escuchando ":"Compitiendo en "}<strong className="text-white">{presence.activityText||"..."}</strong></p>
       <button type="button" disabled={presenceSaving||!presence.activityText.trim()||!service.subscriptionActive} onClick={()=>void savePresence()} className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{presenceSaving?"Guardando...":"Guardar actividad"}</button>
     </section>}
   </>}
   {message&&<p role="status" className="text-emerald-400">{message}</p>}
   {error&&<p role="alert" className="text-red-400">{error}</p>}
 </main>;
}
