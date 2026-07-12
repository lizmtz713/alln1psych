import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCockpitStore, type GaugeKey, computeSystemMode } from '../../src/stores/cockpitStore';
import { useCockpitMoodHydration } from '../../src/hooks/useCockpitMoodHydration';
import { useBodyMaintenanceHydration } from '../../src/hooks/useBodyMaintenanceHydration';
import { useInsightsStore } from '../../src/stores/insightsStore';
import {
  GAUGE_CONFIG,
  getOverallStatusLabel,
  getGaugeStatusLabel,
  getGaugeColor,
  getSystemScoreLabel,
} from '../../src/utils/gaugeHelpers';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useEducationStore, userAgeToContentAge } from '../../src/stores/educationStore';
import type { Lesson } from '../../src/data/educationContent';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { generateDailyContent } from '../../src/services/personalization';
import { getDiscoveriesForDay } from '../../src/data/discoveries';
import { Ionicons } from '@expo/vector-icons';
import { HomeHeader } from '../../src/components/HomeHeader';
import { WeeklyInsightPrompt } from '../../src/components/home/WeeklyInsightPrompt';
import { WeeklyInsightCard as UnifiedInsightCard } from '../../src/components/insights/WeeklyInsightCard';
import { HabitsWidget } from '../../src/components/habits/HabitsWidget';
import { LifeWrappedPreview } from '../../src/components/home/LifeWrappedPreview';
import { ForecastCard } from '../../src/components/forecast/ForecastCard';
import { GaugeTriggeredSuggestions } from '../../src/components/home/GaugeTriggeredSuggestions';
import { DailyInsight } from '../../src/components/home/DailyInsight';
import { YourLifeTodaySection } from '../../src/components/home/YourLifeTodaySection';
import { CockpitCluster } from '../../src/components/CockpitCluster';
import type { ContextItem } from '../../src/components/home/CockpitContextStrip';
import { CockpitStatusHeader } from '../../src/components/home/CockpitStatusHeader';
import { CockpitPriorities, type PriorityItem } from '../../src/components/home/CockpitPriorities';
import { CockpitSignalsPreview } from '../../src/components/home/CockpitSignalsPreview';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore } from '../../src/stores/lightsStore';
import { useGoalsStore } from '../../src/stores/goalsStore';
import { getDailyReachOuts } from '../../src/services/friendshipMaintenance';
import { selectHero } from '../../src/services/heroEngine';
import type { Light } from '../../src/types/lights';
import { useToolSuggestions } from '../../src/hooks/useToolSuggestions';
import { getJustInTimeLessons, type JustInTimeLesson } from '../../src/services/justInTimeLearning';
import { getMostUrgentWarning, type PredictiveWarning } from '../../src/services/predictiveWarnings';
import { useCrisisPipelineCheck } from '../../src/components/CrisisPipelineAlert';
import { shouldSuggestAwe } from '../../src/services/aweNudge';
import { useAdaptiveHomeSections, useExperienceLevel, usePendingInvitation } from '../../src/hooks/useOnboarding';
import { useSyncCockpitToFleet } from '../../src/hooks/useSyncCockpitToFleet';
import { FeatureInvitationModal } from '../../src/components/onboarding/FeatureInvitationModal';
import { markLowStateSeen, markLowConnectionSeen, ensureFirstLaunchDate } from '../../src/services/onboardingService';
import { getPrimarySuggestionWithPersonalization } from '../../src/services/driverAwareSuggestions';
import { getPatternInsights, getTopDriverThisWeek, weeklyLineAddsNewInfo } from '../../src/services/checkInPatternInsights';
import { getWhatUsuallyHelps, getWhatUsuallyHelpsForAction } from '../../src/services/whatUsuallyHelps';
import { getForecast } from '../../src/services/forecastService';
import { getReciprocityThisWeek } from '../../src/services/reciprocityService';
import { getPersonalStrategy } from '../../src/services/personalStrategyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COCKPIT_FIRST_VISIT_KEY = 'cockpit_first_visit_done';

type ActivitySuggestion = { id: string; emoji: string; title: string; sub: string };

type ToolItem = { key: string; label: string; icon: string; route: string };

