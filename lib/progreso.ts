// Progreso de la persona que ha iniciado sesión (tabla "progreso" de Supabase).
// Tipos y textos compartidos por el servidor y por los botones de la ficha.
import type { Obra } from "@/lib/catalogo";

export type EstadoObra = "pendiente" | "viendo" | "visto" | "abandonado";

export const ESTADOS: { id: EstadoObra; nombre: string }[] = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "viendo", nombre: "Viendo" },
  { id: "visto", nombre: "Visto" },
  { id: "abandonado", nombre: "Abandonado" },
];

export const nombreEstado = (e: EstadoObra) => ESTADOS.find((x) => x.id === e)?.nombre ?? e;

export type FilaProgreso = {
  obra_id: string;
  estado: EstadoObra;
  episodios_vistos: number | null;
  actualizado_en: string;
};

// Las series (o lo que tenga número de episodios) llevan contador de episodios
export const tieneEpisodios = (o: Obra) => o.tipo === "serie" || (o.episodios ?? 0) > 1;

// Ids marcados como "Visto": es lo que cuentan las barras de progreso del catálogo
export const idsVistos = (filas: FilaProgreso[]) =>
  new Set(filas.filter((f) => f.estado === "visto").map((f) => f.obra_id));
