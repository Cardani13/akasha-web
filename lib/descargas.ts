// Enlaces de descarga de cada obra (tabla "descargas" de Supabase). Solo para componentes de servidor.
// No están en data/catalogo.json para que no queden en el código. Para añadir uno, ver el README.
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// Un enlace de descarga. "etiqueta" solo hace falta si la obra tiene varios (Temporada 1, OVA...).
export type Enlace = { etiqueta: string | null; url: string };

// Cada cuántos segundos se vuelven a pedir a Supabase (un enlace nuevo tarda como mucho esto en salir)
const REFRESCO = 60;

// Lectura pública con la clave anon y sin sesión, así se comparte la caché entre todos los visitantes
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, init) => fetch(url, { ...init, next: { revalidate: REFRESCO } }) },
});

// Todas las descargas por id de obra, ya ordenadas; una sola consulta por petición.
// Si Supabase falla, la web sigue funcionando y las obras salen como "Próximamente".
export const leerDescargas = cache(async (): Promise<ReadonlyMap<string, Enlace[]>> => {
  const { data, error } = await supabase
    .from("descargas")
    .select("obra_id, etiqueta, url")
    .order("obra_id")
    .order("orden");
  if (error) console.error("No se pudieron leer las descargas:", error.message);
  const porObra = new Map<string, Enlace[]>();
  for (const { obra_id, etiqueta, url } of data ?? []) {
    porObra.set(obra_id, [...(porObra.get(obra_id) ?? []), { etiqueta, url }]);
  }
  return porObra;
});

// Ids de las obras que tienen al menos un enlace (para "Con descarga" en las tarjetas)
export const obrasConDescarga = async (): Promise<ReadonlySet<string>> => new Set((await leerDescargas()).keys());
