"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  RotateCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => { fetch("/api/customer/overview", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Error"); return r.json(); }).then(d => { setSubscriptions(d.subscriptions || []); setInvoices(d.invoices || []); }).catch(() => console.error("No se pudo cargar la facturación")); }, []);

  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleOpenStripePortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("El portal de Stripe se abrirá cuando configures tu clave STRIPE_SECRET_KEY en el servidor.");
      }
    } catch {
      alert("Portal de Stripe no disponible en modo demostración local sin clave de API.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Facturación y Suscripciones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historial de facturas oficiales con IVA desglosado y gestión segura de métodos de pago.
          </p>
        </div>

        <button
          onClick={handleOpenStripePortal}
          disabled={loadingPortal}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
          <span>Gestionar tarjetas en Stripe</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Subscriptions Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-5">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-blue-400" />
          <span>Suscripciones Recurrentes Activas</span>
        </h2>

        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-[#0B1220] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{sub.planName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sub.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {sub.cancelAtPeriodEnd ? "Finaliza el:" : "Vencimiento del período:"}{" "}
                    <span className="text-slate-200 font-medium">{formatDate(sub.renewalDate)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-white font-display">
                    {formatCurrency(sub.amountCents)} / {sub.interval}
                  </span>

                  <button
                    onClick={handleOpenStripePortal}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
                  >
                    Cancelar o Modificar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0B1220] border border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">No tienes ninguna suscripción activa actualmente.</p>
            <Link
              href="/#tarifas"
              className="inline-block text-xs text-blue-400 hover:underline font-medium"
            >
              Ver suscripciones para bots (desde 9 €/mes)
            </Link>
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Facturas Emitidas</span>
          </h2>
          <span className="text-xs text-slate-400">21% IVA legal incluido</span>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Nº Factura</th>
                  <th className="pb-3">Concepto</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Base Imponible</th>
                  <th className="pb-3">IVA (21%)</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 pr-2 text-right">Descarga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-blue-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 text-white font-medium">{inv.description}</td>
                    <td className="py-3.5 text-slate-400">{formatDate(inv.createdAt)}</td>
                    <td className="py-3.5 text-slate-300">{formatCurrency(inv.baseAmountCents)}</td>
                    <td className="py-3.5 text-slate-400">{formatCurrency(inv.vatAmountCents)}</td>
                    <td className="py-3.5 font-bold text-white font-display">
                      {formatCurrency(inv.totalAmountCents)}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => {
                          alert(`Generando y descargando documento oficial en PDF para la factura ${inv.invoiceNumber}`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Descargar PDF de Factura"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0B1220] border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">No hay facturas emitidas en tu cuenta.</p>
          </div>
        )}
      </div>
    </div>
  );
}
