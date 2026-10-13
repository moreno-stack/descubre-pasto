"use client";

import { motion, useDragControls, type PanInfo } from "motion/react";
import { Clock3, MapPin, Navigation, X } from "lucide-react";
import type { Place } from "@/lib/places";
import { GooglePlaceMap } from "@/components/GooglePlaceMap";
import { FavButton } from "./PlaceCard";

type Props = {
  place: Place;
  saved: boolean;
  layoutKey?: string;
  onClose: () => void;
  onFavorite: () => void;
  onRoute: () => void;
};

/** Ficha del lugar como hoja que sube desde abajo. Se cierra arrastrando hacia abajo. */
export function PlaceSheet({ place, saved, layoutKey, onClose, onFavorite, onRoute }: Props) {
  const drag = useDragControls();

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  }

  return (
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={onDragEnd}
      >
        <div className="sheet-grab" onPointerDown={(e) => drag.start(e)}>
          <span />
        </div>
        <div className="sheet-scroll">
          <div className="sheet-photo-wrap" onPointerDown={(e) => drag.start(e)}>
            {place.image ? (
              <motion.div layoutId={layoutKey} className="sheet-photo" style={{ backgroundImage: `url('${place.image}')` }} />
            ) : (
              <motion.div layoutId={layoutKey} className="sheet-photo photo-empty"><span>Foto pendiente</span></motion.div>
            )}
            <button className="sheet-close" onClick={onClose} aria-label="Cerrar ficha"><X size={18} /></button>
          </div>

          <motion.div
            className="sheet-body"
            initial="hide"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
          >
            <Reveal><p className="sheet-kicker">{place.category} en {place.neighborhood === "Sector por confirmar" ? "Pasto" : place.neighborhood}</p></Reveal>
            <Reveal><h2 id="sheet-title">{place.name}</h2></Reveal>
            <Reveal><p className="sheet-lead">{place.description}</p></Reveal>
            {place.imageIsIllustrative && <Reveal><p className="sheet-note">La fotografía es de referencia y puede no corresponder exactamente a este sitio.</p></Reveal>}

            <Reveal className="sheet-meta">
              {place.visitMinutes && <span><Clock3 size={14} /> {place.visitMinutes} min de visita</span>}
              <span><MapPin size={14} /> {place.latitude === undefined ? "Ubicación por verificar" : place.neighborhood}</span>
            </Reveal>

            <Reveal className="sheet-actions">
              <button className="btn btn-oro" onClick={onRoute}><Navigation size={16} /> Incluir en mi ruta</button>
              <FavButton saved={saved} onToggle={onFavorite} className="sheet-fav" />
            </Reveal>

            <Reveal className="sheet-block"><h3>Historia y origen</h3><p>{place.history}</p></Reveal>
            <Reveal className="sheet-block"><h3>Fundadores o responsables</h3><p>{place.founders}</p></Reveal>
            <Reveal className="sheet-block">
              <h3>Qué hacer</h3>
              <ul>{place.activities.map((a) => <li key={a}>{a}</li>)}</ul>
            </Reveal>
            {place.historySource && <Reveal><p className="sheet-note">Fuente: {place.historySource}</p></Reveal>}
            <Reveal><GooglePlaceMap place={place} /></Reveal>
            <Reveal>
              <p className={`sheet-note ${place.verified ? "is-ok" : ""}`}>
                {place.verified ? place.schedule : "Ficha en verificación: confirma horarios y acceso con el lugar antes de ir."}
              </p>
            </Reveal>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
      {children}
    </motion.div>
  );
}
