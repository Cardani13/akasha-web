"use client";

import { useState } from "react";
import styles from "./Pestanas.module.css";

type Pestana = { id: string; titulo: string; pendiente?: boolean; contenido: React.ReactNode };

// Barra de pestañas: muestra solo el contenido de la pestaña elegida.
export function Pestanas({ pestanas }: { pestanas: Pestana[] }) {
  const [activa, setActiva] = useState(pestanas[0].id);

  return (
    <div>
      <div className={styles.barra} role="tablist">
        {pestanas.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={p.id === activa}
            className={p.id === activa ? styles.activa : undefined}
            onClick={() => setActiva(p.id)}
          >
            {p.titulo}
            {p.pendiente && <span className={styles.pronto}>Próximamente</span>}
          </button>
        ))}
      </div>
      {pestanas.map((p) => (
        <div key={p.id} role="tabpanel" hidden={p.id !== activa}>
          {p.contenido}
        </div>
      ))}
    </div>
  );
}
