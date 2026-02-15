import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { useEducationStore, userAgeToContentAge } from '../../src/stores/educationStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useDailyContentStore } from '../../src/stores/dailyContentStore';
import { generateDailyContent } from '../../src/services/personalization';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myTemperature, myTemperatureLabel, members } = useCircleStore();
  const user = useUserStore();
  useConversationStore((s) => s.messages.length);
  useJournalStore((s) => s.entries.length);
  useEducationStore((s) => ({ lastLessonDate: s.lastLessonDate, completedLessons: s.completedLessons }));
  const getEngagementStreak = useInsightsStore((s) => s.getEngagementStreak);
  const getPsychSays = useInsightsStore((s) => s.getPsychSays);
  const getWeeklySummary = useInsightsStore((s) => s.getWeeklySummary);
  const getNextLesson = useEducationStore((s) => s.getNextLesson);
  const streak = getEngagementStreak();
  const weeklySummary = getWeeklySummary();
  const nextLesson = getNextLesson(userAgeToContentAge(user.ageGroup));
  const { getTodayChallenge, isTodayChallengeDone, completeTodayChallenge } = useEngagementStore();
  const { content: dailyContent, isLoading: dailyContentLoading, setContent: setDailyContent, setLoading: setDailyContentLoading, isStale } = useDailyContentStore();
  const moodTrend = useInsightsStore((s) => s.getWeeklyMoodTrend)();

  useEffect(() => {
    if (!dailyContent || isStale()) {
      setDailyContentLoading(true);
      generateDailyContent({
        name: user.name || 'there',
        ageGroup: user.ageGroup ?? 'unknown',
        recentMoods: moodTrend.map((t) => t.mood),
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
      {/* 1. Greeting + daily affirmation */}
      <Animated.View style={[styles.greetingBlock, slideY(card0)]}>
        {dailyContentLoading ? (
          <View style={styles.shimmer}>
            <Text style={styles.greeting}>Loading your space...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.greeting}>{greetingLine}</Text>
            <Text style={styles.affirmation}>{affirmation}</Text>
          </>
        )}
      </Animated.View>

      {/* 2. Temperature gauge + Check in */}
      <Animated.View style={[styles.card, styles.tempCard, slideY(card0)]}>
        <View style={styles.cardRow}>
          <TemperatureGauge temperature={myTemperature} size="md" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>You're feeling</Text>
            <Text style={styles.cardLabel}>{myTemperatureLabel}</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.checkInButton, pressed && { transform: [{ scale: 0.96 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/mood-checkin');
          }}
        >
          <Text style={styles.checkInButtonText}>Check in</Text>
        </Pressable>
      </Animated.View>

      {/* 3. Streak counter */}
      {streak > 0 && (
        <Animated.View style={[styles.streakRow, slideY(card1)]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {streak}-day streak
          </Text>
        </Animated.View>
      )}

      {/* 4. Today's Challenge */}
      <Animated.View style={[styles.card, slideY(card1)]}>
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

      {/* 5. Psych Says */}
      <Animated.View style={[styles.card, styles.psychCard, slideY(card2)]}>
        <Text style={styles.psychLabel}>Psych says...</Text>
        <Text style={styles.psychText}>{psychSays}</Text>
      </Animated.View>

      {/* 6. Weekly Summary (Sundays only) */}
      {weeklySummary && (
        <Animated.View style={[styles.card, styles.weeklyCard, slideY(card2)]}>
          <Text style={styles.cardSectionTitle}>Your week in review</Text>
          <Text style={styles.weeklyLine}>{weeklySummary.line}</Text>
          <Text style={styles.weeklyMeta}>
            Most common mood: {weeklySummary.mostCommonMood} · {weeklySummary.lessonsCount} lessons · {weeklySummary.conversationDays} conversation(s)
          </Text>
        </Animated.View>
      )}

      {/* 7. Circle alerts */}
      {members.length > 0 && (
        <Animated.View style={[styles.section, slideY(card3)]}>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <Text style={styles.muted}>
            {members.length} {members.length === 1 ? 'person' : 'people'} in your circle
          </Text>
          {firstAlert && (
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
          )}
        </Animated.View>
      )}

      {/* Try an activity — rotate by time of day */}
      <Animated.View style={[styles.card, slideY(card3)]}>
        <Text style={styles.cardSectionTitle}>Try this</Text>
        {(() => {
          const hour = new Date().getHours();
          const morning = hour >= 5 && hour < 12;
          const afternoon = hour >= 12 && hour < 17;
          const evening = hour >= 17;
          const id = morning ? 'breathing' : afternoon ? 'emotion-wheel' : 'body-scan';
          const config = id === 'breathing'
            ? { emoji: '🌬️', title: 'Breathe with me', sub: 'Box breathing — 4 in, 4 hold, 4 out. Calms your nervous system.' }
            : id === 'emotion-wheel'
            ? { emoji: '🎯', title: 'Emotion Explorer', sub: 'Name your feelings with precision. Tap the wheel and explore.' }
            : { emoji: '🧍', title: 'Body Check', sub: 'Tap where you feel tension. Connect body and emotions.' };
          return (
            <Pressable
              style={({ pressed }) => [styles.practiceCard, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/(modals)/activity?id=${id}`);
              }}
            >
              <Text style={styles.practiceEmoji}>{config.emoji}</Text>
              <Text style={styles.practiceTitle}>{config.title}</Text>
              <Text style={styles.practiceSub}>{config.sub}</Text>
            </Pressable>
          );
        })()}
      </Animated.View>

      {/* Quick actions */}
      <Animated.View style={[styles.quickActions, slideY(card3)]}>
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
          <Text style={styles.quickActionText}>Practice a conversation</Text>
        </Pressable>
      </Animated.View>

      {/* 9. Today's Lesson */}
      {nextLesson && (
        <Animated.View style={[styles.card, styles.practiceCard, slideY(card4)]}>
          <Text style={styles.cardSectionTitle}>Today's lesson</Text>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/lesson/${nextLesson.id}`);
            }}
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
    marginBottom: 8,
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
  practiceEmoji: { fontSize: 28, marginBottom: 8 },
  practiceTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  practiceSub: { fontSize: 15, color: COLORS.textMuted },
  prompt: { fontSize: 17, color: COLORS.accent },
});
