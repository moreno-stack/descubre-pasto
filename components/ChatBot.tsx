"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Heart, Navigation, Send, Sparkles } from "lucide-react";
import { places, type Interest, type Place } from "@/lib/places";
import { apiUrl, checkGroq } from "@/lib/api";
import { tap } from "@/lib/haptics";
import { BarnizMark } from "@/components/app/BarnizMark";
import { RichText, TypingDots, bubbleMotion } from "@/components/app/ChatBits";

type MentionedPlace = { id: string; name: string; category: string; neighborhood: string; image: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mentionedPlaces?: MentionedPlace[];
  suggestsRoute?: boolean;
};

type ChatBotProps = {
  favorites: string[];
  selectedInterests: Interest[];
  activeView: string;
  onPlaceSelect: (place: Place) => void;
  onCreateRoute?: (params: { interests?: Interest[] }) => void;
  onFavoriteToggle: (id: string) => void;
};

const QUICK_SUGGESTIONS = [
  "¿Qué puedo visitar en 3 horas?",
  "Recomiéndame comida típica",
  "Lugares históricos del centro",
  "¿Qué hacer con poco presupuesto?",
];

export function ChatBot({ favorites, selectedInterests, activeView, onPlaceSelect, onCreateRoute, onFavoriteToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        selectedInterests.length > 0
          ? `¡Hola! Veo que te interesa ${selectedInterests.join(" y ")}. Cuéntame qué tienes en mente y te ayudo a planear tu visita por Pasto.`
          : "¡Hola! Soy el asistente de Descubre Pasto. Puedo recomendarte lugares, armar itinerarios o contarte sobre Pasto y Nariño.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [groqStatus, setGroqStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkGroq().then((ok) => setGroqStatus(ok ? "connected" : "disconnected"));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      tap();
      const userMessage: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch(apiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            context: { favorites, interests: selectedInterests, activeView },
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al procesar el mensaje");

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
            mentionedPlaces: data.mentionedPlaces || [],
            suggestsRoute: data.suggestsRoute || false,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              groqStatus === "disconnected"
                ? "El asistente con IA no está disponible. Revisa GROQ_API_KEY en el servidor (o NEXT_PUBLIC_API_URL en la app) y vuelve a intentarlo."
                : "No pude procesar tu mensaje. Revisa tu conexión e inténtalo de nuevo.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, favorites, selectedInterests, activeView, groqStatus],
  );

  return (
    <div className="convo">
      <header className="convo-head">
        <span className="convo-avatar"><BarnizMark size={30} /></span>
        <div>
          <h1>Asistente Pasto</h1>
          <p className={`ai-status is-${groqStatus}`}>
            <span className="ai-dot" />
            {groqStatus === "checking" ? "Conectando…" : groqStatus === "connected" ? "IA activa" : "Sin IA por ahora"}
          </p>
        </div>
      </header>

      <div className="convo-scroll">
        {messages.map((m) => (
          <motion.div key={m.id} className={`bubble-row ${m.role === "user" ? "from-user" : "from-ai"}`} {...bubbleMotion(m.role === "user")}>
            <div className="bubble">
              <RichText text={m.content} />

              {!!m.mentionedPlaces?.length && (
                <div className="mention-rail">
                  {m.mentionedPlaces.map((mp, i) => {
                    const full = places.find((p) => p.id === mp.id);
                    if (!full) return null;
                    const isFav = favorites.includes(mp.id);
                    return (
                      <motion.div
                        key={mp.id}
                        className="mention"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                      >
                        <button className="mention-open" onClick={() => onPlaceSelect(full)}>
                          <span className="mention-photo" style={mp.image ? { backgroundImage: `url('${mp.image}')` } : undefined} />
                          <span className="mention-copy"><strong>{mp.name}</strong><small>{mp.category}</small></span>
                        </button>
                        <button className={`mention-fav ${isFav ? "is-saved" : ""}`} onClick={() => { tap(); onFavoriteToggle(mp.id); }} aria-label={isFav ? "Quitar de guardados" : "Guardar"}>
                          {isFav ? <Check size={14} /> : <Heart size={14} />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {m.suggestsRoute && m.role === "assistant" && onCreateRoute && (
                <button className="btn btn-oro btn-sm" onClick={() => onCreateRoute({ interests: selectedInterests })}>
                  <Navigation size={14} /> Armar este recorrido
                </button>
              )}
              <time>{m.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</time>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div className="bubble-row from-ai" {...bubbleMotion(false)}>
            <div className="bubble"><TypingDots /></div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="convo-dock">
        {messages.length < 3 && (
          <div className="suggest-rail">
            {QUICK_SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                className="suggest"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => void sendMessage(s)}
                disabled={loading}
              >
                <Sparkles size={12} /> {s}
              </motion.button>
            ))}
          </div>
        )}
        <form className="composer" onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta lo que quieras de Pasto" disabled={loading} aria-label="Mensaje" />
          <motion.button type="submit" className="send" disabled={loading || !input.trim()} whileTap={{ scale: 0.85, rotate: -20 }} aria-label="Enviar mensaje">
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
