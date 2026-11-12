"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Clock3, Heart, ImageOff, MapPin } from "lucide-react";
import type { Place } from "@/lib/places";
import { tap } from "@/lib/haptics";
import { burstFromElement, useBurst } from "./Burst";

export function FavButton({ saved, onToggle, className = "" }: { saved: boolean; onToggle: () => void; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const fire = useBurst();
  return (
    <motion.button
      ref={ref}
      className={`fav ${saved ? "is-saved" : ""} ${className}`}
      whileTap={{ scale: 0.75 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!saved) burstFromElement(fire, ref.current, 0.8);
        tap(saved ? "light" : "medium");
        onToggle();
      }}
      aria-label={saved ? "Quitar de guardados" : "Guardar lugar"}
      aria-pressed={saved}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.2 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 12 }}>
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
      </motion.span>
    </motion.button>
  );
}

function Photo({ place, className, layoutKey }: { place: Place; className: string; layoutKey: string }) {
  return place.image ? (
    <motion.div layoutId={layoutKey} className={className} style={{ backgroundImage: `url('${place.image}')` }} />
  ) : (
    <motion.div layoutId={layoutKey} className={`${className} photo-empty`}>
      <ImageOff size={22} aria-hidden="true" />
      <span>Foto pendiente</span>
    </motion.div>
  );
}

/** Tarjeta alta para los carruseles horizontales del inicio. */
export function RailCard({ place, saved, onOpen, onFavorite, ctx }: { place: Place; saved: boolean; onOpen: (layoutKey: string) => void; onFavorite: () => void; ctx: string }) {
  const layoutKey = `${ctx}-${place.id}`;
  return (
    <motion.article className="rail-card" whileTap={{ scale: 0.97 }} onClick={() => { tap(); onOpen(layoutKey); }}>
      <Photo place={place} className="rail-photo" layoutKey={layoutKey} />
      <span className="rail-shade" />
      <FavButton saved={saved} onToggle={onFavorite} className="rail-fav" />
      <div className="rail-copy">
        <span className="rail-cat">{place.category}</span>
        <h3>{place.name}</h3>
        {place.imageIsIllustrative && place.image && <small>Foto de referencia</small>}
      </div>
    </motion.article>
  );
}

/** Tarjeta para la cuadrícula de Explorar y la lista de Guardados. */
export function GridCard({ place, saved, onOpen, onFavorite, index }: { place: Place; saved: boolean; onOpen: (layoutKey: string) => void; onFavorite: () => void; index: number }) {
  const layoutKey = `grid-${place.id}`;
  return (
    <motion.article
      className={`grid-card ${index % 2 ? "is-offset" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "40px" }}
      transition={{ delay: (index % 2) * 0.06, type: "spring", stiffness: 260, damping: 26 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { tap(); onOpen(layoutKey); }}
    >
      <div className="grid-photo-wrap">
        <Photo place={place} className="grid-photo" layoutKey={layoutKey} />
        <FavButton saved={saved} onToggle={onFavorite} className="grid-fav" />
      </div>
      <div className="grid-copy">
        <h3>{place.name}</h3>
        <p>
          <MapPin size={12} aria-hidden="true" />
          {place.latitude === undefined ? place.category : place.neighborhood}
          {place.visitMinutes ? <><Clock3 size={12} aria-hidden="true" /> {place.visitMinutes} min</> : null}
        </p>
      </div>
    </motion.article>
  );
}
