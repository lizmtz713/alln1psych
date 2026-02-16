import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl, SafeAreaView } from 'react-native';
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
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useEducationStore, userAgeToContentAge } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { generateDailyContent } from '../../src/services/personalization';
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

function GaugeTile({ gaugeId, onPress }: { gaugeId: GaugeKey; onPress: () => void }) {
  const gauge = useCockpitStore((s) => s[gaugeId]);
  const getStoreGaugeColor = useCockpitStore((s) => s.getGaugeColor);
  const config = GAUGE_CONFIG[gaugeId];
  const value = gauge?.value ?? -1;
  const color = getStoreGaugeColor(gaugeId);
  const status = getGaugeStatusLabel(value);

  return (
    <Pressable
      style={({ pressed }) => [styles.gaugeTile, pressed && styles.gaugeTilePressed]}
      onPress={onPress}
    >
      <View style={[styles.gaugeTileRing, { borderColor: color }]}>
        <Text style={styles.gaugeTileValue} numberOfLines={1}>
          {value >= 0 ? value : '—'}
        </Text>
      </View>
      <Text style={styles.gaugeTileLabel}>{config?.label ?? gaugeId}</Text>
      <Text style={styles.gaugeTileSub}>{config?.subtitle ?? ''}</Text>
      <Text style={[styles.gaugeTileStatus, value < 0 && styles.gaugeTileStatusDim]}>{status}</Text>
    </Pressable>
  );
}

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
  let greetingLine = `Good morning, ${user?.name ?? 'you'} 💜`;
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
    greetingLine = dailyContent?.greeting ?? `Good morning, ${user?.name ?? 'you'} 💜`;
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
    runDailyDecayIfNeeded();
    setTimeout(() => setRefreshing(false), 600);
  };

  const slideY = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <ErrorBoundary>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {/* 1. Greeting only */}
      <Animated.View style={[styles.greetingBlock, slideY(card0)]}>
        {dailyContentLoading ? (
          <View style={styles.shimmer}>
            <Text style={styles.greeting}>Loading your space...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.greeting}>{greetingLine}</Text>
            <Text style={styles.statusSubtitle}>{overallLabel}</Text>
          </>
        )}
      </Animated.View>

      {/* 2. Cockpit — central ring + 6 gauges + AI insight */}
      <Pressable
        style={styles.centralRingWrap}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(modals)/cockpit-checkin');
        }}
      >
        <Animated.View style={[styles.centralRing, { borderColor: ringColor }]}>
          <Text style={styles.centralRingValue} numberOfLines={1}>
            {overall >= 0 ? overall : '—'}
          </Text>
        </Animated.View>
        {overall < 0 && <Text style={styles.centralRingHint}>Tap to run diagnostics</Text>}
      </Pressable>

      <View style={styles.gaugeGrid}>
        {(['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as GaugeKey[]).map((id) => (
          <GaugeTile
            key={id}
            gaugeId={id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/(modals)/gauge-detail', params: { gauge: id } });
            }}
          />
        ))}
      </View>

      {showInsight && (
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>{crossSystemInsight}</Text>
        </View>
      )}

      {/* 3. How are you feeling? — tappable, opens mood check-in */}
      <Animated.View style={[styles.card, styles.feelingCard, slideY(card0)]}>
        <Pressable
          style={({ pressed }) => [styles.feelingCardInner, pressed && { opacity: 0.9 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/mood-checkin');
          }}
        >
          <Text style={styles.feelingQuestion}>How are you feeling?</Text>
          <View style={styles.feelingFaces}>
            <Text style={styles.feelingFace}>😊</Text>
            <Text style={styles.feelingFace}>😐</Text>
            <Text style={styles.feelingFace}>😟</Text>
            <Text style={styles.feelingFace}>😢</Text>
          </View>
          <Text style={styles.feelingHint}>Tap to check in</Text>
        </Pressable>
      </Animated.View>

      {/* 3. Temperature display (current mood after check-in) */}
      <Animated.View style={[styles.card, styles.tempCard, slideY(card0)]}>
        <View style={styles.cardRow}>
          <TemperatureGauge temperature={myTemperature} size="md" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>You're feeling</Text>
            <Text style={styles.cardLabel}>{myTemperatureLabel}</Text>
          </View>
        </View>
      </Animated.View>

      {/* 4. Streak counter */}
      {streak > 0 && (
        <Animated.View style={[styles.streakRow, slideY(card1)]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streak}-day streak</Text>
        </Animated.View>
      )}

      {/* 5. Quick Actions — three buttons */}
      <Animated.View style={[styles.quickActions, slideY(card1)]}>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/talk');
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.accent} />
          <Text style={styles.quickActionText}>Talk to Psych</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/new-journal');
          }}
        >
          <Ionicons name="journal" size={24} color={COLORS.accent} />
          <Text style={styles.quickActionText}>Write in Journal</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/role-play');
          }}
        >
          <Ionicons name="people" size={24} color={COLORS.accent} />
          <Text style={styles.quickActionText}>Practice</Text>
        </Pressable>
      </Animated.View>

      {/* 6. Daily affirmation card */}
      <Animated.View style={[styles.card, styles.affirmationCard, slideY(card2)]}>
        <Text style={styles.affirmation}>{affirmation}</Text>
      </Animated.View>

      {/* 7. Try this — 2 activity cards */}
      <Animated.View style={[styles.card, slideY(card2)]}>
        <Text style={styles.cardSectionTitle}>Try this</Text>
        {(() => {
          const hour = new Date().getHours();
          const recentMoods = Array.isArray(moodTrend) ? moodTrend.map((t) => (t && typeof t === 'object' && 'mood' in t ? t.mood : '')) : [];
          const suggestions = typeof getSuggestedActivities === 'function' ? getSuggestedActivities(recentMoods, hour) : [];
          const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
          return (
            <View style={styles.tryThisRow}>
              {safeSuggestions.map((config) => (
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

      {/* 8. Psych Says */}
      <Animated.View style={[styles.card, styles.psychCard, slideY(card2)]}>
        <Text style={styles.psychLabel}>Psych says...</Text>
        <Text style={styles.psychText}>{psychSays}</Text>
      </Animated.View>

      {/* 9. Help Someone card */}
      <Animated.View style={[styles.card, slideY(card3)]}>
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/help-someone');
          }}
        >
          <Text style={styles.practiceEmoji}>🤝</Text>
          <Text style={styles.practiceTitle}>Help Someone</Text>
          <Text style={styles.practiceSub}>Worried about someone? Get coaching on what to say.</Text>
        </Pressable>
      </Animated.View>

      {/* 10. Circle alerts (if any orange/red) */}
      {Array.isArray(members) && members.length > 0 && (firstAlert != null) && (
        <Animated.View style={[styles.section, slideY(card3)]}>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <Text style={styles.muted}>
            {members.length} {members.length === 1 ? 'person' : 'people'} in your circle
          </Text>
          <View style={[styles.alert, styles.alertGlow]}>
            <Text style={styles.alertText}>{firstAlert.name} could use a check-in</Text>
            <Pressable
              style={({ pressed }) => [styles.alertButton, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/circle');
              }}
            >
              <Text style={styles.alertButtonText}>See Circle</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* 11. Weekly summary (Sundays only) */}
      {weeklySummary && (
        <Animated.View style={[styles.card, styles.weeklyCard, slideY(card3)]}>
          <Text style={styles.cardSectionTitle}>Your week in review</Text>
          <Text style={styles.weeklyLine}>{weeklySummary.line}</Text>
          <Text style={styles.weeklyMeta}>
            Most common mood: {weeklySummary.mostCommonMood} · {weeklySummary.lessonsCount} lessons · {weeklySummary.conversationDays} conversation(s)
          </Text>
        </Animated.View>
      )}
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  greetingBlock: {
    marginBottom: 20,
  },
  shimmer: {
    minHeight: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusSubtitle: { fontSize: 15, color: TEXT_SECONDARY, marginTop: 4 },
  centralRingWrap: { alignItems: 'center', marginBottom: 24 },
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
  gaugeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gaugeTile: {
    width: '31%',
    minWidth: 100,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  gaugeTilePressed: { backgroundColor: '#16161F' },
  gaugeTileRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gaugeTileValue: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  gaugeTileLabel: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  gaugeTileSub: { fontSize: 10, color: TEXT_MUTED, marginTop: 2 },
  gaugeTileStatus: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 4 },
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
  feelingCard: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  feelingCardInner: { alignItems: 'center' },
  feelingQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  feelingFaces: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  feelingFace: { fontSize: 28 },
  feelingHint: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  affirmationCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  affirmation: {
    fontSize: 18,
    color: COLORS.textMuted,
    lineHeight: 26,
    fontStyle: 'italic',
  },
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
