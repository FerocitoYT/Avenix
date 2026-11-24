"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientTaxId?: string;
  concept: string;
  baseAmountCents: number;
  vatAmountCents: number;
  totalAmountCents: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "VOID";
  paymentProvider: "STRIPE" | "PAYPAL" | "BANK_TRANSFER" | "MANUAL";
  stripeVerified: boolean;
  createdAt: string;
}

export default function AdminFacturacionPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch("/api/admin/invoices");
        const data = await res.json();
        if (data?.invoices) {
          setInvoices(data.invoices);
        }
      } catch (err) {
        console.error("Error loading real invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);


  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Facturación Oficial y Registro de Pagos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Facturas propias de Axyon y pagos registrados por el servidor.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Nº Factura</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Concepto</th>
                <th className="pb-3">Base</th>
                <th className="pb-3">Impuestos</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Verificación</th>
                <th className="pb-3 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-white block">{inv.clientName}</span>
                      <span className="text-[10px] text-slate-400">{inv.clientTaxId || "Sin NIF"}</span>
                    </td>
                    <td className="py-3.5 text-slate-300 font-medium">{inv.concept}</td>
                    <td className="py-3.5 text-slate-400">{formatCurrency(inv.baseAmountCents)}</td>
                    <td className="py-3.5 text-slate-400">{formatCurrency(inv.vatAmountCents)}</td>
                    <td className="py-3.5 font-bold text-white font-display">
                      {formatCurrency(inv.totalAmountCents)}
                    </td>
                    <td className="py-3.5">
                      {inv.stripeVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                          <ShieldCheck className="w-3 h-3" />
                          {inv.paymentProvider === "STRIPE" ? "Stripe · Pagada" : inv.paymentProvider === "PAYPAL" ? "PayPal · Pagada" : "Pagada"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        <button
                          disabled={inv.status !== "PAID"}
                          onClick={() => window.open("/api/customer/invoices/"+encodeURIComponent(inv.id),"_blank","noopener,noreferrer")}
                          className="disabled:opacity-40 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                          title="Descargar PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {loading ? "Cargando facturas de la base de datos..." : "No hay facturas emitidas todavía."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
