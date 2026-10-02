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

Incluye inicio, exploración y filtros con conteos, detalle de lugares, favoritos locales, preferencias de intereses, creación de recorridos y cuentas locales de demostración con correo/contraseña. Las cuentas, el catálogo, favoritos y preferencias todavía no se sincronizan con un servidor. La administración editorial, verificación del inventario, proveedor de mapas y publicación en tiendas móviles quedan para módulos posteriores. La geolocalización del navegador es opcional y se solicita únicamente al seleccionarla como punto de inicio.

## Configurar inicio de sesión

1. Para usar la demostración local no se necesitan credenciales: desde el formulario elige «Regístrate» y luego podrás iniciar sesión en el mismo navegador.
2. Para cuentas reales sincronizadas, crea un proyecto en Supabase y copia la URL y clave pública `anon` desde Project Settings > API.
3. En local, copia `.env.example` a `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Son claves públicas; nunca pongas una `service_role` en variables `NEXT_PUBLIC_*` ni en el navegador.
4. En Supabase > Authentication > Providers, habilita Email. Google OAuth no está habilitado en esta versión de la interfaz.
5. En Supabase > Authentication > URL Configuration, agrega `http://localhost:3000` como Site URL y Redirect URL; agrega también el dominio de Vercel cuando despliegues.
6. En Vercel > Project > Settings > Environment Variables, define las dos variables para Preview y Production, y vuelve a desplegar.

La primera pantalla es una portada con opciones para iniciar sesión o crear cuenta; también ofrece entrar como visitante. El flujo actual incluye registro e inicio de sesión con correo/contraseña en modo local, sesión persistente en el navegador y cierre de sesión. Si se configuran las variables Supabase, el formulario usa Supabase Email en su lugar.

El modo local guarda las cuentas solo en ese navegador y dispositivo. La contraseña se deriva con PBKDF2 y no se guarda en texto claro; aun así, este modo es solo para demostración, no autentica en producción, no verifica correos, no permite recuperar contraseñas por email, no sincroniza entre dispositivos y los datos se borran al limpiar el almacenamiento del navegador. Para producción, conecta Supabase.

## Mapas y fichas de lugar

Las fichas abren una búsqueda incrustada de Google Maps y un enlace a indicaciones. La búsqueda usa las coordenadas disponibles o el nombre del lugar en Pasto; para los lugares sin coordenadas aparece un aviso de ubicación pendiente. La vista básica de mapa no requiere una clave de Google Maps. Las fichas separan historia/origen, fundadores o responsables, y actividades sugeridas; los datos no documentados se señalan para que no se confundan con información verificada.

## Despliegue en Vercel

Importa el repositorio en Vercel y conserva los comandos estándar de Next.js (`npm install` y `npm run build`). Si se habilita el proveedor LLM, configura sus variables de entorno en el proyecto Vercel, nunca en variables `NEXT_PUBLIC_*`.