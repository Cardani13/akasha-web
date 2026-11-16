// Tipos y funciones para leer data/catalogo.json desde la web.
import datos from "@/data/catalogo.json";
// Las funciones de progreso reciben "vistas": los ids que la persona marcó como vistos (lib/progreso.ts)
export type Vistas = ReadonlySet<string>;

// Clave de color de cada ruta: coincide con las variables --ruta-* de app/globals.css
export type Ruta = "fate2006" | "ubw" | "hf" | "zero" | "fgo" | "spinoff";

export type TipoObra = "serie" | "pelicula" | "ova" | "especial" | "novela_visual" | "videojuego" | "novela";

export type Obra = {
  id: string;
  titulo: string;
  tituloOriginal?: string;
  tipo: TipoObra;
  anio: number;
  fecha?: string; // AAAA-MM-DD, estreno o salida en Japón
  estudio: string | null;
  episodios: number | null;
  franquicia: string;
  saga: string;
  linea: string; // clave de catalogo.lineas
  ruta: Ruta;
  epoca: string; // cuándo y dónde ocurre dentro de la historia
  sinopsis: string;
  imagen: string;
  imagenEsPlaceholder: boolean;
  nota?: string;
  verificar?: string; // dato pendiente de comprobar
  // Los enlaces de descarga no están aquí: van en la tabla "descargas" de Supabase (lib/descargas.ts)
};

export type SagaCatalogo = { id: string; titulo: string; ruta: Ruta; descripcion: string; obras: string[] };
export type PasoOrden = { paso: number; titulo: string; detalle: string; obras: string[] };
export type Orden = {
  titulo: string;
  descripcion: string;
  pendiente?: boolean; // true si la lista aún no está hecha
  pasos: PasoOrden[];
};
export type IdOrden = "recomendado" | "principal" | "extras" | "universo";

export const catalogo = datos as unknown as {
  version: number;
  actualizado: string;
  tipos: Record<TipoObra, string>;
  lineas: Record<string, string>;
  sagas: SagaCatalogo[];
  obras: Obra[];
  ordenes: Record<IdOrden, Orden>;
  ordenCronologico: Record<string, string[]>;
};

const porId = new Map(catalogo.obras.map((o) => [o.id, o]));

// Lo que se puede "ver": series, películas, OVAs y especiales (no novelas ni juegos)
const TIPOS_ANIME: TipoObra[] = ["serie", "pelicula", "ova", "especial"];
export const esAnime = (o: Obra) => TIPOS_ANIME.includes(o.tipo);

export const obra = (id: string) => {
  const o = porId.get(id);
  if (!o) throw new Error(`No existe la obra "${id}" en data/catalogo.json`);
  return o;
};

export const saga = (id: string) => {
  const s = catalogo.sagas.find((s) => s.id === id);
  if (!s) throw new Error(`No existe la saga "${id}" en data/catalogo.json`);
  return s;
};

export const obrasDeSaga = (sagaId: string) => saga(sagaId).obras.map(obra);

// Solo el anime de una o varias sagas, en el orden del catálogo
export const animeDeSagas = (...sagaIds: string[]) => sagaIds.flatMap(obrasDeSaga).filter(esAnime);

// Texto corto del tipo: "Serie de TV", "Película"...
export const nombreTipo = (o: Obra) => catalogo.tipos[o.tipo];

// Primera portada real de una saga (si no hay, el placeholder)
export const portadaDeSaga = (sagaId: string) => {
  const obras = obrasDeSaga(sagaId);
  return (obras.find((o) => !o.imagenEsPlaceholder) ?? obras[0]).imagen;
};

// Progreso de una saga: cuántas de sus obras de anime has visto
export const progresoDeSaga = (sagaId: string, vistas: Vistas) => {
  const anime = animeDeSagas(sagaId);
  const vistasSaga = anime.filter((o) => vistas.has(o.id)).length;
  return { vistas: vistasSaga, total: anime.length };
};

const recomendado = catalogo.ordenes.recomendado.pasos;

// Paso del orden recomendado en el que aparece una obra (o undefined si no está)
export const pasoDeObra = (id: string) => recomendado.find((p) => p.obras.includes(id));

// Qué ver justo antes y justo después de una obra.
// Si está en el orden recomendado se usa ese orden; si no, el orden de su saga.
export const anteriorYSiguiente = (id: string) => {
  const lista = pasoDeObra(id)
    ? recomendado.flatMap((p) => p.obras)
    : animeDeSagas(obra(id).saga).map((o) => o.id);
  const i = lista.indexOf(id);
  return {
    anterior: i > 0 ? obra(lista[i - 1]) : undefined,
    siguiente: i >= 0 && i < lista.length - 1 ? obra(lista[i + 1]) : undefined,
  };
};

// Primera obra de anime de una saga que aún no has visto (si ya las viste todas, la primera)
export const siguienteSinVer = (sagaId: string, vistas: Vistas) => {
  const anime = animeDeSagas(sagaId);
  return anime.find((o) => !vistas.has(o.id)) ?? anime[0];
};

// Novelas, juegos y demás obras de una saga que no son anime
export const otrasObrasDeSaga = (sagaId: string) => obrasDeSaga(sagaId).filter((o) => !esAnime(o));

// Siguiente obra del orden recomendado que aún no has visto (undefined si ya lo viste todo)
export const siguienteRecomendada = (vistas: Vistas) => {
  const id = recomendado.flatMap((p) => p.obras).find((id) => !vistas.has(id));
  return id ? obra(id) : undefined;
};

// Progreso de todo el anime del catálogo
export const progresoTotal = (vistas: Vistas) => {
  const anime = catalogo.obras.filter(esAnime);
  return { vistas: anime.filter((o) => vistas.has(o.id)).length, total: anime.length };
};

// "Terminada", "Pendiente" o "2 de 4"
export const estadoProgreso = ({ vistas, total }: { vistas: number; total: number }) => {
  if (total > 0 && vistas >= total) return "Terminada";
  if (vistas === 0) return "Pendiente";
  return `${vistas} de ${total}`;
};
