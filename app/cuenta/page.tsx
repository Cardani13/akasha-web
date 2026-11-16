import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AjustesCuenta } from "@/components/cuenta/AjustesCuenta";
import { leerMiSesion } from "@/lib/progreso-servidor";
import styles from "@/components/cuenta/AjustesCuenta.module.css";

export const metadata: Metadata = { title: "Mi cuenta · AKASHA" };

// Ajustes de la cuenta: nombre, contraseña y borrar la cuenta. Solo con sesión.
export default async function PaginaCuenta() {
  const { supabase, usuarioId } = await leerMiSesion();
  if (!usuarioId) redirect("/entrar");

  const [{ data: perfil }, { data: { user } }] = await Promise.all([
    supabase.from("perfiles").select("nombre").eq("id", usuarioId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  return (
    <main className={styles.pagina}>
      <header className={styles.cabecera}>
        <p className="meta"><span className="lenticular">MI CUENTA</span></p>
        <h1 className={styles.titulo}>Ajustes de la cuenta</h1>
        {user?.email && <p className={styles.intro}>Has entrado como {user.email}</p>}
      </header>
      <AjustesCuenta usuarioId={usuarioId} nombreInicial={perfil?.nombre ?? ""} />
    </main>
  );
}
