import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Cormorant_Garamond, Instrument_Sans, Shippori_Mincho } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { catalogo, nombreTipo, saga } from "@/lib/catalogo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const shippori = Shippori_Mincho({
  weight: ["500"],
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "AKASHA · Todas las rutas llevan a la Raíz",
  description: "Biblioteca personal de la saga Fate y el Nasuverse.",
};

export const viewport: Viewport = {
  themeColor: "#0c0b10",
};

// Lo que necesita la lupa del menú para buscar obras por título
const indice = catalogo.obras.map((o) => ({
  id: o.id,
  titulo: o.titulo,
  original: o.tituloOriginal,
  saga: saga(o.saga).titulo,
  detalle: `${nombreTipo(o)} · ${o.anio}`,
  imagen: o.imagen,
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${instrument.variable} ${shippori.variable}`}>
      <body>
        <Header indice={indice} />
        {/* Al cambiar de sección, la página vieja se desvanece y la nueva sube (ver globals.css) */}
        <ViewTransition default="akasha-pagina">{children}</ViewTransition>
        <Footer />
      </body>
    </html>
  );
}
