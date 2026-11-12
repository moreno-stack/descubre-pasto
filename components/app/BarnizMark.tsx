"use client";

import { motion } from "motion/react";

/**
 * Marca de Descubre Pasto: el volcán Galeras con incrustaciones de barniz de Pasto (mopa-mopa).
 * `animated` dibuja el trazo del volcán y hace aparecer las piezas de color, para el splash.
 */
export function BarnizMark({ size = 40, animated = false }: { size?: number; animated?: boolean }) {
  const draw = animated
    ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 1, ease: "easeInOut" as const } }
    : {};
  const pop = (delay: number) =>
    animated
      ? { initial: { scale: 0, rotate: -90 }, animate: { scale: 1, rotate: 0 }, transition: { delay, type: "spring" as const, stiffness: 320, damping: 14 } }
      : {};

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="barniz-mark">
      <motion.path
        d="M5 50 C15 46 19 30 25 23 L29 27 L32 24 L35 27 L39 23 C45 30 49 46 59 50"
        fill="none"
        stroke="var(--talco)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw}
      />
      <motion.path d="M32 6 L37 13 L32 20 L27 13 Z" fill="var(--rojo)" style={{ originX: "32px", originY: "13px" }} {...pop(0.55)} />
      <motion.circle cx="17" cy="15" r="4.5" fill="var(--oro)" {...pop(0.7)} />
      <motion.path d="M46 10 Q53 13 50 20 Q43 17 46 10 Z" fill="var(--verde)" {...pop(0.85)} />
      <motion.path d="M22 56 L32 50 L42 56 Z" fill="var(--turquesa)" {...pop(1)} />
    </svg>
  );
}
