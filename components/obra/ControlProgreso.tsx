"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { ESTADOS, type EstadoObra } from "@/lib/progreso";
import styles from "./ControlProgreso.module.css";

type Props = {
  obraId: string;
  sesion: boolean;
  conEpisodios: boolean;
  totalEpisodios: number | null;
  inicial: { estado: EstadoObra; episodios: number | null } | null;
};

type Guardado = { estado: EstadoObra | null; episodios: number | null };

// Botones Pendiente / Viendo / Visto / Abandonado de la ficha de una obra.
// Volver a pulsar el estado activo quita la marca (borra la fila).
export function ControlProgreso({ obraId, sesion, conEpisodios, totalEpisodios, inicial }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoObra | null>(inicial?.estado ?? null);
  const [episodios, setEpisodios] = useState(inicial?.episodios != null ? String(inicial.episodios) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedirSesion, setPedirSesion] = useState(false);
  const [listo, setListo] = useState(false);
  const pendiente = useRef<Guardado | null>(null); // último guardado que falló, para "Reintentar"

  async function guardar(cambio: Guardado) {
    pendiente.current = cambio;
    setGuardando(true);
    setError(null);
    setListo(false);
    try {
      const supabase = crearClienteNavegador();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPedirSesion(true);
        return;
      }
      const { error } = cambio.estado
        ? await supabase.from("progreso").upsert(
            {
              usuario_id: user.id,
              obra_id: obraId,
              estado: cambio.estado,
              episodios_vistos: cambio.episodios,
              actualizado_en: new Date().toISOString(),
            },
            { onConflict: "usuario_id,obra_id" },
          )
        : await supabase.from("progreso").delete().eq("usuario_id", user.id).eq("obra_id", obraId);
      if (error) throw error;
      pendiente.current = null;
      setListo(true);
      router.refresh(); // actualiza el resto de la página ("Vista", barras de progreso)
    } catch {
      // Lo elegido se queda en pantalla; solo avisamos de que no se guardó
      setError("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const numeroEpisodios = (texto: string) => (texto.trim() === "" ? null : Number(texto));

  function pulsarEstado(e: EstadoObra) {
    if (!sesion) return setPedirSesion(true);
    const nuevo = e === estado ? null : e;
    let eps = numeroEpisodios(episodios);
    // Al marcar como visto una serie, se dan por vistos todos sus episodios
    if (nuevo === "visto" && conEpisodios && totalEpisodios) eps = totalEpisodios;
    if (!nuevo) eps = null;
    setEstado(nuevo);
    setEpisodios(eps == null ? "" : String(eps));
    guardar({ estado: nuevo, episodios: eps });
  }

  function guardarEpisodios(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!sesion) return setPedirSesion(true);
    const eps = numeroEpisodios(episodios);
    if (eps != null && (!Number.isInteger(eps) || eps < 0)) return setError("Escribe un número entero de episodios (0 o más).");
    if (eps != null && totalEpisodios && eps > totalEpisodios) return setError(`Esta serie tiene ${totalEpisodios} episodios.`);
    // Apuntar episodios sin estado la marca como "Viendo"
    const nuevo = estado ?? (eps != null ? "viendo" : null);
    setEstado(nuevo);
    guardar({ estado: nuevo, episodios: nuevo ? eps : null });
  }

  return (
    <div className={styles.control}>
      <p className="meta">Tu progreso</p>
      <div className={styles.estados} role="group" aria-label="Estado de la obra">
        {ESTADOS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`${styles.estado} ${estado === e.id ? styles.activo : ""}`}
            aria-pressed={estado === e.id}
            disabled={guardando}
            onClick={() => pulsarEstado(e.id)}
          >
            {e.nombre}
          </button>
        ))}
      </div>

      {conEpisodios && (
        <form className={styles.episodios} onSubmit={guardarEpisodios}>
          <label htmlFor={`eps-${obraId}`}>Episodios vistos</label>
          <input
            id={`eps-${obraId}`}
            className={styles.numero}
            type="number"
            inputMode="numeric"
            min={0}
            max={totalEpisodios ?? undefined}
            step={1}
            value={episodios}
            onChange={(e) => setEpisodios(e.target.value)}
            placeholder="0"
          />
          {totalEpisodios && <span className={styles.total}>de {totalEpisodios}</span>}
          <button className={styles.guardar} disabled={guardando}>Guardar</button>
        </form>
      )}

      <div aria-live="polite">
        {guardando && <p className={styles.estadoGuardado}>Guardando…</p>}
        {listo && !guardando && <p className={styles.estadoGuardado}>Guardado</p>}
        {pedirSesion && (
          <p className={styles.aviso}>
            Inicia sesión para guardar tu progreso. <Link href="/entrar" className={styles.enlace}>Entrar</Link>
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
            {pendiente.current && !guardando && (
              <button type="button" className={styles.enlace} onClick={() => pendiente.current && guardar(pendiente.current)}>
                Reintentar
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
