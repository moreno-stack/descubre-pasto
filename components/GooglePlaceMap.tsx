import { ExternalLink, MapPin } from "lucide-react";
import type { Place } from "@/lib/places";

function getPlaceQuery(place: Place) {
  if (place.latitude !== undefined && place.longitude !== undefined) {
    return `${place.latitude},${place.longitude}`;
  }
  const location = place.neighborhood === "Sector por confirmar" ? "" : `, ${place.neighborhood}`;
  return `${place.name}${location}, Pasto, Nariño, Colombia`;
}

export function GooglePlaceMap({ place }: { place: Place }) {
  const query = getPlaceQuery(place);
  const encodedQuery = encodeURIComponent(query);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;

  return (
    <section className="detail-map" aria-labelledby="place-map-title">
      <div className="detail-map-heading">
        <h3 id="place-map-title"><MapPin size={16} /> Ubicación en Google Maps</h3>
        <a href={mapUrl} target="_blank" rel="noreferrer" aria-label={`Abrir ${place.name} en Google Maps`}>
          Ver mapa <ExternalLink size={13} />
        </a>
      </div>
      <iframe
        title={`Mapa de ${place.name} en Pasto`}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {place.latitude === undefined && <p>Google Maps buscará este nombre; la ubicación exacta todavía debe verificarse.</p>}
    </section>
  );
}