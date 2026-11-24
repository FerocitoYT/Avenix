"use client";
import {useEffect,useState} from "react";
type Job={id?:string;name:string;channelId:string;content:string;nextAt:number;repeat:"ONCE"|"DAILY"|"WEEKLY";enabled:boolean;status?:string;lastSentAt?:number;lastError?:string};
const empty=():Job=>({name:"",channelId:"",content:"",nextAt:Date.now()+3600000,repeat:"ONCE",enabled:true});
function localDate(ms:number){const d=new Date(ms);return new Date(ms-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
export function BotScheduledMessagesPanel({guildId}:{guildId:string}){
 const url="/api/bot/guilds/"+guildId+"/scheduled-messages";
 const [items,setItems]=useState<Job[]>([]);const [draft,setDraft]=useState<Job>(empty);const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 async function load(){const r=await fetch(url,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Error de carga");setItems(d.messages);setLoaded(true)}
 useEffect(()=>{setLoaded(false);setDraft(empty());void load().catch(e=>setMessage(e.message))},[url]);
 async function save(){setBusy(true);setMessage("");try{const r=await fetch(url,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});const d=await r.json();if(!r.ok)throw Error(d.error||"Error guardando");await load();setDraft(empty());setMessage("Mensaje guardado")}catch(e){setMessage(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 async function remove(){if(!draft.id||!confirm("¿Eliminar este mensaje programado?"))return;setBusy(true);try{const r=await fetch(url+"?id="+encodeURIComponent(draft.id),{method:"DELETE"});const d=await r.json();if(!r.ok)throw Error(d.error);await load();setDraft(empty());setMessage("Mensaje eliminado")}catch(e){setMessage(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 const field="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 mt-2";const section="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4";
 return <div className="space-y-5">{message&&<p role="status" className="rounded-xl border border-slate-700 p-3">{message}</p>}
 <section className={section}><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold">Mensajes programados · {items.length}/100</h3><div className="flex gap-3"><button onClick={()=>void load().catch(e=>setMessage(e.message))}>Actualizar</button><button onClick={()=>setDraft(empty())} className="rounded-xl bg-blue-600 px-3 py-2">Nuevo mensaje</button></div></div>
 {items.map(j=><button key={j.id} onClick={()=>setDraft(j)} className="block w-full text-left rounded-xl border border-slate-700 p-4"><div className="flex justify-between gap-3"><strong>{j.name}</strong><span>{j.status}</span></div><p className="text-xs text-slate-400">Próximo: {new Date(j.nextAt).toLocaleString("es-ES")} · {j.repeat}</p>{j.lastSentAt&&<p className="text-xs text-slate-400">Último envío: {new Date(j.lastSentAt).toLocaleString("es-ES")}</p>}{j.lastError&&<p className="text-xs text-red-400">{j.lastError}</p>}</button>)}{!items.length&&<p className="text-slate-400">No hay mensajes programados.</p>}</section>
 <section className={section}><h3 className="font-bold">{draft.id?"Editar mensaje":"Crear mensaje programado"}</h3>
 <label className="block">Nombre<input className={field} maxLength={100} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 <label className="block">Canal de Discord (ID)<input className={field} value={draft.channelId} onChange={e=>setDraft({...draft,channelId:e.target.value})}/></label>
 <label className="block">Mensaje<textarea rows={5} className={field} maxLength={2000} value={draft.content} onChange={e=>setDraft({...draft,content:e.target.value})}/><span className="text-xs text-slate-400">{draft.content.length}/2000</span></label>
 <label className="block">Fecha y hora local<input type="datetime-local" className={field} value={Number.isFinite(draft.nextAt)?localDate(draft.nextAt):""} onChange={e=>setDraft({...draft,nextAt:new Date(e.target.value).getTime()})}/></label>
 <label className="block">Repetición<select className={field} value={draft.repeat} onChange={e=>setDraft({...draft,repeat:e.target.value as Job["repeat"]})}><option value="ONCE">Una vez</option><option value="DAILY">Cada 24 horas</option><option value="WEEKLY">Cada 7 días</option></select></label>
 <label className="flex gap-2"><input type="checkbox" checked={draft.enabled} onChange={e=>setDraft({...draft,enabled:e.target.checked})}/>Activar programación</label>
 <p className="text-xs text-slate-400">Los intervalos recurrentes son fijos. Las menciones no generan notificaciones. El bot debe estar conectado y tener permiso de envío.</p>
 <div className="flex gap-3"><button disabled={!loaded||busy} onClick={()=>void save()} className="rounded-xl bg-blue-600 px-4 py-3 disabled:opacity-40">Guardar mensaje</button>{draft.id&&<button disabled={busy} onClick={()=>void remove()} className="rounded-xl border border-red-800 px-4 py-3">Eliminar</button>}</div></section></div>
}
