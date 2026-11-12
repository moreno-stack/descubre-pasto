import { NextResponse } from "next/server";
import { places, type Place } from "@/lib/places";
import { detectMode, findPlaceInText, type TravelMode } from "@/lib/maps";
import { buildDirections } from "@/lib/directions";

/*
 * POST /api/directions
 * Devuelve la ruta en Google Maps hacia uno o varios lugares del catálogo.
 *
 * Body (cualquiera de estas formas):
 *   { "message": "quiero ir a la Laguna de La Cocha caminando" }
 *   { "placeId": "museos-museo-taminango", "mode": "walking" }
 *   { "placeIds": ["id1", "id2", "id3"] }        // recorrido con varias paradas
 *   + opcional "origin": { "latitude": 1.21, "longitude": -77.28 }
 */

type Body = {
  message?: string;
  placeId?: string;
  placeIds?: string[];
  mode?: TravelMode;
  origin?: { latitude: number; longitude: number };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    let stops: Place[] = [];

    if (body.placeIds?.length) {
      stops = body.placeIds.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p);
    } else if (body.placeId) {
      const p = places.find((x) => x.id === body.placeId);
      if (p) stops = [p];
    } else if (body.message) {
      const p = findPlaceInText(body.message);
      if (p) stops = [p];
    }

    if (!stops.length) {
      return NextResponse.json(
        { error: "No encontré ese lugar en el catálogo. Escribe el nombre, por ejemplo: \"quiero ir al Museo Taminango\"." },
        { status: 404 },
      );
    }

    const mode = body.mode ?? (body.message ? detectMode(body.message) : undefined);
    return NextResponse.json(buildDirections(stops, { origin: body.origin, mode }));
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
