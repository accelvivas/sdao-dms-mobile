// app.config.js
export default {
  expo: {
    name: "SDAO DMS",
    slug: "sdao-dms-mobile",
    version: "1.0.6",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/ad5d9f4e-c36b-454a-afb0-afc82cdc9e73",
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 5000,
    },
    orientation: "portrait",
    icon: "./assets/images/sdaodms.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
        },
      },
    },
    android: {
      package: process.env.ANDROID_PACKAGE ?? "com.nulpsdao.sdaodmsmobile",
      versionCode: 7,
      allowBackup: false,
      blockedPermissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.SYSTEM_ALERT_WINDOW",
      ],
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/images/sdaodms.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      ["expo-secure-store", { configureAndroidBackup: true }],
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Allow SDAO DMS to confirm sensitive proposal review actions.",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: false,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
      ["expo-notifications", { defaultChannel: "reviews", color: "#164E63" }],
    ],

    // ↓ bago lang idinagdag
    extra: {
      apiBaseUrl: process.env.API_BASE_URL ?? "https://nulpsdao.com/api",
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
      notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== "false",
      pushNotificationsEnabled: process.env.PUSH_NOTIFICATIONS_ENABLED === "true",
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? "ad5d9f4e-c36b-454a-afb0-afc82cdc9e73",
      },
    },
  },
};
