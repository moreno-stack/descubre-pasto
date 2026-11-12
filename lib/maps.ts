import { places, type Place } from "@/lib/places";

/*
 * Enlaces de Google Maps (no requieren API key).
 * Se busca por nombre + ciudad para que Google abra su propia ficha del lugar
 * (la misma que ves en Google Maps) y no un pin suelto en unas coordenadas.
 */

export type TravelMode = "walking" | "driving" | "transit" | "bicycling";

/** Nombres con los que Google Maps encuentra mejor algunos lugares. */
const MAPS_QUERY: Record<string, string> = {
  "Templo de Cristo Rey - Jesuitas": "Iglesia de Cristo Rey, Pasto, Nariño",
  "Iglesia de San Felipe": "Parroquia San Felipe Neri, Pasto, Nariño",
  "Parroquia San Felipe Neri": "Parroquia San Felipe Neri, Pasto, Nariño",
  "Catedral Sagrado Corazón de Jesús": "Catedral de Pasto, Nariño",
  "Plazoleta Banco de la República": "Museo del Oro Nariño, Pasto",
  "Centro Cultural Leopoldo López Álvarez": "Centro Cultural Leopoldo López Álvarez, Pasto",
  "Laguna de La Cocha": "Laguna de La Cocha, El Encano, Nariño",
  "Puentes de El Encano": "El Encano, Pasto, Nariño",
  "Isla La Corota": "Santuario de Flora Isla de La Corota, Nariño",
  "Volcán Galeras": "Volcán Galeras, Nariño",
  "Santuario de Fauna y Flora Galeras": "Santuario de Fauna y Flora Galeras, Nariño",
  "Cerro Morasurco": "Volcán Morasurco, Nariño",
  "Reserva Natural La Planada": "Reserva Natural La Planada, Ricaurte, Nariño",
  "Plaza Central de Genoy": "Genoy, Pasto, Nariño",
  "Universidad de Nariño - Sede Centro": "Universidad de Nariño Sede Centro, Pasto",
  "Mercado El Potrerillo": "Plaza de Mercado El Potrerillo, Pasto",
  "Mercado El Tejar": "Plaza de Mercado El Tejar, Pasto",
  "Los Dos Puentes": "Mercado Dos Puentes, Pasto, Nariño",
  "Centro Comercial Unico Outlet - Pasto": "Único Outlet Pasto",
  "Parque Estadio de la Pastusidad": "Estadio de la Pastusidad, Pasto",
};

/** Texto que se le pasa a Google Maps para encontrar el lugar. */
export function mapsQuery(place: Pick<Place, "name" | "kind">): string {
  if (MAPS_QUERY[place.name]) return MAPS_QUERY[place.name];
  if (place.kind === "Plato típico") return `${place.name} restaurante, Pasto, Nariño`;
  return `${place.name}, Pasto, Nariño, Colombia`;
}

/** Abre la ficha del lugar en Google Maps. */
export function placeUrl(place: Pick<Place, "name" | "kind">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(place))}`;
}

/** Mapa embebido (iframe) del lugar. */
export function embedUrl(place: Pick<Place, "name" | "kind">): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery(place))}&output=embed`;
}

type Origin = { latitude: number; longitude: number } | string | undefined;

/**
 * Ruta en Google Maps hasta uno o varios lugares (en orden).
 * Sin origen, Google usa la ubicación actual del teléfono.
 */
