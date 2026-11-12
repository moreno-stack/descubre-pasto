"use client";

import { motion } from "motion/react";
import type { Place } from "@/lib/places";
import type { Recommendation } from "@/lib/types";
import { places } from "@/lib/places";

/* ─────────── Sistema solar de guardados ─────────── */
export function SolarSystem({ saved, onOpen }: { saved: Place[]; onOpen: (p: Place) => void }) {
  const inner = saved.slice(0, 3);
  const outer = saved.slice(3, 9);
  return (
    <div className="solar" aria-hidden={saved.length === 0}>
      <Ring size={176} duration={38} items={inner} onOpen={onOpen} planet={44} />
      <Ring size={276} duration={64} items={outer} onOpen={onOpen} planet={40} reverse />
      <motion.div className="solar-sun" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
        <motion.strong key={saved.length} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{saved.length}</motion.strong>
        <small>{saved.length === 1 ? "lugar" : "lugares"}</small>
      </motion.div>
    </div>
  );
}

function Ring({ size, duration, items, onOpen, planet, reverse = false }: { size: number; duration: number; items: Place[]; onOpen: (p: Place) => void; planet: number; reverse?: boolean }) {
  return (
    <div className="solar-ring" style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}>
      {items.map((p, i) => {
        const a = (i / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * (size / 2);
        const y = Math.sin(a) * (size / 2);
        return (
          <motion.button
            key={p.id}
            className="solar-planet"
            style={{ left: size / 2 + x - planet / 2, top: size / 2 + y - planet / 2, width: planet, height: planet, backgroundImage: p.image ? `url('${p.image}')` : undefined }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: i * 0.08 }}
            onClick={() => onOpen(p)}
            aria-label={p.name}
          />
        );
      })}
    </div>
  );
}

/* ─────────── Ruta dibujada como órbita ─────────── */
export function RouteOrbit({ rec, onOpen }: { rec: Recommendation; onOpen?: (p: Place) => void }) {
  const stops = rec.route.slice(0, 7);
  const n = stops.length;
  const km = rec.route.reduce((s, r) => s + (r.distanceKm || 0), 0);
  const hours = rec.estimatedMinutes >= 60 ? `${Math.round((rec.estimatedMinutes / 60) * 10) / 10} h` : `${rec.estimatedMinutes} min`;
  return (
    <div className="route-orbit">
      <svg viewBox="0 0 320 210" className="route-orbit-svg" aria-hidden="true">
        <defs>
          <linearGradient id="orbitGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#7b6dff" />
            <stop offset="1" stopColor="#4f8cff" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="160" cy="105" rx="138" ry="82" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
      <motion.div className="route-core" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 240, damping: 14 }}>
        <strong>{hours}</strong>
        <small>{n} paradas{km ? ` · ${Math.round(km * 10) / 10} km` : ""}</small>
      </motion.div>
      {stops.map((s, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI * 0.9;
        const left = 50 + (Math.cos(a) * 138 * 100) / 320;
        const top = 50 + (Math.sin(a) * 82 * 100) / 210;
        const place = places.find((p) => p.id === s.id);
        return (
          <motion.button
            key={s.id}
            className="route-stop"
            style={{ left: `${left}%`, top: `${top}%`, backgroundImage: place?.image ? `url('${place.image}')` : undefined }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.18, type: "spring", stiffness: 380, damping: 15 }}
            onClick={() => place && onOpen?.(place)}
            aria-label={`Parada ${i + 1}: ${s.name}`}
          >
            <em>{i + 1}</em>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─────────── Avatar de la IA: planeta con luna ─────────── */
export function AiOrb({ size = 46, busy = false }: { size?: number; busy?: boolean }) {
  return (
    <span className={`ai-orb ${busy ? "is-busy" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="ai-orb-moonpath"><span className="ai-orb-moon" /></span>
    </span>
  );
}
