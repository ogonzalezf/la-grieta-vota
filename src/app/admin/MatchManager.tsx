// src/app/admin/MatchManager.tsx
"use client";
import { useState, useMemo } from "react";
import {
  Edit3,
  Trash2,
  Power,
  PowerOff,
  Search,
  Trophy,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import MatchForm from "./MatchForm";
import { deleteMatch, toggleVoting } from "./actions";

interface Team {
  id: number;
  name: string;
}

interface MatchListItem {
  id: number;
  tournament: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  date: Date | string | null;
  scoreA: number;
  scoreB: number;
  teamAId: number;
  teamBId: number;
  teamAName: string;
  teamBName: string;
  isVotingActive: boolean;
}

interface MatchManagerProps {
  initialMatches: MatchListItem[];
  teams: Team[];
}

export default function MatchManager({
  initialMatches,
  teams,
}: MatchManagerProps) {
  const [editingMatch, setEditingMatch] = useState<MatchListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "LIVE" | "UPCOMING" | "FINISHED"
  >("ALL");

  // FILTRADO DINÁMICO: Por búsqueda y por pestaña
  const filteredMatches = useMemo(() => {
    return initialMatches.filter((m) => {
      const matchesSearch =
        m.teamAName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.teamBName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tournament?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = activeTab === "ALL" || m.status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [initialMatches, searchTerm, activeTab]);

  const handleEditClick = (match: MatchListItem) => {
    setEditingMatch(match);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* FORMULARIO: Actúa como sección destacada al editar o crear */}
      <MatchForm
        key={editingMatch?.id || "new"}
        teams={teams}
        editingMatch={editingMatch}
        onCancel={() => setEditingMatch(null)}
      />

      <div className="glass-card p-6 border-slate-800/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h3 className="text-lg font-black uppercase text-white italic tracking-tight">
              Listado de Encuentros
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Gestiona votos, edita o elimina partidos
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por equipo o torneo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-lol-cyan outline-none transition-all"
            />
          </div>
        </div>

        {/* PESTAÑAS DE ESTADO */}
        <div className="flex border-b border-slate-800/60 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex min-w-max">
            {" "}
            {/* min-w-max para evitar que se aplasten en móvil */}
            {[
              { id: "ALL", label: "Todos", icon: Trophy },
              { id: "LIVE", label: "En Vivo", icon: Power },
              { id: "UPCOMING", label: "Próximos", icon: Calendar },
              { id: "FINISHED", label: "Finalizados", icon: CheckCircle2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-lol-cyan text-lol-cyan bg-lol-cyan/5"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <tab.icon size={14} className="shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO CON SCROLL INTERNO */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl flex items-center justify-between group hover:border-lol-cyan/20 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[70px]">
                    <p
                      className={`text-[8px] font-black uppercase tracking-tighter ${
                        m.isVotingActive ? "text-lol-cyan" : "text-slate-600"
                      }`}
                    >
                      {m.isVotingActive ? "Votación ON" : "Votación OFF"}
                    </p>
                    <p className="text-sm font-black text-white italic">
                      {m.scoreA} - {m.scoreB}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      {m.tournament}
                      <span
                        className={`size-1.5 rounded-full ${
                          m.status === "LIVE"
                            ? "bg-red-500 animate-pulse"
                            : m.status === "FINISHED"
                              ? "bg-slate-700"
                              : "bg-lol-cyan"
                        }`}
                      />
                    </p>
                    <p className="text-sm font-black text-white italic uppercase tracking-tight">
                      {m.teamAName}{" "}
                      <span className="text-lol-cyan/40 not-italic mx-1 text-[10px]">
                        VS
                      </span>{" "}
                      {m.teamBName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () =>
                      await toggleVoting(m.id, m.isVotingActive)
                    }
                    className={`p-2 rounded-lg transition-all border ${
                      m.isVotingActive
                        ? "bg-lol-cyan/10 border-lol-cyan/20 text-lol-cyan hover:bg-lol-cyan/20"
                        : "bg-slate-900 border-slate-800 text-slate-600 hover:text-white"
                    }`}
                  >
                    {m.isVotingActive ? (
                      <Power size={14} />
                    ) : (
                      <PowerOff size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleEditClick(m)}
                    className="p-2 bg-slate-800/40 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("¿Borrar partido?")) deleteMatch(m.id);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 text-sm italic font-medium">
                No se encontraron encuentros que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
