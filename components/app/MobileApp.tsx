"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "motion/react";
import type { Interest, Place } from "@/lib/places";
import { checkGroq } from "@/lib/api";
import { readDemoSession, signOutDemoAccount, type DemoSession } from "@/lib/demoAuth";
import { AuthDialog, type AuthMode } from "@/components/AuthDialog";
import { WelcomeGate } from "@/components/WelcomeGate";
import { ChatBot } from "@/components/ChatBot";
import { RouteAssistant, type RouteContext } from "@/components/RouteAssistant";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ExploreScreen, type ExploreFilter } from "@/components/screens/ExploreScreen";
import { SavedScreen } from "@/components/screens/SavedScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { BurstProvider } from "./Burst";
import { Splash } from "./Splash";
import { TABS, TabBar, type Tab } from "./TabBar";
import { PlaceSheet } from "./PlaceSheet";

type ActiveUser = { email: string; displayName: string };

const FAV_KEY = "descubre-pasto-favoritos-v1";
const INT_KEY = "descubre-pasto-intereses-v1";
const SPLASH_KEY = "descubre-pasto-splash";

function readJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento no disponible */ }
}

export function MobileApp() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState<Tab>("Inicio");
  const [prevTab, setPrevTab] = useState<Tab>("Inicio");
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [guest, setGuest] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [interests, setInterests] = useState<Interest[]>(["Cultura", "Historia"]);
  const [selectedPlace, setSelected] = useState<Place | null>(null);
  const [sheetKey, setSheetKey] = useState<string | undefined>();
  const setSelectedPlace = useCallback((p: Place | null, key?: string) => { setSheetKey(key); setSelected(p); }, []);
  const [exploreFilter, setExploreFilter] = useState<ExploreFilter>({});
  const [routeContext, setRouteContext] = useState<RouteContext>({});
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Estado guardado en el dispositivo
  useEffect(() => {
    setFavorites(readJSON(FAV_KEY, []));
    setInterests(readJSON(INT_KEY, ["Cultura", "Historia"]));
    try { if (sessionStorage.getItem(SPLASH_KEY)) setShowSplash(false); } catch { /* sin sessionStorage */ }
    const session = readDemoSession();
    if (session) setUser({ email: session.email, displayName: session.displayName });
    const onAuth = (e: Event) => {
      const s = (e as CustomEvent<DemoSession | null>).detail;
      setUser(s ? { email: s.email, displayName: s.displayName } : null);
    };
    window.addEventListener("descubre-pasto-demo-auth", onAuth);
    setReady(true);
    checkGroq().then(setApiConnected);
    return () => window.removeEventListener("descubre-pasto-demo-auth", onAuth);
  }, []);

  useEffect(() => { if (ready) writeJSON(FAV_KEY, favorites); }, [favorites, ready]);
  useEffect(() => { if (ready) writeJSON(INT_KEY, interests); }, [interests, ready]);

  // En Android, el botón "atrás" cierra la ficha o el perfil antes de salir de la app.
  useEffect(() => {
    if (!selectedPlace && !profileOpen) return;
    history.pushState({ overlay: true }, "");
    const onPop = () => { setSelected(null); setProfileOpen(false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [selectedPlace, profileOpen]);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch { /* sin sessionStorage */ }
  }, []);

  const go = (next: Tab) => { setPrevTab(tab); setTab(next); };
  const toggleFavorite = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const clearRouteContext = useCallback(() => setRouteContext({}), []);

  const displayName = user?.displayName ?? "Visitante";
  const initials = displayName.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toLocaleUpperCase("es") || "V";

  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const prevIndex = TABS.findIndex((t) => t.id === prevTab);
  const direction = tabIndex >= prevIndex ? 1 : -1;

  const screens: Record<Tab, React.ReactNode> = {
    Inicio: (
      <HomeScreen
        displayName={displayName}
        initials={initials}
        favorites={favorites}
        apiConnected={apiConnected}
        onOpenPlace={setSelectedPlace}
        onFavorite={toggleFavorite}
        onExplore={(f) => { setExploreFilter(f); go("Explorar"); }}
        onPlan={({ interest, hours }) => {
          setRouteContext({ prefilledInterests: interest ? [interest] : interests, hours, source: "inicio" });
          go("Ruta");
        }}
        onProfile={() => setProfileOpen(true)}
      />
    ),
    Explorar: <ExploreScreen filter={exploreFilter} onFilter={setExploreFilter} favorites={favorites} onOpenPlace={setSelectedPlace} onFavorite={toggleFavorite} />,
    Ruta: (
      <RouteAssistant
        favorites={favorites}
        onFavoriteToggle={toggleFavorite}
        onPlaceSelect={setSelectedPlace}
        routeContext={routeContext}
        onContextCleared={clearRouteContext}
      />
    ),
    Chat: (
      <ChatBot
        favorites={favorites}
        selectedInterests={interests}
        activeView={tab}
        onPlaceSelect={setSelectedPlace}
        onFavoriteToggle={toggleFavorite}
        onCreateRoute={({ interests: i }) => { setRouteContext({ prefilledInterests: i?.length ? i : interests, source: "chat" }); go("Ruta"); }}
      />
    ),
    Guardados: (
      <SavedScreen
        favorites={favorites}
        onOpenPlace={setSelectedPlace}
        onRemove={toggleFavorite}
        onPlanWithSaved={() => { setRouteContext({ prefilledFavorites: favorites, source: "favoritos" }); go("Ruta"); }}
        onExplore={() => { setExploreFilter({}); go("Explorar"); }}
      />
    ),
  };

  const gate = ready && !user && !guest;

  return (
    <MotionConfig reducedMotion="user">
      <BurstProvider>
        <LayoutGroup>
          <div className="device">
            {ready && gate && (
              <WelcomeGate onSignIn={() => setAuthMode("login")} onRegister={() => setAuthMode("register")} onGuest={() => setGuest(true)} />
            )}

            {ready && !gate && (
              <>
                <main className="stage">
                  {TABS.map(({ id }) => {
                    const active = id === tab;
                    return (
                      <motion.section
                        key={id}
                        className="screen"
                        aria-hidden={!active}
                        initial={false}
                        animate={active
                          ? { opacity: 1, x: 0, scale: 1, visibility: "visible" as const, transitionEnd: {} }
                          : { opacity: 0, x: direction * -40, scale: 0.98, transitionEnd: { visibility: "hidden" as const } }}
                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                        style={{ zIndex: active ? 2 : 1, pointerEvents: active ? "auto" : "none" }}
                      >
                        {screens[id]}
                      </motion.section>
                    );
                  })}
                </main>
                <TabBar active={tab} onChange={go} savedCount={favorites.length} />
              </>
            )}

            <AnimatePresence>
              {profileOpen && (
                <ProfileScreen
                  key="perfil"
                  user={user}
                  initials={initials}
                  favoritesCount={favorites.length}
                  selectedInterests={interests}
                  onToggleInterest={(i) => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}
                  onBack={() => setProfileOpen(false)}
                  onSignOut={() => { signOutDemoAccount(); setProfileOpen(false); setGuest(false); go("Inicio"); }}
                  onRegister={() => setAuthMode("register")}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedPlace && (
                <PlaceSheet
                  key={selectedPlace.id}
                  place={selectedPlace}
                  saved={favorites.includes(selectedPlace.id)}
                  layoutKey={sheetKey}
                  onClose={() => setSelectedPlace(null)}
                  onFavorite={() => toggleFavorite(selectedPlace.id)}
                  onRoute={() => {
                    const ids = favorites.includes(selectedPlace.id) ? favorites : [...favorites, selectedPlace.id];
                    setFavorites(ids);
                    setRouteContext({ prefilledFavorites: ids, source: "explorar" });
                    setSelectedPlace(null);
                    go("Ruta");
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {authMode && <AuthDialog key="auth" initialMode={authMode} onClose={() => setAuthMode(null)} />}
            </AnimatePresence>

            <AnimatePresence>{showSplash && <Splash key="splash" onDone={finishSplash} />}</AnimatePresence>
          </div>
        </LayoutGroup>
      </BurstProvider>
    </MotionConfig>
  );
}
