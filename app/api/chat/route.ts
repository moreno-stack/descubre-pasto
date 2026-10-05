import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { places } from "@/lib/places";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    if (!process.env.GROQ_API_KEY) {
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

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
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
      suggestsRoute,
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
