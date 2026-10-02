export type Interest = "Cultura" | "Historia" | "Gastronomía" | "Naturaleza";

export type Place = {
  id: string;
  name: string;
  category: Interest;
  neighborhood: string;
  description: string;
  story: string;
  image: string;
  imageAlt: string;
  latitude: number;
  longitude: number;
  visitMinutes: number;
  budget: "Bajo" | "Medio" | "Alto";
  schedule: string;
  verified: boolean;
};

export const interests: Interest[] = ["Cultura", "Historia", "Gastronomía", "Naturaleza"];

export const places: Place[] = [
  {
    id: "plaza-narino",
    name: "Plaza de Nariño",
    category: "Historia",
    neighborhood: "Centro histórico",
    description: "Un buen punto de partida para reconocer el corazón cívico de Pasto.",
    story: "La plaza reúne edificios representativos y conecta con recorridos a pie por el centro.",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Cielo de montaña al atardecer",
    latitude: 1.2136,
    longitude: -77.2811,
    visitMinutes: 35,
    budget: "Bajo",
    schedule: "Espacio público; condiciones por confirmar",
    verified: false,
  },
  {
    id: "museo-taminango",
    name: "Museo Taminango",
    category: "Cultura",
    neighborhood: "Centro histórico",
    description: "Una casa museo para acercarse a oficios, objetos y memoria regional.",
    story: "La visita permite conocer expresiones del trabajo artesanal y la vida tradicional nariñense.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Patio interior de arquitectura tradicional",
    latitude: 1.2171,
    longitude: -77.2792,
    visitMinutes: 55,
    budget: "Bajo",
    schedule: "Horario por confirmar antes de la visita",
    verified: false,
  },
  {
    id: "museo-carnaval",
    name: "Museo del Carnaval",
    category: "Cultura",
    neighborhood: "Pandiaco",
    description: "Un espacio dedicado a las expresiones artísticas del Carnaval de Negros y Blancos.",
    story: "Máscaras, carrozas y saberes artesanales forman parte de una celebración reconocida por la UNESCO.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Celebración cultural con color y movimiento",
    latitude: 1.2292,
    longitude: -77.2784,
    visitMinutes: 60,
    budget: "Bajo",
    schedule: "Horario por confirmar antes de la visita",
    verified: false,
  },
  {
    id: "mercado-potrerillo",
    name: "Mercado El Potrerillo",
    category: "Gastronomía",
    neighborhood: "Suroriente",
    description: "Un mercado popular para explorar productos y sabores cotidianos de la región.",
    story: "Los mercados son una puerta directa a los ingredientes, productos y costumbres de la mesa nariñense.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Puestos de frutas y productos frescos",
    latitude: 1.2055,
    longitude: -77.2692,
    visitMinutes: 50,
    budget: "Bajo",
    schedule: "Horario por confirmar; consultar antes de desplazarse",
    verified: false,
  },
  {
    id: "laguna-cocha",
    name: "Laguna de La Cocha",
    category: "Naturaleza",
    neighborhood: "Corregimiento El Encano",
    description: "Paisaje de alta montaña, agua y tradición campesina al oriente de Pasto.",
    story: "El entorno invita a una visita de mayor duración; contempla el traslado desde la ciudad al planear.",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Laguna rodeada de montañas verdes",
    latitude: 1.0962,
    longitude: -77.1517,
    visitMinutes: 150,
    budget: "Medio",
    schedule: "Traslado y servicios sujetos a disponibilidad",
    verified: false,
  },
];

export function distanceKm(from: { latitude: number; longitude: number }, to: Place) {
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