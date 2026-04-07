import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema/schema";
import { eq, desc, and } from "drizzle-orm";
import CalendarFilters from "../calendar/CalendarFilters";
import MatchCard from "@/components/MatchCard";

// 1. Definición de interfaces para tipado estricto
interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface HistoryMatch {
  id: number;
  tournamentName: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  matchDate: Date;
  teamAId: number;
  teamBId: number;
  scoreA: number;
  scoreB: number;
  isVotingActive: boolean;
  teamA: Team;
  teamB: Team;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const { tournament } = await searchParams;

  // 1. Obtener torneos que tengan partidos terminados y cerrados
  const finishedMatchesData = await db
    .select({ tournament: matches.tournamentName })
    .from(matches)
    .where(
      and(eq(matches.status, "FINISHED"), eq(matches.isVotingActive, false)),
    );

  const uniqueTournaments = Array.from(
    new Set(finishedMatchesData.map((m) => m.tournament).filter(Boolean)),
  ) as string[];

  // 2. Consulta de los partidos para el historial con tipado explícito
  const data: HistoryMatch[] = (await db.query.matches.findMany({
    where: tournament
      ? and(
          eq(matches.status, "FINISHED"),
          eq(matches.isVotingActive, false),
          eq(matches.tournamentName, tournament),
        )
      : and(eq(matches.status, "FINISHED"), eq(matches.isVotingActive, false)),
    with: {
      teamA: true,
      teamB: true,
    },
    orderBy: [desc(matches.matchDate)],
  })) as unknown as HistoryMatch[];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Archivo de <span className="text-lol-cyan">Resultados</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mt-1">
            Votaciones finalizadas y promedios oficiales
          </p>
        </div>

        <CalendarFilters tournaments={uniqueTournaments} baseUrl="/history" />
      </header>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((match) => (
            <MatchCard
              key={match.id}
              match={match} // Eliminado el 'as any'
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/10 rounded-3xl border border-slate-800/40">
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
            {tournament
              ? `No hay historial disponible para ${tournament}`
              : "El historial de votaciones está vacío"}
          </p>
        </div>
      )}
    </main>
  );
}
