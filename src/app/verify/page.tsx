import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verificationRequests, roles } from "@/lib/db/schema/schema";
import { eq, and, notInArray } from "drizzle-orm";
import VerifyForm from "./VerifyForm"; // Separaremos el cliente del servidor
import { Clock, Trophy } from "lucide-react";

export default async function VerifyPage() {
  const session = await auth();
  const availableRoles = await db
    .select()
    .from(roles)
    .where(notInArray(roles.id, [5])) // Ajusta el ID según tu base de datos
    .orderBy(roles.weight);

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 glass-card">
        <h2 className="text-xl font-bold mb-4 text-white">
          Inicia sesión primero
        </h2>
        <p className="text-slate-400 mb-6">
          Necesitamos saber quién eres para procesar tu rango.
        </p>
      </div>
    );
  }

  // 1. Buscamos si tiene alguna solicitud PENDIENTE
  const pendingRequest = await db
    .select()
    .from(verificationRequests)
    .where(
      and(
        eq(verificationRequests.userId, session.user.id),
        eq(verificationRequests.status, "PENDING"),
      ),
    )
    .limit(1);

  // 2. Si tiene una solicitud pendiente, mostramos el estado de espera
  if (pendingRequest.length > 0) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 glass-card text-center space-y-6 border-lol-cyan/30">
        <div className="size-20 bg-lol-cyan/10 rounded-full flex items-center justify-center mx-auto border border-lol-cyan/20 animate-pulse">
          <Clock className="text-lol-cyan size-10" />
        </div>
        <h2 className="text-2xl font-black uppercase italic text-white">
          Solicitud en Revisión
        </h2>
        <p className="text-slate-400 text-sm">
          Ya tienes una petición para el rol de{" "}
          <span className="text-lol-cyan font-bold">
            {pendingRequest[0].requestedRoleId === 1
              ? "Analista"
              : "Pro Player"}
          </span>
          . Estamos verificando tus datos manualmente.
        </p>
      </div>
    );
  }

  // 3. Si ya tiene un rol (peso > 0.5), mostramos la opción de "Escalar"
  const isAlreadyVerified = session.user.roleWeight > 0.5;

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="space-y-4">
        {isAlreadyVerified ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Trophy size={14} /> Usuario Verificado
          </div>
        ) : null}

        <h1 className="text-4xl font-black tracking-tighter italic uppercase">
          {isAlreadyVerified ? "Escalar" : "Solicitar"}{" "}
          <span className="text-lol-cyan">Rango</span>
        </h1>
        <p className="text-slate-500 font-medium">
          {isAlreadyVerified
            ? "Tu voto ya tiene peso extra, pero si has cambiado de rol profesional, puedes solicitar una actualización."
            : "Vincula tu identidad profesional para que tu análisis tenga el impacto que merece."}
        </p>
      </div>

      <VerifyForm isScaling={isAlreadyVerified} roles={availableRoles}/>
    </div>
  );
}
