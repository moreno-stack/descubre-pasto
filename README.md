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

## 🎯 Nuevas Características

### 🤖 Asistente de IA con Groq
El sistema ahora utiliza la API de Groq (Llama 3.3 70B) para:
- **Interpretación inteligente de consultas**: Entiende mejor las peticiones del usuario
- **Optimización de rutas**: Crea rutas turísticas más lógicas y personalizadas
- **Análisis de preferencias**: Detecta automáticamente intereses del usuario

**Configuración**: 
1. Obtén tu API key en: https://console.groq.com/keys
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Agrega: `GROQ_API_KEY=tu_api_key_aqui`

**⚠️ IMPORTANTE**: 
- Nunca compartas tu API key públicamente
- `.env.local` ya está en `.gitignore`
- Ver `SEGURIDAD.md` para más detalles

### 🎥 Video en la Portada
El hero de la página principal ahora soporta video de fondo:
- **Ubicación**: Coloca tu video en `public/videos/pasto-discover.mp4`
- **Fallback automático**: Si no hay video local, usa un video de ejemplo
- **Optimizado**: Autoplay, loop, y muted para mejor experiencia
- **Ver instrucciones completas**: `public/videos/README.md`

## Recomendaciones

`POST /api/recommend` ahora utiliza **Groq AI** para interpretar intereses, tiempo y presupuesto de forma más inteligente. El sistema:
1. Analiza el prompt con IA para extraer intenciones
2. Consulta el catálogo de `lib/places.ts`
3. Optimiza la ruta usando IA considerando distancias y preferencias
4. Explica el motivo de cada parada

Si la IA no está disponible, usa automáticamente un sistema de reglas como fallback.

## Catálogo inicial

El inventario inicial contiene 116 registros: templos, plazas, parques, centros comerciales, puentes, museos, cultura, naturaleza y platos típicos. Sus horarios, precios, descripciones, imágenes y datos de ubicación requieren revisión editorial. Los lugares sin coordenadas o duración no se ofrecen en rutas automáticas. El estado `verified` permite identificar los registros pendientes; no usar estos datos como información operativa confirmada.

## Alcance de esta entrega

Incluye inicio, exploración y filtros con conteos, detalle de lugares, favoritos locales, preferencias de intereses, creación de recorridos y cuentas locales de demostración con correo/contraseña. Las cuentas, el catálogo, favoritos y preferencias todavía no se sincronizan con un servidor. La administración editorial, verificación del inventario, proveedor de mapas y publicación en tiendas móviles quedan para módulos posteriores. La geolocalización del navegador es opcional y se solicita únicamente al seleccionarla como punto de inicio.

## Acceso a la aplicación

La primera pantalla es una portada con opciones para iniciar sesión o crear cuenta; también ofrece entrar como visitante. El registro y el inicio de sesión funcionan localmente con correo y contraseña. La aplicación no integra Google OAuth, Supabase ni servicios externos con credenciales.

Las cuentas se guardan solo en ese navegador y dispositivo. La contraseña se deriva con PBKDF2 y no se guarda en texto claro; aun así, este modo es solo para demostración: no verifica correos, no permite recuperar contraseñas por email, no sincroniza entre dispositivos y los datos se borran al limpiar el almacenamiento del navegador.

La portada muestra un **video de fondo** (si está disponible en `public/videos/pasto-discover.mp4`) con el texto "Pasto se descubre paso a paso". Si no hay video, usa una imagen de respaldo.

## Mapas y fichas de lugar

Las fichas abren una búsqueda incrustada de Google Maps y un enlace a indicaciones. La búsqueda usa las coordenadas disponibles o el nombre del lugar en Pasto; para los lugares sin coordenadas aparece un aviso de ubicación pendiente. La vista básica de mapa no requiere una clave de Google Maps. Las fichas separan historia/origen, fundadores o responsables, y actividades sugeridas; los datos no documentados se señalan para que no se confundan con información verificada.

## Despliegue en Vercel

Importa el repositorio en Vercel y agrega la variable de entorno:
- `GROQ_API_KEY`: Tu clave de API de Groq

Conserva los comandos estándar de Next.js (`npm install` y `npm run build`).

## 📦 Dependencias Principales
- **Next.js 15.5**: Framework React
- **groq-sdk**: Cliente para API de Groq AI
- **lucide-react**: Iconos
- **TypeScript**: Tipado estático