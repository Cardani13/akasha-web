"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import styles from "./Cuenta.module.css";

// Solo rutas internas, para que el enlace no sirva como redirección abierta
const destinoSeguro = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

// Lee la sesión que Supabase deja en el enlace del correo (#access_token=…) y la guarda en las cookies
export function RecibirSesion() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const destino = destinoSeguro(params.get("next"));
  const esRecuperacion = destino === "/nueva-contrasena";
  const hecho = useRef(false); // el enlace solo se procesa una vez (en desarrollo React repite los efectos)

  useEffect(() => {
    if (hecho.current) return;
    hecho.current = true;
    // Enlaces antiguos con ?code= los sigue procesando el servidor
    if (params.get("code") || params.get("token_hash")) {
      window.location.replace(`/auth/confirmar${window.location.search}`);
      return;
    }

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const acceso = hash.get("access_token");
    const refresco = hash.get("refresh_token");
    // Quitar los tokens de la barra de direcciones y del historial
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (!acceso || !refresco) {
      const codigo = hash.get("error_code") ?? "";
      setError(
        codigo === "otp_expired"
          ? "El enlace ha caducado o ya se usó. Cada correo nuevo anula los anteriores: usa siempre el último."
          : "El enlace no es válido. Pide uno nuevo.",
      );
      return;
    }

    crearClienteNavegador().auth.setSession({ access_token: acceso, refresh_token: refresco }).then(({ error }) => {
      if (error) return setError("No se pudo iniciar sesión con este enlace. Pide uno nuevo.");
      router.replace(destino);
      router.refresh();
    });
  }, [params, destino, router]);

  return (
    <div className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className="meta"><span className="lenticular">{esRecuperacion ? "RECUPERAR ACCESO" : "TU CUENTA"}</span></p>
        <h1 className={styles.titulo}>{error ? "Enlace no válido" : "Un momento…"}</h1>
        {!error && <p className={styles.intro}>Comprobando el enlace del correo.</p>}
      </div>
      {error && (
        <>
          <p className={styles.error} role="alert">{error}</p>
          <p className={styles.pie}>
            {esRecuperacion
              ? <Link href="/recuperar" className={styles.enlace}>Pedir otro enlace</Link>
              : <Link href="/entrar" className={styles.enlace}>Ir a Entrar</Link>}
          </p>
        </>
      )}
    </div>
  );
}
