"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { places, type Interest, type Place, type PlaceCategory } from "@/lib/places";
import { sections } from "@/lib/sections";
import { tap } from "@/lib/haptics";
import { GridCard } from "@/components/app/PlaceCard";

export type ExploreFilter = { interest?: Interest; categories?: PlaceCategory[] };

type Props = {
  filter: ExploreFilter;
  onFilter: (f: ExploreFilter) => void;
  favorites: string[];
  onOpenPlace: (p: Place, layoutKey?: string) => void;
  onFavorite: (id: string) => void;
};

const PAGE = 16;

export function ExploreScreen({ filter, onFilter, favorites, onOpenPlace, onFavorite }: Props) {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("es");
    return places.filter((p) => {
      const byCat = filter.categories ? filter.categories.includes(p.category) : filter.interest ? p.interest === filter.interest : true;
      const byText = !q || `${p.name} ${p.neighborhood} ${p.description}`.toLocaleLowerCase("es").includes(q);
      return byCat && byText;
    });
  }, [filter, search]);

  const key = filter.categories?.join() ?? filter.interest ?? "todo";
  const activeTitle = filter.interest ?? sections.find((s) => s.categories.join() === filter.categories?.join())?.title;

  return (
    <div className="screen-scroll">
      <header className="explore-head">
        <h1 className="screen-title">Explorar</h1>
        <label className="search">
          <Search size={18} aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE); }}
            placeholder="Busca un lugar, barrio o plato"
            aria-label="Buscar lugares"
          />
          <AnimatePresence>
            {search && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => setSearch("")} aria-label="Borrar búsqueda">
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </label>
        <div className="chips" role="tablist" aria-label="Categorías">
          <Chip active={!filter.categories && !filter.interest} onClick={() => { onFilter({}); setVisible(PAGE); }}>Todo</Chip>
          {filter.interest && <Chip active onClick={() => {}}>{filter.interest}</Chip>}
          {sections.map((s) => (
            <Chip key={s.title} active={s.title === activeTitle} onClick={() => { onFilter({ categories: s.categories }); setVisible(PAGE); }}>
              {s.title}
            </Chip>
          ))}
        </div>
      </header>

      <p className="explore-count">
        {filtered.length === 1 ? "1 lugar" : `${filtered.length} lugares`}{activeTitle ? ` en ${activeTitle.toLocaleLowerCase("es")}` : ""}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={key + search} className="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {filtered.slice(0, visible).map((p, i) => (
            <GridCard key={p.id} index={i} place={p} saved={favorites.includes(p.id)} onOpen={(k) => onOpenPlace(p, k)} onFavorite={() => onFavorite(p.id)} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length > visible && (
        <button className="btn btn-ghost btn-center" onClick={() => setVisible((v) => v + PAGE)}>
          Mostrar {Math.min(PAGE, filtered.length - visible)} más
        </button>
      )}
      {!filtered.length && (
        <div className="empty">
          <p>No hay lugares con “{search}”. Prueba con otro nombre o quita el filtro.</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(""); onFilter({}); }}>Ver todos los lugares</button>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button className={`chip ${active ? "is-active" : ""}`} role="tab" aria-selected={active} whileTap={{ scale: 0.92 }} onClick={() => { tap(); onClick(); }}>
      {active && <motion.span layoutId="chip-blob" className="chip-blob" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
      <span>{children}</span>
    </motion.button>
  );
}
