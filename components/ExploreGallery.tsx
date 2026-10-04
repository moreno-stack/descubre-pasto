import { ArrowRight, Church, ImageOff, Landmark, Mountain, ShoppingBag, Theater, Trees, Utensils, Waypoints } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { places, type Place, type PlaceCategory } from "@/lib/places";

export interface GallerySection {
  title: string;
  categories: PlaceCategory[];
  icon: LucideIcon;
}

export interface ExploreGalleryProps {
  onSelect: (place: Place) => void;
  onExplore: (categories: PlaceCategory[]) => void;
  sections?: GallerySection[];
  items?: Place[];
}

export const gallerySections: GallerySection[] = [
  { title: "Iglesias y templos",        categories: ["Templos"],                  icon: Church      },
  { title: "Plazas y plazoletas",        categories: ["Plazas"],                   icon: Landmark    },
  { title: "Parques",                    categories: ["Parques"],                  icon: Trees       },
  { title: "Centros comerciales",        categories: ["Centros comerciales"],      icon: ShoppingBag },
  { title: "Puentes y entorno urbano",   categories: ["Puentes"],                  icon: Waypoints   },
  { title: "Museos y lugares culturales",categories: ["Museos", "Cultura"],        icon: Theater     },
  { title: "Naturaleza",                 categories: ["Naturaleza"],               icon: Mountain    },
  { title: "Gastronomía nariñense",      categories: ["Gastronomía"],              icon: Utensils    },
];

export function ExploreGallery({
  onSelect,
  onExplore,
  sections = gallerySections,
  items = places,
}: ExploreGalleryProps) {
  return (
    <div className="explore-galleries">
      {sections.map(({ title, categories, icon: Icon }) => {
        // Priorizar lugares con imagen propia, luego ilustrativas, luego sin imagen
        const placesInSection = items
          .filter((place) => categories.includes(place.category))
          .sort((a, b) => {
            const score = (p: Place) => (p.image && !p.imageIsIllustrative ? 0 : p.image ? 1 : 2);
            return score(a) - score(b);
          })
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
                  className={`gallery-tile${!place.image ? " gallery-tile--empty" : ""}`}
                  key={place.id}
                  onClick={() => onSelect(place)}
                  style={place.image ? { backgroundImage: `url('${place.image}')` } : undefined}
                  aria-label={`Ver ${place.name}`}
                >
                  {place.image ? (
                    <>
                      <span className="gallery-tile-shade" />
                      <span className="gallery-tile-copy">
                        <span>{place.category}</span>
                        <strong>{place.name}</strong>
                      </span>
                      {place.imageIsIllustrative && (
                        <span className="gallery-photo-note">Foto de referencia</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="gallery-tile-empty-icon"><ImageOff size={20} aria-hidden="true" /></span>
                      <span className="gallery-tile-copy gallery-tile-copy--dark">
                        <span>{place.category}</span>
                        <strong>{place.name}</strong>
                      </span>
                      <span className="gallery-photo-note">Foto pendiente</span>
                    </>
                  )}
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