export function directionsUrl(stops: Pick<Place, "name" | "kind">[], opts: { origin?: Origin; mode?: TravelMode } = {}): string {
  if (!stops.length) return "https://www.google.com/maps";
  const params = new URLSearchParams({ api: "1" });
  if (opts.origin) {
    params.set("origin", typeof opts.origin === "string" ? opts.origin : `${opts.origin.latitude},${opts.origin.longitude}`);
  }
  const queries = stops.map(mapsQuery);
  params.set("destination", queries[queries.length - 1]);
  // Google Maps admite hasta 9 paradas intermedias.
  const waypoints = queries.slice(0, -1).slice(0, 9);
  if (waypoints.length) params.set("waypoints", waypoints.join("|"));
  params.set("travelmode", opts.mode ?? "driving");
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const normalize = (s: string) =>
  s.toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set(["de", "del", "la", "las", "el", "los", "y", "a", "al", "en", "pasto", "iglesia", "parque", "plaza", "plazoleta", "templo", "parroquia", "centro", "comercial", "museo", "san", "santa"]);

/** Formas cortas con las que la gente nombra algunos lugares. */
const ALIASES: Record<string, string> = {
  "catedral": "Catedral Sagrado Corazón de Jesús",
  "la cocha": "Laguna de La Cocha",
  "galeras": "Volcán Galeras",
  "cristo rey": "Templo de Cristo Rey - Jesuitas",
  "jesuitas": "Templo de Cristo Rey - Jesuitas",
  "museo del oro": "Museo del Oro Nariño",
  "banco de la republica": "Museo del Oro Nariño",
  "potrerillo": "Mercado El Potrerillo",
  "el tejar": "Mercado El Tejar",
  "la corota": "Isla La Corota",
  "chimayoy": "Parque Ambiental Chimayoy",
  "estadio": "Estadio Departamental Libertad",
  "udenar": "Universidad de Nariño - Sede Centro",
  "gobernacion": "Gobernación de Nariño",
  "alcaldia": "Alcaldía de Pasto",
  "el encano": "Puentes de El Encano",
  "morasurco": "Cerro Morasurco",
  "tescual": "Mirador de Tescual",
  "genoy": "Plaza Central de Genoy",
};

/** Busca en el catálogo el lugar que el usuario nombró en su mensaje. */
export function findPlaceInText(text: string): Place | undefined {
  const msg = ` ${normalize(text)} `;
  let best: { place: Place; score: number } | undefined;
  for (const [alias, name] of Object.entries(ALIASES)) {
    const place = places.find((p) => p.name === name);
    const score = 60 + alias.length;
    if (place && msg.includes(` ${alias} `) && (!best || score > best.score)) best = { place, score };
  }
  for (const place of places) {
    const name = normalize(place.name.replace(/ - .*$/, ""));
    let score = 0;
    if (msg.includes(` ${name} `)) score = 100 + name.length; // nombre completo
    else {
      const words = name.split(" ").filter((w) => w.length > 2 && !STOP.has(w));
      if (!words.length) continue;
      const hits = words.filter((w) => msg.includes(` ${w} `)).length;
      if (hits === words.length) score = 50 + hits * 5 + name.length / 10;
    }
    if (score && (!best || score > best.score)) best = { place, score };
  }
  return best?.place;
}

/** ¿El usuario está pidiendo cómo llegar a algún sitio? */
export function asksForDirections(text: string): boolean {
  return /(quiero|quisiera|deseo|voy a|vamos a|me gustar[ií]a|necesito)\s+(ir|llegar|visitar|conocer)|c[oó]mo\s+(llego|llegar|voy|me voy)|ll[eé]vame|ruta\s+(a|al|hacia|para)|direcci[oó]n\s+(de|del|a|al)|d[oó]nde\s+(queda|est[aá]|es)|ub[ií]ca(me|ci[oó]n)/i.test(text);
}

/** Medio de transporte que el usuario mencionó (si lo hizo). */
export function detectMode(text: string): TravelMode | undefined {
  if (/caminando|a pie|caminar|andando/i.test(text)) return "walking";
  if (/\bbus\b|buseta|transporte p[uú]blico|sitp|setp/i.test(text)) return "transit";
  if (/bici|bicicleta/i.test(text)) return "bicycling";
  if (/carro|auto|taxi|moto|manejando|en coche|uber/i.test(text)) return "driving";
  return undefined;
}

/** Modo sugerido según la distancia (en el centro conviene caminar). */
export function suggestedMode(distanceKm?: number): TravelMode {
  if (distanceKm !== undefined && distanceKm <= 1.5) return "walking";
  return "driving";
}
