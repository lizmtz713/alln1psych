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
import { AchievementBadge } from '../../src/components/AchievementBadge';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/sensitiveTopics';
import type { EmergencyContact } from '../../src/stores/userStore';

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
  const { setSensitiveTopics, setEmergencyContacts } = useUserStore();
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
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedPracticeId, setExpandedPracticeId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [toast, setToast] = useState<{ title: string; emoji: string } | null>(null);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [editingContacts, setEditingContacts] = useState<EmergencyContact[]>([]);
  const [contactsEditing, setContactsEditing] = useState(false);
  const prevUnlockedIds = useRef<Set<string>>(new Set());

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
        <Pressable onPress={() => Linking.openURL('tel:8775658860')}>
          <Text style={styles.crisisLink}>🏳️‍⚧️ Trans Lifeline: 877-565-8860 — by and for trans people</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('tel:8664887386')}>
          <Text style={styles.crisisLink}>🏳️‍🌈 Trevor Project: 866-488-7386 — LGBTQ+ youth crisis support</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('sms:678678')}>
          <Text style={styles.crisisLink}>💬 Trevor Text: text START to 678-678 — LGBTQ+ text support</Text>
        </Pressable>
      </View>
    </ScrollView>
    </>
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
