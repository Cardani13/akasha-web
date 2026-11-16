import { Suspense } from "react";
import { Hero } from "@/components/catalogo/Hero";
import { AvisoUrl } from "@/components/ui/AvisoUrl";
import { Carrusel, type Fila } from "@/components/catalogo/Carrusel";
import {
  animeDeSagas, catalogo, estadoProgreso, obra, portadaDeSaga, progresoDeSaga, saga, siguienteSinVer, type Vistas,
} from "@/lib/catalogo";
import { obrasConDescarga } from "@/lib/descargas";
import { leerMiProgreso } from "@/lib/progreso-servidor";
import { tarjetaDeObra } from "@/lib/tarjetas";
import styles from "./page.module.css";

// ── Qué se muestra en la portada. Para cambiar una fila, cambia los ids de aquí. ──

// Obras que van rotando en el banner grande, en este orden
const DESTACADAS = ["ubw-2014", "zero", "hf-1", "fgo-babylonia", "apocrypha"];

const SAGAS_CON_PROGRESO = ["stay-night", "zero", "prisma-illya", "heavens-feel", "grand-order"];

const FILAS_DE_SAGAS = [
  { titulo: "Fate/stay night", sagas: ["stay-night", "heavens-feel"] },
  { titulo: "Guerras del Grial", sagas: ["zero", "apocrypha", "strange-fake", "prototype"] },
  { titulo: "Grand Order", sagas: ["grand-order"] },
  { titulo: "Spin-offs", sagas: ["el-melloi", "extra", "prisma-illya", "parodias"] },
];

// Fila "Tu progreso por saga": solo con sesión iniciada
const filaProgreso = (vistas: Vistas): Fila => ({
  titulo: "Tu progreso por saga",
  formato: "miniatura",
  id: "progreso",
  tarjetas: SAGAS_CON_PROGRESO.map((id) => {
    const s = saga(id);
    const progreso = progresoDeSaga(id, vistas);
    return { id, titulo: s.titulo, imagen: portadaDeSaga(id), ruta: s.ruta, detalle: estadoProgreso(progreso), progreso, href: `/obra/${siguienteSinVer(id, vistas).id}` };
  }),
});

// "conDescarga": ids de las obras con enlace, para el aviso "Con descarga" de las tarjetas
const filasFijas = (conDescarga: ReadonlySet<string>): Fila[] => [
  {
    titulo: "Empieza por aquí",
    formato: "poster",
    id: "orden",
    tarjetas: catalogo.ordenes.recomendado.pasos.map((p) => ({
      ...tarjetaDeObra(obra(p.obras[0]), conDescarga, `Paso ${p.paso}`),
      id: `paso-${p.paso}`,
      titulo: p.titulo,
    })),
  },
  ...FILAS_DE_SAGAS.map((f, i) => ({
    titulo: f.titulo,
    formato: "poster" as const,
    id: i === 0 ? "sagas" : undefined,
    tarjetas: animeDeSagas(...f.sagas).map((o) => tarjetaDeObra(o, conDescarga)),
  })),
];

export default async function Inicio() {
  const [{ sesion, vistas }, conDescarga] = await Promise.all([leerMiProgreso(), obrasConDescarga()]);
  const fijas = filasFijas(conDescarga);
  const filas = sesion ? [filaProgreso(vistas), ...fijas] : fijas;
  return (
    <main>
      <Suspense><AvisoUrl /></Suspense>
      <Hero obras={DESTACADAS.map(obra)} tipos={catalogo.tipos} />
      <div className={styles.filas}>
        {filas.map((fila) => (
          <Carrusel key={fila.titulo} fila={fila} />
        ))}
      </div>
    </main>
  );
}
