import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { usePremiumStore } from '../../src/stores/premiumStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useSpotifyStore } from '../../src/stores/spotifyStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { useI18n, type Language } from '../../src/i18n';
import { registerForPushNotifications } from '../../src/services/notifications';
import {
  buildExportData,
  shareExportFile,
  buildTherapistSummary,
} from '../../src/services/exportData';
import { getOpenAIKey, setOpenAIKey } from '../../src/services/ai';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/sensitiveTopics';

// Use design system colors
const ACCENT = COLORS.accent;
const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const TEXT_DIM = COLORS.textMuted;

function HealthConnectionCard() {
  const isAvailable = useHealthStore((s) => s.isAvailable);
  const isAuthorized = useHealthStore((s) => s.isAuthorized);
  const snapshot = useHealthStore((s) => s.snapshot);
  const bodyScore = useHealthStore((s) => s.bodyScoreFromHealth);
  const initialize = useHealthStore((s) => s.initialize);
  const requestPermissions = useHealthStore((s) => s.requestPermissions);
  const syncHealthData = useHealthStore((s) => s.syncHealthData);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const success = await requestPermissions();
    if (success) {
      Alert.alert('Connected!', 'Apple Health is now syncing with your Body gauge.');
    } else {
      Alert.alert('Connection Failed', 'Please enable Health access in Settings > Privacy > Health.');
    }
    setConnecting(false);
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await syncHealthData();
  };

  // Don't show on Android
  if (!isAvailable && Platform.OS === 'android') {
    return null;
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Health Data</Text>
      <View style={styles.card}>
        {!isAuthorized ? (
          <>
            <View style={styles.row}>
              <Ionicons name="heart-circle" size={24} color="#FF6B6B" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowLabel}>Connect Apple Health</Text>
                <Text style={styles.rowHint}>
                  Sync sleep, activity, water, cycle data to your Body gauge
                </Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                healthStyles.connectBtn,
                pressed && { opacity: 0.9 },
                connecting && { opacity: 0.6 },
              ]}
              onPress={handleConnect}
              disabled={connecting}
            >
              <Ionicons name="fitness" size={18} color="#fff" />
              <Text style={healthStyles.connectBtnText}>
                {connecting ? 'Connecting...' : 'Connect Health'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Ionicons name="checkmark-circle" size={24} color="#34D399" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowLabel}>Apple Health Connected</Text>
                <Text style={styles.rowHint}>
                  {snapshot ? `Last sync: ${new Date(snapshot.lastSynced).toLocaleTimeString()}` : 'Tap to sync'}
                </Text>
              </View>
              <Pressable onPress={handleSync} style={healthStyles.syncBtn}>
                <Ionicons name="refresh" size={18} color={ACCENT} />
              </Pressable>
            </View>
            
            {snapshot && (
              <View style={healthStyles.statsGrid}>
                <View style={healthStyles.statItem}>
                  <Text style={healthStyles.statValue}>
                    {snapshot.sleep.lastNight.duration.toFixed(1)}h
                  </Text>
                  <Text style={healthStyles.statLabel}>Sleep</Text>
                </View>
                <View style={healthStyles.statItem}>
                  <Text style={healthStyles.statValue}>
                    {snapshot.activity.steps.toLocaleString()}
                  </Text>
                  <Text style={healthStyles.statLabel}>Steps</Text>
                </View>
                <View style={healthStyles.statItem}>
                  <Text style={healthStyles.statValue}>
                    {snapshot.nutrition.waterOz}oz
                  </Text>
                  <Text style={healthStyles.statLabel}>Water</Text>
                </View>
                <View style={healthStyles.statItem}>
                  <Text style={healthStyles.statValue}>
                    {bodyScore ?? '--'}
                  </Text>
                  <Text style={healthStyles.statLabel}>Body Score</Text>
                </View>
              </View>
            )}

            {snapshot?.menstruation && (
              <View style={healthStyles.cycleInfo}>
                <Ionicons name="calendar" size={16} color={ACCENT} />
                <Text style={healthStyles.cycleText}>
                  Day {snapshot.menstruation.dayOfCycle} • {snapshot.menstruation.currentPhase}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
}

const healthStyles = StyleSheet.create({
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  connectBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  syncBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: ACCENT + '20',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  cycleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  cycleText: {
    fontSize: 13,
    color: TEXT_MUTED,
    textTransform: 'capitalize',
  },
});

function LanguageSelector() {
  const language = useI18n((s) => s.language);
  const setLanguage = useI18n((s) => s.setLanguage);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇲🇽' },
  ];

  return (
    <View>
      {languages.map((lang, index) => (
        <View key={lang.code}>
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLanguage(lang.code);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 24 }}>{lang.flag}</Text>
              <Text style={{ fontSize: 16, color: TEXT, fontWeight: language === lang.code ? '600' : '400' }}>
                {lang.name}
              </Text>
            </View>
            {language === lang.code && (
              <Ionicons name="checkmark-circle" size={24} color={ACCENT} />
            )}
          </Pressable>
          {index < languages.length - 1 && (
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          )}
        </View>
      ))}
      <Text style={{ fontSize: 12, color: TEXT_DIM, marginTop: 12, lineHeight: 18 }}>
        Changing language updates all text and AI responses. El español incluye contenido culturalmente adaptado para la comunidad latina.
      </Text>
    </View>
  );
}

