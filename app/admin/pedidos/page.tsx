"use client";

import React, { useState, useEffect } from "react";
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Filter,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderRecord {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  productName: string;
  totalAmountCents: number;
  status: "PENDING" | "ACCEPTED" | "IN_DEVELOPMENT" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";
  assignedStaff: string;
  deliveryDate?: string;
  createdAt: string;
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data?.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error loading real orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderRecord["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      setToast(`Estado de pedido actualizado a ${newStatus} en la base de datos.`);
    } catch {
      setToast("Error al guardar cambios de pedido.");
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Gestión de Pedidos y Entregas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de hitos, estados de desarrollo y asignación de personal responsable.
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
                <th className="pb-3 pl-2">Nº Pedido</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Importe</th>
                <th className="pb-3">Responsable</th>
                <th className="pb-3">Entrega</th>
                <th className="pb-3 pr-2 text-right">Fase de Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-indigo-400">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-white block">{o.clientName}</span>
                      <span className="text-[10px] text-slate-400">{o.clientEmail}</span>
                    </td>
                    <td className="py-3.5 text-slate-200 font-medium">{o.productName}</td>
                    <td className="py-3.5 font-bold text-white font-display">
                      {formatCurrency(o.totalAmountCents)}
                    </td>
                    <td className="py-3.5 text-slate-400">{o.assignedStaff}</td>
                    <td className="py-3.5 text-slate-400">{o.deliveryDate ? formatDate(o.deliveryDate) : "Por definir"}</td>
                    <td className="py-3.5 pr-2 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg bg-[#111827] border border-slate-700 text-white text-[11px] font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PENDING">PENDIENTE</option>
                        <option value="ACCEPTED">ACEPTADO</option>
                        <option value="IN_DEVELOPMENT">EN DESARROLLO</option>
                        <option value="IN_REVIEW">REVISIÓN</option>
                        <option value="COMPLETED">COMPLETADO</option>
                        <option value="CANCELLED">CANCELADO</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {loading ? "Cargando pedidos de la base de datos..." : "No hay pedidos registrados en la plataforma."}
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
