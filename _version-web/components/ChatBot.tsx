"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, X, Loader2, Navigation, Wifi, WifiOff, Sparkles, Heart, Check } from "lucide-react";
import { places, type Interest, type Place } from "@/lib/places";

type MentionedPlace = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  image: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mentionedPlaces?: MentionedPlace[];
  suggestsRoute?: boolean;
};

type ChatBotProps = {
  onClose: () => void;
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

export function ChatBot({
  onClose,
  favorites,
  selectedInterests,
  activeView,
  onPlaceSelect,
  onCreateRoute,
  onFavoriteToggle,
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        selectedInterests.length > 0
          ? `¡Hola! Veo que te interesa ${selectedInterests.join(" y ")}. 🏔️ Cuéntame qué tienes en mente y te ayudo a planificar tu visita por Pasto.`
          : "¡Hola! Soy tu asistente de Descubre Pasto. 🏔️ ¿En qué puedo ayudarte? Puedo recomendarte lugares, armar itinerarios o responder preguntas sobre Pasto y Nariño.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [groqStatus, setGroqStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar estado de Groq al montar
  useEffect(() => {
    fetch("/api/health/groq")
      .then((r) => r.json())
      .then((d) => setGroqStatus(d?.connected ? "connected" : "disconnected"))
      .catch(() => setGroqStatus("disconnected"));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            context: {
              favorites,
              interests: selectedInterests,
              activeView,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al procesar el mensaje");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          mentionedPlaces: data.mentionedPlaces || [],
          suggestsRoute: data.suggestsRoute || false,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            groqStatus === "disconnected"
              ? "La API de Groq no está disponible. Verifica tu clave en .env.local y reinicia el servidor."
              : "Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, favorites, selectedInterests, activeView, groqStatus]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleSuggestion(suggestion: string) {
    void sendMessage(suggestion);
  }

  // Limpiar los corchetes del mensaje para mostrar texto limpio
  function cleanMessage(content: string) {
    return content.replace(/\[([^\]]+)\]/g, "$1");
  }

  return (
    <div className="chatbot-backdrop" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Asistente Pasto</h3>
              <div className="chatbot-api-status">
                {groqStatus === "checking" ? (
                  <span className="chatbot-status-dot checking" />
                ) : groqStatus === "connected" ? (
                  <>
                    <Wifi size={11} />
                    <span className="chatbot-status-label connected">IA activa</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={11} />
                    <span className="chatbot-status-label disconnected">Sin IA</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar chat">
            <X size={18} />
          </button>
        </div>

        {/* Mensajes */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.role === "user" ? "user-message" : "assistant-message"}`}
            >
              <div className="message-avatar">
                {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                <p style={{ whiteSpace: "pre-line" }}>{cleanMessage(message.content)}</p>

                {/* Fichas de lugares mencionados */}
                {message.mentionedPlaces && message.mentionedPlaces.length > 0 && (
                  <div className="chat-mentioned-places">
                    {message.mentionedPlaces.map((mp) => {
                      const fullPlace = places.find((p) => p.id === mp.id);
                      if (!fullPlace) return null;
                      const isFav = favorites.includes(mp.id);
                      return (
                        <div key={mp.id} className="chat-place-chip">
                          {mp.image && (
                            <div
                              className="chat-place-chip-img"
                              style={{ backgroundImage: `url('${mp.image}')` }}
                            />
                          )}
                          <div className="chat-place-chip-info">
                            <button
                              className="chat-place-chip-name"
                              onClick={() => onPlaceSelect(fullPlace)}
                            >
                              {mp.name}
                            </button>
                            <span className="chat-place-chip-cat">{mp.category}</span>
                          </div>
                          <button
                            className={`chat-place-fav ${isFav ? "saved" : ""}`}
                            onClick={() => onFavoriteToggle(mp.id)}
                            aria-label={isFav ? "Quitar de favoritos" : "Guardar"}
                          >
                            {isFav ? <Check size={13} /> : <Heart size={13} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botón crear recorrido si la IA lo sugiere */}
                {message.suggestsRoute && message.role === "assistant" && onCreateRoute && (
                  <button
                    className="chat-route-cta"
                    onClick={() => {
                      onCreateRoute({ interests: selectedInterests });
                      onClose();
                    }}
                  >
                    <Navigation size={14} />
                    Crear recorrido ahora
                  </button>
                )}

                <span className="message-time">
                  {message.timestamp.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant-message">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content loading-message">
                <Loader2 size={16} className="spinner" />
                <span>Escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="chatbot-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="chatbot-send-button"
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </form>

        {/* Sugerencias */}
        <div className="chatbot-suggestions">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              className="suggestion-chip"
              disabled={loading}
            >
              <Sparkles size={11} />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
