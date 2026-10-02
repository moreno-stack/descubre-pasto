"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, Bookmark, BookOpen, Check, Clock3, Compass, Heart, Landmark,
  MapPin, Mountain, Navigation, Search, Send, Sparkles,
  Utensils, X,
} from "lucide-react";
import { interests, placeCategories, places, type Interest, type Place, type PlaceCategory } from "@/lib/places";
import { ExploreGallery, gallerySections, homeGallerySections } from "@/components/ExploreGallery";
import { PlaceGrid } from "@/components/PlaceGrid";

type View = "Inicio" | "Explorar" | "Recorrido" | "Favoritos" | "Perfil";
type RouteStop = { id: string; name: string; category: Interest; minutes: number; distanceKm: number; reason: string; schedule: string; verified: boolean; order: number };
type Recommendation = { intent: { hours: number; budget: string; interests: Interest[] }; route: RouteStop[]; estimatedMinutes: number; note: string };

const categoryIcons = { Cultura: Landmark, Historia: BookOpen, Gastronomía: Utensils, Naturaleza: Mountain };
const categoryDescriptions: Record<Interest, string> = {
  Cultura: "Arte, fiestas y saberes",
  Historia: "Memoria de la ciudad",
  Gastronomía: "Sabores de Nariño",
  Naturaleza: "Paisajes cercanos",
};
const promptIdeas = ["Cultura e historia, 3 horas", "Comida típica y poco presupuesto", "Naturaleza para una tarde"];

