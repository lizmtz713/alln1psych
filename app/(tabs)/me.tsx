import { useState, useEffect, useRef } from 'react';
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
  Animated,
  RefreshControl,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useAuth } from '../../src/providers/AuthProvider';
import { useUserStore } from '../../src/stores/userStore';
import { registerForPushNotifications } from '../../src/services/notifications';
import { useJournalStore } from '../../src/stores/journalStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { getOpenAIKey, setOpenAIKey } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useRolePlayStore } from '../../src/stores/rolePlayStore';
import { useHelpSomeoneStore } from '../../src/stores/helpSomeoneStore';
import { useConversationSummaryStore, type ConversationSummary } from '../../src/stores/conversationSummaryStore';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useGratitudeStore } from '../../src/stores/gratitudeStore';
import { getRelevantResources } from '../../src/lib/culturalResources';
import {
  CULTURAL_BACKGROUND_OPTIONS,
  ENVIRONMENT_UPBRINGING_OPTIONS,
  CULTURAL_VALUES_OPTIONS,
} from '../../src/lib/culturalOptions';
import { AchievementBadge } from '../../src/components/AchievementBadge';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/sensitiveTopics';
import type { EmergencyContact, AthleteModeSettings, SpectrumModeSettings, SportType } from '../../src/stores/userStore';
import { supabase } from '../../src/lib/supabase';
import { deleteUserData } from '../../src/services/database';
import {
  buildExportData,
  shareExportFile,
  buildTherapistSummary,
  type ExportRange,
} from '../../src/services/exportData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
  const {
    setSensitiveTopics,
    setEmergencyContacts,
    setCulturalBackground,
    setEnvironmentUpbringing,
    setCulturalValues,
    culturalBackgroundOther,
    setCulturalBackgroundOther,
    birthday,
    setBirthday,
    // Specialized modes
    athleteMode,
    setAthleteMode,
    athleteModeSettings,
    setAthleteModeSettings,
    spectrumMode,
    setSpectrumMode,
    spectrumModeSettings,
    setSpectrumModeSettings,
  } = useUserStore();
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
  const pastRolePlays = useRolePlayStore((s) => s.pastSessions);
  const helpSomeoneSessions = useHelpSomeoneStore((s) => s.sessions);
  const culturalBackground = useUserStore((s) => s.culturalBackground) ?? [];
  const sensitiveTopics = useUserStore((s) => s.sensitiveTopics) ?? [];
  const showLGBTQCrisis = sensitiveTopics.includes('gender-identity-dysphoria') || sensitiveTopics.includes('coming-out');
  const crisisResources = getRelevantResources(culturalBackground);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedPracticeId, setExpandedPracticeId] = useState<string | null>(null);
  const [expandedHelpSessionId, setExpandedHelpSessionId] = useState<string | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
  const [conversationSearch, setConversationSearch] = useState('');
  const [conversationEmotionFilter, setConversationEmotionFilter] = useState<string | null>(null);
  const summaries = useConversationSummaryStore((s) => s.getSummaries());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [toast, setToast] = useState<{ title: string; emoji: string } | null>(null);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [showAthleteModeModal, setShowAthleteModeModal] = useState(false);
  const [showSpectrumModeModal, setShowSpectrumModeModal] = useState(false);
  const [editingContacts, setEditingContacts] = useState<EmergencyContact[]>([]);
  const [contactsEditing, setContactsEditing] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [birthdayInput, setBirthdayInput] = useState('');
  const prevUnlockedIds = useRef<Set<string>>(new Set());

  const LEGAL_DISCLAIMER =
    'AllN1 Psych is an emotional wellness tool, not a medical device. It does not diagnose, treat, or cure any mental health condition. If you are in crisis, please contact 988 (Suicide & Crisis Lifeline), text HOME to 741741, or call 911. By using this app, you agree to our Terms of Service and Privacy Policy.';
  const DATA_RETENTION_NOTICE =
    'Your conversations and data are stored securely and encrypted. Only you can access your personal data. We never sell individual data. You can export or delete your data anytime from Settings.';
  const TERMS_URL = 'https://alln1network.com/terms';
  const PRIVACY_URL = 'https://alln1network.com/privacy';

  const recentEntries = getRecentEntries(20);
  const achievements = getAchievements();
  const unlockedIds = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id));

  useEffect(() => {
    const nextIds = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id));
    const prev = prevUnlockedIds.current;
    const newlyUnlocked = achievements.find((a) => a.unlocked && !prev.has(a.id));
    if (newlyUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToast({ title: newlyUnlocked.title, emoji: newlyUnlocked.emoji });
      prevUnlockedIds.current = nextIds;
    }
    prevUnlockedIds.current = nextIds;
  }, [achievements]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  };
  const moodTrend = getWeeklyMoodTrend();
  const streak = getCheckInStreak();
  const conversationCount = getConversationCountThisWeek();
  const lessonsCount = getLessonsCompletedThisWeek();
  const mostCommonMood = getMostCommonMoodThisWeek();

  const filteredSummaries = (() => {
    let list = summaries;
    const q = conversationSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
      );
    }
    if (conversationEmotionFilter) {
      list = list.filter((s) =>
        s.emotions.some((e) => e.toLowerCase() === conversationEmotionFilter.toLowerCase())
      );
    }
    return list;
  })();

  const allEmotions = Array.from(
    new Set(summaries.flatMap((s) => s.emotions).filter(Boolean).map((e) => e.trim()))
  ).slice(0, 12);

  function groupSummariesByDate(list: ConversationSummary[]): { label: string; items: ConversationSummary[] }[] {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    const groups: { label: string; items: ConversationSummary[] }[] = [];
    const today: ConversationSummary[] = [];
    const yesterday: ConversationSummary[] = [];
    const thisWeek: ConversationSummary[] = [];
    const older: ConversationSummary[] = [];
    list.forEach((s) => {
      const t = new Date(s.createdAt).getTime();
      if (t >= todayStart) today.push(s);
      else if (t >= yesterdayStart) yesterday.push(s);
      else if (t >= weekStart) thisWeek.push(s);
      else older.push(s);
    });
    if (today.length) groups.push({ label: 'Today', items: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
    if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
    if (older.length) groups.push({ label: 'Earlier', items: older });
    return groups;
  }
  const summaryGroups = groupSummariesByDate(filteredSummaries);

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
                    useConversationSummaryStore.getState().clearSummaries();
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

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete ALL your data including conversations, journal entries, mood history, circle connections, and your profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, continue',
          style: 'destructive',
          onPress: () => {
            setDeleteConfirmText('');
            setShowDeleteConfirmModal(true);
          },
        },
      ]
    );
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setShowDeleteConfirmModal(false);
    setDeleteConfirmText('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (userId) {
        const { error } = await deleteUserData(userId);
        if (error) throw error;
      }
      useUserStore.getState().reset();
      useConversationStore.getState().reset();
      useCircleStore.getState().reset();
      useEducationStore.getState().reset();
      useJournalStore.getState().reset();
      useInsightsStore.getState().reset();
      useConversationSummaryStore.getState().reset();
      useRolePlayStore.getState().reset();
      useSettingsStore.getState().reset();
      useEngagementStore.getState().reset();
      useDailyContentStore.getState().reset();
      useAuthStore.getState().reset();
      useGratitudeStore.getState().reset();
      useHelpSomeoneStore.getState().reset();
      await supabase.auth.signOut();
      router.replace('/(auth)/sign-in');
      Alert.alert('Account deleted', 'All your data has been permanently removed.');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again or contact support.');
    }
  };

  const handleExportData = async (range: ExportRange) => {
    try {
      const data = buildExportData(range);
      const label = range === '7' ? '7days' : range === '30' ? '30days' : 'all';
      await shareExportFile(data, `alln1-psych-export-${label}.json`);
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Could not export. Try again.');
    }
  };

  const handleShareWithTherapist = async () => {
    try {
      const data = buildExportData('all');
      const text = buildTherapistSummary(data);
      const path = `${FileSystem.documentDirectory}alln1-psych-therapist-summary.txt`;
      await FileSystem.writeAsStringAsync(path, text, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) throw new Error('Sharing is not available');
      await Sharing.shareAsync(path, {
        mimeType: 'text/plain',
        dialogTitle: 'Share with my therapist',
      });
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : 'Could not create summary.');
    }
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
    <ErrorBoundary>
    <>
    {toast && (
      <View style={[styles.toast, { top: insets.top + 10 }]} pointerEvents="none">
        <Text style={styles.toastText}>{toast.emoji} Achievement unlocked: {toast.title}!</Text>
      </View>
    )}
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
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
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Birthday (for Circle relationship insights)</Text>
          <TextInput
            style={{ backgroundColor: COLORS.inputSurface, borderRadius: BORDER_RADIUS.input, padding: 12, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={COLORS.textMuted}
            value={birthdayInput || (birthday ? (() => { const d = new Date(birthday); const m = (d.getMonth() + 1).toString().padStart(2, '0'); const day = d.getDate().toString().padStart(2, '0'); const y = d.getFullYear(); return `${m}/${day}/${y}`; })() : '')}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, '');
              if (cleaned.length <= 2) setBirthdayInput(cleaned);
              else if (cleaned.length <= 4) setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
              else setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
              if (cleaned.length === 0) setBirthday(null);
              else if (cleaned.length >= 8) {
                const mm = cleaned.slice(0, 2), dd = cleaned.slice(2, 4), yyyy = cleaned.slice(4, 8);
                setBirthday(`${yyyy}-${mm}-${dd}`);
              }
            }}
            onBlur={() => setBirthdayInput('')}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Pressable style={styles.editButton} onPress={() => router.push('/(modals)/onboarding')}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.editButton} onPress={() => router.push('/(modals)/identity-setup')}>
            <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: '500' }}>Update My Profile</Text>
          </Pressable>
        </View>
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

      {/* Conversation History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Conversation History</Text>
        <TextInput
          style={styles.conversationSearchInput}
          placeholder="Search your conversations"
          placeholderTextColor={COLORS.textMuted}
          value={conversationSearch}
          onChangeText={setConversationSearch}
        />
        {allEmotions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emotionFilterScroll}
            style={styles.emotionFilterScrollView}
          >
            <Pressable
              style={[styles.emotionChip, !conversationEmotionFilter && styles.emotionChipSelected]}
              onPress={() => setConversationEmotionFilter(null)}
            >
              <Text style={[styles.emotionChipText, !conversationEmotionFilter && styles.emotionChipTextSelected]}>
                All
              </Text>
            </Pressable>
            {allEmotions.map((em) => (
              <Pressable
                key={em}
                style={[styles.emotionChip, conversationEmotionFilter === em.toLowerCase() && styles.emotionChipSelected]}
                onPress={() => setConversationEmotionFilter(conversationEmotionFilter === em.toLowerCase() ? null : em.toLowerCase())}
              >
                <Text
                  style={[
                    styles.emotionChipText,
                    conversationEmotionFilter === em.toLowerCase() && styles.emotionChipTextSelected,
                  ]}
                >
                  {em}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {summaryGroups.length === 0 ? (
          <Text style={styles.emptyText}>
            After you talk with Psych, short summaries will appear here. Have 3+ messages and leave the Talk tab or tap "End conversation" to save.
          </Text>
        ) : (
          summaryGroups.map((group) => (
            <View key={group.label} style={styles.summaryGroup}>
              <Text style={styles.summaryGroupLabel}>{group.label}</Text>
              {group.items.map((s) => {
                const expanded = expandedSummaryId === s.id;
                const timeStr = new Date(s.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                return (
                  <View key={s.id} style={styles.summaryCard}>
                    <Pressable onPress={() => setExpandedSummaryId(expanded ? null : s.id)}>
                      <Text style={styles.summaryTitle}>«{s.title}» — {timeStr}</Text>
                      <Text style={styles.summaryPreview} numberOfLines={2}>{s.summary}</Text>
                    </Pressable>
                    {expanded && (
                      <View style={styles.summaryExpanded}>
                        <Text style={styles.summaryFullText}>{s.summary}</Text>
                        {s.emotions.length > 0 && (
                          <View style={styles.summaryChipsRow}>
                            <Text style={styles.summaryChipsLabel}>Emotions: </Text>
                            {s.emotions.map((e, i) => (
                              <View key={i} style={styles.summaryChip}>
                                <Text style={styles.summaryChipText}>{e}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {s.triggers.length > 0 && (
                          <View style={styles.summaryChipsRow}>
                            <Text style={styles.summaryChipsLabel}>Triggers: </Text>
                            {s.triggers.map((t, i) => (
                              <View key={i} style={styles.summaryChip}>
                                <Text style={styles.summaryChipText}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {s.insights ? (
                          <View style={styles.insightBlock}>
                            <Text style={styles.insightBlockLabel}>Insight</Text>
                            <Text style={styles.insightBlockText}>{s.insights}</Text>
                          </View>
                        ) : null}
                        {s.followUp ? (
                          <View style={styles.insightBlock}>
                            <Text style={styles.insightBlockLabel}>Follow-up</Text>
                            <Text style={styles.insightBlockText}>{s.followUp}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
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

      {/* Practice History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice History</Text>
        {pastRolePlays.length === 0 ? (
          <Text style={styles.emptyText}>
            Practice difficult conversations here. Start from Home — "Practice a conversation."
          </Text>
        ) : (
          <View style={styles.entryList}>
            {[...pastRolePlays].reverse().map((session) => {
              const expanded = expandedPracticeId === session.id;
              return (
                <View key={session.id} style={styles.entryCard}>
                  <Pressable onPress={() => setExpandedPracticeId(expanded ? null : session.id)}>
                    <Text style={styles.entryPreview} numberOfLines={2}>{session.scenario}</Text>
                    <Text style={styles.entryDate}>
                      {new Date(session.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </Text>
                  </Pressable>
                  {expanded && (
                    <View style={styles.practiceExpanded}>
                      {session.messages.map((m, i) => (
                        <View key={i} style={styles.practiceBubbleWrap}>
                          <Text style={styles.practiceBubbleLabel}>{m.role === 'user' ? 'You' : session.character}</Text>
                          <Text style={styles.practiceBubbleText}>{m.content}</Text>
                        </View>
                      ))}
                      {session.debrief && (
                        <View style={styles.debriefBlock}>
                          <Text style={styles.debriefLabel}>Debrief</Text>
                          <Text style={styles.debriefText}>{session.debrief}</Text>
                        </View>
                      )}
                      <Pressable
                        style={styles.practiceAgainButton}
                        onPress={() => {
                          router.push({
                            pathname: '/(modals)/role-play',
                            params: {
                              scenario: session.scenario,
                              character: session.character,
                              difficulty: session.difficulty,
                            },
                          });
                        }}
                      >
                        <Text style={styles.practiceAgainButtonText}>Practice Again</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Help Someone History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help Someone History</Text>
        {helpSomeoneSessions.length === 0 ? (
          <Text style={styles.emptyText}>
            When you use "Help Someone" from Home or Circle, your coaching sessions and action plans will appear here.
          </Text>
        ) : (
          <View style={styles.entryList}>
            {helpSomeoneSessions.map((session) => {
              const expanded = expandedHelpSessionId === session.id;
              return (
                <View key={session.id} style={styles.entryCard}>
                  <Pressable onPress={() => setExpandedHelpSessionId(expanded ? null : session.id)}>
                    <Text style={styles.entryPreview} numberOfLines={2}>
                      {session.personName} · {session.relationship}
                    </Text>
                    <Text style={styles.entryDate}>
                      {new Date(session.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </Text>
                    {session.situation ? (
                      <Text style={styles.helpSomeoneSituation} numberOfLines={1}>{session.situation}</Text>
                    ) : null}
                  </Pressable>
                  {expanded && (
                    <View style={styles.practiceExpanded}>
                      {session.actionPlan && (
                        <View style={styles.debriefBlock}>
                          <Text style={styles.debriefLabel}>Action plan</Text>
                          <Text style={styles.debriefText}>{session.actionPlan}</Text>
                        </View>
                      )}
                      {session.messages.length > 0 && (
                        <>
                          <Text style={styles.debriefLabel}>Conversation</Text>
                          {session.messages.map((m, i) => (
                            <View key={i} style={styles.practiceBubbleWrap}>
                              <Text style={styles.practiceBubbleLabel}>{m.role === 'user' ? 'You' : 'Psych'}</Text>
                              <Text style={styles.practiceBubbleText}>{m.content}</Text>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementScroll}>
          {achievements.map((a, i) => (
            <Pressable
              key={a.id}
              onPress={() =>
                Alert.alert(
                  `${a.emoji} ${a.title}`,
                  a.description + (a.unlocked ? '\n\n✓ Earned!' : '\n\nKeep going to unlock.'),
                  [{ text: 'OK' }]
                )
              }
            >
              <AchievementBadge achievement={a} index={i} />
            </Pressable>
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
              onValueChange={async (v) => {
                if (v) await registerForPushNotifications();
                settings.setNotificationsCheckIn(v);
              }}
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
          <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.settingLabel}>AI Voice</Text>
              <Switch
                value={settings.aiVoiceEnabled}
                onValueChange={settings.setAiVoiceEnabled}
                trackColor={{ false: COLORS.surface, true: COLORS.accentMuted }}
                thumbColor={COLORS.text}
              />
            </View>
            <Text style={[styles.settingHint, { marginTop: 4 }]}>When on, AI responds with voice (TTS). Off = text only.</Text>
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
          <Pressable style={styles.settingRow} onPress={() => setShowSensitiveModal(true)}>
            <Text style={styles.settingLabel}>Sensitive topics</Text>
            <Text style={styles.settingMuted}>
              {user.sensitiveTopics?.length ? `${user.sensitiveTopics.length} selected` : 'None'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable style={styles.settingRow} onPress={() => setShowCulturalModal(true)}>
            <Text style={styles.settingLabel}>Cultural context</Text>
            <Text style={styles.settingMuted}>
              {((user.culturalBackground?.length ?? 0) + (user.environmentUpbringing?.length ?? 0) + (user.culturalValues?.length ?? 0)) > 0
                ? 'Set'
                : 'Not set'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingLabel}>Emergency contacts</Text>
          <Text style={styles.settingHint}>Add up to 3 people Psych can help you reach in a crisis.</Text>
          {[0, 1, 2].map((i) => {
            const contacts = contactsEditing ? editingContacts : user.emergencyContacts;
            const c = contacts[i] ?? { name: '', phone: '' };
            return (
              <View key={i} style={styles.emergencyRow}>
                <TextInput
                  style={[styles.input, styles.emergencyInput]}
                  placeholder="Name"
                  placeholderTextColor={COLORS.textMuted}
                  value={contactsEditing ? editingContacts[i]?.name ?? '' : c.name}
                  onChangeText={(t) => {
                    const base = contactsEditing ? [...editingContacts] : [...user.emergencyContacts];
                    while (base.length < 3) base.push({ name: '', phone: '' });
                    base[i] = { ...(base[i] ?? { name: '', phone: '' }), name: t };
                    setEditingContacts(base);
                    setContactsEditing(true);
                  }}
                />
                <TextInput
                  style={[styles.input, styles.emergencyInput]}
                  placeholder="Phone"
                  placeholderTextColor={COLORS.textMuted}
                  value={contactsEditing ? editingContacts[i]?.phone ?? '' : c.phone}
                  keyboardType="phone-pad"
                  onChangeText={(t) => {
                    const base = contactsEditing ? [...editingContacts] : [...user.emergencyContacts];
                    while (base.length < 3) base.push({ name: '', phone: '' });
                    base[i] = { ...(base[i] ?? { name: '', phone: '' }), phone: t };
                    setEditingContacts(base);
                    setContactsEditing(true);
                  }}
                />
              </View>
            );
          })}
          {contactsEditing && (
            <Pressable
              style={styles.saveKeyButton}
              onPress={() => {
                const base = editingContacts.length ? editingContacts : user.emergencyContacts;
                const kept = base.filter((c) => c.name.trim() || c.phone.trim());
                setEmergencyContacts(kept.map((c) => ({ name: c.name.trim(), phone: c.phone.trim().replace(/\D/g, '') })));
                setContactsEditing(false);
                setEditingContacts([]);
              }}
            >
              <Text style={styles.saveKeyButtonText}>Save contacts</Text>
            </Pressable>
          )}
        </View>

        <Modal visible={showSensitiveModal} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowSensitiveModal(false)}>
            <Pressable style={styles.sensitiveModalCard} onPress={() => {}}>
              <Text style={styles.sensitiveModalTitle}>Sensitive topics</Text>
              <Text style={styles.settingHint}>This helps Psych communicate with extra care. Optional — skip any you're not ready to share.</Text>
              <ScrollView style={styles.sensitiveChipScroll}>
                <View style={styles.chipRow}>
                  {SENSITIVE_TOPIC_OPTIONS.map((opt) => {
                    const isNone = opt.value === 'none';
                    const isSelected = isNone ? !user.sensitiveTopics?.length : user.sensitiveTopics?.includes(opt.value);
                    const toggle = () => {
                      if (isNone) setSensitiveTopics([]);
                      else if (user.sensitiveTopics?.includes(opt.value))
                        setSensitiveTopics(user.sensitiveTopics.filter((t) => t !== opt.value));
                      else setSensitiveTopics([...(user.sensitiveTopics || []).filter((t) => t !== 'none'), opt.value]);
                    };
                    return (
                      <Pressable key={opt.value} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              <Pressable style={styles.primaryButton} onPress={() => setShowSensitiveModal(false)}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={showCulturalModal} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowCulturalModal(false)}>
            <Pressable style={styles.sensitiveModalCard} onPress={() => {}}>
              <Text style={styles.sensitiveModalTitle}>Cultural context</Text>
              <Text style={styles.settingHint}>This helps Psych understand your world better. You can change this anytime.</Text>
              <ScrollView style={styles.sensitiveChipScroll}>
                <Text style={styles.smallLabel}>Which of these feel like part of your identity?</Text>
                <View style={styles.chipRow}>
                  {CULTURAL_BACKGROUND_OPTIONS.map((opt) => {
                    const isSelected = (user.culturalBackground ?? []).includes(opt);
                    const toggle = () => {
                      if (isSelected) setCulturalBackground((user.culturalBackground ?? []).filter((c) => c !== opt));
                      else setCulturalBackground([...(user.culturalBackground ?? []), opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.smallLabel}>What shaped how you grew up?</Text>
                <View style={styles.chipRow}>
                  {ENVIRONMENT_UPBRINGING_OPTIONS.map((opt) => {
                    const isSelected = (user.environmentUpbringing ?? []).includes(opt);
                    const toggle = () => {
                      if (isSelected) setEnvironmentUpbringing((user.environmentUpbringing ?? []).filter((e) => e !== opt));
                      else setEnvironmentUpbringing([...(user.environmentUpbringing ?? []), opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.smallLabel}>Which of these matter in your world?</Text>
                <View style={styles.chipRow}>
                  {CULTURAL_VALUES_OPTIONS.map((opt) => {
                    const isSelected = (user.culturalValues ?? []).includes(opt);
                    const toggle = () => {
                      if (isSelected) setCulturalValues((user.culturalValues ?? []).filter((v) => v !== opt));
                      else setCulturalValues([...(user.culturalValues ?? []), opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {(user.culturalBackground ?? []).includes('Other') && (
                  <TextInput
                    style={[styles.input, styles.inputMargin]}
                    placeholder="Describe (e.g. Southeast Asian, biracial...)"
                    placeholderTextColor={COLORS.textMuted}
                    value={culturalBackgroundOther ?? ''}
                    onChangeText={setCulturalBackgroundOther}
                  />
                )}
              </ScrollView>
              <Pressable style={styles.primaryButton} onPress={() => setShowCulturalModal(false)}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Specialized Modes */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Specialized Modes</Text>
          <Text style={styles.settingHint}>
            These modes adapt Psych's language, insights, and tools to your specific needs.
          </Text>

          {/* Athlete Mode */}
          <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>🏆</Text>
                <Text style={styles.settingLabel}>Athlete Mode</Text>
              </View>
              <Switch
                value={athleteMode}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAthleteMode(v);
                }}
                trackColor={{ false: COLORS.surface, true: '#00BFA5' }}
                thumbColor={COLORS.text}
              />
            </View>
            <Text style={[styles.settingHint, { marginTop: 4 }]}>
              Adapts gauges for athletic performance: recovery metrics, competition prep, team dynamics, performance psychology.
            </Text>
            {athleteMode && (
              <Pressable
                style={[styles.saveKeyButton, { marginTop: 8, backgroundColor: '#00BFA5' }]}
                onPress={() => setShowAthleteModeModal(true)}
              >
                <Text style={styles.saveKeyButtonText}>Configure Athlete Mode</Text>
              </Pressable>
            )}
          </View>

          {/* Spectrum/Accessibility Mode */}
          <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'stretch', borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>🌈</Text>
                <Text style={styles.settingLabel}>Spectrum Mode</Text>
              </View>
              <Switch
                value={spectrumMode}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSpectrumMode(v);
                }}
                trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                thumbColor={COLORS.text}
              />
            </View>
            <Text style={[styles.settingHint, { marginTop: 4 }]}>
              Accessibility adaptations for neurodivergent users (autism, ADHD) and disabilities: clearer language, sensory tools, picture emotions, stimming toolkit.
            </Text>
            {spectrumMode && (
              <Pressable
                style={[styles.saveKeyButton, { marginTop: 8, backgroundColor: '#64B5F6' }]}
                onPress={() => setShowSpectrumModeModal(true)}
              >
                <Text style={styles.saveKeyButtonText}>Configure Spectrum Mode</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Athlete Mode Settings Modal */}
        <Modal visible={showAthleteModeModal} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowAthleteModeModal(false)}>
            <Pressable style={styles.sensitiveModalCard} onPress={() => {}}>
              <Text style={styles.sensitiveModalTitle}>🏆 Athlete Mode Settings</Text>
              <Text style={styles.settingHint}>Customize how Psych adapts to your athletic life.</Text>
              <ScrollView style={styles.sensitiveChipScroll}>
                <Text style={styles.smallLabel}>What type of sport?</Text>
                <View style={styles.chipRow}>
                  {[
                    { value: 'team', label: 'Team Sport' },
                    { value: 'individual', label: 'Individual Sport' },
                    { value: 'endurance', label: 'Endurance' },
                    { value: 'power', label: 'Power/Strength' },
                    { value: 'mixed', label: 'Mixed/Combat' },
                  ].map((opt) => {
                    const isSelected = athleteModeSettings?.sportType === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => setAthleteModeSettings({ sportType: opt.value as SportType })}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.smallLabel, { marginTop: 16 }]}>Features</Text>
                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Recovery Focus</Text>
                  <Switch
                    value={athleteModeSettings?.recoveryFocus ?? true}
                    onValueChange={(v) => setAthleteModeSettings({ recoveryFocus: v })}
                    trackColor={{ false: COLORS.surface, true: '#00BFA5' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Track sleep, soreness, and recovery metrics.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Performance Psychology</Text>
                  <Switch
                    value={athleteModeSettings?.performancePsych ?? true}
                    onValueChange={(v) => setAthleteModeSettings({ performancePsych: v })}
                    trackColor={{ false: COLORS.surface, true: '#00BFA5' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Sport-specific mental skills and insights.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Training Load Tracking</Text>
                  <Switch
                    value={athleteModeSettings?.trackTrainingLoad ?? true}
                    onValueChange={(v) => setAthleteModeSettings({ trackTrainingLoad: v })}
                    trackColor={{ false: COLORS.surface, true: '#00BFA5' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Monitor training volume and intensity.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Competition Mode</Text>
                  <Switch
                    value={athleteModeSettings?.competitionMode ?? false}
                    onValueChange={(v) => setAthleteModeSettings({ competitionMode: v })}
                    trackColor={{ false: COLORS.surface, true: '#00BFA5' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Enable when actively competing — pre/post-game support.</Text>
              </ScrollView>
              <Pressable style={[styles.primaryButton, { backgroundColor: '#00BFA5' }]} onPress={() => setShowAthleteModeModal(false)}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Spectrum Mode Settings Modal */}
        <Modal visible={showSpectrumModeModal} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowSpectrumModeModal(false)}>
            <Pressable style={styles.sensitiveModalCard} onPress={() => {}}>
              <Text style={styles.sensitiveModalTitle}>🌈 Spectrum Mode Settings</Text>
              <Text style={styles.settingHint}>Choose the accommodations that help you most.</Text>
              <ScrollView style={styles.sensitiveChipScroll}>
                <Text style={styles.smallLabel}>Communication</Text>
                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Clear, Literal Language</Text>
                  <Switch
                    value={spectrumModeSettings?.literalLanguage ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ literalLanguage: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Less metaphor, more direct language.</Text>

                <Text style={[styles.smallLabel, { marginTop: 16 }]}>Sensory & UI</Text>
                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Reduced Animations</Text>
                  <Switch
                    value={spectrumModeSettings?.reducedAnimations ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ reducedAnimations: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Muted Colors</Text>
                  <Switch
                    value={spectrumModeSettings?.mutedColors ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ mutedColors: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Softer, less saturated colors.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Sensory Tracking</Text>
                  <Switch
                    value={spectrumModeSettings?.sensoryTracking ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ sensoryTracking: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Track sensory inputs in body check-ins.</Text>

                <Text style={[styles.smallLabel, { marginTop: 16 }]}>Check-in Style</Text>
                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Simplified Check-in</Text>
                  <Switch
                    value={spectrumModeSettings?.simplifiedCheckin ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ simplifiedCheckin: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Fewer steps in check-in flow.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Picture-Based Emotions</Text>
                  <Switch
                    value={spectrumModeSettings?.pictureEmotions ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ pictureEmotions: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Use images for emotion selection.</Text>

                <Text style={[styles.smallLabel, { marginTop: 16 }]}>Specific Support</Text>
                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>ADHD Features</Text>
                  <Switch
                    value={spectrumModeSettings?.adhdFeatures ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ adhdFeatures: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Shorter interactions, body doubling, time management support.</Text>

                <View style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                  <Text style={styles.settingLabel}>Autism Features</Text>
                  <Switch
                    value={spectrumModeSettings?.autismFeatures ?? false}
                    onValueChange={(v) => setSpectrumModeSettings({ autismFeatures: v })}
                    trackColor={{ false: COLORS.surface, true: '#64B5F6' }}
                    thumbColor={COLORS.text}
                  />
                </View>
                <Text style={[styles.settingHint, { marginTop: -4, marginBottom: 8 }]}>Social scripts, routine support, sensory tools.</Text>
              </ScrollView>
              <Pressable style={[styles.primaryButton, { backgroundColor: '#64B5F6' }]} onPress={() => setShowSpectrumModeModal(false)}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

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
          {__DEV__ && (
          <Pressable style={styles.settingRow} onPress={handleResetOnboarding}>
            <Text style={styles.settingLabel}>Reset onboarding</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
          )}
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
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingLabel}>Your Data</Text>
          <Text style={styles.settingHint}>{DATA_RETENTION_NOTICE}</Text>
        </View>

        <View style={styles.settingsCard}>
          <Pressable
            style={styles.settingRow}
            onPress={() =>
              Alert.alert('Export My Data', 'Choose date range', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Last 7 days', onPress: () => handleExportData('7') },
                { text: 'Last 30 days', onPress: () => handleExportData('30') },
                { text: 'All time', onPress: () => handleExportData('all') },
                {
                  text: 'Share with my therapist',
                  onPress: () => handleShareWithTherapist(),
                },
              ])
            }
          >
            <Text style={styles.settingLabel}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Pressable style={styles.settingRow} onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable style={styles.settingRow} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable
            style={styles.settingRow}
            onPress={() => Alert.alert('Disclaimer', LEGAL_DISCLAIMER, [{ text: 'OK' }])}
          >
            <Text style={styles.settingLabel}>Disclaimer</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingMuted}>AllN1 Psych v{APP_VERSION}</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Pressable style={styles.settingRow} onPress={handleDeleteAccountPress}>
            <Text style={[styles.settingLabel, styles.settingDanger]}>Delete My Account</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.recording} />
          </Pressable>
        </View>
      </View>

      {/* Delete account confirmation modal — Type DELETE */}
      <Modal visible={showDeleteConfirmModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteConfirmModal(false)}>
          <Pressable style={styles.deleteConfirmCard} onPress={() => {}}>
            <Text style={styles.deleteConfirmTitle}>Are you absolutely sure?</Text>
            <Text style={styles.settingHint}>Type DELETE to confirm.</Text>
            <TextInput
              style={styles.input}
              placeholder="DELETE"
              placeholderTextColor={COLORS.textMuted}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.deleteConfirmButtons}>
              <Pressable style={styles.deleteConfirmCancel} onPress={() => { setShowDeleteConfirmModal(false); setDeleteConfirmText(''); }}>
                <Text style={styles.settingLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteConfirmButton, deleteConfirmText !== 'DELETE' && styles.deleteConfirmButtonDisabled]}
                onPress={handleDeleteAccountConfirm}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete my account</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Crisis resources — culturally relevant */}
      <View style={styles.crisis}>
        <Text style={styles.crisisTitle}>Need help now?</Text>
        {showLGBTQCrisis && (
          <>
            <Pressable onPress={() => Linking.openURL('tel:8775658860')}>
              <Text style={styles.crisisLink}>🏳️‍⚧️ Trans Lifeline: 877-565-8860 — by and for trans people</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('tel:8664887386')}>
              <Text style={styles.crisisLink}>🏳️‍🌈 Trevor Project: 866-488-7386 — LGBTQ+ youth crisis support</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('sms:678678')}>
              <Text style={styles.crisisLink}>💬 Trevor Text: text START to 678-678 — LGBTQ+ text support</Text>
            </Pressable>
          </>
        )}
        {crisisResources.map((r, i) => (
          <Pressable
            key={`${r.name}-${i}`}
            onPress={() => {
              if (r.number) Linking.openURL(r.number === '741741' ? 'sms:741741?body=HOME' : 'tel:' + r.number.replace(/\D/g, ''));
              else if (r.url) Linking.openURL(r.url);
            }}
          >
            <Text style={styles.crisisLink}>{r.name} — {r.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
    </>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.card,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
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
  conversationSearchInput: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },
  emotionFilterScrollView: { marginBottom: 12, maxHeight: 40 },
  emotionFilterScroll: { gap: 8, paddingRight: 16 },
  emotionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  emotionChipSelected: { backgroundColor: COLORS.accent },
  emotionChipText: { fontSize: 13, color: COLORS.textMuted },
  emotionChipTextSelected: { color: COLORS.text, fontWeight: '600' },
  summaryGroup: { marginBottom: 16 },
  summaryGroupLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryPreview: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  summaryExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
  summaryFullText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  summaryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  summaryChipsLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    width: '100%',
    marginBottom: 2,
  },
  summaryChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  summaryChipText: { fontSize: 13, color: COLORS.text },
  insightBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
  },
  insightBlockLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  insightBlockText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
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
  helpSomeoneSituation: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  entryMood: { fontSize: 16 },
  entryPreview: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  practiceExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
  practiceBubbleWrap: { marginBottom: 10 },
  practiceBubbleLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  practiceBubbleText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
  },
  debriefBlock: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rolePlayAccent,
  },
  debriefLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.rolePlayAccent,
    marginBottom: 6,
  },
  debriefText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  practiceAgainButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
  },
  practiceAgainButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
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
  smallLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  inputMargin: { marginTop: 12, marginBottom: 4 },
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
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.input,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  emergencyInput: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  deleteConfirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  deleteConfirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  deleteConfirmCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.recording,
    borderRadius: BORDER_RADIUS.input,
  },
  deleteConfirmButtonDisabled: {
    opacity: 0.5,
  },
  deleteConfirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  sensitiveModalCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    maxHeight: '80%',
  },
  sensitiveModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sensitiveChipScroll: {
    maxHeight: 320,
    marginVertical: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
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
