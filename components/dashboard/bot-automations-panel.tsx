"use client";

import { useEffect, useState } from "react";

type Condition = { field: string; operator: string; value: string };
type Product = { id: string; name: string; variants: { id: string; name: string }[] };
type Action = { type: string; targetId?: string; payload?: Record<string, any> };
type Flow = { id?: string; name: string; enabled: boolean; event: string; conditions: Condition[]; actions: Action[]; executionCount?: number };
const empty = (): Flow => ({ name: "", enabled: false, event: "MEMBER_JOIN", conditions: [], actions: [{ type: "SEND_CHANNEL_MESSAGE", targetId: "", payload: { content: "Bienvenido {user.tag}" } }] });

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

  async function load() {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudieron cargar las automatizaciones.");
    setFlows(data.flows || []);
    setLoaded(true);
  }

  async function loadCatalog() {
    const response = await fetch(sellAuthUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation: "products" }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo consultar el catálogo SellAuth.");
    setProducts(data.products || []);
    setCatalogLoaded(true);
  }

  useEffect(() => {
    setLoaded(false); setDraft(empty()); setMessage("");
    void load().catch(error => setMessage(error instanceof Error ? error.message : "Error"));
  }, [url]);

  async function save() {
    setBusy(true);
    try {
      const response = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el flujo.");
      await load(); setDraft(empty()); setMessage("Flujo guardado correctamente.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error guardando el flujo."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!draft.id || !confirm("¿Eliminar este flujo?")) return;
    setBusy(true);
    try {
      const response = await fetch(url + "?id=" + encodeURIComponent(draft.id), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar.");
      await load(); setDraft(empty()); setMessage("Flujo eliminado.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error eliminando el flujo."); }
    finally { setBusy(false); }
  }

  const field = "w-full rounded-xl bg-slate-950 border border-slate-700 p-3 mt-2 text-sm text-white";
  const card = "rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-3";
  const condition = (index: number, patch: Partial<Condition>) => setDraft(value => ({ ...value, conditions: value.conditions.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  const action = (index: number, patch: Partial<Action>) => setDraft(value => ({ ...value, actions: value.actions.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  const updatePayload = (index: number, patch: Record<string, any>) => {
    const current = draft.actions[index];
    action(index, { payload: { ...(current.payload || {}), ...patch } });
  };

  return <div className="space-y-4">
    <section className={card}>
      <h3 className="font-bold text-white">Mis automatizaciones</h3>
      <div className="flex flex-wrap gap-2">
        {flows.map(flow => <button key={flow.id} onClick={() => setDraft(flow)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">{flow.name} · {flow.enabled ? "Activo" : "Pausado"} · {flow.executionCount || 0} ejecuciones</button>)}
        <button onClick={() => setDraft(empty())} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold">Nuevo flujo</button>
      </div>
      <label className="block text-sm text-slate-300">Nombre del flujo<input className={field} maxLength={100} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Ej. Cupón de bienvenida"/></label>
      <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={draft.enabled} onChange={event => setDraft({ ...draft, enabled: event.target.checked })}/>Activar flujo</label>
    </section>

    <section className={card}>
      <h3 className="font-bold text-blue-300">1 · Disparador</h3>
      <select aria-label="Evento" className={field} value={draft.event} onChange={event => { const nextEvent = event.target.value; setDraft({ ...draft, event: nextEvent, conditions: nextEvent === "SLASH_COMMAND" ? [...draft.conditions.filter(condition => condition.field !== "command.name"), { field: "command.name", operator: "EQUALS", value: "solicitar-cupon" }] : draft.conditions.filter(condition => condition.field !== "command.name") }); }}>
        <option value="MEMBER_JOIN">Cuando entra un miembro</option>
        <option value="MESSAGE_SENT">Cuando se recibe un mensaje</option>
        <option value="MEMBER_LEAVE">Cuando sale un miembro</option>
        <option value="SLASH_COMMAND">Cuando se ejecuta un comando personalizado</option>
      </select>
      <p className="text-xs text-slate-500">Los comandos slash personalizados se registran al iniciar el bot. Los disparadores de botones y formularios se ampliarán con nuevos bloques.</p>
    </section>

    <section className={card}>
      <h3 className="font-bold text-amber-300">2 · Condiciones</h3>
      <p className="text-xs text-slate-400">Todas las condiciones deben cumplirse. Puedes combinarlas para limitar cuándo se ejecuta el flujo.</p>
      {draft.conditions.map((item, index) => <div key={index} className="grid gap-2 sm:grid-cols-3">
        <select aria-label="Campo" className={field} value={item.field} onChange={event => condition(index, { field: event.target.value })}>{["user.id", "user.tag", "user.accountAgeDays", "message.content", "message.channelId", "member", "command.name"].map(value => <option key={value}>{value}</option>)}</select>
        <select aria-label="Operador" className={field} value={item.operator} onChange={event => condition(index, { operator: event.target.value })}>{["EQUALS", "NOT_EQUALS", "CONTAINS", "STARTS_WITH", "ENDS_WITH", "GREATER_THAN", "LESS_THAN", "HAS_ROLE"].map(value => <option key={value}>{value}</option>)}</select>
        <input aria-label="Valor" className={field} value={item.value} onChange={event => condition(index, { value: event.target.value })}/>
        <button className="text-left text-xs text-red-300" onClick={() => setDraft({ ...draft, conditions: draft.conditions.filter((_, i) => i !== index) })}>Eliminar condición</button>
      </div>)}
      <button disabled={draft.conditions.length >= 10} onClick={() => setDraft({ ...draft, conditions: [...draft.conditions, { field: "user.tag", operator: "CONTAINS", value: "" }] })} className="text-sm text-blue-300 disabled:opacity-40">+ Añadir condición</button>
    </section>

    <section className={card}>
      <h3 className="font-bold text-emerald-300">3 · Acciones</h3>
      {draft.actions.map((item, index) => <div key={index} className="space-y-2 rounded-xl border border-slate-700 p-3">
        <select aria-label="Acción" className={field} value={item.type} onChange={event => {
          const type = event.target.value;
          action(index, { type, targetId: type === "SEND_DM" ? undefined : item.targetId, payload: type.startsWith("SEND_") ? { content: "" } : type === "SELLAUTH_CREATE_COUPON" ? { discountType: "PERCENTAGE", discount: 10, appliesTo: "one_time", subscriptionPayments: 1, minimumAmount: "", storeWide: false, products: [], productVariants: [], limit: 1 } : type === "REQUEST_APPROVAL" ? { staffRoleIds: [], title: "Solicitud pendiente de aprobación", description: "Solicitud de {user.tag}: {request.summary}" } : type === "SELLAUTH_PRODUCT_REQUEST" ? { maxSelections: 5 } : {} });
          if (type === "SELLAUTH_CREATE_COUPON" && !catalogLoaded) void loadCatalog().catch(error => setMessage(error instanceof Error ? error.message : "No se pudo cargar SellAuth."));
        }}>
          <option value="SEND_CHANNEL_MESSAGE">Enviar mensaje a un canal</option>
          <option value="SEND_DM">Enviar mensaje privado</option>
          <option value="ADD_ROLE">Asignar rol</option>
          <option value="REMOVE_ROLE">Retirar rol</option>
          <option value="SELLAUTH_CREATE_COUPON">SellAuth · Crear cupón</option>
          <option value="REQUEST_APPROVAL">Solicitar aprobación del staff</option>
          <option value="SELLAUTH_PRODUCT_REQUEST">SellAuth · Formulario de productos y cantidades</option>
        </select>
        {["SEND_CHANNEL_MESSAGE", "ADD_ROLE", "REMOVE_ROLE", "REQUEST_APPROVAL"].includes(item.type) && <input aria-label="ID del canal o rol" placeholder={item.type === "REQUEST_APPROVAL" ? "ID del canal de revisión" : item.type === "SEND_CHANNEL_MESSAGE" ? "ID del canal" : "ID del rol"} className={field} value={item.targetId || ""} onChange={event => action(index, { targetId: event.target.value })}/> }
        {item.type.startsWith("SEND_") && <textarea aria-label="Mensaje" className={field} maxLength={1800} value={item.payload?.content || ""} onChange={event => updatePayload(index, { content: event.target.value })}/>}
        {item.type === "SELLAUTH_PRODUCT_REQUEST" && <div className="rounded-xl bg-slate-950/60 p-3">
          <p className="text-sm font-semibold text-white">Formulario de solicitud</p>
          <label className="mt-2 block text-xs text-slate-300">Máximo de productos/variantes que puede seleccionar el usuario<input className={field} type="number" min="1" max="25" value={item.payload?.maxSelections ?? 5} onChange={event => updatePayload(index, { maxSelections: Math.max(1, Math.min(25, Number(event.target.value) || 1)) })}/></label>
          <p className="mt-2 text-xs text-slate-500">El usuario podrá recorrer el catálogo SellAuth, seleccionar productos o variantes y escribir la cantidad deseada de cada uno. El resumen se enviará al bloque de aprobación.</p>
        </div>}
        {item.type === "REQUEST_APPROVAL" && <div className="space-y-2 rounded-xl bg-slate-950/60 p-3">
          <p className="text-sm font-semibold text-white">Revisión humana</p>
          <label className="block text-xs text-slate-300">Roles autorizados (IDs separados por comas)<input className={field} value={(item.payload?.staffRoleIds || []).join(", ")} onChange={event => updatePayload(index, { staffRoleIds: event.target.value.split(",").map((value: string) => value.trim()).filter(Boolean) })} placeholder="123456789012345678, 987654321098765432"/></label>
          <label className="block text-xs text-slate-300">Título de la solicitud<input className={field} maxLength={256} value={item.payload?.title || ""} onChange={event => updatePayload(index, { title: event.target.value })}/></label>
          <label className="block text-xs text-slate-300">Descripción<input className={field} maxLength={1500} value={item.payload?.description || ""} onChange={event => updatePayload(index, { description: event.target.value })} placeholder="Solicitud de {user.tag}"/></label>
          <p className="text-xs text-slate-500">Las acciones que estén después de este bloque no se ejecutarán hasta que un miembro autorizado apruebe la solicitud.</p>
        </div>}
        {item.type === "SELLAUTH_CREATE_COUPON" && <div className="space-y-3 rounded-xl bg-slate-950/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-white">Configuración del cupón</p><button className="text-xs text-blue-300" disabled={busy} onClick={() => void loadCatalog().catch(error => setMessage(error instanceof Error ? error.message : "Error cargando catálogo."))}>Actualizar catálogo</button></div>
          <label className="block text-xs text-slate-300">Código (vacío = código aleatorio)<input className={field} maxLength={64} value={item.payload?.code || ""} onChange={event => updatePayload(index, { code: event.target.value })} placeholder="BIENVENIDA-{user.id}"/></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-300">Tipo de descuento<select className={field} value={item.payload?.discountType || "PERCENTAGE"} onChange={event => updatePayload(index, { discountType: event.target.value })}><option value="PERCENTAGE">Porcentaje</option><option value="AMOUNT">Importe fijo</option></select></label>
            <label className="block text-xs text-slate-300">Descuento<input className={field} type="number" min="1" step="0.01" value={item.payload?.discount ?? 10} onChange={event => updatePayload(index, { discount: Number(event.target.value) })}/></label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-300">Aplicar a<select className={field} value={item.payload?.appliesTo || "one_time"} onChange={event => updatePayload(index, { appliesTo: event.target.value })}><option value="one_time">Compras únicas</option><option value="subscriptions">Suscripciones</option></select></label>
            {item.payload?.appliesTo === "subscriptions" && <label className="block text-xs text-slate-300">Pagos con descuento (1–36)<input className={field} type="number" min="1" max="36" step="1" value={item.payload?.subscriptionPayments ?? 1} onChange={event => updatePayload(index, { subscriptionPayments: Number(event.target.value) })}/></label>}
          </div>
          <label className="block text-xs text-slate-300">Compra mínima (opcional, moneda de la tienda)<input className={field} type="number" min="1" step="0.01" value={item.payload?.minimumAmount ?? ""} onChange={event => updatePayload(index, { minimumAmount: event.target.value === "" ? "" : Number(event.target.value) })} placeholder="Ej. 10"/></label>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={item.payload?.useRequestedProducts === true} onChange={event => updatePayload(index, { useRequestedProducts: event.target.checked })}/>Utilizar los productos seleccionados por el usuario en el formulario anterior</label>\n          {!item.payload?.useRequestedProducts && <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={item.payload?.storeWide === true} onChange={event => updatePayload(index, { storeWide: event.target.checked, products: event.target.checked ? [] : item.payload?.products || [] })}/>Aplicar a toda la tienda</label>}
          {!item.payload?.useRequestedProducts && item.payload?.storeWide !== true && <label className="block text-xs text-slate-300">Productos permitidos<select multiple className={field + " min-h-32"} value={item.payload?.products || []} onChange={event => updatePayload(index, { products: Array.from(event.target.selectedOptions).map(option => option.value) })}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select><span className="mt-1 block text-slate-500">Mantén Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</span></label>}
          {!item.payload?.useRequestedProducts && item.payload?.storeWide !== true && products.filter(product => (item.payload?.products || []).includes(product.id) && product.variants.length > 0).map(product => <label key={product.id} className="block text-xs text-slate-300">Variantes de {product.name}<select multiple className={field} value={item.payload?.productVariants || []} onChange={event => updatePayload(index, { productVariants: Array.from(event.target.selectedOptions).map(option => option.value) })}>{product.variants.map(variant => <option key={variant.id} value={variant.id}>{variant.name}</option>)}</select></label>)}
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-300">Límite total de usos<input className={field} type="number" min="1" step="1" value={item.payload?.limit ?? 1} onChange={event => updatePayload(index, { limit: Number(event.target.value) })}/></label>
            <label className="block text-xs text-slate-300">Caducidad (ISO)<input className={field} type="datetime-local" value={item.payload?.expiresAt || ""} onChange={event => updatePayload(index, { expiresAt: event.target.value ? new Date(event.target.value).toISOString() : "" })}/></label>
          </div>
          <label className="block text-xs text-slate-300">Mensaje al crear el cupón<input className={field} maxLength={1500} value={item.payload?.successMessage || ""} onChange={event => updatePayload(index, { successMessage: event.target.value })} placeholder="Cupón creado: {coupon.code}"/></label>
          {!catalogLoaded && <p className="text-xs text-amber-300">Carga el catálogo de SellAuth para seleccionar productos y variantes.</p>}
        </div>}
        <div className="flex flex-wrap gap-3"><button disabled={index === 0} className="text-xs text-slate-300 disabled:opacity-40" onClick={() => setDraft({ ...draft, actions: draft.actions.map((action, i, all) => i === index - 1 ? all[index] : i === index ? all[index - 1] : action) })}>Subir</button><button disabled={index === draft.actions.length - 1} className="text-xs text-slate-300 disabled:opacity-40" onClick={() => setDraft({ ...draft, actions: draft.actions.map((action, i, all) => i === index ? all[index + 1] : i === index + 1 ? all[index] : action) })}>Bajar</button><button disabled={draft.actions.length === 1} className="text-xs text-red-300 disabled:opacity-40" onClick={() => setDraft({ ...draft, actions: draft.actions.filter((_, i) => i !== index) })}>Eliminar acción</button></div>
      </div>)}
      <button disabled={draft.actions.length >= 5} onClick={() => setDraft({ ...draft, actions: [...draft.actions, { type: "SEND_DM", payload: { content: "" } }] })} className="text-sm text-blue-300 disabled:opacity-40">+ Añadir acción</button>
      <p className="text-xs text-slate-500">Variables disponibles: {"{user.id}"}, {"{user.tag}"}, {"{message.content}"}. El límite de usos del cupón no equivale a unidades máximas por pedido.</p>
    </section>

    <div className="flex flex-wrap gap-3">
      <button disabled={!loaded || busy} onClick={() => void save()} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-40">{busy ? "Guardando…" : "Guardar flujo"}</button>
      {draft.id && <button disabled={busy} onClick={() => void remove()} className="rounded-xl border border-red-800 px-4 py-3 text-sm text-red-300 disabled:opacity-40">Eliminar</button>}
    </div>
    {message && <p role="status" className="text-sm text-slate-300">{message}</p>}
  </div>;
}
