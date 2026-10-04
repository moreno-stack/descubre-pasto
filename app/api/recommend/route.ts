import { NextResponse } from "next/server";
import { distanceKm, interests, places, type Place } from "@/lib/places";
import type { Intent, RecommendationRequest } from "@/lib/types";

type RoutablePlace = Place & { latitude: number; longitude: number; visitMinutes: number };

function hasRouteData(place: Place): place is RoutablePlace {
  return place.latitude !== undefined && place.longitude !== undefined && place.visitMinutes !== undefined;
}

function parseIntent(prompt: string, request: RecommendationRequest): Intent {
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

function buildRoute(intent: Intent, request: RecommendationRequest) {
  const maxMinutes = intent.hours * 60;
  const startPoint = request.startCoordinates ?? { latitude: 1.2136, longitude: -77.2811 };
  const visited = new Set(request.visited ?? []);
  const favorites = new Set(request.favorites ?? []);
  const candidates = places
    .filter((place) => intent.interests.includes(place.interest))
    .filter(hasRouteData)
    .filter((place) => intent.budget === "Alto" || place.budget !== "Alto")
    .filter((place) => !visited.has(place.id))
    .map((place) => ({ place, distance: distanceKm(startPoint, place) }))
    .sort((a, b) => {
      const score = (item: { place: Place; distance: number }) =>
        (favorites.has(item.place.id) ? 3 : 0) - item.distance * 1.5 - (item.place.budget === "Bajo" ? 0 : 1);
      return score(b) - score(a);
    });

  const route: { place: Place; distance: number }[] = [];
  let spent = 0;
  let current = startPoint;
  while (candidates.length && route.length < 4) {
    const nextIndex = candidates.findIndex(({ place, distance }) => {
      const transferMinutes = Math.round((distance * 60) / 4);
      return spent + place.visitMinutes + transferMinutes <= maxMinutes;
    });
    if (nextIndex < 0) break;
    const [next] = candidates.splice(nextIndex, 1);
    const travelMinutes = Math.round((distanceKm(current, next.place) * 60) / 4);
    spent += next.place.visitMinutes + travelMinutes;
    route.push(next);
    current = next.place;
  }

  return { route, estimatedMinutes: spent, maxMinutes };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecommendationRequest;
    const prompt = body.prompt?.slice(0, 500) ?? "";
    const intent = parseIntent(prompt, body);
    const result = buildRoute(intent, body);

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
        ? "Los horarios y tiempos son referenciales y deben confirmarse antes de salir. La selección proviene del catálogo disponible."
        : "No hay suficientes lugares del catálogo que coincidan con estos filtros y el tiempo disponible. Prueba ampliar el tiempo o cambiar intereses.",
      source: "catalog-v1",
    });
  } catch {
    return NextResponse.json({ error: "No fue posible procesar la solicitud." }, { status: 400 });
  }
}