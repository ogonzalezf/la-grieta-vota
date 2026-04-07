import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema/schema"; // Eliminados players y teams no usados
import { eq } from "drizzle-orm";
import { getMatchResults } from "../actions";
import Image from "next/image";
import { Star } from "lucide-react"; // Eliminados Trophy y Users no usados
import { notFound } from "next/navigation";

// 1. Definición de interfaces para tipado estricto
interface PlayerInfo {
  id: number;
  nickname: string;
  imageUrl: string | null;
  position: string | null; // Cambiado de string a string | null
  teamId: number | null; // Cambiado de number a number | null
}

interface ResultWithPlayer {
  playerId: number;
  averageScore: number;
  totalVotes: number;
  player: PlayerInfo | undefined;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchResultsPage({ params }: PageProps) {
  const { id } = await params;
  const matchId = Number(id);

  if (isNaN(matchId)) return notFound();

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
    with: { teamA: true, teamB: true },
  });

  if (!match || match.isVotingActive) return notFound();

  const results = await getMatchResults(matchId);
  const playersData = await db.query.players.findMany();

  // 1. Mapeo de datos con tipado explícito
  const resultsWithInfo: ResultWithPlayer[] = results.map((r) => ({
    ...r,
    player: playersData.find((p) => p.id === r.playerId) as
      | PlayerInfo
      | undefined,
  }));

  const mvp = [...resultsWithInfo].sort(
    (a, b) => b.averageScore - a.averageScore,
  )[0];

  const positionOrder: Record<string, number> = {
    TOP: 1,
    JUG: 2,
    MID: 3,
    ADC: 4,
    SUPP: 5,
  };

  // 2. Función de ordenado con tipos definidos
  const sortByPosition = (a: ResultWithPlayer, b: ResultWithPlayer) => {
    const orderA = positionOrder[a.player?.position?.toUpperCase() || ""] || 99;
    const orderB = positionOrder[b.player?.position?.toUpperCase() || ""] || 99;
    return orderA - orderB;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* SECCIÓN MVP */}
      {mvp && (
        <section className="glass-card p-0 bg-linear-to-r from-lol-cyan/20 to-transparent border-lol-cyan/30 flex flex-col md:flex-row items-stretch relative overflow-hidden min-h-[300px]">
          <div className="relative w-full md:w-72 h-72 md:h-auto bg-slate-950">
            <Image
              src={mvp.player?.imageUrl || "/placeholder.png"}
              alt={mvp.player?.nickname || "MVP"}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-lol-cyan font-black uppercase text-[10px] tracking-[0.3em] mb-4">
              <Star size={14} fill="currentColor" /> JUGADOR MEJOR VOTADO
            </div>
            <h1 className="text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
              {mvp.player?.nickname}
            </h1>
            <div className="flex items-center gap-8">
              <span className="text-7xl font-black text-lol-cyan italic">
                {mvp.averageScore}
              </span>
              <div className="h-12 w-px bg-slate-800" />
              <span className="text-3xl font-black text-white italic">
                {mvp.totalVotes}{" "}
                <span className="text-[10px] text-slate-500 uppercase not-italic block">
                  Votos
                </span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* RESULTADOS ORDENADOS POR POSICIÓN */}
      <div className="grid md:grid-cols-2 gap-12">
        {(
          [match.teamA, match.teamB].filter(Boolean) as NonNullable<
            typeof match.teamA
          >[]
        ).map((team) => (
          <div key={team.id} className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              {team.logoUrl && (
                <Image
                  src={team.logoUrl}
                  alt={team.name}
                  width={40}
                  height={40}
                />
              )}
              <h3 className="font-black uppercase text-white italic text-xl">
                {team.name}
              </h3>
            </div>

            <div className="space-y-4">
              {resultsWithInfo
                .filter((r) => r.player?.teamId === team.id)
                .sort(sortByPosition)
                .map((res) => (
                  <div
                    key={res.playerId}
                    className="flex items-center gap-4 p-2 pr-6 bg-slate-900/40 rounded-2xl border border-slate-800/50"
                  >
                    <div className="relative size-16 rounded-xl overflow-hidden bg-slate-800">
                      <Image
                        src={res.player?.imageUrl || "/placeholder.png"}
                        alt={res.player?.nickname || ""}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 64px, 64px"
                        loading="eager"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <p className="text-[10px] font-black text-lol-cyan uppercase">
                            {res.player?.position}
                          </p>
                          <p className="font-black text-white uppercase italic">
                            {res.player?.nickname}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black italic text-white leading-none">
                            {res.averageScore}
                          </p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">
                            {res.totalVotes} votos
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lol-cyan shadow-[0_0_10px_#0891b2]"
                          style={{ width: `${(res.averageScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
