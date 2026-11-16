import type { Ruta } from "@/lib/catalogo";
import styles from "./BarraProgreso.module.css";

// Barra fina de progreso, en el color de la ruta
export function BarraProgreso({ vistas, total, ruta }: { vistas: number; total: number; ruta: Ruta }) {
  const porcentaje = total > 0 ? Math.round((vistas / total) * 100) : 0;
  return (
    <div
      className={styles.barra}
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${vistas} de ${total} vistas`}
      style={{ "--ruta": `var(--ruta-${ruta})` } as React.CSSProperties}
    >
      <span style={{ width: `${porcentaje}%` }} />
    </div>
  );
}
