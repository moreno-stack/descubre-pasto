# 🎥 Cómo Agregar el Video de Portada

## Paso 1: Obtén tu video

Prepara un video que muestre los atractivos de Pasto. Puede incluir:
- Paisajes naturales (Volcán Galeras, Laguna de la Cocha)
- Centro histórico
- Carnaval de Negros y Blancos
- Cultura y tradiciones
- Gastronomía local

## Paso 2: Optimiza tu video

### Especificaciones recomendadas:
- **Formato**: MP4 (H.264)
- **Resolución**: 1920x1080 (Full HD) o 1280x720 (HD)
- **Duración**: 10-30 segundos (se reproducirá en loop)
- **Peso**: Máximo 10MB para carga rápida
- **FPS**: 24-30 fps

### Herramientas para comprimir:

#### Opción 1: HandBrake (Gratis, Windows/Mac/Linux)
1. Descarga de: https://handbrake.fr
2. Abre tu video
3. Selecciona preset: "Web" > "Discord Small 5 Minutes 480p30"
4. Ajusta resolución a 1280x720
5. Guarda como `pasto-discover.mp4`

#### Opción 2: CloudConvert (Online)
1. Ve a: https://cloudconvert.com/mp4-converter
2. Sube tu video
3. Ajusta configuración:
   - Codec: H.264
   - Resolución: 1280x720
   - Bitrate: 2000 kbps
4. Convierte y descarga

#### Opción 3: FFmpeg (Línea de comandos)
```bash
ffmpeg -i tu-video.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k pasto-discover.mp4
```

## Paso 3: Coloca el video

1. Copia tu video `pasto-discover.mp4`
2. Pégalo en la carpeta: `public/videos/`
3. La ruta final debe ser: `public/videos/pasto-discover.mp4`

## Paso 4: Verifica

1. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```
2. Abre: http://localhost:3000
3. El video debe reproducirse automáticamente en la portada

## ⚠️ Importante

- **Nombre exacto**: El archivo DEBE llamarse `pasto-discover.mp4`
- **Formato correcto**: Usar MP4 con codec H.264
- **Sin audio alto**: El video se reproduce en mudo por defecto
- **Tamaño apropiado**: Videos muy grandes ralentizan la carga

## 🎬 Si no tienes video propio

La aplicación incluye un video de ejemplo de internet que se cargará automáticamente si no detecta el archivo local. Puedes dejarlo así mientras consigues tu propio video.

## 🔧 Solución de problemas

### El video no se reproduce:
1. Verifica que el nombre sea exacto: `pasto-discover.mp4`
2. Confirma que esté en `public/videos/`
3. Usa formato MP4 con H.264
4. Prueba en otro navegador

### El video se ve pixelado:
- Aumenta la resolución a 1920x1080
- Reduce el CRF a 23-25 en HandBrake

### La página carga lenta:
- Reduce el tamaño del video (máx 5-7MB)
- Comprime más usando CRF 30 o superior

## 💡 Consejos adicionales

- **Loop perfecto**: El video debe verse bien cuando se repite
- **Primer frame atractivo**: Usa como poster/thumbnail
- **Contenido representativo**: Que capture la esencia de Pasto
- **Sin textos**: El texto se superpone en la interfaz

## 📞 ¿Necesitas ayuda?

Si tienes problemas, verifica:
1. Ruta del archivo
2. Permisos de lectura
3. Consola del navegador (F12) para errores
