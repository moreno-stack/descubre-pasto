"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { Navigation } from "lucide-react";
import { tap } from "@/lib/haptics";
import type { Directions } from "@/lib/directions";

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

/** Tarjeta con la ruta en Google Maps (un lugar o un recorrido). */
export function DirectionsCard({ directions }: { directions: Directions }) {
  const many = directions.places.length > 1;
  const label: Record<string, string> = { walking: "A pie", driving: "En carro", transit: "En bus" };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <a className="route-card" href={directions.mapsUrl} target="_blank" rel="noreferrer" onClick={() => tap()}>
        <span className="route-card-icon"><Navigation size={18} /></span>
        <span className="route-card-copy">
          <strong>{many ? "Abrir recorrido en Google Maps" : "Cómo llegar en Google Maps"}</strong>
          <small>
            {many ? `${directions.places.length} paradas en orden` : directions.places[0]?.name}
            {directions.distanceKm !== undefined ? ` · ~${directions.distanceKm} km desde el centro` : ""}
          </small>
        </span>
      </a>
      <div className="route-card-modes">
        {(["walking", "driving", "transit"] as const).map((m) => (
          <a key={m} href={directions.modes[m]} target="_blank" rel="noreferrer" className={directions.mode === m ? "is-on" : ""} onClick={() => tap("light")}>
            {label[m]}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
