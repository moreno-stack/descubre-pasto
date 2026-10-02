import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Descubre Pasto IA | Explora a tu manera",
  description:
    "Encuentra cultura, historia y sabores de Pasto. Crea recorridos a tu medida con recomendaciones explicables.",
  applicationName: "Descubre Pasto IA",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f5f4ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}