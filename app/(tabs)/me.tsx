import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';
import { useUserStore } from '../../src/stores/userStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { getOpenAIKey, setOpenAIKey } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';

const AGE_LABELS: Record<string, string> = {
  'under13': 'Under 13',
  '13-17': '13–17',
  '18-25': '18–25',
  '26-40': '26–40',
  '41-60': '41–60',
  '60+': '60+',
};

const LOVE_LANG_LABELS: Record<string, string> = {
  words: 'Words of affirmation',
  'quality-time': 'Quality time',
  'acts-of-service': 'Acts of service',
  'physical-touch': 'Physical touch',
  gifts: 'Gifts',
  unknown: 'Not sure yet',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_VERSION = '1.0.0';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useUserStore();
  const entries = useJournalStore((s) => s.entries);
  const getRecentEntries = useJournalStore((s) => s.getRecentEntries);
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  const getWeeklyMoodTrend = useInsightsStore((s) => s.getWeeklyMoodTrend);
  const getCheckInStreak = useInsightsStore((s) => s.getCheckInStreak);
  const getConversationCountThisWeek = useInsightsStore((s) => s.getConversationCountThisWeek);
  const getLessonsCompletedThisWeek = useInsightsStore((s) => s.getLessonsCompletedThisWeek);
  const getMostCommonMoodThisWeek = useInsightsStore((s) => s.getMostCommonMoodThisWeek);

  const settings = useSettingsStore();
  useCircleStore((s) => s.moodHistory.length);
  useEducationStore((s) => s.completedLessons.length);
  useConversationStore((s) => s.messages.length);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  const recentEntries = getRecentEntries(20);
  const achievements = getAchievements();
  const moodTrend = getWeeklyMoodTrend();
  const streak = getCheckInStreak();
  const conversationCount = getConversationCountThisWeek();
  const lessonsCount = getLessonsCompletedThisWeek();
  const mostCommonMood = getMostCommonMoodThisWeek();

  useEffect(() => {
    getOpenAIKey().then((k) => setHasStoredKey(Boolean(k)));
  }, [settings.apiKeySavedAt]);

  const handleSaveApiKey = async () => {
    await setOpenAIKey(apiKeyInput.trim() || null);
    settings.setApiKeySavedAt(Date.now());
    setApiKeyInput('');
    setHasStoredKey(Boolean(apiKeyInput.trim()));
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset onboarding',
      'You will see the onboarding flow again next time you open the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            useUserStore.getState().resetOnboarding();
            router.replace('/(modals)/onboarding');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear all data?',
      'This will delete everything: journal, conversations, circle, progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you really sure?',
              'This will delete all your data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, clear everything',
                  style: 'destructive',
                  onPress: () => {
                    useJournalStore.setState({ entries: [] });
                    useConversationStore.getState().clearMessages();
                    useCircleStore.getState().clearDemoData();
                    useCircleStore.setState({ moodHistory: [] });
                    useEducationStore.setState({
                      completedLessons: [],
                      streakDays: 0,
                      lastLessonDate: null,
                    });
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const toggleEntry = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };

  const formatEntryDate = (d: Date) => {
    return new Date(d).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const moodEmoji = (mood?: string) => {
    if (!mood) return null;
    const e: Record<string, string> = { green: '😊', yellow: '😐', orange: '😟', red: '😢' };
    return e[mood] ?? null;
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={styles.profile}>
        <Text style={styles.profileName}>{user.name || 'You'}</Text>
        {user.pronouns && <Text style={styles.pronouns}>{user.pronouns}</Text>}
        <View style={styles.badges}>
          {user.ageGroup && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{AGE_LABELS[user.ageGroup] ?? user.ageGroup}</Text>
            </View>
          )}
          <View style={styles.badgeIcon}>
            <Ionicons
              name={user.communicationPreference === 'text' ? 'keyboard-outline' : 'mic-outline'}
              size={16}
              color={COLORS.textMuted}
            />
          </View>
        </View>
        {user.loveLanguage && (
          <Text style={styles.loveLang}>
            {LOVE_LANG_LABELS[user.loveLanguage] ?? user.loveLanguage}
          </Text>
        )}
        <Pressable style={styles.editButton} onPress={() => router.push('/(modals)/onboarding')}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />

      {/* Journal */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Journal</Text>
          <Pressable onPress={() => router.push('/(modals)/new-journal')}>
            <Text style={styles.addButtonText}>New Entry +</Text>
          </Pressable>
        </View>
        {recentEntries.length === 0 ? (
          <Text style={styles.emptyText}>
            Your journal is empty. Start writing — or just talk on the Talk tab and your conversations will appear here.
          </Text>
        ) : (
          <View style={styles.entryList}>
            {recentEntries.map((e) => {
              const expanded = expandedEntryId === e.id;
              const preview = e.content.split('\n').slice(0, 2).join(' ').slice(0, 80);
              return (
                <Pressable key={e.id} style={styles.entryCard} onPress={() => toggleEntry(e.id)}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{formatEntryDate(e.createdAt)}</Text>
                    {e.mood && <Text style={styles.entryMood}>{moodEmoji(e.mood)}</Text>}
                  </View>
                  <Text style={styles.entryPreview} numberOfLines={expanded ? undefined : 2}>
                    {expanded ? e.content : preview + (e.content.length > 80 ? '…' : '')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Weekly insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        {moodTrend.length === 0 && conversationCount === 0 && lessonsCount === 0 ? (
          <Text style={styles.insightPlaceholder}>
            Keep checking in and I'll share insights about your patterns here.
          </Text>
        ) : (
          <View style={styles.insightCard}>
            {moodTrend.length > 0 && (
              <>
                <Text style={styles.insightLabel}>Mood trend</Text>
                <Text style={styles.insightValue}>{moodTrend.map((m) => m.mood).join(' → ')}</Text>
              </>
            )}
            {mostCommonMood && (
              <Text style={styles.insightLabel}>Most common mood: {mostCommonMood}</Text>
            )}
            {streak > 0 && (
              <Text style={styles.insightStreak}>You've checked in {streak} days in a row</Text>
            )}
            <Text style={styles.insightText}>Conversations with Psych: {conversationCount}</Text>
            <Text style={styles.insightText}>Lessons completed: {lessonsCount}</Text>
          </View>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementScroll}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={[styles.achievementBadge, !a.unlocked && styles.achievementLocked]}
            >
              <Text style={styles.achievementEmoji}>{a.emoji}</Text>
              <Text style={[styles.achievementTitle, !a.unlocked && styles.achievementTitleLocked]} numberOfLines={1}>
                {a.title}
              </Text>
              {!a.unlocked && <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} style={styles.achievementLock} />}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily check-in reminders</Text>
            <Switch
              value={settings.notificationsCheckIn}
              onValueChange={settings.setNotificationsCheckIn}
              trackColor={{ false: COLORS.surface, true: COLORS.accentMuted }}
              thumbColor={COLORS.text}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Circle nudges</Text>
            <Switch
              value={settings.notificationsCircleNudges}
              onValueChange={settings.setNotificationsCircleNudges}
              trackColor={{ false: COLORS.surface, true: COLORS.accentMuted }}
              thumbColor={COLORS.text}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voice preference</Text>
            <Pressable
              style={styles.settingValue}
              onPress={() => settings.setVoicePreference(settings.voicePreference === 'voice' ? 'text' : 'voice')}
            >
              <Text style={styles.settingValueText}>
                {settings.voicePreference === 'voice' ? 'Voice first' : 'Text first'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Pause circle sharing</Text>
            <Switch
              value={settings.circleSharingPaused}
              onValueChange={settings.setCircleSharingPaused}
              trackColor={{ false: COLORS.surface, true: COLORS.accentMuted }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingLabel}>API Keys</Text>
          <Text style={styles.settingHint}>Get your API key at platform.openai.com/api-keys</Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={styles.apiKeyInput}
              placeholder={hasStoredKey ? "••••••••••••" : "Paste your OpenAI API key"}
              placeholderTextColor={COLORS.textMuted}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={!apiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setApiKeyVisible(!apiKeyVisible)} style={styles.eyeButton}>
              <Ionicons name={apiKeyVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.textMuted} />
            </Pressable>
          </View>
          <Pressable style={styles.saveKeyButton} onPress={handleSaveApiKey}>
            <Text style={styles.saveKeyButtonText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark mode</Text>
            <Text style={styles.settingMuted}>Always on for now</Text>
          </View>
          <Pressable style={styles.settingRow} onPress={handleResetOnboarding}>
            <Text style={styles.settingLabel}>Reset onboarding</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable style={styles.settingRow} onPress={handleClearAllData}>
            <Text style={[styles.settingLabel, styles.settingDanger]}>Clear all data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable
            style={styles.settingRow}
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/sign-in');
            }}
          >
            <Text style={styles.settingLabel}>Sign out</Text>
            <Ionicons name="log-out-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.settingLabel}>About</Text>
              <Text style={styles.settingMuted}>AllN1 Psych · AllN1 Network LLC · v{APP_VERSION}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Crisis resources */}
      <View style={styles.crisis}>
        <Text style={styles.crisisTitle}>Need help now?</Text>
        <Pressable onPress={() => Linking.openURL('tel:988')}>
          <Text style={styles.crisisLink}>988 Suicide & Crisis Lifeline</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('sms:741741?body=HOME')}>
          <Text style={styles.crisisLink}>Crisis Text Line — text HOME to 741741</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  profile: {
    paddingVertical: 24,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  pronouns: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  badgeIcon: {
    padding: 4,
  },
  loveLang: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surface,
    marginBottom: 24,
  },
  section: { marginBottom: 28 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  entryList: { gap: 10 },
  entryCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  entryMood: { fontSize: 16 },
  entryPreview: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  insightPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  insightCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
  },
  insightLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
  },
  insightStreak: {
    fontSize: 15,
    color: COLORS.accent,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  achievementBadge: {
    width: 100,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  achievementLocked: {
    borderColor: 'transparent',
    opacity: 0.7,
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: COLORS.textMuted,
  },
  achievementLock: {
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surface,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  settingMuted: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  settingDanger: {
    color: COLORS.recording,
  },
  settingHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  apiKeyInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.input,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 8,
  },
  saveKeyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
  },
  saveKeyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  crisis: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  crisisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  crisisLink: {
    fontSize: 15,
    color: COLORS.accent,
    marginBottom: 6,
  },
});
