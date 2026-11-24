"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Save, Sparkles } from "lucide-react";

type StudioEmbed = {
  id?: string;
  name: string;
  content: string | null;
  embedData: {
    title?: string;
    description?: string;
    color?: string;
    authorName?: string;
    footerText?: string;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  };
  components: unknown[];
  isDraft: boolean;
};

const emptyEmbed = (): StudioEmbed => ({
  name: "Nuevo diseño",
  content: null,
  embedData: {
    title: "⚡ Anuncio de la Comunidad",
    description: "Escribe aquí el contenido del embed.",
    color: "#3B82F6",
    authorName: "Axyon",
    footerText: "Axyon Bot",
    fields: [],
  },
  components: [],
  isDraft: true,
});

export function BotStudioPanel({ guildId }: { guildId: string }) {
  const [items,setItems]=useState<StudioEmbed[]>([]);
  const [current,setCurrent]=useState<StudioEmbed>(emptyEmbed());
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  const load=async()=>{
    setLoading(true);
    try{
      const response=await fetch(`/api/bot/guilds/${guildId}/studio`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"No se pudo cargar Studio");
      const loaded=(data.embeds||[]).map((embed:any)=>({
        ...embed,
        embedData: typeof embed.embedData==="object"&&embed.embedData?embed.embedData:{},
        components:Array.isArray(embed.components)?embed.components:[],
      }));
      setItems(loaded);
      if(loaded.length)setCurrent(loaded[0]);
      setError("");
    }catch(e){setError(e instanceof Error?e.message:"Error cargando Studio")}
    finally{setLoading(false)}
  };

  useEffect(()=>{void load()},[guildId]);

  const data=current.embedData||{};
  const updateData=(patch:Partial<StudioEmbed["embedData"]>)=>setCurrent(prev=>({...prev,embedData:{...prev.embedData,...patch}}));

  async function save(){
    setSaving(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/bot/guilds/${guildId}/studio`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(current),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"No se pudo guardar el diseño");
      setCurrent(result.embed);
      setItems(prev=>{
        const exists=prev.some(item=>item.id===result.embed.id);
        return exists?prev.map(item=>item.id===result.embed.id?result.embed:item):[result.embed,...prev];
      });
      setMessage("Diseño guardado correctamente.");
    }catch(e){setError(e instanceof Error?e.message:"Error guardando diseño")}
    finally{setSaving(false)}
  }

  return <div className="space-y-5">
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between rounded-2xl border border-slate-800 bg-[#111827] p-4">
      <div className="flex-1">
        <label className="text-xs text-slate-400">Diseño</label>
        <select
          value={current.id||""}
          onChange={e=>{
            const found=items.find(item=>item.id===e.target.value);
            if(found)setCurrent(found);
          }}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
        >
          {!current.id&&<option value="">Nuevo diseño</option>}
          {items.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <button onClick={()=>{setCurrent(emptyEmbed());setMessage("");setError("")}} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800">
        <Plus className="w-4 h-4"/>Nuevo
      </button>
      <button onClick={()=>void save()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50">
        <Save className="w-4 h-4"/>{saving?"Guardando…":"Guardar diseño"}
      </button>
    </div>

    {error&&<div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
    {message&&<div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300"><CheckCircle2 className="w-4 h-4"/>{message}</div>}

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div><label className="text-xs text-slate-400">Nombre del diseño</label><input value={current.name} onChange={e=>setCurrent(prev=>({...prev,name:e.target.value}))} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"/></div>
        <div><label className="text-xs text-slate-400">Título</label><input value={data.title||""} onChange={e=>updateData({title:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"/></div>
        <div><label className="text-xs text-slate-400">Descripción</label><textarea rows={6} value={data.description||""} onChange={e=>updateData({description:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"/></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-400">Color</label><div className="mt-2 flex gap-2"><input type="color" value={data.color||"#3B82F6"} onChange={e=>updateData({color:e.target.value})} className="h-10 w-12 rounded-lg bg-transparent"/><input value={data.color||"#3B82F6"} onChange={e=>updateData({color:e.target.value})} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono"/></div></div>
          <div><label className="text-xs text-slate-400">Autor</label><input value={data.authorName||""} onChange={e=>updateData({authorName:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"/></div>
        </div>
        <div><label className="text-xs text-slate-400">Pie de página</label><input value={data.footerText||""} onChange={e=>updateData({footerText:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"/></div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#0e1626] p-6">
        <div className="flex items-center gap-2 mb-5"><Sparkles className="w-4 h-4 text-amber-400"/><h3 className="font-bold">Previsualización de Discord</h3></div>
        <div className="max-w-xl rounded-lg bg-[#2B2D31] p-4 text-slate-100 border-l-4" style={{borderColor:data.color||"#3B82F6"}}>
          {data.authorName&&<p className="mb-1 text-xs font-semibold text-slate-300">{data.authorName}</p>}
          {data.title&&<h4 className="mb-2 text-sm font-bold text-white">{data.title}</h4>}
          {data.description&&<p className="whitespace-pre-line text-xs leading-relaxed text-slate-300">{data.description}</p>}
          {!!data.fields?.length&&<div className="mt-3 grid grid-cols-2 gap-2">{data.fields.map((field,i)=><div key={i} className="rounded bg-[#1E1F22] p-2"><p className="text-[11px] font-bold">{field.name}</p><p className="text-[11px] text-slate-400">{field.value}</p></div>)}</div>}
          {data.footerText&&<p className="mt-3 border-t border-slate-700/60 pt-2 text-[10px] text-slate-400">{data.footerText}</p>}
        </div>
        {loading&&<p className="mt-4 text-xs text-slate-500">Cargando diseños…</p>}
      </section>
    </div>
  </div>;
}
