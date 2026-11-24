"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
export type Language="es"|"en";
const Context=createContext({lang:"es" as Language,setLang:(_l:Language)=>{},t:(es:string,_en:string)=>es});
export function LanguageProvider({children,initialLanguage="es"}:{children:ReactNode;initialLanguage?:Language}){
 const [lang,setLanguage]=useState<Language>(initialLanguage);
 useEffect(()=>{try{const saved=localStorage.getItem("axyon:language");if(saved==="es"||saved==="en")setLanguage(saved)}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=lang},[lang]);
 function setLang(l:Language){setLanguage(l);try{localStorage.setItem("axyon:language",l);document.cookie="axyon_language="+l+"; Path=/; Max-Age=31536000; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"")}catch{}}
 return <Context.Provider value={{lang,setLang,t:(es,en)=>lang==="en"?en:es}}>{children}</Context.Provider>
}
export const useLanguage=()=>useContext(Context);
export function LanguageSelector(){const {lang,setLang}=useLanguage();return <select aria-label="Language / Idioma" value={lang} onChange={e=>setLang(e.target.value as Language)} className="rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs px-2 py-2"><option value="es">ES</option><option value="en">EN</option></select>}
