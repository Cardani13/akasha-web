"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { traducirError } from "@/lib/supabase/validacion";
import styles from "./Cuenta.module.css";

// Avisos que llegan desde la ruta de confirmación (?aviso=...)
const avisos: Record<string, { tipo: "exito" | "error"; texto: string }> = {
  confirmado: { tipo: "exito", texto: "Correo confirmado. Ya puedes entrar." },
  "enlace-invalido": { tipo: "error", texto: "El enlace no es válido o ha caducado. Si ya confirmaste el correo, entra normalmente; si no, pide otro." },
};

export function FormEntrar() {
  const router = useRouter();
  const aviso = avisos[useSearchParams().get("aviso") ?? ""];
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const correo = String(datos.get("correo") ?? "").trim();
    const contrasena = String(datos.get("contrasena") ?? "");
    if (!correo || !contrasena) return setError("Escribe tu correo y tu contraseña.");

    setError(null);
    setCargando(true);
    const { error } = await crearClienteNavegador().auth.signInWithPassword({ email: correo, password: contrasena });
    if (error) {
      setCargando(false);
      return setError(traducirError(error.message));
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className="meta"><span className="lenticular">BIENVENIDO DE VUELTA</span></p>
        <h1 className={styles.titulo}>Entrar</h1>
      </div>

      {aviso && <p className={aviso.tipo === "exito" ? styles.exito : styles.error} role="status">{aviso.texto}</p>}

      <form className={styles.formulario} onSubmit={enviar} noValidate>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Correo</span>
          <input className={styles.input} name="correo" type="email" autoComplete="email" required placeholder="tu@correo.com" />
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Contraseña</span>
          <input className={styles.input} name="contrasena" type="password" autoComplete="current-password" required />
        </label>
        <Link href="/recuperar" className={styles.olvido}>¿Has olvidado la contraseña?</Link>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={`btn btn-primary ${styles.enviar}`} disabled={cargando}>
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className={styles.pie}>
        <span>¿No tienes cuenta? <Link href="/registro" className={styles.enlace}>Crear cuenta</Link></span>
      </p>
    </div>
  );
}
