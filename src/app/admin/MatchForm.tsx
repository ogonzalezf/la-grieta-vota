"use client";
import { useState } from "react";
import { saveMatch } from "./actions";
import { Save, X, Trophy, Zap } from "lucide-react";

interface Team {
  id: number;
  name: string;
}

interface Match {
  id: number;
  tournament: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  date: Date | string | null;
  teamAId: number;
  teamBId: number;
  scoreA: number;
  scoreB: number;
  isVotingActive: boolean;
}

interface MatchFormProps {
  teams: Team[];
  editingMatch: Match | null;
  onCancel: () => void;
}

export default function MatchForm({
  teams,
  editingMatch,
  onCancel,
}: MatchFormProps) {
  // FUNCIÓN CRÍTICA: Formateo manual para asegurar compatibilidad total con el navegador
  const formatForInput = (dateInput: Date | string | null | undefined) => {
    
    if (!dateInput) return "";

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    // Extraemos componentes locales uno a uno.
    // Esto evita que el input ignore la fecha por formatos ISO mal interpretados.
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  const [formData, setFormData] = useState({
    id: editingMatch?.id.toString() || "",
    tournament: editingMatch?.tournament || "",
    status: editingMatch?.status || "UPCOMING",
    date: formatForInput(editingMatch?.date), // Aplicamos el formato aquí
    teamA: editingMatch?.teamAId?.toString() || "",
    teamB: editingMatch?.teamBId?.toString() || "",
    scoreA: (editingMatch?.scoreA || 0).toString(),
    scoreB: (editingMatch?.scoreB || 0).toString(),
    isVotingActive: editingMatch?.isVotingActive || false,
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "UPCOMING" | "LIVE" | "FINISHED";
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      isVotingActive: newStatus === "FINISHED" ? true : prev.isVotingActive,
    }));
  };

  return (
    <div className="glass-card p-8 border-lol-cyan/20 bg-slate-900/40 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-xl font-black uppercase tracking-tighter text-white italic flex items-center gap-3">
          {editingMatch ? (
            <Zap className="text-lol-cyan animate-pulse" size={24} />
          ) : (
            <Trophy className="text-lol-cyan" size={24} />
          )}
          {editingMatch
            ? `Editando Encuentro #${editingMatch.id}`
            : "Programar Nuevo Encuentro"}
        </h2>
        {editingMatch && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form
        action={async (data) => {
          await saveMatch(data);
          if (editingMatch) onCancel();
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
      >
        <input type="hidden" name="id" value={formData.id} />
        <input
          type="hidden"
          name="isVotingActive"
          value={formData.isVotingActive.toString()}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
            Torneo
          </label>
          <input
            name="tournament"
            value={formData.tournament}
            onChange={(e) =>
              setFormData({ ...formData, tournament: e.target.value })
            }
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none transition-all placeholder:text-slate-700 shadow-inner"
            placeholder="Ej: LLA Apertura 2024"
            required
          />
        </div>

        {/* INPUT DE FECHA: Aseguramos que el value siempre reciba el formato correcto */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
            Fecha y Hora
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
            Estado del Encuentro
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleStatusChange}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none cursor-pointer"
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="LIVE">LIVE</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
            Equipo Azul (A)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="teamA"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
              className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:border-lol-cyan outline-none"
              required
            >
              <option value="">Equipo A</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="scoreA"
              value={formData.scoreA}
              onChange={(e) =>
                setFormData({ ...formData, scoreA: e.target.value })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-black text-white focus:border-lol-cyan outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
            Equipo Rojo (B)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="teamB"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
              className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:border-lol-cyan outline-none"
              required
            >
              <option value="">Equipo B</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="scoreB"
              value={formData.scoreB}
              onChange={(e) =>
                setFormData({ ...formData, scoreB: e.target.value })
              }
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-black text-white focus:border-lol-cyan outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-lol-cyan tracking-widest ml-1">
            Votación Activa
          </label>
          <div className="bg-slate-950 border border-lol-cyan/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(8,145,178,0.05)]">
            <span className="text-xs text-slate-400 font-bold italic uppercase">
              Abrir Votos
            </span>
            <input
              type="checkbox"
              checked={formData.isVotingActive}
              onChange={(e) =>
                setFormData({ ...formData, isVotingActive: e.target.checked })
              }
              className="size-5 accent-lol-cyan cursor-pointer"
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end items-center gap-4 pt-4 mt-2 border-t border-slate-800/50">
          {editingMatch && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-black uppercase text-slate-500 hover:text-white tracking-widest transition-colors"
            >
              Descartar Cambios
            </button>
          )}
          <button
            type="submit"
            className="bg-lol-cyan text-black px-12 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-lol-cyan/10"
          >
            <Save size={18} />
            {editingMatch ? "Actualizar Encuentro" : "Publicar Encuentro"}
          </button>
        </div>
      </form>
    </div>
  );
}
