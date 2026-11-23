import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { WebView as RNWebView, type WebViewNavigation } from "react-native-webview";

// Los tipos de react-native-webview 14 chocan con los de React Native 0.88 (sus props quedan en "never");
// en tiempo de ejecución funciona bien, así que lo tipamos a mano.
type WebViewHandle = { goBack: () => void; reload: () => void };
const WebView = RNWebView as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<WebViewHandle> }>;

/*
 * Descubre Pasto dentro de Expo Go.
 * La app web (Next.js) corre en tu PC con `npm run dev:lan` y aquí se muestra
 * a pantalla completa, sin barra del navegador.
 *
 * Dirección que se carga:
 *  1. EXPO_PUBLIC_WEB_URL si la defines (por ejemplo tu web publicada en Vercel).
 *  2. Si no, la misma IP del PC que está corriendo Expo, puerto 3000.
 */

const BG = "#220710";

function resolveWebUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const hostUri = Constants.expoConfig?.hostUri; // ej. "192.168.1.10:8081"
  const host = hostUri?.split(":")[0];
  return `http://${host ?? "localhost"}:3000`;
}

export default function App() {
  const webUrl = useMemo(resolveWebUrl, []);
  const webRef = useRef<WebViewHandle>(null);
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Botón "atrás" de Android: retrocede dentro de la app antes de cerrarla.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack.current) {
        webRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  // Enlaces externos (Google Maps, Wikimedia…) se abren en su app, no dentro de la WebView.
  const onShouldStart = useCallback(
    (req: WebViewNavigation) => {
      const url = req.url;
      if (url.startsWith(webUrl) || url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) return true;
      Linking.openURL(url).catch(() => {});
      return false;
    },
    [webUrl],
  );

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {!failed && (
        <WebView
          key={reloadKey}
          ref={webRef}
          source={{ uri: webUrl }}
          style={styles.web}
          containerStyle={styles.web}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          geolocationEnabled
          overScrollMode="never"
          bounces={false}
          onShouldStartLoadWithRequest={onShouldStart}
          onNavigationStateChange={(s: { canGoBack: boolean }) => { canGoBack.current = s.canGoBack; }}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
          onHttpError={(e: { nativeEvent: { statusCode: number } }) => { if (e.nativeEvent.statusCode >= 500) setFailed(true); }}
        />
      )}

      {loading && !failed && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#fb7185" />
        </View>
      )}

      {failed && (
        <View style={styles.errorBox}>
          <Text style={styles.title}>No pude abrir Descubre Pasto</Text>
          <Text style={styles.text}>Intenté cargar:</Text>
          <Text style={styles.url}>{webUrl}</Text>
          <Text style={styles.text}>
            1. En tu PC, en la carpeta del proyecto web, corre: npm run dev:lan{"\n"}
            2. El celular y el PC deben estar en la misma red WiFi.{"\n"}
            3. Si Windows pregunta por el firewall, dale "Permitir".
          </Text>
          <Pressable style={styles.button} onPress={retry}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: BG },
  errorBox: { flex: 1, justifyContent: "center", padding: 28, gap: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  text: { color: "#fecdd3", fontSize: 15, lineHeight: 22 },
  url: { color: "#fb7185", fontSize: 15, fontWeight: "600" },
  button: { marginTop: 12, alignSelf: "flex-start", backgroundColor: "#e11d48", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
