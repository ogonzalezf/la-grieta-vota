"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verificationRequests } from "@/lib/db/schema/schema";
import { revalidatePath } from "next/cache";

export async function submitVerification(formData: FormData) {
  const session = await auth();

  // Bloqueo de seguridad: Si no hay sesión, no hay solicitud
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión con Google primero." };
  }

  const riotId = formData.get("riotId") as string;
  const roleId = formData.get("roleId") as string;
  const evidence = formData.get("evidence") as string;

  if (!riotId || !roleId) {
    return { error: "El Riot ID y el Rol son obligatorios." };
  }

  try {
    await db.insert(verificationRequests).values({
      userId: session.user.id, // El ID de texto que configuramos
      riotId,
      requestedRoleId: parseInt(roleId),
      email: session.user.email!,
      evidenceLink: evidence || null,
      status: "PENDING",
    });

    revalidatePath("/verify");
    return { success: true };
  } catch (error: unknown) {
    // 1. Manejo seguro del error eliminando 'any'
    // Verificamos si el error es un objeto y tiene el código de Postgres
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505" // Error 23505 = Registro duplicado en Postgres
    ) {
      return { error: "Ya tienes una solicitud pendiente de revisión." };
    }
    
    console.error("Error al enviar solicitud:", error);
    return { error: "Error al enviar. Inténtalo de nuevo." };
  }
}