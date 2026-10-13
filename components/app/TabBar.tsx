"use client";

import { motion } from "motion/react";
import { Compass, Heart, MessageCircle, Navigation, Search } from "lucide-react";
import { tap } from "@/lib/haptics";

export type Tab = "Inicio" | "Explorar" | "Ruta" | "Chat" | "Guardados";

export const TABS: { id: Tab; icon: typeof Compass }[] = [
  { id: "Inicio", icon: Compass },
  { id: "Explorar", icon: Search },
  { id: "Ruta", icon: Navigation },
  { id: "Chat", icon: MessageCircle },
  { id: "Guardados", icon: Heart },
];

export function TabBar({ active, onChange, savedCount }: { active: Tab; onChange: (tab: Tab) => void; savedCount: number }) {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map(({ id, icon: Icon }) => {
        const isActive = id === active;
        return (
          <motion.button
            key={id}
            className={`tab ${isActive ? "is-active" : ""}`}
            onClick={() => { if (!isActive) { tap(); onChange(id); } }}
            whileTap={{ scale: 0.86 }}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && <motion.span layoutId="tab-blob" className="tab-blob" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            <motion.span
              className="tab-icon"
              animate={isActive ? { y: [0, -5, 0], rotate: [0, -10, 0] } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
              {id === "Guardados" && savedCount > 0 && (
                <motion.span key={savedCount} className="tab-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                  {savedCount}
                </motion.span>
              )}
            </motion.span>
            <span className="tab-label">{id}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
