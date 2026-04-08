import { notFound } from "next/navigation";
import Image from "next/image";
import { getPlayerDetailedProfile } from "@/app/actions";
import { Star, Calendar } from "lucide-react";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerDetailedProfile(parseInt(id));

  if (!player) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* HEADER: PERFIL DEL JUGADOR */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-8 md:p-12">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-lol-cyan/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          {/* Imagen Grande */}
          <div className="relative size-48 md:size-56 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900 shadow-2xl">
            <Image
              src={player.imageUrl || "/placeholder.png"}
              alt={player.nickname}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>

          {/* Información Principal */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="bg-lol-cyan/10 text-lol-cyan text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                  {player.position}
                </span>
                <span className="text-slate-500 font-bold text-sm uppercase tracking-tighter">
                  {player.team?.name || "Agente Libre"}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
                {player.nickname}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Rating Global
                </p>
                <p
                  className={`text-4xl font-black italic ${Number(player.globalAverage) < 5 ? "text-red-500" : "text-lol-cyan"}`}
                >
                  {player.globalAverage}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-800 hidden md:block" />
              <div className="relative size-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                {player.team?.logoUrl && (
                  <Image
                    src={player.team.logoUrl}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 300px"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LISTADO DE PARTIDOS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-lol-cyan" size={20} />
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">
            Desempeño en{" "}
            <span className="text-slate-500">
              {process.env.TOURNAMENT_ACTIVE}
            </span>
          </h2>
        </div>

        <div className="grid gap-4">
          {player.history.length > 0 ? (
            player.history.map((match: any) => (
              <div
                key={match.matchId}
                className="glass-card flex items-center justify-between p-5 border-slate-800/60 hover:border-lol-cyan/30 transition-all group"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-center min-w-20 md:min-w-32">
                    <p className="text-[10px] font-black text-slate-600 uppercase">
                      Resultado
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums">
                      {match.scoreA} - {match.scoreB}
                    </p>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">
                      Encuentro
                    </p>
                    <p className="text-sm font-black italic text-white uppercase truncate max-w-50">
                      {match.teamA}{" "}
                      <span className="text-lol-cyan mx-1">VS</span>{" "}
                      {match.teamB}
                    </p>
                  </div>
                </div>

                {/* PUNTUACIÓN DEL JUGADOR EN ESTE PARTIDO */}
                <div className="text-right flex items-center gap-4 bg-slate-900/50 py-2 px-6 rounded-2xl border border-slate-800">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                      Puntaje Partido
                    </p>
                    <p
                      className={`text-2xl font-black italic leading-none ${Number(match.playerScore) < 5 ? "text-red-500" : "text-lol-cyan"}`}
                    >
                      {Number(match.playerScore).toFixed(1)}
                    </p>
                  </div>
                  <Star
                    size={16}
                    className={
                      Number(match.playerScore) < 5
                        ? "text-red-500/50"
                        : "text-lol-cyan/50"
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                No se encontraron votos para este jugador
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
