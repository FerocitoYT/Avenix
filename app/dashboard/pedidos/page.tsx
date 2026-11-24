"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Calendar,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderStatus = "PENDING" | "ACCEPTED" | "IN_DEVELOPMENT" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";

const ORDER_STEPS = [
  { key: "PENDING", label: "Pendiente" },
  { key: "ACCEPTED", label: "Aceptado" },
  { key: "IN_DEVELOPMENT", label: "En desarrollo" },
  { key: "IN_REVIEW", label: "Revisión" },
  { key: "COMPLETED", label: "Completado" },
];
const INSTANT_STEPS = [
  { key: "ACCEPTED", label: "Aceptado" },
  { key: "COMPLETED", label: "Completado" },
];

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/client/orders", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar tus pedidos");
        if (active) setOrders(data.orders || []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error cargando pedidos");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadOrders();
    return () => { active = false; };
  }, []);

  const getStepProgress = (status: OrderStatus, instantDelivery = false) => {
    if (instantDelivery) {
      if (status === "COMPLETED") return 100;
      if (status === "ACCEPTED") return 50;
      return 0;
    }
    switch (status) {
      case "PENDING":
        return 10;
      case "ACCEPTED":
        return 30;
      case "IN_DEVELOPMENT":
        return 60;
      case "IN_REVIEW":
        return 85;
      case "COMPLETED":
        return 100;
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "IN_DEVELOPMENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
            En Desarrollo
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Completado
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            En Revisión
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            Aceptado
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Mis Pedidos y Desarrollos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Seguimiento en tiempo real de cada una de las fases de entrega de tus proyectos.
          </p>
        </div>

        <Link
          href="/presupuesto"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Nuevo encargo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}
      {loading ? (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 p-8 text-center text-sm text-slate-400">Cargando tus pedidos…</div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const progress = getStepProgress(order.status, Boolean(order.instantDelivery));
            const steps = order.instantDelivery ? INSTANT_STEPS : ORDER_STEPS;

            return (
              <div
                key={order.id}
                className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-6"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-extrabold text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <h3 className="text-base font-bold text-white font-display">
                      {order.productName}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-extrabold text-white font-display block">
                      {formatCurrency(order.totalAmountCents)}
                    </span>
                    <span className="text-xs text-slate-400">IVA del 21% incluido</span>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Progreso de ejecución</span>
                    <span className="text-blue-400">{progress}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-[#0B1220] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className={`grid text-[10px] text-slate-400 pt-1 text-center font-medium ${order.instantDelivery ? "grid-cols-2" : "grid-cols-5"}`}>
                    {steps.map((s, idx) => {
                      const threshold = ((idx + 1) / steps.length) * 100;
                      return (
                        <div
                          key={s.key}
                          className={progress >= threshold ? "text-blue-400 font-bold" : ""}
                        >
                          {s.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery & Notes Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Fecha de contratación:</span>
                    <span className="text-slate-300 font-medium">{formatDate(order.createdAt)}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Fecha estimada de entrega:</span>
                    <span className="text-white font-semibold">
                      {order.instantDelivery ? "Entrega inmediata" : formatDate(order.deliveryEstimatedDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Notas del equipo:</span>
                    <span className="text-slate-300">{order.notes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-12 px-6 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-display">
              No tienes ningún pedido en curso
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cuando solicites un bot a medida, desarrollo web o automatizaciones, podrás seguir el estado paso a paso (Aceptado, En desarrollo, Revisión y Entrega) en este apartado.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/presupuesto"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Solicitar presupuesto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/#tarifas"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              Ver bots estándar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
