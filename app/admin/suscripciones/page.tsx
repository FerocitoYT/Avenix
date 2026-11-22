"use client";

import React, { useState } from "react";
import {
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminSuscripcionesPage() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: "sub-1",
      stripeSubId: "sub_1QkL4jLkd882...",
      clientName: "Carlos Developer",
      clientEmail: "carlos@comunidad.es",
      planName: "Avenix Bot Pro",
      amountCents: 999,
      status: "ACTIVE",
      currentPeriodEnd: "2026-12-15",
      cancelAtPeriodEnd: false,
    },
    {
      id: "sub-2",
      stripeSubId: "sub_1QkM9aXp019...",
      clientName: "Laura Martínez",
      clientEmail: "laura@tiendavirtual.com",
      planName: "Hosting de Bots",
      amountCents: 599,
      status: "ACTIVE",
      currentPeriodEnd: "2026-12-12",
      cancelAtPeriodEnd: false,
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const toggleCancel = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, cancelAtPeriodEnd: !s.cancelAtPeriodEnd } : s
      )
    );
    setToast("Estado de renovación actualizado.");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Suscripciones Recurrentes (MRR)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitorización de renovaciones, estados de suscripción Stripe y control de bajas.
        </p>
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
                <th className="pb-3 pl-2">Cliente</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Stripe Sub ID</th>
                <th className="pb-3">Importe Mensual</th>
                <th className="pb-3">Próxima Renovación</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <span className="font-bold text-white block">{s.clientName}</span>
                    <span className="text-[10px] text-slate-400">{s.clientEmail}</span>
                  </td>
                  <td className="py-3.5 text-indigo-400 font-semibold">{s.planName}</td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-400">
                    {s.stripeSubId}
                  </td>
                  <td className="py-3.5 font-bold text-white font-display">
                    {formatCurrency(s.amountCents)} / mes
                  </td>
                  <td className="py-3.5 text-slate-300">{formatDate(s.currentPeriodEnd)}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => toggleCancel(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800"
                    >
                      {s.cancelAtPeriodEnd ? "Reactivar Renovación" : "Programar Cancelación"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
