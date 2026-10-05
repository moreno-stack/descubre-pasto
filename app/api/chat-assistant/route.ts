import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { places } from "@/lib/places";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface RouteData {
  hours?: number;
  budget?: string;
  interests?: string[];
  customNote?: string;
  includeFavorites?: boolean;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  context?: {
    currentStep?: string;
    routeData?: RouteData;
    favorites?: string[];
    conversationHistory?: ConversationMessage[];
    source?: "inicio" | "explorar" | "favoritos";
  };
}

const SYSTEM_PROMPT = `Eres un asistente turístico experto en Pasto, Nariño, Colombia. Tu objetivo es ayudar a crear recorridos personalizados conversando de forma natural y práctica.

CONTEXTO DEL CATÁLOGO:
Tienes acceso a 116 lugares registrados en Descubre Pasto, entre ellos templos históricos, plazas, parques, museos, sitios de gastronomía, naturaleza y centros comerciales.

CUÁNDO SE RECIBE CONTEXTO EL CLIENTE PUEDE ENVIAR UN BLOQUE PARECIDO A ESTO:
<contexto>
historial de conversación, intereses prefilled, lista de favoritos con sus ids, paso actual y nota personalizada
</contexto>
Cuando veas ese bloque, úsalo para avanzar el flujo sin volver a preguntar lo que ya está resuelto.

FLUJO DE CONVERSACIÓN:
1. **Tiempo disponible**: pregunta cuántas horas tiene (1 a 12 horas) y acomoda tu lenguaje si dice frases como "medio día", "una tarde" o "todo el día".
2. **Presupuesto**: Bajo, Medio o Alto.
3. **Intereses**: Cultura, Historia, Gastronomía, Naturaleza. Puede elegir varios.
4. **Favoritos**: si existen lugares guardados, pregunta si quiere incluirlos y, si dice que sí, confirma cuáles y cómo.
5. **Personalización**: algo que quiera incluir, evitar o priorizar.

ESTILO:
- Amigable, conversacional, entusiasta, pero directo.
- Usa pocos emojis, entre 1 y 2 por mensaje.
- Haz preguntas claras con opciones cuando ayude.
- Si la respuesta es vaga, ayúdala con ejemplos positivos en español.
- Valida preferencias y recuerda lo que ya dijo.

COMPRENSIÓN FLEXIBLE:
- Acepta lenguaje natural, no solo palabras clave.
- Detecta intereses implícitos y presupuestos expresados en lenguaje coloquial.

SALIDAS DE LA API:
Este endpoint no genera el recorrido final. Detectarás cuándo ya tienes tiempo, presupuesto, intereses y, si corresponde, favoritos. En ese momento responde de forma conversacional indicando que estás listo para generar la ruta, pero no incluyas JSON estructurado ni listas de lugares. El frontend se encargará de llamar a /api/recommend para armar el itinerario.

IMPORTANTE:
- Mantén el contexto de la conversación.
- Si preguntan sobre Pasto, responde con conocimiento turístico.
- Si se desvían, guíalos amablemente de vuelta al recorrido.
- Cuando tengas la información necesaria, indícalo con naturalidad y deja que el frontend pida la ruta.`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { message, context = {} } = body;
    const { currentStep, routeData = {}, favorites = [], conversationHistory = [], source } = context;

    if (process.env.GROQ_API_KEY) {
      const contextForAI = [
        "<contexto>",
        `pasoActual=${currentStep ?? "time"}`,
        `horas=${routeData.hours ?? "no especificado"}`,
        `presupuesto=${routeData.budget ?? "no especificado"}`,
        `intereses=${routeData.interests?.join(", ") ?? "no especificado"}`,
        `notaPersonalizada=${routeData.customNote ?? "ninguna"}`,
        `incluirFavoritos=${routeData.includeFavorites ?? "no especificado"}`,
        `origen=${source ?? "sin origen"}`,
        `favoritos=[${favorites.slice(0, 30).join(", ")}]`,
        `</contexto>`,
      ].join("\n");

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextForAI },
      ];

      conversationHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });

      messages.push({ role: "user", content: message });

      const completion = await groq.chat.completions.create({
        model: "qwen/qwen3.8-27b",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content || "No pude procesar tu mensaje.";

      const action = determineAction(aiResponse, message, currentStep ?? "time", routeData);

      return NextResponse.json({ message: aiResponse, action });
    }

    // Fallback cuando GROQ_API_KEY no está configurada
    const fallback = generateFallbackResponse(message, currentStep ?? "time", routeData, favorites);
    return NextResponse.json(fallback);
  } catch (error) {
    console.error("Error en chat-assistant:", error);
    return NextResponse.json(
      { error: "No pude procesar tu mensaje. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message: string, currentStep: string | undefined, routeData: RouteData, favorites: string[]) {
  const lowerMsg = message.toLowerCase();
  const step = currentStep ?? "time";

  const hoursMatch = step === "time" && lowerMsg.match(/(\d+)/);
  const hours = hoursMatch ? Math.max(1, Math.min(12, parseInt(hoursMatch[1], 10))) : undefined;

  let budget: string | undefined;
  if (step === "budget") {
    if (/bajo|econ[oó]mico|barato|poco dinero|ahorro/i.test(lowerMsg)) budget = "Bajo";
    else if (/alto|premium|lujo|sin límite|comodidad primero/i.test(lowerMsg)) budget = "Alto";
    else if (/medio|moderado|normal|sin presupuesto definido/i.test(lowerMsg)) budget = "Medio";
  }

  let interests: string[] | undefined;
  if (step === "interests") {
    const detected: string[] = [];
    if (/cultura|arte|artesan[ií]a|museo|carnaval/i.test(lowerMsg)) detected.push("Cultura");
    if (/historia|hist[oó]rico|patrimonio|memoria|centro histórico/i.test(lowerMsg)) detected.push("Historia");
    if (/gastronom[aá]|comida|comer|plato|sabores|restaurante|mercado|comida típica/i.test(lowerMsg)) detected.push("Gastronomía");
    if (/naturaleza|paisaje|verde|aire libre|laguna|montaña|parque/i.test(lowerMsg)) detected.push("Naturaleza");
    if (detected.length) interests = detected;
  }

  let customNote: string | undefined;
  let includeFavorites = routeData.includeFavorites ?? false;
  if (step === "custom") {
    if (/^(no|nada|ninguno|nada especial|no tengo preferencia)$/i.test(lowerMsg)) {
      customNote = "";
    } else {
      customNote = message;
    }
    if (/si|claro|por favor|incluye|quiero/i.test(lowerMsg)) {
      includeFavorites = true;
    }
  }

  const updatedRouteData: RouteData = {
    ...(hours !== undefined ? { hours } : {}),
    ...(budget ? { budget } : {}),
    ...(interests?.length ? { interests } : {}),
    ...(customNote !== undefined ? { customNote } : {}),
    ...(includeFavorites ? { includeFavorites: true } : {}),
  };

  const nextStep = step === "time" ? "budget"
    : step === "budget" ? "interests"
    : step === "interests" ? "custom"
    : step === "custom" ? "generating"
    : step;

  const assistantMessage = buildFallbackAssistantMessage(updatedRouteData, favorites, nextStep, message);

  const action =
    nextStep === "generating" && updatedRouteData.hours && updatedRouteData.budget && updatedRouteData.interests?.length
      ? { type: "generate_recommendation", customNote: updatedRouteData.customNote ?? "" }
      : { type: "update_route_data", data: updatedRouteData, step: nextStep };

  return { message: assistantMessage, action };
}

function buildFallbackAssistantMessage(routeData: RouteData, favorites: string[], nextStep: string, userMessage: string) {
  const favoriteNames = favoriteNamesFromIds(favorites);

  if (nextStep === "budget") {
    if (routeData.hours) {
      return `¡Perfecto! Tenés ${routeData.hours} horas para tu visita. ¿Cuál es tu presupuesto? Puede ser Bajo, Medio o Alto.`;
    }
    return `¡Genial! Para armar tu recorrido necesito saber cuántas horas tenés disponible. Por ejemplo: 2, 3, 4 o más.`;
  }

  if (nextStep === "interests") {
    if (routeData.budget) {
      return `Entendido, presupuesto ${routeData.budget}. Ahora cuéntame tus intereses: ¿Cultura, Historia, Gastronomía, Naturaleza? Puedes decir varios, como "cultura y gastronomía".`;
    }
    return `¡Bien! Ahora ayudame con tu presupuesto: Bajo, Medio o Alto.`;
  }

  if (nextStep === "custom") {
    const parts = [];
    if (routeData.hours) parts.push(`${routeData.hours} horas`);
    if (routeData.budget) parts.push(routeData.budget);
    if (routeData.interests?.length) parts.push(routeData.interests.join(" y "));

    let extra = "¿Algo más que quieras incluir, evitar o priorizar? Si no, decime 'no'.";
    if (favorites.length > 0 && !routeData.includeFavorites) {
      extra = `También tengo tus lugares guardados: ${favoriteNames}. ¿Querés que los incluya en tu recorrido? Responde sí o no.`;
    }

    return `Perfecto, ya tengo ${(parts.length ? parts.join(", ") : "tu visita")}. ${extra}`;
  }

  if (nextStep === "generating") {
    return "Genial, ya tengo toda la información. Estoy armando tu recorrido personalizado ahora mismo.";
  }

  if (/nuevo|otro|otra vez|empezar de nuevo|cambiar/i.test(userMessage)) {
    return "¡Claro! Empecemos de nuevo. ¿Cuántas horas tenés disponibles para tu visita?";
  }

  return "Contame más sobre lo que buscás para armar el mejor recorrido para vos.";
}

function favoriteNamesFromIds(ids: string[]): string {
  const names = ids
    .map(id => places.find(p => p.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);
  if (!names.length) return "ninguno";
  if (names.length === 1) return names[0] as string;
  if (names.length === 2) return names.join(" y ");
  return names.slice(0, 2).join(", ") + " y otros";
}

function determineAction(aiResponse: string, userMessage: string, currentStep: string | undefined, routeData: RouteData) {
  const lowerMsg = userMessage.toLowerCase();
  const currentStepNorm = currentStep ?? "time";

  if (currentStepNorm === "time") {
    const hoursMatch = lowerMsg.match(/(\d+)/);
    if (hoursMatch) {
      const hours = Math.max(1, Math.min(12, parseInt(hoursMatch[1], 10)));
      return { type: "update_route_data", data: { hours }, step: "budget" };
    }
  }

  if (currentStepNorm === "budget") {
    let budget: string = "Medio";
    if (/bajo|econ[oó]mico|barato|poco dinero|ahorro/i.test(lowerMsg)) budget = "Bajo";
    else if (/alto|premium|lujo|sin límite|comodidad primero/i.test(lowerMsg)) budget = "Alto";
    else if (/medio|moderado|normal|sin presupuesto definido/i.test(lowerMsg)) budget = "Medio";

    return { type: "update_route_data", data: { budget }, step: "interests" };
  }

  if (currentStepNorm === "interests") {
    const detected: string[] = [];

    if (/cultura|arte|artesan[ií]a|museo|carnaval/i.test(lowerMsg)) detected.push("Cultura");
    if (/historia|hist[oó]rico|patrimonio|memoria|centro histórico/i.test(lowerMsg)) detected.push("Historia");
    if (/gastronom[aá]|comida|comer|plato|sabores|restaurante|mercado|comida típica/i.test(lowerMsg)) detected.push("Gastronomía");
    if (/naturaleza|paisaje|verde|aire libre|laguna|montaña|parque/i.test(lowerMsg)) detected.push("Naturaleza");

    if (!detected.length && /todo|variado|todo lo que encuentre/i.test(lowerMsg)) {
      detected.push("Cultura", "Historia");
    }

    if (detected.length) {
      return { type: "update_route_data", data: { interests: detected }, step: "custom" };
    }
  }

  if (currentStepNorm === "custom") {
    const customNote =
      /^(no|nada|ninguno|nada especial|no tengo preferencia)$/i.test(lowerMsg)
        ? ""
        : userMessage;

    if (routeData.includeFavorites === true || /si|claro|por favor|incluye|quiero/i.test(lowerMsg)) {
      return { type: "update_route_data", data: { customNote, includeFavorites: true }, step: "generating" };
    }

    return { type: "update_route_data", data: { customNote }, step: "generating" };
  }

  if (currentStepNorm === "generating" || currentStepNorm === "done") {
    if (/nuevo|otro|otra vez|empezar de nuevo|cambiar/i.test(lowerMsg)) {
      return { type: "reset", step: "time" };
    }

    if (/si|dale|claro|adelante|genera|ok|create|crear/i.test(lowerMsg)) {
      if (routeData.hours && routeData.budget && routeData.interests?.length) {
        return { type: "generate_recommendation", customNote: routeData.customNote ?? "" };
      }
    }
  }

  // Si el usuario pregunta directamente por un recorrido completo, pasar a generación
  if (/recorrido|recomendacion|recomendación|caminata|ruta|itinerario/i.test(lowerMsg)) {
    if (routeData.hours && routeData.budget && routeData.interests?.length) {
      return { type: "generate_recommendation", customNote: routeData.customNote ?? "" };
    }
  }

  return null;
}
