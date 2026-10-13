"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock3, MapPin, RefreshCw, Send, Sparkles } from "lucide-react";
import { places, type Interest, type Place } from "@/lib/places";
import type { Recommendation } from "@/lib/types";
import { apiUrl, checkGroq } from "@/lib/api";
import { success, tap } from "@/lib/haptics";
import { useBurst } from "@/components/app/Burst";
import { FavButton } from "@/components/app/PlaceCard";
import { RichText, TypingDots, bubbleMotion } from "@/components/app/ChatBits";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendation?: Recommendation;
};

type Step = "time" | "budget" | "interests" | "custom" | "generating" | "done";
type RouteData = { hours?: number; budget?: string; interests?: Interest[]; customNote?: string };

export type RouteContext = {
  prefilledInterests?: Interest[];
  prefilledFavorites?: string[];
  hours?: number;
  source?: "inicio" | "explorar" | "favoritos" | "chat";
};

type RouteAssistantProps = {
  favorites: string[];
  onRecommendationGenerated?: (recommendation: Recommendation) => void;
  onFavoriteToggle?: (id: string) => void;
  onPlaceSelect?: (place: Place) => void;
  routeContext?: RouteContext;
  onContextCleared?: () => void;
};

const STEPS: { id: Step; label: string }[] = [
  { id: "time", label: "Tiempo" },
  { id: "budget", label: "Presupuesto" },
  { id: "interests", label: "Intereses" },
  { id: "custom", label: "Detalles" },
  { id: "done", label: "Ruta" },
];

const QUICK: Partial<Record<Step, string[]>> = {
  time: ["2 horas", "3 horas", "4 horas", "Todo el día"],
  budget: ["Bajo", "Medio", "Alto"],
  interests: ["Cultura", "Historia", "Gastronomía", "Naturaleza", "Cultura e historia", "Todo"],
  custom: ["Quiero probar comida típica", "Lugares fotogénicos", "Con niños", "No, así está bien"],
  done: ["Nuevo recorrido"],
};

const PLACEHOLDER: Partial<Record<Step, string>> = {
  time: "Ej: 3 horas",
  budget: "Ej: medio",
  interests: "Ej: cultura y comida",
};

const welcome = (): Message => ({
  id: `welcome-${Date.now()}`,
  role: "assistant",
  content: "¡Hola! Te ayudo a armar un recorrido por Pasto en cuatro preguntas.\n\n¿Cuánto tiempo tienes disponible?",
  timestamp: new Date(),
});

