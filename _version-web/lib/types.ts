import type { Interest } from "@/lib/places";

// Re-exportamos Coordinates desde su fuente canónica
export type { Coordinates } from "@/lib/places";

/** Intención del usuario interpretada a partir del prompt y los parámetros del formulario. */
export interface Intent {
  hours: number;
  budget: string;
  interests: Interest[];
}

/** Una parada individual dentro de un recorrido recomendado. */
export interface RouteStop {
  id: string;
  name: string;
  category: Interest;
  minutes: number;
  distanceKm: number;
  reason: string;
  schedule: string;
  verified: boolean;
  order: number;
}

/** Respuesta completa de la API /api/recommend. */
export interface Recommendation {
  intent: Intent;
  route: RouteStop[];
  estimatedMinutes: number;
  note: string;
}

/** Payload que envía el cliente a POST /api/recommend. */
export interface RecommendationRequest {
  prompt?: string;
  hours?: number;
  budget?: string;
  interests?: Interest[];
  start?: string;
  favorites?: string[];
  visited?: string[];
  startCoordinates?: import("@/lib/places").Coordinates;
}
