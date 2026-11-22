"use client";

import React, { useState } from "react";
import {
  Bot,
  Play,
  Square,
  RotateCw,
  Terminal,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sliders,
  Shield,
  Save,
  Loader2,
} from "lucide-react";

export default function BotManagementPage() {
  const [botStatus, setBotStatus] = useState<"RUNNING" | "STOPPED" | "RESTARTING">("RUNNING");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Configuration state
  const [prefix, setPrefix] = useState("!");
  const [embedColor, setEmbedColor] = useState("#3B82F6");
  const [modules, setModules] = useState({
    moderation: true,
    tickets: true,
    welcome: true,
    antiraid: false,
    economy: false,
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Simulated live console logs
  const [logs, setLogs] = useState<string[]>([
    "[2026-11-22 17:55:01] [INFO] [Core] Avenix Bot Framework v4.2.0 initialized.",
    "[2026-11-22 17:55:02] [INFO] [Gateway] Shard 0/0 connecting to Discord Gateway v10...",
    "[2026-11-22 17:55:03] [INFO] [Database] PostgreSQL connection pool established (2ms ping).",
    "[2026-11-22 17:55:04] [INFO] [Gateway] Shard 0 connected. Identified as 'Avenix Support #8821'.",
    "[2026-11-22 17:55:05] [INFO] [Modules] Loaded 14 Slash Commands and 6 Component Modals.",
    "[2026-11-22 18:00:00] [INFO] [Cron] Automated ticket transcript archiving completed.",
    "[2026-11-22 18:08:12] [INFO] [HealthCheck] Node eu-node-01 status: OK (RAM: 142MB / 512MB, CPU: 4.2%).",
  ]);

  const handleAction = async (action: "START" | "STOP" | "RESTART") => {
    setLoadingAction(action);
    const timestamp = new Date().toLocaleTimeString();

    if (action === "RESTART") {
      setBotStatus("RESTARTING");
      setLogs((prev) => [
        ...prev,
        `[${timestamp}] [SYSTEM] Reinicio manual solicitado desde Avenix Control por el cliente...`,
      ]);

      setTimeout(() => {
        setBotStatus("RUNNING");
        setLogs((prev) => [
          ...prev,
          `[${timestamp}] [GATEWAY] Proceso reiniciado con éxito. Shard 0 re-conectado.`,
        ]);
        setLoadingAction(null);
      }, 1500);
    } else if (action === "STOP") {
      setTimeout(() => {
        setBotStatus("STOPPED");
        setLogs((prev) => [
          ...prev,
          `[${timestamp}] [SYSTEM] Señal SIGTERM recibida. Instancia detenida correctamente.`,
        ]);
        setLoadingAction(null);
      }, 1000);
    } else if (action === "START") {
      setTimeout(() => {
        setBotStatus("RUNNING");
        setLogs((prev) => [
          ...prev,
          `[${timestamp}] [SYSTEM] Contenedor Docker iniciado en eu-node-01. Conectando...`,
        ]);
        setLoadingAction(null);
      }, 1200);
    }
  };

  const handleSaveConfig = () => {
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      setConfigSavedToast(true);
      setTimeout(() => setConfigSavedToast(false), 3000);
    }, 600);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Avenix Moderation & Support
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                botStatus === "RUNNING"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : botStatus === "RESTARTING"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {botStatus === "RUNNING"
                ? "Online"
                : botStatus === "RESTARTING"
                ? "Reiniciando..."
                : "Detenido"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instancia alojada en el contenedor <span className="font-mono text-slate-300">c-avx-bot-0192</span> en el nodo{" "}
            <span className="text-blue-400 font-medium">eu-node-01.avenix.dev</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {botStatus === "RUNNING" ? (
            <>
              <button
                onClick={() => handleAction("RESTART")}
                disabled={loadingAction !== null}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingAction === "RESTART" ? "animate-spin" : ""}`} />
                <span>Reiniciar</span>
              </button>
              <button
                onClick={() => handleAction("STOP")}
                disabled={loadingAction !== null}
                className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Detener</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction("START")}
              disabled={loadingAction !== null}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Iniciar Bot</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Uso de Memoria RAM</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">142 MB</span>
            <span className="text-xs text-slate-500">/ 512 MB (27%)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[27%] h-full bg-blue-500 rounded-full" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Uso de CPU</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">4.2%</span>
            <span className="text-xs text-slate-500">Límite 50%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[8%] h-full bg-indigo-500 rounded-full" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Uptime Continuo</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">14d 8h</span>
            <span className="text-xs text-emerald-400">99.98%</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Sin caídas registradas</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Latencia Discord Gateway</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-display">18 ms</span>
            <span className="text-xs text-emerald-400">Excelente</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Conexión WebSocket directa</span>
        </div>
      </div>

      {/* Main split: Console Logs vs Module Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (2 cols): Live Console Log Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-display">
                Consola de Logs en Tiempo Real
              </h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(logs.join("\n"));
                alert("Logs copiados al portapapeles");
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar logs</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#080d17] border border-slate-800 font-mono text-[11px] text-slate-300 h-96 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed hover:bg-slate-900/50 px-1 rounded">
                <span className="text-slate-500">{log.slice(0, 21)}</span>{" "}
                <span
                  className={
                    log.includes("[ERROR]")
                      ? "text-red-400 font-bold"
                      : log.includes("[INFO]")
                      ? "text-blue-400"
                      : log.includes("[SYSTEM]")
                      ? "text-amber-400"
                      : "text-slate-300"
                  }
                >
                  {log.slice(21)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Bot Configuration & Active Modules */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Configuración del Bot
                </h3>
              </div>
            </div>

            {configSavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Configuración guardada correctamente.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prefijo secundario de texto
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                maxLength={3}
                className="w-20 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Color de los Mensajes Embed (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={embedColor}
                  onChange={(e) => setEmbedColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={embedColor}
                  onChange={(e) => setEmbedColor(e.target.value)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0B1220] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modules Checkboxes */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Módulos Habilitados
              </label>

              {[
                { key: "moderation", label: "Moderación y Sanciones" },
                { key: "tickets", label: "Sistema de Tickets" },
                { key: "welcome", label: "Mensajes de Bienvenida" },
                { key: "antiraid", label: "Modo Anti-Raid Estricto" },
                { key: "economy", label: "Sistema de Economía" },
              ].map((mod) => (
                <div key={mod.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{mod.label}</span>
                  <input
                    type="checkbox"
                    checked={(modules as any)[mod.key]}
                    onChange={(e) =>
                      setModules({ ...modules, [mod.key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
