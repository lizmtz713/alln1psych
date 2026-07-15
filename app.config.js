/**
 * Expo app config for InGauge.
 * Production-ready for EAS Build / TestFlight.
 */
module.exports = {
  expo: {
    name: 'InGauge',
    slug: 'alln1-psych',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'alln1-psych',
    // react-native-health is a legacy bridge module. Keep the old architecture
    // for this TestFlight until HealthKit moves to a verified TurboModule package.
    newArchEnabled: false,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0B1E',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.alln1network.psych',
      buildNumber: '1',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription:
          'InGauge uses your microphone so you can talk to Gauge by voice.',
        NSCameraUsageDescription: 'InGauge uses your camera for profile photos.',
        NSHealthShareUsageDescription:
          'InGauge reads your health data (sleep, heart rate, activity) to help you understand how your body affects your mood and energy.',
        NSHealthUpdateUsageDescription:
          'InGauge can save mindfulness minutes and other wellness data to Apple Health.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F0B1E',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.alln1network.psych',
      versionCode: 1,
      permissions: ['RECORD_AUDIO'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'b2be53d8-2212-4f77-99b6-e2a829b7dc5b',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-font',
      'expo-apple-authentication',
      // HealthKit entitlements + merges NSHealth* usage strings (see ios.infoPlist for copy).
      // TODO: After adding or changing this plugin, run `npx expo prebuild --clean` (or EAS Build) so the native project picks up com.apple.developer.healthkit.
      [
        'react-native-health/app.plugin.js',
        {
          healthSharePermission:
            'InGauge reads sleep, activity, heart rate, and HRV as supporting signals for your Body and State gauges. This is not medical advice.',
          healthUpdatePermission:
            'InGauge may write mindfulness or wellness data you choose to save to Apple Health.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#7C4DFF',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'InGauge needs microphone access so you can talk to Gauge.',
        }
      ],
    ],
  },
};
