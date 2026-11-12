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
};

/**
 * Imágenes ilustrativas (foto de referencia, no del lugar exacto).
 * Se usa para los pocos casos en que la única foto disponible muestra
 * el entorno pero no el lugar específico.
 */
export const illustrativePlaceImages: Record<string, string> = {};

/**
 * Devuelve la ruta de la imagen para un lugar.
 * Retorna "" si no existe imagen propia ni ilustrativa,
 * para que los componentes muestren el placeholder.
 */
export function imageForPlace(name: string, _category: PlaceCategory): string {
  if (specificPlaceImages[name]) return specificPlaceImages[name];
  const c = commonsPhotos[name] ?? commonsReferencePhotos[name];
  if (c) return commonsUrl(c.file);
  return illustrativePlaceImages[name] ?? "";
}

/** Verdadero cuando la imagen es ilustrativa (no es el lugar exacto). */
export function isIllustrativeImage(name: string): boolean {
  return name in illustrativePlaceImages;
}

/** Verdadero cuando no hay imagen disponible para el lugar. */
export function hasNoImage(name: string): boolean {
  return !(name in specificPlaceImages) && !(name in illustrativePlaceImages);
}


/* Fotos libres de Wikimedia Commons (licencias CC). Se cargan por internet. */
export type CommonsPhoto = { file: string; author: string; license: string };

/** Fotos reales del lugar. */
export const commonsPhotos: Record<string, CommonsPhoto> = {
  "Parroquia de Santiago Apóstol": { file: "Sector antiguo de Pasto - Iglesia de Santiago.jpg", author: "Jorgelrm", license: "CC BY-SA 3.0" },
  "Iglesia de San Juan Bautista": { file: "Iglesia San Juan Bautista de Pasto.JPG", author: "German Bolaños", license: "CC BY-SA 3.0" },
  "Iglesia de San Agustín": { file: "CO Pasto 1109 (4) (17222741876).jpg", author: "Diego Tirira from Quito, Ecuador", license: "CC BY-SA 2.0" },
  "Iglesia del Carmen": { file: "Nuestra Señora Del Carmen, Pasto.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Iglesia de San Sebastián": { file: "CO Pasto 1109 (6) (16628517233).jpg", author: "Diego Tirira from Quito, Ecuador", license: "CC BY-SA 2.0" },
  "Plazoleta de San Juan": { file: "Panorámica de la Plaza del Carnaval y Templo de San Juan Bautista.JPG", author: "Gersonparra11", license: "CC BY-SA 3.0" },
  "Plaza del Carnaval": { file: "Plaza carnaval Pasto.jpg", author: "Jhoanna1206", license: "CC BY-SA 4.0" },
  "Plazoleta de San Agustín": { file: "CO Pasto 1109 (5) (17246842052).jpg", author: "Diego Tirira from Quito, Ecuador", license: "CC BY-SA 2.0" },
  "Plazoleta de San Andrés": { file: "Plazuela San Andrés-Pasto.jpg", author: "Laureano Botina Rosero", license: "CC BY-SA 3.0" },
  "Plazoleta del Museo Taminango": { file: "Museo Taminango.jpg", author: "Jauder", license: "CC BY-SA 3.0" },
  "Plazoleta Banco de la República": { file: "Museo del Oro Nariño.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Centro Comercial Unicentro Pasto": { file: "Unicentro Pasto.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Puentes de El Encano": { file: "Puerto sobre el Lago Guamuez o Laguna de la Cocha.jpg", author: "MARIO GUDIÑO DAVILA", license: "CC BY-SA 4.0" },
  "Casona Taminango": { file: "Museo Taminango 3.jpg", author: "Jauder", license: "CC BY-SA 3.0" },
  "Museo Taminango": { file: "Museo Taminango 2.jpg", author: "Jauder", license: "CC BY-SA 3.0" },
  "Teatro Imperial": { file: "Teatro Imperial.jpg", author: "Martinduquea", license: "CC BY-SA 3.0" },
  "Parque Ambiental Chimayoy": { file: "Centro Ambiental Chimayoy.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Iglesia de San Felipe": { file: "Sanfelipe02 blended fused.jpg", author: "Jorgelrm", license: "CC BY-SA 3.0" },
  "Mercado El Potrerillo": { file: "El Potrerillo, mercado de frutas.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Isla La Corota": { file: "Panorámica de la Laguna de La Cocha tomada desde la Isla de La Corota..JPG", author: "Gersonparra11", license: "CC BY-SA 3.0" },
  "Santuario de Fauna y Flora Galeras": { file: "Santuario de Fauna y Flora Galeras Crater.png", author: "Michael Tutistar", license: "CC BY-SA 4.0" },
  "Cerro Morasurco": { file: "Cima del Cerro Morasurco.jpg", author: "NicolasErazoB", license: "CC BY-SA 4.0" },
  "Mirador de Tescual": { file: "Mirador de Tescual.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Templo de Tescual": { file: "Templo de Tescual.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Gobernación de Nariño": { file: "Edificio de La Gobernación de Nariño - Palacio de Gobierno.jpg", author: "Jauder", license: "CC BY-SA 3.0" },
  "Iglesia de La Milagrosa": { file: "Lamilagrosa blended fused.jpg", author: "Jorgelrm", license: "CC BY-SA 3.0" },
  "Pasaje Corazón de Jesús": { file: "Pasaje Corazón de Jesús - panoramio.jpg", author: "Carlos A. Revelo Rivera", license: "CC BY-SA 3.0" },
  "Estadio Departamental Libertad": { file: "Estadio Departamental Libertad.jpg", author: "Rey del Norte", license: "CC BY 4.0" },
  "Universidad de Nariño - Sede Centro": { file: "Universidad de Nariño, Centro - panoramio.jpg", author: "Carlos A. Revelo Rivera", license: "CC BY-SA 3.0" },
  "Centro Cultural Palatino": { file: "Centro Cultural Palatino.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Plaza Central de Genoy": { file: "Plaza Central Genoy.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Mercado El Tejar": { file: "Mercado El Tejar, Pasto.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Parroquia María Auxiliadora": { file: "Parroquia María Auxiliadora.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
  "Parque Estadio de la Pastusidad": { file: "Casa del lago en el estadio de la pastusidad..JPG", author: "William Sosa", license: "CC BY-SA 3.0" },
  "Los Dos Puentes": { file: "Los Dos Puentes.jpg", author: "Υ.Γ.", license: "CC BY-SA 4.0" },
};

/** Platos: foto de referencia del plato (no necesariamente tomada en Pasto). */
export const commonsReferencePhotos: Record<string, CommonsPhoto> = {
  "Cuy": { file: "Cuy asado.jpg", author: "Pedro M. Martínez Corada", license: "CC BY-SA 4.0" },
  "Frito pastuso": { file: "Fritada.jpg", author: "Meri.isa2606", license: "CC BY-SA 4.0" },
  "Hornado": { file: "Hornado en Iñaquito.jpg", author: "Pedro M. Martínez Corada", license: "CC BY-SA 4.0" },
  "Helado de paila": { file: "Helado de paila 01.jpg", author: "Remux", license: "CC BY-SA 4.0" },
};

export function commonsUrl(file: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=${width}`;
}

/** Crédito de la foto (para mostrar en la ficha). */
export function photoCredit(name: string): string | null {
  const c = commonsPhotos[name] ?? commonsReferencePhotos[name];
  return c ? `Foto: ${c.author} · ${c.license} · Wikimedia Commons` : null;
}
