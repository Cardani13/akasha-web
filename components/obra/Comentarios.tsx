"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import {
  CAMPOS, CAMPOS_SIN_RESPUESTAS, ENFRIAMIENTO, POR_PAGINA, RESPUESTAS_VISIBLES, esEsperaDelServidor,
  type Comentario, type Reaccion, type TipoReaccion,
} from "@/lib/comentarios";
import { FormComentario } from "./FormComentario";
import { ItemComentario } from "./ItemComentario";
import { Reacciones } from "./Reacciones";
import styles from "./Comentarios.module.css";

type Props = { obraId: string; usuarioId: string | null; admin: boolean };

export function Comentarios({ obraId, usuarioId, admin }: Props) {
  const [principales, setPrincipales] = useState<Comentario[]>([]);
  const [respuestas, setRespuestas] = useState<Comentario[]>([]);
  const [total, setTotal] = useState<number | null>(null); // principales + respuestas
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [sinRespuestas, setSinRespuestas] = useState(false); // falta el SQL de respuestas en Supabase
  const [espera, setEspera] = useState(0); // enfriamiento compartido por todos los cuadros
  const [reacciones, setReacciones] = useState<Reaccion[]>([]);
  const [errorReacciones, setErrorReacciones] = useState(false);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const cargar = useCallback(async (desde: number) => {
    setCargando(true);
    setErrorCarga(null);
    const supabase = crearClienteNavegador();
    try {
      // Se pide uno de más para saber si hay otra página
      const pedir = (campos: string, conFiltro: boolean) => {
        let q = supabase.from("comentarios").select(campos).eq("obra_id", obraId);
        if (conFiltro) q = q.is("respuesta_a", null);
        return q.order("creado_en", { ascending: false }).order("id", { ascending: false }).range(desde, desde + POR_PAGINA);
      };
      let sinCol = false;
      let res = await pedir(CAMPOS, true);
      if (res.error) {
        // Sin la columna respuesta_a todavía: modo antiguo, sin respuestas
        res = await pedir(CAMPOS_SIN_RESPUESTAS, false);
        sinCol = true;
      }
      if (res.error) throw res.error;
      setSinRespuestas(sinCol);

      const filas = ((res.data ?? []) as unknown as Comentario[]).map((c) => ({ ...c, respuesta_a: c.respuesta_a ?? null }));
      setHayMas(filas.length > POR_PAGINA);
      const nuevas = filas.slice(0, POR_PAGINA);

      // Respuestas de los principales de esta página, de más antigua a más nueva
      let hijas: Comentario[] = [];
      if (!sinCol && nuevas.length) {
        const r = await supabase
          .from("comentarios")
          .select(CAMPOS)
          .in("respuesta_a", nuevas.map((c) => c.id))
          .order("creado_en", { ascending: true })
          .order("id", { ascending: true });
        if (r.error) throw r.error;
        hijas = (r.data ?? []) as unknown as Comentario[];
      }

      if (desde === 0) {
        const { count } = await supabase.from("comentarios").select("id", { count: "exact", head: true }).eq("obra_id", obraId);
        setTotal(count ?? null);
      }

      // Reacciones de todo lo que se acaba de cargar, en una sola consulta
      const ids = [...nuevas, ...hijas].map((c) => c.id);
      let nuevasReacciones: Reaccion[] = [];
      if (desde === 0) setErrorReacciones(false);
      if (ids.length) {
        const r = await supabase.from("reacciones").select("comentario_id, usuario_id, tipo").in("comentario_id", ids);
        if (r.error) setErrorReacciones(true); // sin la tabla o sin red: los comentarios se ven igual
        else nuevasReacciones = (r.data ?? []) as Reaccion[];
      }
      setReacciones((prev) => {
        const base = desde === 0 ? [] : prev.filter((x) => !ids.includes(x.comentario_id));
        return [...base, ...nuevasReacciones];
      });

      const unir = (base: Comentario[], extra: Comentario[]) => {
        const ids = new Set(base.map((c) => c.id));
        return [...base, ...extra.filter((c) => !ids.has(c.id))];
      };
      setPrincipales((prev) => unir(desde === 0 ? [] : prev, nuevas));
      setRespuestas((prev) => unir(desde === 0 ? [] : prev, hijas));
    } catch {
      setErrorCarga("No se pudieron cargar los comentarios.");
    } finally {
      setCargando(false);
    }
  }, [obraId]);

  useEffect(() => { cargar(0); }, [cargar]);

  // Inserta un comentario o respuesta; si falla lanza el error para que el cuadro lo muestre
  async function publicar(texto: string, spoiler: boolean, respuestaA: number | null) {
    const supabase = crearClienteNavegador();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Tu sesión ha caducado. Vuelve a entrar.");
    const fila = { obra_id: obraId, usuario_id: user.id, texto, spoiler, ...(respuestaA ? { respuesta_a: respuestaA } : {}) };
    const { data, error } = await supabase
      .from("comentarios")
      .insert(fila)
      .select(sinRespuestas ? CAMPOS_SIN_RESPUESTAS : CAMPOS)
      .single();
    if (error) {
      if (esEsperaDelServidor(error)) setEspera(ENFRIAMIENTO);
      throw error;
    }
    setEspera(ENFRIAMIENTO);
    setTotal((t) => (t ?? 0) + 1);
    const creado = data as unknown as Comentario;
    const nuevo = { ...creado, respuesta_a: creado.respuesta_a ?? null };
    if (respuestaA) setRespuestas((prev) => [...prev, nuevo]);
    else setPrincipales((prev) => [nuevo, ...prev]);
  }

  // Pone, cambia o quita (si es la misma) la reacción; optimista, y vuelve atrás si falla
  async function reaccionar(comentarioId: number, tipo: TipoReaccion) {
    if (!usuarioId) return;
    const anterior = reacciones.find((r) => r.comentario_id === comentarioId && r.usuario_id === usuarioId) ?? null;
    const quitar = anterior?.tipo === tipo;
    const sinLaMia = (prev: Reaccion[]) => prev.filter((r) => !(r.comentario_id === comentarioId && r.usuario_id === usuarioId));
    setReacciones((prev) => (quitar ? sinLaMia(prev) : [...sinLaMia(prev), { comentario_id: comentarioId, usuario_id: usuarioId, tipo }]));

    const supabase = crearClienteNavegador();
    // insert o update por separado (no upsert): en Supabase solo se permite cambiar la columna "tipo"
    const { error } = quitar
      ? await supabase.from("reacciones").delete().eq("comentario_id", comentarioId).eq("usuario_id", usuarioId)
      : anterior
        ? await supabase.from("reacciones").update({ tipo }).eq("comentario_id", comentarioId).eq("usuario_id", usuarioId)
        : await supabase.from("reacciones").insert({ comentario_id: comentarioId, usuario_id: usuarioId, tipo });
    if (error) {
      console.error("Error al guardar la reacción:", error);
      setReacciones((prev) => (anterior ? [...sinLaMia(prev), anterior] : sinLaMia(prev)));
      throw error;
    }
  }

  const cambiar = (nuevo: Comentario) => {
    const f = (prev: Comentario[]) => prev.map((x) => (x.id === nuevo.id ? { ...x, ...nuevo } : x));
    setPrincipales(f);
    setRespuestas(f);
  };

  return (
    <section className={styles.seccion} aria-labelledby="titulo-comentarios">
      <h2 id="titulo-comentarios" className={styles.titulo}>
        {total == null ? "Comentarios" : `${total} ${total === 1 ? "Comentario" : "Comentarios"}`}
      </h2>

      {usuarioId ? (
        <FormComentario
          id={`nuevo-${obraId}`}
          etiqueta="Escribe un comentario"
          placeholder="¿Qué te pareció esta obra?"
          boton="Publicar"
          espera={espera}
          alEnviar={(texto, spoiler) => publicar(texto, spoiler, null)}
        />
      ) : (
        <p className={styles.invitacion}>
          <Link href="/entrar" className={styles.enlace}>Inicia sesión para comentar</Link>
        </p>
      )}

      {errorCarga && (
        <p className={styles.error} role="alert">
          {errorCarga}{" "}
          <button type="button" className={styles.enlace} onClick={() => cargar(principales.length)}>Reintentar</button>
        </p>
      )}

      {errorReacciones && !errorCarga && (
        <p className={styles.vacio}>No se pudieron cargar las reacciones.</p>
      )}

      {!cargando && !errorCarga && principales.length === 0 && (
        <p className={styles.vacio}>Todavía no hay comentarios. ¿Qué te pareció?</p>
      )}

      <ul className={styles.lista}>
        {principales.map((c) => (
          <Hilo
            key={c.id}
            principal={c}
            respuestas={respuestas.filter((r) => r.respuesta_a === c.id)}
            usuarioId={usuarioId}
            admin={admin}
            permiteResponder={!sinRespuestas}
            espera={espera}
            reacciones={reacciones}
            alReaccionar={reaccionar}
            alResponder={(texto, spoiler) => publicar(texto, spoiler, c.id)}
            alCambiar={cambiar}
            alBorrar={(id, esPrincipal) => {
              if (esPrincipal) {
                const n = respuestas.filter((r) => r.respuesta_a === id).length;
                setPrincipales((prev) => prev.filter((x) => x.id !== id));
                setRespuestas((prev) => prev.filter((x) => x.respuesta_a !== id));
                setTotal((t) => (t == null ? t : t - 1 - n));
              } else {
                setRespuestas((prev) => prev.filter((x) => x.id !== id));
                setTotal((t) => (t == null ? t : t - 1));
              }
            }}
          />
        ))}
      </ul>

      {cargando && <p className={styles.vacio}>Cargando comentarios…</p>}
      {hayMas && !cargando && (
        <button type="button" className={`btn btn-secondary ${styles.verMas}`} onClick={() => cargar(principales.length)}>
          Ver más comentarios
        </button>
      )}
    </section>
  );
}

