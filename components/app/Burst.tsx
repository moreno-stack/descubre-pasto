"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * Explosión de "barniz y talco": piezas geométricas de colores del barniz de Pasto
 * más una nube de talco blanco, como en el Carnaval de Negros y Blancos.
 * Se usa al guardar un favorito y cuando el asistente termina un recorrido.
 */

const COLORS = ["var(--rojo)", "var(--oro)", "var(--verde)", "var(--turquesa)", "var(--rosa)"];
const SHAPES = ["rombo", "petalo", "punto", "triangulo"] as const;

type Piece = { id: number; x: number; y: number; dx: number; dy: number; rot: number; color: string; shape: (typeof SHAPES)[number]; size: number };
type Puff = { id: number; x: number; y: number; dx: number; dy: number; size: number };
type BurstEvent = { id: number; pieces: Piece[]; puffs: Puff[] };

const BurstContext = createContext<(x: number, y: number, power?: number) => void>(() => {});

export function useBurst() {
  return useContext(BurstContext);
}

/** Atajo: explota desde el centro del elemento tocado. */
export function burstFromElement(fire: (x: number, y: number, power?: number) => void, el: Element | null, power = 1) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  fire(r.left + r.width / 2, r.top + r.height / 2, power);
}

export function BurstProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<BurstEvent[]>([]);
  const counter = useRef(0);
  const reduce = useReducedMotion();

  const fire = useCallback((x: number, y: number, power = 1) => {
    if (reduce) return;
    const id = ++counter.current;
    const count = Math.round(16 * power);
    const pieces: Piece[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = (60 + Math.random() * 70) * power;
      return {
        id: i, x, y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 30 * power,
        rot: (Math.random() - 0.5) * 540,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        size: 8 + Math.random() * 8,
      };
    });
    const puffs: Puff[] = Array.from({ length: Math.round(6 * power) }, (_, i) => ({
      id: i, x, y,
      dx: (Math.random() - 0.5) * 90 * power,
      dy: (Math.random() - 0.7) * 70 * power,
      size: 26 + Math.random() * 30 * power,
    }));
    setEvents((list) => [...list, { id, pieces, puffs }]);
    window.setTimeout(() => setEvents((list) => list.filter((e) => e.id !== id)), 1400);
  }, [reduce]);

  return (
    <BurstContext.Provider value={fire}>
      {children}
      <div className="burst-layer" aria-hidden="true">
        <AnimatePresence>
          {events.flatMap((event) => [
            ...event.puffs.map((p) => (
              <motion.span
                key={`${event.id}-t${p.id}`}
                className="burst-talco"
                style={{ left: p.x, top: p.y, width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
                initial={{ opacity: 0.85, scale: 0.2, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.6, x: p.dx, y: p.dy }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            )),
            ...event.pieces.map((p) => (
              <motion.span
                key={`${event.id}-p${p.id}`}
                className={`burst-piece burst-${p.shape}`}
                style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                animate={{ x: [0, p.dx, p.dx * 1.1], y: [0, p.dy, p.dy + 90], scale: [0, 1.15, 0.8], rotate: p.rot, opacity: [1, 1, 0] }}
                transition={{ duration: 1.15, times: [0, 0.45, 1], ease: "easeOut" }}
              />
            )),
          ])}
        </AnimatePresence>
      </div>
    </BurstContext.Provider>
  );
}
