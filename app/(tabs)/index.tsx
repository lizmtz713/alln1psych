import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useEducationStore, userAgeToContentAge } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { generateDailyContent } from '../../src/services/personalization';
import { getGaugeColor, getGaugeStatusLabel } from '../../src/utils/gaugeHelpers';
import { getDiscoveriesForDay } from '../../src/data/discoveries';
import { Ionicons } from '@expo/vector-icons';

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

function SmallGauge({ value, size }: { value: number; size: number }) {
  const color = getGaugeColor(value);
  return (
    <View style={[styles.smallGaugeRing, { width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: color }]}>
      <Text style={styles.smallGaugeValue}>{value >= 0 ? value : '—'}</Text>
    </View>
  );
}

type ActivitySuggestion = { id: string; emoji: string; title: string; sub: string };

const ALL_ACTIVITIES: ActivitySuggestion[] = [
  { id: 'breathing', emoji: '🌬️', title: 'Breathe with me', sub: 'Box breathing — 4 in, 4 hold, 4 out. Calms your nervous system.' },
  { id: 'gratitude-jar', emoji: '✨', title: 'Gratitude Jar', sub: "Add moments you're grateful for. Shake the jar to revisit one." },
  { id: 'emotion-match', emoji: '🃏', title: 'What Would You Feel?', sub: 'Match scenarios to emotions. No wrong answers.' },
  { id: 'comm-builder', emoji: '💬', title: 'Say What You Feel', sub: "Build an 'I feel' statement for a hard conversation." },
  { id: 'body-scan', emoji: '🧍', title: 'Body Check', sub: 'Tap where you feel tension. Connect body and emotions.' },
  { id: 'mood-patterns', emoji: '📊', title: 'Your Patterns', sub: 'See your mood calendar and AI insights.' },
  { id: 'stress-thermo', emoji: '🌡️', title: 'Stress Check', sub: 'Rate your stress and get support that fits.' },
  { id: 'thought-challenger', emoji: '💭', title: 'Thought Challenger', sub: 'Challenge a tough thought with Psych.' },
  { id: 'emotion-wheel', emoji: '🎯', title: 'Emotion Explorer', sub: 'Name your feelings with precision.' },
];

