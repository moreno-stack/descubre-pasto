import { NextResponse } from "next/server";
import { distanceKm, interests, places, type Place } from "@/lib/places";
import type { Intent, RecommendationRequest } from "@/lib/types";
import { getGroq } from "@/lib/groq";

type RoutablePlace = Place & { latitude: number; longitude: number; visitMinutes: number };

function hasRouteData(place: Place): place is RoutablePlace {
  return place.latitude !== undefined && place.longitude !== undefined && place.visitMinutes !== undefined;
}

async function parseIntentWithAI(prompt: string, request: RecommendationRequest): Promise<Intent> {
  try {
    const systemPrompt = `Eres un asistente que analiza solicitudes de turismo en Pasto, Colombia. 
Extrae del texto del usuario:
1. Número de horas disponibles (entre 1 y 12)
2. Presupuesto: "Bajo", "Medio" o "Alto"
3. Intereses: elige entre "Cultura", "Historia", "Gastronomía", "Naturaleza"

Responde SOLO con un JSON válido en este formato:
{"hours": número, "budget": "Bajo/Medio/Alto", "interests": ["interés1", "interés2"]}`;

    const userPrompt = `Usuario dice: "${prompt}"
Tiempo indicado por usuario: ${request.hours} horas
Presupuesto indicado: ${request.budget}
Intereses indicados: ${request.interests?.join(", ")}`;

    const completion = await getGroq().chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "qwen/qwen3.8-27b",
      temperature: 0.3,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(response.trim());

    return {
      hours: Math.max(1, Math.min(12, parsed.hours || request.hours || 3)),
      budget: parsed.budget || request.budget || "Medio",
      interests: parsed.interests?.length ? parsed.interests : request.interests?.length ? request.interests : ["Cultura", "Historia"],
    };
  } catch (error) {
    console.error("Error parsing with AI:", error);
    // Fallback a la lógica original
    return parseIntentFallback(prompt, request);
  }
}

function parseIntentFallback(prompt: string, request: RecommendationRequest): Intent {
  const normalized = prompt.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const timeMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:horas?|h\b)/);
  const detected = interests.filter((interest) => {
    const normalizedInterest = interest.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.includes(normalizedInterest)) return true;
    if (interest === "Gastronomía") return /comida tipica|comer|plato|sabores|restaurante|mercado|gastronomic/.test(normalized);
    if (interest === "Cultura") return /cultural|carnaval|artesan[ií]a|museo|arte/.test(normalized);
    if (interest === "Historia") return /hist[oó]ric|patrimonio|memoria/.test(normalized);
    if (interest === "Naturaleza") return /naturaleza|laguna|monta[ñn]a|aire libre|paisaje/.test(normalized);
    return false;
  });
  const budget = /poco presupuesto|econ[oó]mic|barato|bajo costo/.test(normalized)
    ? "Bajo"
    : /presupuesto alto|lujo|premium/.test(normalized)
      ? "Alto"
      : request.budget ?? "Medio";

  return {
    hours: Math.max(1, Math.min(12, Number(timeMatch?.[1]?.replace(",", ".")) || request.hours || 3)),
    budget,
    interests: detected.length ? detected : request.interests?.length ? request.interests : ["Cultura", "Historia"],
  };
}

