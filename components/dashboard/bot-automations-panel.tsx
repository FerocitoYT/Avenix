"use client";

import { useEffect, useState } from "react";

type Condition = { field: string; operator: string; value: string };
type Product = { id: string; name: string; variants: { id: string; name: string }[] };
type Action = { id?: string; type: string; targetId?: string; payload?: Record<string, any> };
type Flow = { id?: string; name: string; enabled: boolean; event: string; conditions: Condition[]; actions: Action[]; executionCount?: number };
const makeId = () => `node-${Math.random().toString(36).slice(2, 10)}`;
const empty = (): Flow => ({ name: "Nueva automatización", enabled: false, event: "MEMBER_JOIN", conditions: [], actions: [{ id: makeId(), type: "SEND_CHANNEL_MESSAGE", targetId: "", payload: { content: "¡Bienvenido {user.tag}!" } }] });
const actionNames: Record<string, string> = {
  SEND_CHANNEL_MESSAGE: "Enviar mensaje a un canal", SEND_DM: "Enviar mensaje privado",
  ADD_ROLE: "Asignar rol", REMOVE_ROLE: "Retirar rol",
  SELLAUTH_PRODUCT_REQUEST: "Formulario de productos SellAuth",
  REQUEST_APPROVAL: "Aprobación del staff", SELLAUTH_CREATE_COUPON: "Crear cupón SellAuth",
};
const actionIcons: Record<string, string> = {
  SEND_CHANNEL_MESSAGE: "💬", SEND_DM: "✉️", ADD_ROLE: "➕", REMOVE_ROLE: "➖",
  SELLAUTH_PRODUCT_REQUEST: "🛍️", REQUEST_APPROVAL: "🛡️", SELLAUTH_CREATE_COUPON: "🎟️",
};

