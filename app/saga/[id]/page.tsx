import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabeceraSaga } from "@/components/saga/CabeceraSaga";
import { RejillaObras } from "@/components/saga/RejillaObras";
import { animeDeSagas, catalogo, otrasObrasDeSaga } from "@/lib/catalogo";
import { obrasConDescarga } from "@/lib/descargas";
import { leerMiProgreso } from "@/lib/progreso-servidor";

// Una página por saga: /saga/stay-night, /saga/grand-order...
export function generateStaticParams() {
  return catalogo.sagas.map((s) => ({ id: s.id }));
}

type Props = { params: Promise<{ id: string }> };

const buscar = (id: string) => catalogo.sagas.find((s) => s.id === id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = buscar((await params).id);
  return { title: s ? `${s.titulo} · AKASHA` : "AKASHA" };
}

export default async function PaginaSaga({ params }: Props) {
  const s = buscar((await params).id);
  if (!s) notFound();

  const [{ sesion, vistas }, conDescarga] = await Promise.all([leerMiProgreso(), obrasConDescarga()]);
  const anime = animeDeSagas(s.id);
  const otras = otrasObrasDeSaga(s.id);

  return (
    <main>
      <CabeceraSaga saga={s} vistas={vistas} sesion={sesion} />
      {anime.length > 0 && <RejillaObras titulo="Anime, en orden de visionado" obras={anime} vistas={vistas} conDescarga={conDescarga} />}
      {otras.length > 0 && <RejillaObras titulo="Juegos y novelas" obras={otras} vistas={vistas} conDescarga={conDescarga} />}
    </main>
  );
}
