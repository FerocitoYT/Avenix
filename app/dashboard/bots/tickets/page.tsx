"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TranscriptAccess from "@/components/dashboard/transcript-access";
import { useSearchParams } from "next/navigation";

type Appearance={content:string;placeholder:string;buttonStyle:"Primary"|"Secondary"|"Success"|"Danger";authorName:string;authorIcon:string;footerIcon:string;titleUrl:string;timestamp:boolean;embedEnabled:boolean};
const appearanceDefault:Appearance={content:"",placeholder:"Elige el tipo de ticket",buttonStyle:"Primary",authorName:"",authorIcon:"",footerIcon:"",titleUrl:"",timestamp:false,embedEnabled:true};
type Panel = { appearance?:Partial<Appearance>; id?: string; channelId:string; title:string; description:string; colorHex:string; imageUrl:string; thumbnailUrl:string; footerText:string; componentType:"BUTTON"|"SELECT"; messageId?:string|null };
type Category = { id?:string; panelId:string|null; name:string; emoji:string; description:string; discordCategoryId:string; supportRoleIds:string[]; maxOpenPerUser:number; welcomeMessage:string; priority:"LOW"|"MEDIUM"|"HIGH"|"URGENT"; formFields:Array<{id:string;label:string;placeholder:string;required:boolean;style:"SHORT"|"PARAGRAPH"}> };
const panelDefault = ():Panel => ({channelId:"",title:"🎫 Centro de soporte",description:"Pulsa una opción para abrir un ticket privado.",colorHex:"#5865F2",imageUrl:"",thumbnailUrl:"",footerText:"",componentType:"BUTTON"});
const categoryDefault = ():Category => ({panelId:null,name:"Soporte",emoji:"📩",description:"Atención a usuarios",discordCategoryId:"",supportRoleIds:[],maxOpenPerUser:1,welcomeMessage:"¡Hola! Describe tu consulta.",priority:"MEDIUM",formFields:[]});
const control="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100";
const field="block space-y-2 text-xs font-semibold text-slate-300";

