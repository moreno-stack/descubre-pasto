# Descubre Pasto: de web a app móvil

La interfaz web se cambió por una interfaz de app móvil con animaciones. El proyecto ya está listo para generar el APK con Capacitor cuando tengas Android Studio.

La versión web anterior quedó guardada en la carpeta `_version-web/`, por si la necesitas.

## Qué cambió, fase por fase

### Fase 1: base de app móvil
- Se agregó **Capacitor** (`capacitor.config.ts`) para empaquetar la app como APK de Android.
- `npm run build:mobile` genera la versión estática en `/out`, que es la que va dentro del APK:
  - Aparta un momento las rutas `/api`, porque no pueden ir dentro del APK.
  - Quita el video de 54 MB; la app usa la foto de portada animada.
- La IA (Groq) sigue en el backend. La app la consume desde `NEXT_PUBLIC_API_URL`, que es el backend publicado, por ejemplo en Vercel. El backend ya responde con CORS para la app.
- Se configuraron pantalla completa con notch (`viewport-fit=cover`), ícono propio (`public/icon.svg`), manifest y barra de estado.
- Las fuentes vienen incluidas en el proyecto (Bricolage Grotesque + Instrument Sans), así que funcionan sin internet.
- Los favoritos y los intereses se guardan en el dispositivo.

### Fase 2: interfaz móvil
- **Barra de pestañas inferior** flotante con: Inicio, Explorar, Ruta, Chat y Guardados.
- **Inicio**: portada a pantalla completa, intereses, carrusel "Imperdibles", accesos por tiempo (2 h, medio día, todo el día) y carruseles por tipo de lugar.
- **Explorar**: buscador fijo arriba, chips de categoría y cuadrícula escalonada de 2 columnas.
- **Ficha del lugar**: hoja que sube desde abajo y se cierra arrastrando hacia abajo o con el botón atrás de Android.
- **Ruta y Chat**: pantallas completas tipo chat. La conversación se conserva al cambiar de pestaña.
- **Guardados**: lista que se borra deslizando a la izquierda, con botón para armar la ruta con esos lugares.
- **Perfil**: entra desde la derecha al tocar el avatar y se cierra deslizando.
- Cuenta e inicio de sesión como hoja inferior.

### Fase 3: animaciones (identidad propia: barniz de Pasto + Carnaval de Negros y Blancos)
- **Splash**: piezas de colores del barniz de Pasto (mopa-mopa) llegan desde los bordes, se dibuja el volcán Galeras y las letras de "Descubre Pasto" suben una por una.
- **Explosión de barniz y talco**: al guardar un favorito y al terminar un recorrido salen piezas geométricas de colores con una nube de talco blanco.
- Pestaña activa con burbuja dorada que se desliza (spring), ícono que rebota y contador de guardados que aparece de golpe.
- Portada con parallax y zoom al deslizar.
- Carruseles con efecto de profundidad: las tarjetas giran y se achican en los bordes.
- La foto de la tarjeta crece hasta convertirse en la ficha del lugar (shared element).
- Burbujas de chat que nacen desde la esquina de quien habla, puntos de "escribiendo" y barra de progreso del asistente.
- Recorrido generado como **línea de ruta que se dibuja**, con paradas numeradas que aparecen una por una.
- Vibración suave al tocar (háptica) en el celular.
- Si el celular tiene activado "reducir movimiento", las animaciones se desactivan.

## Cómo probarla ahora (sin APK)

```bash
npm install
npm run dev
```
Abre http://localhost:3000. En computador se ve como un teléfono centrado. Para verla tal cual en el celular, usa las herramientas de desarrollador (F12) en modo dispositivo móvil.

## Cuando tengas Android Studio: generar el APK

1. **Publica el backend** (las rutas `/api` con la IA). Por ejemplo, sube el proyecto a Vercel y agrega la variable `GROQ_API_KEY`.
2. En `.env.local` agrega la dirección del backend publicado:
   ```
   NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
   ```
3. Genera la versión móvil. Primero detén `npm run dev`, porque Windows bloquea la carpeta `app/api` mientras el servidor corre.
   ```bash
   npm run build:mobile
   ```
4. Crea el proyecto Android (solo la primera vez) y sincroniza:
   ```bash
   npm run cap:add
   npm run cap:sync
   npm run cap:open
   ```
5. En Android Studio ve a **Build › Build Bundle(s) / APK(s) › Build APK(s)**. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

Cada vez que cambies el código, repite los pasos 3 y `npm run cap:sync`.