export function BotAutomationsPanel({ guildId, botId }: { guildId: string; botId: string }) {
  const url = "/api/bot/guilds/" + guildId + "/automations";
  const sellAuthUrl = "/api/bots/" + encodeURIComponent(botId) + "/integrations/sellauth";
  const [flows, setFlows] = useState<Flow[]>([]);
  const [draft, setDraft] = useState<Flow>(empty);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [selected, setSelected] = useState("trigger");
  const [dragged, setDragged] = useState<number | null>(null);
  const [paletteSearch, setPaletteSearch] = useState("");

  async function load() {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudieron cargar las automatizaciones.");
    setFlows(data.flows || []); setLoaded(true);
  }
  async function loadCatalog() {
    const response = await fetch(sellAuthUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation: "products" }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo consultar el catálogo SellAuth.");
    setProducts(data.products || []); setCatalogLoaded(true);
  }
  useEffect(() => {
    setLoaded(false); setDraft(empty()); setMessage("");
    void load().catch(error => setMessage(error instanceof Error ? error.message : "Error"));
  }, [url]);

  async function save() {
    setBusy(true);
    try {
      const normalized = { ...draft, actions: draft.actions.map(({ id: _id, ...item }) => item) };
      const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalized) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el flujo.");
      await load(); setMessage("Automatización guardada correctamente.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error guardando la automatización."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!draft.id || !confirm("¿Eliminar esta automatización?")) return;
    setBusy(true);
    try {
      const response = await fetch(url + "?id=" + encodeURIComponent(draft.id), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar.");
      await load(); setDraft(empty()); setSelected("trigger"); setMessage("Automatización eliminada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error eliminando."); }
    finally { setBusy(false); }
  }
  const field = "mt-1 w-full rounded-lg border border-slate-700 bg-[#080f1c] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500";
  const label = "block text-xs font-medium text-slate-400";
  const panel = "rounded-xl border border-slate-800 bg-[#101a2b]";
  const selectedActionIndex = selected.startsWith("action:") ? Number(selected.split(":")[1]) : -1;
  const selectedAction = draft.actions[selectedActionIndex];
  const setAction = (index: number, patch: Partial<Action>) => setDraft(value => ({ ...value, actions: value.actions.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  const setPayload = (index: number, patch: Record<string, any>) => setAction(index, { payload: { ...(draft.actions[index]?.payload || {}), ...patch } });
  const setCondition = (index: number, patch: Partial<Condition>) => setDraft(value => ({ ...value, conditions: value.conditions.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  const addAction = (type: string) => {
    if (type === "CONDITION") { setDraft(value => ({ ...value, conditions: [...value.conditions, { field: "user.tag", operator: "CONTAINS", value: "" }] })); setSelected("conditions"); return; }
    if (draft.actions.length >= 5) { setMessage("El límite actual es de 5 acciones por automatización."); return; }
    if (type === "SELLAUTH_PRODUCT_REQUEST" && draft.actions.some(item => item.type === type)) { setMessage("Solo se permite un formulario de productos por flujo."); return; }
    const payload = type === "SEND_CHANNEL_MESSAGE" || type === "SEND_DM" ? { content: "" }
      : type === "SELLAUTH_PRODUCT_REQUEST" ? { maxSelections: 5, restrictProducts: false, allowedProducts: [], recipientMode: "REQUESTER" }
      : type === "REQUEST_APPROVAL" ? { staffRoleIds: [], title: "Solicitud pendiente de aprobación", description: "Solicitud de {user.tag}: {request.summary}" }
      : type === "SELLAUTH_CREATE_COUPON" ? { discountType: "PERCENTAGE", discount: 10, appliesTo: "one_time", subscriptionPayments: 1, storeWide: false, products: [], productVariants: [], limit: 1 }
      : {};
    const item: Action = { id: makeId(), type, targetId: ["SEND_CHANNEL_MESSAGE", "ADD_ROLE", "REMOVE_ROLE", "REQUEST_APPROVAL"].includes(type) ? "" : undefined, payload };
    setDraft(value => ({ ...value, actions: type === "SELLAUTH_PRODUCT_REQUEST" ? [item, ...value.actions] : [...value.actions, item] }));
    setSelected(`action:${type === "SELLAUTH_PRODUCT_REQUEST" ? 0 : draft.actions.length}`);
    if (type.startsWith("SELLAUTH_") && !catalogLoaded) void loadCatalog().catch(error => setMessage(error instanceof Error ? error.message : "No se pudo cargar SellAuth."));
  };
  const moveAction = (from: number, to: number) => {
    if (from === to || to < 0 || to >= draft.actions.length) return;
    setDraft(value => { const actions = [...value.actions]; const [item] = actions.splice(from, 1); actions.splice(to, 0, item); return { ...value, actions }; });
    setSelected(`action:${to}`);
  };
  const nodeButton = "flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-[#0b1422] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10";
  const paletteItems = [
    { group: "Discord", items: [{ type: "SEND_CHANNEL_MESSAGE", title: "Enviar mensaje" }, { type: "SEND_DM", title: "Mensaje privado" }, { type: "ADD_ROLE", title: "Asignar rol" }, { type: "REMOVE_ROLE", title: "Retirar rol" }] },
    { group: "SellAuth", items: [{ type: "SELLAUTH_PRODUCT_REQUEST", title: "Formulario de productos" }, { type: "SELLAUTH_CREATE_COUPON", title: "Crear cupón" }] },
    { group: "Lógica", items: [{ type: "CONDITION", title: "Condición / filtro" }] },
    { group: "Control", items: [{ type: "REQUEST_APPROVAL", title: "Aprobación del staff" }] },
  ];
  const filteredPalette = paletteItems.map(group => ({ ...group, items: group.items.filter(item => item.title.toLowerCase().includes(paletteSearch.toLowerCase())) })).filter(group => group.items.length);

  return <div className="space-y-4 text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold tracking-tight">Automatizaciones</h2><p className="mt-1 text-xs text-slate-500">Diseña procesos conectando bloques. Selecciona cada bloque para configurarlo.</p></div>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Abrir automatización" className="rounded-lg border border-slate-700 bg-[#101a2b] px-3 py-2 text-sm" value={draft.id || "new"} onChange={event => { const flow = flows.find(item => item.id === event.target.value); setDraft(flow ? { ...flow, actions: flow.actions.map(action => ({ ...action, id: makeId() })) } : empty()); setSelected("trigger"); }}>
          <option value="new">Nueva automatización</option>{flows.map(flow => <option key={flow.id} value={flow.id}>{flow.name} · {flow.enabled ? "Activa" : "Pausada"}</option>)}
        </select>
        <button onClick={() => { setDraft(empty()); setSelected("trigger"); setMessage(""); }} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">+ Nueva</button>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-[#101a2b] p-3">
      <input aria-label="Nombre de la automatización" className="min-w-[220px] flex-1 rounded-lg border border-slate-700 bg-[#080f1c] px-3 py-2 text-sm" maxLength={100} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Nombre de la automatización"/>
      <label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={draft.enabled} onChange={event => setDraft({ ...draft, enabled: event.target.checked })}/> Publicada</label>
      <span className="text-xs text-slate-500">{draft.executionCount || 0} ejecuciones</span>
      <button disabled={!loaded || busy} onClick={() => void save()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500 disabled:opacity-40">{busy ? "Guardando…" : "Guardar cambios"}</button>
      {draft.id && <button disabled={busy} onClick={() => void remove()} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40">Eliminar</button>}
    </div>

    <div className="grid min-h-[720px] gap-3 xl:grid-cols-[220px_minmax(420px,1fr)_320px]">
      <aside className={panel + " h-fit p-3"}>
        <div className="mb-3"><h3 className="text-sm font-semibold">Bloques</h3><p className="mt-1 text-[11px] text-slate-500">Añade pasos a tu automatización</p></div>
        <input className={field} value={paletteSearch} onChange={event => setPaletteSearch(event.target.value)} placeholder="Buscar bloque…"/>
        <div className="mt-4 space-y-4">{filteredPalette.map(group => <div key={group.group}><p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.group}</p><div className="space-y-1.5">{group.items.map(item => <button key={item.type} className={nodeButton} onClick={() => addAction(item.type)}><span className="text-base">{actionIcons[item.type]}</span><span className="flex-1">{item.title}</span><span className="text-slate-600">+</span></button>)}</div></div>)}</div>
        <div className="mt-5 border-t border-slate-800 pt-3"><p className="text-[11px] leading-5 text-slate-500">Arrastra los bloques del tablón para cambiar el orden. El flujo se ejecuta siguiendo las conexiones.</p></div>
      </aside>

      <main className={panel + " relative overflow-hidden"}>
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div><p className="text-xs font-semibold text-slate-200">Lienzo del flujo</p><p className="text-[10px] text-slate-500">Disparador → lógica → acciones</p></div><span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] text-slate-400">{1 + (draft.conditions.length ? 1 : 0) + draft.actions.length} bloques</span></div>
        <div className="relative min-h-[650px] overflow-auto bg-[#080f1b]" style={{ backgroundImage: "radial-gradient(#25344a 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <div className="mx-auto flex min-w-[300px] max-w-[570px] flex-col items-center px-6 py-8">
            <button onClick={() => setSelected("trigger")} className={`relative z-10 w-full rounded-xl border p-4 text-left shadow-lg transition ${selected === "trigger" ? "border-blue-400 bg-blue-950/70 ring-2 ring-blue-500/20" : "border-blue-900 bg-[#10213a] hover:border-blue-500"}`}>
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/15 text-xl">⚡</span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Disparador</p><p className="mt-1 truncate text-sm font-semibold">{draft.event === "MEMBER_JOIN" ? "Cuando entra un miembro" : draft.event === "MESSAGE_SENT" ? "Cuando se envía un mensaje" : draft.event === "MEMBER_LEAVE" ? "Cuando sale un miembro" : "Comando personalizado"}</p></div><span className="text-[10px] text-blue-300">INICIO</span></div>
            </button>
            <div className="h-5 w-px bg-gradient-to-b from-blue-400 to-slate-600"/>
            <button onClick={() => addAction("CONDITION")} className="mb-1 rounded-full border border-dashed border-amber-800 px-3 py-1.5 text-[10px] text-amber-300 hover:bg-amber-950/30">+ Añadir condición</button>
            <div className="h-5 w-px bg-slate-600"/>
            {draft.conditions.length > 0 && <><button onClick={() => setSelected("conditions")} className={`relative z-10 w-full rounded-xl border p-4 text-left transition ${selected === "conditions" ? "border-amber-400 bg-amber-950/50 ring-2 ring-amber-500/20" : "border-amber-900/70 bg-[#292013] hover:border-amber-500"}`}><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/15 text-xl">◇</span><div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Condiciones</p><p className="mt-1 text-sm font-semibold">{draft.conditions.length} regla(s) · Todas deben cumplirse</p></div></div></button><div className="h-9 w-px bg-slate-600"/></>}
            {draft.actions.map((item, index) => <div key={item.id || index} className="w-full">
              <button draggable onDragStart={() => setDragged(index)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragged !== null) moveAction(dragged, index); setDragged(null); }} onDragEnd={() => setDragged(null)} onClick={() => setSelected(`action:${index}`)} className={`relative z-10 w-full rounded-xl border p-4 text-left shadow-lg transition ${selected === `action:${index}` ? "border-emerald-400 bg-emerald-950/50 ring-2 ring-emerald-500/20" : "border-slate-700 bg-[#111e30] hover:border-slate-500"} ${dragged === index ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-xl">{actionIcons[item.type] || "▣"}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Paso {index + 1}</p><p className="mt-1 truncate text-sm font-semibold">{actionNames[item.type] || item.type}</p><p className="mt-1 truncate text-[10px] text-slate-500">{item.type === "SELLAUTH_CREATE_COUPON" ? "SellAuth · configuración de cupón" : item.type === "REQUEST_APPROVAL" ? "Esperar decisión del staff" : item.type === "SELLAUTH_PRODUCT_REQUEST" ? "Formulario interactivo en Discord" : "Acción de Discord"}</p></div><span className="cursor-grab text-slate-600" title="Arrastrar para reordenar">⠿</span></div>
              </button>
              {index < draft.actions.length - 1 && <div className="flex h-9 flex-col items-center"><div className="h-full w-px bg-slate-600"/><span className="-mt-1 text-[9px] text-slate-600">↓</span></div>}
            </div>)}
            <div className="mt-2 h-7 w-px bg-slate-700"/>
            <button onClick={() => addAction("SEND_CHANNEL_MESSAGE")} className="rounded-full border border-dashed border-slate-600 px-4 py-2 text-xs text-slate-400 transition hover:border-blue-500 hover:text-blue-300">+ Añadir paso</button>
            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-[10px] text-slate-500">FIN DEL FLUJO</div>
          </div>
        </div>
      </main>

      <aside className={panel + " h-fit p-4"}>
        <div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Configuración</h3><p className="mt-1 text-[10px] text-slate-500">Propiedades del bloque seleccionado</p></div><span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-400">{selected === "trigger" ? "INICIO" : selected === "conditions" ? "LÓGICA" : "ACCIÓN"}</span></div>
        {selected === "trigger" && <div className="space-y-4">
          <label className={label}>¿Cuándo se inicia?<select className={field} value={draft.event} onChange={event => { const next = event.target.value; setDraft(value => ({ ...value, event: next, conditions: next === "SLASH_COMMAND" ? [...value.conditions.filter(c => c.field !== "command.name"), { field: "command.name", operator: "EQUALS", value: "mi-comando" }] : value.conditions.filter(c => c.field !== "command.name") })); }}>{[["MEMBER_JOIN","Cuando entra un miembro"],["MESSAGE_SENT","Cuando se envía un mensaje"],["MEMBER_LEAVE","Cuando sale un miembro"],["SLASH_COMMAND","Cuando se ejecuta un comando"]].map(([value,title]) => <option key={value} value={value}>{title}</option>)}</select></label>
          {draft.event === "SLASH_COMMAND" && <label className={label}>Nombre del comando (sin /)<input className={field} value={draft.conditions.find(c => c.field === "command.name")?.value || ""} onChange={event => setDraft(value => ({ ...value, conditions: value.conditions.map(c => c.field === "command.name" ? { ...c, value: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") } : c) }))} placeholder="solicitar-cupon"/></label>}
          <div className="rounded-lg bg-blue-950/30 p-3 text-[11px] leading-5 text-blue-200">Este bloque inicia el flujo. Añade después condiciones y acciones desde la biblioteca de bloques.</div>
        </div>}
        {selected === "conditions" && <div className="space-y-3">
          <p className="text-[11px] leading-5 text-slate-400">El flujo continuará únicamente si se cumplen todas las reglas configuradas.</p>
          {draft.conditions.map((condition, index) => <div key={index} className="space-y-2 rounded-lg border border-slate-800 p-3">
            <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-amber-300">Regla {index + 1}</span><button onClick={() => setDraft(value => ({ ...value, conditions: value.conditions.filter((_, i) => i !== index) }))} className="text-[10px] text-red-300">Quitar</button></div>
            <select className={field} value={condition.field} onChange={event => setCondition(index, { field: event.target.value })}>{["user.id","user.tag","user.accountAgeDays","message.content","message.channelId","member","command.name"].map(value => <option key={value}>{value}</option>)}</select>
            <select className={field} value={condition.operator} onChange={event => setCondition(index, { operator: event.target.value })}>{["EQUALS","NOT_EQUALS","CONTAINS","STARTS_WITH","ENDS_WITH","GREATER_THAN","LESS_THAN","HAS_ROLE"].map(value => <option key={value}>{value}</option>)}</select>
            <input className={field} value={condition.value} onChange={event => setCondition(index, { value: event.target.value })} placeholder="Valor"/>
          </div>)}
          <button disabled={draft.conditions.length >= 10} onClick={() => setDraft(value => ({ ...value, conditions: [...value.conditions, { field: "user.tag", operator: "CONTAINS", value: "" }] }))} className="w-full rounded-lg border border-dashed border-amber-800 py-2 text-xs text-amber-300 disabled:opacity-40">+ Añadir regla</button>
        </div>}
        {selected.startsWith("action:") && selectedAction && <div className="space-y-3">
          <div className="rounded-lg bg-emerald-950/30 p-3"><p className="text-xs font-semibold text-emerald-200">{actionNames[selectedAction.type]}</p><p className="mt-1 text-[10px] text-slate-500">Configura qué debe hacer este bloque.</p></div>
          {["SEND_CHANNEL_MESSAGE","ADD_ROLE","REMOVE_ROLE","REQUEST_APPROVAL"].includes(selectedAction.type) && <label className={label}>{selectedAction.type === "REQUEST_APPROVAL" ? "Canal de revisión (ID)" : selectedAction.type === "SEND_CHANNEL_MESSAGE" ? "Canal de Discord (ID)" : "Rol de Discord (ID)"}<input className={field} value={selectedAction.targetId || ""} onChange={event => setAction(selectedActionIndex, { targetId: event.target.value })} placeholder="ID de Discord"/></label>}
          {selectedAction.type.startsWith("SEND_") && <label className={label}>Contenido del mensaje<textarea className={field + " min-h-28"} maxLength={1800} value={selectedAction.payload?.content || ""} onChange={event => setPayload(selectedActionIndex, { content: event.target.value })} placeholder="Escribe el mensaje…"/></label>}
          {selectedAction.type === "REQUEST_APPROVAL" && <>
            <label className={label}>Roles autorizados (IDs separados por comas)<input className={field} value={(selectedAction.payload?.staffRoleIds || []).join(", ")} onChange={event => setPayload(selectedActionIndex, { staffRoleIds: event.target.value.split(",").map((v: string) => v.trim()).filter(Boolean) })}/></label>
            <label className={label}>Título<input className={field} maxLength={256} value={selectedAction.payload?.title || ""} onChange={event => setPayload(selectedActionIndex, { title: event.target.value })}/></label>
            <label className={label}>Descripción<textarea className={field} maxLength={1500} value={selectedAction.payload?.description || ""} onChange={event => setPayload(selectedActionIndex, { description: event.target.value })}/></label>
          </>}
          {selectedAction.type === "SELLAUTH_PRODUCT_REQUEST" && <>
            <label className={label}>Máximo de productos/variantes<input className={field} type="number" min="1" max="25" value={selectedAction.payload?.maxSelections ?? 5} onChange={event => setPayload(selectedActionIndex, { maxSelections: Math.max(1, Math.min(25, Number(event.target.value) || 1)) })}/></label>
            <label className={label}>Destinatario<select className={field} value={selectedAction.payload?.recipientMode || "REQUESTER"} onChange={event => setPayload(selectedActionIndex, { recipientMode: event.target.value })}>{[["REQUESTER","Quien ejecuta el comando"],["DISCORD_USER","Otro usuario Discord"],["EMAIL","Correo electrónico"],["DISCORD_AND_EMAIL","Usuario Discord y correo"],["NONE","Sin campo adicional"]].map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label>
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={selectedAction.payload?.restrictProducts === true} onChange={event => setPayload(selectedActionIndex, { restrictProducts: event.target.checked, allowedProducts: event.target.checked ? selectedAction.payload?.allowedProducts || [] : [] })}/>Limitar productos disponibles</label>
            {selectedAction.payload?.restrictProducts && <label className={label}>Productos permitidos<select multiple className={field + " min-h-28"} value={selectedAction.payload?.allowedProducts || []} onChange={event => setPayload(selectedActionIndex, { allowedProducts: Array.from(event.target.selectedOptions).map(option => option.value) })}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>}
            <button onClick={() => void loadCatalog().catch(error => setMessage(error instanceof Error ? error.message : "Error cargando catálogo."))} className="text-xs text-blue-300">{catalogLoaded ? "Actualizar catálogo" : "Cargar catálogo SellAuth"}</button>
          </>}
          {selectedAction.type === "SELLAUTH_CREATE_COUPON" && <>
            <label className={label}>Código (vacío = aleatorio)<input className={field} maxLength={64} value={selectedAction.payload?.code || ""} onChange={event => setPayload(selectedActionIndex, { code: event.target.value })} placeholder="CUPON-{user.id}"/></label>
            <div className="grid grid-cols-2 gap-2"><label className={label}>Tipo<select className={field} value={selectedAction.payload?.discountType || "PERCENTAGE"} onChange={event => setPayload(selectedActionIndex, { discountType: event.target.value, maximumDiscountAmount: event.target.value === "AMOUNT" ? "" : selectedAction.payload?.maximumDiscountAmount })}><option value="PERCENTAGE">Porcentaje</option><option value="AMOUNT">Importe</option></select></label><label className={label}>Descuento<input className={field} type="number" min="1" step="0.01" value={selectedAction.payload?.discount ?? 10} onChange={event => setPayload(selectedActionIndex, { discount: Number(event.target.value) })}/></label></div>
            <label className={label}>Aplicar a<select className={field} value={selectedAction.payload?.appliesTo || "one_time"} onChange={event => setPayload(selectedActionIndex, { appliesTo: event.target.value })}><option value="one_time">Compras únicas</option><option value="subscriptions">Suscripciones</option></select></label>
            {selectedAction.payload?.appliesTo === "subscriptions" && <label className={label}>Pagos con descuento (1–36)<input className={field} type="number" min="1" max="36" value={selectedAction.payload?.subscriptionPayments ?? 1} onChange={event => setPayload(selectedActionIndex, { subscriptionPayments: Number(event.target.value) })}/></label>}
            {selectedAction.payload?.discountType !== "AMOUNT" && <label className={label}>Límite de descuento por pedido (opcional)<input className={field} type="number" min="1" step="0.01" value={selectedAction.payload?.maximumDiscountAmount ?? ""} onChange={event => setPayload(selectedActionIndex, { maximumDiscountAmount: event.target.value === "" ? "" : Number(event.target.value) })}/></label>}
            <label className={label}>Compra mínima (opcional)<input className={field} type="number" min="1" step="0.01" value={selectedAction.payload?.minimumAmount ?? ""} onChange={event => setPayload(selectedActionIndex, { minimumAmount: event.target.value === "" ? "" : Number(event.target.value) })}/></label>
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={selectedAction.payload?.useRequestedProducts === true} onChange={event => setPayload(selectedActionIndex, { useRequestedProducts: event.target.checked })}/>Usar productos elegidos en el formulario anterior</label>
            {!selectedAction.payload?.useRequestedProducts && <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={selectedAction.payload?.storeWide === true} onChange={event => setPayload(selectedActionIndex, { storeWide: event.target.checked, products: event.target.checked ? [] : selectedAction.payload?.products || [] })}/>Aplicar a toda la tienda</label>}
            {!selectedAction.payload?.useRequestedProducts && !selectedAction.payload?.storeWide && <><label className={label}>Productos permitidos<select multiple className={field + " min-h-28"} value={selectedAction.payload?.products || []} onChange={event => setPayload(selectedActionIndex, { products: Array.from(event.target.selectedOptions).map(option => option.value), productVariants: [] })}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>{products.some(product => (selectedAction.payload?.products || []).includes(product.id) && product.variants.length > 0) && <label className={label}>Variantes permitidas (opcional)<select multiple className={field + " min-h-28"} value={selectedAction.payload?.productVariants || []} onChange={event => setPayload(selectedActionIndex, { productVariants: Array.from(event.target.selectedOptions).map(option => option.value) })}>{products.filter(product => (selectedAction.payload?.products || []).includes(product.id)).flatMap(product => product.variants.map(variant => <option key={variant.id} value={variant.id}>{product.name} · {variant.name}</option>))}</select><span className="mt-1 block text-[10px] text-slate-500">Si no eliges variantes de un producto, se permiten todas sus variantes.</span></label>}</>}
            <div className="grid grid-cols-2 gap-2"><label className={label}>Usos máximos<input className={field} type="number" min="1" value={selectedAction.payload?.limit ?? 1} onChange={event => setPayload(selectedActionIndex, { limit: Number(event.target.value) })}/></label><label className={label}>Caducidad<input className={field} type="datetime-local" value={selectedAction.payload?.expiresAt ? new Date(new Date(selectedAction.payload.expiresAt).getTime() - new Date(selectedAction.payload.expiresAt).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ""} onChange={event => setPayload(selectedActionIndex, { expiresAt: event.target.value ? new Date(event.target.value).toISOString() : "" })}/></label></div>
            <label className={label}>Mensaje de éxito<input className={field} value={selectedAction.payload?.successMessage || ""} onChange={event => setPayload(selectedActionIndex, { successMessage: event.target.value })}/></label>
            <button onClick={() => void loadCatalog().catch(error => setMessage(error instanceof Error ? error.message : "Error cargando catálogo."))} className="text-xs text-blue-300">{catalogLoaded ? "Actualizar catálogo" : "Cargar catálogo SellAuth"}</button>
            <p className="text-[10px] leading-4 text-slate-500">Las variantes se aplican mediante las restricciones del producto. Si necesitas restringir variantes concretas, selecciona primero los productos y configura sus variantes en SellAuth.</p>
          </>}
          <div className="flex gap-2 border-t border-slate-800 pt-3"><button onClick={() => { setDraft(value => ({ ...value, actions: value.actions.filter((_, i) => i !== selectedActionIndex) })); setSelected("trigger"); }} className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-300">Eliminar bloque</button><div className="ml-auto flex gap-1"><button disabled={selectedActionIndex <= 0} onClick={() => moveAction(selectedActionIndex, selectedActionIndex - 1)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs disabled:opacity-30">↑</button><button disabled={selectedActionIndex >= draft.actions.length - 1} onClick={() => moveAction(selectedActionIndex, selectedActionIndex + 1)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs disabled:opacity-30">↓</button></div></div>
        </div>}
        {!selected.startsWith("action:") && selected !== "trigger" && selected !== "conditions" && <p className="text-xs text-slate-500">Selecciona un bloque para editar sus propiedades.</p>}
        {selected === "trigger" && draft.event === "MEMBER_LEAVE" && <p className="mt-3 rounded-lg bg-amber-950/30 p-3 text-[10px] leading-4 text-amber-200">En el evento de salida solo se permiten acciones de mensaje a canal.</p>}
        <div className="mt-5 border-t border-slate-800 pt-3"><p className="text-[10px] leading-5 text-slate-500">Variables: {"{user.id}"}, {"{user.tag}"}, {"{message.content}"}, {"{request.summary}"}, {"{coupon.code}"}.</p></div>
      </aside>
    </div>
    {message && <p role="status" className="rounded-lg border border-slate-800 bg-[#101a2b] px-4 py-3 text-xs text-slate-300">{message}</p>}
  </div>;
}
