import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { Place } from "@/lib/places";
import { directionsUrl, embedUrl, placeUrl } from "@/lib/maps";

export interface GooglePlaceMapProps {
  place: Place;
}

/**
 * Mapa del lugar. Se busca por nombre en Google Maps para mostrar
 * la ficha real del sitio (dirección, fotos, horarios de Google).
 */
export function GooglePlaceMap({ place }: GooglePlaceMapProps) {
  return (
    <section className="detail-map" aria-labelledby="place-map-title">
      <div className="detail-map-heading">
        <h3 id="place-map-title"><MapPin size={16} /> Ubicación en Google Maps</h3>
        <a href={placeUrl(place)} target="_blank" rel="noreferrer" aria-label={`Abrir ${place.name} en Google Maps`}>
          Ver mapa <ExternalLink size={13} />
        </a>
      </div>
      <iframe
        title={`Mapa de ${place.name} en Pasto`}
        src={embedUrl(place)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {place.kind !== "Plato típico" && (
        <a className="btn btn-oro btn-sm maps-go" href={directionsUrl([place])} target="_blank" rel="noreferrer">
          <Navigation size={14} /> Cómo llegar desde donde estoy
        </a>
      )}
      {place.kind === "Plato típico" && <p>Google Maps te muestra restaurantes de Pasto donde lo sirven.</p>}
    </section>
  );
}
