import type { PlaceCategory } from "@/lib/places";

export const categoryImages: Record<PlaceCategory, string> = {
  Templos: "/imagenes/catedral-san-juan.jpg",
  Plazas: "/imagenes/plaza-narino.jpg",
  Parques: "/imagenes/parque-infantil.jpg",
  "Centros comerciales": "/imagenes/centro-comercial-sebastian.jpg",
  Puentes: "/imagenes/rio-chapal.jpg",
  Museos: "/imagenes/museo-oro.jpg",
  Cultura: "/imagenes/carnaval.jpg",
  Naturaleza: "/imagenes/galeras.jpg",
  Gastronomía: "/imagenes/mercado-local.jpg",
};

export const specificPlaceImages: Record<string, string> = {
  "Catedral Sagrado Corazón de Jesús": "/imagenes/catedral-san-juan.jpg",
  "Templo de Cristo Rey - Jesuitas": "/imagenes/templo-cristo-rey.jpg",
  "Iglesia de San Andrés": "/imagenes/templo-san-andres.jpg",
  "Iglesia de San Felipe": "/imagenes/iglesia-san-felipe.jpg",
  "Iglesia de La Merced": "/imagenes/iglesia-merced.jpg",
  "Plaza de Nariño": "/imagenes/plaza-narino.jpg",
  "Plazoleta de la Catedral": "/imagenes/plaza-narino-centro.jpg",
  "Plazoleta de San Juan": "/imagenes/catedral-san-juan.jpg",
  "Parque Infantil": "/imagenes/parque-infantil.jpg",
  "Parque de San Felipe": "/imagenes/parque-san-felipe.jpg",
  "Parque de La Aurora": "/imagenes/parque-aurora.jpg",
  "Parque La Aurora": "/imagenes/parque-aurora.jpg",
  "Volcán Galeras": "/imagenes/galeras.jpg",
  "Laguna de La Cocha": "/imagenes/laguna-cocha.jpg",
  "Museo del Oro Nariño": "/imagenes/museo-oro.jpg",
  "Centro Cultural Leopoldo López Álvarez": "/imagenes/centro-cultural-leopoldo.jpg",
  "Museo del Carnaval": "/imagenes/carnaval.jpg",
  "Centro Comercial Sebastián de Belalcázar": "/imagenes/centro-comercial-sebastian.jpg",
  "Alcaldía de Pasto": "/imagenes/alcaldia-pasto.jpg",
  "Puente de Chapal": "/imagenes/rio-chapal.jpg",
};

const referencePlaceImages: Record<string, string> = {
  "Museo Taminango": "/imagenes/centro-cultural-leopoldo.jpg",
  "Museo del Carnaval": "/imagenes/carnaval.jpg",
  "Plaza del Carnaval": "/imagenes/carnaval.jpg",
  "Plazoleta de la Catedral": "/imagenes/plaza-narino-centro.jpg",
  "Plazoleta de San Juan": "/imagenes/catedral-san-juan.jpg",
  "Parque Ambiental Chimayoy": "/imagenes/parque-aurora.jpg",
  "Parque Ecológico Aurelio Arturo": "/imagenes/parque-aurora.jpg",
};

export function imageForPlace(name: string, category: PlaceCategory) {
  return specificPlaceImages[name] ?? referencePlaceImages[name] ?? categoryImages[category];
}

export function isIllustrativeImage(name: string) {
  return !specificPlaceImages[name];
}