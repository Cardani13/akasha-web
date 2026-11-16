import Image from "next/image";
import type { Ruta } from "@/lib/catalogo";
import styles from "./Tarjeta.module.css";

export type DatosTarjeta = {
  id: string;
  titulo: string;
  imagen: string;
  ruta: Ruta;
  etiqueta?: string; // texto dentro de los corchetes lenticulares
  detalle: string; // texto pequeño bajo el título
  progreso?: { vistas: number; total: number }; // barra de progreso (solo miniaturas)
  href?: string;
  // Panel que aparece al pasar el cursor por la portada (solo pósteres)
  resumen?: { datos: string; sinopsis: string; descarga: boolean };
};

export function Tarjeta({ datos, formato }: { datos: DatosTarjeta; formato: "poster" | "miniatura" }) {
  const { titulo, imagen, ruta, etiqueta, detalle, progreso, href = "#", resumen } = datos;
  const porcentaje = progreso && progreso.total > 0 ? Math.round((progreso.vistas / progreso.total) * 100) : 0;

  return (
    <a href={href} className={`${styles.tarjeta} ${styles[formato]}`} style={{ "--ruta": `var(--ruta-${ruta})` } as React.CSSProperties}>
      <div className={styles.marco}>
        <Image
          src={imagen}
          alt={titulo}
          fill
          sizes={formato === "poster" ? "220px" : "340px"}
          className={styles.img}
        />
        {progreso && (
          <div className={styles.barra} aria-hidden="true">
            <span style={{ width: `${porcentaje}%` }} />
          </div>
        )}
        {resumen && formato === "poster" && (
          <div className={styles.resumen} aria-hidden="true">
            <p className={styles.resumenTitulo}>{titulo}</p>
            <p className="meta">{resumen.datos}</p>
            <p className={styles.sinopsis}>{resumen.sinopsis}</p>
            <p className={styles.acciones}>
              <span>Ver ficha ›</span>
              {resumen.descarga && <span className={styles.descarga}>Con descarga</span>}
            </p>
          </div>
        )}
      </div>
      <div className={styles.texto}>
        <p className={styles.nombre}>{titulo}</p>
        <p className="meta">
          {etiqueta && <><span className="lenticular">{etiqueta}</span> · </>}
          {detalle}
        </p>
      </div>
    </a>
  );
}
