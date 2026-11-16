"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { errorContrasena, MIN_CONTRASENA, traducirError } from "@/lib/supabase/validacion";
import styles from "./Cuenta.module.css";

// Se llega aquí desde el enlace del correo de recuperación, ya con la sesión iniciada
export function FormNuevaContrasena() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const contrasena = String(datos.get("contrasena") ?? "");
    const fallo = errorContrasena(contrasena, String(datos.get("repetida") ?? ""));
    if (fallo) return setError(fallo);

    setError(null);
    setCargando(true);
    const supabase = crearClienteNavegador();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setCargando(false);
      return setError("El enlace ha caducado. Pide uno nuevo desde «¿Has olvidado la contraseña?».");
    }
    const { error } = await supabase.auth.updateUser({ password: contrasena });
    setCargando(false);
    if (error) return setError(traducirError(error.message));
    router.replace("/");
    router.refresh();
  }

  return (
    <div className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className="meta"><span className="lenticular">NUEVA CONTRASEÑA</span></p>
        <h1 className={styles.titulo}>Elige una contraseña</h1>
      </div>
      <form className={styles.formulario} onSubmit={enviar} noValidate>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Nueva contraseña</span>
          <input className={styles.input} name="contrasena" type="password" autoComplete="new-password" required minLength={MIN_CONTRASENA} />
          <span className={styles.ayuda}>Mínimo {MIN_CONTRASENA} caracteres</span>
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Repítela</span>
          <input className={styles.input} name="repetida" type="password" autoComplete="new-password" required minLength={MIN_CONTRASENA} />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={`btn btn-primary ${styles.enviar}`} disabled={cargando}>
          {cargando ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
      <p className={styles.pie}>
        <Link href="/recuperar" className={styles.enlace}>Pedir otro enlace</Link>
      </p>
    </div>
  );
}
