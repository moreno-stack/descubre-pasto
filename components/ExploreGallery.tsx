import { ArrowRight, Church, Landmark, Mountain, ShoppingBag, Theater, Trees, Utensils, Waypoints } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { places, type Place, type PlaceCategory } from "@/lib/places";

type GallerySection = {
  title: string;
  categories: PlaceCategory[];
  icon: LucideIcon;
};

export const gallerySections: GallerySection[] = [
  { title: "Iglesias y templos", categories: ["Templos"], icon: Church },
  { title: "Plazas y plazoletas", categories: ["Plazas"], icon: Landmark },
  { title: "Parques", categories: ["Parques"], icon: Trees },
  { title: "Centros comerciales", categories: ["Centros comerciales"], icon: ShoppingBag },
  { title: "Puentes y entorno urbano", categories: ["Puentes"], icon: Waypoints },
  { title: "Museos y lugares culturales", categories: ["Museos", "Cultura"], icon: Theater },
  { title: "Naturaleza", categories: ["Naturaleza"], icon: Mountain },
  { title: "Gastronomía nariñense", categories: ["Gastronomía"], icon: Utensils },
];

export function ExploreGallery({
  onSelect,
  onExplore,
  sections = gallerySections,
  items = places,
}: {
  onSelect: (place: Place) => void;
  onExplore: (categories: PlaceCategory[]) => void;
  sections?: GallerySection[];
  items?: Place[];
}) {
  return (
    <div className="explore-galleries">
      {sections.map(({ title, categories, icon: Icon }) => {
        const placesInSection = items
          .filter((place) => categories.includes(place.category))
          .sort((first, second) => Number(first.imageIsIllustrative) - Number(second.imageIsIllustrative))
          .slice(0, 3);
        if (!placesInSection.length) return null;

        return (
          <section className="gallery-section" key={title}>
            <div className="gallery-heading">
              <h2><Icon size={19} aria-hidden="true" />{title}</h2>
              <button className="text-button" onClick={() => onExplore(categories)}>
                Explorar <ArrowRight size={14} />
              </button>
            </div>
            <div className="gallery-grid">
              {placesInSection.map((place) => (
                <button
                  className="gallery-tile"
                  key={place.id}
                  onClick={() => onSelect(place)}
                  style={{ backgroundImage: `url('${place.image}')` }}
                  aria-label={`Ver ${place.name}`}
                >
                  <span className="gallery-tile-shade" />
                  <span className="gallery-tile-copy">
                    <span>{place.category}</span>
                    <strong>{place.name}</strong>
                  </span>
                  {place.imageIsIllustrative && <span className="gallery-photo-note">Foto de referencia</span>}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export const homeGallerySections = gallerySections.filter(({ title }) =>
  ["Iglesias y templos", "Plazas y plazoletas", "Parques", "Museos y lugares culturales", "Naturaleza"].includes(title),
);