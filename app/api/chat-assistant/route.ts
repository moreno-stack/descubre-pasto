import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { places } from "@/lib/places";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tipos para el contexto de conversación
interface RouteData {
  hours?: number;
  budget?: string;
  interests?: string[];
  customNote?: string;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  context: {
    currentStep: string;
    routeData: RouteData;
    favorites?: string[];
    conversationHistory?: ConversationMessage[];
  };
}

// Sistema prompt para el asistente de rutas
const SYSTEM_PROMPT = `Eres un asistente turístico experto en Pasto, Nariño, Colombia. Tu objetivo es ayudar a crear recorridos personalizados conversando naturalmente con los usuarios.

CATÁLOGO DE LUGARES:
Tienes acceso a 116 lugares en Pasto incluyendo: templos históricos, plazas, parques, museos, cultura, gastronomía, naturaleza y centros comerciales.

FLUJO DE CONVERSACIÓN:
1. **Tiempo disponible**: Pregunta cuántas horas tiene (1-12 horas)
2. **Presupuesto**: Bajo, Medio o Alto
3. **Intereses**: Cultura, Historia, Gastronomía, Naturaleza (puede elegir varios)
4. **Personalización**: Algo específico que quiera incluir o evitar

ESTILO DE CONVERSACIÓN:
- Sé amigable, conversacional y entusiasta
- Usa emojis con moderación (1-2 por mensaje)
- Haz preguntas claras con opciones
- Adapta tus respuestas al contexto del usuario
- Si el usuario da respuestas vagas, ayúdale con sugerencias
- Reconoce y valida sus preferencias

COMPRENSIÓN FLEXIBLE:
- Acepta respuestas en lenguaje natural (no solo palabras clave)
- Entiende variaciones: "2-3 horas", "medio día", "toda la mañana"
- Detecta intereses implícitos: "quiero comer rico" → Gastronomía
- Interpreta presupuestos: "no mucho dinero" → Bajo

ACCIONES QUE PUEDES INDICAR:
Cuando termines de recopilar información, responde con la estructura JSON al final.

IMPORTANTE:
- Mantén el contexto de toda la conversación
- Si el usuario pregunta sobre Pasto, responde con conocimiento turístico
- Si se desvía del tema, guíalo amablemente de vuelta al recorrido
- Cuando tengas toda la info necesaria, genera el recorrido`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, context } = body;
    const { currentStep, routeData, favorites = [], conversationHistory = [] } = context;

    // Construir el contexto para Groq
    const contextInfo = `
ESTADO ACTUAL:
- Paso: ${currentStep}
- Horas disponibles: ${routeData.hours || "no especificado"}
- Presupuesto: ${routeData.budget || "no especificado"}
- Intereses: ${routeData.interests?.join(", ") || "no especificado"}
- Nota personalizada: ${routeData.customNote || "ninguna"}
- Lugares favoritos: ${favorites.length > 0 ? favorites.join(", ") : "ninguno"}
`;

    // Preparar mensajes para Groq
    const messages: any[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT + "\n\n" + contextInfo,
      },
    ];

    // Agregar historial de conversación (últimos 6 mensajes)
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Agregar mensaje actual del usuario
    messages.push({
      role: "user",
      content: message,
    });

    // Llamar a Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu mensaje.";

    // Analizar la respuesta para determinar acciones
    const action = determineAction(aiResponse, message, currentStep, routeData);

    return NextResponse.json({
      message: aiResponse,
      action,
    });
  } catch (error) {
    console.error("Error en chat-assistant:", error);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}

// Determinar qué acción tomar basado en la conversación
function determineAction(aiResponse: string, userMessage: string, currentStep: string, routeData: RouteData) {
  const lowerResponse = aiResponse.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();

  // Detectar si se extrajo información de tiempo
  if (currentStep === "time" || currentStep === "initial") {
    const hoursMatch = userMessage.match(/(\d+)/);
    if (hoursMatch) {
      const hours = Math.max(1, Math.min(12, parseInt(hoursMatch[1])));
      return {
        type: "update_route_data",
        data: { hours },
        step: "budget",
      };
    }
  }

  // Detectar presupuesto
  if (currentStep === "budget") {
    let budget = "Medio";
    if (lowerMessage.includes("bajo") || lowerMessage.includes("económico") || lowerMessage.includes("barato") || lowerMessage.includes("poco dinero")) {
      budget = "Bajo";
    } else if (lowerMessage.includes("alto") || lowerMessage.includes("premium") || lowerMessage.includes("lujo") || lowerMessage.includes("sin límite")) {
      budget = "Alto";
    } else if (lowerMessage.includes("medio") || lowerMessage.includes("moderado") || lowerMessage.includes("normal")) {
      budget = "Medio";
    }

    return {
      type: "update_route_data",
      data: { budget },
      step: "interests",
    };
  }

  // Detectar intereses
  if (currentStep === "interests") {
    const interests: string[] = [];
    
    if (lowerMessage.includes("cultura") || lowerMessage.includes("arte") || lowerMessage.includes("artesanía")) {
      interests.push("Cultura");
    }
    if (lowerMessage.includes("historia") || lowerMessage.includes("histórico") || lowerMessage.includes("patrimonio")) {
      interests.push("Historia");
    }
    if (lowerMessage.includes("gastronomía") || lowerMessage.includes("comida") || lowerMessage.includes("comer") || lowerMessage.includes("gastronóm")) {
      interests.push("Gastronomía");
    }
    if (lowerMessage.includes("naturaleza") || lowerMessage.includes("paisaje") || lowerMessage.includes("verde") || lowerMessage.includes("aire libre")) {
      interests.push("Naturaleza");
    }

    // Si no detectó ninguno, usar valores comunes
    if (interests.length === 0 && (lowerMessage.includes("todo") || lowerMessage.includes("variado"))) {
      interests.push("Cultura", "Historia");
    }

    if (interests.length > 0) {
      return {
        type: "update_route_data",
        data: { interests },
        step: "custom",
      };
    }
  }

  // Detectar si está listo para generar
  if (currentStep === "custom") {
    const customNote = lowerMessage === "no" || lowerMessage === "nada" || lowerMessage === "ninguno" ? "" : userMessage;
    
    return {
      type: "update_route_data",
      data: { customNote },
      step: "generating",
    };
  }

  // Detectar comando de generación directa
  if (lowerResponse.includes("generar") || lowerResponse.includes("crear el recorrido") || lowerResponse.includes("listo")) {
    if (routeData.hours && routeData.budget && routeData.interests && routeData.interests.length > 0) {
      return {
        type: "generate_recommendation",
        customNote: routeData.customNote,
      };
    }
  }

  // Por defecto, mantener el flujo conversacional
  return null;
}
