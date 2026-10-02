# Descubre Pasto IA

Primera versión web móvil de Descubre Pasto IA. Está construida con Next.js y puede desplegarse en Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Para validar y compilar:

```bash
npm run typecheck
npm run build
```

## Recomendaciones

`POST /api/recommend` interpreta intereses, tiempo y presupuesto, consulta el catálogo de `lib/places.ts` y crea una ruta que cabe en el tiempo indicado. La selección se limita a lugares del catálogo y explica el motivo de cada parada. El motor funciona sin una clave externa; opcionalmente, `OPENAI_API_KEY`, `OPENAI_BASE_URL` y `OPENAI_MODEL` habilitan la extracción de criterios con una respuesta JSON estructurada. La clave solo se lee en el servidor.

## Catálogo inicial

El inventario inicial contiene 116 registros: templos, plazas, parques, centros comerciales, puentes, museos, cultura, naturaleza y platos típicos. Sus horarios, precios, descripciones, imágenes y datos de ubicación requieren revisión editorial. Los lugares sin coordenadas o duración no se ofrecen en rutas automáticas. El estado `verified` permite identificar los registros pendientes; no usar estos datos como información operativa confirmada.

## Alcance de esta entrega

Incluye inicio, exploración y filtros con conteos, detalle de lugares, favoritos locales, preferencias de intereses, creación de recorridos y autenticación Supabase por correo/contraseña y Google OAuth. El catálogo, favoritos y preferencias todavía no se sincronizan con una base de datos de usuario. La administración editorial, verificación del inventario, proveedor de mapas y publicación en tiendas móviles quedan para módulos posteriores. La geolocalización del navegador es opcional y se solicita únicamente al seleccionarla como punto de inicio.

## Configurar inicio de sesión

1. Crea un proyecto en Supabase y copia la URL del proyecto y su clave pública `anon` desde Project Settings > API.
2. En local, copia `.env.example` a `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Estas son claves públicas del cliente; nunca pongas una `service_role` en variables `NEXT_PUBLIC_*` ni en el navegador.
3. En Supabase > Authentication > Providers, habilita Email para crear cuentas y restablecer contraseñas. Si deseas Google, habilita el proveedor Google y configura su Client ID y Client Secret desde Google Cloud Console.
4. En Supabase > Authentication > URL Configuration, agrega `http://localhost:3000` como Site URL y Redirect URL. Cuando despliegues, agrega también el dominio de Vercel (por ejemplo `https://tu-proyecto.vercel.app/**`). El callback de Google en Google Cloud debe ser el que muestra Supabase para el proveedor, normalmente `https://<project-ref>.supabase.co/auth/v1/callback`.
5. En Vercel > Project > Settings > Environment Variables, define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para Preview y Production, y vuelve a desplegar.

El flujo implementado incluye inicio de sesión, registro con nombre y confirmación por correo, recuperación y actualización de contraseña, Google OAuth, estado de sesión y cierre de sesión. El alta y OAuth no se completan hasta configurar credenciales y proveedores en Supabase.

## Despliegue en Vercel

Importa el repositorio en Vercel y conserva los comandos estándar de Next.js (`npm install` y `npm run build`). Si se habilita el proveedor LLM, configura sus variables de entorno en el proyecto Vercel, nunca en variables `NEXT_PUBLIC_*`.