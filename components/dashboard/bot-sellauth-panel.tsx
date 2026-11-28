"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

type Product = { id: string; name: string; variants: { id: string; name: string }[] };
type Config = { configured: boolean; enabled: boolean; storeSlug: string; maskedKey?: string; lastValidatedAt?: string | null };

export function BotSellAuthPanel({ botId }: { botId: string }) {
  const endpoint = `/api/bots/${encodeURIComponent(botId)}/integrations/sellauth`;
  const [config, setConfig] = useState<Config>({ configured: false, enabled: true, storeSlug: "" });
  const [apiKey, setApiKey] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar SellAuth.");
      setConfig(data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error cargando la integración."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [endpoint]);

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, storeSlug: config.storeSlug, enabled: config.enabled }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar.");
      setApiKey(""); setMessage(data.message || "Configuración guardada."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error guardando SellAuth."); }
    finally { setBusy(false); }
  }

  async function run(operation: "test" | "products") {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "La operación ha fallado.");
      if (operation === "products") { setProducts(data.products || []); setMessage(`Catálogo cargado: ${(data.products || []).length} productos.`); }
      else setMessage(data.message || "Conexión verificada.");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error conectando con SellAuth."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm("¿Eliminar las credenciales de SellAuth de esta instancia?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo eliminar.");
      setProducts([]); setApiKey(""); setMessage("Integración desconectada."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error eliminando SellAuth."); }
    finally { setBusy(false); }
  }

  const field = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500";
  const button = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";

  if (loading) return <div className="p-6 text-sm text-slate-400">Cargando integración SellAuth…</div>;

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-bold text-white">SellAuth</h3><p className="mt-1 text-sm text-slate-400">Conecta tu tienda para utilizar sus productos y crear cupones desde Automatizaciones.</p></div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.configured && config.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-400"}`}>{config.configured ? config.enabled ? "Conectado" : "Desactivado" : "Sin configurar"}</span>
      </div>
      <label className="block text-sm text-slate-300">Slug de la tienda<input className={field} maxLength={100} value={config.storeSlug} onChange={event => setConfig({ ...config, storeSlug: event.target.value })} placeholder="mi-tienda"/></label>
      <label className="block text-sm text-slate-300">API Key de SellAuth<input className={field} type="password" autoComplete="new-password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder={config.configured ? "Deja vacío para mantener la clave guardada" : "Introduce tu API Key"}/></label>
      {config.maskedKey && <p className="text-xs text-slate-500">Clave almacenada: <span className="font-mono">{config.maskedKey}</span></p>}
      <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={config.enabled} onChange={event => setConfig({ ...config, enabled: event.target.checked })}/>Activar integración</label>
      <div className="flex flex-wrap gap-2">
        <button className={`${button} bg-blue-600 text-white hover:bg-blue-500`} disabled={busy || (!apiKey.trim() && !config.configured)} onClick={() => void save()}>{busy && <Loader2 className="h-4 w-4 animate-spin"/>}Guardar configuración</button>
        <button className={`${button} border border-slate-700 text-slate-200 hover:bg-slate-800`} disabled={busy || !config.configured || !config.enabled} onClick={() => void run("test")}><ShieldCheck className="h-4 w-4"/>Probar conexión</button>
        <button className={`${button} border border-slate-700 text-slate-200 hover:bg-slate-800`} disabled={busy || !config.configured || !config.enabled} onClick={() => void run("products")}><RefreshCw className="h-4 w-4"/>Cargar productos</button>
        {config.configured && <button className={`${button} border border-red-900 text-red-300 hover:bg-red-950/40`} disabled={busy} onClick={() => void remove()}><Trash2 className="h-4 w-4"/>Desconectar</button>}
      </div>
      {config.lastValidatedAt && <p className="text-xs text-slate-500">Última conexión verificada: {new Date(config.lastValidatedAt).toLocaleString("es-ES")}</p>}
      {message && <p role="status" className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4"/>{message}</p>}
      {error && <p role="alert" className="flex items-center gap-2 text-sm text-red-300"><CircleAlert className="h-4 w-4"/>{error}</p>}
      <p className="text-xs leading-relaxed text-slate-500">La API Key se cifra en el servidor con AES-256-GCM. Nunca se devuelve completa al navegador. Utiliza una clave SellAuth con los permisos mínimos necesarios para consultar productos y gestionar cupones.</p>
    </section>
    {products.length > 0 && <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-3"><div><h4 className="font-semibold text-white">Catálogo de SellAuth</h4><p className="text-xs text-slate-400">Productos disponibles para configurar acciones en Automatizaciones.</p></div>{products.map(product => <div key={product.id} className="rounded-xl border border-slate-800 p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{product.name}</span><code className="text-xs text-slate-500">{product.id}</code></div>{product.variants.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{product.variants.map(variant => <span key={variant.id} className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-300">{variant.name} · {variant.id}</span>)}</div>}</div>)}</section>}
  </div>;
}
