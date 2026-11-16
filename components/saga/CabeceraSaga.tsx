import Image from "next/image";
import Link from "next/link";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import {
  catalogo, estadoProgreso, obrasDeSaga, portadaDeSaga, progresoDeSaga, siguienteSinVer, type SagaCatalogo, type Vistas,
} from "@/lib/catalogo";
import styles from "./CabeceraSaga.module.css";

// Texto del botón según lo que lleves visto
const boton = ({ vistas, total }: { vistas: number; total: number }) =>
  vistas === 0 ? "Empezar" : vistas >= total ? "Volver a ver" : "Continuar";

// Banner de la página de una saga: portada de fondo, descripción, progreso y "Continuar"
// Sin sesión no hay barra de progreso, solo el botón "Empezar"
export function CabeceraSaga({ saga, vistas, sesion }: { saga: SagaCatalogo; vistas: Vistas; sesion: boolean }) {
  const progreso = progresoDeSaga(saga.id, vistas);
  const siguiente = progreso.total > 0 ? siguienteSinVer(saga.id, vistas) : undefined;
  const linea = catalogo.lineas[obrasDeSaga(saga.id)[0].linea];

  return (
    <section className={styles.cabecera} style={{ "--halo": `var(--ruta-${saga.ruta})` } as React.CSSProperties}>
      <div className={styles.fondo} aria-hidden="true">
        <Image src={portadaDeSaga(saga.id)} alt="" fill priority sizes="100vw" className={styles.fondoImg} />
      </div>

      <div className={styles.contenido}>
        <p className="meta">
          <Link href="/sagas" className={styles.volver}>Sagas</Link> · <span className="lenticular">SAGA</span>
        </p>
        <h1 className={styles.titulo}>{saga.titulo}</h1>
        <p className={styles.descripcion}>{saga.descripcion}</p>
        {linea && <p className={styles.linea}>{linea}</p>}

        {sesion && progreso.total > 0 && (
          <div className={styles.progreso}>
            <p className="meta">Tu progreso · {estadoProgreso(progreso)}</p>
            <BarraProgreso {...progreso} ruta={saga.ruta} />
          </div>
        )}

        {siguiente && (
          <div>
            <Link href={`/obra/${siguiente.id}`} className="btn btn-primary">
              <span className="rombo" aria-hidden="true" />
              {boton(progreso)}: {siguiente.titulo}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
