"use client";

import { motion } from "motion/react";
import { LogIn, UserRoundPlus } from "lucide-react";
import { BarnizMark } from "@/components/app/BarnizMark";
import { tap } from "@/lib/haptics";

export interface WelcomeGateProps {
  onSignIn: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

const PHOTOS = [
  "catedral-san-juan", "carnaval", "laguna-cocha", "mercado-local", "plaza-narino", "templo-cristo-rey",
];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, type: "spring" as const, stiffness: 200, damping: 24 },
});

export function WelcomeGate({ onSignIn, onRegister, onGuest }: WelcomeGateProps) {
  return (
    <main className="welcome welcome-orbit">
      <div className="welcome-system" aria-hidden="true">
        <span className="ringline" style={{ width: 236, height: 236 }} />
        <span className="ringline" style={{ width: 150, height: 150, opacity: 0.6 }} />
        <div className="welcome-spin">
          {PHOTOS.map((name, i) => {
            const a = (i / PHOTOS.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <motion.span
                key={name}
                className="welcome-photo-orb"
                style={{ left: 130 + Math.cos(a) * 118 - 34, top: 130 + Math.sin(a) * 118 - 34, backgroundImage: `url('/imagenes/${name}.jpg')` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 260, damping: 16 }}
              />
            );
          })}
        </div>
        <motion.span className="welcome-core" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}>
          <BarnizMark size={54} />
        </motion.span>
      </div>

      <section className="welcome-copy">
        <motion.h1 {...rise(0.3)}>Todo Pasto gira a tu alrededor.</motion.h1>
        <motion.p {...rise(0.4)}>Guarda lugares, pregúntale a la IA y arma tu ruta en minutos.</motion.p>
        <motion.div className="welcome-actions" {...rise(0.5)}>
          <motion.button className="btn btn-neon btn-lg btn-block" whileTap={{ scale: 0.96 }} onClick={() => { tap(); onSignIn(); }}>
            <LogIn size={18} /> Iniciar sesión
          </motion.button>
          <motion.button className="btn btn-ghost btn-lg btn-block" whileTap={{ scale: 0.96 }} onClick={() => { tap(); onRegister(); }}>
            <UserRoundPlus size={18} /> Crear cuenta
          </motion.button>
          <button className="link welcome-guest" onClick={() => { tap(); onGuest(); }}>Entrar como visitante</button>
        </motion.div>
      </section>
    </main>
  );
}
