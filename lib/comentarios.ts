// Tipos, textos y utilidades de los comentarios de cada obra (tablas comentarios y reacciones)

export type Comentario = {
  id: number;
  obra_id: string;
  usuario_id: string;
  texto: string;
  spoiler: boolean;
  creado_en: string;
  editado_en: string | null;
  respuesta_a: number | null; // null = comentario principal
  perfiles: { nombre: string } | null;
};

export const POR_PAGINA = 20; // solo cuentan los principales
export const MAX = 1000;
export const ENFRIAMIENTO = 30; // segundos entre comentarios
export const RESPUESTAS_VISIBLES = 2; // las demás detrás de "Ver más respuestas"

export const CAMPOS = "id, obra_id, usuario_id, texto, spoiler, creado_en, editado_en, respuesta_a, perfiles!comentarios_usuario_id_fkey(nombre)";
// Por si aún no se ejecutó el SQL de las respuestas (no existe respuesta_a)
export const CAMPOS_SIN_RESPUESTAS = "id, obra_id, usuario_id, texto, spoiler, creado_en, editado_en, perfiles!comentarios_usuario_id_fkey(nombre)";

const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60],
];

// "hace 5 minutos", "ayer", "hace 2 semanas"...
export function haceCuanto(fecha: string) {
  const segundos = (new Date(fecha).getTime() - Date.now()) / 1000;
  for (const [unidad, s] of UNIDADES) {
    if (Math.abs(segundos) >= s) return relativo.format(Math.round(segundos / s), unidad);
  }
  return "ahora mismo";
}

const textoDe = (e: unknown) =>
  e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "";

// Traduce los errores que mandan los triggers de Supabase
export function mensajeError(e: unknown, porDefecto: string) {
  const m = textoDe(e);
  if (m.includes("Espera 30 segundos")) return "Espera 30 segundos antes de volver a comentar.";
  if (m.includes("Respuesta no válida")) return "Ese comentario ya no existe o no admite respuestas.";
  if (m.startsWith("Tu sesión")) return m;
  return porDefecto;
}

export const esEsperaDelServidor = (e: unknown) => textoDe(e).includes("Espera 30 segundos");

// ── Reacciones (tabla reacciones: una por persona y comentario) ──
export type TipoReaccion = "me_gusta" | "me_encanta" | "risa" | "sorpresa" | "triste" | "enfado";
export type Reaccion = { comentario_id: number; usuario_id: string; tipo: TipoReaccion };

export const REACCIONES: { id: TipoReaccion; emoji: string; nombre: string; color: string }[] = [
  { id: "me_gusta", emoji: "👍", nombre: "Me gusta", color: "var(--ruta-fgo)" },
  { id: "me_encanta", emoji: "😍", nombre: "Me encanta", color: "var(--rojo-sello-hover)" },
  { id: "risa", emoji: "😆", nombre: "Me divierte", color: "var(--oro-grial)" },
  { id: "sorpresa", emoji: "😮", nombre: "Me asombra", color: "var(--oro-grial)" },
  { id: "triste", emoji: "😢", nombre: "Me entristece", color: "var(--oro-grial)" },
  { id: "enfado", emoji: "😡", nombre: "Me enoja", color: "var(--ruta-zero)" },
];

export const datosReaccion = (t: TipoReaccion) => REACCIONES.find((r) => r.id === t) ?? REACCIONES[0];
