import { NextResponse } from "next/server";
import { getGroq } from "@/lib/groq";
import { places, type Place } from "@/lib/places";
import { asksForDirections, detectMode, findPlaceInText } from "@/lib/maps";
import { buildDirections } from "@/lib/directions";

/** Si el usuario pide ir a un sitio, arma la ruta en Google Maps. */
function directionsFor(message: string, history: ChatMessage[], origin?: { latitude: number; longitude: number }) {
  if (!asksForDirections(message)) return null;
  let place = findPlaceInText(message);
  // "¿cómo llego?" sin nombre: usar el último lugar mencionado en la conversación
  if (!place) {
    for (const m of [...history].reverse()) {
      place = findPlaceInText(m.content);
      if (place) break;
    }
  }
  let target: Place | undefined = place;
  if (!target) {
    // Lugar que no está en el catálogo: igual se busca en Google Maps
    const m = message.match(/(?:ir|llegar|llego|voy|visitar|conocer|ll[eé]vame|ruta)\s+(?:a|al|hasta|hacia|para)?\s*(?:la|el|los|las)?\s*([^?.!,]{3,60})/i);
    const name = m?.[1]?.replace(/\b(caminando|a pie|en carro|en taxi|en bus|en moto|en bici(cleta)?)\b.*$/i, "").trim();
    if (!name) return null;
    target = { name, kind: "Lugar", category: "Cultura", image: "", id: "externo" } as Place;
  }
  const d = buildDirections([target], { origin, mode: detectMode(message) });
  return { ...d, inCatalog: !!place };
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(request: Request) {
  try {
    const { message, history = [], context = {} } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const { origin } = context as { origin?: { latitude: number; longitude: number } };
    const directions = directionsFor(message, history as ChatMessage[], origin);

    if (!process.env.GROQ_API_KEY) {
      if (directions) {
        return NextResponse.json({
          message: `¡Listo! Te dejo la ruta hacia **${directions.places[0].name}** en Google Maps. Toca el botón para abrirla con tu ubicación actual.`,
          timestamp: new Date().toISOString(),
          mentionedPlaces: [],
          suggestsRoute: false,
          directions,
        });
      }
      return NextResponse.json(
        { error: "GROQ_API_KEY no configurada. Configura tu clave en .env.local." },
        { status: 503 }
      );
    }

    // Contexto personalizado del usuario
    const { favorites = [], interests = [], activeView = "Inicio" } = context;

    const favoritePlaces = places
      .filter((p) => favorites.includes(p.id))
      .map((p) => `${p.name} (${p.category})`)
      .slice(0, 10)
      .join(", ");

    const placesContext = `
Eres un asistente turístico conversacional de "Descubre Pasto", una app para descubrir y recorrer la ciudad de Pasto, Nariño, Colombia.

CATÁLOGO DISPONIBLE:
- ${places.length} lugares registrados en total
- Categorías: Templos, Plazas, Parques, Museos, Gastronomía, Naturaleza, Cultura, Puentes, Centros comerciales
- Intereses principales: Cultura, Historia, Gastronomía, Naturaleza

LUGARES DESTACADOS:
${places
  .filter((p) => p.verified)
  .slice(0, 15)
  .map((p) => `- ${p.name}: ${p.category}, ${p.neighborhood}, ${p.visitMinutes ? p.visitMinutes + " min" : "tiempo libre"}`)
  .join("\n")}

CONTEXTO DEL USUARIO ACTUAL:
- Sección activa: ${activeView}
- Intereses configurados: ${interests.length > 0 ? interests.join(", ") : "no configurados aún"}
- Favoritos guardados: ${favoritePlaces || "ninguno guardado aún"}

TU COMPORTAMIENTO:
- Eres amigable, entusiasta y conocedor de Pasto
- Personalizas tus respuestas usando los intereses y favoritos del usuario
- Si el usuario pide una ruta o recorrido, recomiendas el flujo: "Ve a la sección Recorrido para que el asistente te arme un itinerario personalizado" o sugiere los parámetros concretos (tiempo, presupuesto, intereses)
- Cuando menciones un lugar del catálogo, escríbelo entre corchetes así: [Nombre del lugar] para que el sistema lo pueda detectar
- Respondes en español colombiano, de forma natural y conversacional
- Máximo 3 párrafos por respuesta, directo al punto
- Si el usuario tiene favoritos, referéncialos cuando sea relevante
- Si el usuario dice a dónde quiere ir o pregunta cómo llegar, la app le mostrará un botón con la ruta en Google Maps desde su ubicación: dale 1 o 2 tips útiles para llegar (zona, si conviene caminar, taxi o bus) y dile que toque el botón. Nunca inventes direcciones exactas ni números de calle.
${directions ? `- En este mensaje el usuario quiere ir a: ${directions.places[0].name}. La ruta ya está lista en el botón.` : ""}
`.trim();

    const systemMessage: ChatMessage = {
      role: "system",
      content: placesContext,
    };

    const messages: ChatMessage[] = [
      systemMessage,
      ...history.slice(-8),
      { role: "user", content: message },
    ];

    const completion = await getGroq().chat.completions.create({
      messages,
      model: "qwen/qwen3.8-27b",
      temperature: 0.7,
      max_tokens: 600,
      top_p: 0.9,
      stream: false,
    });

    const responseMessage =
      completion.choices[0]?.message?.content ||
      "Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?";

    // Detectar lugares mencionados en la respuesta (entre corchetes)
    const mentionedPlaceNames = [...responseMessage.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
    const mentionedPlaces = places
      .filter((p) => mentionedPlaceNames.some((name) => p.name.toLowerCase().includes(name.toLowerCase())))
      .slice(0, 3)
      .map((p) => ({ id: p.id, name: p.name, category: p.category, neighborhood: p.neighborhood, image: p.image }));

    // Detectar si el mensaje sugiere crear un recorrido
    const suggestsRoute =
      /recorrido|itinerario|ruta|plan|visitar|cuántos lugares|cuánto tiempo/i.test(responseMessage);

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
      mentionedPlaces,
      suggestsRoute: directions ? false : suggestsRoute,
      directions,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    const isGroqError = error instanceof Error && error.message.includes("groq");
    return NextResponse.json(
      {
        message: isGroqError
          ? "La IA de Groq no está disponible en este momento. Por favor intenta de nuevo en unos segundos."
          : "Disculpa, estoy teniendo problemas técnicos. ¿Podrías intentar de nuevo?",
        timestamp: new Date().toISOString(),
        mentionedPlaces: [],
        suggestsRoute: false,
      },
      { status: 500 }
    );
  }
}
