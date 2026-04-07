"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function CalendarFilters({
  tournaments,
  baseUrl, // Nueva prop opcional
}: {
  tournaments: string[];
  baseUrl?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilter = (tournament: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tournament) params.set("tournament", tournament);
    else params.delete("tournament");

    // Si se pasa baseUrl la usamos, si no, usamos el pathname actual
    const targetPath = baseUrl || pathname;
    router.push(`${targetPath}?${params.toString()}`);
  };

  return (
    <select
      onChange={(e) => handleFilter(e.target.value)}
      // Mantenemos el valor seleccionado si existe en la URL
      value={searchParams.get("tournament") || ""}
      className="bg-slate-900 border border-slate-800 text-white text-xs font-black uppercase p-4 rounded-xl outline-none focus:border-lol-cyan transition-all cursor-pointer"
    >
      <option value="">Todos los Torneos</option>
      {tournaments.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
