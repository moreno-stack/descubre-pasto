"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatBotProps = {
  onClose: () => void;
};

export function ChatBot({ onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy tu asistente virtual de Descubre Pasto. ¿En qué puedo ayudarte hoy? Puedo recomendarte lugares, armar itinerarios o responder preguntas sobre Pasto.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
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
          message: input,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-backdrop" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Asistente Virtual</h3>
              <p>Descubre Pasto</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar chat">
            <X size={18} />
          </button>
        </div>

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
                <p>{message.content}</p>
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

        <div className="chatbot-suggestions">
          <button
            type="button"
            onClick={() => setInput("¿Qué lugares puedo visitar en 3 horas?")}
            className="suggestion-chip"
            disabled={loading}
          >
            ¿Qué visitar en 3 horas?
          </button>
          <button
            type="button"
            onClick={() => setInput("Recomiéndame comida típica de Pasto")}
            className="suggestion-chip"
            disabled={loading}
          >
            Comida típica
          </button>
          <button
            type="button"
            onClick={() => setInput("Lugares naturales cerca de Pasto")}
            className="suggestion-chip"
            disabled={loading}
          >
            Lugares naturales
          </button>
        </div>
      </div>
    </div>
  );
}
