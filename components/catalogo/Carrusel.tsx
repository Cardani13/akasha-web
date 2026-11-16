"use client";

import { useRef } from "react";
import { Tarjeta, type DatosTarjeta } from "./Tarjeta";
import styles from "./Carrusel.module.css";

export type Fila = { titulo: string; formato: "poster" | "miniatura"; tarjetas: DatosTarjeta[]; id?: string };

export function Carrusel({ fila }: { fila: Fila }) {
  const pista = useRef<HTMLUListElement>(null);

  const mover = (dir: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alInicio = el.scrollLeft <= 1;
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    // Si ya no se puede avanzar hacia ese lado, la fila da un "tirón" y vuelve a su sitio
    if ((dir === 1 && alFinal) || (dir === -1 && alInicio)) {
      if (reduce) return;
      const clase = dir === 1 ? styles.tironDerecha : styles.tironIzquierda;
      el.classList.remove(styles.tironDerecha, styles.tironIzquierda);
      void el.offsetWidth; // reinicia la animación si se pulsa varias veces seguidas
      el.classList.add(clase);
      return;
    }
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className={styles.fila} id={fila.id} aria-label={fila.titulo}>
      <div className={styles.cabecera}>
        <h2 className={styles.titulo}>{fila.titulo}</h2>
      </div>
      <div className={`${styles.carril} ${styles[fila.formato]}`}>
        <button className={`${styles.flecha} ${styles.izquierda}`} onClick={() => mover(-1)} aria-label="Anterior">
          <span aria-hidden="true">‹</span>
        </button>
        <ul
          ref={pista}
          className={styles.pista}
          onAnimationEnd={(e) => e.currentTarget.classList.remove(styles.tironDerecha, styles.tironIzquierda)}
        >
          {fila.tarjetas.map((t) => (
            <li key={t.id}>
              <Tarjeta datos={t} formato={fila.formato} />
            </li>
          ))}
        </ul>
        <button className={`${styles.flecha} ${styles.derecha}`} onClick={() => mover(1)} aria-label="Siguiente">
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}