export default function Home() {
  const [view, setView] = useState<View>("Inicio");
  const [category, setCategory] = useState<PlaceCategory | Interest | "Todas">("Todas");
  const [categoryMode, setCategoryMode] = useState<"all" | "category" | "interest">("all");
  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[] | null>(null);
  const [showGallery, setShowGallery] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [prompt, setPrompt] = useState("");
  const [hours, setHours] = useState("3");
  const [budget, setBudget] = useState("Medio");
  const [start, setStart] = useState("Centro histórico");
  const [startCoordinates, setStartCoordinates] = useState<{ latitude: number; longitude: number } | undefined>();
  const [locationNotice, setLocationNotice] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>(["Cultura", "Historia"]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredPlaces = useMemo(() => places.filter((place) => {
    const matchesCategory = categoryMode === "all"
      || (categoryMode === "category" ? selectedCategories?.includes(place.category) ?? place.category === category : place.interest === category);
    const matchesSearch = `${place.name} ${place.neighborhood} ${place.description}`.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es"));
    const matchesView = view !== "Favoritos" || favorites.includes(place.id);
    return matchesCategory && matchesSearch && matchesView;
  }), [category, categoryMode, favorites, search, selectedCategories, view]);
  const visiblePlaces = filteredPlaces.slice(0, visibleCount);

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function generateRecommendation(value = prompt) {
    setLoading(true);
    setError("");
    setRecommendation(null);
    setView("Recorrido");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value, hours: Number(hours), budget, interests: selectedInterests, favorites, start, startCoordinates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo generar el recorrido.");
      setRecommendation(data as Recommendation);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function goToExplore(nextCategory: PlaceCategory | Interest | "Todas" = "Todas", mode: "all" | "category" | "interest" = nextCategory === "Todas" ? "all" : "interest") {
    setCategory(nextCategory);
    setCategoryMode(mode);
    setSelectedCategories(null);
    setShowGallery(mode === "all");
    setVisibleCount(18);
    setSearch("");
    setView("Explorar");
  }

  function exploreCategories(categories: PlaceCategory[]) {
    setCategory(categories[0] ?? "Todas");
    setCategoryMode(categories.length ? "category" : "all");
    setSelectedCategories(categories.length ? categories : null);
    setShowGallery(false);
    setVisibleCount(18);
    setSearch("");
    setView("Explorar");
  }

  function handlePromptSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void generateRecommendation(prompt);
  }

  const navItems: { label: View; icon: typeof Compass }[] = [
    { label: "Inicio", icon: Compass }, { label: "Explorar", icon: Search },
    { label: "Recorrido", icon: Navigation }, { label: "Favoritos", icon: Heart }, { label: "Perfil", icon: Bookmark },
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("Inicio")} aria-label="Ir al inicio">
          <span className="brand-mark"><Mountain size={21} /></span>
          <span className="brand-name">DESCUBRE <span>PASTO</span></span>
        </button>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navItems.slice(0, 3).map(({ label }) => <button key={label} className={`nav-link ${view === label ? "active" : ""}`} onClick={() => label === "Explorar" ? goToExplore() : setView(label)}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Abrir favoritos" onClick={() => setView("Favoritos")}><Heart size={17} /></button>
          <button className="avatar" aria-label="Abrir perfil" onClick={() => setView("Perfil")}>VP</button>
        </div>
      </header>

      <div className="page">
        {view === "Inicio" && <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow"><Sparkles size={14} /> TU PRÓXIMO PLAN EMPIEZA AQUÍ</p>
              <h1>Pasto se descubre paso a paso.</h1>
              <p>Cultura, memoria y sabores nariñenses. Encuentra un plan que se acomode a tu tiempo y a lo que te mueve.</p>
              <button className="primary-button" onClick={() => setView("Recorrido")}>Crear mi recorrido <ArrowRight size={16} /></button>
            </div>
          </section>

          <section className="section">
            <div className="section-heading"><div><h2>¿Qué te gustaría vivir?</h2><p>Elige un interés y empieza a explorar.</p></div></div>
            <div className="category-row">
              {interests.map((item) => {
                const Icon = categoryIcons[item];
                return <button key={item} className="category-tile" onClick={() => goToExplore(item)}><span className="category-icon"><Icon size={19} /></span><span><strong>{item}</strong><small>{categoryDescriptions[item]}</small></span></button>;
              })}
            </div>
          </section>

          <section className="section">
            <div className="section-heading"><div><h2>Encuentra tu próximo lugar</h2><p>Fotografías de Pasto organizadas por tipo de experiencia.</p></div><button className="text-button" onClick={() => goToExplore()}>Ver catálogo <ArrowRight size={15} /></button></div>
            <ExploreGallery sections={homeGallerySections} onSelect={setSelectedPlace} onExplore={exploreCategories} />
          </section>

          <section className="ai-panel" id="recomendador">
            <div className="ai-copy"><p className="eyebrow"><Sparkles size={14} /> PLAN A TU MEDIDA</p><h2>Cuéntanos qué tienes en mente.</h2><p>La recomendación combina tus intereses y tiempo con los lugares disponibles en el catálogo. Cada parada explica por qué aparece.</p></div>
            <form className="ai-form" onSubmit={handlePromptSubmit}>
              <div className="ai-input-row"><input className="ai-input" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ej. Cultura e historia, tengo 3 horas" aria-label="Describe el recorrido que buscas" /><button className="primary-button" type="submit" disabled={loading} aria-label="Generar recorrido"><Send size={16} /> Proponer ruta</button></div>
              <div className="quick-prompts">{promptIdeas.map((idea) => <button key={idea} type="button" className="quick-prompt" onClick={() => { setPrompt(idea); void generateRecommendation(idea); }}>{idea}</button>)}</div>
            </form>
          </section>
        </>}

        {view === "Explorar" && <>
          <div className="subpage-title"><div><p className="eyebrow">LUGARES Y EXPERIENCIAS</p><h1>Explora Pasto</h1><p>{filteredPlaces.length} registros · encuentra por nombre, zona o categoría.</p></div><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(18); }} placeholder="Buscar lugares" /></label></div>
          <div className="filter-row"><button className={`filter-chip ${categoryMode === "all" ? "active" : ""}`} onClick={() => { setCategory("Todas"); setCategoryMode("all"); setSelectedCategories(null); setShowGallery(true); setVisibleCount(18); }}>Todos ({places.length})</button>{placeCategories.map((item) => <button key={item} className={`filter-chip ${categoryMode === "category" && selectedCategories?.includes(item) ? "active" : ""}`} onClick={() => { setCategory(item); setCategoryMode("category"); setSelectedCategories([item]); setShowGallery(false); setVisibleCount(18); }}>{item} ({places.filter((place) => place.category === item).length})</button>)}</div>
          {showGallery && !search ? <ExploreGallery sections={gallerySections} onSelect={setSelectedPlace} onExplore={exploreCategories} /> : <>
            <PlaceGrid items={visiblePlaces} favorites={favorites} onFavorite={toggleFavorite} onSelect={setSelectedPlace} />
            {filteredPlaces.length > visiblePlaces.length && <button className="text-button" style={{ margin: "22px auto", display: "flex" }} onClick={() => setVisibleCount((count) => count + 18)}>Mostrar más ({filteredPlaces.length - visiblePlaces.length} restantes) <ArrowRight size={15} /></button>}
          </>}
          {!filteredPlaces.length && <div className="favorite-empty"><p>No encontramos lugares con esos filtros. Prueba otra categoría o búsqueda.</p></div>}
        </>}

        {view === "Recorrido" && <>
          <div className="subpage-title"><div><p className="eyebrow">RECOMENDACIÓN PERSONALIZADA</p><h1>Arma tu recorrido</h1><p>Cuéntanos cuánto tiempo tienes y qué te interesa.</p></div></div>
          <div className="route-layout">
            <form className="route-form" onSubmit={(event) => { event.preventDefault(); void generateRecommendation(prompt); }}>
              <h2>Tu plan, a tu ritmo</h2><p>La ruta se construye con los lugares del catálogo y se ajusta al tiempo que indiques.</p>
              <div className="form-grid">
                <div className="field"><label htmlFor="hours">Tiempo disponible</label><select id="hours" value={hours} onChange={(event) => setHours(event.target.value)}>{[1, 2, 3, 4, 5, 6, 8].map((hour) => <option key={hour} value={hour}>{hour} {hour === 1 ? "hora" : "horas"}</option>)}</select></div>
                <div className="field"><label htmlFor="budget">Presupuesto aproximado</label><select id="budget" value={budget} onChange={(event) => setBudget(event.target.value)}><option>Bajo</option><option>Medio</option><option>Alto</option></select></div>
                <div className="field full"><label htmlFor="start">Punto de inicio</label><select id="start" value={start} onChange={(event) => {
                  const nextStart = event.target.value;
                  setStart(nextStart);
                  setLocationNotice("");
                  if (nextStart !== "Mi ubicación") {
                    setStartCoordinates(undefined);
                    return;
                  }
                  if (!navigator.geolocation) {
                    setLocationNotice("Este navegador no permite compartir ubicación. Puedes usar el centro histórico como inicio.");
                    setStart("Centro histórico");
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (position) => setStartCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                    () => {
                      setLocationNotice("No se obtuvo tu ubicación. Puedes permitir el acceso o elegir el centro histórico.");
                      setStart("Centro histórico");
                    },
                    { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
                  );
                }}><option>Centro histórico</option><option>Mi ubicación</option></select>{locationNotice && <small className="error-message">{locationNotice}</small>}</div>
                <div className="field full"><label>Intereses</label><div className="interest-options">{interests.map((item) => <label className="interest-option" key={item}><input type="checkbox" checked={selectedInterests.includes(item)} onChange={() => setSelectedInterests((current) => current.includes(item) ? current.filter((interest) => interest !== item) : [...current, item])} />{item}</label>)}</div></div>
                <div className="field full"><label htmlFor="route-prompt">¿Algo más que debamos tener en cuenta?</label><input id="route-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ej. Quiero probar comida típica" /></div>
              </div>
              <button className="primary-button route-submit" type="submit" disabled={loading}><Sparkles size={16} />{loading ? "Preparando propuesta..." : "Generar recorrido"}</button>
              {error && <p className="error-message" role="alert">{error}</p>}
            </form>
            <section className="route-result" aria-live="polite">
              <h2>{recommendation?.route.length ? "Tu propuesta" : "Tu recorrido aparecerá aquí"}</h2>
              {!recommendation && <div className="empty-state"><Compass size={27} /><p>Al generar una propuesta, verás las paradas sugeridas y por qué fueron elegidas.</p></div>}
              {loading && <div className="empty-state"><Sparkles size={27} /><p>Estamos organizando lugares que coincidan con tus criterios.</p></div>}
              {recommendation && !loading && <>
                <p>{recommendation.intent.hours} horas · {recommendation.intent.interests.join(" · ")} · Presupuesto {recommendation.intent.budget.toLowerCase()}</p>
                {recommendation.route.length > 0 && <div className="route-summary"><span className="summary-pill"><Clock3 size={13} /> {recommendation.estimatedMinutes} min aprox.</span><span className="summary-pill"><MapPin size={13} /> {recommendation.route.length} paradas</span></div>}
                {recommendation.route.map((stop) => <div className="route-stop" key={stop.id}><span className="stop-number">{stop.order}</span><div><strong>{stop.name}</strong><small>{stop.category} · {stop.minutes} min de visita · {stop.distanceKm} km desde el centro<br />{stop.reason}</small></div></div>)}
                <p className="notice">{recommendation.note}</p>
              </>}
            </section>
          </div>
        </>}

        {view === "Favoritos" && <>
          <div className="subpage-title"><div><p className="eyebrow">TU LISTA PERSONAL</p><h1>Lugares guardados</h1><p>Ideas para tu próxima salida por Pasto.</p></div></div>
          {filteredPlaces.length ? <><PlaceGrid items={visiblePlaces} favorites={favorites} onFavorite={toggleFavorite} onSelect={setSelectedPlace} />{filteredPlaces.length > visiblePlaces.length && <button className="text-button" style={{ margin: "22px auto", display: "flex" }} onClick={() => setVisibleCount((count) => count + 18)}>Mostrar más <ArrowRight size={15} /></button>}</> : <div className="favorite-empty"><div><Heart size={27} /><p>Aún no guardas lugares. Toca el corazón de una ficha para tenerla a mano.</p><button className="text-button" onClick={() => goToExplore()}>Explorar lugares <ArrowRight size={15} /></button></div></div>}
        </>}

        {view === "Perfil" && <>
          <div className="subpage-title"><div><p className="eyebrow">TU EXPERIENCIA</p><h1>Mi perfil</h1><p>Personaliza las sugerencias para que se parezcan más a ti.</p></div></div>
          <section className="profile-panel"><h2>Viajera curiosa</h2><p style={{ color: "var(--muted)", fontSize: 12 }}>Edita tus intereses cuando quieras.</p><div className="profile-grid"><div className="profile-stat"><strong>{favorites.length}</strong><span>Lugares guardados</span></div><div className="profile-stat"><strong>{selectedInterests.length}</strong><span>Intereses activos</span></div></div><div className="field" style={{ marginTop: 20 }}><label>Mis intereses</label><div className="interest-options">{interests.map((item) => <label className="interest-option" key={item}><input type="checkbox" checked={selectedInterests.includes(item)} onChange={() => setSelectedInterests((current) => current.includes(item) ? current.filter((interest) => interest !== item) : [...current, item])} />{item}</label>)}</div></div><p className="notice">El perfil de esta versión es local a este dispositivo. El registro y la sincronización de cuenta se incorporarán en la siguiente fase.</p></section>
        </>}
      </div>

      <nav className="mobile-nav" aria-label="Navegación móvil">{navItems.map(({ label, icon: Icon }) => <button key={label} className={view === label ? "active" : ""} onClick={() => label === "Explorar" ? goToExplore() : setView(label)} aria-label={label}><Icon size={19} /><span>{label}</span></button>)}</nav>

      {selectedPlace && <div className="detail-backdrop" role="presentation" onClick={() => setSelectedPlace(null)}><section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}><div className="detail-photo" style={{ backgroundImage: `url('${selectedPlace.image}')` }} /><button className="icon-button detail-close" onClick={() => setSelectedPlace(null)} aria-label="Cerrar detalle"><X size={18} /></button><div className="detail-content"><p className="eyebrow">{selectedPlace.category} · {selectedPlace.neighborhood}</p><h2 id="detail-title">{selectedPlace.name}</h2><p>{selectedPlace.description}</p><p>{selectedPlace.story}</p><div className="place-meta">{selectedPlace.visitMinutes && <span><Clock3 size={13} /> Visita sugerida: {selectedPlace.visitMinutes} min</span>}<span><MapPin size={13} /> {selectedPlace.latitude === undefined ? "Ubicación por verificar" : selectedPlace.neighborhood}</span></div><p className="notice">{selectedPlace.verified ? selectedPlace.schedule : "Registro pendiente de verificación: confirmar dirección, coordenadas, horarios, fuente y condiciones de acceso antes de visitarlo."}</p><button className="primary-button" style={{ marginTop: 12 }} onClick={() => toggleFavorite(selectedPlace.id)}>{favorites.includes(selectedPlace.id) ? <Check size={15} /> : <Heart size={15} />}{favorites.includes(selectedPlace.id) ? "Guardado" : "Guardar lugar"}</button></div></section></div>}
    </main>
  );
}
