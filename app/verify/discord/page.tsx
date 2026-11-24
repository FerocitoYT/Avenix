"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function Result(){
 const p=useSearchParams();const ok=p.get("status")==="success";const msg=p.get("message");
 return <main className="min-h-screen bg-[#070d18] text-white flex items-center justify-center p-6"><div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 text-center"><div className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center text-2xl ${ok?"bg-emerald-500/10 text-emerald-300":"bg-red-500/10 text-red-300"}`}>{ok?"✓":"!"}</div><h1 className="mt-5 text-2xl font-bold">{ok?"Verificación completada":"No se pudo verificar"}</h1><p className="mt-3 text-sm text-slate-400">{ok?"Tu cuenta de Discord ha quedado autorizada correctamente. Ya puedes volver a Discord.":msg||"Vuelve a intentarlo desde el botón de verificación del servidor."}</p></div></main>
}
export default function Page(){return <Suspense><Result/></Suspense>}
