/**
 * Expo app config for AllN1 Psych.
 * Production-ready for EAS Build / TestFlight.
 * Set EAS_PROJECT_ID in env or replace in extra.eas.projectId.
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
        projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
      },
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
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
    ],
  },
};
