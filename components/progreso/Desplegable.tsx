"use client";

import { useEffect, useRef, type ReactNode } from "react";

const CLAVE = "akasha:progreso-abiertos";

function leer(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

// <details> que recuerda en este navegador si la persona lo dejó abierto o cerrado
export function Desplegable({ id, abierto, className, resumen, children }: {
  id: string;
  abierto: boolean; // estado por defecto, si no hay nada guardado
  className?: string;
  resumen: ReactNode; // contenido del <summary>
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const guardado = leer()[id];
    if (ref.current && typeof guardado === "boolean") ref.current.open = guardado;
  }, [id]);

  function alCambiar() {
    if (!ref.current) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ ...leer(), [id]: ref.current.open }));
    } catch {}
  }

  return (
    <details ref={ref} className={className} open={abierto} onToggle={alCambiar}>
      {resumen}
      {children}
    </details>
  );
}
