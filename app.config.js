/**
 * Expo app config for AllN1 Psych.
 * Production-ready for EAS Build / TestFlight.
 */
module.exports = {
  expo: {
    name: 'AllN1 Psych',
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
          'AllN1 Psych uses your microphone so you can talk to your AI companion by voice.',
        NSCameraUsageDescription: 'AllN1 Psych uses your camera for profile photos.',
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
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
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
            'AllN1 Psych needs microphone access so you can talk to your AI companion.',
        },
      ],
      [
        '@react-native-voice/voice',
        {
          microphonePermission: 'AllN1 Psych uses the microphone so you can speak to your AI companion.',
          speechRecognitionPermission: 'AllN1 Psych uses speech recognition to transcribe what you say.',
        },
      ],
    ],
  },
};
