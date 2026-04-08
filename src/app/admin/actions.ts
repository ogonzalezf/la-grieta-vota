"use server";
import { db } from "@/lib/db";
import { users, verificationRequests, matches } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveExpert(
  requestId: number,
  userId: string,
  roleId: number,
) {
  try {
    // 1. Actualizamos el rol del usuario primero
    await db.update(users).set({ roleId: roleId }).where(eq(users.id, userId));

    // 2. Luego marcamos la solicitud como aprobada
    await db
      .update(verificationRequests)
      .set({ status: "APPROVED" })
      .where(eq(verificationRequests.id, requestId));

    // 3. Revalidamos las rutas para limpiar la UI
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error en approveExpert:", error);
    return {
      error:
        "No se pudo procesar la aprobación debido a un error de base de datos.",
    };
  }
}

export async function deleteMatch(id: number) {
  try {
    await db.delete(matches).where(eq(matches.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al borrar partido:", error);
    return { error: "Fallo al eliminar el registro." };
  }
}

export async function saveMatch(formData: FormData) {
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const rawDate = formData.get("date") as string;
  const matchDate = new Date(rawDate);

  const matchData = {
    teamAId: Number(formData.get("teamA")),
    teamBId: Number(formData.get("teamB")),
    matchDate: matchDate,
    tournamentName: formData.get("tournament") as string,
    status: formData.get("status") as "UPCOMING" | "LIVE" | "FINISHED",
    scoreA: Number(formData.get("scoreA") || 0),
    scoreB: Number(formData.get("scoreB") || 0),
    isVotingActive: formData.get("isVotingActive") === "true",
  };

  try {
    if (id) {
      // EDITAR PARTIDO EXISTENTE
      await db.update(matches).set(matchData).where(eq(matches.id, id));
    } else {
      // CREAR PARTIDO NUEVO
      await db.insert(matches).values(matchData);
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error saving match:", error);
    return { error: "Error al guardar el partido" };
  }
}

export async function rejectRequest(requestId: number) {
    try {
        // Simplemente cambiamos el estado de la solicitud a 'REJECTED'
        // No tocamos el rol del usuario (sigue como Comunidad)
        await db
            .update(verificationRequests)
            .set({ status: "REJECTED" })
            .where(eq(verificationRequests.id, requestId));

        // Refrescamos la ruta para que desaparezca de la lista
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error al rechazar solicitud:", error);
        return { error: "Hubo un fallo al rechazar la solicitud." };
    }
}

// src/app/admin/actions.ts

export async function revokeExpertRole(userId: string) {
  try {
    // El ID 5 corresponde al rol "Comunidad" (el básico)
    await db.update(users).set({ roleId: 5 }).where(eq(users.id, userId));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al revocar el rol:", error);
    return { error: "No se pudo revocar el rol." };
  }
}

export async function toggleVoting(id: number, currentState: boolean) {
  await db
    .update(matches)
    .set({ isVotingActive: !currentState })
    .where(eq(matches.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
}