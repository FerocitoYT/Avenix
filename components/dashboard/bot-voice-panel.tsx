"use client";
import {useEffect,useState} from "react";
type Config={enabled:boolean;triggerId:string;categoryId:string;name:string;userLimit:number;private:boolean};
type Room={channelId:string;ownerId:string;name:string;createdAt:number;private:boolean;userLimit:number};
const initial:Config={enabled:false,triggerId:"",categoryId:"",name:"Sala de {user}",userLimit:0,private:false};
const field="mt-2 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-3 text-base";
const section="min-w-0 space-y-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-6";
export function BotVoicePanel({guildId}:{guildId:string}){
 const url="/api/bot/guilds/"+guildId+"/voice";
 const [config,setConfig]=useState<Config>(initial),[rooms,setRooms]=useState<Room[]>([]),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 async function load(initialLoad=false){const r=await fetch(url,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo cargar");if(initialLoad)setConfig(d.config);setRooms(d.rooms||[]);setLoaded(true)}
 useEffect(()=>{setLoaded(false);setConfig(initial);setRooms([]);void load(true).catch(e=>setNotice(e.message))},[url]);
 async function save(){setBusy(true);setNotice("");try{const r=await fetch(url,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(config)});const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo guardar");setNotice("Configuración guardada. Se aplicará a las nuevas salas.");}catch(e){setNotice(e instanceof Error?e.message:"Error")}finally{setBusy(false)}}
 return <div className="min-w-0 space-y-4">
 {notice&&<p role="status" className="break-words rounded-xl border border-slate-700 p-3">{notice}</p>}
 <section className={section}><h3 className="font-bold">Canales de voz temporales</h3><p className="text-sm text-slate-400">Crea primero un canal de voz en Discord y copia su ID. Cuando alguien entre, el bot creará su sala y lo moverá automáticamente.</p>
 <label className="flex items-center gap-3"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/>Activar creación automática</label>
 <label className="block">Canal de entrada (ID)<input inputMode="numeric" className={field} value={config.triggerId} onChange={e=>setConfig({...config,triggerId:e.target.value.trim()})}/></label>
 <label className="block">Categoría de destino (ID opcional)<input inputMode="numeric" className={field} value={config.categoryId} onChange={e=>setConfig({...config,categoryId:e.target.value.trim()})}/><span className="text-xs text-slate-400">Si se deja vacío, utiliza la categoría del canal de entrada.</span></label>
 <label className="block">Nombre de las salas<input className={field} maxLength={70} value={config.name} onChange={e=>setConfig({...config,name:e.target.value})}/><span className="text-xs text-slate-400">Usa {"{user}"} para incluir el nombre del propietario.</span></label>
 <label className="block">Límite de usuarios (0 = sin límite)<input type="number" min={0} max={99} className={field} value={config.userLimit} onChange={e=>setConfig({...config,userLimit:Number(e.target.value)})}/></label>
 <label className="flex items-start gap-3"><input type="checkbox" checked={config.private} onChange={e=>setConfig({...config,private:e.target.checked})}/>Restringir conexión a las salas por defecto</label><p className="text-xs text-slate-400">Las reglas de Discord y los permisos de administrador pueden prevalecer. El bot necesita gestionar canales, permisos y mover miembros. Los cambios se aplican a nuevas salas.</p>
 <button disabled={!loaded||busy} onClick={()=>void save()} className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-3 disabled:opacity-40">Guardar configuración</button></section>
 <section className={section}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Salas registradas · {rooms.length}</h3><button onClick={()=>void load().catch(e=>setNotice(e.message))} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Actualizar</button></div>{rooms.map(r=><div key={r.channelId} className="space-y-1 rounded-xl border border-slate-700 p-4"><strong className="break-words">{r.name}</strong><p className="text-sm text-slate-400">{r.private?"Acceso restringido":"Pública"} · {r.userLimit?r.userLimit+" plazas":"Sin límite"}</p><p className="text-xs break-all text-slate-400">Propietario: {r.ownerId}</p><p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString("es-ES")}</p></div>)}{!rooms.length&&<p className="text-sm text-slate-400">No hay salas registradas.</p>}</section>
 </div>
}
