"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock3, MapPin, Navigation, Sparkles, Sun, Sunrise } from "lucide-react";
import { interests, type Interest, type Place, type PlaceCategory } from "@/lib/places";
import { highlights, interestStyle, placesFor } from "@/lib/sections";
import { tap } from "@/lib/haptics";
import { BarnizMark } from "@/components/app/BarnizMark";
import { OrbitCarousel } from "@/components/app/OrbitCarousel";

type Props = {
  displayName: string;
  initials: string;
  favorites: string[];
  apiConnected: boolean | null;
  onOpenPlace: (p: Place, layoutKey?: string) => void;
  onFavorite: (id: string) => void;
  onExplore: (opts: { interest?: Interest; categories?: PlaceCategory[] }) => void;
  onPlan: (opts: { interest?: Interest; hours?: number }) => void;
  onRoutePlace: (p: Place) => void;
  onProfile: () => void;
  onSaved: () => void;
};

const withPhoto = (list: Place[]) => {
  const w = list.filter((p) => p.image);
  return w.length >= 3 ? w : list;
};

const ORBITS: { label: string; items: () => Place[] }[] = [
  { label: "Imperdibles", items: () => highlights },
  { label: "Templos", items: () => withPhoto(placesFor(["Templos"], 9)) },
  { label: "Plazas", items: () => withPhoto(placesFor(["Plazas"], 9)) },
  { label: "Cultura", items: () => withPhoto(placesFor(["Museos", "Cultura"], 9)) },
  { label: "Naturaleza", items: () => withPhoto(placesFor(["Naturaleza", "Parques"], 9)) },
  { label: "Sabores", items: () => withPhoto(placesFor(["Gastronomía"], 9)) },
];

const TIME_OPTIONS = [
  { label: "2 horas", hours: 2, icon: Clock3 },
  { label: "Medio día", hours: 4, icon: Sunrise },
  { label: "Todo el día", hours: 8, icon: Sun },
];

function momentOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "Pasto de mañana" : h < 19 ? "Pasto de tarde" : "Pasto de noche";
}

export function HomeScreen({ displayName, initials, favorites, apiConnected, onOpenPlace, onFavorite, onExplore, onPlan, onRoutePlace, onProfile }: Props) {
  const [moment, setMoment] = useState("Pasto hoy");
  const [orbit, setOrbit] = useState(0);
  const [current, setCurrent] = useState<Place | null>(null);
  useEffect(() => setMoment(momentOfDay()), []);

  const items = useMemo(() => ORBITS[orbit].items(), [orbit]);
  const first = displayName.split(" ")[0];

  return (
    <div className="screen-scroll">
      <header className="home-bar">
        <span className="home-brand"><BarnizMark size={28} /> Descubre Pasto</span>
        <motion.button className="avatar orbit-avatar" whileTap={{ scale: 0.9 }} onClick={() => { tap(); onProfile(); }} aria-label={`Abrir perfil de ${displayName}`}>
          {initials}
        </motion.button>
      </header>

      <section className="orbit-hero">
        <p className="orbit-kicker">{moment} · desliza para girar</p>
        <h1 className="orbit-title">¿Qué vives hoy,<br />{first}?</h1>
        <div className="chips orbit-chips" role="tablist" aria-label="Qué lugares orbitan">
          {ORBITS.map((o, i) => (
            <motion.button
              key={o.label}
              role="tab"
              aria-selected={i === orbit}
              className={`chip ${i === orbit ? "is-active" : ""}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => { tap(); setOrbit(i); }}
            >
              {o.label}
            </motion.button>
          ))}
        </div>
      </section>

      <OrbitCarousel items={items} favorites={favorites} onOpen={(p) => onOpenPlace(p)} onFavorite={onFavorite} onActiveChange={setCurrent} />

      <div className="orbit-info" aria-live="polite">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div key={current.id} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <span className="orbit-kicker">{current.category}{current.neighborhood !== "Sector por confirmar" ? ` · ${current.neighborhood}` : ""}</span>
              <h2>{current.name}</h2>
              <p className="orbit-meta">
                {current.visitMinutes ? <span><Clock3 size={14} /> {current.visitMinutes} min</span> : null}
                <span><MapPin size={14} /> Pasto</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="orbit-dots" aria-hidden="true">
          {items.map((p) => <motion.i key={p.id} animate={{ width: current?.id === p.id ? 22 : 6, opacity: current?.id === p.id ? 1 : 0.4 }} />)}
        </div>
      </div>

      <div className="orbit-cta">
        <motion.button className="btn btn-neon btn-lg" whileTap={{ scale: 0.95 }} onClick={() => { if (current) { tap("medium"); onRoutePlace(current); } }}>
          <Sparkles size={18} /> Agregar a mi ruta
        </motion.button>
        <motion.button className="btn btn-ghost orbit-open" whileTap={{ scale: 0.9 }} onClick={() => current && onOpenPlace(current)} aria-label="Ver ficha del lugar">
          <Navigation size={18} />
        </motion.button>
      </div>

      <section className="block">
        <h2 className="block-title">¿Cuánto tiempo tienes?</h2>
        <p className="block-sub">{apiConnected === false ? "El asistente funciona en modo básico ahora mismo." : "La IA arma tu órbita del día con tus intereses."}</p>
        <div className="time-row">
          {TIME_OPTIONS.map(({ label, hours, icon: Icon }) => (
            <motion.button key={label} className="time-tile" whileTap={{ scale: 0.93 }} onClick={() => { tap("medium"); onPlan({ hours }); }}>
              <Icon size={22} />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="block-title">¿Qué te mueve?</h2>
        <div className="interest-chips">
          {interests.map((it) => {
            const { color, icon: Icon } = interestStyle[it];
            return (
              <motion.button key={it} className="interest-chip" style={{ ["--tone" as string]: color }} whileTap={{ scale: 0.92 }} onClick={() => { tap(); onExplore({ interest: it }); }}>
                <Icon size={16} /> {it}
              </motion.button>
            );
          })}
        </div>
      </section>
      <p className="home-foot">Pasto, Nariño · Colombia</p>
    </div>
  );
}
