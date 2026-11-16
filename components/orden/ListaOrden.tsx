import Image from "next/image";
import Link from "next/link";
import { obra, type Orden } from "@/lib/catalogo";
import styles from "./ListaOrden.module.css";

// Una lista de visionado: pasos numerados con sus obras.
// "conDescarga": ids de las obras con enlace (lib/descargas.ts → obrasConDescarga)
export function ListaOrden({ orden, conDescarga }: { orden: Orden; conDescarga: ReadonlySet<string> }) {
  if (orden.pendiente) {
    return (
      <div className={styles.pendiente}>
        <p className="meta"><span className="lenticular">PRÓXIMAMENTE</span></p>
        <p>{orden.descripcion}</p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.descripcion}>{orden.descripcion}</p>
      <ol className={styles.lista}>
        {orden.pasos.map((p) => (
          <li key={p.paso} className={styles.paso}>
            <span className={styles.numero}>{p.paso}</span>
            <div className={styles.texto}>
              <h2 className={styles.titulo}>{p.titulo}</h2>
              <p className="meta">
                {p.detalle}
                {!p.obras.some((id) => conDescarga.has(id)) && <> · <span className="lenticular">DESCARGA PRÓXIMAMENTE</span></>}
              </p>
              <ul className={styles.obras}>
                {p.obras.map(obra).map((o) => (
                  <li key={o.id}>
                    <Link href={`/obra/${o.id}`} className={styles.obra} title={o.titulo}>
                      <span className={styles.portada}>
                        <Image src={o.imagen} alt={o.titulo} fill sizes="96px" className={styles.img} />
                      </span>
                      <span className={styles.nombre}>{o.titulo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
