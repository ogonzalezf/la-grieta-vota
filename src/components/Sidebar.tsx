"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Trophy,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Swords,
  ShieldCheck,
  Calendar,
  Info,
  History,
} from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  isAdmin: boolean;
  activeTournament: string;
}

export default function Sidebar({ isAdmin, activeTournament }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Inicio", icon: Home, href: "/" },
    { name: "Explorar Equipos", icon: Users, href: "/teams" },
    { name: "Calendario", icon: Calendar, href: "/calendar" },
    { name: "Historial", icon: History, href: "/history" },
    { name: "Metodología", icon: Info, href: "/about" },
    { name: "Solicitar Rango", icon: ShieldCheck, href: "/verify" },
  ];

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* BOTÓN MÓVIL */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-5 left-6 z-50 p-2 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xl"
      >
        <Menu size={24} />
      </button>

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0b1120] border-r border-slate-800/60 transform transition-all duration-300 ease-in-out 
          lg:relative lg:translate-x-0 
          ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-20 xl:w-72"} 
        `}
      >
        <div className="flex flex-col h-full py-6 overflow-hidden">
          {/* LOGO: Versión compacta para iPad, versión completa para Desktop */}
          <div className="px-4 pb-6 flex justify-center">
            <Link href="/" className="block group relative">
              {/* Logo reducido (Icono) para iPad */}
              <div className="relative h-12 w-12 xl:hidden">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              {/* Logo completo para Desktop */}
              <div className="relative h-16 w-48 hidden xl:block">
                <Image
                  src="/logo.png"
                  alt="La Grieta Vota"
                  fill
                  priority
                  className="object-contain transition-transform group-hover:scale-105"
                  sizes="200px"
                />
              </div>
            </Link>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const LucideIcon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-center xl:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-lol-cyan/10 text-lol-cyan border border-lol-cyan/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                  title={item.name}
                >
                  <LucideIcon size={20} className="shrink-0" />
                  {/* TEXTO: Oculto en iPad Pro (1024px), visible en pantallas extra grandes */}
                  <span className="hidden xl:block truncate">{item.name}</span>
                </Link>
              );
            })}

            {/* SECCIÓN ADMIN */}
            {isAdmin && (
              <div className="pt-6 mt-6 border-t border-slate-800/40">
                <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden xl:block">
                  Admin
                </p>
                <Link
                  href="/admin"
                  className={`flex items-center justify-center xl:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                  title="Panel Admin"
                >
                  <ShieldCheck size={20} className="shrink-0" />
                  <span className="hidden xl:block">Panel Admin</span>
                </Link>
              </div>
            )}
          </nav>

          {/* FOOTER SIDEBAR */}
          <div className="p-6 mt-auto border-t border-slate-800/40 bg-slate-900/20 flex justify-center xl:justify-start">
            <div className="flex items-center gap-3 px-2">
              <div className="size-2 rounded-full bg-lol-cyan animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden xl:block">
                {activeTournament}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* OVERLAY MÓVIL */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}