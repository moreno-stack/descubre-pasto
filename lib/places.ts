import { imageForPlace, isIllustrativeImage } from "@/lib/placeImages";

export type Interest = "Cultura" | "Historia" | "Gastronomía" | "Naturaleza";
export type PlaceCategory =
  | "Templos"
  | "Plazas"
  | "Parques"
  | "Centros comerciales"
  | "Puentes"
  | "Museos"
  | "Cultura"
  | "Naturaleza"
  | "Gastronomía";

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  interest: Interest;
  kind: "Lugar" | "Plato típico";
  neighborhood: string;
  description: string;
  story: string;
  image: string;
  imageAlt: string;
  imageIsIllustrative: boolean;
  latitude?: number;
  longitude?: number;
  visitMinutes?: number;
  budget: "Bajo" | "Medio" | "Alto" | "Por verificar";
  schedule: string;
  verified: boolean;
  scope: "Urbano" | "Municipio" | "Alrededores" | "Por confirmar";
};

export const interests: Interest[] = ["Cultura", "Historia", "Gastronomía", "Naturaleza"];
export const placeCategories: PlaceCategory[] = [
  "Templos", "Plazas", "Parques", "Centros comerciales", "Puentes", "Museos", "Cultura", "Naturaleza", "Gastronomía",
];

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pendingEntry(name: string, category: PlaceCategory, interest: Interest, kind: Place["kind"] = "Lugar"): Place {
  return {
    id: `${slugify(category)}-${slugify(name)}`,
    name,
    category,
    interest,
    kind,
    neighborhood: "Sector por confirmar",
    description: "Registro inicial del inventario; descripción y datos operativos pendientes de verificación.",
    story: "Antes de recomendar una visita, se deben confirmar dirección, coordenadas, fuente, horario y condiciones de acceso.",
    image: imageForPlace(name, category),
    imageAlt: isIllustrativeImage(name) ? `Foto de referencia para ${category}` : `Fotografía de ${name}`,
    imageIsIllustrative: isIllustrativeImage(name),
    budget: "Por verificar",
    schedule: "Horario por verificar",
    verified: false,
    scope: "Por confirmar",
  };
}

