import Image from "next/image";
import Link from "next/link";
import { anteriorYSiguiente, nombreTipo, pasoDeObra, saga, type Obra } from "@/lib/catalogo";
import type { Enlace } from "@/lib/descargas";
import { tieneEpisodios, type FilaProgreso } from "@/lib/progreso";
import { ControlProgreso } from "./ControlProgreso";
import { Descarga } from "./Descarga";
import styles from "./Ficha.module.css";

// "2011-10-01" → "1 de octubre de 2011"
const fechaLarga = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// "mio": la fila de progreso de esta obra (undefined si no hay); "sesion": si hay alguien dentro;
// "descargas": sus enlaces de descarga (vacío si no tiene)
export function Ficha({ obra, mio, sesion, descargas }: { obra: Obra; mio?: FilaProgreso; sesion: boolean; descargas: Enlace[] }) {
  const paso = pasoDeObra(obra.id);
  const { anterior, siguiente } = anteriorYSiguiente(obra.id);
  const vista = mio?.estado === "visto";

  // Solo se muestran los datos que existen
  const datos = [
    { nombre: "Tipo", valor: nombreTipo(obra) },
    { nombre: "Estreno", valor: obra.fecha ? fechaLarga(obra.fecha) : obra.anio },
    { nombre: "Estudio", valor: obra.estudio },
    { nombre: "Episodios", valor: obra.episodios },
    { nombre: "Saga", valor: <Link href={`/saga/${obra.saga}`} className={styles.enlace}>{saga(obra.saga).titulo}</Link> },
    { nombre: "Cuándo ocurre", valor: obra.epoca },
  ].filter((d) => d.valor);

  return (
    <section className={styles.ficha} style={{ "--halo": `var(--ruta-${obra.ruta})` } as React.CSSProperties}>
      <div className={styles.fondo} aria-hidden="true">
        <Image src={obra.imagen} alt="" fill sizes="100vw" className={styles.fondoImg} />
      </div>

      <div className={styles.poster}>
        <Image src={obra.imagen} alt={obra.titulo} fill priority sizes="(max-width: 760px) 60vw, 320px" className={styles.posterImg} />
      </div>

      <div className={styles.contenido}>
        <p className="meta">
          <span className="lenticular">{nombreTipo(obra).toUpperCase()}</span>
          {paso && <> · Paso {paso.paso} del orden recomendado</>}
          {vista && <> · Vista</>}
        </p>
        <h1 className={styles.titulo}>{obra.titulo}</h1>
        {obra.tituloOriginal && obra.tituloOriginal !== obra.titulo && (
          <p className={styles.original}>{obra.tituloOriginal}</p>
        )}

        <p className={styles.sinopsis}>{obra.sinopsis}</p>
        {obra.nota && <p className={styles.nota}>{obra.nota}</p>}

        <dl className={styles.datos}>
          {datos.map((d) => (
            <div key={d.nombre}>
              <dt className="meta">{d.nombre}</dt>
              <dd>{d.valor}</dd>
            </div>
          ))}
        </dl>

        <ControlProgreso
          key={obra.id}
          obraId={obra.id}
          sesion={sesion}
          conEpisodios={tieneEpisodios(obra)}
          totalEpisodios={obra.episodios}
          inicial={mio ? { estado: mio.estado, episodios: mio.episodios_vistos } : null}
        />

        <Descarga obra={obra} enlaces={descargas} />

        {(anterior || siguiente) && (
          <nav className={styles.orden} aria-label="Orden de visionado">
            {anterior && (
              <Link href={`/obra/${anterior.id}`} className="btn btn-secondary">‹ Antes: {anterior.titulo}</Link>
            )}
            {siguiente && (
              <Link href={`/obra/${siguiente.id}`} className="btn btn-oro">Después: {siguiente.titulo} ›</Link>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
