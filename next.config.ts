import type { NextConfig } from "next";

// MOBILE_BUILD=1 genera una versión estática (carpeta /out) que Capacitor empaqueta en el APK.
// En ese modo las rutas /api no viajan dentro de la app: la app llama al backend publicado
// (NEXT_PUBLIC_API_URL), por ejemplo un despliegue en Vercel.
const isMobileBuild = process.env.MOBILE_BUILD === "1";

const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  ...(isMobileBuild
    ? { output: "export", images: { unoptimized: true }, trailingSlash: true }
    : {
        // El backend acepta peticiones desde la app instalada (origen https://localhost de Capacitor).
        async headers() {
          return [{ source: "/api/:path*", headers: corsHeaders }];
        },
      }),
};

export default nextConfig;
