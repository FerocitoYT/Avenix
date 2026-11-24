"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Bot,
  Globe,
  Server,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Settings,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MisServiciosPage() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => { fetch("/api/customer/overview", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Error"); return r.json(); }).then(d => setServices(d.services || [])).catch(() => console.error("No se pudieron cargar los servicios")); }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Mis Servicios Contratados
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa los servicios en curso, fechas de renovación y opciones de administración.
          </p>
        </div>

        <Link
          href="/presupuesto"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Añadir nuevo servicio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  {service.type === "DISCORD_BOT" ? (
                    <Bot className="w-6 h-6" />
                  ) : (
                    <Server className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white font-display">
                      {service.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${service.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : service.statusLabel==="Impago"||service.statusLabel==="Suspendido" ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}`}>
                      {service.statusLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-slate-300 font-semibold">{service.identifier}</span> • Plan:{" "}
                    <span className="text-blue-400 font-medium">{service.planName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Alta: {formatDate(service.hiringDate)}</span>
                    <span>•</span>
                    <span>{service.isActive ? <>Próxima renovación: {formatDate(service.renewalDate)}</> : "Sin renovación activa"}</span>
                    <span>•</span>
                    <span>Servidor: {service.node}</span>
                  </div>
                  {!service.isActive && service.statusReason && (
                    <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200">
                      <span className="font-bold">Motivo:</span> {service.statusReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end lg:items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-base font-extrabold text-white font-display block">
                    {formatCurrency(service.monthlyCostCents)}
                  </span>
                  <span className="text-[10px] text-slate-400">mensual (21% IVA inc.)</span>
                </div>

                <div className="flex items-center gap-2">
                  {service.type === "DISCORD_BOT" ? (
                    service.isActive && service.botId ? (
                      <Link
                        href={`/dashboard/bot/${service.botId}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Controlar Bot</span>
                      </Link>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                        Servicio finalizado
                      </span>
                    )
                  ) : (
                    <Link
                      href="/dashboard/facturacion"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <span>Gestionar Plan</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-12 px-6 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-display">
              No tienes ningún servicio contratado
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cuando actives tu Avenix Bot, contrates hosting en la nube o solicites desarrollo de software, podrás supervisar el estado de cada servicio aquí.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/#tarifas"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Ver tarifas de bots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/presupuesto"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              Solicitar presupuesto
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
