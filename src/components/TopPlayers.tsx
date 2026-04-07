import Image from "next/image";
import { Star, TrendingUp } from "lucide-react";

// 1. Definición de la interfaz para eliminar el error de 'any'
interface TopPlayerItem {
  playerId: number;
  playerName: string;
  playerImage: string | null;
  playerPosition: string | null; // <-- Aquí el cambio clave
  teamName: string;
  teamLogo: string | null;
  globalAverage: number;
}

interface TopPlayersProps {
  players: TopPlayerItem[];
}

export default function TopPlayers({ players }: TopPlayersProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="text-lol-cyan fill-lol-cyan/20" size={20} />
        <h3 className="text-xl font-black uppercase tracking-widest text-white italic">
          TOP 5{" "}
          <span className="text-slate-500 font-medium not-italic ml-2">
            Mejores Valorados
          </span>
        </h3>
      </div>

      <div className="grid gap-4">
        {players.map((player, index) => (
          <div
            key={player.playerId}
            className="glass-card group flex items-center gap-4 p-3 pr-6 border-slate-800/50 hover:border-lol-cyan/30 transition-all relative overflow-hidden"
          >
            {/* Número de Ranking */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-lol-cyan/20 group-hover:bg-lol-cyan transition-colors" />
            <span className="text-2xl font-black italic text-slate-800 ml-2 w-6">
              {index + 1}
            </span>

            {/* Foto Jugador */}
            <div className="relative size-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
              <Image
                src={player.playerImage || "/placeholder.png"}
                alt={player.playerName}
                fill
                className="object-cover object-top"
                sizes="48px"
                loading="eager"
              />
            </div>

            {/* Info Jugador */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-slate-800 text-lol-cyan px-1.5 py-0.5 rounded uppercase">
                  {player.playerPosition}
                </span>
                <p className="font-black text-white uppercase italic truncate text-sm">
                  {player.playerName}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative size-4">
                  <Image
                    src={player.teamLogo || "/placeholder.png"} // Fallback añadido para seguridad
                    alt={player.teamName}
                    fill
                    className="object-contain opacity-60"
                    sizes="16px"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {player.teamName}
                </p>
              </div>
            </div>

            {/* Puntuación */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-lol-cyan">
                <TrendingUp size={12} />
                <span className="text-xl font-black italic leading-none">
                  {player.globalAverage}
                </span>
              </div>
              <p className="text-[8px] font-black text-slate-600 uppercase mt-1 tracking-tighter">
                Puntaje Global
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
