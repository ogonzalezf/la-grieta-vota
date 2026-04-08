"use client";

import { useSyncExternalStore } from "react";

// Función de utilidad para detectar si estamos en el cliente
function subscribe() {
  return () => {};
}

export default function FormattedDate({
  date,
}: {
  date: Date | string | null;
}) {
  // Esta es la forma oficial de React para manejar datos que dependen del cliente (browser)
  // sin causar errores de hidratación ni renderizados en cascada.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!date) return null;

  // Mientras sea servidor, mostramos el placeholder
  if (!isClient) {
    return <span className="opacity-0">--:-- HS</span>;
  }

  // Lógica de fecha (solo se ejecuta en el cliente)
  const d = new Date(date);
  if (isNaN(d.getTime())) return <span>--:-- HS</span>;

  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() + offset);

  const timeString = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(localDate);

  return <span>{timeString} HS</span>;
}
