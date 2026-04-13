import { db } from "@/lib/db";
import {
  verificationRequests,
  teams,
  matches,
  roles,
  users,
} from "@/lib/db/schema/schema";
import { eq, desc, aliasedTable, not } from "drizzle-orm";
import {
  Check,
  X,
  ShieldCheck,
  ExternalLink,
  Users,
  LayoutDashboard,
} from "lucide-react";
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
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/");
  }

  // DATA: Solicitudes
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

  // DATA: Equipos
  const allTeams = await db.select().from(teams).orderBy(teams.name);

  // DATA: Partidos
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

  // DATA: Expertos
  const currentExperts = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(not(eq(users.roleId, 5)))
    .orderBy(users.name);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12 pb-24">
      <div className="flex items-center gap-4">
        <LayoutDashboard className="text-lol-cyan" size={32} />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          Panel de <span className="text-lol-cyan">Control</span>
        </h1>
      </div>

      <div className="grid xl:grid-cols-4 gap-8">
        {/* COLUMNA IZQUIERDA: GESTIÓN DE PARTIDOS (75% ancho) */}
        <div className="xl:col-span-3 space-y-12">
          <MatchManager initialMatches={initialMatches} teams={allTeams} />

          {/* SOLICITUDES DE VERIFICACIÓN (Abajo del todo) */}
          <section className="glass-card p-8 border-slate-800/40">
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
              <ShieldCheck size={22} className="text-lol-cyan" />
              Solicitudes Pendientes
            </h2>
            {pending.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-lol-cyan/20 transition-all"
                  >
                    <div className="min-w-0">
                      <h3 className="font-black text-white italic truncate">
                        {req.riotId}
                      </h3>
                      <p className="text-[10px] text-slate-500 mb-3 truncate">
                        {req.email}
                      </p>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-black bg-lol-cyan/10 text-lol-cyan px-2 py-1 rounded-lg uppercase border border-lol-cyan/20">
                          {req.roleName}
                        </span>
                        <a
                          href={req.evidence ?? undefined}
                          target="_blank"
                          className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 underline font-bold uppercase tracking-widest"
                        >
                          <ExternalLink size={10} /> Evidencia
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <form
                        action={async () => {
                          "use server";
                          await rejectRequest(req.id);
                        }}
                      >
                        <button className="p-2.5 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors border border-red-500/10 hover:border-red-500/30">
                          <X size={18} />
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await approveExpert(req.id, req.userId, req.roleId);
                        }}
                      >
                        <button className="p-2.5 bg-lol-cyan text-black rounded-xl hover:bg-white transition-all shadow-lg shadow-lol-cyan/10">
                          <Check size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-16 text-slate-500 italic text-sm bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl">
                No hay solicitudes pendientes en este momento.
              </p>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA: EXPERTOS (25% ancho) */}
        <aside className="space-y-8 xl:col-span-1">
          <section className="glass-card p-6 border-slate-800/40 sticky top-28">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Users size={20} className="text-lol-cyan" /> Expertos Activos
            </h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {currentExperts.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs truncate italic">
                      {exp.name}
                    </p>
                    <p className="text-[10px] text-lol-cyan font-bold uppercase tracking-wider">
                      {exp.roleName}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await revokeExpertRole(exp.id);
                    }}
                  >
                    <button className="p-1.5 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
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
