import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.cmr.plantlayout",
  appName: "CMR Plant Layout",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
