import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "co.edu.ucc.descubrepasto",
  appName: "Descubre Pasto",
  webDir: "out",
  backgroundColor: "#220710",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#220710",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#220710",
      overlaysWebView: true,
    },
  },
};

export default config;
