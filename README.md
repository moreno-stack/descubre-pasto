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

`POST /api/recommend` interpreta intereses, tiempo y presupuesto con reglas locales, consulta el catálogo de `lib/places.ts` y crea una ruta que cabe en el tiempo indicado. La selección se limita a lugares del catálogo y explica el motivo de cada parada. No requiere claves ni servicios de IA externos.

## Catálogo inicial

El inventario inicial contiene 116 registros: templos, plazas, parques, centros comerciales, puentes, museos, cultura, naturaleza y platos típicos. Sus horarios, precios, descripciones, imágenes y datos de ubicación requieren revisión editorial. Los lugares sin coordenadas o duración no se ofrecen en rutas automáticas. El estado `verified` permite identificar los registros pendientes; no usar estos datos como información operativa confirmada.

## Alcance de esta entrega

Incluye inicio, exploración y filtros con conteos, detalle de lugares, favoritos locales, preferencias de intereses, creación de recorridos y cuentas locales de demostración con correo/contraseña. Las cuentas, el catálogo, favoritos y preferencias todavía no se sincronizan con un servidor. La administración editorial, verificación del inventario, proveedor de mapas y publicación en tiendas móviles quedan para módulos posteriores. La geolocalización del navegador es opcional y se solicita únicamente al seleccionarla como punto de inicio.

## Acceso a la aplicación

La primera pantalla es una portada con opciones para iniciar sesión o crear cuenta; también ofrece entrar como visitante. El registro y el inicio de sesión funcionan localmente con correo y contraseña. La aplicación no integra Google OAuth, Supabase ni servicios externos con credenciales.

Las cuentas se guardan solo en ese navegador y dispositivo. La contraseña se deriva con PBKDF2 y no se guarda en texto claro; aun así, este modo es solo para demostración: no verifica correos, no permite recuperar contraseñas por email, no sincroniza entre dispositivos y los datos se borran al limpiar el almacenamiento del navegador.

La portada muestra `public/imagenes/portada-pasto.jpg` si ese archivo está presente. El proyecto incluye un fondo de respaldo de Galeras mientras se agrega la imagen final.

## Mapas y fichas de lugar

Las fichas abren una búsqueda incrustada de Google Maps y un enlace a indicaciones. La búsqueda usa las coordenadas disponibles o el nombre del lugar en Pasto; para los lugares sin coordenadas aparece un aviso de ubicación pendiente. La vista básica de mapa no requiere una clave de Google Maps. Las fichas separan historia/origen, fundadores o responsables, y actividades sugeridas; los datos no documentados se señalan para que no se confundan con información verificada.

## Despliegue en Vercel

Importa el repositorio en Vercel y conserva los comandos estándar de Next.js (`npm install` y `npm run build`). Esta versión no necesita variables de entorno.