import { db } from "@/lib/db";
import { matches, teams, players } from "@/lib/db/schema/schema";
import { eq, aliasedTable } from "drizzle-orm";
import VotingForm from "./VotingForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchVotingPage({ params }: PageProps) {
  // 1. Desenvolvemos los parámetros de la ruta (Next.js 15+)
  const resolvedParams = await params;
  const matchId = parseInt(resolvedParams.id);

  // 2. Definimos alias para la tabla equipos para diferenciar Azul de Rojo
  const teamA = aliasedTable(teams, "teamA");
  const teamB = aliasedTable(teams, "teamB");

  // 3. Consulta del partido con sus respectivos equipos
  const matchInfo = await db
    .select({
      id: matches.id,
      tournamentName: matches.tournamentName,
      teamAId: matches.teamAId,
      teamBId: matches.teamBId,
      teamAName: teamA.name,
      teamBName: teamB.name,
      isVotingActive: matches.isVotingActive,
    })
    .from(matches)
    .innerJoin(teamA, eq(matches.teamAId, teamA.id))
    .innerJoin(teamB, eq(matches.teamBId, teamB.id))
    .where(eq(matches.id, matchId))
    .limit(1);

  const matchData = matchInfo[0];

  // Si no existe el partido, mostramos un estado de error limpio
  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-black uppercase italic text-slate-700">
          Partido no encontrado
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
          Verifica el ID en el panel de administración
        </p>
      </div>
    );
  }

  // 4. Consulta de jugadores con validación de tipo para Drizzle
  // Usamos el ID como número garantizado mediante la validación previa
  const playersA = matchData.teamAId
    ? await db
        .select()
        .from(players)
        .where(eq(players.teamId, matchData.teamAId as number))
    : [];
  
  

  const playersB = matchData.teamBId
    ? await db
        .select()
        .from(players)
        .where(eq(players.teamId, matchData.teamBId as number))
    : [];
  
 

  // Los roles deben coincidir exactamente con los del SEED (Mayúsculas)
  const roles = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12 animate-in fade-in duration-700">
      {/* HEADER VISUAL DEL ENFRENTAMIENTO */}
      <header className="text-center space-y-8 mb-12">
        <div className="inline-block px-4 py-1 bg-lol-cyan/5 border border-lol-cyan/20 rounded-full">
          <h2 className="text-lol-cyan font-black tracking-[0.5em] uppercase text-[9px] italic">
            Sistema de Evaluación Profesional
          </h2>
        </div>

        {/* Grid de alineación para el header */}
        <div className="grid grid-cols-12 gap-2 items-center max-w-5xl mx-auto">
          <div className="col-span-5 text-right">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              {matchData.teamAName}
            </h1>
          </div>

          {/* Columna Central de la línea (Exactamente igual a la del Form) */}
          <div className="col-span-2 flex flex-col items-center">
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-700 to-slate-800"></div>
            <span className="text-xs font-black text-slate-500 italic my-2">
              VS
            </span>
            <div className="h-6 w-px bg-slate-800"></div>
          </div>

          <div className="col-span-5 text-left">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              {matchData.teamBName}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">
          {matchData.tournamentName}
        </p>
      </header>

      {/* FORMULARIO DE VOTACIÓN (Componente de Cliente) */}
      <div className="relative">
        <VotingForm
          isVotingActive={matchData.isVotingActive}
          matchId={matchId}
          teamA={{
            name: matchData.teamAName,
            players: playersA as any[],
          }}
          teamB={{
            name: matchData.teamBName,
            players: playersB as any[],
          }}
          roles={roles}
        />
      </div>

      {/* NOTA DE PIE DE PÁGINA */}
      <footer className="pt-10 border-t border-slate-800/40 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
          Tu voto como experto tiene un peso ponderado en el ranking global
        </p>
      </footer>
    </div>
  );
}
