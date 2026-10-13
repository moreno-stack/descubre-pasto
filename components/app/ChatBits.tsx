"use client";

import { Fragment } from "react";
import { motion } from "motion/react";

/** Muestra **negritas** y quita los [corchetes] que usa la IA para marcar lugares. */
export function RichText({ text }: { text: string }) {
  const clean = text.replace(/\[([^\]]+)\]/g, "$1");
  return (
    <p className="rich">
      {clean.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </p>
  );
}

export function TypingDots({ label = "Escribiendo" }: { label?: string }) {
  return (
    <span className="typing" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

/** Entrada de cada burbuja: crece desde la esquina de quien habla. */
export const bubbleMotion = (fromUser: boolean) => ({
  initial: { opacity: 0, scale: 0.6, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 380, damping: 26 },
  style: { originX: fromUser ? 1 : 0, originY: 1 },
});
