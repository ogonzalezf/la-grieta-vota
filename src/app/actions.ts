"use server";

import { db } from "@/lib/db";
import { players, teams, votes, matches } from "@/lib/db/schema/schema";
import { eq, ilike, asc, sql, or, desc, and } from "drizzle-orm";

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
/**
 * BÚSQUEDA DE JUGADORES Y EQUIPOS
 * Esta función permite al usuario buscar por nombre de jugador o equipo.
 */
export async function searchGlobal(query: string): Promise<SearchResults> {
  // Siempre inicializamos con la estructura correcta
  const fallback: SearchResults = { players: [], teams: [] };

  if (!query || query.length < 2) return fallback;

  try {
    const foundPlayers = await db
      .select({
        id: players.id,
        nickname: players.nickname, // Asegúrate que el nombre coincida con SearchedPlayer
        image: players.imageUrl,
        teamName: teams.name,
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .where(ilike(players.nickname, `%${query}%`))
      .limit(5);

    const foundTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        logo: teams.logoUrl,
      })
      .from(teams)
      .where(ilike(teams.name, `%${query}%`))
      .limit(3);

    return {
      players: foundPlayers as SearchedPlayer[],
      teams: foundTeams as SearchedTeam[],
    };
  } catch (error) {
    console.error("Search error:", error);
    return fallback; // En caso de error, devolvemos arrays vacíos en lugar de un string
  }
}
/**
 * OBTENER ESTADÍSTICAS DE UN JUGADOR ESPECÍFICO
 * Para mostrar el historial de votos que mencionabas.
 */
export async function getPlayerStats(playerId: number) {
  try {
    const stats = await db
      .select({
        matchId: matches.id,
        tournament: matches.tournamentName,
        score: votes.score,
        date: matches.matchDate,
      })
      .from(votes)
      .innerJoin(matches, eq(votes.matchId, matches.id))
      .where(eq(votes.playerId, playerId))
      .orderBy(matches.matchDate);

    return stats;
  } catch (error) {
    console.error("Error en getPlayerStats:", error);
    return [];
  }
}

export async function getTeamsWithStats() {
  const activeTournament = process.env.TOURNAMENT_ACTIVE || "LEC SPRING 2026";

  try {
    const teamsData = await db.query.teams.findMany({
      with: {
        players: true,
      },
      orderBy: [asc(teams.name)],
    });

    // Obtenemos todos los partidos terminados del torneo actual
    const allMatches = await db.query.matches.findMany({
      where: and(
        eq(matches.tournamentName, activeTournament),
        eq(matches.status, "FINISHED"),
      ),
    });

    // Mapeamos los equipos para añadirles su récord de W/L
    return teamsData.map((team) => {
      let won = 0;
      let lost = 0;

      allMatches.forEach((m) => {
        const isTeamA = m.teamAId === team.id;
        const isTeamB = m.teamBId === team.id;

        if (isTeamA || isTeamB) {
          const scoreSelf = isTeamA ? (m.scoreA ?? 0) : (m.scoreB ?? 0);
          const scoreOpponent = isTeamA ? (m.scoreB ?? 0) : (m.scoreA ?? 0);

          if (scoreSelf > scoreOpponent) won++;
          else if (scoreSelf < scoreOpponent) lost++;
        }
      });

      return {
        ...team,
        stats: {
          won,
          lost,
          total: won + lost,
        },
      };
    });
  } catch (error) {
    console.error("Error al obtener equipos con stats:", error);
    return [];
  }
}

export async function getTeamRoster(teamId: number) {
  try {
    const roster = await db
      .select({
        playerId: players.id,
        playerName: players.nickname,
        playerImage: players.imageUrl,
        playerPosition: players.position,
        isActive: players.isActive,
        teamName: teams.name,
        teamLogo: teams.logoUrl,
        teamId: players.teamId,
        globalAverage: sql<number>`
  COALESCE(
    SUM(CAST(${votes.score} AS DECIMAL) * CAST(${votes.appliedWeight} AS DECIMAL)) / 
    NULLIF(SUM(CAST(${votes.appliedWeight} AS DECIMAL)), 0), 
    0
  )`,
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .leftJoin(votes, eq(players.id, votes.playerId))
      .where(eq(players.teamId, teamId))
      .groupBy(players.id, teams.name, teams.logoUrl);

    const positionOrder: Record<string, number> = {
      TOP: 0,
      JUNGLE: 1,
      MID: 2,
      ADC: 3,
      SUPPORT: 4,
      SUP: 4,
    };

    return roster
      .map((p) => ({
        ...p,
        // CORRECCIÓN: Aseguramos que teamName no sea null para cumplir con la interfaz
        teamName: p.teamName ?? "Equipo Desconocido",
        teamId: p.teamId ?? 0,
        globalAverage: Number(p.globalAverage),
        isActive: p.isActive ?? true,
      }))
      .sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

        const orderA =
          positionOrder[a.playerPosition?.toUpperCase() || ""] ?? 99;
        const orderB =
          positionOrder[b.playerPosition?.toUpperCase() || ""] ?? 99;
        return orderA - orderB;
      });
  } catch (error) {
    console.error("Error al obtener el roster ordenado:", error);
    return [];
  }
}