export function RouteAssistant({ favorites, onRecommendationGenerated, onFavoriteToggle, onPlaceSelect, routeContext, onContextCleared }: RouteAssistantProps) {
  const [groqConnected, setGroqConnected] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([welcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStepState] = useState<Step>("time");
  const endRef = useRef<HTMLDivElement>(null);
  const fire = useBurst();

  // Refs para que cada envío lea el estado más reciente (evita datos viejos al generar la ruta).
  const stepRef = useRef<Step>("time");
  const dataRef = useRef<RouteData>({});
  const messagesRef = useRef<Message[]>(messages);
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const setStep = (s: Step) => { stepRef.current = s; setStepState(s); };
  const patchData = (patch: RouteData) => { dataRef.current = { ...dataRef.current, ...patch }; };
  const push = (m: Message) => { messagesRef.current = [...messagesRef.current, m]; setMessages(messagesRef.current); };

  useEffect(() => { checkGroq().then(setGroqConnected); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading]);

  const reset = useCallback((intro?: string) => {
    dataRef.current = {};
    const first = intro ? { ...welcome(), content: intro } : welcome();
    messagesRef.current = [first];
    setMessages(messagesRef.current);
    setStep("time");
    setInput("");
  }, []);

  async function generateRecommendation(customNote: string) {
    const data = dataRef.current;
    const prompt = `${data.interests?.join(", ") ?? ""}, ${data.hours ?? 3} horas${data.budget ? `, presupuesto ${data.budget}` : ""}. ${customNote}`.trim();
    try {
      const response = await fetch(apiUrl("/api/recommend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          hours: data.hours,
          budget: data.budget,
          interests: data.interests,
          favorites: favoritesRef.current,
          start: "Centro histórico",
        }),
      });
      const rec = await response.json();
      if (!response.ok) throw new Error(rec.error || "Error al generar recomendación");
      const recommendation = rec as Recommendation;

      push({
        id: `rec-${Date.now()}`,
        role: "assistant",
        content: recommendation.route.length
          ? `Tu recorrido está listo: **${recommendation.route.length} paradas** en unos **${recommendation.estimatedMinutes} minutos**.`
          : "No encontré lugares que encajen con esos datos. Prueba con más tiempo u otros intereses.",
        timestamp: new Date(),
        recommendation: recommendation.route.length ? recommendation : undefined,
      });
      setStep("done");
      if (recommendation.route.length) {
        success();
        fire(window.innerWidth / 2, window.innerHeight * 0.45, 1.6);
        onRecommendationGenerated?.(recommendation);
      }
    } catch {
      push({ id: `err-${Date.now()}`, role: "assistant", content: "No pude generar el recorrido. Revisa tu conexión y vuelve a intentarlo.", timestamp: new Date() });
      setStep("custom");
    }
  }

  async function processUserInput(userInput: string) {
    try {
      const response = await fetch(apiUrl("/api/chat-assistant"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          context: {
            currentStep: stepRef.current,
            routeData: dataRef.current,
            favorites: favoritesRef.current,
            conversationHistory: messagesRef.current.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al procesar mensaje");

      push({ id: `ai-${Date.now()}`, role: "assistant", content: data.message, timestamp: new Date() });

      const action = data.action;
      if (!action) return;
      if (action.type === "update_route_data") {
        patchData(action.data ?? {});
        if (action.step) {
          setStep(action.step);
          if (action.step === "generating") await generateRecommendation(action.data?.customNote || dataRef.current.customNote || "");
        }
      } else if (action.type === "change_step") {
        setStep(action.step);
      } else if (action.type === "generate_recommendation") {
        setStep("generating");
        await generateRecommendation(action.customNote || dataRef.current.customNote || "");
      }
    } catch {
      push({ id: `err-${Date.now()}`, role: "assistant", content: "No pude procesar tu respuesta. Revisa tu conexión y vuelve a intentarlo.", timestamp: new Date() });
    }
  }

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    if (stepRef.current === "done" && /^(s[ií]|nuevo|nueva|otra|otro)\b|nuevo recorrido/i.test(value)) {
      tap();
      reset("¡Listo, empecemos otro! ¿Cuánto tiempo tienes esta vez?");
      return;
    }
    tap();
    push({ id: `u-${Date.now()}`, role: "user", content: value, timestamp: new Date() });
    setInput("");
    setLoading(true);
    try { await processUserInput(value); } finally { setLoading(false); }
  }

  // Contexto que llega desde Inicio, Explorar, Guardados o el chat.
  const sendRef = useRef(send);
  sendRef.current = send;
  useEffect(() => {
    if (!routeContext || (!routeContext.prefilledInterests?.length && !routeContext.prefilledFavorites?.length && !routeContext.hours)) return;
    const ctx = routeContext;
    onContextCleared?.();

    if (ctx.prefilledInterests?.length) {
      reset(`Vamos con **${ctx.prefilledInterests.join(" y ")}**. ¿Cuánto tiempo tienes disponible?`);
      patchData({ interests: ctx.prefilledInterests });
    } else if (ctx.prefilledFavorites?.length) {
      const names = places.filter((p) => ctx.prefilledFavorites?.includes(p.id)).map((p) => p.name);
      reset(`Incluyo tus guardados: **${names.slice(0, 3).join(", ")}${names.length > 3 ? "…" : ""}**. ¿Cuánto tiempo tienes?`);
      patchData({ customNote: `Incluir favoritos: ${names.join(", ")}` });
    } else {
      reset();
    }
    if (ctx.hours) {
      const h = ctx.hours >= 8 ? "Todo el día" : `${ctx.hours} horas`;
      window.setTimeout(() => void sendRef.current(h), 450);
    }
  }, [routeContext, onContextCleared, reset]);

  const stepIndex = step === "generating" ? 3.5 : STEPS.findIndex((s) => s.id === step);

  return (
    <div className="convo">
      <header className="convo-head route-head">
        <div className="route-head-row">
          <div>
            <h1>Tu recorrido</h1>
            <p className={`ai-status is-${groqConnected === null ? "checking" : groqConnected ? "connected" : "disconnected"}`}>
              <span className="ai-dot" />
              {groqConnected === null ? "Conectando…" : groqConnected ? "IA activa" : "Modo básico"}
            </p>
          </div>
          <motion.button className="round-btn" whileTap={{ rotate: -180, scale: 0.9 }} onClick={() => reset()} aria-label="Empezar de nuevo">
            <RefreshCw size={18} />
          </motion.button>
        </div>
        <ol className="steps" aria-label="Progreso">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i < stepIndex ? "is-done" : i === Math.round(stepIndex) ? "is-now" : ""}>
              <span className="step-bar"><motion.span initial={false} animate={{ scaleX: i < stepIndex ? 1 : i === Math.round(stepIndex) ? 0.5 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} /></span>
              <small>{s.label}</small>
            </li>
          ))}
        </ol>
      </header>

      <div className="convo-scroll">
        {messages.map((m) => (
          <motion.div key={m.id} className={`bubble-row ${m.role === "user" ? "from-user" : "from-ai"}`} {...bubbleMotion(m.role === "user")}>
            <div className={`bubble ${m.recommendation ? "bubble-wide" : ""}`}>
              <RichText text={m.content} />
              {m.recommendation && (
                <RouteTimeline rec={m.recommendation} favorites={favorites} onOpen={onPlaceSelect} onFavorite={onFavoriteToggle} />
              )}
              <time>{m.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</time>
            </div>
          </motion.div>
        ))}
        {(loading || step === "generating") && (
          <motion.div className="bubble-row from-ai" {...bubbleMotion(false)}>
            <div className="bubble">
              {step === "generating" ? <span className="generating"><TypingDots label="Generando ruta" /> Trazando tu ruta por Pasto</span> : <TypingDots />}
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {step !== "generating" && (
        <div className="convo-dock">
          <AnimatePresence mode="popLayout">
            {QUICK[step] && (
              <motion.div key={step} className="suggest-rail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {QUICK[step]!.map((s, i) => (
                  <motion.button
                    key={s}
                    className="suggest"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => void send(s)}
                    disabled={loading}
                  >
                    <Sparkles size={12} /> {s}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <form className="composer" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={PLACEHOLDER[step] ?? "Escribe tu respuesta"} disabled={loading} aria-label="Respuesta" />
            <motion.button type="submit" className="send" disabled={loading || !input.trim()} whileTap={{ scale: 0.85, rotate: -20 }} aria-label="Enviar">
              <Send size={18} />
            </motion.button>
          </form>
        </div>
      )}
    </div>
  );
}

/** Paradas del recorrido unidas por una línea que se dibuja de arriba hacia abajo. */
function RouteTimeline({ rec, favorites, onOpen, onFavorite }: { rec: Recommendation; favorites: string[]; onOpen?: (p: Place) => void; onFavorite?: (id: string) => void }) {
  return (
    <>
    <div className="timeline">
      <motion.span className="timeline-line" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.25 * rec.route.length + 0.3, ease: "easeInOut" }} />
      {rec.route.map((stop, i) => {
        const place = places.find((p) => p.id === stop.id);
        if (!place) return null;
        return (
          <motion.div
            key={stop.id}
            className="stop"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 * i + 0.2, type: "spring", stiffness: 260, damping: 24 }}
          >
            <motion.span className="stop-pin" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25 * i + 0.25, type: "spring", stiffness: 500, damping: 14 }}>
              {i + 1}
            </motion.span>
            <button className="stop-card" onClick={() => onOpen?.(place)}>
              <span className="stop-photo" style={place.image ? { backgroundImage: `url('${place.image}')` } : undefined} />
              <span className="stop-copy">
                <strong>{stop.name}</strong>
                <small><Clock3 size={11} /> {stop.minutes} min <MapPin size={11} /> {stop.distanceKm} km</small>
                <em>{stop.reason}</em>
              </span>
            </button>
            {onFavorite && <FavButton saved={favorites.includes(place.id)} onToggle={() => onFavorite(place.id)} className="stop-fav" />}
          </motion.div>
        );
      })}
      </div>
      {rec.note && <p className="timeline-note">{rec.note}</p>}
    </>
  );
}
