"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
 * Fondo vivo "Negros y Blancos": nubes de talco que flotan despacio
 * y partículas de talco que suben como en el Carnaval del 5 de enero.
 */
const CLOUDS = [
  { size: 340, x: [-140, -60, -140], y: [60, 200, 60], d: 18 },
  { size: 380, x: [180, 120, 180], y: [380, 260, 380], d: 22 },
  { size: 260, x: [40, 160, 40], y: [700, 620, 700], d: 26 },
];

export function NeonBackdrop() {
  const reduce = useReducedMotion();
  const specks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 5),
        d: 14 + ((i * 5) % 12),
        delay: -((i * 3) % 14),
        drift: ((i % 2 ? 1 : -1) * (10 + (i % 4) * 8)),
      })),
    [],
  );

  return (
    <div className="neon-backdrop" aria-hidden="true">
      {CLOUDS.map((b, i) => (
        <motion.span
          key={i}
          className="neon-blob"
          style={{ width: b.size, height: b.size }}
          initial={{ x: b.x[0], y: b.y[0] }}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {!reduce &&
        specks.map((s) => (
          <motion.span
            key={s.i}
            className="talco-speck"
            style={{ left: s.left, width: s.size, height: s.size }}
            initial={{ y: "105dvh", x: 0, opacity: 0 }}
            animate={{ y: "-5dvh", x: [0, s.drift, 0], opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: s.d, delay: s.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      <span className="neon-grain" />
    </div>
  );
}
