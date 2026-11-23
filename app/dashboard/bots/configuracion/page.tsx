"use client";

import React, {useEffect,useState} from "react";
import Link from "next/link";

type Service = {id:string;name:string;planName:string;subscriptionActive:boolean;expiresAt:string|null;bot:{id:string;applicationId:string|null;guildId:string|null;status:string;tokenConfigured:boolean}|null};
export default function ConfiguracionBot() {
 const [services,setServices]=useState<Service[]>([]);
 const [selected,setSelected]=useState("");
 const [applicationId,setApplicationId]=useState("");
 const [guildId,setGuildId]=useState("");
 const [botToken,setBotToken]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const load=async()=>{
   try {
     const res=await fetch("/api/client/bot-config",{cache:"no-store"});
     if(!res.ok) throw new Error("No se pudieron cargar tus servicios");
     const data=await res.json();
     setServices(data.services||[]);
     setSelected((prev:string)=>prev||data.services?.[0]?.id||"");
   }catch(e){setError(e instanceof Error?e.message:"Error de conexión");}
   finally{setLoading(false);}
 };
 useEffect(()=>{void load()},[]);
 const service=services.find(s=>s.id===selected);
 useEffect(()=>{
   setApplicationId(service?.bot?.applicationId||"");
   setGuildId(service?.bot?.guildId||"");
   setBotToken("");setMessage("");setError("");
 },[selected,services]);
 const save=async(e:React.FormEvent)=>{
   e.preventDefault();setSaving(true);setError("");setMessage("");
   try {
     const res=await fetch("/api/client/bot-config",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceId:selected,applicationId,guildId,botToken})});
     const data=await res.json();
     if(!res.ok) { const details = data.fields && typeof data.fields === "object" ? Object.values(data.fields as Record<string, string[]>).flat().filter(Boolean).join(". ") : ""; throw new Error(details || data.error || "No se pudo guardar"); }
     setMessage(data.message);setBotToken("");
     await load();
   }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}
   finally{setSaving(false);}
 };
 return <main className="max-w-3xl mx-auto p-5 md:p-10 text-slate-100 space-y-6">
   <div><Link href="/dashboard/bots" className="text-sm text-blue-400">← Volver al panel</Link><h1 className="text-3xl font-bold mt-3">Configurar bot de cliente</h1><p className="text-slate-400 mt-2">Cada bot tiene su propia configuración y utiliza la infraestructura compartida de Axyon.</p></div>
   {loading?<p>Cargando servicios…</p>:services.length===0?<div className="rounded-xl bg-slate-900 p-6">No tienes servicios de bot asociados a esta cuenta.</div>:<>
     <label className="block text-sm">Servicio<select className="block mt-2 w-full rounded-lg bg-slate-900 border border-slate-700 p-3" value={selected} onChange={e=>setSelected(e.target.value)}>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
     {service&&!service.subscriptionActive?<p className="rounded-xl bg-amber-950 p-4 text-amber-300">La suscripción no está vigente. No puedes modificar el bot.</p>:service&&<form onSubmit={save} className="space-y-5 rounded-2xl bg-slate-900 border border-slate-800 p-5">
       <div className="flex flex-wrap gap-3 text-sm"><span className="text-emerald-400">Suscripción activa</span><span className="text-slate-400">Hasta {service.expiresAt?new Date(service.expiresAt).toLocaleDateString("es-ES"):"—"}</span><span className="text-slate-400">Proceso: {service.bot?.status||"Sin provisionar"}</span></div>
       <label className="block text-sm">ID de aplicación (Client ID)<input required pattern="[0-9]{17,20}" value={applicationId} onChange={e=>setApplicationId(e.target.value)} placeholder="ID de aplicación de Discord" className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/></label>
       <label className="block text-sm">ID del servidor de Discord (opcional)<input pattern="[0-9]{17,20}" value={guildId} onChange={e=>setGuildId(e.target.value)} placeholder="Guild ID" className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/></label>
       <label className="block text-sm">Token del bot<input type="password" autoComplete="new-password" value={botToken} onChange={e=>setBotToken(e.target.value)} placeholder={service.bot?.tokenConfigured?"Token guardado •••• (dejar vacío para mantener)":"Introduce el token de Discord"} className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-700 p-3"/><span className="text-xs text-slate-400 mt-1 block">Se cifra en el servidor y no vuelve a mostrarse. No lo compartas en tickets ni mensajes.</span></label>
       <p className="text-sm text-amber-300">Guardar la configuración no inicia el bot. El host debe confirmar la conexión real antes de mostrarlo como Online.</p>
       <button disabled={saving||!service.bot} className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3 font-semibold">{saving?"Guardando…":"Guardar configuración"}</button>
     </form>}
   </>}
   {message&&<p role="status" className="text-emerald-400">{message}</p>}
   {error&&<p role="alert" className="text-red-400">{error}</p>}
 </main>;
}