// Un comentario principal con sus respuestas debajo
function Hilo({ principal, respuestas, usuarioId, admin, permiteResponder, espera, reacciones, alReaccionar, alResponder, alCambiar, alBorrar }: {
  principal: Comentario;
  respuestas: Comentario[];
  usuarioId: string | null;
  admin: boolean;
  permiteResponder: boolean;
  espera: number;
  reacciones: Reaccion[];
  alReaccionar: (comentarioId: number, tipo: TipoReaccion) => Promise<void>;
  alResponder: (texto: string, spoiler: boolean) => Promise<void>;
  alCambiar: (c: Comentario) => void;
  alBorrar: (id: number, esPrincipal: boolean) => void;
}) {
  const [todas, setTodas] = useState(false);
  const [respondiendo, setRespondiendo] = useState<{ prefijo: string; clave: number } | null>(null);
  const visibles = todas ? respuestas : respuestas.slice(0, RESPUESTAS_VISIBLES);
  const ocultas = respuestas.length - visibles.length;

  // Responder a una respuesta crea otra respuesta en el mismo hilo, empezando por @Nombre
  const abrirRespuesta = (c: Comentario) =>
    setRespondiendo({ prefijo: c.respuesta_a ? `@${c.perfiles?.nombre ?? "Usuario"} ` : "", clave: Date.now() });

  const item = (c: Comentario) => (
    <ItemComentario
      comentario={c}
      esMio={c.usuario_id === usuarioId}
      puedeBorrar={c.usuario_id === usuarioId || admin}
      numRespuestas={c.respuesta_a ? 0 : respuestas.length}
      responder={permiteResponder ? (usuarioId ? () => abrirRespuesta(c) : "entrar") : null}
      alCambiar={alCambiar}
      alBorrar={() => alBorrar(c.id, !c.respuesta_a)}
      reacciones={
        <Reacciones
          filas={reacciones.filter((r) => r.comentario_id === c.id)}
          usuarioId={usuarioId}
          alReaccionar={(tipo) => alReaccionar(c.id, tipo)}
        />
      }
    />
  );

  return (
    <li className={styles.hilo}>
      {item(principal)}

      {(respuestas.length > 0 || respondiendo) && (
        <div className={styles.respuestas}>
          <ul className={styles.listaRespuestas}>
            {visibles.map((r) => <li key={r.id}>{item(r)}</li>)}
          </ul>

          {ocultas > 0 && (
            <button type="button" className={styles.verRespuestas} onClick={() => setTodas(true)}>
              <span aria-hidden="true">⊕</span> Ver más respuestas ({ocultas})
            </button>
          )}

          {respondiendo && (
            <FormComentario
              key={respondiendo.clave}
              id={`respuesta-${principal.id}`}
              etiqueta={`Responder a ${principal.perfiles?.nombre ?? "Usuario"}`}
              placeholder="Escribe tu respuesta…"
              boton="Responder"
              espera={espera}
              textoInicial={respondiendo.prefijo}
              compacto
              autoFocus
              alCancelar={() => setRespondiendo(null)}
              alEnviar={async (texto, spoiler) => {
                await alResponder(texto, spoiler);
                setRespondiendo(null);
                setTodas(true); // para que se vea la respuesta recién publicada
              }}
            />
          )}
        </div>
      )}
    </li>
  );
}