async function buildRouteWithAI(intent: Intent, request: RecommendationRequest) {
  const maxMinutes = intent.hours * 60;
  const startPoint = request.startCoordinates ?? { latitude: 1.2136, longitude: -77.2811 };
  const visited = new Set(request.visited ?? []);
  const favorites = new Set(request.favorites ?? []);
  
  // Filtrar lugares candidatos
  const candidates = places
    .filter((place) => intent.interests.includes(place.interest))
    .filter(hasRouteData)
    .filter((place) => intent.budget === "Alto" || place.budget !== "Alto")
    .filter((place) => !visited.has(place.id))
    .map((place) => ({ place, distance: distanceKm(startPoint, place) }));

  if (candidates.length === 0) {
    return { route: [], estimatedMinutes: 0, maxMinutes, aiEnhanced: false };
  }

  try {
    // Usar Groq para optimizar la ruta
    const systemPrompt = `Eres un experto en crear rutas turísticas en Pasto, Colombia. 
Dado un conjunto de lugares y restricciones de tiempo, selecciona los mejores lugares y ordénalos de manera lógica.
Considera:
- Distancia entre lugares
- Tiempo de visita
- Favoritos del usuario
- Diversidad de experiencias

Responde SOLO con un array JSON de IDs en el orden sugerido: ["id1", "id2", "id3"]`;

    const placesInfo = candidates.map(({ place, distance }) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      interest: place.interest,
      visitMinutes: place.visitMinutes,
      distanceFromStart: Math.round(distance * 10) / 10,
      isFavorite: favorites.has(place.id),
    }));

    const userPrompt = `Tiempo disponible: ${maxMinutes} minutos
Lugares disponibles: ${JSON.stringify(placesInfo, null, 2)}
Selecciona y ordena máximo 4 lugares que se ajusten al tiempo.`;

    const completion = await getGroq().chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "qwen/qwen3.8-27b",
      temperature: 0.5,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || "[]";
    const selectedIds = JSON.parse(response.trim()) as string[];

    // Construir la ruta basada en los IDs sugeridos por la IA
    const route: { place: Place; distance: number }[] = [];
    let spent = 0;
    let current = startPoint;

    for (const id of selectedIds) {
      const candidate = candidates.find(c => c.place.id === id);
      if (!candidate) continue;

      const travelMinutes = Math.round((distanceKm(current, candidate.place) * 60) / 4);
      const totalTime = spent + candidate.place.visitMinutes + travelMinutes;

      if (totalTime <= maxMinutes && route.length < 4) {
        route.push(candidate);
        spent = totalTime;
        current = candidate.place;
      }
    }

    return { route, estimatedMinutes: spent, maxMinutes, aiEnhanced: true };
  } catch (error) {
    console.error("Error building route with AI:", error);
    // Fallback a la lógica original
    return buildRouteFallback(intent, request, candidates, startPoint, visited, favorites, maxMinutes);
  }
}

function buildRouteFallback(
  intent: Intent,
  request: RecommendationRequest,
  candidates: { place: RoutablePlace; distance: number }[],
  startPoint: { latitude: number; longitude: number },
  visited: Set<string>,
  favorites: Set<string>,
  maxMinutes: number
) {
  const sorted = [...candidates].sort((a, b) => {
    const score = (item: { place: Place; distance: number }) =>
      (favorites.has(item.place.id) ? 3 : 0) - item.distance * 1.5 - (item.place.budget === "Bajo" ? 0 : 1);
    return score(b) - score(a);
  });

  const route: { place: Place; distance: number }[] = [];
  let spent = 0;
  let current = startPoint;
  
  while (sorted.length && route.length < 4) {
    const nextIndex = sorted.findIndex(({ place }) => {
      const distance = distanceKm(current, place);
      const transferMinutes = Math.round((distance * 60) / 4);
      return spent + place.visitMinutes + transferMinutes <= maxMinutes;
    });
    if (nextIndex < 0) break;
    const [next] = sorted.splice(nextIndex, 1);
    const travelMinutes = Math.round((distanceKm(current, next.place) * 60) / 4);
    spent += next.place.visitMinutes + travelMinutes;
    route.push(next);
    current = next.place;
  }

  return { route, estimatedMinutes: spent, maxMinutes, aiEnhanced: false };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecommendationRequest;
    const prompt = body.prompt?.slice(0, 500) ?? "";
    
    // Usar IA para parsear la intención
    const intent = await parseIntentWithAI(prompt, body);
    
    // Usar IA para construir la ruta
    const result = await buildRouteWithAI(intent, body);

    return NextResponse.json({
      intent,
      route: result.route.map(({ place, distance }, index) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        minutes: place.visitMinutes,
        distanceKm: Math.round(distance * 10) / 10,
        reason: `Incluido por tu interés en ${place.interest.toLocaleLowerCase("es")} y su compatibilidad con el tiempo indicado.`,
        schedule: place.schedule,
        verified: place.verified,
        order: index + 1,
      })),
      estimatedMinutes: result.estimatedMinutes,
      note: result.route.length
        ? `Los horarios y tiempos son referenciales y deben confirmarse antes de salir. ${result.aiEnhanced ? "Ruta optimizada con IA." : "Selección del catálogo disponible."}`
        : "No hay suficientes lugares del catálogo que coincidan con estos filtros y el tiempo disponible. Prueba ampliar el tiempo o cambiar intereses.",
      source: result.aiEnhanced ? "groq-ai-v1" : "catalog-v1",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "No fue posible procesar la solicitud." }, { status: 400 });
  }
}