function getSuggestedActivities(
  recentMoods: string[],
  hour: number,
  _completedActivityIds: string[] = []
): ActivitySuggestion[] {
  const seed = new Date().getDate() + hour;
  const lastMood = recentMoods[0];
  const isRedOrange = lastMood === 'red' || lastMood === 'orange';
  const isGreen = lastMood === 'green';
  let pool: ActivitySuggestion[];
  if (isRedOrange) {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'stress-thermo' || a.id === 'thought-challenger');
  } else if (isGreen) {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'emotion-match' || a.id === 'gratitude-jar');
  } else if (hour >= 5 && hour < 11) {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'breathing' || a.id === 'gratitude-jar');
  } else if (hour >= 11 && hour < 17) {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'emotion-match' || a.id === 'comm-builder');
  } else if (hour >= 17 && hour < 21) {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'body-scan' || a.id === 'mood-patterns');
  } else {
    pool = ALL_ACTIVITIES.filter((a) => a.id === 'breathing' || a.id === 'gratitude-jar');
  }
  const first = pool[seed % pool.length];
  const rest = pool.filter((a) => a.id !== first.id);
  const second = rest.length > 0 ? rest[seed % rest.length] : ALL_ACTIVITIES[(seed + 1) % ALL_ACTIVITIES.length];
  return [first, second];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myTemperature, myTemperatureLabel, members } = useCircleStore();
  const user = useUserStore();
  useConversationStore((s) => s.messages.length);
  useJournalStore((s) => s.entries.length);
  useEducationStore((s: { lastLessonDate: Date | null; completedLessons: string[] }) => ({ lastLessonDate: s.lastLessonDate, completedLessons: s.completedLessons }));
  const getEngagementStreak = useInsightsStore((s: { getEngagementStreak: () => number }) => s.getEngagementStreak);
  const getPsychSays = useInsightsStore((s: { getPsychSays: (n: number) => string }) => s.getPsychSays);
  const getWeeklySummary = useInsightsStore((s: { getWeeklySummary: () => { mostCommonMood: string | null; checkInDays: number; lessonsCount: number; conversationDays: number; line: string } | null }) => s.getWeeklySummary);
  const getNextLesson = useEducationStore((s: { getNextLesson: (age: import('../../src/stores/educationStore').ContentAgeGroup) => { id: string; title: string; duration: number } | null }) => s.getNextLesson);
  const streak = getEngagementStreak();
  const weeklySummary = getWeeklySummary();
  const nextLesson = getNextLesson(userAgeToContentAge(user.ageGroup));
  const { getTodayChallenge, isTodayChallengeDone, completeTodayChallenge } = useEngagementStore();
  const { content: dailyContent, isLoading: dailyContentLoading, setContent: setDailyContent, setLoading: setDailyContentLoading, isStale } = useDailyContentStore();
  const moodTrend = useInsightsStore((s: { getWeeklyMoodTrend: () => Array<{ date: string; mood: string }> }) => s.getWeeklyMoodTrend)();

  useEffect(() => {
    if (!dailyContent || isStale()) {
      setDailyContentLoading(true);
      generateDailyContent({
        name: user.name || 'there',
        ageGroup: user.ageGroup ?? 'unknown',
        recentMoods: moodTrend.map((t: { date: string; mood: string }) => t.mood),
        streak,
        lessonsCompleted: useEducationStore.getState().completedLessons,
        loveLanguage: user.loveLanguage ?? undefined,
        sensitiveTopics: user.sensitiveTopics?.length ? user.sensitiveTopics : undefined,
      })
        .then((c) => {
          setDailyContent(c);
        })
        .catch(() => {
          const hour = new Date().getHours();
          const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : "It's late";
          setDailyContent({
            greeting: `${timeGreeting}, ${user.name || 'you'} 💜`,
            affirmation: "You're doing better than you think.",
            insight: 'Check in with yourself today. Your feelings matter.',
            challengeSuggestion: 'Take 5 deep breaths right now.',
          });
        })
        .finally(() => setDailyContentLoading(false));
    }
  }, [isStale(), user.name, user.ageGroup, streak]);

  const greetingLine = dailyContent?.greeting ?? `Good morning, ${user.name || 'you'} 💜`;
  const affirmation = dailyContent?.affirmation ?? "You're doing better than you think.";
  const psychSays = dailyContent?.insight ?? getPsychSays(streak);
  const todayChallenge = getTodayChallenge();
  const challengeDone = isTodayChallengeDone();
  const challengeText = dailyContent?.challengeSuggestion ?? todayChallenge.text;
  const discoveryPreview = getDiscoveriesForDay()[0];

  const bodyVal = useCockpitStore((s) => s.body?.value ?? -1);
  const stateVal = useCockpitStore((s) => s.state?.value ?? -1);
  const emotionVal = useCockpitStore((s) => s.emotion?.value ?? -1);
  const connectionVal = useCockpitStore((s) => s.connection?.value ?? -1);
  const directionVal = useCockpitStore((s) => s.direction?.value ?? -1);
  const alignmentVal = useCockpitStore((s) => s.alignment?.value ?? -1);
  const gaugeValues: Record<GaugeKey, number> = {
    body: bodyVal,
    state: stateVal,
    emotion: emotionVal,
    connection: connectionVal,
    direction: directionVal,
    alignment: alignmentVal,
  };
  const activeGauges = GAUGE_KEYS.filter((k) => gaugeValues[k] >= 0);
  const overallScore =
    activeGauges.length > 0
      ? Math.round(activeGauges.reduce((sum, k) => sum + gaugeValues[k], 0) / activeGauges.length)
      : -1;

  const quickActions = [
    { label: 'Talk', icon: 'chatbubble-ellipses', route: '/(tabs)/talk' as const, isEmoji: false },
    { label: 'Replay', icon: 'refresh', route: '/(modals)/replay' as const, isEmoji: false },
    { label: 'Decode', icon: 'search', route: '/(modals)/decode' as const, isEmoji: false },
    { label: 'Relate', icon: '💫', route: '/(modals)/relationship-check' as const, isEmoji: true },
    { label: 'Journal', icon: 'book', route: '/(modals)/new-journal' as const, isEmoji: false },
    { label: 'Practice', icon: 'people', route: '/(modals)/role-play' as const, isEmoji: false },
  ];

  const card0 = useRef(new Animated.Value(0)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;
  const card4 = useRef(new Animated.Value(0)).current;
  const card5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (v: Animated.Value, delay: number) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      });
    Animated.parallel([
      anim(card0, 0),
      anim(card1, 80),
      anim(card2, 160),
      anim(card3, 240),
      anim(card4, 320),
      anim(card5, 400),
    ]).start();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const needsCheckIn = members.filter((m) => m.temperature === 'orange' || m.temperature === 'red');
  const firstAlert = needsCheckIn[0];

  const slideY = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {/* 1. GREETING + STREAK */}
      <Animated.View style={[styles.greetingBlock, slideY(card0)]}>
        {dailyContentLoading ? (
          <View style={styles.shimmer}>
            <Text style={styles.greeting}>Loading your space...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.greeting}>{greetingLine}</Text>
            {streak > 0 && (
              <View style={styles.streakRow}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{streak}-day streak</Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* 2. OVERALL TEMPERATURE CIRCLE */}
      <View style={styles.overallCircleWrap}>
        <View
          style={[
            styles.overallCircle,
            { borderColor: getGaugeColor(overallScore) },
          ]}
        >
          <Text style={styles.overallCircleValue}>{overallScore >= 0 ? overallScore : '—'}</Text>
          <Text style={styles.overallCircleLabel}>Overall</Text>
        </View>
        {overallScore < 0 && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(modals)/cockpit-checkin');
            }}
            style={styles.overallCircleCta}
          >
            <Text style={styles.overallCircleCtaText}>Tap to check in</Text>
          </Pressable>
        )}
      </View>

      {/* 3. SIX GAUGES — 2x3 grid */}
      <View style={styles.gaugesGrid}>
        {GAUGE_KEYS.map((key) => {
          const value = gaugeValues[key];
          return (
            <Pressable
              key={key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/(modals)/gauge-detail', params: { gauge: key } });
              }}
              style={styles.gaugeCard}
            >
              <SmallGauge value={value} size={60} />
              <Text style={styles.gaugeCardLabel}>{key}</Text>
              <Text style={styles.gaugeCardStatus}>
                {value >= 0 ? getGaugeStatusLabel(value) : 'Not checked'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 4. QUICK ACTION PILLS — 2x3 grid */}
      <View style={styles.quickActionsGrid}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(a.route);
            }}
            style={styles.quickActionCard}
          >
            {a.isEmoji ? (
              <Text style={styles.quickActionEmoji}>{a.icon}</Text>
            ) : (
              <Ionicons name={a.icon as 'chatbubble-ellipses' | 'refresh' | 'search' | 'book' | 'people'} size={18} color="#7C4DFF" />
            )}
            <Text style={styles.quickActionCardText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 5. MY CIRCLES */}
      {members.length > 0 && (
        <Animated.View style={[styles.section, slideY(card2)]}>
          <Text style={styles.sectionTitle}>My Circle</Text>
          <View style={styles.circleScroll}>
            {members.slice(0, 5).map((m) => (
              <Pressable
                key={m?.id ?? m?.name ?? ''}
                onPress={() => router.push('/(tabs)/circle')}
                style={styles.circleMemberChip}
              >
                <TemperatureGauge temperature={m?.temperature ?? 'green'} size="sm" />
                <Text style={styles.circleMemberName} numberOfLines={1}>{m?.name ?? 'Someone'}</Text>
              </Pressable>
            ))}
          </View>
          {firstAlert && (
            <View style={[styles.alert, styles.alertGlow]}>
              <Text style={styles.alertText}>{firstAlert.name} could use a check-in</Text>
              <Pressable
                style={({ pressed }) => [styles.alertButton, pressed && { opacity: 0.9 }]}
                onPress={() => router.push('/(tabs)/circle')}
              >
                <Text style={styles.alertButtonText}>See Circle</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      )}

      {/* 6. HELP SOMEONE */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(modals)/help-someone');
        }}
        style={styles.helpSomeoneCard}
      >
        <View>
          <Text style={styles.helpSomeoneTitle}>Help Someone</Text>
          <Text style={styles.helpSomeoneSub}>Get coaching on supporting someone you care about</Text>
        </View>
        <Ionicons name="heart" size={22} color="#7C4DFF" />
      </Pressable>

      {/* 7. PSYCH SAYS */}
      <Animated.View style={[styles.card, styles.psychCard, slideY(card2)]}>
        <Text style={styles.psychLabel}>Psych says...</Text>
        <Text style={styles.psychText}>{psychSays}</Text>
      </Animated.View>

      {/* 8. DISCOVERY */}
      {discoveryPreview && (
        <Animated.View style={[styles.card, slideY(card3)]}>
          <Text style={styles.cardSectionTitle}>Discovery</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/learn')}
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Text style={styles.discoveryEmoji}>{discoveryPreview.emoji}</Text>
            <Text style={styles.discoveryTitle}>{discoveryPreview.title}</Text>
            <Text style={styles.discoveryContent} numberOfLines={2}>{discoveryPreview.content}</Text>
            <Text style={styles.discoveryLink}>See more in Manual →</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* 9. Everything else */}
      <Animated.View style={[styles.card, slideY(card3)]}>
        <Text style={styles.affirmation}>{affirmation}</Text>
      </Animated.View>

      <Animated.View style={[styles.card, slideY(card3)]}>
        <Text style={styles.cardSectionTitle}>Today's challenge</Text>
        <Text style={styles.challengeEmoji}>{todayChallenge.emoji}</Text>
        <Text style={styles.challengeText}>{challengeText}</Text>
        {challengeDone ? (
          <View style={styles.challengeDoneWrap}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.temperature.green} />
            <Text style={styles.challengeDoneText}>Done</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.challengeDoneButton, pressed && { opacity: 0.9 }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              completeTodayChallenge();
            }}
          >
            <Text style={styles.challengeDoneButtonText}>Done ✓</Text>
          </Pressable>
        )}
      </Animated.View>

      {weeklySummary && (
        <Animated.View style={[styles.card, styles.weeklyCard, slideY(card3)]}>
          <Text style={styles.cardSectionTitle}>Your week in review</Text>
          <Text style={styles.weeklyLine}>{weeklySummary.line}</Text>
          <Text style={styles.weeklyMeta}>
            Most common mood: {weeklySummary.mostCommonMood} · {weeklySummary.lessonsCount} lessons · {weeklySummary.conversationDays} conversation(s)
          </Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.card, slideY(card3)]}>
        <Text style={styles.cardSectionTitle}>Try this</Text>
        {(() => {
          const hour = new Date().getHours();
          const recentMoods = moodTrend.map((t: { date: string; mood: string }) => t.mood);
          const suggestions = getSuggestedActivities(recentMoods, hour);
          return (
            <View style={styles.tryThisRow}>
              {suggestions.map((config) => (
                <Pressable
                  key={config.id}
                  style={({ pressed }) => [styles.practiceCard, styles.practiceCardHalf, pressed && { opacity: 0.9 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/(modals)/activity?id=${config.id}`);
                  }}
                >
                  <Text style={styles.practiceEmoji}>{config.emoji}</Text>
                  <Text style={styles.practiceTitle} numberOfLines={2}>{config.title}</Text>
                  <Text style={styles.practiceSub} numberOfLines={2}>{config.sub}</Text>
                </Pressable>
              ))}
            </View>
          );
        })()}
      </Animated.View>

      {nextLesson && (
        <Animated.View style={[styles.card, styles.practiceCard, slideY(card4)]}>
          <Text style={styles.cardSectionTitle}>Today's lesson</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/lesson/${nextLesson.id}`);
            }}
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Text style={styles.practiceEmoji}>📖</Text>
            <Text style={styles.practiceTitle}>{nextLesson.title}</Text>
            <Text style={styles.practiceSub}>{nextLesson.duration} min</Text>
          </Pressable>
        </Animated.View>
      )}

      <Text style={styles.prompt}>How are you feeling today?</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  greetingBlock: { marginBottom: 12 },
  shimmer: { minHeight: 60 },
  greeting: { fontSize: 24, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  affirmation: { fontSize: 18, color: COLORS.textMuted, lineHeight: 26, fontStyle: 'italic' },
  overallCircleWrap: { alignItems: 'center', marginVertical: 16 },
  overallCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111118',
  },
  overallCircleValue: { color: '#F0F0F5', fontSize: 36, fontWeight: '700' },
  overallCircleLabel: { color: '#8888A0', fontSize: 12, marginTop: 4 },
  overallCircleCta: { marginTop: 8 },
  overallCircleCtaText: { color: '#7C4DFF', fontSize: 14 },
  gaugesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gaugeCard: {
    width: '48%',
    backgroundColor: '#111118',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gaugeCardLabel: { color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 6, textTransform: 'capitalize' },
  gaugeCardStatus: { color: '#8888A0', fontSize: 11, marginTop: 2 },
  smallGaugeRing: { alignItems: 'center', justifyContent: 'center' },
  smallGaugeValue: { color: '#F0F0F5', fontSize: 14, fontWeight: '700' },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quickActionCardText: { color: '#F0F0F5', fontSize: 14 },
  quickActionEmoji: { fontSize: 18 },
  circleScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  circleMemberChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111118', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  circleMemberName: { color: '#F0F0F5', fontSize: 14, maxWidth: 80 },
  helpSomeoneCard: {
    backgroundColor: '#111118',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpSomeoneTitle: { color: '#F0F0F5', fontSize: 16, fontWeight: '600' },
  helpSomeoneSub: { color: '#8888A0', fontSize: 13, marginTop: 2 },
  discoveryEmoji: { fontSize: 24, marginBottom: 6 },
  discoveryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  discoveryContent: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  discoveryLink: { fontSize: 13, color: COLORS.accent, marginTop: 8 },
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 20,
  },
  tempCard: { overflow: 'hidden' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTextWrap: { marginLeft: 16 },
  cardTitle: { fontSize: 14, color: COLORS.textMuted },
  cardLabel: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  checkInButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  checkInButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  streakEmoji: { fontSize: 22 },
  streakText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  cardSectionTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  challengeEmoji: { fontSize: 28, marginBottom: 6 },
  challengeText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 22,
  },
  challengeDoneButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
  },
  challengeDoneButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  challengeDoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeDoneText: { fontSize: 15, color: COLORS.temperature.green, fontWeight: '500' },
  psychCard: { borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  psychLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  psychText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  weeklyCard: {},
  weeklyLine: { fontSize: 16, color: COLORS.text, marginBottom: 8, fontWeight: '500' },
  weeklyMeta: { fontSize: 14, color: COLORS.textMuted },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  muted: { fontSize: 15, color: COLORS.textMuted },
  alert: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertGlow: {
    shadowColor: COLORS.temperature.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  alertText: { fontSize: 15, color: COLORS.text, flex: 1 },
  alertButton: { paddingVertical: 8, paddingHorizontal: 14 },
  alertButtonText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    alignItems: 'center',
  },
  quickActionPressed: { opacity: 0.9 },
  quickActionText: { fontSize: 13, color: COLORS.text, marginTop: 8, textAlign: 'center' },
  practiceCard: {},
  practiceCardHalf: { flex: 1, minWidth: 0 },
  tryThisRow: { flexDirection: 'row', gap: 12 },
  practiceEmoji: { fontSize: 28, marginBottom: 8 },
  practiceTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  practiceSub: { fontSize: 15, color: COLORS.textMuted },
  prompt: { fontSize: 17, color: COLORS.accent },
});
