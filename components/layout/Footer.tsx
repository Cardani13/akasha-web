import { Logo } from "@/components/ui/Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.pie}>
      <div className="filete"><span /></div>
      <Logo size={22} />
      <p className={styles.lema}>Todas las rutas llevan a la Raíz.</p>
      <p className="meta">Proyecto personal sin ánimo de lucro · Las obras pertenecen a TYPE-MOON y sus licenciatarios</p>
    </footer>
  );
}
