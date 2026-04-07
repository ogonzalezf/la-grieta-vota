// src/app/admin/MatchManager.tsx
"use client";
import { useState } from "react";
import { Edit3, Trash2, Power, PowerOff } from "lucide-react";
import MatchForm from "./MatchForm";
import { deleteMatch, toggleVoting } from "./actions";

// 1. Definición de interfaces para eliminar los errores de 'any'
interface Team {
  id: number;
  name: string;
}

interface MatchListItem {
  id: number;
  tournament: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  date: Date | string | null;
  scoreA: number;
  scoreB: number;
  teamAId: number;
  teamBId: number;
  teamAName: string;
  teamBName: string;
  isVotingActive: boolean;
}

interface MatchManagerProps {
  initialMatches: MatchListItem[];
  teams: Team[];
}

export default function MatchManager({
  initialMatches,
  teams,
}: MatchManagerProps) {
  // 2. Estado tipado correctamente
  const [editingMatch, setEditingMatch] = useState<MatchListItem | null>(null);

  // 3. Función manejadora con tipado explícito
  const handleEditClick = (match: MatchListItem) => {
    setEditingMatch(match);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* El formulario recibe el partido a editar o null */}
      <MatchForm
        key={editingMatch?.id || "new"}
        teams={teams}
        editingMatch={editingMatch}
        onCancel={() => setEditingMatch(null)}
      />

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">
          Encuentros Recientes
        </h3>
        {/* Tipado del mapeo */}
        {initialMatches.map((m: MatchListItem) => (
          <div
            key={m.id}
            className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="text-center min-w-15">
                <p
                  className={`text-[8px] font-black uppercase tracking-tighter ${
                    m.isVotingActive ? "text-lol-cyan" : "text-slate-600"
                  }`}
                >
                  {m.isVotingActive ? "Votación ON" : "Votación OFF"}
                </p>
                <p className="text-xs font-black text-white italic">
                  {m.scoreA} - {m.scoreB}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  {m.tournament}
                </p>
                <p className="text-sm font-black text-white italic uppercase tracking-tight">
                  {m.teamAName}{" "}
                  <span className="text-lol-cyan/40 not-italic mx-1 text-[10px]">
                    VS
                  </span>{" "}
                  {m.teamBName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => await toggleVoting(m.id, m.isVotingActive)}
                className={`p-2 rounded-lg transition-all border ${
                  m.isVotingActive
                    ? "bg-lol-cyan/10 border-lol-cyan/20 text-lol-cyan hover:bg-lol-cyan/20"
                    : "bg-slate-900 border-slate-800 text-slate-600 hover:text-white"
                }`}
              >
                {m.isVotingActive ? (
                  <Power size={14} />
                ) : (
                  <PowerOff size={14} />
                )}
              </button>

              <button
                onClick={() => handleEditClick(m)}
                className="p-2 bg-slate-800/40 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
              >
                <Edit3 size={16} />
              </button>

              <button
                onClick={() => {
                  if (confirm("¿Borrar partido?")) deleteMatch(m.id);
                }}
                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
