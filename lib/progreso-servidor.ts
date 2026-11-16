// Solo para componentes de servidor (usa las cookies de la petición)
import { cache } from "react";
import { crearClienteServidor } from "@/lib/supabase/server";
import { idsVistos, type FilaProgreso } from "@/lib/progreso";

// Quién ha iniciado sesión y su perfil; una sola consulta por petición
export const leerMiSesion = cache(async () => {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, usuarioId: null, admin: false };
  const { data } = await supabase.from("perfiles").select("rol").eq("id", user.id).maybeSingle();
  return { supabase, usuarioId: user.id, admin: data?.rol === "admin" };
});

export type MiProgreso = {
  sesion: boolean;
  filas: FilaProgreso[];
  vistas: ReadonlySet<string>;
  error: boolean; // la sesión existe pero no se pudo leer la tabla
};

const VACIO: MiProgreso = { sesion: false, filas: [], vistas: new Set(), error: false };

export const leerMiProgreso = cache(async (): Promise<MiProgreso> => {
  const { supabase, usuarioId } = await leerMiSesion();
  if (!usuarioId) return VACIO;

  const { data, error } = await supabase
    .from("progreso")
    .select("obra_id, estado, episodios_vistos, actualizado_en")
    .eq("usuario_id", usuarioId)
    .order("actualizado_en", { ascending: false });

  if (error) return { ...VACIO, sesion: true, error: true };
  const filas = (data ?? []) as FilaProgreso[];
  return { sesion: true, filas, vistas: idsVistos(filas), error: false };
});
