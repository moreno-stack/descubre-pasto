"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
 * Entrada cinematográfica:
 * 1) una línea de luz se abre como un ojo,
 * 2) aparece "PASTO" gigante con fotos de la ciudad moviéndose dentro de las letras,
 * 3) un destello cruza el texto,
 * 4) la cámara atraviesa la letra A y entra a la app.
 */

const PHOTOS = ["carnaval", "catedral-san-juan", "laguna-cocha"];
const TOTAL = 3600;

export function Splash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 700 : TOTAL - 250);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      className="splash splash-cine"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="status"
      aria-label="Cargando Descubre Pasto"
    >
      {/* línea de luz que se abre */}
      <motion.span
        className="cine-line"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 0.9, times: [0, 0.55, 1], ease: "easeOut" }}
      />

      <motion.div
        className="cine-stage"
        initial={{ clipPath: "inset(50% 0 50% 0)" }}
        animate={{ clipPath: "inset(0% 0 0% 0)" }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
      >
        <motion.p
          className="cine-kicker"
          initial={{ opacity: 0, letterSpacing: "1.2em" }}
          animate={{ opacity: [0, 1, 1, 0], letterSpacing: "0.5em" }}
          transition={{ delay: 0.9, duration: 1.9, times: [0, 0.5, 0.85, 1], ease: "easeOut" }}
        >
          DESCUBRE
        </motion.p>

        {/* La palabra con las fotos dentro; al final la cámara la atraviesa */}
        <motion.div
          className="cine-word-wrap"
          initial={{ scale: 1.25 }}
          animate={reduce ? { scale: 1 } : { scale: [1.25, 1, 1, 16], opacity: [1, 1, 1, 0], filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(6px)"] }}
          transition={{ duration: TOTAL / 1000 - 0.1, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "linear", [0.6, 0, 0.9, 0.5]] }}
          style={{ transformOrigin: "31% 64%" }}
        >
          {PHOTOS.map((name, i) => (
            <motion.h1
              key={name}
              className="cine-word"
              style={{ backgroundImage: `url('/imagenes/${name}.jpg')` }}
              initial={{ opacity: i === 0 ? 1 : 0 }}
              animate={i === 0 ? { opacity: 1 } : { opacity: [0, 0, 1] }}
              transition={{ duration: 0.6 + i * 0.75, times: i === 0 ? undefined : [0, 0.6, 1] }}
              aria-hidden="true"
            >
              PASTO
            </motion.h1>
          ))}
          <h1 className="cine-word cine-word-sheen" aria-hidden="true">PASTO</h1>
        </motion.div>

        <motion.p
          className="cine-sub"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0, 1, 1, 0], y: 0 }}
          transition={{ delay: 1.2, duration: 1.7, times: [0, 0.3, 0.75, 1] }}
        >
          Nariño · Colombia
        </motion.p>
      </motion.div>

      {/* destello final al atravesar la letra */}
      <motion.span
        className="cine-flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.75, 0] }}
        transition={{ duration: TOTAL / 1000, times: [0, 0.9, 0.97, 1] }}
      />
      <span className="cine-grain" aria-hidden="true" />
      <span className="cine-vignette" aria-hidden="true" />
    </motion.div>
  );
}
