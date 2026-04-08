import { db } from "@/lib/db";
import { teams, matches } from "@/lib/db/schema/schema";
import { eq, and, or, desc } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import TopPlayers from "@/components/TopPlayers";
import MatchCard from "@/components/MatchCard";
import type { Match } from "@/components/MatchCard";
import { Users, Target, Activity, BarChart3 } from "lucide-react";
import { getTeamRoster } from "@/app/actions";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

async function getTeamStats(
  teamId: number,
): Promise<{ matches: Match[]; stats: any }> {
  const activeTournament = process.env.TOURNAMENT_ACTIVE || "LEC Summer 2024";

  // 1. Consulta simplificada: Solo partidos del equipo en el torneo activo
  const teamMatchesData = await db.query.matches.findMany({
    where: (m, { and, eq, or }) =>
      and(
        eq(m.tournamentName, activeTournament),
        eq(m.status, "FINISHED"),
        or(eq(m.teamAId, teamId), eq(m.teamBId, teamId)),
      ),
    with: {
      teamA: true,
      teamB: true,
    },
    orderBy: (m, { desc }) => [desc(m.matchDate)],
  });

  let won = 0;
  let lost = 0;

  // 2. Mapeo y cálculo de W/L sin lógica de posiciones globales
  const formattedMatches: Match[] = teamMatchesData.map((m) => {
    const idA = Number(m.teamAId);
    const isTeamA = idA === teamId;

    const scoreSelf = isTeamA ? (m.scoreA ?? 0) : (m.scoreB ?? 0);
    const scoreOpponent = isTeamA ? (m.scoreB ?? 0) : (m.scoreA ?? 0);

    if (scoreSelf > scoreOpponent) won++;
    else if (scoreSelf < scoreOpponent) lost++;

    return {
      id: m.id,
      status: m.status as "UPCOMING" | "LIVE" | "FINISHED",
      matchDate: m.matchDate,
      tournamentName: m.tournamentName,
      teamA: { name: m.teamA.name, logoUrl: m.teamA.logoUrl },
      teamB: { name: m.teamB.name, logoUrl: m.teamB.logoUrl },
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      isVotingActive: m.isVotingActive,
    };
  });

  return {
    matches: formattedMatches,
    stats: { total: formattedMatches.length, won, lost },
  };
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId)) return notFound();

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) return notFound();

  const rosterPlayers = await getTeamRoster(teamId);
  const { matches: history, stats } = await getTeamStats(teamId);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* HEADER DINÁMICO */}
      <div className="relative h-60 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
        <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
          {team.logoUrl && (
            <Image
              src={team.logoUrl}
              alt=""
              loading="eager"
              fill
              className="object-contain scale-150 translate-x-1/4"
              sizes="(max-width: 1280px) 100vw, 50vw"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        <div className="relative h-full flex items-center gap-8 px-10">
          <div className="relative size-32 shrink-0 drop-shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <Image
              src={team.logoUrl || "/placeholder-team.png"}
              alt={team.name}
              fill
              loading="eager"
              className="object-contain"
              sizes="128px"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase italic text-white tracking-tighter">
              {team.name}
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-lol-cyan" />{" "}
              {process.env.TOURNAMENT_ACTIVE || "LEC Summer 2024"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* COLUMNA IZQUIERDA: ROSTER */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <Users className="text-lol-cyan" size={20} />
            <h2 className="text-xl font-black uppercase italic text-white">
              Integrantes
            </h2>
          </div>
          <TopPlayers players={rosterPlayers} hideHeader hideRank />
        </div>

        {/* COLUMNA DERECHA: STATS E HISTORIAL */}
        <div className="lg:col-span-8 space-y-12">
          {/* SECCIÓN 1: ESTADÍSTICAS (Ahora ocupando todo el ancho) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-lol-cyan" size={20} />
              <h2 className="text-xl font-black uppercase italic text-white">
                Rendimiento de Temporada
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                  Jugados
                </p>
                <p className="text-3xl font-black text-white">{stats.total}</p>
              </div>

              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">
                  Victorias
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  {stats.won}
                </p>
              </div>

              <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">
                  Derrotas
                </p>
                <p className="text-3xl font-black text-red-400">{stats.lost}</p>
              </div>

              <div className="bg-lol-cyan/5 p-6 rounded-2xl border border-lol-cyan/20 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-lol-cyan uppercase mb-2 tracking-widest">
                  Win Rate
                </p>
                <p className="text-3xl font-black text-white">
                  {stats.total > 0
                    ? ((stats.won / stats.total) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: HISTORIAL */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="text-lol-cyan" size={20} />
              <h2 className="text-xl font-black uppercase italic text-white">
                Historial de Encuentros
              </h2>
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="p-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">
                  No hay partidos registrados
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