function SpotifyConnectionCard() {
  const isConnected = useSpotifyStore((s) => s.isConnected);
  const isConnecting = useSpotifyStore((s) => s.isConnecting);
  const listeningMood = useSpotifyStore((s) => s.listeningMood);
  const moodScore = useSpotifyStore((s) => s.moodScore);
  const lastUpdated = useSpotifyStore((s) => s.lastUpdated);
  const checkConnection = useSpotifyStore((s) => s.checkConnection);
  const connect = useSpotifyStore((s) => s.connect);
  const disconnect = useSpotifyStore((s) => s.disconnect);
  const refreshData = useSpotifyStore((s) => s.refreshData);

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await connect();
    if (success) {
      Alert.alert('Connected!', 'Spotify is now tracking your listening mood.');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Spotify?',
      'Your listening data will no longer sync.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnect(),
        },
      ]
    );
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData();
  };

  // Get mood color based on valence
  const getMoodColor = (valence: number) => {
    if (valence >= 0.6) return '#4ADE80'; // green
    if (valence >= 0.4) return '#FACC15'; // yellow
    if (valence >= 0.25) return '#FB923C'; // orange
    return '#F87171'; // red
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Music & Mood</Text>
      <View style={styles.card}>
        {!isConnected ? (
          <>
            <View style={styles.row}>
              <Ionicons name="musical-notes" size={24} color="#1DB954" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowLabel}>Connect Spotify</Text>
                <Text style={styles.rowHint}>
                  Track your listening mood and see patterns with your gauges
                </Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                spotifyStyles.connectBtn,
                pressed && { opacity: 0.9 },
                isConnecting && { opacity: 0.6 },
              ]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              <Ionicons name={"logo-spotify" as any} size={20} color="#fff" />
              <Text style={spotifyStyles.connectBtnText}>
                {isConnecting ? 'Connecting...' : 'Connect Spotify'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rowLabel}>Spotify Connected</Text>
                <Text style={styles.rowHint}>
                  {lastUpdated
                    ? `Last sync: ${new Date(lastUpdated).toLocaleTimeString()}`
                    : 'Tap to sync'}
                </Text>
              </View>
              <Pressable onPress={handleRefresh} style={spotifyStyles.syncBtn}>
                <Ionicons name="refresh" size={18} color="#1DB954" />
              </Pressable>
            </View>

            {listeningMood && (
              <View style={spotifyStyles.moodSection}>
                <View style={spotifyStyles.moodHeader}>
                  <Text style={spotifyStyles.moodLabel}>24h Listening Mood</Text>
                  <View
                    style={[
                      spotifyStyles.moodBadge,
                      { backgroundColor: getMoodColor(listeningMood.averageValence) + '30' },
                    ]}
                  >
                    <Text
                      style={[
                        spotifyStyles.moodBadgeText,
                        { color: getMoodColor(listeningMood.averageValence) },
                      ]}
                    >
                      {listeningMood.moodLabel}
                    </Text>
                  </View>
                </View>
                <View style={spotifyStyles.statsRow}>
                  <View style={spotifyStyles.statItem}>
                    <Text style={spotifyStyles.statValue}>
                      {Math.round(listeningMood.averageValence * 100)}%
                    </Text>
                    <Text style={spotifyStyles.statLabel}>Positivity</Text>
                  </View>
                  <View style={spotifyStyles.statItem}>
                    <Text style={spotifyStyles.statValue}>
                      {Math.round(listeningMood.averageEnergy * 100)}%
                    </Text>
                    <Text style={spotifyStyles.statLabel}>Energy</Text>
                  </View>
                  <View style={spotifyStyles.statItem}>
                    <Text style={spotifyStyles.statValue}>{listeningMood.trackCount}</Text>
                    <Text style={spotifyStyles.statLabel}>Tracks</Text>
                  </View>
                  {moodScore !== null && (
                    <View style={spotifyStyles.statItem}>
                      <Text style={spotifyStyles.statValue}>{moodScore}</Text>
                      <Text style={spotifyStyles.statLabel}>Mood Score</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <Pressable style={spotifyStyles.disconnectBtn} onPress={handleDisconnect}>
              <Text style={spotifyStyles.disconnectText}>Disconnect Spotify</Text>
            </Pressable>
          </>
        )}
      </View>
    </>
  );
}

const spotifyStyles = StyleSheet.create({
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1DB954',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  connectBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  syncBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1DB954' + '20',
  },
  moodSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  moodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  disconnectBtn: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  disconnectText: {
    fontSize: 13,
    color: TEXT_DIM,
  },
});

