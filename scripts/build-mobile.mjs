// Genera la versión estática para la app móvil (carpeta /out) que usa Capacitor.
// Las rutas /api se apartan temporalmente porque no pueden ir dentro del APK:
// la app las consume desde el backend publicado en NEXT_PUBLIC_API_URL.
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const parkedDir = path.join(root, "_api_parked");

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "\n⚠  NEXT_PUBLIC_API_URL no está definida. La app se generará, pero el chat y los recorridos con IA\n" +
      "   no tendrán backend. Defínela en .env.local, por ejemplo: NEXT_PUBLIC_API_URL=https://descubre-pasto.vercel.app\n",
  );
}

let parked = false;
try {
  if (existsSync(apiDir)) {
    renameSync(apiDir, parkedDir);
    parked = true;
  }
  rmSync(path.join(root, ".next"), { recursive: true, force: true });
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, MOBILE_BUILD: "1" } });

  // El video de la portada pesa ~54 MB: no se incluye en el APK (la app usa la foto animada).
  rmSync(path.join(root, "out", "videos"), { recursive: true, force: true });
  console.log("\n✓ Versión móvil lista en /out. Siguiente paso: npx cap sync android\n");
} finally {
  if (parked) renameSync(parkedDir, apiDir);
}
