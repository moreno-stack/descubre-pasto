"use client";

import { motion } from "motion/react";
import { ChevronLeft, LogOut, UserRound } from "lucide-react";
import { interests, type Interest } from "@/lib/places";
import { interestStyle } from "@/lib/sections";
import { tap } from "@/lib/haptics";

type Props = {
  user: { email: string; displayName: string } | null;
  initials: string;
  favoritesCount: number;
  selectedInterests: Interest[];
  onToggleInterest: (i: Interest) => void;
  onBack: () => void;
  onSignOut: () => void;
  onRegister: () => void;
};

/** Perfil como pantalla que entra desde la derecha. */
export function ProfileScreen({ user, initials, favoritesCount, selectedInterests, onToggleInterest, onBack, onSignOut, onRegister }: Props) {
  return (
    <motion.div
      className="profile-layer"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.5 }}
      onDragEnd={(_, info) => { if (info.offset.x > 120) onBack(); }}
    >
      <div className="screen-scroll">
        <header className="profile-top">
          <button className="round-btn" onClick={onBack} aria-label="Volver"><ChevronLeft size={22} /></button>
          <h1 className="screen-title">Perfil</h1>
        </header>

        <section className="profile-card">
          <motion.span className="avatar avatar-xl" initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}>
            {initials}
          </motion.span>
          <h2>{user?.displayName ?? "Visitante"}</h2>
          <p>{user?.email ?? "Crea una cuenta para conservar tus guardados."}</p>
          <div className="profile-stats">
            <div><strong>{favoritesCount}</strong><span>guardados</span></div>
            <div><strong>{selectedInterests.length}</strong><span>intereses</span></div>
          </div>
        </section>

        <section className="block">
          <h2 className="block-title">Mis intereses</h2>
          <p className="block-sub">El asistente los usa para proponerte lugares.</p>
          <div className="interest-toggles">
            {interests.map((it) => {
              const on = selectedInterests.includes(it);
              return (
                <motion.button
                  key={it}
                  className={`toggle ${on ? "is-on" : ""}`}
                  style={{ ["--tone" as string]: interestStyle[it].color }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { tap(); onToggleInterest(it); }}
                  aria-pressed={on}
                >
                  {it}
                  <span className="toggle-track"><motion.span className="toggle-knob" layout transition={{ type: "spring", stiffness: 600, damping: 30 }} /></span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="block">
          {user ? (
            <button className="btn btn-ghost btn-block" onClick={onSignOut}><LogOut size={16} /> Cerrar sesión</button>
          ) : (
            <button className="btn btn-oro btn-block" onClick={onRegister}><UserRound size={16} /> Crear cuenta</button>
          )}
          <p className="fine">La cuenta es local: vive solo en este dispositivo y no se sincroniza.</p>
        </section>
      </div>
    </motion.div>
  );
}