function WeatherConnectionCard() {
  const weather = useWeatherStore((s) => s.weather);
  const lastUpdated = useWeatherStore((s) => s.lastUpdated);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const checkConfiguration = useWeatherStore((s) => s.checkConfiguration);
  const refreshWeather = useWeatherStore((s) => s.refreshWeather);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshWeather();
  };

  const getWeatherIcon = () => {
    if (!weather) return 'partly-sunny';
    const desc = weather.description.toLowerCase();
    if (desc.includes('rain')) return 'rainy';
    if (desc.includes('cloud')) return 'cloudy';
    if (desc.includes('clear') || desc.includes('sun')) return 'sunny';
    if (desc.includes('snow')) return 'snow';
    if (desc.includes('storm') || desc.includes('thunder')) return 'thunderstorm';
    return 'partly-sunny';
  };

  const getMoodColor = () => {
    if (!weather) return TEXT_MUTED;
    if (weather.moodImpact === 'positive') return '#4ADE80';
    if (weather.moodImpact === 'negative') return '#FB923C';
    return '#FACC15';
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Weather & Environment</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name={getWeatherIcon()} size={24} color="#60A5FA" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.rowLabel}>Weather</Text>
            <Text style={styles.rowHint}>
              {isLoading 
                ? 'Loading...' 
                : lastUpdated
                  ? `Last sync: ${new Date(lastUpdated).toLocaleTimeString()}`
                  : 'Tap to sync'}
            </Text>
          </View>
          <Pressable onPress={handleRefresh} style={weatherStyles.syncBtn}>
            <Ionicons name="refresh" size={18} color="#60A5FA" />
          </Pressable>
        </View>

        {weather && (
          <View style={weatherStyles.weatherSection}>
            <View style={weatherStyles.weatherMain}>
              <Text style={weatherStyles.temperature}>{weather.temperature}°</Text>
              <View>
                <Text style={weatherStyles.description}>{weather.description}</Text>
                <Text style={[weatherStyles.moodImpact, { color: getMoodColor() }]}>
                  {weather.moodImpact === 'positive' && '☀️ Good for mood'}
                  {weather.moodImpact === 'neutral' && '🌤 Neutral impact'}
                  {weather.moodImpact === 'negative' && '🌧 May affect mood'}
                </Text>
              </View>
            </View>
            <View style={weatherStyles.statsRow}>
              <View style={weatherStyles.statItem}>
                <Text style={weatherStyles.statValue}>{weather.humidity}%</Text>
                <Text style={weatherStyles.statLabel}>Humidity</Text>
              </View>
              <View style={weatherStyles.statItem}>
                <Text style={weatherStyles.statValue}>{weather.pressure}</Text>
                <Text style={weatherStyles.statLabel}>Pressure</Text>
              </View>
              <View style={weatherStyles.statItem}>
                <Text style={weatherStyles.statValue}>{weather.lightLevel}</Text>
                <Text style={weatherStyles.statLabel}>Light</Text>
              </View>
            </View>
          </View>
        )}

        {!weather && !isLoading && (
          <Text style={weatherStyles.hint}>
            Requires location permission to show local weather
          </Text>
        )}
      </View>
    </>
  );
}

