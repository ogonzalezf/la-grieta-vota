"use client";
import Image from "next/image";
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Trophy,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

interface Team {
  name: string;
  logoUrl: string | null;
}

interface Match {
  id: number;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  matchDate: Date | string | null;
  tournamentName: string | null;
  teamA: Team;
  teamB: Team;
  scoreA?: number | null;
  scoreB?: number | null;
  isVotingActive: boolean; // Columna de control manual
}

interface MatchCardProps {
  match: Match;
  hasVoted?: boolean; // Booleano: ¿El usuario actual ya votó?
}

export default function MatchCard({ match, hasVoted }: MatchCardProps) {
  const dateObj = match.matchDate ? new Date(match.matchDate) : null;

  const formattedDate = dateObj
    ? dateObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      })
    : "TBD";

  const formattedTime = dateObj
    ? dateObj.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const statusStyles = {
    LIVE: "text-red-500 animate-pulse",
    UPCOMING: "text-amber-500",
    FINISHED: "text-emerald-500",
  };

  const isFinished = match.status === "FINISHED";
  const winnerA = isFinished && (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const winnerB = isFinished && (match.scoreB ?? 0) > (match.scoreA ?? 0);

  return (
    <div className="glass-card group hover:ring-2 hover:ring-lol-cyan/30 flex flex-col h-full border border-slate-800/50 hover:border-lol-cyan/30 transition-all">
      <div className="p-6 flex-1">
        {/* HEADER DE LA CARD: Torneo y Estado */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
            {match.tournamentName || "League of Legends"}
          </span>
          <div
            className={`flex items-center gap-1.5 text-xs font-black ${statusStyles[match.status]}`}
          >
            {match.status === "LIVE" ? (
              <PlayCircle size={14} />
            ) : (
              <Clock size={14} />
            )}
            {match.status === "LIVE" ? "EN VIVO" : match.status}
          </div>
        </div>

        {/* INFO DE FECHA Y HORA */}
        <div className="flex items-center justify-center gap-4 mb-8 py-2 bg-slate-900/40 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarIcon size={14} className="text-lol-cyan" />
            <span className="text-xs font-bold uppercase tracking-tight">
              {formattedDate}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-lol-cyan" />
            <span className="text-xs font-bold tracking-tight">
              {formattedTime} HS
            </span>
          </div>
        </div>

        {/* ENFRENTAMIENTO: Logos y Nombres */}
        <div className="flex items-center justify-between gap-2">
          {/* Team A */}
          <div
            className={`flex flex-col items-center gap-3 flex-1 ${winnerB ? "opacity-40" : ""}`}
          >
            <div className="relative size-16 bg-brand-dark rounded-full border border-slate-700 flex items-center justify-center p-3 shadow-inner group-hover:border-lol-cyan/50 transition-colors">
              <Image
                src={match.teamA.logoUrl || "/placeholder-team.png"}
                alt={match.teamA.name}
                width={48}
                height={48}
                className="object-contain"
              />
              {winnerA && (
                <Trophy className="absolute -top-1 -right-1 text-amber-500 size-4 drop-shadow-md" />
              )}
            </div>
            <span className="text-xs font-black text-center leading-tight h-8 flex items-center">
              {match.teamA.name}
            </span>
          </div>

          {/* SCORE CENTRAL o "VS" */}
          <div className="min-w-[80px] text-center">
            {isFinished ? (
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-2xl font-black italic ${winnerA ? "text-white" : "text-slate-600"}`}
                >
                  {match.scoreA ?? 0}
                </span>
                <span className="text-slate-800 font-black">-</span>
                <span
                  className={`text-2xl font-black italic ${winnerB ? "text-white" : "text-slate-600"}`}
                >
                  {match.scoreB ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-xl font-black text-slate-700 italic select-none">
                VS
              </div>
            )}
          </div>

          {/* Team B */}
          <div
            className={`flex flex-col items-center gap-3 flex-1 ${winnerA ? "opacity-40" : ""}`}
          >
            <div className="relative size-16 bg-brand-dark rounded-full border border-slate-700 flex items-center justify-center p-3 shadow-inner group-hover:border-lol-cyan/50 transition-colors">
              <Image
                src={match.teamB.logoUrl || "/placeholder-team.png"}
                alt={match.teamB.name}
                width={48}
                height={48}
                className="object-contain"
              />
              {winnerB && (
                <Trophy className="absolute -top-1 -right-1 text-amber-500 size-4 drop-shadow-md" />
              )}
            </div>
            <span className="text-xs font-black text-center leading-tight h-8 flex items-center">
              {match.teamB.name}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER: CONTROL DE ACCIÓN PRINCIPAL (Votos o Resultados) */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-800/50 mt-auto">
        {match.isVotingActive ? (
          // ESTADO 1: Votación Abierta (Permitir Votar o Editar)
          <Link href={`/matches/${match.id}`} className="block w-full">
            <button
              className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-lol-cyan hover:scale-[1.02] active:scale-[0.98] ${
                hasVoted
                  ? "bg-slate-950 text-lol-cyan shadow-lg shadow-cyan-950/50 hover:bg-slate-900"
                  : "bg-lol-cyan text-black shadow-lg shadow-cyan-900/40 hover:bg-white"
              }`}
            >
              {hasVoted ? (
                <>
                  <CheckCircle2 size={16} />
                  Editar Votos
                </>
              ) : (
                <>
                  Evaluar Partido
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </Link>
        ) : isFinished ? (
          // ESTADO 2: Votación Cerrada en Partido Terminado (Ver Calificaciones)
          <Link href={`/matches/${match.id}/results`} className="block w-full">
            <button className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
              <ClipboardCheck size={16} />
              Ver Resultados Finales
            </button>
          </Link>
        ) : (
          // ESTADO 3: Votación Cerrada en Partido no Terminado (Inactivo)
          <div className="text-center py-3 bg-slate-800/20 border border-slate-700/30 rounded-lg">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Votación no disponible
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
