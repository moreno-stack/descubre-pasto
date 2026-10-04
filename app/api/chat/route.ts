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
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    // Contexto sobre Pasto y los lugares disponibles
    const placesContext = `
Información de Descubre Pasto:
- Total de lugares en catálogo: ${places.length}
- Categorías: Templos, Plazas, Parques, Museos, Gastronomía, Naturaleza
- Ciudad: Pasto, Nariño, Colombia
- Intereses principales: Cultura, Historia, Gastronomía, Naturaleza

Lugares destacados:
${places.slice(0, 20).map(p => `- ${p.name}: ${p.category}, ${p.interest}`).join('\n')}

Tu rol:
- Eres un asistente turístico experto en Pasto, Nariño, Colombia
- Ayudas a planificar visitas, recomendar lugares y responder preguntas
- Eres amigable, conocedor y entusiasta sobre Pasto
- Respondes en español de forma natural y conversacional
- Si te preguntan sobre lugares específicos, usa la información del catálogo
- Si no conoces algo específico, sé honesto pero mantén el entusiasmo
`.trim();

    const systemMessage: ChatMessage = {
      role: "system",
      content: placesContext,
    };

    const messages: ChatMessage[] = [
      systemMessage,
      ...history.slice(-6), // Últimos 6 mensajes de historial
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
      stream: false,
    });

    const responseMessage = completion.choices[0]?.message?.content || 
      "Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?";

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    
    // Fallback response si falla la IA
    const fallbackResponses = [
      "Disculpa, estoy teniendo problemas técnicos. ¿Podrías intentar de nuevo?",
      "Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta más tarde.",
    ];
    
    return NextResponse.json({
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
