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
          ${
            isOpen
              ? "translate-x-0 w-72" // Cuando está abierto, siempre mide 72 (288px)
              : "-translate-x-full lg:translate-x-0 lg:w-20 xl:w-72" // En iPad (lg) mide 20 si está cerrado
          } 
        `}
      >
        <div className="flex flex-col h-full py-6 overflow-hidden">
          {/* LOGO: Adaptable al ancho actual */}
          <div className="px-4 pb-6 flex justify-center">
            <Link href="/" className="block group relative">
              {/* Logo reducido: Visible solo si el sidebar es estrecho (lg cerrado) */}
              <div
                className={`relative h-12 w-12 ${!isOpen ? "lg:block xl:hidden" : "hidden"}`}
              >
                <Image
                  src="/logo.png"
                  alt="La Grieta Vota"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              {/* Logo completo: Visible si el sidebar está abierto o es desktop (xl) */}
              <div
                className={`relative h-16 w-48 ${isOpen ? "block" : "hidden xl:block"}`}
              >
                <Image
                  src="/logo.png"
                  alt="La Grieta Vota"
                  fill
                  priority
                  className="object-contain"
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    // Si está abierto, alineamos a la izquierda; si está cerrado en lg, centramos
                    isOpen || "xl" ? "justify-start" : "justify-center"
                  } ${
                    isActive
                      ? "bg-lol-cyan/10 text-lol-cyan border border-lol-cyan/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                  title={item.name}
                >
                  <LucideIcon size={20} className="shrink-0" />
                  {/* TEXTO: Visible si el sidebar está abierto o en desktop */}
                  <span
                    className={`truncate ${isOpen ? "block" : "hidden xl:block"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* SECCIÓN ADMIN */}
            {isAdmin && (
              <div className="pt-6 mt-6 border-t border-slate-800/40">
                <p
                  className={`px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ${isOpen ? "block" : "hidden xl:block"}`}
                >
                  Admin
                </p>
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isOpen ? "justify-start" : "justify-center xl:justify-start"
                  } ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <ShieldCheck size={20} className="shrink-0" />
                  <span className={`${isOpen ? "block" : "hidden xl:block"}`}>
                    Panel Admin
                  </span>
                </Link>
              </div>
            )}
          </nav>

          {/* FOOTER SIDEBAR */}
          <div
            className={`p-6 mt-auto border-t border-slate-800/40 bg-slate-900/20 flex ${isOpen ? "justify-start" : "justify-center xl:justify-start"}`}
          >
            <div className="flex items-center gap-3 px-2">
              <div className="size-2 rounded-full bg-lol-cyan animate-pulse shrink-0" />
              <span
                className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isOpen ? "block" : "hidden xl:block"}`}
              >
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