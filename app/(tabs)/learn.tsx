import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useUserStore } from '../../src/stores/userStore';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  getAllManualLessonIds,
  type ManualSection,
} from '../../src/data/manualContent';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';

const TOOLKIT_ACTIVITIES: { id: string; emoji: string; title: string; sub: string; route?: string; mode?: 'athlete' | 'spectrum' }[] = [
  // AI-Powered Tools (featured)
  { id: 'replay', emoji: '🔄', title: 'Replay', sub: 'Process what happened with AI', route: '/(modals)/replay' },
  { id: 'decode', emoji: '🔍', title: 'Decode', sub: 'Analyze messages and situations', route: '/(modals)/decode' },
  { id: 'relate', emoji: '💫', title: 'Relate', sub: 'Understand anyone deeply', route: '/(modals)/relate' },
  { id: 'referee', emoji: '⚖️', title: 'Referee', sub: 'Settle disputes fairly', route: '/(modals)/referee' },
  { id: 'love', emoji: '💕', title: 'Love', sub: 'Love, intimacy, connection', route: '/(modals)/love' },
  { id: 'help-someone', emoji: '🤝', title: 'Help Someone', sub: 'Support someone you care about', route: '/(modals)/help-someone' },
  { id: 'role-play', emoji: '🎭', title: 'Role Play', sub: 'Practice difficult conversations', route: '/(modals)/role-play' },
  // Self-guided activities
  { id: 'breathing', emoji: '🫁', title: 'Breathing Reset', sub: 'Regulate your nervous system' },
  { id: 'emotion-wheel', emoji: '🎯', title: 'Emotion Decoder', sub: "Identify what you're feeling" },
  { id: 'body-scan', emoji: '🧍', title: 'Body Awareness', sub: 'Map where stress lives' },
  { id: 'thought-challenger', emoji: '🧠', title: 'Thought Analysis', sub: 'Test your assumptions' },
  { id: 'gratitude-jar', emoji: '✨', title: 'Gratitude Practice', sub: "Focus on what's working" },
  { id: 'mood-patterns', emoji: '📊', title: 'Mood Intelligence', sub: 'Spot emotional trends' },
  // Athlete Mode activities
  { id: 'recovery-check', emoji: '🔋', title: 'Recovery Check', sub: 'Assess sleep, soreness, energy, mood', mode: 'athlete' },
  { id: 'pre-competition', emoji: '🏆', title: 'Pre-Competition', sub: 'Get in your optimal zone', mode: 'athlete' },
  { id: 'performance-debrief', emoji: '📋', title: 'Performance Debrief', sub: 'Process training or competition', mode: 'athlete' },
  { id: 'athlete-identity', emoji: '🌟', title: 'Beyond the Sport', sub: 'Who are you off the field?', mode: 'athlete' },
  // Spectrum Mode activities
  { id: 'sensory-check', emoji: '👁️', title: 'Sensory Check', sub: "What's affecting you right now?", mode: 'spectrum' },
  { id: 'stim-toolkit', emoji: '🌀', title: 'Stim Toolkit', sub: 'Regulation tools for different needs', mode: 'spectrum' },
  { id: 'social-script', emoji: '📝', title: 'Social Scripts', sub: 'Prepare for social situations', mode: 'spectrum' },
  { id: 'body-double', emoji: '👥', title: 'Body Double', sub: 'A gentle presence for focus', mode: 'spectrum' },
  { id: 'routine-builder', emoji: '📅', title: 'Routine Helper', sub: 'Build and track routines', mode: 'spectrum' },
  { id: 'emotion-cards', emoji: '🎴', title: 'Emotion Cards', sub: 'Picture-based emotions', mode: 'spectrum' },
];

function getSectionProgress(section: ManualSection, isLessonCompleted: (id: string) => boolean): { completed: number; total: number } {
  let total = 0;
  let completed = 0;
  section.modules.forEach((m) =>
    m.lessons.forEach((l) => {
      total++;
      if (isLessonCompleted(l.id)) completed++;
    })
  );
  return { completed, total };
}

