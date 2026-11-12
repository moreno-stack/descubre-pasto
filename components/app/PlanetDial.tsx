"use client";

import { motion, type PanInfo } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { tap } from "@/lib/haptics";

/*
 * Dial de categorías: cada categoría es un planeta sobre un arco.
 * Se gira deslizando o tocando un planeta; el elegido queda arriba, al centro.
 */
export type Planet = { key: string; label: string; icon: LucideIcon };

export function PlanetDial({ planets, selected, onSelect }: { planets: Planet[]; selected: number; onSelect: (i: number) => void }) {
  function onPanEnd(_: unknown, info: PanInfo) {
    const steps = Math.round(-info.offset.x / 70);
    if (!steps) return;
    const next = Math.max(0, Math.min(planets.length - 1, selected + steps));
    if (next !== selected) { tap(); onSelect(next); }
  }

  return (
    <motion.div className="dial" onPanEnd={onPanEnd} role="tablist" aria-label="Categorías">
      <span className="dial-arc" aria-hidden="true" />
      {planets.map((p, i) => {
        const rel = i - selected;
        const on = rel === 0;
        const Icon = p.icon;
        return (
          <motion.button
            key={p.key}
            role="tab"
            aria-selected={on}
            className={`planet ${on ? "is-on" : ""}`}
            initial={false}
            animate={{
              x: rel * 76,
              y: rel * rel * 11,
              scale: on ? 1.18 : Math.max(0.6, 1 - Math.abs(rel) * 0.12),
              opacity: Math.abs(rel) > 2.5 ? 0 : 1 - Math.abs(rel) * 0.18,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={() => { if (!on) { tap(); onSelect(i); } }}
            tabIndex={Math.abs(rel) > 2 ? -1 : 0}
          >
            <span className="planet-ball"><Icon size={20} /></span>
            <span className="planet-label">{p.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