const ALL_TOOLS: ToolItem[] = [
  // Core 9 (current)
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode' },
  { key: 'resolve', label: 'Resolve', icon: '🤝', route: '/(modals)/resolve' },
  { key: 'roleplay', label: 'Role Play', icon: '🎭', route: '/(modals)/role-play' },
  { key: 'referee', label: 'Referee', icon: '⚖️', route: '/(modals)/referee' },
  { key: 'replay', label: 'Replay', icon: '🔄', route: '/(modals)/replay' },
  { key: 'relate', label: 'Relate', icon: '💬', route: '/(modals)/relate' },
  { key: 'prompts', label: 'Prompts', icon: '✨', route: '/(modals)/prompt-generator' },
  { key: 'love', label: 'Love', icon: '❤️', route: '/(modals)/love' },
  { key: 'help', label: 'Help', icon: '🆘', route: '/tools/help-someone' },
  // Relationship & self
  { key: 'datesume', label: 'Datesume', icon: '💝', route: '/love/datesume' },
  { key: 'love-history', label: 'Love History', icon: '💔', route: '/love-history' },
  { key: 'attraction', label: 'Attraction', icon: '💫', route: '/(modals)/attraction' },
  { key: 'attachment', label: 'Attachment', icon: '🌳', route: '/(modals)/attachment-style' },
  { key: 'boundaries', label: 'Boundaries', icon: '🚧', route: '/(modals)/boundaries' },
  { key: 'difficult', label: 'Difficult People', icon: '👤', route: '/(modals)/difficult-people' },
  { key: 'flags', label: 'Flags', icon: '🚩', route: '/(modals)/red-green-flags' },
  { key: 'critical', label: 'Think', icon: '🧠', route: '/(modals)/critical-thinking' },
  // Body & systems
  { key: 'body', label: 'Body', icon: '🫀', route: '/foundation/body' },
  // Media & more
  { key: 'news-my-way', label: 'News My Way', icon: '📰', route: '/news-my-way' },
  // Conversation & support
  { key: 'pre-check', label: 'Pre-Check', icon: '✅', route: '/(modals)/pre-conversation-check' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/tools/reach-out' },
  { key: 'quick-reset', label: 'Quick Reset', icon: '🌬️', route: '/tools/quick-reset' },
  { key: 'focus', label: 'Focus', icon: '⏱️', route: '/tools/focus' },
  { key: 'habits', label: 'Habits', icon: '📋', route: '/habits' },
  { key: 'creativity', label: 'Creativity', icon: '✨', route: '/tools/creativity' },
  { key: 'decision', label: 'Decision', icon: '🔀', route: '/tools/decision' },
  { key: 'bias-check', label: 'Bias Check', icon: '🧠', route: '/tools/bias-check' },
  { key: 'share-insight', label: 'Share Insight', icon: '💡', route: '/(modals)/share-insight' },
  { key: 'drift', label: 'Drift', icon: '📐', route: '/(modals)/drift-detector' },
  { key: 'awe', label: 'Awe', icon: '🌟', route: '/(modals)/awe-activities' },
  { key: 'crisis', label: 'Crisis', icon: '🆘', route: '/(modals)/crisis-resources' },
  { key: 'learning-style', label: 'Learning Style', icon: '📚', route: '/(modals)/learning-style-quiz' },
];

/** Cockpit "Helpful right now" — context-aware, 6 tools max. Not the full grid. */
const HELPFUL_RIGHT_NOW_TOOLS: ToolItem[] = [
  { key: 'quick-reset', label: 'Quick Reset', icon: '🌬️', route: '/tools/quick-reset' },
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode' },
  { key: 'resolve', label: 'Resolve', icon: '🤝', route: '/(modals)/resolve' },
  { key: 'replay', label: 'Replay', icon: '🔄', route: '/(modals)/replay' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/tools/reach-out' },
  { key: 'boundaries', label: 'Boundaries', icon: '🚧', route: '/(modals)/boundaries' },
];

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

// Using design system colors (v2.0 - Oura-inspired)
const COCKPIT_BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

const AFFIRMATIONS = [
  "You're doing better than you think.",
  "Showing up is the hardest part. You did it.",
  "Progress isn't always visible. Trust the process.",
  "You don't have to be perfect to be growing.",
  "The fact that you're here means you care. That matters.",
  "Small steps still move you forward.",
  "You survived 100% of your worst days.",
  "Awareness is the first step. You're already ahead.",
  "Be patient with yourself. You're learning.",
  "Your effort counts, even when results are slow.",
];

function getTodayAffirmation(): string {
  return AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];
}

/** Relationship insight for Cockpit ↔ Signals loop (Observe → Act). */
function getRelationshipInsight(lights: Light[], needAttentionCount: number): string | null {
  const five = lights.filter((l) => l.tier === 'five');
  const innerCount = five.length;
  if (innerCount === 0) return null;
  if (needAttentionCount > 0) {
    return 'A moment for someone today can strengthen your week.';
  }
  const recentInFive = five.filter((l) => l.daysSinceContact <= 14).length;
  if (recentInFive >= innerCount && innerCount > 0) {
    return 'Your inner circle is strong right now.';
  }
  return null;
}

/** One system insight per day: cause, chain, or action. Based on gauge values. */
function getSystemInsightOfTheDay(
  body: number,
  state: number,
  emotion: number,
  connection: number,
  direction: number,
  alignment: number
): { text: string } {
  const gauges = [
    { key: 'body' as const, val: body, label: 'Body' },
    { key: 'state' as const, val: state, label: 'State' },
    { key: 'emotion' as const, val: emotion, label: 'Emotion' },
    { key: 'connection' as const, val: connection, label: 'Connection' },
    { key: 'direction' as const, val: direction, label: 'Direction' },
    { key: 'alignment' as const, val: alignment, label: 'Alignment' },
  ];
  const withValues = gauges.filter((g) => g.val >= 0);
  if (withValues.length === 0) {
    return { text: 'Check in to see how your system is doing and get a daily insight.' };
  }
  const low = withValues.filter((g) => g.val < 50);
  const high = withValues.filter((g) => g.val >= 75);
  const daySeed = new Date().getDate() + new Date().getMonth() * 31;

  const causeInsights: string[] = [
    'Connection tends to strengthen your emotional state.',
    'Sleep strongly affects your motivation and focus the next day.',
    'When Body is low, State and Emotion often follow.',
    'Reaching out to people you care about often improves how you feel.',
    'Rest and movement both support your emotional system.',
  ];
  const chainInsights: string[] = [
    'Low Body → often lowers State → which can lower Emotion. Supporting one helps the others.',
    'High Connection often supports Alignment—when relationships feel good, values feel clearer.',
    'State and Emotion are linked. Calming your nervous system can ease difficult feelings.',
    'Direction improves when Body and Connection are supported.',
    'Your gauges are connected. What supports one often supports others.',
  ];
  const actionInsights: string[] = [
    'Checking in with someone you care about often improves your emotional state.',
    'You tend to feel better when you move your body, even a little.',
    'A short check-in with yourself can clarify what your system needs today.',
    'Small steps—sleep, connection, or a moment of rest—add up across your system.',
    'Low state tends to reduce social interaction. A quick reset can help before reaching out.',
  ];

  if (low.some((g) => g.key === 'body') && daySeed % 3 === 0) {
    return { text: 'Sleep and rest strongly affect your other gauges. When Body is low, State and Emotion often follow.' };
  }
  if (high.some((g) => g.key === 'connection') && (emotion >= 0 ? emotion < 75 : true)) {
    return { text: causeInsights[daySeed % causeInsights.length] };
  }
  if (low.length >= 2) {
    return { text: chainInsights[daySeed % chainInsights.length] };
  }
  return { text: actionInsights[daySeed % actionInsights.length] };
}

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

const GAUGE_ICONS: Record<GaugeKey, string> = {
  body: 'body-outline',
  state: 'pulse',
  emotion: 'happy-outline',
  connection: 'people-outline',
  direction: 'flag-outline',
  alignment: 'checkmark-done-outline',
};

// Mini arc component for gauge tiles (Oura-inspired)
function MiniArc({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const isSet = value >= 0;
  const percent = isSet ? value / 100 : 0;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 1.5; // 270 degree arc
  const strokeDashoffset = circumference * (1 - percent);
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size }}>
        {/* Background arc */}
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: COLORS.border,
          borderBottomColor: 'transparent',
          transform: [{ rotate: '45deg' }],
        }} />
      </View>
      {isSet && (
        <View style={{ position: 'absolute', width: size, height: size }}>
          {/* Foreground arc */}
          <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomColor: 'transparent',
            borderRightColor: percent > 0.33 ? color : 'transparent',
            borderTopColor: percent > 0.66 ? color : 'transparent',
            transform: [{ rotate: '45deg' }],
            opacity: 0.9,
          }} />
        </View>
      )}
      <Text style={[styles.gaugeTileValue, { color: isSet ? COLORS.text : COLORS.textMuted }]}>
        {isSet ? Math.round(value) : '—'}
      </Text>
    </View>
  );
}

