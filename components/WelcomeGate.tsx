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

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, type: "spring" as const, stiffness: 200, damping: 24 },
});

export function WelcomeGate({ onSignIn, onRegister, onGuest }: WelcomeGateProps) {
  return (
    <main className="welcome">
      <div className="welcome-photo" aria-hidden="true" />
      <div className="welcome-fade" aria-hidden="true" />
      <motion.header className="welcome-brand" {...rise(0.05)}>
        <BarnizMark size={34} /> Descubre Pasto
      </motion.header>
      <section className="welcome-copy">
        <motion.h1 {...rise(0.15)}>Tu próxima historia empieza en Pasto.</motion.h1>
        <motion.p {...rise(0.25)}>Guarda lugares, pregunta lo que quieras y arma recorridos a tu medida.</motion.p>
        <motion.div className="welcome-actions" {...rise(0.35)}>
          <motion.button className="btn btn-oro btn-lg btn-block" whileTap={{ scale: 0.96 }} onClick={() => { tap(); onSignIn(); }}>
            <LogIn size={18} /> Iniciar sesión
          </motion.button>
          <motion.button className="btn btn-glass btn-lg btn-block" whileTap={{ scale: 0.96 }} onClick={() => { tap(); onRegister(); }}>
            <UserRoundPlus size={18} /> Crear cuenta
          </motion.button>
          <button className="link welcome-guest" onClick={() => { tap(); onGuest(); }}>Entrar como visitante</button>
        </motion.div>
      </section>
    </main>
  );
}
