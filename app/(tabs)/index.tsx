import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import {
  GAUGE_CONFIG,
  getOverallStatusLabel,
  getGaugeStatusLabel,
  getGaugeColor,
} from '../../src/utils/gaugeHelpers';
import { BodyGauge, StateGauge, EmotionGauge, ConnectionGauge, DirectionGauge, AlignmentGauge } from '../../src/components/gauges';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useEducationStore, userAgeToContentAge } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { generateDailyContent } from '../../src/services/personalization';
import { getDiscoveriesForDay } from '../../src/data/discoveries';
import { Ionicons } from '@expo/vector-icons';

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
  recentMoods: string[] | undefined | null,
  hour: number,
  _completedActivityIds: string[] = []
): ActivitySuggestion[] {
  const moods = recentMoods ?? [];
  const seed = new Date().getDate() + hour;
  const lastMood = moods[0];
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

const COCKPIT_BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const TEXT_MUTED = '#55556A';
const ACCENT = '#7C4DFF';

function getDynamicGreeting(name: string): string {
  const n = name?.trim() || 'you';
  const hour = new Date().getHours();
  const greetings = {
    morning: [
      `Morning, ${n}`,
      `New day, ${n}`,
      `Rise and check in, ${n}`,
      `Good morning, ${n}`,
      `Hey ${n}, fresh start`,
    ],
    afternoon: [
      `Afternoon, ${n}`,
      `Hey ${n}`,
      `Checking in, ${n}`,
      `How's the day going, ${n}`,
      `Good afternoon, ${n}`,
    ],
    evening: [
      `Evening, ${n}`,
      `Hey ${n}, winding down?`,
      `Good evening, ${n}`,
      `End of day check, ${n}`,
      `Hey ${n}`,
    ],
    night: [
      `Still up, ${n}?`,
      `Late night, ${n}`,
      `Hey ${n}, can't sleep?`,
      `Night owl mode, ${n}`,
      `${n}, take it easy tonight`,
    ],
  };
  let timeGreetings: string[];
  if (hour >= 5 && hour < 12) timeGreetings = greetings.morning;
  else if (hour >= 12 && hour < 17) timeGreetings = greetings.afternoon;
  else if (hour >= 17 && hour < 22) timeGreetings = greetings.evening;
  else timeGreetings = greetings.night;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return timeGreetings[dayOfYear % timeGreetings.length];
}

const GAUGE_COMPONENTS: Record<string, React.FC<{ value: number; size?: number }>> = {
  body: BodyGauge,
  state: StateGauge,
  emotion: EmotionGauge,
  connection: ConnectionGauge,
  direction: DirectionGauge,
  alignment: AlignmentGauge,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const circle = useCircleStore();
  const members = circle.members ?? [];
  const myTemperature = circle.myTemperature ?? 'green';
  const myTemperatureLabel = circle.myTemperatureLabel ?? 'Doing well';
  const user = useUserStore();
  useConversationStore((s) => (s.messages ?? []).length);
  useJournalStore((s) => (s.entries ?? []).length);
  const getEngagementStreak = useInsightsStore((s) => s.getEngagementStreak);
  const getPsychSays = useInsightsStore((s) => s.getPsychSays);
  const getWeeklySummary = useInsightsStore((s) => s.getWeeklySummary);
  const getNextLesson = useEducationStore((s) => s.getNextLesson);
  const { getTodayChallenge, isTodayChallengeDone, completeTodayChallenge } = useEngagementStore();
  const { content: dailyContent, isLoading: dailyContentLoading, setContent: setDailyContent, setLoading: setDailyContentLoading, isStale } = useDailyContentStore();
  const getWeeklyMoodTrend = useInsightsStore((s) => s.getWeeklyMoodTrend);
  const getSummaries = useConversationSummaryStore((s) => s.getSummaries);
  const getLastSummary = useConversationSummaryStore((s) => s.getLastSummary);
  const getRecentTriggers = useConversationSummaryStore((s) => s.getRecentTriggers);
  const getEmotionalPatterns = useConversationSummaryStore((s) => s.getEmotionalPatterns);

  const bodyVal = useCockpitStore((s) => s.body.value);
  const stateVal = useCockpitStore((s) => s.state.value);
  const emotionVal = useCockpitStore((s) => s.emotion.value);
  const connectionVal = useCockpitStore((s) => s.connection.value);
  const directionVal = useCockpitStore((s) => s.direction.value);
  const alignmentVal = useCockpitStore((s) => s.alignment.value);
  const crossSystemInsight = useCockpitStore((s) => s.crossSystemInsight);

  const activeGaugeCount = [bodyVal, stateVal, emotionVal, connectionVal, directionVal, alignmentVal].filter((v) => v >= 0).length;
  const overall =
    activeGaugeCount === 0
      ? -1
      : Math.round(
          [bodyVal, stateVal, emotionVal, connectionVal, directionVal, alignmentVal]
            .filter((v) => v >= 0)
            .reduce((sum, v) => sum + v, 0) / activeGaugeCount
        );

  const [insightFetched, setInsightFetched] = useState(false);

  useEffect(() => {
    useCockpitStore.getState().runDailyDecayIfNeeded();
  }, []);

  useEffect(() => {
    if (activeGaugeCount >= 3 && !insightFetched) {
      useCockpitStore.getState().fetchCrossSystemInsight();
      setInsightFetched(true);
    }
  }, [activeGaugeCount, insightFetched]);
  const overallLabel = getOverallStatusLabel(overall);
  const showInsight = Boolean(crossSystemInsight && activeGaugeCount >= 3);
  const ringColor = overall < 0 ? TEXT_MUTED : getGaugeColor(overall);

  let streak: number = 0;
  let weeklySummary: { mostCommonMood: string | null; checkInDays: number; lessonsCount: number; conversationDays: number; line: string } | null = null;
  let nextLesson: { id: string; title: string; duration: string } | null = null;
  let moodTrend: Array<{ date: string; mood: string }> = [];
  let summaryCount = 0;
  let greetingLine = getDynamicGreeting(user?.name ?? 'you');
  let affirmation = "You're doing better than you think.";
  let psychSays = "You're doing better than you think.";
  let todayChallenge: { text: string; emoji: string } = { text: 'Take 5 deep breaths right now', emoji: '🌬️' };
  let challengeDone = false;
  let challengeText = 'Take 5 deep breaths right now';
  let needsCheckIn: typeof members = [];
  let firstAlert: (typeof members)[0] | undefined;

  try {
    streak = typeof getEngagementStreak === 'function' ? getEngagementStreak() : 0;
    weeklySummary = typeof getWeeklySummary === 'function' ? getWeeklySummary() : null;
    const ageGroupForLesson = typeof userAgeToContentAge === 'function' ? userAgeToContentAge(user?.ageGroup ?? null) : 'adult';
    nextLesson = typeof getNextLesson === 'function' ? getNextLesson(ageGroupForLesson) ?? null : null;
    moodTrend = typeof getWeeklyMoodTrend === 'function' ? (getWeeklyMoodTrend() ?? []) : [];
    const summaries = typeof getSummaries === 'function' ? getSummaries() : [];
    summaryCount = Array.isArray(summaries) ? summaries.length : 0;
    greetingLine = dailyContent?.greeting ?? getDynamicGreeting(user?.name ?? 'you');
    affirmation = dailyContent?.affirmation ?? "You're doing better than you think.";
    psychSays = dailyContent?.insight ?? (typeof getPsychSays === 'function' ? getPsychSays(streak) : "You're doing better than you think.");
    todayChallenge = (typeof getTodayChallenge === 'function' ? getTodayChallenge() : null) ?? todayChallenge;
    challengeDone = typeof isTodayChallengeDone === 'function' ? isTodayChallengeDone() : false;
    challengeText = dailyContent?.challengeSuggestion ?? (todayChallenge?.text ?? challengeText);
    needsCheckIn = Array.isArray(members) ? members.filter((m) => m?.temperature === 'orange' || m?.temperature === 'red') : [];
    firstAlert = needsCheckIn[0];
  } catch (e) {
    console.error('Home screen setup error:', e);
    const message = (e && typeof (e as Error).message === 'string' ? (e as Error).message : String(e)) || 'Unknown error';
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0B1E', padding: 24 }}>
        <Text style={{ color: '#fff', padding: 20, textAlign: 'center', fontSize: 14 }}>Error: {message}</Text>
      </SafeAreaView>
    );
  }

  const todayDateKey = new Date().toDateString();
  const userName = user?.name ?? '';
  const userAgeGroup = user?.ageGroup ?? '';

  const entries = useJournalStore((s) => s.entries ?? []);
  const hasJournalToday = entries.some((e) => e.createdAt && new Date(e.createdAt).toDateString() === todayDateKey);
  const hasTalkedToday = useConversationStore((s) => {
    const msgs = s.messages ?? [];
    if (msgs.length === 0) return false;
    const last = msgs[msgs.length - 1];
    return last?.timestamp && new Date(last.timestamp).toDateString() === todayDateKey;
  });
  const discoveryPreview = getDiscoveriesForDay()[0];

  useEffect(() => {
    try {
      const isStaleResult = typeof isStale === 'function' ? isStale() : false;
      if (!dailyContent || isStaleResult) {
        if (typeof setDailyContentLoading === 'function') setDailyContentLoading(true);
        const lastSummary = typeof getLastSummary === 'function' ? getLastSummary() ?? null : null;
        const recentTriggers = (typeof getRecentTriggers === 'function' ? getRecentTriggers(14) : []) as string[];
        const patterns = typeof getEmotionalPatterns === 'function' ? getEmotionalPatterns() : { topEmotions: [], topTriggers: [], trend: 'stable' as const };
        const lastConversationSummary = lastSummary && typeof lastSummary === 'object'
          ? `${lastSummary.title ?? ''}: ${lastSummary.summary ?? ''}${lastSummary.insights ? ` Insight: ${lastSummary.insights}` : ''}`
          : undefined;
        const educationState = typeof useEducationStore?.getState === 'function' ? useEducationStore.getState() : null;
        const lessonsCompleted = (educationState?.completedLessons ?? []) as string[];
        const moodTrendSnapshot = typeof getWeeklyMoodTrend === 'function' ? (getWeeklyMoodTrend() ?? []) : [];
        const streakSnapshot = typeof getEngagementStreak === 'function' ? getEngagementStreak() : 0;
        if (typeof generateDailyContent !== 'function') {
          if (typeof setDailyContentLoading === 'function') setDailyContentLoading(false);
          return;
        }
        generateDailyContent({
          name: user?.name ?? 'there',
          ageGroup: user?.ageGroup ?? 'unknown',
          recentMoods: Array.isArray(moodTrendSnapshot) ? moodTrendSnapshot.map((t) => (t && typeof t === 'object' && 'mood' in t ? t.mood : '')) : [],
          streak: typeof streakSnapshot === 'number' ? streakSnapshot : 0,
          lessonsCompleted,
          loveLanguage: user?.loveLanguage ?? undefined,
          lastConversationSummary,
          triggers: Array.isArray(recentTriggers) && recentTriggers.length > 0 ? recentTriggers : undefined,
          recentEmotions: Array.isArray(patterns?.topEmotions) ? patterns.topEmotions.slice(0, 6).map((e) => e?.emotion ?? '') : undefined,
          emotionalTrend: patterns?.trend,
        })
          .then((c) => { if (typeof setDailyContent === 'function' && c) setDailyContent(c); })
          .catch(() => {
            const hour = new Date().getHours();
            const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : "It's late";
            if (typeof setDailyContent === 'function') {
              setDailyContent({
                greeting: `${timeGreeting}, ${user?.name ?? 'you'} 💜`,
                affirmation: "You're doing better than you think.",
                insight: 'Check in with yourself today. Your feelings matter.',
                challengeSuggestion: 'Take 5 deep breaths right now.',
              });
            }
          })
          .finally(() => { if (typeof setDailyContentLoading === 'function') setDailyContentLoading(false); });
      }
    } catch (err) {
      console.error('[Home] daily content effect', err);
      if (typeof setDailyContentLoading === 'function') setDailyContentLoading(false);
    }
  }, [todayDateKey, summaryCount, userName, userAgeGroup, streak]);

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
    useCockpitStore.getState().runDailyDecayIfNeeded();
    setTimeout(() => setRefreshing(false), 600);
  };

  const [showGaugeInfo, setShowGaugeInfo] = useState(false);

  const slideY = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  const needsCheckInToday = overall < 0 || activeGaugeCount < 3;
  const psychSaysContent = showInsight && crossSystemInsight ? crossSystemInsight : psychSays;

  return (
    <ErrorBoundary>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
    >
      {/* 1. Quick Action Pills — 2x3 grid */}
      <View style={styles.quickActionsGridWrap}>
        {[
          { label: 'Talk', icon: 'chatbubble-ellipses', route: '/(tabs)/talk' as const, iconIsEmoji: false },
          { label: 'Replay', icon: 'refresh', route: '/(modals)/replay' as const, iconIsEmoji: false },
          { label: 'Decode', icon: 'search', route: '/(modals)/decode' as const, iconIsEmoji: false },
          { label: 'Relate', icon: '💫', route: '/(modals)/relationship-check' as const, iconIsEmoji: true },
          { label: 'Journal', icon: 'journal', route: '/(modals)/new-journal' as const, iconIsEmoji: false },
          { label: 'Practice', icon: 'people', route: '/(modals)/role-play' as const, iconIsEmoji: false },
        ].map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [styles.quickActionPillGrid, pressed && styles.quickActionPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(action.route);
            }}
          >
            {action.iconIsEmoji ? (
              <Text style={{ fontSize: 20 }}>{action.icon}</Text>
            ) : (
              <Ionicons name={action.icon as any} size={22} color={ACCENT} />
            )}
            <Text style={styles.quickActionPillText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 2. Six Gauges — cockpit grid; status inside each tile */}
      <View style={styles.gaugeGridRow}>
        <View style={styles.gaugeGridWrap}>
          {(['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as const).map((key) => {
            const gaugeValue = { body: bodyVal, state: stateVal, emotion: emotionVal, connection: connectionVal, direction: directionVal, alignment: alignmentVal }[key];
            const config = GAUGE_CONFIG[key];
            const GaugeComponent = GAUGE_COMPONENTS[key];
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.gaugeTile, pressed && styles.gaugeTilePressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/(modals)/gauge-detail', params: { gauge: key } });
                }}
              >
                <GaugeComponent value={gaugeValue} size={70} />
                <Text style={styles.gaugeTileLabel}>{config.label}</Text>
                <Text style={[styles.gaugeTileStatus, gaugeValue < 0 && styles.gaugeTileStatusDim]}>
                  {gaugeValue >= 0 ? getGaugeStatusLabel(gaugeValue) : 'Not checked'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={styles.gaugeInfoIcon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowGaugeInfo(true);
          }}
        >
          <Text style={styles.gaugeInfoIconText}>ⓘ</Text>
        </Pressable>
      </View>

      {/* 3. Tap to check in — small, only if they haven't today */}
      {needsCheckInToday && (
        <Pressable
          style={styles.checkInButtonSmall}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/cockpit-checkin');
          }}
        >
          <Text style={styles.checkInButtonSmallText}>Tap to check in</Text>
        </Pressable>
      )}

      {/* 4. Greeting + Streak — smaller text */}
      <View style={styles.greetingStreakRow}>
        {dailyContentLoading ? (
          <Text style={styles.greetingSmall}>Loading...</Text>
        ) : (
          <Text style={styles.greetingSmall}>{greetingLine}</Text>
        )}
        {streak > 0 && (
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streak}-day streak</Text>
          </View>
        )}
      </View>

      {/* 5. Psych Says — one card (cross-system insight or daily psych says) */}
      <Animated.View style={[styles.card, styles.psychCard, slideY(card1)]}>
        <Text style={styles.psychLabel}>Psych says...</Text>
        <Text style={styles.psychText}>{psychSaysContent}</Text>
      </Animated.View>

      {/* 6. Discovery — daily discovery card */}
      {discoveryPreview && (
        <Animated.View style={[styles.card, slideY(card2)]}>
          <Text style={styles.cardSectionTitle}>Discovery</Text>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/(tabs)/learn')}
          >
            <Text style={styles.discoveryEmoji}>{discoveryPreview.emoji}</Text>
            <Text style={styles.discoveryTitle}>{discoveryPreview.title}</Text>
            <Text style={styles.discoveryContent} numberOfLines={2}>{discoveryPreview.content}</Text>
            <Text style={styles.discoveryTapHint}>See more in Manual →</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* 7. My Circle — preview */}
      {Array.isArray(members) && members.length > 0 && (
        <Animated.View style={[styles.section, slideY(card2)]}>
          <Text style={styles.sectionTitle}>My Circle</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.circleScroll}>
            {members.map((m) => (
              <Pressable
                key={m?.id ?? m?.name ?? ''}
                style={({ pressed }) => [styles.circleMember, pressed && { opacity: 0.9 }]}
                onPress={() => router.push('/(tabs)/circle')}
              >
                <TemperatureGauge temperature={m?.temperature ?? 'green'} size="sm" />
                <Text style={styles.circleMemberName} numberOfLines={1}>{m?.name ?? 'Someone'}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {firstAlert != null && (
            <View style={[styles.alert, styles.alertGlow]}>
              <Text style={styles.alertText}>{firstAlert.name} could use a check-in</Text>
              <Pressable style={({ pressed }) => [styles.alertButton, pressed && { opacity: 0.9 }]} onPress={() => router.push('/(tabs)/circle')}>
                <Text style={styles.alertButtonText}>See Circle</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      )}

      {/* Help Someone — below My Circles */}
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

      {/* 8. Everything else — affirmation, Try This, weekly */}
      <Animated.View style={[styles.card, styles.affirmationCard, slideY(card2)]}>
        <Text style={styles.affirmation}>{affirmation}</Text>
      </Animated.View>

      <Animated.View style={[styles.tryThisPillsWrap, slideY(card3)]}>
        <Text style={styles.cardSectionTitle}>Try this</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tryThisPillsRow}>
          {(() => {
            const hour = new Date().getHours();
            const recentMoods = Array.isArray(moodTrend) ? moodTrend.map((t) => (t && typeof t === 'object' && 'mood' in t ? t.mood : '')) : [];
            const suggestions = getSuggestedActivities(recentMoods, hour);
            return suggestions.map((config) => (
              <Pressable
                key={config.id}
                style={({ pressed }) => [styles.tryThisPill, pressed && { opacity: 0.9 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/(modals)/activity?id=${config.id}`);
                }}
              >
                <Text style={styles.tryThisPillEmoji}>{config.emoji}</Text>
                <Text style={styles.tryThisPillText} numberOfLines={1}>{config.title}</Text>
              </Pressable>
            ));
          })()}
        </ScrollView>
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

      {/* Gauge info modal */}
      <Modal visible={showGaugeInfo} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowGaugeInfo(false)}>
          <View style={styles.gaugeInfoCard}>
            <Text style={styles.gaugeInfoTitle}>Gauge numbers</Text>
            <Text style={styles.gaugeInfoBody}>
              These numbers (0–100) show how well each system is regulated based on your check-in. Green (75–100) = strong. Yellow (50–74) = steady. Orange (25–49) = needs attention. Red (0–24) = prioritize this. Tap any gauge to learn more.
            </Text>
            <Pressable style={styles.gaugeInfoClose} onPress={() => setShowGaugeInfo(false)}>
              <Text style={styles.gaugeInfoCloseText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COCKPIT_BG },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  statusLabelWrap: { alignItems: 'center', marginBottom: 8 },
  statusLabelCaps: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  centralRingWrap: { alignItems: 'center', marginBottom: 20 },
  centralRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
  },
  centralRingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  centralRingHint: { fontSize: 13, color: TEXT_MUTED, marginTop: 8 },
  gaugeGridRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  gaugeGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    flex: 1,
  },
  gaugeInfoIcon: { padding: 8, marginLeft: 4 },
  gaugeInfoIconText: { fontSize: 16, color: TEXT_SECONDARY },
  gaugeTile: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  gaugeTilePressed: { backgroundColor: '#16161F' },
  gaugeTileLabel: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY, marginTop: 6 },
  gaugeTileStatus: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 },
  gaugeTileStatusDim: { color: TEXT_MUTED },
  insightCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  insightText: { fontSize: 15, color: TEXT_PRIMARY, lineHeight: 22 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  streakEmoji: { fontSize: 20 },
  streakText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEXT_MUTED,
  },
  indicatorDotOn: { backgroundColor: ACCENT },
  indicatorLabel: { fontSize: 12, color: TEXT_SECONDARY },
  greetingSmallWrap: { marginBottom: 16 },
  greetingSmall: {
    fontSize: 17,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  affirmationCard: {
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
  },
  affirmation: {
    fontSize: 18,
    color: TEXT_SECONDARY,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  cardSectionTitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 10,
  },
  psychCard: { borderLeftWidth: 4, borderLeftColor: ACCENT },
  psychLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  psychText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  weeklyCard: {},
  weeklyLine: { fontSize: 16, color: TEXT_PRIMARY, marginBottom: 8, fontWeight: '500' },
  weeklyMeta: { fontSize: 14, color: TEXT_MUTED },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  muted: { fontSize: 15, color: TEXT_MUTED },
  circleScroll: { paddingVertical: 8, gap: 12, paddingRight: 24 },
  circleMember: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 72,
  },
  circleMemberName: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 6 },
  alert: {
    marginTop: 12,
    backgroundColor: CARD_BG,
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
  alertText: { fontSize: 15, color: TEXT_PRIMARY, flex: 1 },
  alertButton: { paddingVertical: 8, paddingHorizontal: 14 },
  alertButtonText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  discoveryEmoji: { fontSize: 24, marginBottom: 6 },
  discoveryTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6 },
  discoveryContent: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
  discoveryTapHint: { fontSize: 13, color: ACCENT, marginTop: 8 },
  tryThisPillsWrap: { marginBottom: 24 },
  tryThisPillsRow: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  tryThisPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  tryThisPillEmoji: { fontSize: 16, marginRight: 6 },
  tryThisPillText: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  gaugeInfoCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  gaugeInfoTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  gaugeInfoBody: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22 },
  gaugeInfoClose: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: ACCENT,
    borderRadius: 10,
  },
  gaugeInfoCloseText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  quickActionsWrap: { marginBottom: 24 },
  quickActionsScroll: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  quickActionsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionPillGrid: {
    width: '48%',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  quickActionPressed: { opacity: 0.9 },
  quickActionPillText: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500' },
  helpSomeoneCard: {
    backgroundColor: '#111118',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpSomeoneTitle: { color: '#F0F0F5', fontSize: 16, fontWeight: '600' },
  helpSomeoneSub: { color: '#8888A0', fontSize: 13, marginTop: 2 },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  quickActionText: { fontSize: 13, color: TEXT_PRIMARY, marginTop: 8, textAlign: 'center' },
  practiceEmoji: { fontSize: 28, marginBottom: 8 },
  practiceTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 4 },
  practiceSub: { fontSize: 15, color: TEXT_MUTED },
});
