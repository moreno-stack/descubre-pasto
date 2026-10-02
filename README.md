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

Incluye inicio, exploración y filtros con conteos, detalle de lugares, favoritos locales, preferencias de intereses y creación de recorridos. Registro/autenticación, persistencia de cuenta, base de datos, administración editorial, verificación del inventario, proveedor de mapas y publicación en tiendas móviles quedan para módulos posteriores. La geolocalización del navegador es opcional y se solicita únicamente al seleccionarla como punto de inicio.

## Despliegue en Vercel

Importa el repositorio en Vercel y conserva los comandos estándar de Next.js (`npm install` y `npm run build`). Si se habilita el proveedor LLM, configura sus variables de entorno en el proyecto Vercel, nunca en variables `NEXT_PUBLIC_*`.