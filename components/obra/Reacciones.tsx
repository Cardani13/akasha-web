"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { REACCIONES, datosReaccion, type Reaccion, type TipoReaccion } from "@/lib/comentarios";
import styles from "./Reacciones.module.css";

type Props = {
  filas: Reaccion[]; // reacciones de este comentario
  usuarioId: string | null;
  alReaccionar: (tipo: TipoReaccion) => Promise<void>; // elegir la misma la quita
};

const ESPERA_ABRIR = 350; // ms con el ratón encima antes de abrir la barra
const ESPERA_CERRAR = 300;
const PULSACION_LARGA = 450;

// Botón "Me gusta" con barra de 6 reacciones y el recuento al lado
export function Reacciones({ filas, usuarioId, alReaccionar }: Props) {
  const [barra, setBarra] = useState(false);
  const [desglose, setDesglose] = useState(false);
  const [pedirSesion, setPedirSesion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const largaHecha = useRef(false); // la pulsación larga no cuenta también como clic
  const caja = useRef<HTMLDivElement>(null);

  const mia = filas.find((f) => f.usuario_id === usuarioId)?.tipo ?? null;
  const conteo = REACCIONES.map((r) => ({ ...r, n: filas.filter((f) => f.tipo === r.id).length }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n);
  const total = filas.length;

  const limpiar = () => { if (temporizador.current) clearTimeout(temporizador.current); };
  useEffect(() => limpiar, []);

  // Cerrar con un toque fuera o con Escape
  useEffect(() => {
    if (!barra && !desglose) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) { setBarra(false); setDesglose(false); }
    };
    const tecla = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") { setBarra(false); setDesglose(false); } };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("pointerdown", fuera); document.removeEventListener("keydown", tecla); };
  }, [barra, desglose]);

  async function elegir(tipo: TipoReaccion) {
    setBarra(false);
    if (!usuarioId) return setPedirSesion(true);
    setError(null);
    try {
      await alReaccionar(tipo);
    } catch (e) {
      // En desarrollo se añade el error real de Supabase para poder diagnosticarlo
      const detalle = process.env.NODE_ENV !== "production" && e && typeof e === "object"
        ? ` (${[(e as { code?: string }).code, (e as { message?: string }).message].filter(Boolean).join(": ")})`
        : "";
      setError(`No se pudo guardar tu reacción.${detalle}`);
    }
  }

  const programar = (abrir: boolean, ms: number) => {
    limpiar();
    temporizador.current = setTimeout(() => setBarra(abrir), ms);
  };

  function teclas(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      setBarra(true);
      // Foco en la primera reacción para moverse con Tab
      requestAnimationFrame(() => caja.current?.querySelector<HTMLButtonElement>("[data-reaccion]")?.focus());
    }
  }

  const actual = mia ? datosReaccion(mia) : null;

  return (
    <div
      ref={caja}
      className={styles.caja}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") programar(true, ESPERA_ABRIR); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") programar(false, ESPERA_CERRAR); }}
    >
      {barra && (
        <div className={styles.barra} role="menu" aria-label="Elegir reacción">
          {REACCIONES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="menuitemradio"
              aria-checked={mia === r.id}
              data-reaccion
              className={`${styles.emoji} ${mia === r.id ? styles.elegido : ""}`}
              aria-label={r.nombre}
              title={r.nombre}
              onClick={() => elegir(r.id)}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={styles.principal}
        style={actual ? { color: actual.color } : undefined}
        aria-haspopup="menu"
        aria-expanded={barra}
        title="Mantén pulsado o usa ↑ para elegir otra reacción"
        onKeyDown={teclas}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          largaHecha.current = false;
          limpiar();
          temporizador.current = setTimeout(() => { largaHecha.current = true; setBarra(true); }, PULSACION_LARGA);
        }}
        onPointerUp={(e) => { if (e.pointerType !== "mouse") limpiar(); }}
        onPointerLeave={(e) => { if (e.pointerType !== "mouse") limpiar(); }}
        onContextMenu={(e) => { if (largaHecha.current) e.preventDefault(); }}
        onClick={() => {
          if (largaHecha.current) { largaHecha.current = false; return; }
          // Clic normal: pone o quita la reacción actual (por defecto Me gusta)
          elegir(mia ?? "me_gusta");
        }}
      >
        {actual ? (
          <><span className={styles.icono} aria-hidden="true">{actual.emoji}</span>{actual.nombre}</>
        ) : (
          <>
            <svg className={styles.pulgar} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M7 10v11H3V10h4Zm0 0 4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7" strokeLinejoin="round" />
            </svg>
            Me gusta
          </>
        )}
      </button>

      {total > 0 && (
        <button
          type="button"
          className={styles.resumen}
          aria-expanded={desglose}
          aria-label={`${total} ${total === 1 ? "reacción" : "reacciones"}: ${conteo.map((c) => `${c.n} ${c.nombre}`).join(", ")}`}
          title={conteo.map((c) => `${c.emoji} ${c.nombre}: ${c.n}`).join("\n")}
          onClick={() => setDesglose(!desglose)}
        >
          <span>{total}</span>
          <span className={styles.pila} aria-hidden="true">
            {conteo.slice(0, 3).map((c) => <span key={c.id}>{c.emoji}</span>)}
          </span>
        </button>
      )}

      {desglose && total > 0 && (
        <ul className={styles.desglose}>
          {conteo.map((c) => (
            <li key={c.id}><span aria-hidden="true">{c.emoji}</span> {c.nombre} <strong>{c.n}</strong></li>
          ))}
        </ul>
      )}

      {pedirSesion && (
        <p className={styles.aviso}>
          <Link href="/entrar">Inicia sesión para reaccionar</Link>
        </p>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