export async function getTeamDetailedStats(teamId: number) {
  const activeTournament = process.env.TOURNAMENT_ACTIVE || "League of Legends";

  // Obtenemos todos los partidos terminados del torneo activo para este equipo
  const teamMatches = await db.query.matches.findMany({
    where: and(
      eq(matches.tournamentName, activeTournament),
      eq(matches.status, "FINISHED"),
      or(eq(matches.teamAId, teamId), eq(matches.teamBId, teamId)),
    ),
    with: { teamA: true, teamB: true },
    orderBy: [desc(matches.matchDate)],
  });

  // Calculamos Ganados y Perdidos
  let won = 0;
  let lost = 0;

  teamMatches.forEach((m) => {
    const isTeamA = m.teamAId === teamId;
    const scoreSelf = isTeamA ? (m.scoreA ?? 0) : (m.scoreB ?? 0);
    const scoreOpponent = isTeamA ? (m.scoreB ?? 0) : (m.scoreA ?? 0);

    if (scoreSelf > scoreOpponent) won++;
    else if (scoreSelf < scoreOpponent) lost++;
  });

  return {
    matches: teamMatches,
    stats: {
      total: teamMatches.length,
      won,
      lost,
    },
  };
}
// src/app/actions.ts

export async function getPlayerDetailedProfile(playerId: number) {
  const activeTournament = process.env.TOURNAMENT_ACTIVE || "LEC Summer 2024";

  try {
    // 1. Datos básicos del jugador (Se mantiene igual)
    const playerData = await db
      .select({
        id: players.id,
        nickname: players.nickname,
        imageUrl: players.imageUrl,
        position: players.position,
        teamName: teams.name,
        teamLogo: teams.logoUrl,
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .where(eq(players.id, playerId))
      .limit(1);

    if (!playerData.length) return null;
    const playerInfo = playerData[0];

    // 2. Historial de partidos con PROMEDIO por partido
    const history = await db
      .select({
        matchId: matches.id,
        matchDate: matches.matchDate,
        tournament: matches.tournamentName,
        // CAMBIO: Promedio ponderado por partido
        playerScore: sql<number>`
      SUM(CAST(${votes.score} AS DECIMAL) * CAST(${votes.appliedWeight} AS DECIMAL)) / 
      SUM(CAST(${votes.appliedWeight} AS DECIMAL))
    `,
        scoreA: matches.scoreA,
        scoreB: matches.scoreB,
        teamAName: sql<string>`(SELECT name FROM teams WHERE id = ${matches.teamAId})`,
        teamBName: sql<string>`(SELECT name FROM teams WHERE id = ${matches.teamBId})`,
      })
      .from(votes)
      .innerJoin(matches, eq(votes.matchId, matches.id))
      .where(
        and(
          eq(votes.playerId, playerId),
          eq(matches.tournamentName, activeTournament),
        ),
      )
      .groupBy(matches.id)
      .orderBy(desc(matches.matchDate));

    // 3. Promedio global de toda la temporada PONDERADO
    const avgResult = await db
      .select({
        weightedAvg: sql<number>`
      SUM(CAST(${votes.score} AS DECIMAL) * CAST(${votes.appliedWeight} AS DECIMAL)) / 
      SUM(CAST(${votes.appliedWeight} AS DECIMAL))
    `,
      })
      .from(votes)
      .where(eq(votes.playerId, playerId));

    return {
      ...playerInfo,
      team: { name: playerInfo.teamName, logoUrl: playerInfo.teamLogo },
      history: history.map((h) => ({
        ...h,
        playerScore: Number(h.playerScore).toFixed(1),
        teamA: h.teamAName,
        teamB: h.teamBName,
      })),
      // USAMOS weightedAvg aquí
      globalAverage: Number(avgResult[0]?.weightedAvg || 0).toFixed(1),
    };
  } catch (error) {
    console.error("Error al obtener perfil de jugador:", error);
    return null;
  }
}