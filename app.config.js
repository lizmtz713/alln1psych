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
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0B1E',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.alln1network.psych',
      buildNumber: '14',
      usesAppleSignIn: true,
      entitlements: {
        'com.apple.developer.healthkit': true,
        'com.apple.developer.healthkit.access': ['health-records'],
        'com.apple.developer.healthkit.background-delivery': true,
      },
      infoPlist: {
        NSMicrophoneUsageDescription:
          'InGauge uses your microphone so you can talk to Gauge by voice.',
        NSCameraUsageDescription: 'InGauge uses your camera for profile photos.',
        NSHealthShareUsageDescription:
          'InGauge reads your health data (sleep, activity, heart rate, cycle) to power your Body gauge and give personalized insights.',
        NSHealthUpdateUsageDescription:
          'InGauge may write wellness data to Health.',
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
      'expo-web-browser',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'InGauge uses your location to provide weather-based mood insights.',
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
        },
      ],
    ],
  },
};
