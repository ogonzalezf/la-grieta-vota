"use server";

import { db } from "@/lib/db";
import {
  votes,
  users,
  roles,
  players,
  teams,
  matches,
} from "@/lib/db/schema/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and, count, sql } from "drizzle-orm";

// 1. Interfaces para eliminar el uso de 'any'
interface VoteMap {
  [playerId: number]: number;
}

interface PlayerVoteInput {
  playerId: number;
  score: number;
}

export async function getExistingVotes(
  matchId: number,
  fingerprint: string,
): Promise<VoteMap> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const userCondition = userId
      ? eq(votes.userId, userId)
      : eq(votes.fingerprint, fingerprint);

    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.matchId, matchId), userCondition));

    if (!existing || !Array.isArray(existing)) {
      return {};
    }

    // Tipamos el acumulador del reduce
    return existing.reduce((acc: VoteMap, vote) => {
      const scoreValue = vote.score ? parseFloat(vote.score.toString()) : 0;
      acc[vote.playerId] = scoreValue;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error en getExistingVotes:", error);
    return {};
  }
}

export async function submitVotes(
  matchId: number,
  playerVotes: PlayerVoteInput[], // Tipado de la entrada
  fingerprint: string,
) {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const matchStatus = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      columns: { isVotingActive: true },
    });

    if (!matchStatus?.isVotingActive) {
      return { error: "La votación para este encuentro ya ha finalizado." };
    }

    let appliedWeight = "0.50";
    if (userId) {
      const userRole = await db
        .select({ weight: roles.weight })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.id, userId))
        .limit(1);
      if (userRole[0]) appliedWeight = userRole[0].weight;
    }

    for (const v of playerVotes) {
      await db
        .insert(votes)
        .values({
          matchId,
          playerId: v.playerId,
          userId: userId || null,
          fingerprint: userId ? null : fingerprint,
          score: v.score.toFixed(2),
          appliedWeight,
        })
        .onConflictDoUpdate({
          target: userId
            ? [votes.userId, votes.playerId, votes.matchId]
            : [votes.fingerprint, votes.playerId, votes.matchId],
          set: {
            score: v.score.toFixed(2),
            appliedWeight,
          },
        });
    }

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al sincronizar votos." };
  }
}

/**
 * Obtiene los promedios ponderados de cada jugador para un partido.
 */
export async function getMatchResults(matchId: number) {
  const results = await db
    .select({
      playerId: votes.playerId,
      averageScore: sql<number>`
        CAST(
          SUM(CAST(${votes.score} AS DECIMAL) * CAST(${votes.appliedWeight} AS DECIMAL)) 
          / SUM(CAST(${votes.appliedWeight} AS DECIMAL)) 
          AS DECIMAL(10,2)
        )`.mapWith(Number),
      totalVotes: count(votes.id),
    })
    .from(votes)
    .where(eq(votes.matchId, matchId))
    .groupBy(votes.playerId);

  return results;
}

export async function getTopPlayers() {
  try {
    const globalAverageExpr = sql<number>`
      CAST(
        SUM(CAST(${votes.score} AS DECIMAL) * CAST(${votes.appliedWeight} AS DECIMAL)) 
        / SUM(CAST(${votes.appliedWeight} AS DECIMAL)) 
        AS DECIMAL(10,2)
      )`.mapWith(Number);

    const topPlayers = await db
      .select({
        playerId: votes.playerId,
        playerName: players.nickname,
        playerImage: players.imageUrl,
        playerPosition: players.position,
        teamName: teams.name,
        teamLogo: teams.logoUrl,
        globalAverage: globalAverageExpr,
        isActive: players.isActive,
      })
      .from(votes)
      .innerJoin(players, eq(votes.playerId, players.id))
      .innerJoin(teams, eq(players.teamId, teams.id))
      .groupBy(
        votes.playerId,
        players.id,
        players.nickname,
        players.imageUrl,
        players.position,
        teams.id,
        teams.name,
        teams.logoUrl,
      )
      .orderBy(sql`${globalAverageExpr} DESC`)
      .limit(5);

    return topPlayers || [];
  } catch (error) {
    console.error("Error al obtener Top Players:", error);
    return [];
  }
}
