"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Heart, Navigation, Trash2 } from "lucide-react";
import { places, type Place } from "@/lib/places";
import { tap } from "@/lib/haptics";

type Props = {
  favorites: string[];
  onOpenPlace: (p: Place) => void;
  onRemove: (id: string) => void;
  onPlanWithSaved: () => void;
  onExplore: () => void;
};

export function SavedScreen({ favorites, onOpenPlace, onRemove, onPlanWithSaved, onExplore }: Props) {
  const saved = favorites.map((id) => places.find((p) => p.id === id)).filter(Boolean) as Place[];

  return (
    <div className="screen-scroll">
      <header className="screen-head">
        <h1 className="screen-title">Guardados</h1>
        {saved.length > 0 && <p className="screen-sub">Desliza un lugar a la izquierda para quitarlo.</p>}
      </header>

      {saved.length > 0 && (
        <motion.button className="btn btn-oro btn-block" whileTap={{ scale: 0.96 }} onClick={() => { tap("medium"); onPlanWithSaved(); }}>
          <Navigation size={17} /> Armar ruta con {saved.length === 1 ? "este lugar" : `estos ${saved.length} lugares`}
        </motion.button>
      )}

      <ul className="saved-list">
        <AnimatePresence initial={false}>
          {saved.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300, height: 0, marginBottom: 0, transition: { duration: 0.28 } }}
              className="saved-row"
            >
              <span className="saved-trash" aria-hidden="true"><Trash2 size={20} /></span>
              <motion.div
                className="saved-card"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.6, right: 0.05 }}
                onDragEnd={(_: unknown, info: PanInfo) => { if (info.offset.x < -110) { tap("medium"); onRemove(p.id); } }}
                onClick={() => onOpenPlace(p)}
              >
                <div className="saved-photo" style={p.image ? { backgroundImage: `url('${p.image}')` } : undefined} />
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.category}{p.visitMinutes ? ` · ${p.visitMinutes} min` : ""}</p>
                </div>
              </motion.div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!saved.length && (
        <div className="empty empty-big">
          <motion.span className="empty-heart" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <Heart size={34} />
          </motion.span>
          <h2>Aún no guardas lugares</h2>
          <p>Toca el corazón en cualquier foto y aparecerá aquí para armar tu ruta.</p>
          <button className="btn btn-oro" onClick={onExplore}>Explorar lugares</button>
        </div>
      )}
    </div>
  );
}
