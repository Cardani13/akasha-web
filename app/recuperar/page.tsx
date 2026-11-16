import type { Metadata } from "next";
import { Suspense } from "react";
import { FormRecuperar } from "@/components/cuenta/FormRecuperar";
import styles from "@/components/cuenta/Cuenta.module.css";

export const metadata: Metadata = { title: "Recuperar contraseña · AKASHA" };

export default function Pagina() {
  return (
    <main className={styles.pagina}>
      <Suspense><FormRecuperar /></Suspense>
    </main>
  );
}
