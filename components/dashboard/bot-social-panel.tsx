"use client";
import {useEffect,useState} from "react";
type Sub={integrationId?:string;platform:string;name:string;channelId:string;enabled:boolean;message:string};
const empty:Sub={platform:"youtube",name:"",channelId:"",enabled:false,message:""};
export function BotSocialPanel({botId}:{botId:string}){
 const url="/api/bots/"+encodeURIComponent(botId)+"/integrations/social";
 const [items,setItems]=useState<Sub[]>([]);const [draft,setDraft]=useState<Sub>(empty);const [webhook,setWebhook]=useState("");const [status,setStatus]=useState("");const [busy,setBusy]=useState(false);const [loaded,setLoaded]=useState(false);
 async function load(){const r=await fetch(url,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Error");setItems(d.subscriptions);setLoaded(true);}
 useEffect(()=>{setLoaded(false);setDraft(empty);setWebhook("");setItems([]);void load().catch(e=>setStatus(e.message))},[url]);
 async function save(){setBusy(true);setStatus("");try{const r=await fetch(url,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,discordWebhookUrl:webhook||undefined})});const d=await r.json();if(!r.ok)throw Error(d.error);setDraft({...draft,integrationId:d.integrationId});setWebhook("");await load();setStatus("Suscripción guardada");}catch(e){setStatus(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 async function remove(){if(!draft.integrationId||!confirm("¿Eliminar suscripción?"))return;setBusy(true);try{const r=await fetch(url+"?integrationId="+encodeURIComponent(draft.integrationId),{method:"DELETE"});if(!r.ok)throw Error("No se pudo eliminar");setDraft(empty);setWebhook("");await load();setStatus("Suscripción eliminada")}catch(e){setStatus(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 const field="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 mt-2";
 return <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4"><h2 className="text-xl font-bold">Avisos de redes sociales</h2><p className="text-sm text-slate-400">YouTube requiere una clave API en el host. Los demás detectores están pendientes; guardar una cuenta no activa la detección automática.</p>
 <div className="flex flex-wrap gap-2">{items.map(x=><button key={x.integrationId} onClick={()=>{setDraft(x);setWebhook("")}} className="rounded-lg border border-slate-700 px-3 py-2">{x.name} · {x.platform} · {x.enabled?"Activo":"Desactivado"}</button>)}<button onClick={()=>{setDraft(empty);setWebhook("")}} className="rounded-lg bg-indigo-600 px-3 py-2">Nueva cuenta</button></div>
 <label className="block">Plataforma<select className={field} value={draft.platform} onChange={e=>setDraft({...draft,platform:e.target.value,channelId:""})}>{["youtube","twitch","kick","tiktok","instagram","x"].map(p=><option key={p} value={p}>{p}</option>)}</select></label>
 <label className="block">Nombre<input className={field} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
 <label className="block">{draft.platform==="youtube"?"ID del canal (UC...)":"Usuario o ID de cuenta"}<input className={field} value={draft.channelId} onChange={e=>setDraft({...draft,channelId:e.target.value})}/></label>
 <label className="block">Webhook de Discord<input type="password" autoComplete="off" className={field} value={webhook} onChange={e=>setWebhook(e.target.value)} placeholder={draft.integrationId?"Dejar vacío para conservar":"URL del webhook"}/></label>
 <label className="block">Mensaje personalizado<textarea className={field} maxLength={500} value={draft.message} onChange={e=>setDraft({...draft,message:e.target.value})}/></label>
 <label className="flex gap-2"><input type="checkbox" checked={draft.enabled} onChange={e=>setDraft({...draft,enabled:e.target.checked})}/>Activar suscripción</label>
 <div className="flex gap-3"><button disabled={!loaded||busy} onClick={()=>void save()} className="rounded-lg bg-indigo-600 px-4 py-3 disabled:opacity-40">Guardar</button>{draft.integrationId&&<button disabled={busy} onClick={()=>void remove()} className="rounded-lg border border-red-800 px-4 py-3">Eliminar</button>}</div>{status&&<p role="status">{status}</p>}</section>
}
