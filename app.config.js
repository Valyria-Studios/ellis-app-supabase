import "dotenv/config";

export default ({ config }) => ({
  ...config,
  name: "Ellis",
  slug: "ellis-app",
  version: "0.0.5",
  scheme: "ellisapp",
  orientation: "portrait",
  icon: "./assets/ellis-test-icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ellis-test.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.valyria.ellis",
    versionCode: 5,
    permissions: ["INTERNET", "ACCESS_NETWORK_STATE", "ACCESS_WIFI_STATE"],
    adaptiveIcon: {
      foregroundImage: "./assets/ellis-test-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "2d4a8ef2-a0bb-4fe0-bfe2-894723f3cbfc",
    },
    authSupabaseUrl: process.env.AUTH_SUPABASE_URL,
    authSupabaseAnonKey: process.env.AUTH_SUPABASE_ANON_KEY,
    dataSupabaseUrl: process.env.DATA_SUPABASE_URL,
    dataSupabaseAnonKey: process.env.DATA_SUPABASE_ANON_KEY,
  },
  owner: "valyria",
  runtimeVersion: "0.0.5",
  updates: {
    enabled: false, // ✅ disabled for production, so it avoids OTA issues
  },
  plugins: ["expo-font"],
});
