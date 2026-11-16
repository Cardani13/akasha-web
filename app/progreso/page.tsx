import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Desplegable } from "@/components/progreso/Desplegable";
import { BarraProgreso } from "@/components/ui/BarraProgreso";
import {
  catalogo, estadoProgreso, nombreTipo, pasoDeObra, portadaDeSaga, progresoDeSaga, progresoTotal, siguienteRecomendada, siguienteSinVer,
} from "@/lib/catalogo";
import { ESTADOS } from "@/lib/progreso";
import { leerMiProgreso } from "@/lib/progreso-servidor";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Mi progreso · AKASHA" };

const porId = new Map(catalogo.obras.map((o) => [o.id, o]));

// Lo que llevas visto, leído de la tabla "progreso" de Supabase
export default async function PaginaProgreso() {
  const { sesion, filas, vistas, error } = await leerMiProgreso();

  if (!sesion) {
    return (
      <main className={styles.pagina}>
        <header className={styles.cabecera}>
          <p className="meta"><span className="lenticular">MI PROGRESO</span></p>
          <h1 className={styles.titulo}>Lleva la cuenta de lo que ves</h1>
          <p className={styles.intro}>
            Entra con tu cuenta para marcar cada obra como pendiente, viendo, vista o abandonada, y retomar cada saga donde la dejaste.
          </p>
          <div className="botones">
            <Link href="/entrar" className="btn btn-primary"><span className="rombo" aria-hidden="true" />Entrar</Link>
            <Link href="/registro" className="btn btn-secondary">Crear cuenta</Link>
          </div>
        </header>
      </main>
    );
  }

  const total = progresoTotal(vistas);
  const siguiente = siguienteRecomendada(vistas);
  const paso = siguiente && pasoDeObra(siguiente.id);
  const sagas = catalogo.sagas
    .map((s) => ({ s, progreso: progresoDeSaga(s.id, vistas) }))
    .filter(({ progreso }) => progreso.total > 0);
  const terminadas = sagas.filter(({ progreso }) => progreso.vistas >= progreso.total).length;
  // Las filas cuya obra ya no está en el catálogo se ignoran
  const grupos = ESTADOS.map((e) => ({
    ...e,
    obras: filas.filter((f) => f.estado === e.id && porId.has(f.obra_id)).map((f) => ({ fila: f, obra: porId.get(f.obra_id)! })),
  })).filter((g) => g.obras.length > 0);

  return (
    <main className={styles.pagina}>
      <header className={styles.cabecera}>
        <p className="meta"><span className="lenticular">MI PROGRESO</span></p>
        <h1 className={styles.titulo}>Lo que llevas visto</h1>
        <p className={styles.intro}>Marca cada obra desde su ficha con Pendiente, Viendo, Visto o Abandonado.</p>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          No se pudo cargar tu progreso. Revisa tu conexión y recarga la página.
        </p>
      )}

      <dl className={styles.resumen}>
        <div><dt className="meta">Anime visto</dt><dd>{total.vistas} de {total.total}</dd></div>
        <div><dt className="meta">Sagas terminadas</dt><dd>{terminadas} de {sagas.length}</dd></div>
        <div><dt className="meta">Orden recomendado</dt><dd>{paso ? `Paso ${paso.paso} de ${catalogo.ordenes.recomendado.pasos.length}` : "Completo"}</dd></div>
      </dl>

      {siguiente && (
        <Link href={`/obra/${siguiente.id}`} className={styles.siguiente}>
          <span className={styles.siguientePortada}>
            <Image src={siguiente.imagen} alt="" fill sizes="96px" className={styles.img} />
          </span>
          <span className={styles.siguienteTexto}>
            <span className="meta"><span className="lenticular">TE TOCA</span>{paso && ` · Paso ${paso.paso} del orden recomendado`}</span>
            <span className={styles.siguienteTitulo}>{siguiente.titulo}</span>
          </span>
        </Link>
      )}

      <h2 className={styles.subtitulo}>Tus obras</h2>
      {grupos.length === 0 && !error ? (
        <p className={styles.vacio}>
          Aún no has marcado ninguna obra. Abre cualquier ficha, por ejemplo{" "}
          <Link href={`/obra/${siguiente?.id ?? catalogo.obras[0].id}`} className={styles.enlace}>{siguiente?.titulo ?? catalogo.obras[0].titulo}</Link>, y elige su estado.
        </p>
      ) : (
        <div className={styles.grupos}>
          {grupos.map((g) => (
            // Visto y Abandonado empiezan plegados para que no ocupen la página
            <Desplegable
              key={g.id}
              id={g.id}
              className={styles.grupo}
              abierto={g.id === "viendo" || g.id === "pendiente"}
              resumen={
                <summary className={styles.grupoTitulo}>
                  <span className="lenticular">{g.nombre.toUpperCase()}</span>
                  <span className={styles.cuenta}>{g.obras.length}</span>
                  <svg className={styles.flecha} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M3 4.5 6 7.5l3-3" />
                  </svg>
                </summary>
              }
            >
              <ul className={styles.obras}>
                {g.obras.map(({ fila, obra }) => (
                  <li key={obra.id}>
                    <Link href={`/obra/${obra.id}`} className={styles.obra} title={obra.titulo}>
                      <span className={styles.obraPortada}>
                        <Image src={obra.imagen} alt="" fill sizes="120px" className={styles.img} />
                      </span>
                      <span className={styles.obraTitulo}>{obra.titulo}</span>
                      <span className={styles.obraDetalle}>
                        {nombreTipo(obra)} · {obra.anio}
                        {fila.episodios_vistos != null && g.id !== "visto" && <><br />{fila.episodios_vistos}{obra.episodios ? ` de ${obra.episodios}` : ""} ep.</>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Desplegable>
          ))}
        </div>
      )}

      <h2 className={styles.subtitulo}>Por saga</h2>
      <ul className={styles.lista}>
        {sagas.map(({ s, progreso }) => {
          const terminada = progreso.vistas >= progreso.total;
          const proxima = siguienteSinVer(s.id, vistas);
          return (
            <li key={s.id} className={styles.saga}>
              <Link href={`/saga/${s.id}`} className={styles.miniatura} aria-label={s.titulo}>
                <Image src={portadaDeSaga(s.id)} alt="" fill sizes="160px" className={styles.img} />
              </Link>
              <div className={styles.datos}>
                <div className={styles.fila}>
                  <Link href={`/saga/${s.id}`} className={styles.nombre}>{s.titulo}</Link>
                  <span className="meta">{estadoProgreso(progreso)}</span>
                </div>
                <BarraProgreso {...progreso} ruta={s.ruta} />
                {!terminada && (
                  <Link href={`/obra/${proxima.id}`} className={styles.proxima}>
                    Siguiente: {proxima.titulo} ›
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
