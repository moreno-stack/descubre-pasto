"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue, type PanInfo } from "motion/react";
import type { Place } from "@/lib/places";
import { tap } from "@/lib/haptics";
import { FavButton } from "./PlaceCard";

/*
 * Carrusel 3D circular: los lugares orbitan en un anillo.
 * Se gira arrastrando con el dedo (con inercia) y la tarjeta del frente se ilumina.
 */

const STEP = 0.52;      // separación angular entre tarjetas (radianes)
const RADIUS = 300;     // radio horizontal de la órbita (px)
const DEPTH = 300;      // profundidad de la órbita (px)

export function OrbitCarousel({
  items,
  favorites,
  onOpen,
  onFavorite,
  onActiveChange,
}: {
  items: Place[];
  favorites: string[];
  onOpen: (p: Place) => void;
  onFavorite: (id: string) => void;
  onActiveChange?: (p: Place) => void;
}) {
  const n = items.length;
  const pos = useMotionValue(0);
  const start = useRef(0);
  const moved = useRef(false);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  // Al cambiar la lista (otro chip), vuelve al inicio.
  useEffect(() => {
    pos.set(0);
    activeRef.current = 0;
    setActive(0);
  }, [items, pos]);

  useEffect(() => {
    if (items[active]) onActiveChange?.(items[active]);
  }, [active, items, onActiveChange]);

  useMotionValueEvent(pos, "change", (v) => {
    const a = ((Math.round(v) % n) + n) % n;
    if (a !== activeRef.current) {
      activeRef.current = a;
      setActive(a);
      tap("light");
    }
  });

  const snapTo = (target: number) => animate(pos, target, { type: "spring", stiffness: 220, damping: 28 });

  function onPanStart() {
    start.current = pos.get();
    moved.current = false;
  }
  function onPan(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 6) moved.current = true;
    pos.set(start.current - info.offset.x / 160);
  }
  function onPanEnd(_: unknown, info: PanInfo) {
    snapTo(Math.round(pos.get() - info.velocity.x / 1100));
  }

  if (!n) return null;

  return (
    <motion.div className="orbit" onPointerDownCapture={() => { moved.current = false; }} onPanStart={onPanStart} onPan={onPan} onPanEnd={onPanEnd}>
      <span className="orbit-ring" aria-hidden="true" />
      {items.map((p, i) => (
        <OrbitCard
          key={p.id}
          place={p}
          i={i}
          n={n}
          pos={pos}
          saved={favorites.includes(p.id)}
          onFavorite={() => onFavorite(p.id)}
          onClick={(rel) => {
            if (moved.current) return;
            if (Math.abs(rel) < 0.5) { tap(); onOpen(p); }
            else snapTo(Math.round(pos.get() + rel));
          }}
        />
      ))}
    </motion.div>
  );
}

function wrap(d: number, n: number) {
  let r = ((d % n) + n) % n;
  if (r > n / 2) r -= n;
  return r;
}

function OrbitCard({ place, i, n, pos, saved, onFavorite, onClick }: {
  place: Place; i: number; n: number; pos: MotionValue<number>; saved: boolean;
  onFavorite: () => void; onClick: (rel: number) => void;
}) {
  const rel = useTransform(pos, (v) => wrap(i - v, n));
  const x = useTransform(rel, (d) => Math.sin(d * STEP) * RADIUS);
  const z = useTransform(rel, (d) => (Math.cos(d * STEP) - 1) * DEPTH);
  const rotateY = useTransform(rel, (d) => d * 42);
  const opacity = useTransform(rel, (d) => Math.max(0, 1 - Math.abs(d) * 0.34));
  const zIndex = useTransform(rel, (d) => 100 - Math.round(Math.abs(d) * 10));
  const glow = useTransform(rel, (d) => Math.max(0, 1 - Math.abs(d) * 1.6));
  const shadow = useTransform(glow, (g) => `0 0 0 ${2 * g}px rgba(157,147,255,${g}), 0 0 ${44 * g}px -6px rgba(123,109,255,${g}), 0 30px 50px -20px rgba(0,0,0,.9)`);

  return (
    <motion.article
      className="orbit-card"
      style={{ x, z, rotateY, opacity, zIndex, boxShadow: shadow }}
      onClick={() => onClick(rel.get())}
      aria-label={place.name}
    >
      <div className="orbit-photo" style={place.image ? { backgroundImage: `url('${place.image}')` } : undefined} />
      <div className="orbit-shade" />
      <FavButton saved={saved} onToggle={onFavorite} className="orbit-fav" />
    </motion.article>
  );
}
