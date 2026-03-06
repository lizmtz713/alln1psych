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
import { CockpitShareButton, ShareCockpitChip } from '../../src/components/home/CockpitShareButton';
import { WinButton } from '../../src/components/wins/WinButton';
import { HabitsWidget } from '../../src/components/habits/HabitsWidget';
import { LifeWrappedPreview } from '../../src/components/home/LifeWrappedPreview';
import { ForecastCard } from '../../src/components/forecast/ForecastCard';
import { GaugeTriggeredSuggestions } from '../../src/components/home/GaugeTriggeredSuggestions';
import { DailyInsight } from '../../src/components/home/DailyInsight';
import { YourLifeTodaySection } from '../../src/components/home/YourLifeTodaySection';
import { CockpitCluster } from '../../src/components/CockpitCluster';
import { CockpitContextStrip, type ContextItem } from '../../src/components/home/CockpitContextStrip';
import { CockpitStatusHeader } from '../../src/components/home/CockpitStatusHeader';
import { CockpitPriorities, type PriorityItem } from '../../src/components/home/CockpitPriorities';
import { CockpitSignalsPreview } from '../../src/components/home/CockpitSignalsPreview';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore } from '../../src/stores/lightsStore';
import { getDailyReachOuts } from '../../src/services/friendshipMaintenance';
import { selectHero } from '../../src/services/heroEngine';
import type { Light } from '../../src/types/lights';
import { useToolSuggestions } from '../../src/hooks/useToolSuggestions';
import { getJustInTimeLessons, type JustInTimeLesson } from '../../src/services/justInTimeLearning';
import { getMostUrgentWarning, type PredictiveWarning } from '../../src/services/predictiveWarnings';
import { useCrisisPipelineCheck } from '../../src/components/CrisisPipelineAlert';
import { shouldSuggestAwe } from '../../src/services/aweNudge';
import { useAdaptiveHomeSections, usePendingInvitation } from '../../src/hooks/useOnboarding';
import { FeatureInvitationModal } from '../../src/components/onboarding/FeatureInvitationModal';
import { markLowStateSeen, markLowConnectionSeen, ensureFirstLaunchDate } from '../../src/services/onboardingService';

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
  { key: 'help', label: 'Help', icon: '🆘', route: '/(modals)/help-someone' },
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
  { key: 'body', label: 'Body', icon: '🫀', route: '/(modals)/foundation-body' },
  // Media & more
  { key: 'news-my-way', label: 'News My Way', icon: '📰', route: '/news-my-way' },
  // Conversation & support
  { key: 'pre-check', label: 'Pre-Check', icon: '✅', route: '/(modals)/pre-conversation-check' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/(modals)/reach-out-scaffold' },
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
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/(modals)/reach-out-scaffold' },
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

  const membersSafe = Array.isArray(members) ? members : [];
  const lights = useLightsStore(
    useShallow((s) => {
      try {
        return s.getLights(membersSafe);
      } catch {
        return [];
      }
    })
  );
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
        label: `Transmit to ${heroNameForSignals ?? 'someone'}`,
        sublabel: 'Send encouragement',
        emoji: '💜',
        route: '/(tabs)/signals',
        params: heroLight?.id ? { hero: heroLight.id } : undefined,
      });
    }
    toolSuggestions.slice(0, 4 - items.length).forEach((s, i) => {
      items.push({
        id: `suggestion-${i}-${s.toolKey}`,
        label: s.label,
        sublabel: s.reason ?? undefined,
        emoji: s.icon ?? '✨',
        route: (s.route as string) ?? '',
      });
    });
    return items.slice(0, 4);
  }, [overall, activeGaugeCount, heroLight, heroNameForSignals, toolSuggestions]);

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
      {/* 1. Pre-Flight / status header */}
      <CockpitStatusHeader
        firstName={(user?.name ?? '').trim().split(/\s+/)[0] || 'there'}
        systemStatusLabel={getSystemScoreLabel(overall)}
        summaryLine={cockpitContextItems.length > 0 ? cockpitContextItems[0].label : (showInsight && typeof crossSystemInsight === 'string' && crossSystemInsight ? crossSystemInsight.slice(0, 80) + (crossSystemInsight.length > 80 ? '…' : '') : undefined)}
      />

      {/* 2. System cluster — six gauges + center score */}
      {sections.showCockpit && (
      <View style={styles.cockpitSection}>
        <CockpitCluster
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
        />
        <Pressable
          style={styles.gaugeInfoIcon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowGaugeInfo(true);
          }}
        >
          <Text style={styles.gaugeInfoIconText}>ⓘ</Text>
        </Pressable>
        <View style={styles.cockpitShareRow}>
          <CockpitShareButton compact />
          <ShareCockpitChip />
          <WinButton />
        </View>
        {/* 3. Context strip — why gauges look the way they do */}
        <CockpitContextStrip items={cockpitContextItems} sectionTitle="Context affecting your system" />
      </View>
      )}

      {/* 4. Today's priorities — 2–4 cards */}
      {sections.showCockpit && cockpitPriorityItems.length > 0 && (
        <CockpitPriorities items={cockpitPriorityItems} />
      )}

      {/* 5. Key insights — 1–3 short insights */}
      {sections.showPsychSays && (
      <Animated.View style={[styles.card, styles.psychCard, slideY(card1)]}>
        <Text style={styles.psychLabel}>Key insights</Text>
        <Text style={styles.psychText}>{psychSaysContent}</Text>
      </Animated.View>
      )}

      {/* 6. Helpful right now — curated tools, not full grid */}
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

      {/* 7. Signals preview — shortcut to relationships */}
      <CockpitSignalsPreview
        needAttentionCount={needAttentionCount}
        heroName={heroNameForSignals}
        heroId={heroLight?.id}
      />

      {/* 8. Trends / patterns — lower on page */}
      {weeklySummary && (
      <View style={[styles.section, { paddingHorizontal: 20 }]}>
        <Text style={styles.sectionTitle}>This week</Text>
        <Text style={[styles.psychText, { marginTop: 4 }]} numberOfLines={2}>{weeklySummary.line}</Text>
      </View>
      )}

      {/* 9. Manual bite — one small card */}
      {sections.showDiscovery && discoveryPreview && (
        <Animated.View style={[styles.card, slideY(card2)]}>
          <Text style={styles.cardSectionTitle}>Manual</Text>
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

      {/* 10. Reflection prompt */}
      <Pressable
        style={[styles.card, { marginHorizontal: 20, marginBottom: SPACING.md }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(tabs)/me');
        }}
      >
        <Text style={styles.cardSectionTitle}>Reflection</Text>
        <Text style={styles.psychText}>What felt most meaningful today?</Text>
        <Text style={[styles.discoveryTapHint, { marginTop: 8 }]}>Tap to open Journal →</Text>
      </Pressable>

      <HabitsWidget />

      {sections.showDailyInsight && <DailyInsight />}

      {/* Greeting + Streak — smaller text */}
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

      {/* Affirmation, Try This, weekly summary text */}
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

      {sections.showWeeklyInsight && weeklySummary && (
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
  cockpitSection: { alignItems: 'center', marginBottom: 16, position: 'relative' },
  cockpitTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  gaugeInfoIcon: { padding: 8, marginLeft: 4 },
  gaugeInfoIconText: { fontSize: 16, color: '#FFFFFF' },
  cockpitShareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 },
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
