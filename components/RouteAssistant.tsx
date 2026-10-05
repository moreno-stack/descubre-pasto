"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, MapPin, Clock3, Sparkles, User, RefreshCw, Heart, Check, Image as ImageIcon, Wifi, WifiOff } from "lucide-react";
import { places, type Interest, type Place } from "@/lib/places";
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
  onFavoriteToggle?: (id: string) => void;
  onPlaceSelect?: (place: Place) => void;
  routeContext?: {
    prefilledInterests?: Interest[];
    prefilledFavorites?: string[];
    source?: "inicio" | "explorar" | "favoritos";
  };
  onContextCleared?: () => void;
};

export function RouteAssistant({ favorites, onRecommendationGenerated, onFavoriteToggle, onPlaceSelect, routeContext, onContextCleared }: RouteAssistantProps) {
  const [groqConnected, setGroqConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health/groq")
      .then((res) => res.json())
      .then((data) => setGroqConnected(Boolean(data?.connected)))
      .catch(() => setGroqConnected(false));
  }, []);

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

  // Manejar contexto prefilled desde otras secciones
  useEffect(() => {
    if (routeContext?.prefilledInterests && routeContext.prefilledInterests.length > 0) {
      setRouteData((prev) => ({ ...prev, interests: routeContext.prefilledInterests }));
      
      const contextMessage: Message = {
        id: `context-${Date.now()}`,
        role: "assistant",
        content: `¡Perfecto! Veo que te interesa ${routeContext.prefilledInterests.join(" y ")}. 🎯\n\n¿Cuánto tiempo tienes disponible para tu recorrido?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, contextMessage]);
      setCurrentStep("time");
      
      if (onContextCleared) onContextCleared();
    }

    if (routeContext?.prefilledFavorites && routeContext.prefilledFavorites.length > 0) {
      const favoriteNames = places
        .filter(p => routeContext.prefilledFavorites?.includes(p.id))
        .map(p => p.name)
        .slice(0, 3)
        .join(", ");
      
      const contextMessage: Message = {
        id: `context-${Date.now()}`,
        role: "assistant",
        content: `Veo que tienes ${routeContext.prefilledFavorites.length} lugares guardados (${favoriteNames}...). 💚\n\n¿Quieres incluirlos en tu recorrido? También dime cuántas horas tienes disponibles.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, contextMessage]);
      setRouteData((prev) => ({ ...prev, customNote: `Incluir favoritos: ${favoriteNames}` }));
      setCurrentStep("time");
      
      if (onContextCleared) onContextCleared();
    }
  }, [routeContext, onContextCleared]);

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
    try {
      // Enviar mensaje al asistente de IA
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          context: {
            currentStep,
            routeData,
            favorites,
            conversationHistory: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar mensaje");
      }

      // Procesar respuesta de la IA
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar estado según la respuesta de la IA
      if (data.action) {
        switch (data.action.type) {
          case "update_route_data":
            setRouteData((prev) => ({ ...prev, ...data.action.data }));
            break;
          case "change_step":
            setCurrentStep(data.action.step);
            break;
          case "generate_recommendation":
            setCurrentStep("generating");
            await generateRecommendation(data.action.customNote || "");
            break;
        }
      }
    } catch (error) {
      console.error("Error processing input:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Disculpa, tuve un problema. ¿Podrías reformular tu mensaje?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const stepLabels: Record<string, string> = {
    time: "⏱ Tiempo",
    budget: "💰 Presupuesto",
    interests: "🎯 Intereses",
    custom: "✨ Preferencias",
    generating: "🗺 Generando",
    done: "✅ Listo",
  };
  const stepOrder = ["time", "budget", "interests", "custom", "generating", "done"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="route-assistant">
      <div className="route-assistant-header">
        <div className="assistant-avatar-large">
          <Bot size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2>Asistente de Recorridos</h2>
            <div className={`route-api-status ${groqConnected === null ? "checking" : groqConnected ? "connected" : "disconnected"}`}>
              {groqConnected === null ? (
                <Loader2 size={11} className="spinner" />
              ) : groqConnected ? (
                <><Wifi size={11} /> IA activa</>
              ) : (
                <><WifiOff size={11} /> Modo básico</>
              )}
            </div>
          </div>
          {currentStep !== "time" && (
            <div className="route-progress-bar">
              {stepOrder.slice(0, 5).map((step, i) => (
                <div
                  key={step}
                  className={`route-progress-step ${
                    i < currentStepIndex ? "done" : i === currentStepIndex ? "active" : ""
                  }`}
                  title={stepLabels[step]}
                />
              ))}
            </div>
          )}
          {currentStep !== "done" && currentStep !== "generating" && (
            <p className="route-step-label">{stepLabels[currentStep]}</p>
          )}
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
              
              {/* Mostrar fichas de lugares si hay recomendación */}
              {message.data?.recommendation && message.data.recommendation.route.length > 0 && (
                <div className="route-places-grid">
                  {message.data.recommendation.route.map((stop) => {
                    const place = places.find(p => p.id === stop.id);
                    if (!place) return null;
                    
                    const isFavorite = favorites.includes(place.id);
                    
                    return (
                      <div key={place.id} className="route-place-card">
                        {place.image ? (
                          <button 
                            className="route-place-image" 
                            style={{ backgroundImage: `url('${place.image}')` }}
                            onClick={() => onPlaceSelect?.(place)}
                            aria-label={`Ver detalles de ${place.name}`}
                          />
                        ) : (
                          <button
                            className="route-place-image route-place-image--empty"
                            onClick={() => onPlaceSelect?.(place)}
                            aria-label={`Ver detalles de ${place.name}`}
                          >
                            <ImageIcon size={32} strokeWidth={1.5} />
                          </button>
                        )}
                        
                        <div className="route-place-order">{stop.order}</div>
                        
                        <button
                          className={`route-place-favorite ${isFavorite ? "saved" : ""}`}
                          onClick={() => onFavoriteToggle?.(place.id)}
                          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                          {isFavorite ? <Check size={16} /> : <Heart size={16} />}
                        </button>
                        
                        <div className="route-place-info">
                          <h4>{place.name}</h4>
                          <p className="route-place-category">{place.category}</p>
                          <div className="route-place-meta">
                            <span><Clock3 size={12} /> {stop.minutes} min</span>
                            <span><MapPin size={12} /> {stop.distanceKm} km</span>
                          </div>
                          <p className="route-place-reason">{stop.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
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

          {currentStep in quickSuggestions && (
            <div className="route-assistant-suggestions">
              {quickSuggestions[currentStep as keyof typeof quickSuggestions].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    // Auto-enviar el chip directamente
                    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
                    setInput(suggestion);
                    // Enviar en el siguiente tick para que el estado se actualice
                    setTimeout(() => {
                      const userMsg = { id: Date.now().toString(), role: "user" as const, content: suggestion, timestamp: new Date() };
                      setMessages((prev) => [...prev, userMsg]);
                      setLoading(true);
                      processUserInput(suggestion)
                        .catch(console.error)
                        .finally(() => setLoading(false));
                      setInput("");
                    }, 0);
                  }}
                  className="route-suggestion-chip"
                  disabled={loading}
                >
                  <Sparkles size={11} />
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
