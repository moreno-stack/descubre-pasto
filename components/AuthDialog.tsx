"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, AtSign, LockKeyhole, UserRound, X } from "lucide-react";
import { BarnizMark } from "@/components/app/BarnizMark";
import { registerDemoAccount, signInDemoAccount } from "@/lib/demoAuth";

export type AuthMode = "login" | "register" | "recover";

export interface AuthDialogProps {
  initialMode?: AuthMode;
  onClose: () => void;
}

const headings: Record<AuthMode, { eyebrow: string; title: string; description: string }> = {
  login: { eyebrow: "Qué bueno verte", title: "Inicia sesión", description: "Entra para guardar tus lugares y preferencias." },
  register: { eyebrow: "Empieza a explorar", title: "Crea tu cuenta", description: "Guarda tus intereses y arma recorridos para tu próxima visita." },
  recover: { eyebrow: "Recupera tu acceso", title: "Restablece tu contraseña", description: "Te enviaremos un enlace al correo asociado a tu cuenta." },
};

function readableAuthError(error: unknown) {
  if (!(error instanceof Error)) return "No pudimos completar la solicitud. Inténtalo de nuevo.";
  return error.message;
}

export function AuthDialog({ initialMode = "login", onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const heading = headings[mode];

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setError("");
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInDemoAccount(email, password);
        onClose();
      } else if (mode === "register") {
        await registerDemoAccount(email, name, password);
        onClose();
      } else if (mode === "recover") {
        setMessage("El restablecimiento automático no está disponible en el modo local. Puedes crear otra cuenta con un correo distinto.");
      }
    } catch (authError) {
      setError(readableAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section
        className="sheet auth-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
      >
        <div className="sheet-grab"><span /></div>
        <button className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <div className="auth-mark"><BarnizMark size={44} /></div>
        <p className="auth-kicker">{heading.eyebrow}</p>
        <h2 id="auth-title">{heading.title}</h2>
        <p className="auth-description">{heading.description}</p>

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          {mode === "register" && <label className="auth-field"><span>Nombre</span><span className="auth-input-wrap"><UserRound size={16} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required maxLength={80} /></span></label>}
          <label className="auth-field"><span>Correo electrónico</span><span className="auth-input-wrap"><AtSign size={16} /><input type="text" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" /></span></label>
          {mode !== "recover" && <label className="auth-field"><span>Contraseña</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required /></span></label>}
          {error && <p className="auth-feedback error" role="alert">{error}</p>}
          {message && <p className="auth-feedback success" role="status">{message}</p>}
          {mode !== "recover" && <p className="auth-setup-note">Cuenta local de este dispositivo; no se envía correo ni se sincroniza con otros dispositivos.</p>}
          <button className="btn btn-oro btn-lg btn-block auth-submit" type="submit" disabled={busy}>{busy ? "Un momento..." : mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "Continuar"}</button>
        </form>

        {mode === "login" && <div className="auth-links"><button onClick={() => changeMode("recover")}>¿Olvidaste tu contraseña?</button><span>¿Aún no tienes cuenta? <button onClick={() => changeMode("register")}>Regístrate</button></span></div>}
        {mode === "register" && <p className="auth-switch">¿Ya tienes cuenta? <button onClick={() => changeMode("login")}>Inicia sesión</button></p>}
        {mode === "recover" && <p className="auth-switch"><button onClick={() => changeMode("login")}><ArrowLeft size={14} /> Volver a iniciar sesión</button></p>}
        {(mode === "login" || mode === "register") && <button className="auth-guest" type="button" onClick={onClose}>Seguir explorando sin cuenta</button>}
      </motion.section>
    </motion.div>
  );
}