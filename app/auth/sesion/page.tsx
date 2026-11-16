import type { Metadata } from "next";
import { Suspense } from "react";
import { RecibirSesion } from "@/components/cuenta/RecibirSesion";
import styles from "@/components/cuenta/Cuenta.module.css";

export const metadata: Metadata = { title: "Un momento · AKASHA" };

// Destino de los enlaces de los correos de registro y de recuperar contraseña
export default function Pagina() {
  return (
    <main className={styles.pagina}>
      <Suspense><RecibirSesion /></Suspense>
    </main>
  );
}
