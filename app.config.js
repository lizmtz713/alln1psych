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
        NSMicrophoneUsageDescription:
          'InGauge uses your microphone so you can talk to Gauge by voice.',
        NSCameraUsageDescription: 'InGauge uses your camera for profile photos.',
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
      [
        '@react-native-voice/voice',
        {
          microphonePermission: 'InGauge uses the microphone so you can speak to Gauge.',
          speechRecognitionPermission: 'InGauge uses speech recognition to transcribe what you say.',
        },
      ],
    ],
  },
};
