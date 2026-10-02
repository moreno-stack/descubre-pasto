"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, AtSign, LockKeyhole, Mountain, UserRound, X } from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type AuthMode = "login" | "register" | "recover" | "update-password";

const headings: Record<AuthMode, { eyebrow: string; title: string; description: string }> = {
  login: { eyebrow: "QUÉ BUENO VERTE", title: "Inicia sesión", description: "Entra para guardar tus lugares y preferencias." },
  register: { eyebrow: "EMPIEZA A EXPLORAR", title: "Crea tu cuenta", description: "Guarda tus intereses y arma recorridos para tu próxima visita." },
  recover: { eyebrow: "RECUPERA TU ACCESO", title: "Restablece tu contraseña", description: "Te enviaremos un enlace al correo asociado a tu cuenta." },
  "update-password": { eyebrow: "CASI LISTO", title: "Crea una contraseña nueva", description: "Elige una contraseña segura para volver a tu cuenta." },
};

function readableAuthError(error: unknown) {
  if (!(error instanceof Error)) return "No pudimos completar la solicitud. Inténtalo de nuevo.";
  const message = error.message.toLocaleLowerCase("es");
  if (message.includes("invalid login credentials")) return "El correo o la contraseña no son correctos.";
  if (message.includes("email not confirmed")) return "Confirma tu correo desde el enlace que te enviamos.";
  if (message.includes("user already registered") || message.includes("already been registered")) return "Ya existe una cuenta con ese correo. Inicia sesión.";
  if (message.includes("password should be") || message.includes("password is too weak")) return "La contraseña no cumple los requisitos de seguridad.";
  if (message.includes("provider is not enabled") || message.includes("unsupported provider")) return "El acceso con Google aún no está habilitado en Supabase.";
  if (message.includes("rate limit") || message.includes("too many requests")) return "Hiciste varias solicitudes. Espera un momento e inténtalo otra vez.";
  return error.message;
}

export function AuthDialog({ initialMode = "login", onClose }: { initialMode?: AuthMode; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();
  const supabase = getSupabaseClient();
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
    if (!supabase) {
      setError("Supabase aún no está conectado. Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local y reinicia npm run dev. Consulta README.md.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        onClose();
      } else if (mode === "register") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (authError) throw authError;
        if (data.session) onClose();
        else setMessage("Revisa tu correo para confirmar la cuenta y terminar el registro.");
      } else if (mode === "recover") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/?auth=reset`,
        });
        if (authError) throw authError;
        setMessage("Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.");
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Tu contraseña fue actualizada. Ya puedes continuar.");
        window.setTimeout(onClose, 1200);
      }
    } catch (authError) {
      setError(readableAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    if (!supabase) {
      setError("Google requiere conectar Supabase y habilitar el proveedor Google. Consulta los pasos de README.md.");
      return;
    }

    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (authError) {
      setError(readableAuthError(authError));
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button auth-close" onClick={onClose} aria-label="Cerrar inicio de sesión"><X size={18} /></button>
        <div className="auth-brand-mark"><Mountain size={23} /></div>
        <p className="eyebrow">{heading.eyebrow}</p>
        <h2 id="auth-title">{heading.title}</h2>
        <p className="auth-description">{heading.description}</p>

        {mode === "login" && <button className="google-button" type="button" onClick={() => void handleGoogleSignIn()} disabled={busy}><span className="google-mark">G</span>Continuar con Google</button>}
        {mode === "login" && <div className="auth-divider"><span>o con tu correo</span></div>}

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          {mode === "register" && <label className="auth-field"><span>Nombre</span><span className="auth-input-wrap"><UserRound size={16} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required maxLength={80} /></span></label>}
          {mode !== "update-password" && <label className="auth-field"><span>Correo electrónico</span><span className="auth-input-wrap"><AtSign size={16} /><input type="text" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" /></span></label>}
          {mode !== "recover" && <label className="auth-field"><span>Contraseña</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input type="password" autoComplete={mode === "register" || mode === "update-password" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "update-password" ? "Nueva contraseña" : "Mínimo 8 caracteres"} minLength={8} required /></span></label>}
          {error && <p className={`auth-feedback ${configured ? "error" : "setup"}`} role="alert">{error}</p>}
          {message && <p className="auth-feedback success" role="status">{message}</p>}
          {!configured && !error && <p className="auth-setup-note">Conecta Supabase para crear cuentas e iniciar sesión. Completa sus dos variables en .env.local; ver README.md. También puedes seguir explorando sin cuenta.</p>}
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Un momento..." : mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : mode === "recover" ? "Enviar enlace" : "Guardar contraseña"}</button>
        </form>

        {mode === "login" && <div className="auth-links"><button onClick={() => changeMode("recover")}>¿Olvidaste tu contraseña?</button><span>¿Aún no tienes cuenta? <button onClick={() => changeMode("register")}>Regístrate</button></span></div>}
        {mode === "register" && <p className="auth-switch">¿Ya tienes cuenta? <button onClick={() => changeMode("login")}>Inicia sesión</button></p>}
        {mode === "recover" && <p className="auth-switch"><button onClick={() => changeMode("login")}><ArrowLeft size={14} /> Volver a iniciar sesión</button></p>}
        {(mode === "login" || mode === "register") && <button className="auth-guest" type="button" onClick={onClose}>Seguir explorando sin cuenta</button>}
      </section>
    </div>
  );
}