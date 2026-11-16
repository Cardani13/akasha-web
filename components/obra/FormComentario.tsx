"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MAX, mensajeError } from "@/lib/comentarios";
import styles from "./Comentarios.module.css";

type Props = {
  id: string;
  etiqueta: string;
  placeholder: string;
  boton: string;
  espera: number; // segundos de enfriamiento que quedan
  alEnviar: (texto: string, spoiler: boolean) => Promise<void>;
  alCancelar?: () => void;
  textoInicial?: string;
  compacto?: boolean;
  autoFocus?: boolean;
};

// Cuadro para escribir un comentario o una respuesta, con contador, spoiler y enfriamiento
export function FormComentario({ id, etiqueta, placeholder, boton, espera, alEnviar, alCancelar, textoInicial = "", compacto, autoFocus }: Props) {
  const [texto, setTexto] = useState(textoInicial);
  const [spoiler, setSpoiler] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus || !area.current) return;
    area.current.focus();
    area.current.setSelectionRange(textoInicial.length, textoInicial.length); // cursor detrás de "@Nombre "
  }, [autoFocus, textoInicial]);

  const limpio = texto.trim();
  const largo = limpio.length;
  const deshabilitado = enviando || largo === 0 || largo > MAX || espera > 0;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (deshabilitado) return;
    setEnviando(true);
    setError(null);
    try {
      await alEnviar(limpio, spoiler);
      setTexto("");
      setSpoiler(false);
    } catch (err) {
      // Lo escrito se queda en el cuadro
      setError(mensajeError(err, "No se pudo publicar. Revisa tu conexión e inténtalo de nuevo."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={`${styles.formulario} ${compacto ? styles.compacto : ""}`} onSubmit={enviar}>
      <label htmlFor={id} className={compacto ? styles.etiquetaOculta : "meta"}>{etiqueta}</label>
      <textarea
        ref={area}
        id={id}
        className={styles.textarea}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={compacto ? 2 : 3}
        placeholder={placeholder}
        aria-invalid={largo > MAX}
      />
      <div className={styles.barra}>
        <label className={styles.casilla}>
          <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
          Contiene spoilers
        </label>
        <span className={`${styles.contador} ${largo > MAX ? styles.pasado : ""}`}>{largo}/{MAX}</span>
        {alCancelar && (
          <button type="button" className={styles.accion} onClick={alCancelar}>Cancelar</button>
        )}
        <button className={`btn btn-primary ${styles.publicar}`} disabled={deshabilitado}>
          {enviando ? "Publicando…" : espera > 0 ? `Espera ${espera} s` : boton}
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}
