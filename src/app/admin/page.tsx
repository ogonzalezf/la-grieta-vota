import { db } from "@/lib/db";
import {
  verificationRequests,
  teams,
  matches,
  roles,
  users,
} from "@/lib/db/schema/schema";
import { eq, desc, aliasedTable, not } from "drizzle-orm";
import { Check, X, ShieldCheck, ExternalLink, Users, Trophy } from "lucide-react";
import { approveExpert, rejectRequest, revokeExpertRole } from "./actions";
import MatchManager from "./MatchManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";


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

export default async function AdminPage() {
  // 1. SEGURIDAD: Verificación de sesión y Rol de Admin
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/"); // Redirigir si no es admin o no está logueado
  }

  // 2. DATA: Solicitudes de Verificación
  const pending = await db
    .select({
      id: verificationRequests.id,
      userId: verificationRequests.userId,
      riotId: verificationRequests.riotId,
      email: verificationRequests.email,
      evidence: verificationRequests.evidenceLink,
      roleName: roles.name,
      roleId: roles.id,
    })
    .from(verificationRequests)
    .innerJoin(roles, eq(verificationRequests.requestedRoleId, roles.id))
    .where(eq(verificationRequests.status, "PENDING"));

  // 3. DATA: Equipos
  const allTeams = await db.select().from(teams).orderBy(teams.name);

  // 4. DATA: Partidos (Incluyendo la nueva columna isVotingActive)
  const teamA = aliasedTable(teams, "teamA");
  const teamB = aliasedTable(teams, "teamB");

const initialMatches: MatchListItem[] = (await db
  .select({
    id: matches.id,
    tournament: matches.tournamentName,
    status: matches.status,
    date: matches.matchDate,
    scoreA: matches.scoreA,
    scoreB: matches.scoreB,
    teamAId: matches.teamAId,
    teamBId: matches.teamBId,
    teamAName: teamA.name,
    teamBName: teamB.name,
    isVotingActive: matches.isVotingActive,
  })
  .from(matches)
  .innerJoin(teamA, eq(matches.teamAId, teamA.id))
  .innerJoin(teamB, eq(matches.teamBId, teamB.id))
  .orderBy(desc(matches.matchDate))) as unknown as MatchListItem[];

  // 5. DATA: Expertos actuales
  const currentExperts = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    // Cambiamos la lógica: si no tienes la columna canVote,
    // filtramos por todos los que NO sean el rol "Usuario" (ID 5)
    .where(not(eq(users.roleId, 5)))
    .orderBy(users.name);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
        Panel de <span className="text-lol-cyan">Control</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: GESTIÓN DE PARTIDOS */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-6 border-lol-cyan/20">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-lol-cyan" /> Gestión de
              Encuentros
            </h2>
            {/* Pasamos los partidos al manager para poder editarlos */}
            <MatchManager initialMatches={initialMatches} teams={allTeams} />
          </section>

          {/* SOLICITUDES DE VERIFICACIÓN */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-lol-cyan" /> Solicitudes
              Pendientes
            </h2>
            {pending.length > 0 ? (
              <div className="space-y-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-black text-white italic">
                        {req.riotId}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">{req.email}</p>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black bg-lol-cyan/10 text-lol-cyan px-2 py-0.5 rounded uppercase border border-lol-cyan/20">
                          {req.roleName}
                        </span>
                        <a
                          href={req.evidence ?? undefined}
                          target="_blank"
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                        >
                          <ExternalLink size={10} /> Ver Evidencia
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          await rejectRequest(req.id);
                        }}
                      >
                        <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20">
                          <X size={18} />
                        </button>
                      </form>
                      <form
                        action={async () => {                       
                          "use server";
                          await approveExpert(req.id, req.userId, req.roleId);
                        }}
                      >
                        <button className="p-2 bg-lol-cyan text-black rounded-lg hover:bg-white transition-colors">
                          <Check size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-slate-500 italic text-sm">
                No hay solicitudes pendientes.
              </p>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA: EXPERTOS */}
        <aside className="space-y-8">
          <section className="glass-card p-6">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Users size={20} className="text-lol-cyan" /> Expertos Activos
            </h2>
            <div className="space-y-3">
              {currentExperts.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs truncate italic">
                      {exp.name}
                    </p>
                    <p className="text-[10px] text-lol-cyan font-bold uppercase">
                      {exp.roleName}
                    </p>
                  </div>
                  <form action={
                    async () => { 
                      "use server";
                      await revokeExpertRole(exp.id);
                    }}>
                    <button className="p-1.5 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <X size={14} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
