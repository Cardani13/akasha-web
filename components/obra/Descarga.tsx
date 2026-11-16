import { pasoDeObra, type Obra } from "@/lib/catalogo";
import type { Enlace } from "@/lib/descargas";

// Botones de descarga de una obra.
// - Si tiene enlaces en la tabla "descargas" de Supabase, un botón por enlace.
// - Si está en el orden recomendado pero aún sin enlace, avisa de que falta.
// - Si no, "Próximamente".
export function Descarga({ obra, enlaces }: { obra: Obra; enlaces: Enlace[] }) {
  if (enlaces.length) {
    return (
      <div className="botones">
        {enlaces.map((d, i) => (
          <a key={d.url + i} className="btn btn-primary" href={d.url} target="_blank" rel="noopener noreferrer">
            <span className="rombo" aria-hidden="true" /> Descargar{d.etiqueta ? ` · ${d.etiqueta}` : ""}
          </a>
        ))}
      </div>
    );
  }
  return (
    <p className="meta">
      <span className="lenticular">{pasoDeObra(obra.id) ? "ENLACE PENDIENTE" : "PRÓXIMAMENTE"}</span> Descarga
    </p>
  );
}
