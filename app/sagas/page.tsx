import type { Metadata } from "next";
import { Tarjeta } from "@/components/catalogo/Tarjeta";
import { catalogo, estadoProgreso, obrasDeSaga, portadaDeSaga, progresoDeSaga } from "@/lib/catalogo";
import { leerMiProgreso } from "@/lib/progreso-servidor";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Sagas · AKASHA" };

// Todas las sagas de data/catalogo.json, en el mismo orden que allí
export default async function PaginaSagas() {
  const { sesion, vistas } = await leerMiProgreso();
  return (
    <main className={styles.pagina}>
      <header className={styles.cabecera}>
        <p className="meta"><span className="lenticular">SAGAS</span></p>
        <h1 className={styles.titulo}>Todo el Nasuverse</h1>
        <p className={styles.intro}>Cada saga con su anime, sus juegos y sus novelas. Entra en una para ver sus obras en orden.</p>
      </header>

      <ul className={styles.rejilla}>
        {catalogo.sagas.map((s) => {
          const progreso = progresoDeSaga(s.id, vistas);
          const n = obrasDeSaga(s.id).length;
          const obras = n === 1 ? "1 obra" : `${n} obras`;
          // Sin sesión no hay progreso que mostrar
          const detalle = progreso.total === 0 ? `${obras} · sin anime` : sesion ? `${obras} · ${estadoProgreso(progreso)}` : obras;
          return (
            <li key={s.id}>
              <Tarjeta
                formato="miniatura"
                datos={{
                  id: s.id,
                  titulo: s.titulo,
                  imagen: portadaDeSaga(s.id),
                  ruta: s.ruta,
                  detalle,
                  progreso: sesion && progreso.total > 0 ? progreso : undefined,
                  href: `/saga/${s.id}`,
                }}
              />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