const weatherStyles = StyleSheet.create({
  syncBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#60A5FA' + '20',
  },
  hint: {
    fontSize: 13,
    color: TEXT_DIM,
    marginTop: 12,
    textAlign: 'center',
  },
  weatherSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '300',
    color: TEXT,
  },
  description: {
    fontSize: 16,
    color: TEXT,
    textTransform: 'capitalize',
  },
  moodImpact: {
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

function PremiumCard() {
  const isPremium = usePremiumStore((s) => s.isPremium());
  const remaining = usePremiumStore((s) => s.getRemainingAIChats());
  const _setTier = usePremiumStore((s) => s._setTier);
  
  if (isPremium) {
    return (
      <View style={[premiumStyles.card, premiumStyles.cardPremium]}>
        <View style={premiumStyles.row}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={premiumStyles.title}>InGauge Premium</Text>
            <Text style={premiumStyles.subtitle}>Unlimited access • All features</Text>
          </View>
        </View>
        {__DEV__ && (
          <Pressable 
            style={premiumStyles.devButton}
            onPress={() => _setTier('free')}
          >
            <Text style={premiumStyles.devButtonText}>DEV: Switch to Free</Text>
          </Pressable>
        )}
      </View>
    );
  }
  
  return (
    <View style={premiumStyles.card}>
      <View style={premiumStyles.row}>
        <View style={premiumStyles.iconWrap}>
          <Ionicons name="sparkles" size={20} color={ACCENT} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={premiumStyles.title}>Free Plan</Text>
          <Text style={premiumStyles.subtitle}>
            {remaining > 0 
              ? `${remaining} AI chat${remaining !== 1 ? 's' : ''} left today`
              : 'AI chats refresh tomorrow'
            }
          </Text>
        </View>
      </View>
      <Pressable 
        style={({ pressed }) => [premiumStyles.upgradeBtn, pressed && { opacity: 0.9 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // TODO: Show premium modal
          Alert.alert('Coming Soon', 'Premium subscriptions launching soon!');
        }}
      >
        <Text style={premiumStyles.upgradeBtnText}>Upgrade • $9.99/mo</Text>
      </Pressable>
      {__DEV__ && (
        <Pressable 
          style={premiumStyles.devButton}
          onPress={() => _setTier('pro')}
        >
          <Text style={premiumStyles.devButtonText}>DEV: Switch to Premium</Text>
        </Pressable>
      )}
    </View>
  );
}

const premiumStyles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardPremium: {
    borderColor: '#FFD700' + '40',
    backgroundColor: '#FFD700' + '08',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  devButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 12,
    color: TEXT_DIM,
  },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const settings = useSettingsStore();
  const user = useUserStore();
  
  // API Key state
  const [apiKey, setApiKey] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  
  // Load existing API key on mount
  useEffect(() => {
    getOpenAIKey().then((key) => {
      if (key) {
        setApiKeyMasked('sk-••••••••' + key.slice(-4));
      }
    });
  }, []);
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    if (!apiKey.startsWith('sk-')) {
      Alert.alert('Invalid Key', 'OpenAI API keys start with "sk-"');
      return;
    }
    await setOpenAIKey(apiKey.trim());
    setApiKeyMasked('sk-••••••••' + apiKey.slice(-4));
    setApiKey('');
    setShowApiInput(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your API key is securely stored.');
  };
  
  const handleRemoveApiKey = () => {
    Alert.alert('Remove API Key?', 'You\'ll use the default service instead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await setOpenAIKey(null);
          setApiKeyMasked('');
          setShowApiInput(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleExportData = async () => {
    try {
      const data = buildExportData('all');
      await shareExportFile(data, `alln1-psych-export.json`);
    } catch (e) {
      Alert.alert('Export failed', 'Could not export. Try again.');
    }
  };

  const handleShareWithTherapist = async () => {
    try {
      const data = buildExportData('all');
      const text = buildTherapistSummary(data);
      const path = `${(FileSystem as any).documentDirectory ?? ''}therapist-summary.txt`;
      await FileSystem.writeAsStringAsync(path, text);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch (e) {
      Alert.alert('Share failed', 'Could not create summary.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear all data?',
      'This will delete your journal, conversations, and progress. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            useJournalStore.setState({ entries: [] });
            useConversationStore.getState().clearMessages();
            useConversationSummaryStore.getState().clearSummaries();
            useCircleStore.setState({ moodHistory: [] });
            useEducationStore.setState({ completedLessons: [], streakDays: 0 });
            Alert.alert('Done', 'All data cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Status */}
        <PremiumCard />

        {/* Language */}
        <Text style={styles.sectionTitle}>Language / Idioma</Text>
        <View style={styles.card}>
          <LanguageSelector />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily check-in reminders</Text>
            <Switch
              value={settings.notificationsCheckIn}
              onValueChange={async (v) => {
                if (v) await registerForPushNotifications();
                settings.setNotificationsCheckIn(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.notificationsCheckIn ? ACCENT : TEXT_MUTED}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Circle nudges</Text>
            <Switch
              value={settings.notificationsCircleNudges}
              onValueChange={settings.setNotificationsCircleNudges}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.notificationsCircleNudges ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Voice & AI */}
        <Text style={styles.sectionTitle}>Voice & AI</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.rowLabel}>AI Voice Responses</Text>
                {!usePremiumStore.getState().isPremium() && (
                  <View style={{ backgroundColor: '#FFD700' + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFD700' }}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rowHint}>Gauge speaks back with voice</Text>
            </View>
            <Switch
              value={settings.aiVoiceEnabled && usePremiumStore.getState().isPremium()}
              onValueChange={(v) => {
                if (!usePremiumStore.getState().isPremium()) {
                  Alert.alert('Premium Feature', 'Voice responses are available with InGauge Premium.', [
                    { text: 'Maybe Later', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => Alert.alert('Coming Soon', 'Premium subscriptions launching soon!') },
                  ]);
                  return;
                }
                settings.setAiVoiceEnabled(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.aiVoiceEnabled && usePremiumStore.getState().isPremium() ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* API Key (Power Users) */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => setShowApiInput(!showApiInput)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Your OpenAI API Key</Text>
              <Text style={styles.rowHint}>
                {apiKeyMasked ? apiKeyMasked : 'Use your own key for unlimited AI'}
              </Text>
            </View>
            <Ionicons name={showApiInput ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_DIM} />
          </Pressable>
          
          {showApiInput && (
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border }}>
              <TextInput
                style={styles.apiInput}
                placeholder="sk-..."
                placeholderTextColor={TEXT_DIM}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <Pressable
                  style={[styles.apiButton, { backgroundColor: ACCENT }]}
                  onPress={handleSaveApiKey}
                >
                  <Text style={styles.apiButtonText}>Save Key</Text>
                </Pressable>
                {apiKeyMasked ? (
                  <Pressable
                    style={[styles.apiButton, { backgroundColor: '#F87171' }]}
                    onPress={handleRemoveApiKey}
                  >
                    <Text style={styles.apiButtonText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={{ fontSize: 12, color: TEXT_DIM, marginTop: 12, lineHeight: 18 }}>
                Your key is stored securely on-device and never sent to our servers.
                Get one at platform.openai.com
              </Text>
            </View>
          )}
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Sensitive topics</Text>
              <Text style={styles.rowHint}>Gauge will be extra thoughtful about these</Text>
            </View>
          </View>
          {SENSITIVE_TOPIC_OPTIONS.filter(opt => opt.value !== 'none').map((opt, idx) => {
            const isSelected = user.sensitiveTopics?.includes(opt.value);
            return (
              <View key={opt.value}>
                <View style={styles.divider} />
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const newTopics = isSelected
                      ? (user.sensitiveTopics || []).filter(t => t !== opt.value)
                      : [...(user.sensitiveTopics || []), opt.value];
                    user.setSensitiveTopics(newTopics);
                  }}
                >
                  <Text style={styles.rowLabel}>{opt.emoji} {opt.label}</Text>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={isSelected ? ACCENT : TEXT_DIM}
                  />
                </Pressable>
              </View>
            );
          })}
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Pause circle sharing</Text>
              <Text style={styles.rowHint}>Hide your status from others</Text>
            </View>
            <Switch
              value={settings.circleSharingPaused}
              onValueChange={settings.setCircleSharingPaused}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.circleSharingPaused ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Health Integrations */}
        <Text style={styles.sectionTitle}>Health Integrations</Text>
        <View style={styles.card}>
          <Pressable 
            style={styles.row} 
            onPress={() => router.push('/(modals)/health-connections')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#7C4DFF22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 18 }}>💍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Oura Ring</Text>
                <Text style={styles.rowHint}>Connect for auto Body gauge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
          </Pressable>
        </View>
        
        <HealthConnectionCard />

        {/* Insights & Reports */}
        <Text style={styles.sectionTitle}>Insights & Reports</Text>
        <View style={styles.card}>
          <Pressable 
            style={styles.row} 
            onPress={() => router.push('/(modals)/sovereignty-report')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#4CAF5022', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="analytics" size={20} color="#4CAF50" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Monthly Report</Text>
                <Text style={styles.rowHint}>Your sovereignty score & patterns</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={styles.row} 
            onPress={() => router.push('/(modals)/patterns')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FF980022', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="trending-up" size={20} color="#FF9800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Pattern Detection</Text>
                <Text style={styles.rowHint}>Lead/lag indicators & trends</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
          </Pressable>
        </View>

        {/* Spotify Integration */}
        <SpotifyConnectionCard />

        {/* Weather Integration */}
        <WeatherConnectionCard />

        {/* Specialized Modes */}
        <Text style={styles.sectionTitle}>Specialized Modes</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>🏆 Athlete Mode</Text>
              <Text style={styles.rowHint}>Recovery tracking, pre-competition prep, performance debriefs</Text>
            </View>
            <Switch
              value={user.athleteMode}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                useUserStore.getState().setAthleteMode(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={user.athleteMode ? ACCENT : TEXT_MUTED}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>🌈 Spectrum Mode</Text>
              <Text style={styles.rowHint}>Sensory tools, stim toolkit, social scripts, visual supports</Text>
            </View>
            <Switch
              value={user.spectrumMode}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                useUserStore.getState().setSpectrumMode(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={user.spectrumMode ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Your Data</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleExportData}>
            <Text style={styles.rowLabel}>Export all data</Text>
            <Ionicons name="download-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={handleShareWithTherapist}>
            <Text style={styles.rowLabel}>Share with therapist</Text>
            <Ionicons name="share-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={handleClearData}>
            <Text style={[styles.rowLabel, { color: '#F87171' }]}>Clear all data</Text>
            <Ionicons name="trash-outline" size={22} color="#F87171" />
          </Pressable>
        </View>

        {/* Safety & Ethics */}
        <Text style={styles.sectionTitle}>Safety & Ethics</Text>
        <View style={styles.card}>
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>What InGauge Is</Text>
            <Text style={styles.disclaimerText}>
              InGauge is a self-awareness tool — an instrument panel for understanding your own system. 
              It observes and reflects, never judges or diagnoses.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>What InGauge Is Not</Text>
            <Text style={styles.disclaimerText}>
              • Not a medical device or diagnostic tool{'\n'}
              • Not a replacement for therapy or professional care{'\n'}
              • Not able to predict outcomes or prescribe treatments{'\n'}
              • Patterns are observations, not certainties
            </Text>
          </View>
          <View style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                'Crisis Resources',
                '988 Suicide & Crisis Lifeline\nCall or text 988\n\nCrisis Text Line\nText HOME to 741741\n\nTrans Lifeline\n877-565-8860\n\nTrevor Project (LGBTQ+ youth)\n1-866-488-7386\n\nThese resources are free and available 24/7.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View>
              <Text style={styles.rowLabel}>🆘 Crisis Resources</Text>
              <Text style={styles.rowHint}>Free 24/7 support lines</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Your Data</Text>
            <Text style={styles.disclaimerText}>
              • Stays on your device and your private account{'\n'}
              • Never sold or used for ads{'\n'}
              • Shared snapshots contain summaries only{'\n'}
              • You can delete everything anytime
            </Text>
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://alln1network.com/privacy')}
          >
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://alln1network.com/terms')}
          >
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <Ionicons name="open-outline" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: TEXT,
  },
  rowHint: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 16,
  },
  apiInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: TEXT,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  apiButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  apiButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Disclaimer styles
  disclaimerBox: {
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
});
