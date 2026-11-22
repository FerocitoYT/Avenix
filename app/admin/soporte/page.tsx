"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface StaffTicket {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientEmail: string;
  title: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "CLOSED";
  assignedStaff: string;
  createdAt: string;
  messages: Array<{
    id: string;
    sender: string;
    isStaff: boolean;
    content: string;
    createdAt: string;
  }>;
}

export default function AdminSoportePage() {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch("/api/admin/tickets");
        const data = await res.json();
        if (data?.tickets) {
          setTickets(data.tickets);
          if (data.tickets.length > 0) {
            setActiveId(data.tickets[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading real tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const activeTicket = tickets.find((t) => t.id === activeId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeId) return;

    const newMsg = {
      id: "m-" + Date.now(),
      sender: "Avenix Staff (Tú)",
      isStaff: true,
      content: replyText,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, status: "WAITING_CLIENT", messages: [...t.messages, newMsg] }
          : t
      )
    );
    setReplyText("");
  };

  const changeStatus = (newStatus: StaffTicket["status"]) => {
    if (!activeId) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Centro de Soporte y Atención Técnica
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Bandeja unificada de tickets de soporte técnico, asignación a empleados y respuestas en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tickets Pendientes ({tickets.length})
          </h2>

          <div className="space-y-2">
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    activeId === t.id
                      ? "bg-[#0B1220] border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-[#0B1220]/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {t.ticketNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mb-0.5">{t.title}</p>
                  <p className="text-[11px] text-slate-400">{t.clientName}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>Asignado: {t.assignedStaff}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[#0B1220]/60 border border-slate-800 text-center text-xs text-slate-500">
                {loading ? "Cargando tickets..." : "No hay tickets de soporte abiertos."}
              </div>
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <div className="rounded-3xl bg-[#0B1220] border border-slate-800 flex flex-col h-[600px] overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-[#0e1626] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-white font-display">
                      {activeTicket.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cliente: {activeTicket.clientName} ({activeTicket.clientEmail})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => changeStatus(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-[#111827] border border-slate-700 text-white text-[11px] font-semibold"
                  >
                    <option value="OPEN">ABIERTO</option>
                    <option value="IN_PROGRESS">EN PROCESO</option>
                    <option value="WAITING_CLIENT">ESPERANDO CLIENTE</option>
                    <option value="RESOLVED">RESUELTO</option>
                    <option value="CLOSED">CERRADO</option>
                  </select>
                </div>
              </div>

              {/* Messages Viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isStaff ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      <span className="font-semibold text-slate-300">{m.sender}</span>
                      <span>• {formatDateTime(m.createdAt)}</span>
                    </div>

                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        m.isStaff
                          ? "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20"
                          : "bg-slate-800 text-white border border-slate-700 rounded-tl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-[#0e1626] flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Responder como soporte técnico de Avenix..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1220] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#0B1220] border border-slate-800">
              {tickets.length === 0 ? "No hay tickets de soporte abiertos actualmente." : "Selecciona un ticket de la lista para responder."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
