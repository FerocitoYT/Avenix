"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  CreditCard,
  Package,
  LifeBuoy,
  Bell,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardHomePage() {
  const [data, setData] = useState<{
    servicesCount: number;
    subscriptionsCount: number;
    pendingInvoicesCount: number;
    activeOrdersCount: number;
    openTicketsCount: number;
    notifications: any[];
    recentOrders: any[];
    activeServices: any[];
  }>({
    servicesCount: 1,
    subscriptionsCount: 1,
    pendingInvoicesCount: 0,
    activeOrdersCount: 1,
    openTicketsCount: 0,
    notifications: [
      {
        id: "notif-1",
        title: "Instancia de Bot Activa",
        message: "Tu bot 'Avenix Moderation' está ejecutándose normalmente en el nodo eu-node-01.",
        time: "Hace 15 minutos",
        type: "SUCCESS",
      },
      {
        id: "notif-2",
        title: "Factura emitida",
        message: "Se ha generado la factura del ciclo mensual actual de hosting.",
        time: "Hace 2 días",
        type: "INFO",
      },
    ],
    recentOrders: [
      {
        id: "ord-1",
        orderNumber: "AVX-2026-0042",
        productName: "Desarrollo de Bot Avanzado",
        status: "IN_DEVELOPMENT",
        statusLabel: "En desarrollo",
        totalAmountCents: 19900,
        createdAt: new Date().toISOString(),
      },
    ],
    activeServices: [
      {
        id: "srv-1",
        name: "Bot de Soporte & Tickets",
        plan: "Avenix Bot Pro",
        status: "ACTIVE",
        node: "eu-node-01.avenix.dev",
        renewalDate: "2026-12-22",
      },
    ],
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Avenix Control — Panel de Cliente
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa en tiempo real tus bots, servicios contratados, facturación y soporte.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/presupuesto"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Contratar nuevo servicio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Widget 1: Servicios Activos */}
        <Link
          href="/dashboard/servicios"
          className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Servicios Activos</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.servicesCount}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-1">100% Operativos</span>
          </div>
        </Link>

        {/* Widget 2: Suscripciones */}
        <Link
          href="/dashboard/servicios"
          className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Suscripciones</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.subscriptionsCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Renovación automática</span>
          </div>
        </Link>

        {/* Widget 3: Pedidos en Curso */}
        <Link
          href="/dashboard/pedidos"
          className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Pedidos en Curso</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.activeOrdersCount}
            </span>
            <span className="text-[10px] text-blue-400 block mt-1">Fase de desarrollo</span>
          </div>
        </Link>

        {/* Widget 4: Facturas Pendientes */}
        <Link
          href="/dashboard/facturacion"
          className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Facturas Pendientes</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.pendingInvoicesCount}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-1">Al día con pagos</span>
          </div>
        </Link>

        {/* Widget 5: Tickets Abiertos */}
        <Link
          href="/dashboard/soporte"
          className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Tickets de Soporte</span>
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {data.openTicketsCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Sin incidencias abiertas</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Services & Console status + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Active Bots & Current Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Bot Control Banner */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display">
                  Instancia de Bot Activa
                </h3>
              </div>
              <Link
                href="/dashboard/bots"
                className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Abrir consola y logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Avenix Support Bot</h4>
                  <p className="text-[11px] text-slate-400">Node: eu-node-01.avenix.dev • RAM: 142 MB / 512 MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                  Online (99.9%)
                </span>
                <Link
                  href="/dashboard/bots"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
                >
                  Gestionar
                </Link>
              </div>
            </div>
          </div>

          {/* Ongoing Orders */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-display">
                Pedidos en Seguimiento
              </h3>
              <Link
                href="/dashboard/pedidos"
                className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Ver historial</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-[#0B1220] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {order.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium">{order.productName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Registrado el {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white font-display block">
                      {formatCurrency(order.totalAmountCents)}
                    </span>
                    <Link
                      href={`/dashboard/pedidos`}
                      className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <span>Ver progreso</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Notifications Feed */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Notificaciones del Sistema
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {data.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-xl bg-[#0B1220] border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">{notif.time}</span>
                  </div>
                  <p className="text-slate-400 leading-snug">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Support Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-[#111827] border border-blue-500/30 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              ¿Necesitas asistencia técnica?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nuestro equipo de desarrolladores atiende tickets técnicos directamente sin intermediarios.
            </p>
            <Link
              href="/dashboard/soporte"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>Abrir ticket de soporte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
