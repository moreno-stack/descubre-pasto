// En la web las rutas /api viven en el mismo servidor.
// En la app móvil (APK) apuntan al backend publicado: NEXT_PUBLIC_API_URL.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

let healthPromise: Promise<boolean> | null = null;

/** Consulta una sola vez si Groq responde; las pantallas comparten el resultado. */
export function checkGroq(): Promise<boolean> {
  if (!healthPromise) {
    healthPromise = fetch(apiUrl("/api/health/groq"))
      .then((r) => r.json())
      .then((d) => Boolean(d?.connected))
      .catch(() => false);
  }
  return healthPromise;
}
