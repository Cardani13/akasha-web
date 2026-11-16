"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AvisoUrl.module.css";

// Mensajes que llegan en la URL (?aviso=…) después de una acción en otra página
const textos: Record<string, string> = {
  "cuenta-borrada": "Tu cuenta se ha borrado. Gracias por pasar por AKASHA.",
};

export function AvisoUrl() {
  const aviso = useSearchParams().get("aviso");
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso || !textos[aviso]) return;
    setTexto(textos[aviso]);
    // Quitar ?aviso= para que no vuelva a salir al recargar
    const url = new URL(window.location.href);
    url.searchParams.delete("aviso");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    const t = setTimeout(() => setTexto(null), 8000);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!texto) return null;
  return (
    <div className={styles.aviso} role="status">
      <span>{texto}</span>
      <button type="button" className={styles.cerrar} aria-label="Cerrar aviso" onClick={() => setTexto(null)}>×</button>
    </div>
  );
}