function DiscoveryCard({
  discovery,
  contentOverride,
  expanded,
  showLearnMore,
  onToggleExpand,
  onToggleLearnMore,
  onDismiss,
  onAskPsych,
}: {
  discovery: Discovery;
  contentOverride?: string;
  expanded: boolean;
  showLearnMore: boolean;
  onToggleExpand: () => void;
  onToggleLearnMore: () => void;
  onDismiss: () => void;
  onAskPsych?: () => void;
}) {
  const displayContent = contentOverride ?? discovery.content;
  const translateX = useState(() => new Animated.Value(0))[0];
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
        onPanResponderMove: (_, g) => {
          if (g.dx < 0) translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx < -80 || g.vx < -0.3) {
            Animated.timing(translateX, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDismiss());
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
          }
        },
      }),
    [translateX, onDismiss]
  );

  return (
    <Animated.View
      style={[styles.discoveryCardWrap, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.discoveryCard} onPress={onToggleExpand}>
        <Text style={styles.discoveryCategoryTag}>{getCategoryTag(discovery.category)}</Text>
        <Text style={styles.discoveryEmoji}>{discovery.emoji}</Text>
        <Text style={styles.discoveryTitle}>{discovery.title}</Text>
        <Text style={styles.discoveryContent}>
          {displayContent}
        </Text>
        {discovery.expanded && (
          <>
            <Pressable style={styles.learnMoreToggle} onPress={(e) => { e.stopPropagation(); onToggleLearnMore(); }}>
              <Text style={styles.learnMoreToggleText}>{showLearnMore ? 'Hide' : 'Learn more'}</Text>
            </Pressable>
            {showLearnMore && (
              <Text style={styles.discoveryExpanded}>{discovery.expanded}</Text>
            )}
          </>
        )}
        {onAskPsych && (
          <Pressable style={styles.askPsychBtn} onPress={(e) => { e.stopPropagation(); onAskPsych(); }}>
            <Text style={styles.askPsychBtnText}>Ask Psych about this</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ageRange = useUserStore((s) => s.ageRange);
  const athleteMode = useUserStore((s) => s.athleteMode);
  const spectrumMode = useUserStore((s) => s.spectrumMode);
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);

  // Filter toolkit activities based on active modes
  const visibleToolkitActivities = useMemo(() => {
    return TOOLKIT_ACTIVITIES.filter((a) => {
      if (!a.mode) return true; // base activities always show
      if (a.mode === 'athlete') return athleteMode;
      if (a.mode === 'spectrum') return spectrumMode;
      return false;
    });
  }, [athleteMode, spectrumMode]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const initialDiscoveries = useMemo(() => getDiscoveriesForDay(), []);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState<Discovery[]>(initialDiscoveries);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = useState<string | null>(null);
  const [learnMoreDiscoveryId, setLearnMoreDiscoveryId] = useState<string | null>(null);

  const shownDiscoveryIds = useMemo(() => new Set(visibleDiscoveries.map((d) => d.id)), [visibleDiscoveries]);

  const handleShowMoreDiscoveries = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const more = getMoreDiscoveries(shownDiscoveryIds);
    if (more.length > 0) setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [shownDiscoveryIds]);

  const handleDismissDiscovery = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleDiscoveries((prev) => prev.filter((d) => d.id !== id));
    setExpandedDiscoveryId((cur) => (cur === id ? null : cur));
  }, []);

  const allManualIds = getAllManualLessonIds();
  const totalManualLessons = allManualIds.length;
  const completedManualCount = allManualIds.filter((id) => isLessonCompleted(id)).length;

  const handleOpenLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lessonId}` as const);
  };

  const toggleSection = (sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const openActivity = (id: string, route?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route) router.push(route as any);
    else router.push(`/(modals)/activity?id=${id}`);
  };

  return (
    <ErrorBoundary>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Human Manual — FIRST */}
      <Text style={styles.sectionLabel}>The Human Owner's Manual</Text>
      {MANUAL_SECTIONS.map((section) => {
        const { completed, total } = getSectionProgress(section, isLessonCompleted);
        const isExpanded = expandedSectionId === section.id;
        return (
          <View key={section.id} style={[styles.sectionCard, { borderLeftColor: section.color }]}>
            <Pressable
              style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}
              onPress={() => toggleSection(section.id)}
            >
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <View style={styles.sectionHeaderBody}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                <Text style={styles.sectionProgress}>
                  {completed} of {total} completed
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={TEXT_MUTED}
              />
            </Pressable>

            {isExpanded && (
              <View style={styles.modulesWrap}>
                {section.modules.map((module) => (
                  <View key={module.id} style={styles.moduleBlock}>
                    <Text style={styles.moduleTitle}>
                      {module.emoji} {module.title}
                    </Text>
                    {module.lessons.map((lesson) => {
                      const done = isLessonCompleted(lesson.id);
                      return (
                        <Pressable
                          key={lesson.id}
                          style={({ pressed }) => [styles.lessonRow, pressed && styles.pressed]}
                          onPress={() => handleOpenLesson(lesson.id)}
                        >
                          <View style={[styles.lessonCheck, done && styles.lessonCheckDone]}>
                            {done ? (
                              <Ionicons name="checkmark" size={14} color="#fff" />
                            ) : (
                              <View style={styles.lessonCheckEmpty} />
                            )}
                          </View>
                          <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                          <Text style={[styles.lessonTitle, done && styles.lessonTitleDone]} numberOfLines={2}>
                            {lesson.title}
                          </Text>
                          <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Overall progress */}
      <View style={styles.progressBarWrap}>
        <Text style={styles.progressLabel}>
          {completedManualCount} of {totalManualLessons} lessons completed
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${totalManualLessons ? (completedManualCount / totalManualLessons) * 100 : 0}%` },
            ]}
          />
        </View>
      </View>

      {/* 2. Discovery — SECOND */}
      <Text style={styles.sectionLabel}>Discovery 🔮</Text>
      <Text style={styles.discoverySubtitle}>The things nobody taught you in school</Text>
      <View style={styles.discoveryCardList}>
        {visibleDiscoveries.map((d) => (
          <DiscoveryCard
            key={d.id}
            discovery={d}
            contentOverride={d.ageAdaptive && ageRange ? d.ageAdaptive[ageRange] : undefined}
            expanded={expandedDiscoveryId === d.id}
            showLearnMore={learnMoreDiscoveryId === d.id}
            onToggleExpand={() => setExpandedDiscoveryId((cur) => (cur === d.id ? null : d.id))}
            onToggleLearnMore={() => setLearnMoreDiscoveryId((cur) => (cur === d.id ? null : d.id))}
            onDismiss={() => handleDismissDiscovery(d.id)}
          />
        ))}
      </View>
      <Pressable
        style={({ pressed }) => [styles.showMoreBtn, pressed && styles.pressed]}
        onPress={handleShowMoreDiscoveries}
      >
        <Text style={styles.showMoreBtnText}>Show me more</Text>
      </Pressable>

      {/* 3. Your Toolkit — THIRD at bottom */}
      <Text style={styles.sectionLabel}>Your Toolkit 🧰</Text>
      <View style={styles.toolkitGrid}>
        {visibleToolkitActivities.map((a) => (
          <Pressable
            key={a.id}
            style={({ pressed }) => [styles.toolkitCard, pressed && styles.pressed]}
            onPress={() => openActivity(a.id, a.route)}
          >
            <Text style={styles.toolkitEmoji}>{a.emoji}</Text>
            <Text style={styles.toolkitTitle} numberOfLines={2}>{a.title}</Text>
            <Text style={styles.toolkitSub} numberOfLines={2}>{a.sub}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
    </ErrorBoundary>
  );
}

const COCKPIT_BG = '#09090F';
const CARD_BG = '#111118';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_MUTED = '#8888A0';
const ACCENT = '#7C4DFF';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COCKPIT_BG },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  toolkitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  toolkitCard: {
    width: '47%',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  toolkitEmoji: { fontSize: 26, marginBottom: 6 },
  toolkitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  toolkitSub: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  discoverySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: -8,
    marginBottom: 16,
  },
  discoveryCardList: { marginBottom: 12 },
  discoveryCardWrap: { marginBottom: 12 },
  discoveryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  discoveryCategoryTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  discoveryEmoji: { fontSize: 28, marginBottom: 8 },
  discoveryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    paddingRight: 80,
  },
  discoveryContent: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  discoveryTapHint: {
    fontSize: 13,
    color: ACCENT,
    marginTop: 8,
  },
  learnMoreToggle: { marginTop: 10 },
  learnMoreToggleText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  discoveryExpanded: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginTop: 10,
  },
  askPsychBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    alignSelf: 'flex-start',
  },
  askPsychBtnText: { fontSize: 13, color: ACCENT },
  showMoreBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  showMoreBtnText: {
    fontSize: 15,
    color: ACCENT,
    fontWeight: '600',
  },
  progressBarWrap: { marginBottom: 24 },
  progressLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: CARD_BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderBody: { flex: 1, marginLeft: 12 },
  sectionEmoji: { fontSize: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  sectionProgress: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  modulesWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  moduleBlock: { marginTop: 16 },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.input,
  },
  lessonCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lessonCheckDone: {
    backgroundColor: ACCENT,
  },
  lessonCheckEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: TEXT_MUTED,
  },
  lessonEmoji: { fontSize: 18, marginRight: 8 },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  lessonTitleDone: { color: TEXT_MUTED },
  pressed: { opacity: 0.9 },
});
