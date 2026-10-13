"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BarnizMark } from "./BarnizMark";

const COLORS = ["var(--rojo)", "var(--oro)", "var(--verde)", "var(--turquesa)", "var(--rosa)"];
// Piezas de barniz que llegan desde los bordes y se acomodan alrededor del volcán.
const RING = Array.from({ length: 14 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 14;
  return {
    i,
    toX: Math.cos(angle) * 96,
    toY: Math.sin(angle) * 96,
    fromX: Math.cos(angle) * 420,
    fromY: Math.sin(angle) * 620,
    color: COLORS[i % COLORS.length],
    shape: i % 3 === 0 ? "burst-rombo" : i % 3 === 1 ? "burst-petalo" : "burst-punto",
  };
});

const TITLE = "Descubre Pasto";

export function Splash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 500 : 2600);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      className="splash"
      exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
      transition={{ duration: 0.45, ease: "easeIn" }}
      role="status"
      aria-label="Cargando Descubre Pasto"
    >
      <div className="splash-stage">
        {!reduce && RING.map((p) => (
          <motion.span
            key={p.i}
            className={`burst-piece ${p.shape} splash-piece`}
            style={{ background: p.color }}
            initial={{ x: p.fromX, y: p.fromY, rotate: 0, scale: 0.6, opacity: 0 }}
            animate={{ x: p.toX, y: p.toY, rotate: 360, scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 * p.i, type: "spring", stiffness: 90, damping: 15 }}
          />
        ))}
        <motion.div
          className="splash-mark"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 16 }}
        >
          <BarnizMark size={92} animated={!reduce} />
        </motion.div>
      </div>
      <h1 className="splash-title" aria-hidden="true">
        {TITLE.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: 40, opacity: 0, rotate: 8 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 1.15 + i * 0.04, type: "spring", stiffness: 260, damping: 18 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </h1>
      <motion.p className="splash-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        Pasto, Nariño
      </motion.p>
    </motion.div>
  );
}
