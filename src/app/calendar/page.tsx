import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema/schema";
import { eq, asc, and } from "drizzle-orm";
import CalendarFilters from "./CalendarFilters";
import MatchCard from "@/components/MatchCard";
import { auth } from "@/auth";

// 1. Definición de interfaces para el tipado estricto
interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface CalendarMatch {
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

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  await auth();

  // 1. Unwrapping de searchParams para Next.js 15+
  const { tournament } = await searchParams;

  // 2. Obtener torneos únicos para el filtro
  const allUpcomingData = await db
    .select({ tournament: matches.tournamentName })
    .from(matches)
    .where(eq(matches.status, "UPCOMING"));

  const uniqueTournaments = Array.from(
    new Set(allUpcomingData.map((m) => m.tournament).filter(Boolean)),
  ) as string[];

  // 3. Consulta de partidos: FILTRADO POR ESTADO "UPCOMING"
  // Tipamos el resultado como un array de CalendarMatch
  const data: CalendarMatch[] = (await db.query.matches.findMany({
    where: tournament
      ? and(
          eq(matches.status, "UPCOMING"),
          eq(matches.tournamentName, tournament),
        )
      : eq(matches.status, "UPCOMING"),
    with: {
      teamA: true,
      teamB: true,
    },
    orderBy: [asc(matches.matchDate)],
  })) as unknown as CalendarMatch[];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Calendario de <span className="text-lol-cyan">Competición</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mt-1">
            Próximos enfrentamientos programados
          </p>
        </div>

        <CalendarFilters 
          tournaments={uniqueTournaments} 
          baseUrl="/calendar" 
        />
      </header>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((match) => (
            <MatchCard
              key={match.id}
              match={match} // Eliminado el 'as any'
              hasVoted={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/10 rounded-3xl border border-slate-800/40 shadow-inner">
          <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4 border border-slate-800">
            <span className="text-lol-cyan animate-pulse">●</span>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
            {tournament
              ? `No hay nuevos partidos programados para ${tournament}`
              : "No hay partidos pendientes en el calendario"}
          </p>
        </div>
      )}
    </main>
  );
}
