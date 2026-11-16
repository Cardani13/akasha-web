// Símbolo AKASHA: el Círculo (el Grial y la Raíz), la Hoja (la espada, la Guerra)
// y el Rombo en Rojo Sello. Construcción sobre un módulo x: círculo de 10x,
// hoja que sobresale 2x arriba y abajo, rombo de 2x de diagonal.
export function Simbolo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="5" fill="none" stroke="var(--oro-grial)" strokeWidth="0.55" />
      <rect x="6.75" y="0" width="0.5" height="14" fill="var(--oro-grial)" />
      <rect x="6.3" y="6.3" width="1.4" height="1.4" fill="var(--rojo-sello)" transform="rotate(45 7 7)" />
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3 }}>
      <Simbolo size={size} />
      <span
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 500,
          fontSize: size * 0.82,
          letterSpacing: "0.22em",
          color: "var(--pergamino)",
          lineHeight: 1,
        }}
      >
        AKASHA
      </span>
    </span>
  );
}
