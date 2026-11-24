"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Service = { id: string; name: string; subscriptionActive: boolean; bot?: { id: string } | null };
type Delivery = {
  id: string; provider: string; eventType: string; status: string;
  attempts: number; lastError: string | null; createdAt: string;
  deliveredAt: string | null; nextAttemptAt: string;
};
type Response = { deliveries: Delivery[]; totals: Record<string, number> };
const statuses: Record<string, string> = {
  PENDING: "Pendiente", PROCESSING: "Enviando", RETRYING: "Reintentando",
  DELIVERED: "Entregado", FAILED: "Fallido",
};
export default function DeliveriesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [botId, setBotId] = useState("");
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState("");

  const refresh = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/bots/${botId}/integrations/deliveries`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "No se pudo cargar el historial");
      setData(json);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error consultando historial");
    } finally { setLoading(false); }
  }, [botId]);

  useEffect(() => {
    fetch("/api/client/bot-config", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const list = (d.services || []).filter((s: Service) => s.subscriptionActive && s.bot?.id);
        setServices(list);
        if (list.length) setBotId(list[0].bot!.id);
      })
      .catch(() => setError("No se pudieron cargar los bots"));
  }, []);
  useEffect(() => {
    void refresh();
    if (!botId) return;
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [botId, refresh]);

  async function retry(deliveryId: string) {
    setRetryingId(deliveryId);
    try {
      const response = await fetch(`/api/bots/${botId}/integrations/deliveries`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo reintentar");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error solicitando reintento");
    } finally { setRetryingId(""); }
  }

  return <main className="mx-auto max-w-5xl p-6 text-white space-y-6">
    <Link href="/dashboard/bots/integraciones" className="text-sm text-indigo-400">← Volver a integraciones</Link>
    <div><h1 className="text-3xl font-bold">Historial de notificaciones</h1>
      <p className="text-slate-400 mt-2">Últimas 50 entregas del bot seleccionado. Los reintentos automáticos no necesitan reiniciar Discord.</p></div>
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex-1 text-sm">Bot contratado
        <select value={botId} onChange={e => { setBotId(e.target.value); setData(null); }} className="block w-full mt-2 rounded-xl bg-slate-900 border border-slate-700 p-3">
          {services.map(s => <option key={s.id} value={s.bot!.id}>{s.name}</option>)}
        </select>
      </label>
      <button onClick={() => void refresh()} disabled={!botId || loading} className="rounded-xl border border-slate-700 px-4 py-3 disabled:opacity-50">{loading ? "Consultando…" : "Actualizar"}</button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-950 p-4 text-red-300">{error}</p>}
    {data && <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      {(["PENDING", "RETRYING", "DELIVERED", "FAILED"] as const).map(status =>
        <div key={status} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">{statuses[status]}</p>
          <p className="text-2xl font-bold mt-2">{data.totals[status] || 0}</p>
        </div>)}
    </div>}
    <div className="space-y-3">{data?.deliveries.map(job =>
      <article key={job.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold">{job.eventType} <span className="font-normal text-xs text-slate-500">· {job.provider}</span></p>
          <p className="text-xs text-slate-400">Recibido: {new Date(job.createdAt).toLocaleString("es-ES")} · Intentos: {job.attempts}</p>
          {job.lastError && <p className="text-sm text-amber-300">{job.lastError}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${job.status === "DELIVERED" ? "text-emerald-400" : job.status === "FAILED" ? "text-rose-400" : "text-amber-300"}`}>{statuses[job.status] || job.status}</span>
          {job.status === "FAILED" && <button disabled={!!retryingId} onClick={() => void retry(job.id)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">{retryingId === job.id ? "Reintentando…" : "Reintentar"}</button>}
        </div>
      </article>)}
      {data && !data.deliveries.length && <p className="text-slate-400">Todavía no se han recibido eventos para este bot.</p>}
    </div>
  </main>;
}
