import { distanceKm, type Place } from "@/lib/places";
import { directionsUrl, placeUrl, suggestedMode, type TravelMode } from "@/lib/maps";

type Origin = { latitude: number; longitude: number };

export type Directions = ReturnType<typeof buildDirections>;

const CENTRO = { latitude: 1.21461, longitude: -77.27829 };

export function buildDirections(stops: Place[], opts: { origin?: Origin; mode?: TravelMode } = {}) {
  const last = stops[stops.length - 1];
  const from = opts.origin ?? CENTRO;
  const km = last && last.latitude !== undefined ? Math.round(distanceKm(from, last) * 10) / 10 : undefined;
  const mode = opts.mode ?? suggestedMode(stops.length > 1 ? undefined : km);
  return {
    places: stops.map((p) => ({ id: p.id, name: p.name, category: p.category, image: p.image })),
    mode,
    distanceKm: stops.length === 1 ? km : undefined,
    mapsUrl: directionsUrl(stops, { origin: opts.origin, mode }),
    placeUrl: stops.length === 1 ? placeUrl(last) : undefined,
    modes: {
      walking: directionsUrl(stops, { origin: opts.origin, mode: "walking" }),
      driving: directionsUrl(stops, { origin: opts.origin, mode: "driving" }),
      transit: directionsUrl(stops, { origin: opts.origin, mode: "transit" }),
    },
  };
}

