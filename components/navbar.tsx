"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvenixLogo } from "./brand/logo";
import {
  Menu,
  X,
  Sparkles,
  ChevronRight,
  User,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  CreditCard,
  FolderGit2,
  Send,
  Calculator,
} from "lucide-react";

interface NavUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check session on mount
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingUser(false));
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/servicios" },
    { label: "Precios", href: "/precios" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Presupuesto", href: "/presupuesto", highlight: true },
    { label: "Contacto", href: "/contacto" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B1220]/85 backdrop-blur-xl border-b border-blue-500/15 py-3 shadow-lg shadow-black/40"
          : "bg-transparent py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <AvenixLogo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                    : link.highlight
                    ? "text-blue-300 hover:text-white bg-blue-900/20 hover:bg-blue-900/35 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                {link.highlight && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions / User session */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
                  title="Panel de Administración"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Avenix Control</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>Iniciar sesión</span>
              </Link>

              <Link
                href="/presupuesto"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Contratar</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-blue-400" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-blue-500/20 bg-[#0B1220]/95 backdrop-blur-2xl px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2.5 rounded-xl text-base font-medium flex items-center justify-between ${
                    isActive
                      ? "text-blue-400 bg-blue-500/15 border border-blue-500/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-slate-800/80 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Ir a Avenix Control
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Panel Administrativo
                    </Link>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/70 border border-slate-700/50 hover:text-white"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/presupuesto"
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 shadow-lg shadow-blue-600/25 hover:bg-blue-500"
                  >
                    Contratar
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
