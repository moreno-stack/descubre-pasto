import type { PlaceCategory } from "@/lib/places";

/**
 * Imágenes reales disponibles en /public/imagenes/.
 * Solo se listan lugares que tienen su propia fotografía.
 * Si un lugar NO aparece aquí, imageForPlace() devuelve "" y se
 * muestra el placeholder "Foto pendiente" en la interfaz.
 */
export const specificPlaceImages: Record<string, string> = {
  // ── Templos ─────────────────────────────────────────────────────────────────
  "Catedral Sagrado Corazón de Jesús": "/imagenes/catedral-san-juan.jpg",
  "Templo de Cristo Rey - Jesuitas":   "/imagenes/templo-cristo-rey.jpg",
  "Iglesia de San Andrés":             "/imagenes/templo-san-andres.jpg",
  "Parroquia San Felipe Neri":         "/imagenes/iglesia-san-felipe.jpg",
  "Iglesia de La Merced":              "/imagenes/iglesia-merced.jpg",
  // Iglesia de San Felipe comparte zona con el parque; se marca ilustrativa
  // para que la interfaz lo indique (la foto muestra el parque, no el templo).

  // ── Plazas ──────────────────────────────────────────────────────────────────
  "Plaza de Nariño":         "/imagenes/plaza-narino.jpg",
  "Plazoleta de la Catedral":"/imagenes/plaza-narino-centro.jpg",
  "Alcaldía de Pasto":       "/imagenes/alcaldia-pasto.jpg",

  // ── Parques ─────────────────────────────────────────────────────────────────
  "Parque Infantil":        "/imagenes/parque-infantil.jpg",
  "Parque de San Felipe":   "/imagenes/parque-san-felipe.jpg",
  "Parque de La Aurora":    "/imagenes/parque-aurora.jpg",

  // ── Centros comerciales ──────────────────────────────────────────────────────
  "Centro Comercial Sebastián de Belalcázar": "/imagenes/centro-comercial-sebastian.jpg",

  // ── Puentes ─────────────────────────────────────────────────────────────────
  "Puente de Chapal": "/imagenes/rio-chapal.jpg",

  // ── Museos / Cultura ────────────────────────────────────────────────────────
  "Museo del Oro Nariño":                  "/imagenes/museo-oro.jpg",
  "Centro Cultural Leopoldo López Álvarez":"/imagenes/centro-cultural-leopoldo.jpg",
  "Museo del Carnaval":                    "/imagenes/carnaval.jpg",

  // ── Naturaleza ───────────────────────────────────────────────────────────────
  "Volcán Galeras":     "/imagenes/galeras.jpg",
  "Laguna de La Cocha": "/imagenes/laguna-cocha.jpg",

  // ── Gastronomía ─────────────────────────────────────────────────────────────
  "Mercado El Potrerillo": "/imagenes/mercado-local.jpg",
};

/**
 * Imágenes ilustrativas (foto de referencia, no del lugar exacto).
 * Se usa para los pocos casos en que la única foto disponible muestra
 * el entorno pero no el lugar específico.
 */
export const illustrativePlaceImages: Record<string, string> = {
  // La foto del parque San Felipe incluye el templo al fondo.
  "Iglesia de San Felipe": "/imagenes/parque-san-felipe.jpg",
  // Museo Taminango no tiene foto propia; se indica referencia.
  "Museo Taminango": "/imagenes/centro-cultural-leopoldo.jpg",
};

/**
 * Devuelve la ruta de la imagen para un lugar.
 * Retorna "" si no existe imagen propia ni ilustrativa,
 * para que los componentes muestren el placeholder.
 */
export function imageForPlace(name: string, _category: PlaceCategory): string {
  return specificPlaceImages[name] ?? illustrativePlaceImages[name] ?? "";
}

/** Verdadero cuando la imagen es ilustrativa (no es el lugar exacto). */
export function isIllustrativeImage(name: string): boolean {
  return name in illustrativePlaceImages;
}

/** Verdadero cuando no hay imagen disponible para el lugar. */
export function hasNoImage(name: string): boolean {
  return !(name in specificPlaceImages) && !(name in illustrativePlaceImages);
}
