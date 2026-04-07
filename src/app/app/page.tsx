import { isUserAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verificationRequests, teams } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import { approveRequest, createMatch } from "./actions";
import { Check, Calendar, Users } from "lucide-react";

export default async function AdminPage() {
  if (!(await isUserAdmin())) redirect("/");

  const pending = await db.query.verificationRequests.findMany({
    where: eq(verificationRequests.status, "PENDING"),
  });

  const allTeams = await db.select().from(teams);

  return (
    <div className="space-y-12 pb-20">
      <h1 className="text-4xl font-black italic uppercase">
        Panel de <span className="text-lol-cyan">Control</span>
      </h1>

      {/* SECCIÓN 1: SOLICITUDES */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold uppercase tracking-widest text-slate-400">
          <Users size={20} /> Solicitudes Pendientes ({pending.length})
        </h2>
        <div className="grid gap-4">
          {pending.map((req) => (
            <div
              key={req.id}
              className="glass-card p-6 flex justify-between items-center border-l-4 border-yellow-500"
            >
              <div>
                <p className="font-black text-lg">{req.riotId}</p>
                <p className="text-xs text-slate-500">
                  {req.email} • Rol: {req.requestedRoleId}
                </p>
                {req.evidenceLink && (
                  <a
                    href={req.evidenceLink}
                    target="_blank"
                    className="text-lol-cyan text-[10px] hover:underline uppercase font-bold"
                  >
                    Ver Evidencia
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <form
                  action={approveRequest.bind(
                    null,
                    req.id,
                    req.userId,
                    req.requestedRoleId,
                  )}
                >
                  <button className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                    <Check size={20} />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-slate-600 italic">
              No hay solicitudes pendientes.
            </p>
          )}
        </div>
      </section>

      {/* SECCIÓN 2: PROGRAMAR PARTIDO */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold uppercase tracking-widest text-slate-400">
          <Calendar size={20} /> Programar Nuevo Partido
        </h2>
        <form
          action={createMatch}
          className="glass-card p-8 grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500">
              Equipo A
            </label>
            <select
              name="teamA"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500">
              Equipo B
            </label>
            <select
              name="teamB"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500">
              Fecha y Hora (Local)
            </label>
            <input
              type="datetime-local"
              name="date"
              required
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500">
              Torneo
            </label>
            <input
              name="tournament"
              defaultValue="LEC Summer 2025"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 btn-primary py-4 uppercase font-black"
          >
            Registrar Partido en la Cartelera
          </button>
        </form>
      </section>
    </div>
  );
}
