"use client";
import {useEffect,useState} from "react";
type Config={enabled:boolean;roleId:string;logChannelId:string;maxDays:number};
type RecordItem={userId:string;reason:string;status:string;endAt:number;error?:string};
export function BotAbsencePanel({guildId}:{guildId:string}){
 const [config,setConfig]=useState<Config>({enabled:false,roleId:"",logChannelId:"",maxDays:7});
 const [records,setRecords]=useState<RecordItem[]>([]);
 const [userId,setUserId]=useState("");const [reason,setReason]=useState("");const [days,setDays]=useState(1);
 const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 const url=`/api/bot/guilds/${guildId}/absences`;
 useEffect(()=>{let alive=true;setLoaded(false);fetch(url,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(alive){setConfig(d.config);setRecords(d.records);setLoaded(true)}}).catch(e=>{if(alive)setMessage(e.message)});return()=>{alive=false}},[url]);
 async function refresh(){const r=await fetch(url,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setRecords(d.records)}
 async function send(method:string,body:unknown){setBusy(true);setMessage("");try{const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);setMessage(method==="POST"?"Configuración guardada":"Solicitud registrada. Actualiza para consultar el resultado del bot.");await refresh()}catch(e){setMessage(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 const field="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 mt-2";
 return <div className="space-y-5">
 {message&&<p role="status" className="rounded-xl border border-slate-700 p-3">{message}</p>}
 <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4"><h3 className="font-bold">Configuración de ausencias</h3>
 <label className="flex gap-2"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/>Activar sistema</label>
 <label className="block">Rol de ausencia (ID)<input className={field} value={config.roleId} onChange={e=>setConfig({...config,roleId:e.target.value})}/></label>
 <label className="block">Canal de registros (ID)<input className={field} value={config.logChannelId} onChange={e=>setConfig({...config,logChannelId:e.target.value})}/></label>
 <label className="block">Duración máxima (días)<input className={field} type="number" min={1} max={30} value={config.maxDays} onChange={e=>setConfig({...config,maxDays:+e.target.value})}/></label>
 <button disabled={!loaded||busy} onClick={()=>void send("POST",config)} className="rounded-xl bg-blue-600 px-4 py-3 disabled:opacity-50">Guardar configuración</button></section>
 <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4"><h3 className="font-bold">Registrar ausencia</h3>
 <label className="block">Usuario de Discord (ID)<input className={field} value={userId} onChange={e=>setUserId(e.target.value)}/></label>
 <label className="block">Motivo<textarea className={field} value={reason} onChange={e=>setReason(e.target.value)} maxLength={500}/></label>
 <label className="block">Días<input className={field} type="number" min={1} max={config.maxDays} value={days} onChange={e=>setDays(+e.target.value)}/></label>
 <button disabled={!loaded||busy||!config.enabled} onClick={()=>void send("PUT",{action:"START",userId,reason,days})} className="rounded-xl bg-blue-600 px-4 py-3 disabled:opacity-50">Registrar ausencia</button></section>
 <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-3"><div className="flex justify-between"><h3 className="font-bold">Ausencias registradas</h3><button onClick={()=>void refresh().catch(e=>setMessage(e.message))}>Actualizar</button></div>
 {records.map(r=><div key={r.userId} className="rounded-xl border border-slate-700 p-4 space-y-2"><p>{r.userId} · {r.status}</p><p className="text-sm text-slate-400">{r.reason} · Fin: {new Date(r.endAt).toLocaleString("es-ES")}</p>{r.error&&<p className="text-red-400">{r.error}</p>}{r.status==="ACTIVE"&&<button disabled={busy} onClick={()=>void send("PUT",{action:"END",userId:r.userId})} className="rounded-lg border px-3 py-2">Finalizar ausencia</button>}</div>)}
 {!records.length&&<p className="text-slate-400">No hay registros.</p>}</section></div>
}
