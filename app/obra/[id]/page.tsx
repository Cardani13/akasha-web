import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Comentarios } from "@/components/obra/Comentarios";
import { Ficha } from "@/components/obra/Ficha";
import { Carrusel } from "@/components/catalogo/Carrusel";
import { animeDeSagas, catalogo, saga } from "@/lib/catalogo";
import { leerDescargas } from "@/lib/descargas";
import { leerMiProgreso, leerMiSesion } from "@/lib/progreso-servidor";
import { tarjetaDeObra } from "@/lib/tarjetas";

// Una página por obra del catálogo: /obra/zero, /obra/ubw-2014...
export function generateStaticParams() {
  return catalogo.obras.map((o) => ({ id: o.id }));
}

type Props = { params: Promise<{ id: string }> };

const buscar = (id: string) => catalogo.obras.find((o) => o.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = buscar((await params).id);
  return { title: o ? `${o.titulo} · AKASHA` : "AKASHA" };
}

export default async function PaginaObra({ params }: Props) {
  const o = buscar((await params).id);
  if (!o) notFound();

  const [{ sesion, filas }, { usuarioId, admin }, descargas] = await Promise.all([
    leerMiProgreso(),
    leerMiSesion(),
    leerDescargas(),
  ]);
  const conDescarga = new Set(descargas.keys());
  const s = saga(o.saga);
  const resto = animeDeSagas(o.saga).filter((x) => x.id !== o.id);

  return (
    <main>
      <Ficha obra={o} sesion={sesion} mio={filas.find((f) => f.obra_id === o.id)} descargas={descargas.get(o.id) ?? []} />
      <Comentarios key={o.id} obraId={o.id} usuarioId={usuarioId} admin={admin} />
      {resto.length > 0 && (
        <Carrusel fila={{ titulo: `Más de ${s.titulo}`, formato: "poster", tarjetas: resto.map((x) => tarjetaDeObra(x, conDescarga)) }} />
      )}
    </main>
  );
}
