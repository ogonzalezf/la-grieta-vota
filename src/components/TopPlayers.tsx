import Image from "next/image";
import { Star, TrendingUp } from "lucide-react";

interface TopPlayerItem {
  playerId: number;
  playerName: string;
  playerImage: string | null;
  playerPosition: string | null;
  teamName: string;
  teamLogo: string | null;
  globalAverage: number;
  isActive?: boolean | null;
}

interface TopPlayersProps {
  players: TopPlayerItem[];
  hideHeader?: boolean; // Nueva prop para ocultar el título
  hideRank?: boolean;
}

export default function TopPlayers({
  players,
  hideHeader = false,
  hideRank = false,
}: TopPlayersProps) {
  return (
    <section className="space-y-6">
      {!hideHeader && (
        <div className="flex items-center gap-3">
          <Star className="text-lol-cyan fill-lol-cyan/20" size={20} />
          <h3 className="text-xl font-black uppercase tracking-widest text-white italic">
            TOP 5{" "}
            <span className="text-slate-500 font-medium not-italic ml-2">
              Mejores Valorados
            </span>
          </h3>
        </div>
      )}

      <div className="grid gap-3">
        {players.map((player, index) => {
          // MODIFICACIÓN: Definimos la clase de color dinámicamente
          const isInactive = !player.isActive; // Detectamos si es de la banca
          const isLowScore = player.globalAverage < 5;
          const scoreColorClass = isLowScore ? "text-red-500" : "text-lol-cyan";

          return (
            <div
              key={player.playerId}
              className={`glass-card group flex items-center gap-3 p-3 pr-4 border-slate-800/50 transition-all relative overflow-hidden ${
                isInactive ? "opacity-60 grayscale-[0.5]" : "" // Estilo banca
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isInactive
                    ? "bg-slate-700"
                    : "bg-lol-cyan/20 group-hover:bg-lol-cyan"
                }`}
              />

              {!hideRank && (
                <span className="text-xl font-black italic text-slate-800 ml-1 w-5 shrink-0">
                  {index + 1}
                </span>
              )}
              <div className="relative size-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <Image
                  src={player.playerImage || "/placeholder.png"}
                  alt={player.playerName}
                  fill
                  className="object-cover object-top"
                  sizes="44px"
                />
              </div>

              {/* Contenedor central corregido para que el nombre no se corte */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black bg-slate-800 text-lol-cyan px-1.5 py-0.5 rounded uppercase shrink-0">
                    {player.playerPosition}
                  </span>
                  {/* Eliminamos el max-w-[120px] que limitaba el ancho */}
                  <p className="font-black text-white uppercase italic text-sm md:text-base truncate tracking-tight leading-tight w-full">
                    {player.playerName}
                    {isInactive && (
                      <span className="text-[9px] not-italic ml-2 text-slate-500 font-bold">
                        (Banca o Exjugador)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1 overflow-hidden">
                  <div className="relative size-3.5 shrink-0">
                    <Image
                      src={player.teamLogo || "/placeholder.png"}
                      alt={player.teamName}
                      fill
                      className="object-contain opacity-60"
                      sizes="14px"
                    />
                  </div>
                  {/* CAMBIO: Añadido truncate al nombre del equipo */}
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">
                    {player.teamName}
                  </p>
                </div>
              </div>

              {/* Sección de puntuación con color dinámico */}
              <div className="text-right shrink-0 ml-1">
                <div
                  className={`flex items-center gap-0.5 justify-end ${scoreColorClass}`}
                >
                  <TrendingUp size={11} className="shrink-0" />
                  <span className="text-lg font-black italic leading-none">
                    {player.globalAverage.toFixed(1)}
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-600 uppercase mt-0.5 tracking-tighter">
                  Puntaje
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
