import type { Metadata } from "next";
import { Pestanas } from "@/components/orden/Pestanas";
import { ListaOrden } from "@/components/orden/ListaOrden";
import { catalogo, type IdOrden } from "@/lib/catalogo";
import { obrasConDescarga } from "@/lib/descargas";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Orden de visionado · AKASHA" };

// Pestañas que se muestran, en este orden (las listas están en data/catalogo.json → "ordenes")
const PESTANAS: IdOrden[] = ["recomendado", "principal", "extras", "universo"];

export default async function PaginaOrden() {
  const conDescarga = await obrasConDescarga();
  return (
    <main className={styles.pagina}>
      <header className={styles.cabecera}>
        <p className="meta"><span className="lenticular">ORDEN DE VISIONADO</span></p>
        <h1 className={styles.titulo}>¿Por dónde empiezo?</h1>
        <p className={styles.intro}>Cuatro formas de recorrer Fate. Si es tu primera vez, sigue el orden recomendado.</p>
      </header>

      <Pestanas
        pestanas={PESTANAS.map((id) => ({
          id,
          titulo: catalogo.ordenes[id].titulo,
          pendiente: catalogo.ordenes[id].pendiente,
          contenido: <ListaOrden orden={catalogo.ordenes[id]} conDescarga={conDescarga} />,
        }))}
      />
    </main>
  );
}
