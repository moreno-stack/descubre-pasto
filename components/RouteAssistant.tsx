"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, MapPin, Clock3, Sparkles, User, RefreshCw } from "lucide-react";
import type { Interest } from "@/lib/places";
import type { Recommendation } from "@/lib/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: {
    hours?: number;
    budget?: string;
    interests?: Interest[];
    recommendation?: Recommendation;
  };
};

type RouteAssistantProps = {
  favorites: string[];
  onRecommendationGenerated?: (recommendation: Recommendation) => void;
};

export function RouteAssistant({ favorites, onRecommendationGenerated }: RouteAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy tu asistente de viaje en Pasto. 🏔️\n\nVoy a ayudarte a crear un recorrido perfecto. Dime, ¿cuánto tiempo tienes disponible para tu visita?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"time" | "budget" | "interests" | "custom" | "generating" | "done">("time");
  const [routeData, setRouteData] = useState<{
    hours?: number;
    budget?: string;
    interests?: Interest[];
    customNote?: string;
  }>({});
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
  }, [currentStep]);

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
      await processUserInput(input);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Disculpa, tuve un problema al procesar tu respuesta. ¿Podrías intentarlo de nuevo?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function processUserInput(userInput: string) {
    const input = userInput.toLowerCase().trim();

    if (currentStep === "time") {
      // Extraer horas del input
      const hoursMatch = input.match(/(\d+)/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 3;
      const validHours = Math.max(1, Math.min(12, hours));

      setRouteData((prev) => ({ ...prev, hours: validHours }));

      const response: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Perfecto, ${validHours} ${validHours === 1 ? "hora" : "horas"} es un buen tiempo. 💰\n\n¿Qué presupuesto tienes en mente?\n\n• **Bajo** - Opciones económicas\n• **Medio** - Balance calidad-precio\n• **Alto** - Experiencias premium\n\nEscribe "bajo", "medio" o "alto".`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, response]);
      setCurrentStep("budget");
    } else if (currentStep === "budget") {
      let budget = "Medio";
      if (input.includes("bajo") || input.includes("economico") || input.includes("barato")) {
        budget = "Bajo";
      } else if (input.includes("alto") || input.includes("premium") || input.includes("lujo")) {
        budget = "Alto";
      }

      setRouteData((prev) => ({ ...prev, budget }));

      const response: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Entendido, presupuesto ${budget.toLowerCase()}. 🎯\n\n¿Qué tipo de experiencias te interesan?\n\n• **Cultura** - Arte, fiestas y saberes\n• **Historia** - Memoria de la ciudad\n• **Gastronomía** - Sabores de Nariño\n• **Naturaleza** - Paisajes cercanos\n\nPuedes escribir una o varias separadas por comas (ej: "cultura y gastronomía").`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, response]);
      setCurrentStep("interests");
    } else if (currentStep === "interests") {
      const selectedInterests: Interest[] = [];
      
      if (input.includes("cultura")) selectedInterests.push("Cultura");
      if (input.includes("historia")) selectedInterests.push("Historia");
      if (input.includes("gastronomia") || input.includes("comida") || input.includes("gastronom")) selectedInterests.push("Gastronomía");
      if (input.includes("naturaleza")) selectedInterests.push("Naturaleza");

      // Si no detectó ninguno, usar los más comunes
      if (selectedInterests.length === 0) {
        selectedInterests.push("Cultura", "Historia");
      }

      setRouteData((prev) => ({ ...prev, interests: selectedInterests }));

      const response: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Excelente elección: ${selectedInterests.join(", ")}. ✨\n\n¿Hay algo específico que quieras incluir o evitar en tu recorrido?\n\n(Por ejemplo: "quiero probar comida típica" o simplemente escribe "no" para continuar)`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, response]);
      setCurrentStep("custom");
    } else if (currentStep === "custom") {
      const customNote = input.toLowerCase() === "no" || input.toLowerCase() === "nada" ? "" : input;
      setRouteData((prev) => ({ ...prev, customNote }));

      const response: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Perfecto! Déjame crear tu recorrido personalizado... 🗺️`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, response]);
      setCurrentStep("generating");

      // Generar recomendación
      await generateRecommendation(customNote);
    }
  }

  async function generateRecommendation(customNote: string) {
    try {
      const fullPrompt = customNote
        ? `${routeData.interests?.join(", ")}, ${routeData.hours} horas, presupuesto ${routeData.budget}. ${customNote}`
        : `${routeData.interests?.join(", ")}, ${routeData.hours} horas`;

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          hours: routeData.hours,
          budget: routeData.budget,
          interests: routeData.interests,
          favorites,
          start: "Centro histórico",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar recomendación");
      }

      const recommendation = data as Recommendation;

      let resultMessage = "";
      if (recommendation.route.length > 0) {
        resultMessage = `¡Listo! He creado tu recorrido personalizado: 🎉\n\n📍 **${recommendation.route.length} lugares** · ⏱️ **${recommendation.estimatedMinutes} minutos aprox.**\n\n`;
        
        recommendation.route.forEach((stop, index) => {
          resultMessage += `**${index + 1}. ${stop.name}**\n${stop.category} · ${stop.minutes} min\n${stop.reason}\n\n`;
        });

        resultMessage += `\n💡 ${recommendation.note}`;
      } else {
        resultMessage = "No encontré lugares suficientes que se ajusten a tus criterios. ¿Quieres intentar con más tiempo o diferentes intereses?";
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: resultMessage,
        timestamp: new Date(),
        data: { recommendation },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentStep("done");

      if (onRecommendationGenerated && recommendation.route.length > 0) {
        onRecommendationGenerated(recommendation);
      }

      // Ofrecer crear otro recorrido
      setTimeout(() => {
        const followUp: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "¿Quieres crear otro recorrido diferente? Escribe 'sí' o 'nuevo' para empezar de nuevo.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, followUp]);
      }, 1000);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hubo un problema al generar tu recorrido. ¿Quieres intentarlo de nuevo?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentStep("custom");
    }
  }

  function resetConversation() {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "¡Perfecto! Empecemos de nuevo. 🌟\n\n¿Cuánto tiempo tienes disponible para tu visita?",
        timestamp: new Date(),
      },
    ]);
    setRouteData({});
    setCurrentStep("time");
    setInput("");
  }

  // Detectar si el usuario quiere reiniciar
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "user" &&
      currentStep === "done" &&
      (lastMessage.content.toLowerCase().includes("si") ||
        lastMessage.content.toLowerCase().includes("nuevo") ||
        lastMessage.content.toLowerCase().includes("otra") ||
        lastMessage.content.toLowerCase().includes("otra vez"))
    ) {
      resetConversation();
    }
  }, [messages, currentStep]);

  const quickSuggestions = {
    time: ["2 horas", "3 horas", "4 horas", "Todo el día"],
    budget: ["Bajo", "Medio", "Alto"],
    interests: ["Cultura", "Historia", "Gastronomía", "Naturaleza", "Cultura e Historia", "Todo"],
    custom: ["Quiero probar comida típica", "Lugares fotogénicos", "Con niños", "No"],
  };

  return (
    <div className="route-assistant">
      <div className="route-assistant-header">
        <div className="assistant-avatar-large">
          <Bot size={24} />
        </div>
        <div>
          <h2>Asistente de Recorridos</h2>
          <p>Voy a ayudarte a crear tu itinerario perfecto</p>
        </div>
        {currentStep === "done" && (
          <button className="icon-button" onClick={resetConversation} aria-label="Nuevo recorrido">
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      <div className="route-assistant-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`route-message ${message.role === "user" ? "user-message" : "assistant-message"}`}
          >
            <div className="route-message-avatar">
              {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="route-message-content">
              <p style={{ whiteSpace: "pre-line" }}>{message.content}</p>
              <span className="route-message-time">
                {message.timestamp.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="route-message assistant-message">
            <div className="route-message-avatar">
              <Bot size={16} />
            </div>
            <div className="route-message-content loading-message">
              <Loader2 size={16} className="spinner" />
              <span>Procesando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentStep !== "generating" && (
        <>
          <form className="route-assistant-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentStep === "time"
                  ? "Ej: 3 horas"
                  : currentStep === "budget"
                  ? "Ej: medio"
                  : currentStep === "interests"
                  ? "Ej: cultura y gastronomía"
                  : "Escribe tu preferencia..."
              }
              className="route-assistant-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="route-assistant-send-button"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </form>

          {currentStep !== "done" && quickSuggestions[currentStep] && (
            <div className="route-assistant-suggestions">
              {quickSuggestions[currentStep].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="route-suggestion-chip"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