export default function TicketSettings(){
 const searchParams=useSearchParams();
 const requestedGuildId=searchParams.get("guildId")||"";
 const [guilds,setGuilds]=useState<Array<{id:string;name:string}>>([]);
 const [guildId,setGuildId]=useState("");
 const [panels,setPanels]=useState<Panel[]>([]);
 const [categories,setCategories]=useState<Category[]>([]);
 const [panel,setPanel]=useState<Panel>(panelDefault);
 const [category,setCategory]=useState<Category>(categoryDefault);
 const [roles,setRoles]=useState("");
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  void fetch("/api/client/bot-config",{cache:"no-store"}).then(r=>r.json()).then(data=>{
   const all=(data.services||[]).filter((s:any)=>s.subscriptionActive&&s.bot?.guildId).map((s:any)=>({id:s.bot.guildId,name:s.name}));
   setGuilds(all);if(all.length)setGuildId(all.some((g:{id:string})=>g.id===requestedGuildId)?requestedGuildId:all[0].id);
  }).catch(()=>setError("No se han podido cargar tus servidores."));
 },[requestedGuildId]);
 async function load(){
  if(!guildId)return;
  try {
   const response=await fetch(`/api/bot/guilds/${guildId}/tickets`,{cache:"no-store"});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Error cargando tickets");
   setPanels(data.panels||[]);setCategories(data.categories||[]);
  }catch(e){setError(e instanceof Error?e.message:"Error de conexión")}
 }
 useEffect(()=>{void load();setPanel(panelDefault());setCategory(categoryDefault());},[guildId]);
 async function save(action:string,payload:any){
  setSaving(true);setError("");setNotice("");
  try {
   const response=await fetch(`/api/bot/guilds/${guildId}/tickets`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,...payload})});
   const result=await response.json();
   if(!response.ok){
    const fields=Object.values(result.fields||{}).flat().filter(Boolean).join(". ");
    throw new Error(fields||result.error||"No se pudo guardar");
   }
   setNotice(result.message||"Cambios guardados. Discloud actualizará el panel de Discord.");
   if(result.panel?.id)setPanel({...panel,id:result.panel.id,messageId:result.panel.messageId});
   if(result.category?.id)setCategory({...category,id:result.category.id});
   await load();
  }catch(e){setError(e instanceof Error?e.message:"Error guardando los cambios")}
  finally{setSaving(false)}
 }
 const appearance={...appearanceDefault,...panel.appearance};
 const changeAppearance=(patch:Partial<Appearance>)=>setPanel(p=>({...p,appearance:{...appearanceDefault,...p.appearance,...patch}}));
 const buttonColors={Primary:"#5865f2",Secondary:"#4e5058",Success:"#248046",Danger:"#da373c"};
 const changePanel=(patch:Partial<Panel>)=>setPanel(s=>({...s,...patch}));
 const changeCategory=(patch:Partial<Category>)=>setCategory(s=>({...s,...patch}));
 return <main className="mx-auto max-w-6xl space-y-7 p-6 text-white">
  <div><Link href="/dashboard/bots" className="text-indigo-400 text-sm">← Volver al panel</Link><h1 className="mt-3 text-3xl font-bold">🎫 Configuración de tickets</h1><p className="mt-2 text-sm text-slate-400">Personaliza canales, embeds, botones, equipos de soporte, formularios y mensajes de bienvenida. El bot aplicará los cambios desde Neon.</p></div>
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex items-end gap-4 flex-wrap">
   <label className={field}>Servidor<select value={guildId} onChange={e=>setGuildId(e.target.value)} className={control}>{guilds.length===0&&<option value="">Sin servidor contratado</option>}{guilds.map(g=><option key={g.id} value={g.id}>{g.name} ({g.id})</option>)}</select></label>
   <button className="rounded-lg border border-indigo-500 px-4 py-2 text-sm" onClick={()=>void load()}>Actualizar datos</button>
  </div>
  {error&&<p role="alert" className="rounded-lg bg-red-950 border border-red-700 p-3 text-red-300">{error}</p>}
  {notice&&<p role="status" className="rounded-lg bg-emerald-950 border border-emerald-700 p-3 text-emerald-300">{notice}</p>}
  {guildId&&<TranscriptAccess key={guildId} guildId={guildId}/>}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
   <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">1. Embed y canal del panel</h2><button onClick={()=>setPanel(panelDefault())} className="text-indigo-400 text-sm">+ Nuevo</button></div>
    <label className={field}>Panel a editar<select className={control} value={panel.id||""} onChange={e=>setPanel(panels.find(p=>p.id===e.target.value)||panelDefault())}><option value="">Nuevo panel</option>{panels.map(p=><option key={p.id} value={p.id}>{p.title} · {p.channelId}</option>)}</select></label>
    <label className={field}>Canal donde enviar el panel (ID)<input className={control} value={panel.channelId} onChange={e=>changePanel({channelId:e.target.value})} placeholder="123456789012345678"/></label>
    <label className={field}>Texto fuera del embed<textarea className={control} rows={3} maxLength={2000} value={appearance.content} onChange={e=>changeAppearance({content:e.target.value})} placeholder="Mensaje opcional antes del panel"/></label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={appearance.embedEnabled} onChange={e=>changeAppearance({embedEnabled:e.target.checked})}/> Mostrar embed</label>
    <label className={field}>Título del embed<input className={control} maxLength={256} value={panel.title} onChange={e=>changePanel({title:e.target.value})}/></label>
    <label className={field}>Descripción del embed<textarea className={control} rows={4} maxLength={4000} value={panel.description} onChange={e=>changePanel({description:e.target.value})}/></label>
    <div className="grid grid-cols-2 gap-3">
     <label className={field}>Color<input className={control} type="color" value={panel.colorHex} onChange={e=>changePanel({colorHex:e.target.value})}/></label>
     <label className={field}>Apertura mediante<select className={control} value={panel.componentType} onChange={e=>changePanel({componentType:e.target.value as Panel["componentType"]})}><option value="BUTTON">Botones</option><option value="SELECT">Menú desplegable</option></select></label>
    </div>
    <label className={field}>Imagen del embed (URL https)<input className={control} value={panel.imageUrl||""} onChange={e=>changePanel({imageUrl:e.target.value})}/></label>
    <label className={field}>Miniatura (URL https)<input className={control} value={panel.thumbnailUrl||""} onChange={e=>changePanel({thumbnailUrl:e.target.value})}/></label>
    <label className={field}>Pie de página<input className={control} value={panel.footerText||""} onChange={e=>changePanel({footerText:e.target.value})}/></label>
    <label className={field}>Autor del embed<input className={control} maxLength={256} value={appearance.authorName} onChange={e=>changeAppearance({authorName:e.target.value})}/></label>
    <label className={field}>Icono del autor (URL HTTPS)<input className={control} value={appearance.authorIcon} onChange={e=>changeAppearance({authorIcon:e.target.value})}/></label>
    <label className={field}>Icono del pie (URL HTTPS)<input className={control} value={appearance.footerIcon} onChange={e=>changeAppearance({footerIcon:e.target.value})}/></label>
    <label className={field}>Enlace del título (URL HTTPS)<input className={control} value={appearance.titleUrl} onChange={e=>changeAppearance({titleUrl:e.target.value})}/></label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={appearance.timestamp} onChange={e=>changeAppearance({timestamp:e.target.checked})}/> Mostrar fecha y hora</label>
    {panel.componentType==="SELECT"?<label className={field}>Texto del menú desplegable<input className={control} maxLength={150} value={appearance.placeholder} onChange={e=>changeAppearance({placeholder:e.target.value})}/></label>:<label className={field}>Color de los botones<select className={control} value={appearance.buttonStyle} onChange={e=>changeAppearance({buttonStyle:e.target.value as Appearance["buttonStyle"]})}><option value="Primary">Azul</option><option value="Secondary">Gris</option><option value="Success">Verde</option><option value="Danger">Rojo</option></select></label>}
    <div className="rounded-xl bg-[#313338] p-4 space-y-2"><p className="text-xs text-slate-400">Vista previa del mensaje</p>{appearance.content&&<p className="whitespace-pre-wrap text-sm">{appearance.content}</p>}{appearance.embedEnabled&&<><div className="border-l-4 bg-slate-900 p-4 rounded-r-lg" style={{borderColor:panel.colorHex}}>{appearance.authorName&&<div className="flex items-center gap-2 text-xs mb-2">{appearance.authorIcon&&<img src={appearance.authorIcon} className="w-5 h-5 rounded-full" alt=""/>}{appearance.authorName}</div>}{panel.thumbnailUrl&&<img src={panel.thumbnailUrl} className="float-right w-16 h-16 object-cover rounded ml-2" alt=""/>}<strong>{panel.title}</strong><p className="whitespace-pre-wrap text-sm text-slate-300 mt-2">{panel.description}</p>{panel.imageUrl&&<img src={panel.imageUrl} alt="Vista previa" className="mt-2 rounded max-h-40"/>}<p className="text-xs text-slate-400 mt-3 flex gap-2 items-center">{appearance.footerIcon&&panel.footerText&&<img src={appearance.footerIcon} className="w-4 h-4 rounded-full" alt=""/>}{panel.footerText}{appearance.timestamp&&" · Hoy"}</p></div></>}{panel.componentType==="SELECT"?<select className="w-full rounded-md bg-[#1e1f22] p-2 text-sm" defaultValue=""><option value="">{appearance.placeholder}</option>{categories.filter(c=>c.panelId&&c.panelId===panel.id).map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select>:<div className="flex gap-2 flex-wrap">{categories.filter(c=>c.panelId&&c.panelId===panel.id).map(c=><span key={c.id} style={{background:buttonColors[appearance.buttonStyle]}} className="rounded-md px-3 py-2 text-xs">{c.emoji} {c.name}</span>)}</div>}</div>
    <button disabled={saving||!guildId||!/^\d{17,22}$/.test(panel.channelId)} onClick={()=>void save("SAVE_PANEL",{panel:{...panel,appearance}})} className="w-full rounded-lg bg-indigo-600 p-3 disabled:opacity-50 font-semibold">Guardar panel y sincronizar con Discord</button>
    {panel.id&&<button disabled={saving} onClick={()=>{if(window.confirm("¿Eliminar la configuración del panel?"))void save("DELETE_PANEL",{panelId:panel.id}).then(()=>setPanel(panelDefault()))}} className="text-red-400 text-sm">Eliminar panel de la web</button>}
    {panel.messageId&&<p className="text-xs text-slate-500">Mensaje publicado: {panel.messageId}</p>}
   </section>
   <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
    <div className="flex justify-between"><h2 className="text-lg font-bold">2. Categorías y tickets privados</h2><button className="text-indigo-400 text-sm" onClick={()=>{setCategory(categoryDefault());setRoles("")}}>+ Nueva</button></div>
    <label className={field}>Categoría a editar<select className={control} value={category.id||""} onChange={e=>{const c=categories.find(x=>x.id===e.target.value)||categoryDefault();setCategory({...c,formFields:Array.isArray(c.formFields)?c.formFields:[]});setRoles(c.supportRoleIds.join(", "))}}><option value="">Nueva categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></label>
    <label className={field}>Panel asociado<select className={control} value={category.panelId||""} onChange={e=>changeCategory({panelId:e.target.value||null})}><option value="">Sin asociar</option>{panels.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    <div className="grid grid-cols-4 gap-3"><label className={field}>Emoji<input className={control} value={category.emoji} onChange={e=>changeCategory({emoji:e.target.value})}/></label><label className={field+" col-span-3"}>Nombre del botón<input className={control} value={category.name} onChange={e=>changeCategory({name:e.target.value})}/></label></div>
    <label className={field}>Descripción<input className={control} value={category.description} onChange={e=>changeCategory({description:e.target.value})}/></label>
    <label className={field}>Categoría de Discord donde se crean los canales (ID)<input className={control} value={category.discordCategoryId} onChange={e=>changeCategory({discordCategoryId:e.target.value})}/></label>
    <label className={field}>IDs de roles de soporte (separados por comas)<input className={control} value={roles} onChange={e=>setRoles(e.target.value)} placeholder="123456789012345678, ..."/></label>
    <div className="grid grid-cols-2 gap-3">
     <label className={field}>Máximo de tickets por usuario<input className={control} type="number" min={1} max={20} value={category.maxOpenPerUser} onChange={e=>changeCategory({maxOpenPerUser:Number(e.target.value)})}/></label>
     <label className={field}>Prioridad<select className={control} value={category.priority} onChange={e=>changeCategory({priority:e.target.value as Category["priority"]})}><option value="LOW">Baja</option><option value="MEDIUM">Media</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></label>
    </div>
    <label className={field}>Mensaje dentro del ticket<textarea className={control} rows={3} value={category.welcomeMessage} onChange={e=>changeCategory({welcomeMessage:e.target.value})}/></label>
    <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-sm">Preguntas de apertura (máx. 5)</h3><button disabled={category.formFields.length>=5} className="text-indigo-400 text-sm disabled:opacity-50" onClick={()=>changeCategory({formFields:[...category.formFields,{id:"q"+Date.now(),label:"Nueva pregunta",placeholder:"Escribe tu respuesta",required:true,style:"PARAGRAPH"}]})}>+ Añadir</button></div>
     {category.formFields.map((q,i)=><div key={q.id} className="border border-slate-700 rounded-lg p-3 space-y-2"><input className={control} value={q.label} maxLength={45} onChange={e=>changeCategory({formFields:category.formFields.map((v,j)=>j===i?{...v,label:e.target.value}:v)})}/><input className={control} value={q.placeholder} placeholder="Texto de ejemplo" onChange={e=>changeCategory({formFields:category.formFields.map((v,j)=>j===i?{...v,placeholder:e.target.value}:v)})}/><div className="flex items-center gap-3 text-xs"><label><input type="checkbox" checked={q.required} onChange={e=>changeCategory({formFields:category.formFields.map((v,j)=>j===i?{...v,required:e.target.checked}:v)})}/> Obligatoria</label><select className="bg-slate-950 rounded p-2" value={q.style} onChange={e=>changeCategory({formFields:category.formFields.map((v,j)=>j===i?{...v,style:e.target.value as "SHORT"|"PARAGRAPH"}:v)})}><option value="SHORT">Respuesta corta</option><option value="PARAGRAPH">Párrafo</option></select><button className="text-red-400" onClick={()=>changeCategory({formFields:category.formFields.filter((_,j)=>j!==i)})}>Eliminar</button></div></div>)}
    </div>
    <button disabled={saving||!guildId||!/^\d{17,22}$/.test(category.discordCategoryId)} onClick={()=>void save("SAVE_CATEGORY",{category:{...category,supportRoleIds:roles.split(",").map(s=>s.trim()).filter(Boolean)}})} className="w-full rounded-lg bg-indigo-600 p-3 disabled:opacity-50 font-semibold">Guardar categoría y opciones de apertura</button>
    {category.id&&<button disabled={saving} onClick={()=>{if(window.confirm("¿Eliminar categoría?"))void save("DELETE_CATEGORY",{categoryId:category.id}).then(()=>setCategory(categoryDefault()))}} className="text-red-400 text-sm">Eliminar categoría</button>}
   </section>
  </div>
  <p className="text-sm text-slate-400">La publicación se confirma cuando el bot está conectado y tiene permisos. Configurar un panel no significa que Discord lo haya publicado todavía.</p>
 </main>;
}
