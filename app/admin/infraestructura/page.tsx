"use client";

import React, { useState } from "react";
import {
  Server,
  Bot,
  Activity,
  Cpu,
  HardDrive,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ShieldCheck,
} from "lucide-react";

export default function AdminInfraestructuraPage() {
  const [nodes] = useState([
    {
      id: "node-fra-01",
      name: "eu-node-01.avenix.dev (Frankfurt)",
      ip: "185.190.x.x",
      status: "HEALTHY",
      containersActive: 12,
      ramAllocatedMb: 6144,
      ramTotalMb: 16384,
      cpuPercent: 14.5,
      uptimeDays: 148,
    },
    {
      id: "node-mad-01",
      name: "es-node-01.avenix.dev (Madrid)",
      ip: "194.38.x.x",
      status: "HEALTHY",
      containersActive: 6,
      ramAllocatedMb: 3072,
      ramTotalMb: 16384,
      cpuPercent: 8.2,
      uptimeDays: 92,
    },
  ]);

  const [instances, setInstances] = useState([
    {
      id: "inst-1",
      botName: "Avenix Moderation #8821",
      clientEmail: "carlos@comunidad.es",
      node: "eu-node-01.avenix.dev",
      status: "RUNNING",
      ramMb: 142,
      ramLimitMb: 512,
      cpuPercent: 4.2,
      pingMs: 18,
    },
    {
      id: "inst-2",
      botName: "Tickets & Verificación #4012",
      clientEmail: "laura@tiendavirtual.com",
      node: "eu-node-01.avenix.dev",
      status: "RUNNING",
      ramMb: 98,
      ramLimitMb: 512,
      cpuPercent: 1.8,
      pingMs: 21,
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const restartInstance = (id: string, name: string) => {
    setToast(`Orden de reinicio emitida para ${name}.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Infraestructura Cloud y Servidores
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitorización de nodos Docker dedicados en la Unión Europea y gestión de contenedores activos.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Nodes Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map((n) => (
          <div
            key={n.id}
            className="p-6 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display">{n.name}</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Operativo (99.9%)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Contenedores</span>
                <span className="text-base font-bold text-white">{n.containersActive}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">RAM Asignada</span>
                <span className="text-base font-bold text-white">
                  {(n.ramAllocatedMb / 1024).toFixed(1)} GB / {(n.ramTotalMb / 1024).toFixed(0)} GB
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Uptime</span>
                <span className="text-base font-bold text-white">{n.uptimeDays} días</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Bot Instances */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1220] border border-slate-800 space-y-5">
        <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>Contenedores de Bots en Ejecución</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Instancia</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Nodo</th>
                <th className="pb-3">Memoria RAM</th>
                <th className="pb-3">Uso CPU</th>
                <th className="pb-3">Ping</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {instances.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white">{inst.botName}</td>
                  <td className="py-3.5 text-slate-400">{inst.clientEmail}</td>
                  <td className="py-3.5 text-indigo-400 font-mono text-[11px]">{inst.node}</td>
                  <td className="py-3.5 text-slate-300">
                    {inst.ramMb} MB / {inst.ramLimitMb} MB
                  </td>
                  <td className="py-3.5 text-slate-300">{inst.cpuPercent}%</td>
                  <td className="py-3.5 text-emerald-400 font-mono">{inst.pingMs} ms</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => restartInstance(inst.id, inst.botName)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800"
                    >
                      Reiniciar Contenedor
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
