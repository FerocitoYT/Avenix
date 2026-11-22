"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AvenixLogo } from "@/components/brand/logo";
import {
  LayoutDashboard,
  Bot,
  Package,
  CreditCard,
  LifeBuoy,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  Server,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { label: "Visión General", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mis Servicios", href: "/dashboard/servicios", icon: Layers },
    { label: "Gestión de Bots", href: "/dashboard/bots", icon: Bot },
    { label: "Mis Pedidos", href: "/dashboard/pedidos", icon: Package },
    { label: "Facturación & Pagos", href: "/dashboard/facturacion", icon: CreditCard },
    { label: "Soporte & Tickets", href: "/dashboard/soporte", icon: LifeBuoy },
    { label: "Mi Cuenta", href: "/dashboard/cuenta", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-blue-400">
            Cargando Avenix Control...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col md:flex-row text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0e1626] border-r border-slate-800/80 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-800/80">
            <AvenixLogo />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Panel de Administración</span>
            </Link>
          )}

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-slate-800">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || "Usuario"}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0e1626] border-b border-slate-800 sticky top-0 z-40">
        <AvenixLogo size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0B1220]/95 backdrop-blur-2xl p-6 flex flex-col justify-between animate-in slide-in-from-top-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <AvenixLogo />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
