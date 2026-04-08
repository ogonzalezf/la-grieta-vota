"use client";
import { useState, useEffect } from "react";
import { Search, User, Users, X } from "lucide-react";
import { searchGlobal } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";

interface SearchedPlayer {
  id: number;
  nickname: string;
  image: string | null;
  teamName: string | null;
}

interface SearchedTeam {
  id: number;
  name: string;
  logo: string | null;
}

interface SearchResults {
  players: SearchedPlayer[];
  teams: SearchedTeam[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");

  // Aplicamos la interfaz al estado inicial
  const [results, setResults] = useState<SearchResults>({
    players: [],
    teams: [],
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);

        // Ahora 'data' es garantizadamente de tipo SearchResults
        const data = await searchGlobal(query);

        setResults(data);
        setIsOpen(true);
        setIsSearching(false);
      } else {
        setResults({ players: [], teams: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative group">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            isSearching ? "text-lol-cyan animate-pulse" : "text-slate-500"
          }`}
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por jugador o equipo..."
          className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-10 text-sm text-white focus:border-lol-cyan focus:bg-slate-900 outline-none transition-all placeholder:text-slate-600 shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Menú de Resultados */}
      {isOpen && (results.players.length > 0 || results.teams.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-100 overflow-hidden backdrop-blur-xl">
          {/* Mapeo de Jugadores con interfaz SearchedPlayer */}
          {results.players.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 py-2 tracking-[0.2em] flex items-center gap-2">
                <User size={12} className="text-lol-cyan" /> Jugadores
              </p>
              {results.players.map((player: SearchedPlayer) => (
                <Link
                  key={player.id}
                  href={`/player/${player.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
                >
                  <div className="relative size-9 rounded-full overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <Image
                      src={player.image || "/placeholder.png"}
                      alt={player.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white italic uppercase group-hover:text-lol-cyan transition-colors">
                      {player.nickname}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {player.teamName || "Sin Equipo"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mapeo de Equipos con interfaz SearchedTeam */}
          {results.teams.length > 0 && (
            <div className="p-2 border-t border-slate-900/50">
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 py-2 tracking-[0.2em] flex items-center gap-2">
                <Users size={12} className="text-lol-cyan" /> Equipos
              </p>
              {results.teams.map((team: SearchedTeam) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
                >
                  <div className="relative size-9 shrink-0">
                    <Image
                      src={team.logo || "/placeholder.png"}
                      alt={team.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="text-sm font-black text-white uppercase italic group-hover:text-lol-cyan transition-colors">
                    {team.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
