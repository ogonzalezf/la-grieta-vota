"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { submitVotes, getExistingVotes } from "./actions";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CheckCircle2, Loader2, Save, Lock } from "lucide-react";

// 1. Interfaces para eliminar los errores de 'any'
interface Player {
  id: number;
  nickname: string;
  imageUrl: string | null;
  position: string;
  teamId: number;
}

interface TeamData {
  name: string;
  players: Player[];
}

interface VotingFormProps {
  matchId: number;
  teamA: TeamData;
  teamB: TeamData;
  roles: string[];
  isVotingActive: boolean;
}

export default function VotingForm({
  matchId,
  teamA,
  teamB,
  roles,
  isVotingActive,
}: VotingFormProps) {
  const [mounted, setMounted] = useState(false);
  const [browserId, setBrowserId] = useState<string>("");
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [originalScores, setOriginalScores] = useState<{
    [key: number]: number;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 2. Corrección del Effect para evitar 'cascading renders'
  useEffect(() => {
    const initForm = async () => {
      try {
        // 1. Obtener Fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fpid = result.visitorId;
        setBrowserId(fpid);

        // 2. Cargar votos existentes desde la DB
        const existing = await getExistingVotes(matchId, fpid);
        if (existing && Object.keys(existing).length > 0) {
          setScores(existing);
          setOriginalScores(existing);
        }
      } catch (error) {
        console.error("Error inicializando formulario:", error);
      } finally {
        // Establecemos mounted al final para sincronizar el estado una sola vez
        setMounted(true);
      }
    };

    initForm();
  }, [matchId]);

  const handleScoreChange = (playerId: number, value: number) => {
    if (!isVotingActive) return;
    setScores((prev) => ({ ...prev, [playerId]: value }));
  };

  const hasChanges = JSON.stringify(scores) !== JSON.stringify(originalScores);
  const totalVotes = Object.keys(scores).length;
  const isFormComplete = totalVotes >= 10;

  const handleSubmit = async () => {
    if (!isFormComplete || !hasChanges || !isVotingActive) return;

    setIsSubmitting(true);
    setMessage(null);

    const votesToSync = Object.entries(scores).map(([id, score]) => ({
      playerId: parseInt(id),
      score,
    }));

    const result = await submitVotes(matchId, votesToSync, browserId);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Votos actualizados correctamente" });
      setOriginalScores({ ...scores });
    }
    setIsSubmitting(false);
  };

  if (!mounted)
    return (
      <div className="py-20 text-center opacity-50 italic">Cargando...</div>
    );

  return (
    <div
      className={`max-w-5xl mx-auto space-y-4 pb-40 relative ${
        !isVotingActive ? "opacity-75" : ""
      }`}
    >
      {!isVotingActive && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-amber-500 mb-6 sticky top-4 z-40 backdrop-blur-md">
          <Lock size={18} />
          <p className="text-xs font-black uppercase tracking-widest">
            Votación cerrada.
          </p>
        </div>
      )}

      {roles.map((role: string) => {
        const pA = teamA.players?.find((p) => p.position === role);
        const pB = teamB.players?.find((p) => p.position === role);
        if (!pA || !pB) return null;

        return (
          <div
            key={role}
            className="grid grid-cols-12 gap-2 items-center bg-slate-900/10 border border-slate-800/40 p-3 rounded-2xl"
          >
            {/* Equipo A */}
            <div className="col-span-5 flex items-center gap-4">
              <div className="relative size-14 shrink-0 bg-black rounded-xl overflow-hidden border border-slate-800">
                <Image
                  src={pA.imageUrl || "/placeholder.png"}
                  alt={pA.nickname}
                  fill
                  className="object-cover"
                  sizes="100px"
                  loading="eager"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-lol-cyan uppercase">
                  {role}
                </p>
                <h3 className="font-black italic uppercase text-sm truncate text-white">
                  {pA.nickname}
                </h3>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleScoreChange(pA.id, i + 1)}
                      className={`size-6 rounded-md text-[9px] font-black border transition-all ${
                        scores[pA.id] === i + 1
                          ? "bg-lol-cyan text-black border-lol-cyan"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col items-center justify-center py-1">
              <div className="h-full w-px bg-slate-800 opacity-40"></div>
              <div className="size-7 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center my-1 shrink-0 italic text-[8px] text-slate-600">
                VS
              </div>
              <div className="h-full w-px bg-slate-800 opacity-40"></div>
            </div>

            {/* Equipo B */}
            <div className="col-span-5 flex items-center flex-row-reverse gap-4 text-right">
              <div className="relative size-14 shrink-0 bg-black rounded-xl overflow-hidden border border-slate-800">
                <Image
                  src={pB.imageUrl || "/placeholder.png"}
                  alt={pB.nickname}
                  fill
                  className="object-cover"
                  sizes="100px"
                  loading="eager"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-red-500 uppercase">
                  {role}
                </p>
                <h3 className="font-black italic uppercase text-sm truncate text-white">
                  {pB.nickname}
                </h3>
                <div className="flex gap-0.5 mt-1 justify-end">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleScoreChange(pB.id, i + 1)}
                      className={`size-6 rounded-md text-[9px] font-black border transition-all ${
                        scores[pB.id] === i + 1
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50">
        <div className="glass-card p-4 flex flex-col gap-3 border-white/10 shadow-2xl">
          {message && (
            <div
              className={`text-[10px] font-black uppercase text-center p-2 rounded-lg ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            disabled={!isFormComplete || !hasChanges || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.25em] transition-all flex items-center justify-center gap-3 border border-white/5 ${
              isFormComplete && hasChanges && !isSubmitting
                ? "bg-lol-cyan text-black shadow-lol-cyan/20 shadow-xl"
                : "bg-slate-800 text-slate-700 cursor-not-allowed opacity-60"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : Object.keys(originalScores).length > 0 ? (
              <Save size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {isSubmitting
              ? "Guardando..."
              : !isFormComplete
                ? `Faltan evaluaciones (${totalVotes}/10)`
                : !hasChanges
                  ? "Sin cambios para guardar"
                  : "Guardar Calificaciones"}
          </button>
        </div>
      </div>
    </div>
  );
}
