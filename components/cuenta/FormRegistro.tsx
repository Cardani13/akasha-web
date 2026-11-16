"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { crearClienteCorreo, crearClienteNavegador } from "@/lib/supabase/client";
import { errorContrasena, errorNombre, MIN_CONTRASENA, traducirError } from "@/lib/supabase/validacion";
import styles from "./Cuenta.module.css";

export function FormRegistro() {
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null); // correo al que se mandó la confirmación
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre") ?? "").trim();
    const correo = String(datos.get("correo") ?? "").trim();
    const contrasena = String(datos.get("contrasena") ?? "");
    const repetida = String(datos.get("repetida") ?? "");

    const fallo = errorNombre(nombre) ?? (correo ? null : "Escribe tu correo.") ?? errorContrasena(contrasena, repetida);
    if (fallo) return setError(fallo);

    setError(null);
    setCargando(true);
    const { data, error } = await crearClienteCorreo().auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        // El trigger crear_perfil lee el nombre de raw_user_meta_data
        data: { nombre },
        emailRedirectTo: `${location.origin}/auth/sesion?next=/`,
      },
    });
    setCargando(false);
    if (error) return setError(traducirError(error.message));
    // Si el correo ya existe, Supabase devuelve un usuario sin identidades en vez de un error
    if (data.user && data.user.identities?.length === 0) return setError(traducirError("already registered"));
    if (data.session) {
      // Proyecto sin confirmación de correo: la sesión llega ya y se guarda en las cookies
      await crearClienteNavegador().auth.setSession(data.session);
      return location.assign("/");
    }
    setEnviado(correo);
  }

  if (enviado) {
    return (
      <div className={styles.tarjeta}>
        <div className={styles.cabecera}>
          <p className="meta"><span className="lenticular">REVISA TU CORREO</span></p>
          <h1 className={styles.titulo}>Casi listo</h1>
          <p className={styles.intro}>
            Te hemos enviado un enlace a <strong>{enviado}</strong>. Ábrelo para confirmar la cuenta y entrar.
          </p>
        </div>
        <p className={styles.pie}>
          <Link href="/entrar" className={styles.enlace}>Ir a Entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className="meta"><span className="lenticular">NUEVA CUENTA</span></p>
        <h1 className={styles.titulo}>Crear cuenta</h1>
        <p className={styles.intro}>Guarda tu progreso y comenta las obras. Es opcional: la biblioteca se ve igual sin cuenta.</p>
      </div>

      <form className={styles.formulario} onSubmit={enviar} noValidate>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Nombre</span>
          <input className={styles.input} name="nombre" autoComplete="username" required minLength={3} maxLength={24} placeholder="Shirou_Emiya" />
          <span className={styles.ayuda}>3–24 caracteres: letras, números, espacios, - y _</span>
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Correo</span>
          <input className={styles.input} name="correo" type="email" autoComplete="email" required placeholder="tu@correo.com" />
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Contraseña</span>
          <input className={styles.input} name="contrasena" type="password" autoComplete="new-password" required minLength={MIN_CONTRASENA} />
          <span className={styles.ayuda}>Mínimo {MIN_CONTRASENA} caracteres</span>
        </label>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Repite la contraseña</span>
          <input className={styles.input} name="repetida" type="password" autoComplete="new-password" required minLength={MIN_CONTRASENA} />
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={`btn btn-primary ${styles.enviar}`} disabled={cargando}>
          {cargando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className={styles.pie}>
        <span>¿Ya tienes cuenta? <Link href="/entrar" className={styles.enlace}>Entrar</Link></span>
      </p>
    </div>
  );
}
