import { Church, Landmark, Mountain, ShoppingBag, Theater, Trees, Utensils, Waypoints, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { places, type Interest, type Place, type PlaceCategory } from "@/lib/places";

export type Section = { title: string; categories: PlaceCategory[]; icon: LucideIcon };

export const sections: Section[] = [
  { title: "Iglesias y templos", categories: ["Templos"], icon: Church },
  { title: "Plazas", categories: ["Plazas"], icon: Landmark },
  { title: "Parques", categories: ["Parques"], icon: Trees },
  { title: "Museos y cultura", categories: ["Museos", "Cultura"], icon: Theater },
  { title: "Naturaleza", categories: ["Naturaleza"], icon: Mountain },
  { title: "Sabores nariñenses", categories: ["Gastronomía"], icon: Utensils },
  { title: "Centros comerciales", categories: ["Centros comerciales"], icon: ShoppingBag },
  { title: "Puentes", categories: ["Puentes"], icon: Waypoints },
];

/** Color de barniz que identifica cada interés en toda la app. */
export const interestStyle: Record<Interest, { color: string; icon: LucideIcon; hint: string }> = {
  Cultura: { color: "var(--rosa)", icon: Theater, hint: "Arte, fiestas y saberes" },
  Historia: { color: "var(--rojo)", icon: BookOpen, hint: "Memoria de la ciudad" },
  Gastronomía: { color: "var(--oro)", icon: Utensils, hint: "Cuy, hervido, empanadas" },
  Naturaleza: { color: "var(--verde)", icon: Mountain, hint: "Laguna, volcán y páramo" },
};

const photoScore = (p: Place) => (p.image && !p.imageIsIllustrative ? 0 : p.image ? 1 : 2);

export function placesFor(categories: PlaceCategory[], limit = 8) {
  return places.filter((p) => categories.includes(p.category)).sort((a, b) => photoScore(a) - photoScore(b)).slice(0, limit);
}

/** Lugares con foto propia para el carrusel principal. */
export const highlights = places.filter((p) => p.image && !p.imageIsIllustrative).slice(0, 8);
