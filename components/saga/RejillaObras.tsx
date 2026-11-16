import { Tarjeta } from "@/components/catalogo/Tarjeta";
import type { Obra, Vistas } from "@/lib/catalogo";
import { tarjetaDeObra } from "@/lib/tarjetas";
import styles from "./RejillaObras.module.css";

// Todas las obras de una lista en rejilla (sin carrusel), con su tipo, año y si ya la viste
export function RejillaObras({ titulo, obras, vistas, conDescarga }: {
  titulo: string;
  obras: Obra[];
  vistas: Vistas;
  conDescarga: ReadonlySet<string>;
}) {
  return (
    <section className={styles.seccion}>
      <h2 className={styles.titulo}>{titulo}</h2>
      <ul className={styles.rejilla}>
        {obras.map((o) => (
          <li key={o.id}>
            <Tarjeta formato="poster" datos={tarjetaDeObra(o, conDescarga, vistas.has(o.id) ? `${o.anio} · Vista` : String(o.anio))} />
          </li>
        ))}
      </ul>
    </section>
  );
}