function GaugeTile({ gaugeId, onPress }: { gaugeId: GaugeKey; onPress: () => void }) {
  const gauge = useCockpitStore((s) => s[gaugeId]);
  const config = GAUGE_CONFIG[gaugeId];
  const value = gauge?.value ?? -1;
  // Use new gauge colors from design system
  const gaugeColorMap: Record<GaugeKey, string> = {
    body: COLORS.gauges.body,
    state: COLORS.gauges.state,
    emotion: COLORS.gauges.emotion,
    connection: COLORS.gauges.connection,
    direction: COLORS.gauges.direction,
    alignment: COLORS.gauges.alignment,
  };
  const color = gaugeColorMap[gaugeId];
  const status = getGaugeStatusLabel(value);

  return (
    <Pressable
      style={({ pressed }) => [styles.gaugeTile, pressed && styles.gaugeTilePressed]}
      onPress={onPress}
    >
      <MiniArc value={value} color={color} size={48} />
      <Text style={[styles.gaugeTileLabel, { color }]}>{config?.label ?? gaugeId}</Text>
      <Text style={[styles.gaugeTileStatus, value < 0 && styles.gaugeTileStatusDim]}>{status}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Server reopen: mood_checkins + body maintenance momentum_state (not AsyncStorage)
  useCockpitMoodHydration();
  useBodyMaintenanceHydration();
  useSyncCockpitToFleet();
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
  const systemMode = useCockpitStore((s) => s.systemMode);
  const checkInSystemImpact = useCockpitStore((s) => s.checkInSystemImpact);
  const checkInDrivers = useCockpitStore((s) => s.checkInDrivers);
  const checkInContext = useCockpitStore((s) => s.checkInContext);
  const checkInHistory = useCockpitStore((s) => s.checkInHistory);
  const recordSuggestedActionTaken = useCockpitStore((s) => s.recordSuggestedActionTaken);
  const suggestedActionsTaken = useCockpitStore((s) => s.suggestedActionsTaken);
  const connectionLogByMemberId = useLightsStore((s) => s.connectionLogByMemberId ?? {});
  const patternInsights = useMemo(() => getPatternInsights(checkInHistory), [checkInHistory]);
  const topDriverThisWeek = useMemo(() => getTopDriverThisWeek(checkInHistory), [checkInHistory]);
  const primarySuggestion = useMemo(
    () =>
      getPrimarySuggestionWithPersonalization(
        checkInSystemImpact ?? null,
        checkInDrivers ?? null,
        suggestedActionsTaken
      ),
    [checkInSystemImpact, checkInDrivers, suggestedActionsTaken]
  );
  const primaryPatternLine = patternInsights[0] ?? null;
  const showWeeklyInCard = useMemo(
    () => weeklyLineAddsNewInfo(primaryPatternLine, topDriverThisWeek),
    [primaryPatternLine, topDriverThisWeek]
  );
  const whatUsuallyHelpsList = useMemo(() => getWhatUsuallyHelps(suggestedActionsTaken), [suggestedActionsTaken]);
  const whatUsuallyHelpsForPrimary = useMemo(
    () =>
      primarySuggestion
        ? getWhatUsuallyHelpsForAction(primarySuggestion.id, suggestedActionsTaken)
        : null,
    [primarySuggestion?.id, suggestedActionsTaken]
  );

  const forecastItems = useMemo(
    () =>
      getForecast({
        gauges: {
          ...(bodyVal >= 0 && { body: bodyVal }),
          ...(stateVal >= 0 && { state: stateVal }),
          ...(connectionVal >= 0 && { connection: connectionVal }),
          ...(directionVal >= 0 && { direction: directionVal }),
        },
        checkInContext,
      }),
    [bodyVal, stateVal, connectionVal, directionVal, checkInContext]
  );

  const reciprocityResult = useMemo(
    () => getReciprocityThisWeek({ connectionLogByMemberId }),
    [connectionLogByMemberId]
  );

  const personalStrategyItems = useMemo(
    () =>
      getPersonalStrategy(
        suggestedActionsTaken.map((t) => ({
          actionId: t.actionId,
          takenAt: t.takenAt,
          gaugesAtTime: t.gaugesAtTime,
        })),
        checkInHistory.map((h) => ({ timestamp: h.timestamp, gauges: h.gauges }))
      ),
    [suggestedActionsTaken, checkInHistory]
  );

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
  
  // Just-in-Time Learning & Predictive Warnings
  const [jitLessons, setJitLessons] = useState<JustInTimeLesson[]>([]);
  const [predictiveWarning, setPredictiveWarning] = useState<PredictiveWarning | null>(null);
  const [dismissedJitIds, setDismissedJitIds] = useState<string[]>([]);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  
  // Awe Nudge — shows when Direction is low/stagnant
  const [showAweNudge, setShowAweNudge] = useState(false);
  const [dismissedAweNudge, setDismissedAweNudge] = useState(false);
  
  // Crisis Pipeline - monitors gauge persistence for safety alerts
  const { showAlert: showCrisisAlert, setShowAlert: setShowCrisisAlert, hasAlert: hasCrisisAlert } = useCrisisPipelineCheck();

  const sections = useAdaptiveHomeSections();
  const { daysSinceInstall } = useExperienceLevel();
  const [isFirstCockpitVisit, setIsFirstCockpitVisit] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(COCKPIT_FIRST_VISIT_KEY).then((v) => setIsFirstCockpitVisit(v !== '1'));
  }, []);
  useEffect(() => {
    if (sections.showCockpit && isFirstCockpitVisit === true) {
      AsyncStorage.setItem(COCKPIT_FIRST_VISIT_KEY, '1');
      setIsFirstCockpitVisit(false);
    }
  }, [sections.showCockpit, isFirstCockpitVisit]);
  const { invitation, refresh: refreshInvitation } = usePendingInvitation();

  useEffect(() => {
    useCockpitStore.getState().runDailyDecayIfNeeded();
    ensureFirstLaunchDate();
  }, []);

  // Compute system mode whenever gauges change
  useEffect(() => {
    if (activeGaugeCount > 0) {
      computeSystemMode();
    }
  }, [bodyVal, stateVal, emotionVal, connectionVal, directionVal, alignmentVal, activeGaugeCount, computeSystemMode]);

  // Load Just-in-Time lessons and Predictive Warnings when gauges change
  useEffect(() => {
    if (activeGaugeCount >= 3) {
      const gauges = {
        body: bodyVal >= 0 ? bodyVal : 50,
        state: stateVal >= 0 ? stateVal : 50,
        emotion: emotionVal >= 0 ? emotionVal : 50,
        connection: connectionVal >= 0 ? connectionVal : 50,
        direction: directionVal >= 0 ? directionVal : 50,
        alignment: alignmentVal >= 0 ? alignmentVal : 50,
      };
      
      // Get JIT lessons
      getJustInTimeLessons(gauges, systemMode).then(lessons => {
        const filtered = lessons.filter(l => !dismissedJitIds.includes(l.lessonId));
        setJitLessons(filtered);
      });
      
      // Get predictive warning
      getMostUrgentWarning().then(warning => {
        if (!dismissedWarning) {
          setPredictiveWarning(warning);
        }
      });
      
      // Check for Awe Nudge (Direction < 40 or stagnant)
      const directionTrend = useCockpitStore.getState().direction.trend;
      if (!dismissedAweNudge && directionVal >= 0) {
        shouldSuggestAwe(directionVal, directionTrend).then(should => {
          setShowAweNudge(should);
        });
      }
    }
  }, [bodyVal, stateVal, emotionVal, connectionVal, directionVal, alignmentVal, systemMode, activeGaugeCount, dismissedJitIds, dismissedWarning, dismissedAweNudge]);

  const handleDismissJitLesson = (lessonId: string) => {
    setDismissedJitIds(prev => [...prev, lessonId]);
    setJitLessons(prev => prev.filter(l => l.lessonId !== lessonId));
  };

  const handleDismissWarning = () => {
    setDismissedWarning(true);
    setPredictiveWarning(null);
  };

  useEffect(() => {
    if (activeGaugeCount >= 3 && !insightFetched) {
      useCockpitStore.getState().fetchCrossSystemInsight();
      setInsightFetched(true);
    }
  }, [activeGaugeCount, insightFetched]);
  const overallLabel = getOverallStatusLabel(overall);
  const showInsight = Boolean(crossSystemInsight && activeGaugeCount >= 3);
  /** Context layer for Cockpit (sleep, cycle, life events). Empty until context system is wired. */
  const cockpitContextItems: ContextItem[] = [];
  const ringColor = overall < 0 ? TEXT_MUTED : getGaugeColor(overall);

  const membersSafe = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const getLights = useLightsStore((s) => s.getLights);
  const lights = useMemo(() => {
    try {
      return getLights(membersSafe);
    } catch {
      return [];
    }
  }, [getLights, membersSafe]);
  const lastHeroShownByMemberId = useLightsStore(useShallow((s) => s.lastHeroShownByMemberId));
  const dailyReachOuts = useMemo(() => {
    try {
      return getDailyReachOuts(lights, 8);
    } catch {
      return { priority: [] as Light[], suggested: [] as Light[], rotate: [] as Light[] };
    }
  }, [lights]);
  const heroResult = useMemo(() => {
    try {
      return selectHero(lights, {
        momentumByMemberId: Object.fromEntries(
          lights
            .filter((l): l is Light & { momentumScore: number } => l.momentumScore != null)
            .map((l) => [l.id, l.momentumScore])
        ),
        lastHeroByMemberId: lastHeroShownByMemberId ?? {},
      });
    } catch {
      return null;
    }
  }, [lights, lastHeroShownByMemberId]);
  const heroLight = heroResult?.light ?? dailyReachOuts.priority?.[0] ?? dailyReachOuts.suggested?.[0];
  const heroNameForSignals = heroLight?.name;
  const needAttentionCount = (dailyReachOuts.priority?.length ?? 0) + (dailyReachOuts.suggested?.length ?? 0);

  const { suggestions: toolSuggestions } = useToolSuggestions({ limit: 2, requireGaugeData: true });
  const getGoalForTodayNudge = useGoalsStore((s) => s.getGoalForTodayNudge);
  const goalNudge = getGoalForTodayNudge();

  const priorityLabelMap: Record<string, string> = {
    resolve: 'Resolve tension',
    'role-play': 'Practice conversation',
    decode: 'Decode',
    replay: 'Replay',
    'reach-out': 'Reach out',
    boundaries: 'Boundaries',
  };
  const cockpitPriorityItems: PriorityItem[] = useMemo(() => {
    const needsCheckIn = overall < 0 || activeGaugeCount < 3;
    const items: PriorityItem[] = [];
    if (needsCheckIn) {
      items.push({
        id: 'check-in',
        label: 'Check in',
        sublabel: 'Reset your State',
        emoji: '🌡️',
        route: '/(modals)/cockpit-checkin',
      });
    }
    if (heroLight && items.length < 4) {
      items.push({
        id: 'transmit-hero',
        label: 'Send encouragement',
        sublabel: heroNameForSignals ?? 'Someone in your circle',
        emoji: '💜',
        route: '/(tabs)/people',
        params: heroLight?.id ? { hero: heroLight.id } : undefined,
      });
    }
    if (goalNudge && items.length < 4) {
      items.push({
        id: 'goal-nudge',
        label: goalNudge.dailyHint ?? `Progress on ${goalNudge.title}`,
        sublabel: goalNudge.dailyHint ? goalNudge.title : 'Take a small step',
        emoji: '🎯',
        route: '/profile/goals',
      });
    }
    toolSuggestions.slice(0, 4 - items.length).forEach((s, i) => {
      const displayLabel = priorityLabelMap[s.toolKey] ?? s.label;
      items.push({
        id: `suggestion-${i}-${s.toolKey}`,
        label: displayLabel,
        sublabel: s.reason ?? undefined,
        emoji: s.icon ?? '✨',
        route: (s.route as string) ?? '',
      });
    });
    return items.slice(0, 4);
  }, [overall, activeGaugeCount, heroLight, heroNameForSignals, goalNudge, toolSuggestions]);

  /** Single "Helpful right now" suggestion — one at a time to avoid decision paralysis. Verb-oriented CTAs. */
  const helpfulRightNow = useMemo((): { title: string; ctaLabel: string; route: string } | null => {
    if (!sections.showCockpit) return null;
    const isFirstDay = daysSinceInstall <= 1;
    const hasNoGauges = activeGaugeCount === 0;
    const lowEmotionOrState = (emotionVal >= 0 && emotionVal < 50) || (stateVal >= 0 && stateVal < 50);
    if (isFirstCockpitVisit !== false) {
      return { title: 'Try a quick emotional check-in', ctaLabel: 'Check in', route: '/(modals)/cockpit-checkin' };
    }
    if (isFirstDay || hasNoGauges) {
      return { title: 'Try a quick emotional check-in', ctaLabel: 'Check in', route: '/(modals)/cockpit-checkin' };
    }
    if (lowEmotionOrState) {
      return { title: 'Give yourself a quick reset', ctaLabel: 'Start reset', route: '/tools/quick-reset' };
    }
    if (needAttentionCount > 0) {
      return { title: 'Reach out to someone you trust', ctaLabel: 'Open People', route: '/(tabs)/people' };
    }
    return { title: 'Fix a message before sending', ctaLabel: 'Check tone', route: '/tools/tone-check' };
  }, [sections.showCockpit, isFirstCockpitVisit, daysSinceInstall, activeGaugeCount, emotionVal, stateVal, needAttentionCount]);

  let streak: number = 0;
  let weeklySummary: { mostCommonMood: string | null; checkInDays: number; lessonsCount: number; conversationDays: number; line: string } | null = null;
  let nextLesson: Lesson | null = null;
  let moodTrend: Array<{ date: string; mood: string }> = [];
  let summaryCount = 0;
  let greetingLine = getDynamicGreeting(user?.name ?? 'you');
  let affirmation = getTodayAffirmation();
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
    affirmation = dailyContent?.affirmation ?? getTodayAffirmation();
    psychSays = dailyContent?.insight ?? (typeof getPsychSays === 'function' ? getPsychSays(streak) : "You're doing better than you think.");
    todayChallenge = (typeof getTodayChallenge === 'function' ? getTodayChallenge() : null) ?? todayChallenge;
    challengeDone = typeof isTodayChallengeDone === 'function' ? isTodayChallengeDone() : false;
    challengeText = dailyContent?.challengeSuggestion ?? (todayChallenge?.text ?? challengeText);
    needsCheckIn = Array.isArray(members) ? members.filter((m) => m?.temperature === 'orange' || m?.temperature === 'red') : [];
    firstAlert = needsCheckIn[0];
  } catch (e) {
    if (__DEV__) console.error('Home screen setup error:', e);
    // Use defaults so we still render Cockpit (e.g. right after onboarding). Do not block with error screen.
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
      if (__DEV__) console.error('[Home] daily content effect', err);
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
  const [showCockpitMoreMenu, setShowCockpitMoreMenu] = useState(false);

  const slideY = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  const needsCheckInToday = overall < 0 || activeGaugeCount < 3;
  const psychSaysContent = showInsight && crossSystemInsight ? crossSystemInsight : psychSays;

  const systemInsightOfTheDay = useMemo(
    () =>
      getSystemInsightOfTheDay(
        bodyVal,
        stateVal,
        emotionVal,
        connectionVal,
        directionVal,
        alignmentVal
      ),
    [bodyVal, stateVal, emotionVal, connectionVal, directionVal, alignmentVal]
  );

  const cockpitTopPadding = Math.max(insets.top, 80);

  return (
    <ErrorBoundary>
    <ScrollView
      style={[styles.container, { paddingTop: cockpitTopPadding, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
    >
      {/* 1. Greeting + system status + top-right utilities */}
      <View style={styles.cockpitTopRow}>
        <View style={styles.cockpitHeaderWrap}>
          <CockpitStatusHeader
            firstName={(user?.name ?? '').trim().split(/\s+/)[0] || 'there'}
            systemStatusLabel={getSystemScoreLabel(overall)}
            summaryLine={cockpitContextItems.length > 0 ? cockpitContextItems[0].label : (showInsight && typeof crossSystemInsight === 'string' && crossSystemInsight ? crossSystemInsight.slice(0, 80) + (crossSystemInsight.length > 80 ? '…' : '') : undefined)}
          />
        </View>
        <Pressable
          style={styles.cockpitMoreBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCockpitMoreMenu(true);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </Pressable>
      </View>

      {/* One forecast surface only: strip when we have a risk line, else compact card (see docs/INTELLIGENCE-PRIORITY.md) */}
      {sections.showCockpit && forecastItems.length > 0 ? (
        <Pressable
          style={styles.forecastStripWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/forecast');
          }}
        >
          <View style={styles.forecastStrip}>
            <Text style={styles.forecastStripIcon}>🔮</Text>
            <View style={styles.forecastStripTextWrap}>
              <Text style={styles.forecastStripLine}>{forecastItems[0].line}</Text>
              {forecastItems[0].suggestion && (
                <Text style={styles.forecastStripSuggestion}>{forecastItems[0].suggestion}</Text>
              )}
            </View>
          </View>
        </Pressable>
      ) : sections.showCockpit ? (
        <ForecastCard
          compact
          body={bodyVal}
          state={stateVal}
          emotion={emotionVal}
          connection={connectionVal}
          direction={directionVal}
          alignment={alignmentVal}
          checkInContext={checkInContext}
        />
      ) : null}

      {/* 2. Needs care — thin strip above gauge (never over it) */}
      {sections.showCockpit && (() => {
        const gaugeEntries = [
          { key: 'body' as const, value: bodyVal },
          { key: 'state' as const, value: stateVal },
          { key: 'emotion' as const, value: emotionVal },
          { key: 'connection' as const, value: connectionVal },
          { key: 'direction' as const, value: directionVal },
          { key: 'alignment' as const, value: alignmentVal },
        ];
        const lowGauges = gaugeEntries.filter(({ value }) => value >= 0 && value < 50).sort((a, b) => a.value - b.value);
        const criticalGauges = lowGauges.filter(({ value }) => value < 30);
        if (lowGauges.length === 0) return null;
        const isCritical = criticalGauges.length > 0;
        const label = isCritical ? 'Pay attention' : 'Needs care';
        const names = lowGauges.map(({ key }) => GAUGE_CONFIG[key]?.label ?? key).join(' and ');
        return (
          <Pressable
            style={[styles.needsCareStrip, isCritical && styles.needsCareStripCritical]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(modals)/cockpit-checkin');
            }}
          >
            <Text style={styles.needsCareIcon}>⚠</Text>
            <View style={styles.needsCareTextWrap}>
              <Text style={styles.needsCareTitle}>{label}</Text>
              <Text style={styles.needsCareSub}>{names} are low{overall >= 0 ? ` (${Math.round(overall)})` : ''}</Text>
            </View>
            <Text style={styles.needsCareTap}>Tap to check in</Text>
          </Pressable>
        );
      })()}

      {/* Status line removed — "6/6 online" was unclear; green gauges already signal health */}

      {/* Moment of stillness — Pause opens breathing */}
      {sections.showCockpit && (
        <View style={styles.pauseRow}>
          <Pressable
            style={({ pressed }) => [styles.pauseBtn, pressed && styles.pauseBtnPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(modals)/activity?id=breathing');
            }}
            accessibilityLabel="Pause — Before you react, breathe"
          >
            <Text style={styles.pauseBtnText}>Pause check-ins</Text>
          </Pressable>
        </View>
      )}

      {/* 3. System cluster — six gauges + center score */}
      {sections.showCockpit && (
      <View style={styles.cockpitSection}>
        <CockpitCluster
          hideStatusHint
          gaugeValues={{
            body: bodyVal,
            state: stateVal,
            emotion: emotionVal,
            connection: connectionVal,
            direction: directionVal,
            alignment: alignmentVal,
          }}
          overall={overall}
          onCenterPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/cockpit-checkin');
          }}
          onGaugePress={(gauge) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/(modals)/gauge-detail?gauge=${gauge}`);
          }}
          leftSignalLines={[
            checkInContext?.sleep ? `Sleep: ${checkInContext.sleep}` : 'Sleep: —',
            bodyVal >= 0 && bodyVal < 50 ? 'Recovery: Low' : 'Recovery: —',
            'HRV: —',
          ]}
          rightSignalLines={[
            directionVal >= 0 && directionVal < 50 ? 'Focus load: High' : 'Focus load: —',
            (reciprocityResult?.given ?? 0) + (reciprocityResult?.received ?? 0) > 0 ? `Reach outs: ${(reciprocityResult?.given ?? 0) + (reciprocityResult?.received ?? 0)}` : 'Connection days: —',
            stateVal >= 0 && stateVal < 50 ? 'Task pressure: High' : 'Task pressure: —',
          ]}
        />
      </View>
      )}

      {/* Helpful right now — single contextual suggestion (just below gauges) */}
      {sections.showCockpit && helpfulRightNow && (
        <Pressable
          style={({ pressed }) => [styles.helpfulRightNowWrap, pressed && styles.helpfulRightNowPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(helpfulRightNow.route as any);
          }}
        >
          <Text style={styles.helpfulRightNowTitle}>Helpful right now</Text>
          <View style={styles.helpfulRightNowDivider} />
          <View style={styles.helpfulRightNowRow}>
            <View style={styles.helpfulRightNowContent}>
              <Text style={styles.helpfulRightNowSuggestion}>{helpfulRightNow.title}</Text>
              <Text style={styles.helpfulRightNowCta}>→ {helpfulRightNow.ctaLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} style={styles.helpfulRightNowArrow} />
          </View>
        </Pressable>
      )}

      {/* Compassion check — when State or Emotion are low */}
      {sections.showCockpit && ((stateVal >= 0 && stateVal < 50) || (emotionVal >= 0 && emotionVal < 50)) && (
        <View style={styles.compassionLine}>
          <Text style={styles.compassionText}>Be gentle with yourself today.</Text>
        </View>
      )}

      {/* 4. Influencing your system — one short line when body/connection low; else 3 lines max. Action from quick log when set. */}
      {sections.showCockpit && (psychSaysContent || systemInsightOfTheDay.text || primarySuggestion || patternInsights.length > 0) && (
        <Animated.View style={[styles.card, styles.influencingCard, slideY(card1)]}>
          <View style={styles.influencingCardHeader}>
            <Text style={styles.psychLabel}>Influencing your system</Text>
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowGaugeInfo(true);
              }}
              style={styles.influencingInfoIcon}
            >
              <Text style={styles.gaugeInfoIconText}>ⓘ</Text>
            </Pressable>
          </View>
          <Text style={styles.influencingShort} numberOfLines={3}>
            {bodyVal >= 0 && bodyVal < 50 && connectionVal >= 0 && connectionVal < 50
              ? 'Low body energy may be affecting connection today.'
              : (typeof psychSaysContent === 'string' && psychSaysContent)
                ? psychSaysContent
                : systemInsightOfTheDay.text || (primarySuggestion ? 'You logged what’s affecting your system.' : patternInsights.length > 0 ? 'Patterns from your recent check-ins.' : '')}
          </Text>
          {primarySuggestion && (
            <View style={styles.primarySuggestionWrap}>
              <Pressable
                style={styles.suggestedAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  recordSuggestedActionTaken({
                    actionId: primarySuggestion.id,
                    route: primarySuggestion.route,
                    label: primarySuggestion.label,
                    systemImpact: checkInSystemImpact ?? undefined,
                    drivers: checkInDrivers ?? undefined,
                    gaugesAtTime:
                      bodyVal >= 0 || stateVal >= 0 || emotionVal >= 0 || connectionVal >= 0 || directionVal >= 0 || alignmentVal >= 0
                        ? {
                            ...(bodyVal >= 0 && { body: bodyVal }),
                            ...(stateVal >= 0 && { state: stateVal }),
                            ...(emotionVal >= 0 && { emotion: emotionVal }),
                            ...(connectionVal >= 0 && { connection: connectionVal }),
                            ...(directionVal >= 0 && { direction: directionVal }),
                            ...(alignmentVal >= 0 && { alignment: alignmentVal }),
                          }
                        : undefined,
                  });
                  router.push(primarySuggestion.route as any);
                }}
              >
                <Text style={styles.suggestedActionText}>{primarySuggestion.label}</Text>
              </Pressable>
              {whatUsuallyHelpsForPrimary && (
                <Text style={styles.whatUsuallyHelpsLine}>{whatUsuallyHelpsForPrimary}</Text>
              )}
            </View>
          )}
          {(primaryPatternLine || (showWeeklyInCard && topDriverThisWeek)) && (
            <View style={styles.patternInsightsWrap}>
              {primaryPatternLine && (
                <Text style={styles.patternInsightText} numberOfLines={1}>{primaryPatternLine}</Text>
              )}
              {showWeeklyInCard && topDriverThisWeek && (
                <Text style={styles.patternInsightText} numberOfLines={1}>{topDriverThisWeek}</Text>
              )}
            </View>
          )}
          <Pressable onPress={() => router.push('/(tabs)/learn')} style={styles.influencingLearn}>
            <Text style={styles.systemTodayLearn}>Learn more in Manual →</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* 5. What matters today — priorities */}
      {sections.showCockpit && cockpitPriorityItems.length > 0 && (
        <CockpitPriorities items={cockpitPriorityItems} />
      )}

      {/* 5. Helpful right now — curated tools */}
      {sections.showToolsGrid && (
      <View style={[styles.quickActionsWrap, { paddingHorizontal: 20 }]}>
        <Text style={styles.cardSectionTitle}>Helpful right now</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          {HELPFUL_RIGHT_NOW_TOOLS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.quickActionPill, pressed && styles.quickActionPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route);
              }}
            >
              <Text style={styles.quickActionPillEmoji}>{item.icon}</Text>
              <Text style={styles.quickActionPillText}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      )}

      {/* 6. People signals */}
      <CockpitSignalsPreview
        needAttentionCount={needAttentionCount}
        heroName={heroNameForSignals}
        heroId={heroLight?.id}
        sectionTitle="People signals"
        relationshipInsight={getRelationshipInsight(lights, needAttentionCount)}
      />

      {/* 7. This week — trends (Sunday summary or pattern line from check-in history) */}
      {(weeklySummary || topDriverThisWeek) && (
      <View style={[styles.section, { paddingHorizontal: 20 }]}>
        <Text style={styles.sectionTitle}>This week</Text>
        {weeklySummary && (
          <Text style={[styles.psychText, { marginTop: 4 }]} numberOfLines={2}>{weeklySummary.line}</Text>
        )}
        {!weeklySummary && topDriverThisWeek && (
          <Text style={[styles.psychText, { marginTop: 4 }]}>{topDriverThisWeek}</Text>
        )}
      </View>
      )}

      {/* 8. Learn something small — Manual */}
      {sections.showDiscovery && discoveryPreview && (
        <Animated.View style={[styles.card, slideY(card2)]}>
          <Text style={styles.cardSectionTitle}>Learn something small</Text>
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

      {/* 9. Reflection — one deeper prompt (values, direction, impact) */}
      <View style={[styles.card, { marginHorizontal: 20, marginBottom: SPACING.md }]}>
        <Text style={styles.cardSectionTitle}>Reflection</Text>
        <Text style={styles.psychText}>What kind of work or contribution would make your life feel meaningful?</Text>
        <View style={{ flexDirection: 'row', marginTop: 10, gap: 12 }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/me'); }}
          >
            <Text style={styles.discoveryTapHint}>Journal →</Text>
          </Pressable>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/life-direction-finder'); }}
          >
            <Text style={styles.discoveryTapHint}>Explore direction →</Text>
          </Pressable>
        </View>
      </View>

      <HabitsWidget />

      {sections.showDailyInsight && <DailyInsight />}

      {/* Unified Insight Engine: 1–2 daily insights from gauges & check-ins */}
      {sections.showDailyInsight && <UnifiedInsightCard />}

      {/* Greeting + streak (compact) */}
      <View style={styles.greetingStreakRow}>
        {dailyContentLoading ? (
          <Text style={styles.greetingSmall}>Loading...</Text>
        ) : (
          <Text style={styles.greetingSmall}>{greetingLine}</Text>
        )}
        {streak > 0 && (
          <View style={[styles.streakRow, { marginBottom: 0 }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streak}-day streak</Text>
          </View>
        )}
      </View>

      {/* Daily perspective — 2 lines max */}
      <Animated.View style={[styles.card, styles.dailyPerspectiveCard, slideY(card2)]}>
        <Text style={styles.cardSectionTitle}>Daily perspective</Text>
        <Text style={styles.dailyPerspectiveText}>
          Your journey is unique.{'\n'}
          Today is a chance to invest in yourself.
        </Text>
      </Animated.View>

      {/* Try today — experiments / micro tools */}
      <Animated.View style={[styles.tryThisPillsWrap, slideY(card3)]}>
        <Text style={styles.cardSectionTitle}>Try today</Text>
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

      {sections.showWeeklyInsight && (weeklySummary || topDriverThisWeek || whatUsuallyHelpsList.length > 0 || reciprocityResult.line || personalStrategyItems.length > 0) && (
        <Animated.View style={[styles.card, styles.weeklyCard, slideY(card3)]}>
          <Text style={styles.cardSectionTitle}>Your week in review</Text>
          {weeklySummary && <Text style={styles.weeklyLine}>{weeklySummary.line}</Text>}
          {topDriverThisWeek && <Text style={styles.weeklyLine}>{topDriverThisWeek}</Text>}
          {reciprocityResult.line && (
            <Text style={styles.weeklyLine}>{reciprocityResult.line}</Text>
          )}
          {weeklySummary && (
            <Text style={styles.weeklyMeta}>
              Most common mood: {weeklySummary.mostCommonMood} · {weeklySummary.lessonsCount} lessons · {weeklySummary.conversationDays} conversation(s)
            </Text>
          )}
          {whatUsuallyHelpsList.length > 0 && (
            <View style={styles.whatHelpedWrap}>
              <Text style={styles.whatHelpedTitle}>What usually helps</Text>
              {whatUsuallyHelpsList.map((item) => (
                <Text key={item.actionId} style={styles.whatHelpedItem}>{item.copy}</Text>
              ))}
            </View>
          )}
          {personalStrategyItems.length > 0 && (
            <View style={styles.whatHelpedWrap}>
              <Text style={styles.whatHelpedTitle}>What works for you</Text>
              {personalStrategyItems.map((item, i) => (
                <Text key={`${item.actionId}-${item.gauge}-${i}`} style={styles.whatHelpedItem}>{item.copy}</Text>
              ))}
            </View>
          )}
        </Animated.View>
      )}
      {/* 3–5 deeper weekly insights (patterns, cause, growth) */}
      {sections.showWeeklyInsight && <UnifiedInsightCard context="weekly" />}

      {/* Cockpit more menu — Share snapshot, Export, Daily summary */}
      <Modal visible={showCockpitMoreMenu} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCockpitMoreMenu(false)}>
          <View style={styles.moreMenuCard} onStartShouldSetResponder={() => true}>
            <Pressable
              style={styles.moreMenuItem}
              onPress={() => {
                setShowCockpitMoreMenu(false);
                router.push('/share/cockpit');
              }}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.text} />
              <Text style={styles.moreMenuLabel}>Share snapshot</Text>
            </Pressable>
            <Pressable
              style={styles.moreMenuItem}
              onPress={() => {
                setShowCockpitMoreMenu(false);
                router.push('/(modals)/quick-log');
              }}
            >
              <Ionicons name="flash-outline" size={20} color={COLORS.text} />
              <Text style={styles.moreMenuLabel}>Quick log</Text>
            </Pressable>
            <Pressable
              style={styles.moreMenuItem}
              onPress={() => {
                setShowCockpitMoreMenu(false);
                router.push('/(modals)/share-insight');
              }}
            >
              <Ionicons name="document-text-outline" size={20} color={COLORS.text} />
              <Text style={styles.moreMenuLabel}>Export report</Text>
            </Pressable>
            <Pressable
              style={styles.moreMenuItem}
              onPress={() => {
                setShowCockpitMoreMenu(false);
                router.push('/(tabs)/me');
              }}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
              <Text style={styles.moreMenuLabel}>Daily summary</Text>
            </Pressable>
            <Pressable style={styles.moreMenuCancel} onPress={() => setShowCockpitMoreMenu(false)}>
              <Text style={styles.moreMenuCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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

      <FeatureInvitationModal
        invitation={invitation}
        onDismiss={refreshInvitation}
        onMarkLowState={markLowStateSeen}
        onMarkLowConnection={markLowConnectionSeen}
      />
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COCKPIT_BG },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  statusLabelWrap: { alignItems: 'center', marginBottom: SPACING.sm },
  statusLabelCaps: {
    ...TYPOGRAPHY.alert,
    color: COLORS.textSecondary,
  },
  centralRingWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  centralRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceGlass,
  },
  centralRingValue: {
    ...TYPOGRAPHY.scoreMd,
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  centralRingHint: { 
    fontSize: 12, 
    color: COLORS.textMuted, 
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  checkInButtonSmall: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  checkInButtonSmallText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  greetingStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gaugeGridRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  gaugeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, flex: 1 },
  cockpitTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingRight: 12 },
  cockpitHeaderWrap: { flex: 1, minWidth: 0 },
  cockpitMoreBtn: { padding: 8, marginTop: 4 },
  forecastStripWrap: { marginHorizontal: 20, marginBottom: 8, gap: 6 },
  forecastStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface ?? 'rgba(26, 21, 40, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.border ?? 'rgba(124, 77, 255, 0.3)',
    gap: 8,
  },
  forecastStripIcon: { fontSize: 16 },
  forecastStripTextWrap: { flex: 1, minWidth: 0 },
  forecastStripLine: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  forecastStripSuggestion: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },
  needsCareStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.amberBg ?? 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.amber ?? '#EAB308',
    gap: 10,
  },
  needsCareStripCritical: {
    backgroundColor: COLORS.error ? `${COLORS.error}18` : 'rgba(239, 68, 68, 0.12)',
    borderColor: COLORS.error ?? '#EF4444',
  },
  needsCareIcon: { fontSize: 16, color: COLORS.text },
  needsCareTextWrap: { flex: 1, minWidth: 0 },
  needsCareTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  needsCareSub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 1 },
  needsCareTap: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  clusterStatusLine: {
    alignItems: 'center',
    marginBottom: 6,
  },
  clusterStatusText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  pauseRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pauseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  pauseBtnPressed: { opacity: 0.85 },
  pauseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  compassionLine: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  helpfulRightNowWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  helpfulRightNowPressed: { opacity: 0.92 },
  helpfulRightNowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  helpfulRightNowDivider: {
    height: 1,
    backgroundColor: CARD_BORDER,
    marginBottom: 10,
  },
  helpfulRightNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulRightNowContent: { flex: 1, minWidth: 0 },
  helpfulRightNowSuggestion: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  helpfulRightNowCta: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  helpfulRightNowArrow: { marginLeft: 8 },
  compassionText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontStyle: 'italic',
  },
  cockpitSection: { alignItems: 'center', marginTop: 4, marginBottom: 16, position: 'relative' },
  cockpitTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  influencingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  influencingInfoIcon: { padding: 4 },
  gaugeInfoIconText: { fontSize: 14, color: COLORS.textMuted },
  moreMenuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 24,
    minWidth: 240,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  moreMenuLabel: { fontSize: 16, color: TEXT_PRIMARY, fontWeight: '500' },
  moreMenuCancel: { paddingVertical: 12, paddingHorizontal: 16, marginTop: 4, alignItems: 'center' },
  moreMenuCancelText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '500' },
  systemTodaySection: { marginBottom: 20, paddingHorizontal: 20 },
  systemTodayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  systemTodayCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  systemTodayCardPressed: { opacity: 0.92 },
  systemTodayIcon: { fontSize: 20, marginRight: 12 },
  systemTodayBody: { flex: 1, minWidth: 0 },
  systemTodayText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  systemTodayLearn: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
    marginTop: 8,
  },
  gaugeTile: {
    width: '31%',
    minWidth: 100,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
  },
  gaugeTilePressed: { backgroundColor: COLORS.surfaceElevated },
  gaugeTileRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  gaugeTileValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  gaugeTileLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
  },
  gaugeTileSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  gaugeTileStatus: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  gaugeTileStatusDim: { color: COLORS.textDim },
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
  streakEmoji: { fontSize: 14 },
  streakText: { fontSize: 13, color: TEXT_PRIMARY, fontWeight: '500' },
  insightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Cycle Context Section ───
  cycleSection: {
    marginBottom: 16,
  },

  // ─── Actions Section ───
  actionsSection: {
    marginBottom: 20,
  },
  actionsScroll: {
    paddingVertical: 4,
    gap: 10,
  },
  actionPill: {
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  cardSectionTitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 10,
  },
  psychCard: { borderLeftWidth: 4, borderLeftColor: ACCENT },
  influencingCard: { borderLeftWidth: 4, borderLeftColor: ACCENT, marginHorizontal: 20 },
  influencingShort: { fontSize: 15, color: TEXT_PRIMARY, lineHeight: 22, marginTop: 4 },
  influencingLearn: { marginTop: 10 },
  primarySuggestionWrap: { marginTop: 12 },
  suggestedAction: { paddingVertical: 8 },
  suggestedActionText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  whatUsuallyHelpsLine: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 4, marginLeft: 0 },
  patternInsightsWrap: { marginTop: 12, gap: 4 },
  patternInsightText: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },
  dailyPerspectiveCard: { marginHorizontal: 20 },
  dailyPerspectiveText: { fontSize: 16, color: TEXT_SECONDARY, lineHeight: 24, fontStyle: 'italic' },
  psychLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  psychText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  influencingContext: { marginBottom: 0 },
  influencingRow: { marginBottom: 6 },
  influencingLabel: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  influencingDetail: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  weeklyCard: {},
  weeklyLine: { fontSize: 16, color: TEXT_PRIMARY, marginBottom: 8, fontWeight: '500' },
  weeklyMeta: { fontSize: 14, color: TEXT_MUTED },
  whatHelpedWrap: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  whatHelpedTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  whatHelpedItem: { fontSize: 14, color: TEXT_PRIMARY, marginBottom: 4, fontStyle: 'italic' },
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
  quickActionPillEmoji: { fontSize: 20 },
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
