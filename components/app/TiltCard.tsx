"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/*
 * Tarjeta con inclinación 3D. En el celular sigue el giroscopio (inclinar el teléfono);
 * en computador o al tocarla sigue el dedo/puntero. Un reflejo de luz neón se desplaza encima.
 */

// Una sola escucha del giroscopio para todas las tarjetas.
const tiltX = { v: 0 }; // -1..1 (izquierda/derecha)
const tiltY = { v: 0 }; // -1..1 (adelante/atrás)
const listeners = new Set<() => void>();
let started = false;
function startGyro() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || e.beta == null) return;
    tiltX.v = Math.max(-1, Math.min(1, e.gamma / 25));
    tiltY.v = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    listeners.forEach((fn) => fn());
  });
}

export function TiltCard({ children, className = "", max = 14, onClick }: { children: ReactNode; className?: string; max?: number; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18 });
  const sy = useSpring(py, { stiffness: 150, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-max, max]);
  const rotateX = useTransform(sy, [-1, 1], [max, -max]);
  const glareX = useTransform(sx, [-1, 1], ["10%", "90%"]);
  const glareY = useTransform(sy, [-1, 1], ["10%", "90%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,.35), transparent 55%)`;

  useEffect(() => {
    if (reduce) return;
    startGyro();
    const fn = () => { px.set(tiltX.v); py.set(tiltY.v); };
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [px, py, reduce]);

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  return (
    <motion.div
      ref={ref}
      className={`tilt ${className}`}
      style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformPerspective: 800 }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { px.set(tiltX.v); py.set(tiltY.v); }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
      <motion.span className="tilt-glare" style={{ background: glare }} aria-hidden="true" />
    </motion.div>
  );
}
