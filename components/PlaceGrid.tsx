import { Clock3, Heart, MapPin } from "lucide-react";
import type { Place } from "@/lib/places";

export function PlaceGrid({
  items,
  favorites,
  onFavorite,
  onSelect,
}: {
  items: Place[];
  favorites: string[];
  onFavorite: (id: string) => void;
  onSelect: (place: Place) => void;
}) {
  return (
    <div className="place-grid">
      {items.map((place) => (
        <article className="place-card" key={place.id}>
          <button
            className="place-image"
            style={{ backgroundImage: `url('${place.image}')` }}
            onClick={() => onSelect(place)}
            aria-label={`Ver ${place.name}`}
          >
            <span className="place-tag">
              {place.kind === "Plato típico" ? "Plato típico" : place.category}
            </span>
            {place.imageIsIllustrative && <span className="illustrative-tag">Foto de referencia</span>}
          </button>
          <button
            className={`favorite-button ${favorites.includes(place.id) ? "saved" : ""}`}
            onClick={() => onFavorite(place.id)}
            aria-label={favorites.includes(place.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <Heart size={16} fill={favorites.includes(place.id) ? "currentColor" : "none"} />
          </button>
          <div className="place-info">
            <div className="place-title-row">
              <button className="text-button" style={{ padding: 0, textAlign: "left" }} onClick={() => onSelect(place)}>
                <h3>{place.name}</h3>
              </button>
            </div>
            <p>{place.description}</p>
            <div className="place-meta">
              <span><MapPin size={12} />{place.latitude === undefined ? "Ubicación pendiente" : place.neighborhood}</span>
              {place.visitMinutes && <span><Clock3 size={12} />{place.visitMinutes} min</span>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}