# Descubre Pasto en Expo Go

App Expo que muestra la app web de Descubre Pasto a pantalla completa en el celular.

## Cómo verla

1. **En una terminal**, en la carpeta del proyecto web (`Descubre-Pasto`):
   ```bash
   npm run dev:lan
   ```
2. **En otra terminal**, en esta carpeta (`movil-expo`):
   ```bash
   npm install        # solo la primera vez
   npx expo start
   ```
3. En el celular instala **Expo Go** (Play Store / App Store) y escanea el QR que sale en la terminal.
   - Android: desde la app Expo Go → "Scan QR code".
   - iPhone: con la cámara del celular.

El celular y el PC deben estar en la **misma red WiFi**. Si Windows pregunta por el firewall, dale **Permitir** (redes privadas).

La app carga la web desde la misma IP de tu PC en el puerto 3000, no hay que configurar nada.

## Si la WiFi no deja conectar (universidad, red pública)

Usa el túnel de Expo:
```bash
npx expo start --tunnel
```
Y publica la web (por ejemplo en Vercel) y crea un archivo `.env` aquí con:
```
EXPO_PUBLIC_WEB_URL=https://tu-proyecto.vercel.app
```
Así el celular no necesita estar en la misma red que el PC.
