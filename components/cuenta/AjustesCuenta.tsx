"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { MIN_CONTRASENA, errorContrasena, errorNombre, traducirError } from "@/lib/supabase/validacion";
import styles from "./AjustesCuenta.module.css";

type Estado = { tipo: "exito" | "error"; texto: string } | null;

const codigo = (e: unknown) => (e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "");

export function AjustesCuenta({ usuarioId, nombreInicial }: { usuarioId: string; nombreInicial: string }) {
  const [nombreActual, setNombreActual] = useState(nombreInicial);
  return (
    <div className={styles.secciones}>
      <CambiarNombre usuarioId={usuarioId} actual={nombreActual} alCambiar={setNombreActual} />
      <CambiarContrasena />
      <BorrarCuenta nombre={nombreActual} />
    </div>
  );
}

function Mensaje({ estado }: { estado: Estado }) {
  if (!estado) return null;
  return (
    <p className={estado.tipo === "exito" ? styles.exito : styles.error} role={estado.tipo === "error" ? "alert" : "status"}>
      {estado.texto}
    </p>
  );
}

function CambiarNombre({ usuarioId, actual, alCambiar }: { usuarioId: string; actual: string; alCambiar: (n: string) => void }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(actual);
  const [estado, setEstado] = useState<Estado>(null);
  const [cargando, setCargando] = useState(false);
  const limpio = nombre.trim();

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const fallo = errorNombre(limpio);
    if (fallo) return setEstado({ tipo: "error", texto: fallo });
    if (limpio === actual) return setEstado({ tipo: "error", texto: "Ese ya es tu nombre." });

    setCargando(true);
    setEstado(null);
    try {
      const { data, error } = await crearClienteNavegador()
        .from("perfiles").update({ nombre: limpio }).eq("id", usuarioId).select("nombre");
      if (error) throw error;
      if (!data?.length) throw new Error("sin permiso");
      alCambiar(limpio);
      window.dispatchEvent(new CustomEvent("akasha:nombre", { detail: limpio })); // la cabecera se actualiza
      router.refresh();
      setEstado({ tipo: "exito", texto: "Nombre actualizado." });
    } catch (err) {
      // 23505 = el índice único de nombres (sin distinguir mayúsculas)
      setEstado({
        tipo: "error",
        texto: codigo(err) === "23505" ? "Ese nombre ya está en uso. Prueba con otro." : "No se pudo cambiar el nombre. Inténtalo de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className={styles.seccion} aria-labelledby="t-nombre">
      <h2 id="t-nombre" className={styles.subtitulo}>Nombre</h2>
      <p className={styles.ayuda}>Es el nombre que ven los demás en tus comentarios.</p>
      <form className={styles.formulario} onSubmit={guardar} noValidate>
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Nombre</span>
          <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={24} autoComplete="username" />
          <span className={styles.ayuda}>3–24 caracteres: letras, números, espacios, - y _</span>
        </label>
        <Mensaje estado={estado} />
        <div>
          <button className="btn btn-secondary" disabled={cargando || limpio === actual}>
            {cargando ? "Guardando…" : "Guardar nombre"}
          </button>
        </div>
      </form>
    </section>
  );
}

function CambiarContrasena() {
  const [estado, setEstado] = useState<Estado>(null);
  const [cargando, setCargando] = useState(false);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const datos = new FormData(formulario);
    const fallo = errorContrasena(String(datos.get("contrasena") ?? ""), String(datos.get("repetida") ?? ""));
    if (fallo) return setEstado({ tipo: "error", texto: fallo });

    setCargando(true);
    setEstado(null);
    const { error } = await crearClienteNavegador().auth.updateUser({ password: String(datos.get("contrasena")) });
    setCargando(false);
    if (error) return setEstado({ tipo: "error", texto: traducirError(error.message) });
    formulario.reset();
    setEstado({ tipo: "exito", texto: "Contraseña cambiada. Úsala la próxima vez que entres." });
  }

  return (
    <section className={styles.seccion} aria-labelledby="t-contrasena">
      <h2 id="t-contrasena" className={styles.subtitulo}>Contraseña</h2>
      <form className={styles.formulario} onSubmit={guardar} noValidate>
        <div className={styles.dosCampos}>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Nueva contraseña</span>
            <input className={styles.input} name="contrasena" type="password" autoComplete="new-password" minLength={MIN_CONTRASENA} />
          </label>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Repítela</span>
            <input className={styles.input} name="repetida" type="password" autoComplete="new-password" minLength={MIN_CONTRASENA} />
          </label>
        </div>
        <span className={styles.ayuda}>Mínimo {MIN_CONTRASENA} caracteres</span>
        <Mensaje estado={estado} />
        <div>
          <button className="btn btn-secondary" disabled={cargando}>{cargando ? "Guardando…" : "Cambiar contraseña"}</button>
        </div>
      </form>
    </section>
  );
}

function BorrarCuenta({ nombre }: { nombre: string }) {
  const [escrito, setEscrito] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coincide = nombre !== "" && escrito === nombre;

  async function borrar() {
    setCargando(true);
    setError(null);
    const supabase = crearClienteNavegador();
    const { error } = await supabase.rpc("borrar_mi_cuenta");
    if (error) {
      setCargando(false);
      setConfirmando(false);
      // PGRST202 = la función no existe todavía en Supabase
      return setError(
        codigo(error) === "PGRST202"
          ? "Borrar cuentas aún no está activado: falta crear la función borrar_mi_cuenta en Supabase."
          : "No se pudo borrar la cuenta. Inténtalo de nuevo.",
      );
    }
    await supabase.auth.signOut().catch(() => {}); // la cuenta ya no existe; solo se limpian las cookies
    window.location.assign("/?aviso=cuenta-borrada");
  }

  return (
    <section className={`${styles.seccion} ${styles.peligro}`} aria-labelledby="t-borrar">
      <h2 id="t-borrar" className={styles.subtitulo}>Borrar la cuenta</h2>
      <p className={styles.ayuda}>
        Se borran para siempre tu perfil, tu progreso, tus comentarios con sus respuestas y tus reacciones. No se puede deshacer.
      </p>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>Escribe tu nombre, <strong className={styles.nombreExacto}>{nombre}</strong>, para confirmar</span>
        <input className={styles.input} value={escrito} onChange={(e) => { setEscrito(e.target.value); setConfirmando(false); }} autoComplete="off" spellCheck={false} />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className="botones">
        {confirmando ? (
          <>
            <button type="button" className={`btn ${styles.botonPeligro}`} onClick={borrar} disabled={cargando}>
              {cargando ? "Borrando…" : "Sí, borrar mi cuenta para siempre"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmando(false)} disabled={cargando}>Cancelar</button>
          </>
        ) : (
          <button type="button" className={`btn ${styles.botonPeligro}`} disabled={!coincide} onClick={() => setConfirmando(true)}>
            Borrar mi cuenta
          </button>
        )}
      </div>
    </section>
  );
}
