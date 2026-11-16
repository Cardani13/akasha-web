import type { Metadata } from "next";
import { Suspense } from "react";
import { FormNuevaContrasena } from "@/components/cuenta/FormNuevaContrasena";
import styles from "@/components/cuenta/Cuenta.module.css";

export const metadata: Metadata = { title: "Nueva contraseña · AKASHA" };

export default function Pagina() {
  return (
    <main className={styles.pagina}>
      <Suspense><FormNuevaContrasena /></Suspense>
    </main>
  );
}
