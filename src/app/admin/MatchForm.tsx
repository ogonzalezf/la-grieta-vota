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

    // CORRECCIÓN CLAVE:
    // Obtenemos el desfase en minutos y lo convertimos a milisegundos.
    // Restamos el desfase para que los métodos "get..." devuelvan
    // exactamente lo que hay en la base de datos sin importar la zona horaria.
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const dateAdjusted = new Date(d.getTime() + userTimezoneOffset);

    const year = dateAdjusted.getFullYear();
    const month = String(dateAdjusted.getMonth() + 1).padStart(2, "0");
    const day = String(dateAdjusted.getDate()).padStart(2, "0");
    const hours = String(dateAdjusted.getHours()).padStart(2, "0");
    const minutes = String(dateAdjusted.getMinutes()).padStart(2, "0");

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
    <div className="glass-card p-4 md:p-8 border-lol-cyan/20 bg-slate-900/40 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10">
        <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white italic flex items-center gap-2 md:gap-3">
          {editingMatch ? (
            <Zap className="text-lol-cyan animate-pulse" size={20} />
          ) : (
            <Trophy className="text-lol-cyan" size={20} />
          )}
          <span className="truncate">
            {editingMatch ? `Editando #${editingMatch.id}` : "Nuevo Encuentro"}
          </span>
        </h2>
        {/* Botón cancelar más visible en móvil */}
        {editingMatch && (
          <button type="button" onClick={onCancel} className="p-2 bg-slate-800 rounded-lg text-white">
            <X size={18} />
          </button>
        )}
      </div>

      <form
        action={async (data) => {
          await saveMatch(data);
          if (editingMatch) onCancel();
        }}
        className="flex flex-col gap-6 relative z-10" // Cambiado a flex-col por defecto
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <input type="hidden" name="id" value={formData.id} />
          <input type="hidden" name="isVotingActive" value={formData.isVotingActive.toString()} />

          {/* CADA CAMPO: Aseguramos padding y tamaños táctiles */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Torneo</label>
            <input
              name="tournament"
              value={formData.tournament}
              onChange={(e) => setFormData({ ...formData, tournament: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none"
              placeholder="Ej: LEC SPRING 2026"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-lol-cyan outline-none"
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="LIVE">LIVE</option>
              <option value="FINISHED">FINISHED</option>
            </select>
          </div>

          {/* EQUIPOS: Grid 2-1 para que el score no se rompa */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Equipo Azul (A)</label>
            <div className="flex gap-2">
              <select
                name="teamA"
                value={formData.teamA}
                onChange={(e) => setFormData({ ...formData, teamA: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none"
                required
              >
                <option value="">Equipo A</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="number"
                name="scoreA"
                value={formData.scoreA}
                onChange={(e) => setFormData({ ...formData, scoreA: e.target.value })}
                className="w-16 bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-black text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Equipo Rojo (B)</label>
            <div className="flex gap-2">
              <select
                name="teamB"
                value={formData.teamB}
                onChange={(e) => setFormData({ ...formData, teamB: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none"
                required
              >
                <option value="">Equipo B</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="number"
                name="scoreB"
                value={formData.scoreB}
                onChange={(e) => setFormData({ ...formData, scoreB: e.target.value })}
                className="w-16 bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-black text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-lol-cyan tracking-widest ml-1">Votación Activa</label>
            <div className="bg-slate-950 border border-lol-cyan/20 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase italic">Abrir Votos</span>
              <input
                type="checkbox"
                checked={formData.isVotingActive}
                onChange={(e) => setFormData({ ...formData, isVotingActive: e.target.checked })}
                className="size-6 accent-lol-cyan"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN: Ancho completo en móvil */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 pt-4 border-t border-slate-800/50">
          <button
            type="submit"
            className="w-full md:w-auto bg-lol-cyan text-black px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg"
          >
            <Save size={18} />
            {editingMatch ? "Actualizar" : "Publicar Encuentro"}
          </button>
        </div>
      </form>
    </div>
  );
}