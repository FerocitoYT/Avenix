"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Cookie} from "lucide-react";
const KEY="axyon:cookie-preference:v1";
const MAX_AGE=60*60*24*365;
type Choice="necessary"|"accepted";
function read():boolean{
 try{const value=JSON.parse(localStorage.getItem(KEY)||"null");if(value&&["necessary","accepted"].includes(value.choice)&&value.expires>Date.now())return true;}catch{}
 return document.cookie.split(";").some(c=>/^axyon_cookie_notice_v1=(necessary|accepted)$/.test(c.trim()));
}
export function CookieNotice(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{setOpen(!read());const show=()=>setOpen(true);const sync=(e:StorageEvent)=>{if(e.key===KEY)setOpen(!read())};window.addEventListener("axyon:cookie-settings",show);window.addEventListener("storage",sync);return()=>{window.removeEventListener("axyon:cookie-settings",show);window.removeEventListener("storage",sync)}},[]);
 function choose(choice:Choice){try{localStorage.setItem(KEY,JSON.stringify({choice,expires:Date.now()+MAX_AGE*1000}))}catch{}document.cookie="axyon_cookie_notice_v1="+choice+"; Path=/; Max-Age="+MAX_AGE+"; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"");setOpen(false);}
 if(!open)return null;
 return <aside aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-lg z-[100] rounded-2xl border border-slate-700 bg-[#111827] p-5 shadow-2xl space-y-4"><div className="flex gap-3 items-center"><Cookie className="w-6 h-6 text-blue-400"/><h2 className="text-lg font-bold text-white">Tu privacidad importa</h2></div><p className="text-sm text-slate-300">Utilizamos cookies técnicas para mantener tu sesión y proteger la plataforma. Al realizar un pago, Stripe puede utilizar tecnologías necesarias para procesarlo de forma segura. Puedes consultar los detalles en nuestra <Link className="text-blue-400 underline" href="/legal/cookies">Política de cookies</Link>.</p><p className="text-xs text-slate-400">Actualmente este aviso no activa cookies publicitarias ni de analítica opcional.</p><div className="grid grid-cols-2 gap-2"><button onClick={()=>choose("necessary")} className="rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 py-3 px-2 text-sm font-semibold text-white">Solo necesarias</button><button onClick={()=>choose("accepted")} className="rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 py-3 px-2 text-sm font-semibold text-white">Aceptar</button></div></aside>
}
export function CookieSettingsLink(){return <button type="button" className="text-left hover:text-blue-400 transition-colors" onClick={()=>window.dispatchEvent(new Event("axyon:cookie-settings"))}>Preferencias de cookies</button>}
