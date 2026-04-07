"use server";
import { db } from "@/lib/db";
import { users, verificationRequests, matches } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import { isUserAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

// APROBAR SOLICITUD
export async function approveRequest(
  requestId: number,
  userId: string,
  newRoleId: number,
) {
  if (!(await isUserAdmin())) throw new Error("No autorizado");

  await db.transaction(async (tx) => {
    // 1. Cambiamos el rol del usuario
    await tx
      .update(users)
      .set({ roleId: newRoleId })
      .where(eq(users.id, userId));
    // 2. Marcamos la solicitud como aprobada
    await tx
      .update(verificationRequests)
      .set({ status: "APPROVED" })
      .where(eq(verificationRequests.id, requestId));
  });

  revalidatePath("/admin");
}

// CREAR PARTIDO
export async function createMatch(formData: FormData) {
  if (!(await isUserAdmin())) throw new Error("No autorizado");

  await db.insert(matches).values({
    teamAId: parseInt(formData.get("teamA") as string),
    teamBId: parseInt(formData.get("teamB") as string),
    tournamentName: formData.get("tournament") as string,
    matchDate: new Date(formData.get("date") as string),
    status: "UPCOMING",
  });

  revalidatePath("/admin");
}
