import type { Metadata } from "next";
import { Suspense } from "react";
import { FormEntrar } from "@/components/cuenta/FormEntrar";
import styles from "@/components/cuenta/Cuenta.module.css";

export const metadata: Metadata = { title: "Entrar · AKASHA" };

export default function Pagina() {
  return (
    <main className={styles.pagina}>
      <Suspense><FormEntrar /></Suspense>
    </main>
  );
}
