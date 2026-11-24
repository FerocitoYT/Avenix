"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {BotSocialPanel} from "@/components/dashboard/bot-social-panel";
import { useSearchParams } from "next/navigation";

type Service = { id: string; name: string; subscriptionActive: boolean; bot?: { id: string } | null };
type Rule = { event: "order.created" | "order.updated" | "order.deleted"; enabled: boolean; title?: string; minTotal?: number; statuses?: string[] };
type Store = { integrationId: string; storeName: string; enabled: boolean; rules: Rule[]; webhookPath: string };
const defaultRules: Rule[] = [
  { event: "order.created", enabled: true },
  { event: "order.updated", enabled: true },
  { event: "order.deleted", enabled: false },
];
export default function IntegrationsPage() {
  const searchParams=useSearchParams();
  const requestedBotId=searchParams.get("botId")||"";
  const [services, setServices] = useState<Service[]>([]);
  const [botId, setBotId] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [rotateSecret, setRotateSecret] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const selected = stores.find(s => s.integrationId === selectedId);
  const endpoint = selected ? windowSafeOrigin() + selected.webhookPath : "";
  function windowSafeOrigin() { return typeof window === "undefined" ? "" : window.location.origin; }

  function editStore(store?: Store) {
    setSelectedId(store?.integrationId || "");
    setStoreName(store?.storeName || "");
    setEnabled(store?.enabled ?? true);
    setRules(store?.rules || defaultRules);
    setDestination("");
    setSecret("");
    setRotateSecret(false);
    setMessage("");
    setError("");
  }

  async function loadStores(id: string, selectId?: string) {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/bots/${id}/integrations/woocommerce`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudieron cargar las tiendas");
      const loaded: Store[] = result.stores || [];
      setStores(loaded);
      editStore(loaded.find(s => s.integrationId === selectId) || loaded[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando tiendas");
    } finally { setLoading(false); }
  }
  useEffect(() => {
    fetch("/api/client/bot-config", { cache: "no-store" }).then(r => r.json()).then(data => {
      const available: Service[] = (data.services || []).filter((s: Service) => s.subscriptionActive && s.bot?.id);
      setServices(available);
      if (available.length) setBotId(available.some(service=>service.bot?.id===requestedBotId)?requestedBotId:available[0].bot!.id);
    }).catch(() => setError("No se pudieron cargar los servicios"));
  }, [requestedBotId]);
  useEffect(() => { if (botId) void loadStores(botId); }, [botId]);

  async function save() {
    if (!botId) return;
    setSaving(true); setError(""); setMessage(""); setSecret("");
    try {
      const response = await fetch(`/api/bots/${botId}/integrations/woocommerce`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(selectedId ? { integrationId: selectedId } : {}),
          storeName, enabled, rules, rotateSecret,
          ...(destination ? { discordWebhookUrl: destination } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (result.fields && JSON.stringify(result.fields)) || "No se pudo guardar");
      await loadStores(botId, result.integrationId);
      setSecret(result.signingSecret || "");
      setMessage(result.message);
    } catch (e) { setError(e instanceof Error ? e.message : "Error guardando la tienda"); }
    finally { setSaving(false); }
  }

  async function sendTest() {
    if (!botId || !selectedId) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/bots/${botId}/integrations/woocommerce/test`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId: selectedId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la prueba");
      setMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error enviando prueba");
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!botId || !selectedId || !confirm("¿Eliminar esta integración? Los webhooks dejarán de funcionar. Esta acción no se puede deshacer.")) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/bots/${botId}/integrations/woocommerce?integrationId=${encodeURIComponent(selectedId)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo eliminar");
      await loadStores(botId);
      setMessage("Integración eliminada correctamente.");
    } catch (e) { setError(e instanceof Error ? e.message : "Error eliminando integración"); }
    finally { setSaving(false); }
  }

  const updateRule = (event: Rule["event"], patch: Partial<Rule>) =>
    setRules(current => current.map(rule => rule.event === event ? { ...rule, ...patch } : rule));
  return <main className="mx-auto max-w-5xl p-6 text-white space-y-6">
    <Link href="/dashboard/bots" className="text-sm text-indigo-400">← Volver al panel</Link>
    <div className="flex flex-wrap gap-3">
      <Link href="/dashboard/bots/integraciones/historial" className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold">📦 Historial y reintentos</Link>
      <Link href="/dashboard/bots/integraciones/api" className="rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold">⚙️ API personalizada</Link>
    </div>
    <div><h1 className="text-3xl font-bold">Ecommerce · WooCommerce</h1><p className="mt-2 text-slate-400">Conecta hasta 10 tiendas por bot y controla qué pedidos se notifican en Discord. Sin reiniciar el bot.</p></div>
    <label className="block text-sm space-y-2">Bot contratado
      <select className="block w-full rounded-lg bg-slate-900 border border-slate-700 p-3" value={botId} onChange={e => {setBotId(e.target.value);setStores([]);editStore();}}>
        {services.map(s => <option key={s.id} value={s.bot!.id}>{s.name}</option>)}
      </select>
    </label>
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Tus tiendas ({stores.length}/10)</h2><button disabled={stores.length >= 10} onClick={() => editStore()} className="rounded-lg bg-indigo-600 disabled:opacity-50 px-4 py-2 text-sm">+ Añadir tienda</button></div>
      {loading && <p className="text-slate-400 text-sm">Cargando tiendas…</p>}
      {stores.length === 0 && !loading && <p className="text-slate-400 text-sm">Todavía no hay tiendas configuradas.</p>}
      <div className="grid sm:grid-cols-2 gap-3">{stores.map(store =>
        <button key={store.integrationId} onClick={() => editStore(store)} className={`text-left rounded-xl p-4 border ${selectedId === store.integrationId ? "border-indigo-500 bg-indigo-950/40" : "border-slate-700 bg-slate-950"}`}>
          <span className="block font-semibold">{store.storeName}</span><span className="text-xs text-slate-400">{store.enabled ? "Activa" : "Desactivada"} · {store.integrationId.slice(0,8)}</span>
        </button>)}</div>
    </section>
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
      <h2 className="text-xl font-bold">{selected ? "Editar tienda" : "Añadir tienda"}</h2>
      <label className="block text-sm space-y-2">Nombre de la tienda<input value={storeName} onChange={e => setStoreName(e.target.value)} maxLength={100} placeholder="Mi tienda" className="block w-full bg-slate-950 border border-slate-700 p-3 rounded-lg"/></label>
      <label className="block text-sm space-y-2">Webhook de Discord {selected && "(dejar vacío para mantener el existente)"}
        <input type="password" autoComplete="off" value={destination} onChange={e => setDestination(e.target.value)} placeholder="https://discord.com/api/webhooks/…" className="block w-full bg-slate-950 border border-slate-700 p-3 rounded-lg"/>
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/> Tienda activa</label>
      <div className="space-y-3"><p className="font-semibold">Reglas de avisos</p>
        {rules.map(rule => <div key={rule.event} className="border border-slate-700 bg-slate-950 rounded-xl p-4 space-y-3">
          <label className="flex gap-2 text-sm items-center"><input type="checkbox" checked={rule.enabled} onChange={e => updateRule(rule.event,{enabled:e.target.checked})}/><strong>{rule.event === "order.created" ? "Nuevo pedido" : rule.event === "order.updated" ? "Pedido actualizado" : "Pedido eliminado"}</strong></label>
          {rule.enabled && <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs text-slate-400">Título del aviso<input maxLength={256} className="mt-1 w-full bg-slate-900 border border-slate-700 p-2 rounded-lg" value={rule.title || ""} onChange={e => updateRule(rule.event,{title:e.target.value})} placeholder="Título predeterminado"/></label>
            <label className="block text-xs text-slate-400">Importe mínimo<input type="number" min={0} max={1000000000} step="0.01" className="mt-1 w-full bg-slate-900 border border-slate-700 p-2 rounded-lg" value={rule.minTotal ?? ""} onChange={e => updateRule(rule.event,{minTotal:e.target.value === "" ? undefined : Number(e.target.value)})} placeholder="Sin mínimo"/></label>
          </div>}
        </div>)}
      </div>
      {selected && <label className="flex gap-2 items-center text-sm text-amber-300"><input type="checkbox" checked={rotateSecret} onChange={e => setRotateSecret(e.target.checked)}/> Regenerar secreto de WooCommerce (desconectará los webhooks hasta actualizarlo)</label>}
      <div className="flex flex-wrap gap-3">
        <button disabled={saving || !botId || !storeName.trim() || (!selected && !destination)} onClick={() => void save()} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold disabled:opacity-50">{saving ? "Guardando…" : selected ? "Guardar cambios" : "Crear tienda"}</button>
        {selected && <button disabled={saving} onClick={() => void sendTest()} className="rounded-lg border border-indigo-700 text-indigo-300 px-5 py-3">Enviar aviso de prueba</button>}
        {selected && <button disabled={saving} onClick={() => void remove()} className="rounded-lg border border-red-700 text-red-300 px-5 py-3">Eliminar tienda</button>}
      </div>
      {error && <p role="alert" className="text-red-400">{error}</p>}
      {message && <p role="status" className="text-emerald-300">{message}</p>}
      {endpoint && <div className="space-y-2"><p className="font-semibold text-sm">URL de entrega para WooCommerce</p><code className="block break-all rounded-lg bg-slate-950 p-3 text-xs">{endpoint}</code><button onClick={() => navigator.clipboard.writeText(endpoint)} className="text-indigo-400 text-sm">Copiar URL</button></div>}
      {secret && <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 space-y-2"><strong>Secreto de firma · visible una sola vez</strong><code className="block break-all text-xs">{secret}</code><button className="text-indigo-300 text-sm" onClick={() => navigator.clipboard.writeText(secret)}>Copiar secreto</button></div>}
    </section>
    <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
      <h2 className="font-bold">Configurar WordPress</h2>
      <p className="text-sm text-slate-300">En WooCommerce → Ajustes → Avanzado → Webhooks, crea un webhook activo para cada tipo de pedido. Utiliza la URL de entrega y el secreto generado al crear la tienda. Si editas los avisos, no necesitas volver a configurar el secreto.</p>
      <p className="text-xs text-slate-500">Los eventos se guardan en la cola y el host de Axyon los entrega a Discord. La entrega es al menos una vez; en circunstancias excepcionales puede repetirse un aviso.</p>
    </section>
    {botId && <BotSocialPanel key={botId} botId={botId}/>}
  </main>;
}
