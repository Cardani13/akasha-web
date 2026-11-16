"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Obra } from "@/lib/catalogo";
import styles from "./Hero.module.css";

const DURACION = 7000; // milisegundos que se queda cada obra

// Banner grande de la portada: rota entre varias obras con un fundido.
// Se pausa con el cursor sobre el texto o los botones, si la pestaña no está visible o si el sistema pide reducir movimiento.
export function Hero({ obras, tipos }: { obras: Obra[]; tipos: Record<string, string> }) {
  const [actual, setActual] = useState(0);
  const [encima, setEncima] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [reducido, setReducido] = useState(false);
  const pausado = encima || oculta || reducido || obras.length < 2;

  useEffect(() => {
    setReducido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onVisible = () => setOculta(document.hidden);
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (pausado) return;
    const t = setTimeout(() => setActual((i) => (i + 1) % obras.length), DURACION);
    return () => clearTimeout(t);
  }, [actual, pausado, obras.length]);

  const obra = obras[actual];
  const ir = (paso: 1 | -1) => setActual((i) => (i + paso + obras.length) % obras.length);
  // Solo el texto y los botones pausan el banner (con el cursor o con el teclado); el resto de la imagen no
  const pausar = {
    onMouseEnter: () => setEncima(true), onMouseLeave: () => setEncima(false),
    onFocus: () => setEncima(true), onBlur: () => setEncima(false),
  };

  return (
    <section
      className={styles.hero}
      style={{ "--halo": `var(--ruta-${obra.ruta})` } as React.CSSProperties}
      aria-roledescription="carrusel"
      aria-label="Obras destacadas"
    >
      {obras.map((o, i) => (
        <div key={o.id} className={`${styles.arte} ${i === actual ? styles.visible : ""}`} aria-hidden="true">
          <Image src={o.imagen} alt="" fill priority={i === 0} sizes="(max-width: 760px) 100vw, 70vw" className={styles.img} />
        </div>
      ))}
      <div className={styles.degradado} aria-hidden="true" />

      {obras.length > 1 && (
        <>
          <button className={`${styles.flecha} ${styles.izquierda}`} onClick={() => ir(-1)} aria-label="Anterior">
            <span aria-hidden="true">‹</span>
          </button>
          <button className={`${styles.flecha} ${styles.derecha}`} onClick={() => ir(1)} aria-label="Siguiente">
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      <div className={styles.columna}>
        <div className={styles.contenidos} {...pausar}>
          {obras.map((o, i) => {
            const datos = [o.anio, o.episodios && `${o.episodios} episodios`, o.estudio].filter(Boolean);
            const activa = i === actual;
            return (
              <div key={o.id} className={`${styles.contenido} ${activa ? styles.visible : ""}`} aria-hidden={!activa} inert={!activa}>
                <p className="meta">
                  <span className="lenticular">{tipos[o.tipo].toUpperCase()}</span> · {datos.join(" · ")}
                </p>
                <h1 className={styles.titulo}>{o.titulo}</h1>
                <p className={styles.sinopsis}>{o.sinopsis}</p>
                <div className={styles.acciones}>
                  <a className="btn btn-primary" href={`/obra/${o.id}`}>
                    <span className="rombo" aria-hidden="true" /> Ver detalles
                  </a>
                  <a className="btn btn-secondary" href="/orden">Orden de visionado</a>
                </div>
              </div>
            );
          })}
        </div>

        {obras.length > 1 && (
          <div className={styles.indicadores} {...pausar}>
            {obras.map((o, i) => (
              <button
                key={o.id}
                className={`${styles.indicador} ${i === actual ? styles.activo : ""}`}
                onClick={() => setActual(i)}
                aria-label={`Mostrar ${o.titulo}`}
                aria-current={i === actual}
              >
                {/* La barra se llena mientras dura la obra; "key" la reinicia en cada cambio */}
                <span key={i === actual ? actual : "x"} style={{ animationDuration: `${DURACION}ms`, animationPlayState: pausado ? "paused" : "running" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
