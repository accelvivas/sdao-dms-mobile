// app.config.js
export default {
  expo: {
    name: "sdao-dms-mobile",
    slug: "sdao-dms-mobile",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
    },
    android: {
      package: process.env.ANDROID_PACKAGE ?? "com.nulpsdao.sdaodmsmobile",
      versionCode: 2,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      "expo-secure-store",
      ["expo-notifications", { defaultChannel: "reviews", color: "#164E63" }],
    ],

    // ↓ bago lang idinagdag
    extra: {
      apiBaseUrl: process.env.API_BASE_URL ?? "https://nulpsdao.com/api",
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
      notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== "false",
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? "ad5d9f4e-c36b-454a-afb0-afc82cdc9e73",
      },
    },
  },
};
