"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  Calendar,
  History,
  Info,
  ShieldCheck,
  Lock,
  Menu,
  X,
  Users,
} from "lucide-react";

const menuItems = [
  { name: "Partidos", icon: Swords, href: "/" },
  { name: "Explorar Equipos", icon: Users, href: "/teams" },
  { name: "Calendario", icon: Calendar, href: "/calendar" },
  { name: "Historial", icon: History, href: "/history" },
  { name: "Metodología", icon: Info, href: "/about" },
  { name: "Solicitar Rango", icon: ShieldCheck, href: "/verify" },
];

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // SOLUCIÓN DEFINITIVA PARA NEXT.JS 16 / REACT 19:
  // Usamos un timeout de 0 para mover la ejecución fuera del ciclo síncrono del efecto
  // y así evitar el error de "cascading renders".
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Renderizado inicial seguro para SSR
  if (!mounted) {
    return (
      <aside className="hidden lg:flex w-64 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50" />
    );
  }

  return (
    <>
      {/* BOTÓN MÓVIL (Estilo original) */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed bottom-6 right-6 z-50 size-14 bg-lol-cyan text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* OVERLAY MÓVIL */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        />
      )}

      {/* CONTENEDOR SIDEBAR - ESTILO ORIGINAL RESTAURADO */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-slate-800/50
        flex flex-col transition-transform duration-300 ease-in-out
        bg-slate-900/50 backdrop-blur-xl 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* LOGO (Estilo original) */}
        <div className="p-8 mb-4">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <div className="group cursor-pointer">
              <h2 className="text-xl font-black tracking-tighter leading-none text-white uppercase">
                LA GRIETA
              </h2>
              <p className="text-lol-cyan text-2xl font-black italic tracking-tighter group-hover:text-cyan-400 transition-colors">
                VOTA
              </p>
            </div>
          </Link>
        </div>

        {/* NAVEGACIÓN (Estilo original) */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-lol-cyan/10 text-lol-cyan"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    isActive
                      ? "text-lol-cyan"
                      : "group-hover:text-lol-cyan transition-colors"
                  }
                />
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* SECCIÓN ADMINISTRACIÓN (Estilo dorado original) */}
          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-slate-800/40">
              <p className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                Gestión Interna
              </p>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  pathname === "/admin"
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                    : "text-amber-500/80 border-amber-500/10 hover:bg-amber-500/10"
                }`}
              >
                <Lock size={18} />
                <span className="font-bold text-sm tracking-tight">
                  Panel Admin
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* FOOTER SIDEBAR (Estilo original) */}
        <div className="p-6 mt-auto">
          <div className="bg-slate-900/30 p-3 rounded-2xl border border-slate-800/50">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-slate-500 font-black">
              <div className="size-1.5 bg-lol-cyan rounded-full animate-pulse shadow-[0_0_8px_#0891b2]"></div>
              v1.0 Stable
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
