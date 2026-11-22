"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  PackageCheck,
  RotateCw,
  LifeBuoy,
  Server,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Activity,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    registeredClients: 0,
    totalSalesCount: 0,
    totalInvoicedCents: 0,
    mrrCents: 0,
    pendingOrdersCount: 0,
    activeSubscriptionsCount: 0,
    openTicketsCount: 0,
    operationalServicesCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/overview");
        const data = await res.json();
        if (data?.stats) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (err) {
        console.error("Error loading real admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Avenix Admin — Control Central
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas reales de facturación, clientes, infraestructura y ciclo de vida de pedidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalogo"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Editar tarifas y catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Facturación Total */}
        <div className="p-5 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Facturación Bruta</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {formatCurrency(stats.totalInvoicedCents)}
          </div>
          <span className="text-[10px] text-slate-500 block">Con 21% IVA incluido</span>
        </div>

        {/* KPI 2: MRR (Ingresos Recurrentes) */}
        <div className="p-5 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">MRR (Mensual)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {formatCurrency(stats.mrrCents)}
          </div>
          <span className="text-[10px] text-emerald-400 block">{stats.activeSubscriptionsCount} suscripciones activas</span>
        </div>

        {/* KPI 3: Clientes Registrados */}
        <div className="p-5 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Clientes</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {stats.registeredClients}
          </div>
          <span className="text-[10px] text-slate-500 block">Cuentas activas verificadas</span>
        </div>

        {/* KPI 4: Servicios Operativos */}
        <div className="p-5 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Infraestructura</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {stats.operationalServicesCount}
          </div>
          <span className="text-[10px] text-emerald-400 block">Nodos Frankfurt / Madrid OK</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/pedidos"
          className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-400 block">Pedidos Pendientes</span>
            <span className="text-lg font-bold text-white font-display">{stats.pendingOrdersCount}</span>
          </div>
          <PackageCheck className="w-5 h-5 text-amber-400" />
        </Link>

        <Link
          href="/admin/suscripciones"
          className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-400 block">Suscripciones</span>
            <span className="text-lg font-bold text-white font-display">{stats.activeSubscriptionsCount}</span>
          </div>
          <RotateCw className="w-5 h-5 text-blue-400" />
        </Link>

        <Link
          href="/admin/soporte"
          className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-400 block">Tickets Abiertos</span>
            <span className="text-lg font-bold text-white font-display">{stats.openTicketsCount}</span>
          </div>
          <LifeBuoy className="w-5 h-5 text-indigo-400" />
        </Link>

        <Link
          href="/admin/presupuestos"
          className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] text-slate-400 block">Presupuestos por valorar</span>
            <span className="text-lg font-bold text-white font-display">2</span>
          </div>
          <Activity className="w-5 h-5 text-emerald-400" />
        </Link>
      </div>

      {/* Main Admin Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">
            Atención Rápida a Clientes y Pedidos
          </h3>
          <p className="text-xs text-slate-400">
            Revisa las propuestas presupuestarias enviadas por los usuarios desde la web pública y emite ofertas formalizadas con precio cerrado y notas técnicas.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/presupuestos"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              Gestionar Presupuestos
            </Link>
            <Link
              href="/admin/pedidos"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              Actualizar Estados de Entrega
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B1220] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-display">
            Infraestructura y Monitorización
          </h3>
          <p className="text-xs text-slate-400">
            Supervisa el estado de salud de los nodos Docker, límites de RAM asignados por bot y reinicios de emergencia.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/infraestructura"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              Consola de Servidores
            </Link>
            <Link
              href="/admin/configuracion"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              Auditoría y Parámetros
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
