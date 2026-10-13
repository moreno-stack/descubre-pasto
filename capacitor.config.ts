import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "co.edu.ucc.descubrepasto",
  appName: "Descubre Pasto",
  webDir: "out",
  backgroundColor: "#16121f",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#16121f",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#16121f",
      overlaysWebView: true,
    },
  },
};

export default config;
