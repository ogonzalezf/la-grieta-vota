"use client";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

// 1. Definición de la interfaz para la sesión de usuario
interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roleWeight: number; // Propiedad personalizada de tu esquema
  roleName?: string | null; // Propiedad personalizada de tu esquema
}

interface AuthStatusProps {
  session: {
    user?: AuthUser;
  } | null;
}

export default function AuthStatus({ session }: AuthStatusProps) {
  // CASO: Usuario Logueado
  if (session?.user) {
    return (
      <div className="flex items-center gap-4 group">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-black text-slate-100 tracking-tight leading-none mb-1">
            {session.user.name}
          </span>
          <div className="flex items-center gap-1">
            {/* Uso seguro de roleWeight gracias al tipado */}
            {session.user.roleWeight > 1 && (
              <ShieldCheck size={10} className="text-lol-cyan" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-lol-cyan bg-lol-cyan/10 px-1.5 py-0.5 rounded">
              {session.user.roleName || "Comunidad"}
            </span>
          </div>
        </div>

        <div className="relative size-10 shrink-0">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              fill
              sizes="40px"
              className="rounded-full border-2 border-slate-700 group-hover:border-lol-cyan transition-colors object-cover"
            />
          ) : (
            <div className="size-full bg-slate-800 rounded-full border border-slate-700" />
          )}
        </div>

        <button
          onClick={() => signOut()}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  // CASO: Usuario no logueado
  return (
    <button onClick={() => signIn("google")} className="btn-primary group">
      <LogIn
        size={18}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
      <span className="text-sm">ENTRAR</span>
    </button>
  );
}
