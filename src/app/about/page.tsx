import { ShieldCheck, Scale, Users, Zap } from "lucide-react";

export default function MethodologyPage() {
  const weights = [
    {
      role: "Pro / Coach",
      weight: "4.0",
      desc: "Jugadores profesionales y entrenadores activos.",
    },
    {
      role: "Especialista",
      weight: "3.5",
      desc: "Analistas de liga y expertos técnicos.",
    },
    {
      role: "Caster",
      weight: "2.0",
      desc: "Narradores y comentaristas oficiales.",
    },
    {
      role: "Comunidad",
      weight: "0.5",
      desc: "Fans y usuarios generales (Voto base).",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-16 bg-lol-cyan/10 rounded-full mb-4">
          <Scale className="text-lol-cyan size-8" />
        </div>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic">
          El Sistema de <span className="text-lol-cyan">Ponderación</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          En La Grieta Vota, no todos los votos nacen iguales. Protegemos la
          integridad del análisis utilizando un sistema de pesos dinámicos.
        </p>
      </section>

      {/* Explicación de Pesos */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase flex items-center gap-3">
            <Users className="text-lol-cyan" /> Jerarquía de Votos
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Para evitar que la popularidad de un jugador nuble su desempeño
            real, otorgamos mayor relevancia a los perfiles con conocimiento
            técnico demostrado.
          </p>
          <div className="space-y-3">
            {weights.map((w) => (
              <div
                key={w.role}
                className="flex items-center justify-between p-4 glass-card border-l-4 border-l-lol-cyan"
              >
                <div>
                  <div className="font-black text-sm uppercase">{w.role}</div>
                  <div className="text-xs text-slate-500">{w.desc}</div>
                </div>
                <div className="text-2xl font-black text-lol-cyan">
                  x{w.weight}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h3 className="font-black text-lol-cyan uppercase tracking-widest text-sm">
              La Fórmula
            </h3>
            <div className="bg-brand-dark p-6 rounded-xl border border-slate-700 font-mono text-sm overflow-x-auto">
              Score Final = Σ(Voto × Peso) / ΣPesos
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            * Si 100 fans votan 5 y 1 especialista vota 9, el peso del
            especialista evita que la nota se hunda injustamente, manteniendo el
            equilibrio técnico.
          </p>
        </div>
      </section>

      {/* Pilares de Seguridad */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-12 bg-slate-800 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-lol-cyan" />
          </div>
          <h4 className="font-bold uppercase text-sm">Anti-Spam</h4>
          <p className="text-xs text-slate-500">
            Usamos tecnología de huella digital (Fingerprint) para asegurar que
            cada dispositivo vote solo una vez por partido, incluso sin cuenta.
          </p>
        </div>

        <div className="space-y-4 text-center">
          <div className="mx-auto size-12 bg-slate-800 rounded-xl flex items-center justify-center">
            <Zap className="text-lol-cyan" />
          </div>
          <h4 className="font-bold uppercase text-sm">Voto en Caliente</h4>
          <p className="text-xs text-slate-500">
            Las urnas se abren inmediatamente al finalizar el Nexo y se cierran
            tras 24 horas para capturar la emoción y el análisis fresco.
          </p>
        </div>       
      </section>

      {/* Call to action */}
      <section className="p-10 rounded-3xl bg-linear-to-r from-lol-cyan/20 to-transparent border border-lol-cyan/20 text-center">
        <h3 className="text-2xl font-black mb-2">¿ERES UN PROFESIONAL?</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Si eres caster, coach, jugador o analista verificado, contáctanos para elevar
          tu rango de votación.
        </p>
        <button className="btn-primary mx-auto">Solicitar Verificación</button>
      </section>
    </div>
  );
}
