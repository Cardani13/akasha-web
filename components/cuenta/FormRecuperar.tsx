"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { crearClienteCorreo } from "@/lib/supabase/client";
import { traducirError } from "@/lib/supabase/validacion";
import styles from "./Cuenta.module.css";

export function FormRecuperar() {
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const correo = String(new FormData(e.currentTarget).get("correo") ?? "").trim();
    if (!correo) return setError("Escribe el correo de tu cuenta.");

    setError(null);
    setCargando(true);
    const { error } = await crearClienteCorreo().auth.resetPasswordForEmail(correo, {
      redirectTo: `${location.origin}/auth/sesion?next=/nueva-contrasena`,
    });
    setCargando(false);
    if (error) return setError(traducirError(error.message));
    setEnviado(true);
  }

  return (
    <div className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className="meta"><span className="lenticular">RECUPERAR ACCESO</span></p>
        <h1 className={styles.titulo}>¿Olvidaste la contraseña?</h1>
        <p className={styles.intro}>Escribe tu correo y te mandaremos un enlace para elegir una nueva.</p>
      </div>

      {enviado ? (
        <p className={styles.exito} role="status">
          Si hay una cuenta con ese correo, te llegará un enlace en unos minutos. Revisa también la carpeta de spam.
        </p>
      ) : (
        <form className={styles.formulario} onSubmit={enviar} noValidate>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Correo</span>
            <input className={styles.input} name="correo" type="email" autoComplete="email" required placeholder="tu@correo.com" />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={`btn btn-primary ${styles.enviar}`} disabled={cargando}>
            {cargando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}

      <p className={styles.pie}>
        <Link href="/entrar" className={styles.enlace}>Volver a Entrar</Link>
      </p>
    </div>
  );
}
