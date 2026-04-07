import { db } from "@/lib/db";
import { matches, votes } from "@/lib/db/schema/schema";
import MatchCard from "@/components/MatchCard";
import { asc, eq, or, and, gte } from "drizzle-orm";
import { Trophy, CalendarDays, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getTopPlayers } from "./matches/[id]/actions";
import TopPlayers from "@/components/TopPlayers";

// 1. Definición de interfaces para tipado estricto
interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface HomeMatch {
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
  hasVoted?: boolean; // Propiedad calculada en el cliente
}

async function getHomeMatches(): Promise<HomeMatch[]> {
  const session = await auth();
  const userId = session?.user?.id;

  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setDate(fortyEightHoursAgo.getDate() - 2);

  // Tipamos la consulta de Drizzle
  const data = (await db.query.matches.findMany({
    where: or(
      eq(matches.status, "LIVE"),
      eq(matches.status, "UPCOMING"),
      and(eq(matches.status, "FINISHED"), eq(matches.isVotingActive, true)),
      and(
        eq(matches.status, "FINISHED"),
        eq(matches.isVotingActive, false),
        gte(matches.matchDate, fortyEightHoursAgo),
      ),
    ),
    with: {
      teamA: true,
      teamB: true,
    },
    orderBy: [asc(matches.matchDate)],
    limit: 10,
  })) as unknown as HomeMatch[];

  let votedMatchIds: number[] = [];
  if (userId) {
    const userVotes = await db
      .select({ matchId: votes.matchId })
      .from(votes)
      .where(eq(votes.userId, userId));

    votedMatchIds = Array.from(new Set(userVotes.map((v) => v.matchId)));
  }

  const matchesWithVoteStatus = data.map((m) => ({
    ...m,
    hasVoted: votedMatchIds.includes(m.id),
  }));

  return matchesWithVoteStatus.sort((a, b) => {
    const statusOrder = { LIVE: 1, FINISHED: 2, UPCOMING: 3 };
    return (
      (statusOrder[a.status as keyof typeof statusOrder] || 4) -
      (statusOrder[b.status as keyof typeof statusOrder] || 4)
    );
  });
}

export default async function Home() {
  const allMatches = await getHomeMatches();
  const topPlayers = (await getTopPlayers()) || [];

  const liveMatches = allMatches.filter((m) => m.status === "LIVE");
  const otherMatches = allMatches.filter((m) => m.status !== "LIVE");

  return (
    <div className="max-w-400 mx-auto space-y-12 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-cyan-900/20 to-transparent p-8 border border-cyan-500/10">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-black mb-5 leading-tight tracking-tight text-white uppercase italic">
            El Veredicto de <span className="text-lol-cyan">La Grieta</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg lg:text-xl max-w-5xl leading-relaxed">
            Puntúa el desempeño de los profesionales. Un sistema donde la voz de
            la comunidad y los expertos definen al mejor jugador de cada
            jornada.
          </p>
        </div>
        <Trophy className="absolute -right-12 -bottom-12 size-72 lg:size-96 text-lol-cyan/5 -rotate-12" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* SECCIÓN EN VIVO */}
          {liveMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white italic">
                  Live{" "}
                  <span className="text-slate-500 font-medium not-italic ml-2">
                    Sucediendo Ahora
                  </span>
                </h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {liveMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match} // Eliminado el 'as any'
                    hasVoted={match.hasVoted}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECCIÓN FEED / JORNADA */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-lol-cyan" size={20} />
                <h3 className="text-xl font-black uppercase tracking-widest text-white italic">
                  Feed{" "}
                  <span className="text-slate-500 font-medium not-italic ml-2">
                    Jornada Actual
                  </span>
                </h3>
              </div>
              <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-3 py-1 rounded-full uppercase tracking-tighter">
                {allMatches.length} Partidos
              </span>
            </div>

            {otherMatches.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {otherMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match} // Eliminado el 'as any'
                    hasVoted={match.hasVoted}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-3xl">
                <CalendarDays
                  className="mx-auto text-slate-800 mb-4"
                  size={48}
                />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  Sin actividad reciente en portada
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-8">
            <TopPlayers players={topPlayers} />
          </div>
        </aside>
      </div>
    </div>
  );
}
