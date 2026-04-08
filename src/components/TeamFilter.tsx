"use client";
import { useState } from "react";
import Image from "next/image";
import TopPlayers from "./TopPlayers";

// 1. Definimos las interfaces basadas en tu esquema de DB
interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface PlayerWithStats {
  playerId: number;
  playerName: string;
  playerImage: string | null;
  playerPosition: string | null;
  teamId: number; // Necesario para el filtrado
  teamName: string;
  teamLogo: string | null;
  globalAverage: number;
}

interface TeamFilterProps {
  initialPlayers: PlayerWithStats[];
  teams: Team[];
}

export default function TeamFilter({ initialPlayers, teams }: TeamFilterProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // 2. Filtramos usando el ID del equipo
  const filteredPlayers = selectedTeamId
    ? initialPlayers.filter((p) => p.teamId === selectedTeamId)
    : initialPlayers;

  return (
    <div className="space-y-8">
      {/* SECCIÓN DE FILTROS POR LOGO */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setSelectedTeamId(null)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            !selectedTeamId
              ? "bg-lol-cyan text-black border-lol-cyan shadow-[0_0_15px_rgba(8,145,178,0.3)]"
              : "bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700"
          }`}
        >
          Ver Todos
        </button>

        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeamId(team.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all border group ${
              selectedTeamId === team.id
                ? "bg-slate-800 border-lol-cyan text-white ring-1 ring-lol-cyan/30"
                : "bg-slate-900/40 border-slate-800/50 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <div className="relative size-6">
              <Image
                src={team.logoUrl || "/placeholder.png"}
                alt={team.name}
                fill
                className={`object-contain transition-transform ${selectedTeamId === team.id ? "scale-110" : "group-hover:scale-110"}`}
                sizes="32px"
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight">
              {team.name}
            </span>
          </button>
        ))}
      </div>

      {/* RENDERIZADO DE LA LISTA FILTRADA */}
      <div className="relative">
        <TopPlayers players={filteredPlayers} />

        {/* Mensaje si un equipo no tiene jugadores en el ranking aún */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 italic text-sm font-medium">
              Aún no hay votos registrados para jugadores de este equipo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
