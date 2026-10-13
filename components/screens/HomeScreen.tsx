"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Clock3, Sun, Sunrise } from "lucide-react";
import { interests, type Interest, type Place, type PlaceCategory } from "@/lib/places";
import { highlights, interestStyle, placesFor, sections } from "@/lib/sections";
import { tap } from "@/lib/haptics";
import { BarnizMark } from "@/components/app/BarnizMark";
import { RailCard } from "@/components/app/PlaceCard";

type Props = {
  displayName: string;
  initials: string;
  favorites: string[];
  apiConnected: boolean | null;
  onOpenPlace: (p: Place, layoutKey?: string) => void;
  onFavorite: (id: string) => void;
  onExplore: (opts: { interest?: Interest; categories?: PlaceCategory[] }) => void;
  onPlan: (opts: { interest?: Interest; hours?: number }) => void;
  onProfile: () => void;
};

const TIME_OPTIONS = [
  { label: "2 horas", hours: 2, icon: Clock3 },
  { label: "Medio día", hours: 4, icon: Sunrise },
  { label: "Todo el día", hours: 8, icon: Sun },
];

export function HomeScreen({ displayName, initials, favorites, apiConnected, onOpenPlace, onFavorite, onExplore, onPlan, onProfile }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const photoY = useTransform(scrollY, [0, 420], [0, 140]);
  const photoScale = useTransform(scrollY, [-200, 0], [1.35, 1]);
  const copyOpacity = useTransform(scrollY, [0, 260], [1, 0]);
  const copyY = useTransform(scrollY, [0, 260], [0, -40]);
  const barBg = useTransform(scrollY, [240, 320], ["rgba(22,18,31,0)", "rgba(22,18,31,0.92)"]);

  return (
    <div className="screen-scroll" ref={scrollRef}>
      <motion.header className="home-bar" style={{ backgroundColor: barBg }}>
        <span className="home-brand"><BarnizMark size={30} /> Descubre Pasto</span>
        <motion.button className="avatar" whileTap={{ scale: 0.9 }} onClick={() => { tap(); onProfile(); }} aria-label={`Abrir perfil de ${displayName}`}>
          {initials}
        </motion.button>
      </motion.header>

      <section className="hero">
        <motion.div className="hero-photo" style={{ y: photoY, scale: photoScale }} />
        <div className="hero-fade" />
        <motion.div className="hero-copy" style={{ opacity: copyOpacity, y: copyY }}>
          <p className="hero-hello">Hola, {displayName.split(" ")[0]}</p>
          <h1>Pasto,<br />a tu ritmo.</h1>
          <p className="hero-lead">Templos, carnaval, laguna y volcán. Dinos cuánto tiempo tienes y armamos la ruta.</p>
          <motion.button className="btn btn-oro btn-lg" whileTap={{ scale: 0.95 }} onClick={() => { tap("medium"); onPlan({}); }}>
            Armar mi recorrido <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      <div className="home-body">
        <section className="block">
          <h2 className="block-title">¿Qué te mueve hoy?</h2>
          <div className="interest-grid">
            {interests.map((it, i) => {
              const { color, icon: Icon, hint } = interestStyle[it];
              return (
                <motion.button
                  key={it}
                  className="interest-tile"
                  style={{ ["--tone" as string]: color }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 22 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { tap(); onExplore({ interest: it }); }}
                >
                  <span className="interest-icon"><Icon size={20} /></span>
                  <strong>{it}</strong>
                  <small>{hint}</small>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="block">
          <div className="block-head">
            <h2 className="block-title">Imperdibles</h2>
            <button className="link" onClick={() => onExplore({})}>Ver todo</button>
          </div>
          <div className="rail rail-big">
            {highlights.map((p) => (
              <RailCard key={p.id} ctx="top" place={p} saved={favorites.includes(p.id)} onOpen={(k) => onOpenPlace(p, k)} onFavorite={() => onFavorite(p.id)} />
            ))}
          </div>
        </section>

        <section className="block time-block">
          <h2 className="block-title">¿Cuánto tiempo tienes?</h2>
          <p className="block-sub">
            {apiConnected === false ? "El asistente funciona en modo básico ahora mismo." : "El asistente arma la ruta con tus intereses y guardados."}
          </p>
          <div className="time-row">
            {TIME_OPTIONS.map(({ label, hours, icon: Icon }) => (
              <motion.button key={label} className="time-tile" whileTap={{ scale: 0.93 }} onClick={() => { tap("medium"); onPlan({ hours }); }}>
                <Icon size={22} />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {sections.slice(0, 6).map((s) => {
          const list = placesFor(s.categories);
          if (!list.length) return null;
          const Icon = s.icon;
          return (
            <section className="block" key={s.title}>
              <div className="block-head">
                <h2 className="block-title"><Icon size={18} aria-hidden="true" /> {s.title}</h2>
                <button className="link" onClick={() => onExplore({ categories: s.categories })}>Ver más</button>
              </div>
              <div className="rail">
                {list.map((p) => (
                  <RailCard key={p.id} ctx={s.title} place={p} saved={favorites.includes(p.id)} onOpen={(k) => onOpenPlace(p, k)} onFavorite={() => onFavorite(p.id)} />
                ))}
              </div>
            </section>
          );
        })}
        <p className="home-foot">Pasto, Nariño · Colombia</p>
      </div>
    </div>
  );
}
