"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import styles from "./MenuCuenta.module.css";

type Estado = { cargando: true } | { cargando: false; nombre: string | null };

// Botón "Entrar" sin sesión; con sesión, el nombre del perfil con su menú
export function MenuCuenta() {
  const [estado, setEstado] = useState<Estado>({ cargando: true });
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const ruta = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = crearClienteNavegador();
    let vivo = true;

    async function cargar(id: string | undefined, nombreMeta: unknown) {
      if (!id) return vivo && setEstado({ cargando: false, nombre: null });
      const { data } = await supabase.from("perfiles").select("nombre").eq("id", id).maybeSingle();
      const nombre = data?.nombre ?? (typeof nombreMeta === "string" ? nombreMeta : "Mi cuenta");
      if (vivo) setEstado({ cargando: false, nombre });
    }

    supabase.auth.getUser().then(({ data }) => cargar(data.user?.id, data.user?.user_metadata?.nombre));
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT" || evento === "USER_UPDATED") {
        // Fuera del callback: Supabase no admite llamadas a su API dentro de él
        setTimeout(() => cargar(sesion?.user.id, sesion?.user.user_metadata?.nombre), 0);
      }
    });
    // /cuenta avisa cuando cambias el nombre
    const alCambiarNombre = (e: Event) => setEstado({ cargando: false, nombre: (e as CustomEvent<string>).detail });
    window.addEventListener("akasha:nombre", alCambiarNombre);
    return () => { vivo = false; sub.subscription.unsubscribe(); window.removeEventListener("akasha:nombre", alCambiarNombre); };
  }, []);

  useEffect(() => setAbierto(false), [ruta]);

  // Cerrar al pulsar fuera o con Escape
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("pointerdown", fuera); document.removeEventListener("keydown", tecla); };
  }, [abierto]);

  async function salir() {
    await crearClienteNavegador().auth.signOut();
    setAbierto(false);
    router.refresh();
  }

  if (estado.cargando) return <span className={styles.hueco} aria-hidden="true" />;

  if (!estado.nombre) {
    return <Link href="/entrar" className={styles.entrar}>Entrar</Link>;
  }

  return (
    <div className={styles.caja} ref={caja}>
      <button
        className={styles.usuario}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls="menu-cuenta"
        onClick={() => setAbierto(!abierto)}
      >
        <span className={styles.inicial} aria-hidden="true">{estado.nombre.charAt(0).toUpperCase()}</span>
        <span className={styles.nombre}>{estado.nombre}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d={abierto ? "M3 7.5 6 4.5l3 3" : "M3 4.5 6 7.5l3-3"} />
        </svg>
      </button>
      {abierto && (
        <div id="menu-cuenta" className={styles.menu} role="menu">
          <p className={styles.cabecera}><span className="meta">Sesión iniciada</span>{estado.nombre}</p>
          <Link href="/progreso" role="menuitem" className={styles.opcion}>Mi progreso</Link>
          <Link href="/cuenta" role="menuitem" className={styles.opcion}>Mi cuenta</Link>
          <button role="menuitem" className={styles.opcion} onClick={salir}>Salir</button>
        </div>
      )}
    </div>
  );
}
