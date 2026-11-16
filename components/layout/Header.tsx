"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Buscador, type EntradaBusqueda } from "./Buscador";
import { MenuCuenta } from "./MenuCuenta";
import styles from "./Header.module.css";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/sagas", label: "Sagas" },
  { href: "/orden", label: "Orden de visionado" },
  { href: "/progreso", label: "Mi progreso" },
];

// "/saga/zero" también marca "Sagas" como activa
const esActivo = (href: string, ruta: string) =>
  href === "/" ? ruta === "/" : ruta === href || (href === "/sagas" && ruta.startsWith("/saga/"));

export function Header({ indice }: { indice: EntradaBusqueda[] }) {
  const [solido, setSolido] = useState(false);
  const [abierto, setAbierto] = useState(false); // menú del teléfono
  const ruta = usePathname();

  useEffect(() => {
    const onScroll = () => setSolido(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Al cambiar de página se cierra el menú
  useEffect(() => setAbierto(false), [ruta]);

  return (
    <header className={`${styles.header} ${solido || abierto ? styles.solido : ""}`}>
      <button
        className={styles.menu}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto(!abierto)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <Link href="/" aria-label="AKASHA, inicio">
        <Logo size={26} />
      </Link>
      <nav id="menu-principal" className={`${styles.nav} ${abierto ? styles.abierto : ""}`} aria-label="Principal">
        {enlaces.map((e) => (
          <Link key={e.label} href={e.href} className={esActivo(e.href, ruta) ? styles.activo : undefined}>
            {e.label}
          </Link>
        ))}
      </nav>
      <div className={styles.acciones}>
        <Buscador indice={indice} />
        <MenuCuenta />
      </div>
    </header>
  );
}
