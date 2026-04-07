"use client";
import { useState } from "react";
import { Send, AlertCircle, ArrowUpCircle } from "lucide-react";
import { submitVerification } from "./actions";


interface Role {
  id: number;
  name: string;
  weight: string; // En Drizzle/Postgres suele venir como string para decimales
}

interface VerifyFormProps {
  roles: Role[];
  isScaling?: boolean;
}


export default function VerifyForm({ roles, isScaling }: VerifyFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await submitVerification(formData);
    if (result?.error) setError(result.error);
    else window.location.reload(); // Recargamos para que el Server Component detecte la nueva solicitud
    setIsPending(false);
  }

  return (
    <form
      action={handleSubmit}
      className="glass-card p-8 space-y-6 relative overflow-hidden"
    >
      {isPending && (
        <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm z-10 flex items-center justify-center" />
      )}

      {isScaling && (
        <div className="p-4 bg-lol-cyan/5 border border-lol-cyan/20 rounded-xl flex items-center gap-3 text-lol-cyan text-xs font-bold italic">
          <ArrowUpCircle size={18} />
          ESTÁS SOLICITANDO UN CAMBIO DE RANGO PROFESIONAL
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Riot ID + Tag
          </label>
          <input
            name="riotId"
            required
            placeholder="Faker#KR1"
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-lol-cyan outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Nuevo Rango Solicitado
          </label>
          <select
            name="roleId"
            required
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-lol-cyan outline-none cursor-pointer"
          >
            <option value="">Selecciona un rol...</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} (Peso {role.weight})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Prueba de identidad (URL)
          </label>
          <input
            name="evidence"
            placeholder="Link a Twitter, Liquipedia o Portfolio"
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-lol-cyan outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full py-4 text-lg"
      >
        <Send size={20} />
        {isScaling ? "SOLICITAR CAMBIO DE ROL" : "ENVIAR PETICIÓN"}
      </button>
    </form>
  );
}
