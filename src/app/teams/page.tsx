// src/app/teams/page.tsx
import { getTeamsWithStats } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { Users, ChevronRight, Trophy } from "lucide-react";

export default async function TeamsPage() {
  const teams = await getTeamsWithStats();

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-lol-cyan" size={24} />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Clubes{" "}
            <span className="text-slate-500 not-italic font-medium">
              de la Liga
            </span>
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl text-sm font-medium">
          Rendimiento oficial en el torneo{" "}
          <span className="text-lol-cyan">{process.env.TOURNAMENT_ACTIVE}</span>
          .
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="glass-card group overflow-hidden border-slate-800/50 hover:border-lol-cyan/30 transition-all flex flex-col"
          >
            {/* Parte Superior: Identidad */}
            <div className="p-6 flex items-center gap-5 bg-gradient-to-br from-slate-900/50 to-transparent">
              <div className="relative size-20 shrink-0">
                <Image
                  src={team.logoUrl || "/placeholder-team.png"}
                  alt={team.name}
                  fill
                  sizes="48px"
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black uppercase italic text-white truncate leading-tight">
                  {team.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <Users size={12} className="text-lol-cyan" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {team.players.length} Integrantes
                  </span>
                </div>
              </div>
            </div>

            {/* Parte Central: Resumen de Stats */}
            <div className="px-6 py-4 grid grid-cols-3 gap-2 bg-slate-950/30 border-y border-slate-800/50">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase">
                  Jugados
                </p>
                <p className="text-lg font-black text-white">
                  {team.stats.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-emerald-500 uppercase">
                  Ganados
                </p>
                <p className="text-lg font-black text-emerald-400">
                  {team.stats.won}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-red-500 uppercase">
                  Perdidos
                </p>
                <p className="text-lg font-black text-red-400">
                  {team.stats.lost}
                </p>
              </div>
            </div>

            {/* Botón de Acción */}
            <Link
              href={`/teams/${team.id}`}
              className="p-4 flex justify-between items-center bg-slate-900/40 hover:bg-lol-cyan/10 transition-colors group/link"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/link:text-lol-cyan transition-colors">
                Ver detalles del club
              </span>
              <ChevronRight
                size={16}
                className="text-slate-600 group-hover/link:text-lol-cyan"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
