// Convierte una obra del catálogo en los datos que necesita una Tarjeta.
import type { DatosTarjeta } from "@/components/catalogo/Tarjeta";
import { nombreTipo, type Obra } from "@/lib/catalogo";

// "conDescarga": ids de las obras con enlace (lib/descargas.ts → obrasConDescarga)
export const tarjetaDeObra = (o: Obra, conDescarga: ReadonlySet<string>, detalle = String(o.anio)): DatosTarjeta => ({
  id: o.id,
  titulo: o.titulo,
  imagen: o.imagen,
  ruta: o.ruta,
  etiqueta: nombreTipo(o).toUpperCase(),
  detalle,
  href: `/obra/${o.id}`,
  resumen: {
    datos: [nombreTipo(o), o.anio, o.episodios && `${o.episodios} ep.`].filter(Boolean).join(" · "),
    sinopsis: o.sinopsis,
    descarga: conDescarga.has(o.id),
  },
});
