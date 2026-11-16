"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { CAMPOS_SIN_RESPUESTAS, MAX, haceCuanto, type Comentario } from "@/lib/comentarios";
import styles from "./Comentarios.module.css";

type Props = {
  comentario: Comentario;
  esMio: boolean;
  puedeBorrar: boolean;
  numRespuestas: number; // para avisar al borrar un principal
  responder: (() => void) | "entrar" | null; // "entrar": sin sesión, lleva a /entrar
  alCambiar: (c: Comentario) => void;
  alBorrar: () => void;
  reacciones?: ReactNode; // botón de reacciones, al principio de la fila de acciones
};

export function ItemComentario({ comentario: c, esMio, puedeBorrar, numRespuestas, responder, alCambiar, alBorrar, reacciones }: Props) {
  const [visible, setVisible] = useState(!c.spoiler);
  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false); // pidiendo confirmación
  const [texto, setTexto] = useState(c.texto);
  const [spoiler, setSpoiler] = useState(c.spoiler);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombre = c.perfiles?.nombre ?? "Usuario";
  const limpio = texto.trim();

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!limpio || limpio.length > MAX) return;
    setOcupado(true);
    setError(null);
    try {
      const { data, error } = await crearClienteNavegador()
        .from("comentarios")
        .update({ texto: limpio, spoiler, editado_en: new Date().toISOString() })
        .eq("id", c.id)
        .select(CAMPOS_SIN_RESPUESTAS) // respuesta_a no cambia al editar
        .single();
      if (error) throw error;
      alCambiar(data as unknown as Comentario);
      setEditando(false);
      setVisible(true);
    } catch {
      setError("No se pudo guardar el cambio. Inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  async function borrar() {
    setOcupado(true);
    setError(null);
    try {
      // .select() para saber si de verdad se borró (RLS no da error, solo no borra)
      const { data, error } = await crearClienteNavegador().from("comentarios").delete().eq("id", c.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("sin permiso");
      alBorrar();
    } catch {
      setError("No se pudo borrar el comentario.");
      setOcupado(false);
    }
  }

  return (
    <article className={styles.comentario}>
      <span className={styles.avatar} aria-hidden="true">{nombre.charAt(0).toUpperCase()}</span>
      <div className={styles.cuerpo}>
        <div className={styles.cabecera}>
          <span className={styles.autor}>{nombre}</span>
          <time className={styles.fecha} dateTime={c.creado_en} title={new Date(c.creado_en).toLocaleString("es-ES")}>
            {haceCuanto(c.creado_en)}
          </time>
          {c.editado_en && <span className={styles.fecha}>(editado)</span>}
          {c.spoiler && <span className={`meta ${styles.etiquetaSpoiler}`}>Spoiler</span>}
        </div>

        {editando ? (
          <form className={styles.formulario} onSubmit={guardar}>
            <textarea className={styles.textarea} value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} aria-label="Editar comentario" aria-invalid={limpio.length > MAX} />
            <div className={styles.barra}>
              <label className={styles.casilla}>
                <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
                Contiene spoilers
              </label>
              <span className={`${styles.contador} ${limpio.length > MAX ? styles.pasado : ""}`}>{limpio.length}/{MAX}</span>
              <button type="button" className={styles.accion} onClick={() => { setEditando(false); setTexto(c.texto); setSpoiler(c.spoiler); setError(null); }}>
                Cancelar
              </button>
              <button className={`btn btn-secondary ${styles.publicar}`} disabled={ocupado || !limpio || limpio.length > MAX}>
                {ocupado ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        ) : visible ? (
          <p className={styles.texto}>{c.texto}</p>
        ) : (
          <div className={styles.oculto}>
            <p className={`${styles.texto} ${styles.difuminado}`} aria-hidden="true">{c.texto}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setVisible(true)}>Mostrar spoiler</button>
          </div>
        )}

        {!editando && (
          <div className={styles.acciones}>
            {borrando ? (
              <>
                <span className={styles.pregunta}>
                  ¿Borrar este comentario?
                  {numRespuestas > 0 && ` Se borrarán también sus ${numRespuestas} ${numRespuestas === 1 ? "respuesta" : "respuestas"}.`}
                </span>
                <button type="button" className={`${styles.accion} ${styles.peligro}`} onClick={borrar} disabled={ocupado}>
                  {ocupado ? "Borrando…" : "Sí, borrar"}
                </button>
                <button type="button" className={styles.accion} onClick={() => setBorrando(false)} disabled={ocupado}>Cancelar</button>
              </>
            ) : (
              <>
                {reacciones}
                {responder === "entrar" && <Link href="/entrar" className={styles.accion}>Responder</Link>}
                {typeof responder === "function" && (
                  <button type="button" className={styles.accion} onClick={responder}>Responder</button>
                )}
                {esMio && <button type="button" className={styles.accion} onClick={() => setEditando(true)}>Editar</button>}
                {puedeBorrar && <button type="button" className={styles.accion} onClick={() => setBorrando(true)}>Borrar</button>}
              </>
            )}
          </div>
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </article>
  );
}
