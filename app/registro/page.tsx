import type { Metadata } from "next";
import { Suspense } from "react";
import { FormRegistro } from "@/components/cuenta/FormRegistro";
import styles from "@/components/cuenta/Cuenta.module.css";

export const metadata: Metadata = { title: "Crear cuenta · AKASHA" };

export default function Pagina() {
  return (
    <main className={styles.pagina}>
      <Suspense><FormRegistro /></Suspense>
    </main>
  );
}