export const places: Place[] = [
  {
    id: "plaza-narino",
    name: "Plaza de Nariño",
    category: "Plazas",
    interest: "Historia",
    kind: "Lugar",
    neighborhood: "Centro histórico",
    description: "Un buen punto de partida para reconocer el corazón cívico de Pasto.",
    story: "La plaza reúne edificios representativos y conecta con recorridos a pie por el centro.",
    image: "/imagenes/plaza-narino.jpg",
    imageAlt: "Vista diurna de la Plaza de Nariño",
    imageIsIllustrative: false,
    latitude: 1.2136,
    longitude: -77.2811,
    visitMinutes: 35,
    budget: "Bajo",
    schedule: "Espacio público; condiciones por confirmar",
    verified: false,
    scope: "Urbano",
  },
  {
    id: "museo-taminango",
    name: "Museo Taminango",
    category: "Museos",
    interest: "Cultura",
    kind: "Lugar",
    neighborhood: "Centro histórico",
    description: "Una casa museo para acercarse a oficios, objetos y memoria regional.",
    story: "La visita permite conocer expresiones del trabajo artesanal y la vida tradicional nariñense.",
    image: imageForPlace("Museo Taminango", "Museos"),
    imageAlt: "Foto de referencia de un espacio museístico de Pasto",
    imageIsIllustrative: true,
    latitude: 1.2171,
    longitude: -77.2792,
    visitMinutes: 55,
    budget: "Bajo",
    schedule: "Horario por confirmar antes de la visita",
    verified: false,
    scope: "Urbano",
  },
  {
    id: "museo-carnaval",
    name: "Museo del Carnaval",
    category: "Museos",
    interest: "Cultura",
    kind: "Lugar",
    neighborhood: "Pandiaco",
    description: "Un espacio dedicado a las expresiones artísticas del Carnaval de Negros y Blancos.",
    story: "Máscaras, carrozas y saberes artesanales forman parte de una celebración reconocida por la UNESCO.",
    image: "/imagenes/carnaval.jpg",
    imageAlt: "Carnaval de Negros y Blancos de Pasto",
    imageIsIllustrative: false,
    latitude: 1.2292,
    longitude: -77.2784,
    visitMinutes: 60,
    budget: "Bajo",
    schedule: "Horario por confirmar antes de la visita",
    verified: false,
    scope: "Urbano",
  },
  {
    id: "mercado-potrerillo",
    name: "Mercado El Potrerillo",
    category: "Gastronomía",
    interest: "Gastronomía",
    kind: "Lugar",
    neighborhood: "Suroriente",
    description: "Un mercado popular para explorar productos y sabores cotidianos de la región.",
    story: "Los mercados son una puerta directa a los ingredientes, productos y costumbres de la mesa nariñense.",
    image: "/imagenes/mercado-local.jpg",
    imageAlt: "Puestos de frutas y productos frescos",
    imageIsIllustrative: true,
    latitude: 1.2055,
    longitude: -77.2692,
    visitMinutes: 50,
    budget: "Bajo",
    schedule: "Horario por confirmar; consultar antes de desplazarse",
    verified: false,
    scope: "Urbano",
  },
  {
    id: "laguna-cocha",
    name: "Laguna de La Cocha",
    category: "Naturaleza",
    interest: "Naturaleza",
    kind: "Lugar",
    neighborhood: "Corregimiento El Encano",
    description: "Paisaje de alta montaña, agua y tradición campesina al oriente de Pasto.",
    story: "El entorno invita a una visita de mayor duración; contempla el traslado desde la ciudad al planear.",
    image: "/imagenes/laguna-cocha.jpg",
    imageAlt: "Laguna de La Cocha en Nariño",
    imageIsIllustrative: false,
    latitude: 1.0962,
    longitude: -77.1517,
    visitMinutes: 150,
    budget: "Medio",
    schedule: "Traslado y servicios sujetos a disponibilidad",
    verified: false,
    scope: "Municipio",
  },
  ...[
    "Catedral Sagrado Corazón de Jesús", "Templo de Cristo Rey - Jesuitas", "Iglesia de San Andrés",
    "Parroquia San Felipe Neri", "Parroquia de Santiago Apóstol", "Iglesia de San Juan Bautista",
    "Iglesia de San Agustín", "Iglesia de La Merced", "Iglesia de La Panadería", "Iglesia de Fátima",
    "Iglesia del Carmen", "Iglesia de Jesús del Río", "Iglesia de San Sebastián", "Iglesia de San Felipe",
    "Iglesia del Niño Jesús de Praga", "Iglesia de Maridíaz", "Iglesia del Obrero", "Iglesia de San Antonio",
    "Iglesia de Anganoy", "Iglesia de Lourdes", "Iglesia de San Juan Bosco", "Iglesia de Miraflores",
    "Iglesia de la Inmaculada Concepción", "Iglesia de la Sagrada Familia",
  ].map((name) => pendingEntry(name, "Templos", "Historia")),
  ...[
    "Plazoleta de la Catedral", "Plazoleta de San Juan", "Plaza del Carnaval", "Plazoleta de San Agustín",
    "Plazoleta Cristo Rey", "Plazoleta de La Panadería", "Plazoleta de La Merced", "Plazoleta de San Andrés",
    "Plazoleta de Bomboná", "Plazoleta de Lourdes", "Plazoleta del Museo Taminango",
    "Plazoleta Banco de la República", "Plazoleta Galán", "Plazoleta Éxito", "Plazoleta Avenida Boyacá",
    "Plazoleta San Andresito",
  ].map((name) => pendingEntry(name, "Plazas", "Historia")),
  ...[
    "Parque Infantil", "Parque de San Felipe", "Parque de La Aurora", "Parque Bolívar",
    "Parque Ecológico Aurelio Arturo", "Parque Ambiental Rumipamba", "Parque de Santiago", "Parque de Palermo", "Parque La Minga",
    "Parque Caracha", "Parque Las Piedras", "Parque Versalles", "Parque Las Brisas", "Parque Las Mercedes",
    "Parque Laureano Gómez", "Parque Paraná", "Parque El Bosque", "Parque Villa Sofía", "Parque La Esmeralda",
    "Parque Barrio Navarrete", "Parque Maridíaz", "Parque Las Cuadras", "Parque Recreativo Chapalito",
    "Parque Teatro al Aire Libre", "Parque lineal quebrada Cujacal", "Parque lineal quebrada Alta Vista",
    "Parque lineal canal de las Aguas", "Parque lineal quebrada Membrillo Guaico", "Parque Toledo",
  ].map((name) => pendingEntry(name, "Parques", "Naturaleza")),
  ...[
    "Centro Comercial Unicentro Pasto", "Centro Comercial Unico Outlet - Pasto", "Centro comercial San Andresito",
    "Centro comercial Pasto Centro", "Centro Comercial Sebastián de Belalcázar", "Centro Comercial Valle de Atriz",
    "Centro Comercial El Vergel", "Centro Comercial Amorel", "Centro Comercial La 17", "Centro Comercial Bomboná",
  ].map((name) => pendingEntry(name, "Centros comerciales", "Cultura")),
  ...[
    "Puente del Cueche, del Arcoiris o del Chorizo", "Puente de la Avenida Panamericana",
    "Puente sobre el río Pasto", "Puente de Chapal", "Puente de Cujacal", "Puente Bermúdez",
    "Puentes de El Encano", "Puentes rurales del municipio",
  ].map((name) => pendingEntry(name, "Puentes", "Historia")),
  ...[
    "Museo del Oro Nariño", "Museo Juan Lorenzo Lucero", "Casona Taminango",
    "Centro Cultural Leopoldo López Álvarez", "Teatro Imperial", "Teatro San Felipe Neri", "Teatro Javeriano",
  ].map((name) => pendingEntry(name, "Museos", "Cultura")),
  ...[
    "Senda del Carnaval", "Centro Cultural Pandiaco", "Casa de la Cultura", "Teatro al Aire Libre",
  ].map((name) => pendingEntry(name, "Cultura", "Cultura")),
  ...[
    "Volcán Galeras", "Parque Ambiental Chimayoy", "Senderos de Pasto", "Reserva Natural La Planada",
  ].map((name) => pendingEntry(name, "Naturaleza", "Naturaleza")),
  ...[
    "Cuy", "Frito pastuso", "Hornado", "Empanadas de añejo", "Lapingachos", "Helado de paila",
    "Champús", "Morocho", "Quimbolitos",
  ].map((name) => pendingEntry(name, "Gastronomía", "Gastronomía", "Plato típico")),
];

export function distanceKm(from: { latitude: number; longitude: number }, to: Place) {
  if (to.latitude === undefined || to.longitude === undefined) return Number.POSITIVE_INFINITY;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}