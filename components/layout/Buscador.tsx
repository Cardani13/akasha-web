"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Buscador.module.css";

// Lo mínimo de cada obra que necesita el buscador (lo prepara app/layout.tsx)
export type EntradaBusqueda = { id: string; titulo: string; original?: string; saga: string; detalle: string; imagen: string };

const MAX_RESULTADOS = 8;

// "Prisma☆Illya: Juramento" → "prisma illya juramento" (sin tildes, símbolos ni mayúsculas)
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Lupa del menú: abre un cuadro para buscar obras por título
export function Buscador({ indice }: { indice: EntradaBusqueda[] }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const ruta = usePathname();
  const router = useRouter();

  const obras = useMemo(
    () => indice.map((e) => ({ ...e, clave: normalizar(`${e.titulo} ${e.original ?? ""} ${e.saga}`) })),
    [indice],
  );

  // Se queda con las obras que contienen todas las palabras escritas; primero las que coinciden en el título
  const palabras = normalizar(texto).split(" ").filter(Boolean);
  const resultados = palabras.length === 0 ? [] : obras
    .filter((o) => palabras.every((p) => o.clave.includes(p)))
    .sort((a, b) => Number(normalizar(b.titulo).includes(palabras[0])) - Number(normalizar(a.titulo).includes(palabras[0])))
    .slice(0, MAX_RESULTADOS);

  const cerrar = () => { setAbierto(false); setTexto(""); };

  // Al abrir, el cursor va al campo. Se cierra con Escape o al pulsar fuera.
  useEffect(() => {
    if (!abierto) return;
    campo.current?.focus();
    const alPulsarTecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    const alPulsarFuera = (e: MouseEvent) => { if (!caja.current?.contains(e.target as Node)) cerrar(); };
    document.addEventListener("keydown", alPulsarTecla);
    document.addEventListener("mousedown", alPulsarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.removeEventListener("mousedown", alPulsarFuera);
    };
  }, [abierto]);

  // Al cambiar de página se cierra
  useEffect(() => cerrar(), [ruta]);

  return (
    <div ref={caja} className={styles.buscador}>
      <button
        className={styles.lupa}
        aria-label={abierto ? "Cerrar búsqueda" : "Buscar"}
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>}
        </svg>
      </button>

      {abierto && (
        <form
          className={styles.panel}
          role="search"
          onSubmit={(e) => { e.preventDefault(); if (resultados[0]) router.push(`/obra/${resultados[0].id}`); }}
        >
          <input
            ref={campo}
            type="search"
            className={styles.campo}
            placeholder="Buscar un título…"
            aria-label="Buscar un título"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />

          {palabras.length > 0 && resultados.length === 0 && (
            <p className={styles.vacio}>No hay ninguna obra con ese título.</p>
          )}

          {resultados.length > 0 && (
            <ul className={styles.resultados}>
              {resultados.map((o) => (
                <li key={o.id}>
                  <Link href={`/obra/${o.id}`} className={styles.resultado}>
                    <span className={styles.portada}>
                      <Image src={o.imagen} alt="" fill sizes="40px" className={styles.img} />
                    </span>
                    <span className={styles.texto}>
                      <span className={styles.titulo}>{o.titulo}</span>
                      <span className="meta">{o.detalle}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </div>
  );
}
