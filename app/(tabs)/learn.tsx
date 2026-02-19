import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  getAllManualLessonIds,
  type ManualSection,
  type ManualLesson,
} from '../../src/data/manualContent';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.06)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.12)',
  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.15)',
  locked: '#3A3A4A',
};

// The 6 Gauges - Core System Explanation
const GAUGE_SYSTEM = {
  intro: "You are not broken. You are a system. And now you have a dashboard.",
  philosophy: "Most self-help treats you like a problem to fix. InGauge treats you like a machine to understand. These 6 gauges are your operating system — check them regularly, and you'll finally know what's actually going on inside.",
  gauges: [
    {
      id: 'body',
      emoji: '🫀',
      name: 'Body',
      color: '#F87171',
      tagline: 'The hardware running everything',
      description: "Sleep, food, water, movement, hormones. Your body is the foundation. When it's depleted, everything else crashes. You can't think clearly when you're dehydrated. You can't regulate emotions on 4 hours of sleep. Fix the body first.",
      whenLow: "Check basics: When did you last eat? Drink water? Sleep? Move? Your 'emotional problem' might be a blood sugar problem.",
      science: "Sleep deprivation amplifies amygdala reactivity by 60%. Your brain literally can't regulate emotions properly when tired.",
    },
    {
      id: 'state',
      emoji: '⚡',
      name: 'State',
      color: '#FACC15',
      tagline: 'Your nervous system right now',
      description: "Are you activated (fight/flight), calm (rest/digest), or shut down (freeze)? Your state determines how you perceive everything. The same comment from your partner feels fine when you're calm and like an attack when you're activated.",
      whenLow: "You're either revved up or shut down. Breathing, movement, or being near someone calm can shift your state. You can't think your way out — regulate the body first.",
      science: "Your nervous system runs faster than thought. That's why 'just calm down' doesn't work. The body must be regulated before the mind can follow.",
    },
    {
      id: 'emotion',
      emoji: '💜',
      name: 'Emotion',
      color: '#A78BFA',
      tagline: 'What you're actually feeling',
      description: "Not just 'good' or 'bad' — there are 27+ documented emotions. The more precisely you can name what you feel, the better your brain can process it. Anger usually masks something more vulnerable underneath.",
      whenLow: "Name it to tame it. Use the emotion wheel. Ask: what's underneath this? Anger often hides hurt, fear, or powerlessness.",
      science: "Emotional granularity (precise naming) predicts mental health outcomes. People with more emotion words have better regulation.",
    },
    {
      id: 'connection',
      emoji: '🤝',
      name: 'Connection',
      color: '#4ADE80',
      tagline: 'Your relationship to others',
      description: "Humans are wired for connection. Loneliness isn't just sad — it's processed by your brain like physical pain. Quality matters more than quantity. One real conversation beats 100 shallow ones.",
      whenLow: "Reach out to someone. Not a text — a real conversation. Your nervous system literally calms down in the presence of safe others.",
      science: "Social exclusion activates the same brain regions as physical injury. Connection is a biological need, not a luxury.",
    },
    {
      id: 'direction',
      emoji: '🧭',
      name: 'Direction',
      color: '#38BDF8',
      tagline: 'Purpose and momentum',
      description: "Do you know where you're going? Even small progress toward something meaningful changes your brain chemistry. Without direction, even rest feels restless.",
      whenLow: "You might be lost, not lazy. What's one small step toward something that matters to you? Direction comes from action, not clarity.",
      science: "Goal pursuit releases dopamine — the momentum molecule. Small wins matter more than big plans.",
    },
    {
      id: 'alignment',
      emoji: '⚖️',
      name: 'Alignment',
      color: '#F472B6',
      tagline: 'Living your values',
      description: "Are your actions matching your values? When they don't, you feel it — as guilt, shame, or that vague sense something's off. Alignment isn't perfection; it's honesty about the gap.",
      whenLow: "Where's the mismatch? What do you value that you're not honoring? Sometimes the stress isn't external — it's internal conflict.",
      science: "Value-action gaps increase cortisol and reduce wellbeing. Your body knows when you're out of integrity.",
    },
  ],
};

const TOOLKIT_ACTIVITIES = [
  { id: 'talk', emoji: '💬', title: 'Talk to Gauge', sub: 'Your AI companion' },
  { id: 'journal', emoji: '📓', title: 'Journal', sub: 'Write & reflect' },
  { id: 'breathing', emoji: '🫁', title: 'Breathing', sub: '2-min reset' },
  { id: 'emotion-wheel', emoji: '🎯', title: 'Emotion Decoder', sub: 'Name the feeling' },
  { id: 'body-scan', emoji: '🧍', title: 'Body Scan', sub: 'Map your stress' },
  { id: 'thought-challenger', emoji: '🧠', title: 'Thought Lab', sub: 'Test assumptions' },
  { id: 'emotion-match', emoji: '🎮', title: 'Pattern Match', sub: 'Find the source' },
  { id: 'trigger-map', emoji: '🗺️', title: 'Trigger Map', sub: 'Trace reactions' },
  { id: 'gratitude-jar', emoji: '✨', title: 'Gratitude', sub: 'Rewire your brain' },
  { id: 'stress-thermo', emoji: '🌡️', title: 'Stress Check', sub: 'Measure activation' },
  { id: 'comm-builder', emoji: '💬', title: 'Comm Lab', sub: 'Difficult talks' },
  { id: 'mood-patterns', emoji: '📊', title: 'Mood Intel', sub: 'Spot trends' },
];

// Flatten all lessons for card-based display
function getAllLessons(): { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] {
  const result: { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] = [];
  MANUAL_SECTIONS.forEach((section) => {
    section.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        result.push({ lesson, section, moduleTitle: module.title });
      });
    });
  });
  return result;
}

// Lesson Card Component - the core of the new design
function LessonCard({
  lesson,
  section,
  moduleTitle,
  isCompleted,
  isExpanded,
  onToggle,
  onOpenFull,
}: {
  lesson: ManualLesson;
  section: ManualSection;
  moduleTitle: string;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenFull: () => void;
}) {
  const intro = lesson.content.adult.introduction;
  const shortIntro = intro.length > 120 ? intro.slice(0, 120) + '...' : intro;

  return (
    <View style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}>
      {/* Status indicator */}
      <View style={[styles.lessonStatus, isCompleted && styles.lessonStatusDone]}>
        {isCompleted ? (
          <Ionicons name="checkmark" size={14} color="#fff" />
        ) : (
          <View style={styles.lessonStatusLocked} />
        )}
      </View>

      <Pressable style={styles.lessonCardMain} onPress={onToggle}>
        {/* Big Emoji */}
        <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>

        {/* Title + Module tag */}
        <View style={styles.lessonCardHeader}>
          <Text style={styles.lessonCardCategory}>{moduleTitle}</Text>
          <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
        </View>

        {/* One-liner preview */}
        {!isExpanded && (
          <Text style={styles.lessonCardPreview} numberOfLines={2}>
            {shortIntro}
          </Text>
        )}
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.lessonExpanded}>
          {/* Full introduction */}
          <Text style={styles.lessonExpandedIntro}>{intro}</Text>

          {/* Key Concepts */}
          {lesson.content.adult.keyConcepts.length > 0 && (
            <View style={styles.conceptsSection}>
              <Text style={styles.conceptsTitle}>Key Concepts</Text>
              {lesson.content.adult.keyConcepts.map((concept, i) => (
                <View key={i} style={styles.conceptItem}>
                  <Text style={styles.conceptName}>{concept.title}</Text>
                  <Text style={styles.conceptExplanation}>{concept.explanation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Deep Dive preview */}
          {lesson.deepDive && (
            <View style={styles.deepDiveSection}>
              <Text style={styles.deepDiveTitle}>Deep Dive</Text>
              <Text style={styles.deepDiveText} numberOfLines={4}>
                {lesson.deepDive}
              </Text>
            </View>
          )}

          {/* Try This */}
          {lesson.tryThis && (
            <View style={styles.tryThisSection}>
              <Text style={styles.tryThisTitle}>✨ Try This</Text>
              <Text style={styles.tryThisText}>{lesson.tryThis}</Text>
            </View>
          )}

          {/* Action button */}
          <Pressable style={styles.lessonAction} onPress={onOpenFull}>
            <Text style={styles.lessonActionText}>Open Full Lesson</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
          </Pressable>
        </View>
      )}

      {/* Tap hint */}
      {!isExpanded && (
        <Pressable style={styles.tapHint} onPress={onToggle}>
          <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

// Discovery Card
function DiscoveryCard({
  discovery,
  showLearnMore,
  onToggleLearnMore,
  onDismiss,
}: {
  discovery: Discovery;
  showLearnMore: boolean;
  onToggleLearnMore: () => void;
  onDismiss: () => void;
}) {
  const translateX = useState(() => new Animated.Value(0))[0];

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
    onPanResponderMove: (_, g) => { if (g.dx < 0) translateX.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -80 || g.vx < -0.3) {
        Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }).start(onDismiss);
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
      }
    },
  }), [translateX, onDismiss]);

  return (
    <Animated.View style={[styles.discoveryCard, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <Pressable onPress={onToggleLearnMore}>
        <View style={styles.discoveryHeader}>
          <Text style={styles.discoveryEmoji}>{discovery.emoji}</Text>
          <Text style={styles.discoveryCategory}>{getCategoryTag(discovery.category)}</Text>
        </View>
        <Text style={styles.discoveryTitle}>{discovery.title}</Text>
        <Text style={styles.discoveryContent}>{discovery.content}</Text>

        {showLearnMore && discovery.expanded && (
          <View style={styles.discoveryExpandedWrap}>
            <Text style={styles.discoveryExpanded}>{discovery.expanded}</Text>
          </View>
        )}

        <Text style={styles.discoveryTap}>
          {showLearnMore ? 'Tap to collapse' : 'Tap to learn more'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);

  // Get all lessons flattened
  const allLessonsData = useMemo(() => getAllLessons(), []);

  // Track which lesson card is expanded
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Track which section filter is active (null = all)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Gauge system state
  const [expandedGaugeId, setExpandedGaugeId] = useState<string | null>(null);

  const handleToggleGauge = useCallback((gaugeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGaugeId((prev) => (prev === gaugeId ? null : gaugeId));
  }, []);

  // Discovery state
  const initialDiscoveries = useMemo(() => getDiscoveriesForDay(), []);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState<Discovery[]>(initialDiscoveries);
  const [learnMoreDiscoveryId, setLearnMoreDiscoveryId] = useState<string | null>(null);
  const shownDiscoveryIds = useMemo(() => new Set(visibleDiscoveries.map((d) => d.id)), [visibleDiscoveries]);

  // Filter lessons by section
  const filteredLessons = useMemo(() => {
    if (!activeSectionId) return allLessonsData;
    return allLessonsData.filter((l) => l.section.id === activeSectionId);
  }, [allLessonsData, activeSectionId]);

  // Progress
  const allManualIds = getAllManualLessonIds();
  const totalManualLessons = allManualIds.length;
  const completedManualCount = allManualIds.filter((id) => isLessonCompleted(id)).length;
  const progressPercent = totalManualLessons ? Math.round((completedManualCount / totalManualLessons) * 100) : 0;

  const handleToggleLesson = useCallback((lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  }, []);

  const handleOpenLesson = useCallback((lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/lesson/${lessonId}` as const);
  }, [router]);

  const handleShowMoreDiscoveries = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const more = getMoreDiscoveries(shownDiscoveryIds);
    if (more.length > 0) setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [shownDiscoveryIds]);

  const handleDismissDiscovery = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleDiscoveries((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const openActivity = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'talk') return router.push('/(tabs)/talk');
    if (id === 'journal') return router.push('/(modals)/new-journal');
    router.push(`/(modals)/activity?id=${id}`);
  }, [router]);

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Learn</Text>
          <Text style={styles.heroSubtitle}>Your emotional intelligence journey</Text>
        </View>

        {/* Meet Your Gauges - THE CORE CONCEPT */}
        <View style={styles.gaugeSystemSection}>
          <View style={styles.gaugeSystemHeader}>
            <Text style={styles.gaugeSystemTitle}>Meet Your Gauges</Text>
            <Text style={styles.gaugeSystemTagline}>{GAUGE_SYSTEM.intro}</Text>
          </View>
          
          <Text style={styles.gaugeSystemPhilosophy}>{GAUGE_SYSTEM.philosophy}</Text>

          {/* 6 Gauge Cards */}
          {GAUGE_SYSTEM.gauges.map((gauge) => {
            const isExpanded = expandedGaugeId === gauge.id;
            return (
              <Pressable
                key={gauge.id}
                style={styles.gaugeCard}
                onPress={() => handleToggleGauge(gauge.id)}
              >
                <View style={styles.gaugeCardHeader}>
                  <View style={[styles.gaugeIconWrap, { backgroundColor: gauge.color + '20' }]}>
                    <Text style={styles.gaugeIcon}>{gauge.emoji}</Text>
                  </View>
                  <View style={styles.gaugeCardHeaderText}>
                    <Text style={[styles.gaugeName, { color: gauge.color }]}>{gauge.name}</Text>
                    <Text style={styles.gaugeTagline}>{gauge.tagline}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </View>

                {isExpanded && (
                  <View style={styles.gaugeCardExpanded}>
                    <Text style={styles.gaugeDescription}>{gauge.description}</Text>
                    
                    <View style={[styles.gaugeCallout, { backgroundColor: gauge.color + '15' }]}>
                      <Text style={[styles.gaugeCalloutTitle, { color: gauge.color }]}>When it's low</Text>
                      <Text style={styles.gaugeCalloutText}>{gauge.whenLow}</Text>
                    </View>

                    <View style={styles.gaugeScienceBox}>
                      <Text style={styles.gaugeScienceTitle}>🧬 The Science</Text>
                      <Text style={styles.gaugeScienceText}>{gauge.science}</Text>
                    </View>
                  </View>
                )}

                {!isExpanded && (
                  <Text style={styles.gaugePreview} numberOfLines={2}>{gauge.description}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <Text style={styles.progressNumber}>{progressPercent}</Text>
            <Text style={styles.progressPercent}>%</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Human Manual</Text>
            <Text style={styles.progressSubtitle}>
              {completedManualCount} of {totalManualLessons} lessons unlocked
            </Text>
          </View>
        </View>

        {/* Section Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <Pressable
            style={[styles.filterPill, !activeSectionId && styles.filterPillActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSectionId(null);
            }}
          >
            <Text style={[styles.filterPillText, !activeSectionId && styles.filterPillTextActive]}>
              All
            </Text>
          </Pressable>
          {MANUAL_SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              style={[styles.filterPill, activeSectionId === section.id && styles.filterPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSectionId(section.id);
              }}
            >
              <Text style={styles.filterPillEmoji}>{section.emoji}</Text>
              <Text style={[styles.filterPillText, activeSectionId === section.id && styles.filterPillTextActive]}>
                {section.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lesson Cards */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>
            {activeSectionId
              ? MANUAL_SECTIONS.find((s) => s.id === activeSectionId)?.title
              : 'All Lessons'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredLessons.length} lessons • Tap to reveal
          </Text>

          {filteredLessons.map(({ lesson, section, moduleTitle }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              section={section}
              moduleTitle={moduleTitle}
              isCompleted={isLessonCompleted(lesson.id)}
              isExpanded={expandedLessonId === lesson.id}
              onToggle={() => handleToggleLesson(lesson.id)}
              onOpenFull={() => handleOpenLesson(lesson.id)}
            />
          ))}
        </View>

        {/* Discovery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Discovery</Text>
              <Text style={styles.sectionSubtitle}>What nobody taught you in school</Text>
            </View>
            <Text style={styles.sectionIcon}>🔮</Text>
          </View>

          {visibleDiscoveries.map((d) => (
            <DiscoveryCard
              key={d.id}
              discovery={d}
              showLearnMore={learnMoreDiscoveryId === d.id}
              onToggleLearnMore={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLearnMoreDiscoveryId((cur) => (cur === d.id ? null : d.id));
              }}
              onDismiss={() => handleDismissDiscovery(d.id)}
            />
          ))}

          <Pressable style={styles.showMoreBtn} onPress={handleShowMoreDiscoveries}>
            <Text style={styles.showMoreText}>Discover more</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
          </Pressable>
        </View>

        {/* Toolkit Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your Toolkit</Text>
              <Text style={styles.sectionSubtitle}>Practical tools for everyday life</Text>
            </View>
            <Text style={styles.sectionIcon}>🧰</Text>
          </View>

          <View style={styles.toolkitGrid}>
            {TOOLKIT_ACTIVITIES.map((tool) => (
              <Pressable
                key={tool.id}
                style={styles.toolkitItem}
                onPress={() => openActivity(tool.id)}
              >
                <Text style={styles.toolkitEmoji}>{tool.emoji}</Text>
                <Text style={styles.toolkitTitle}>{tool.title}</Text>
                <Text style={styles.toolkitSub}>{tool.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 20,
  },

  // Hero
  hero: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Gauge System Section
  gaugeSystemSection: {
    marginBottom: 32,
  },
  gaugeSystemHeader: {
    marginBottom: 16,
  },
  gaugeSystemTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  gaugeSystemTagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  gaugeSystemPhilosophy: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  gaugeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeIcon: {
    fontSize: 28,
  },
  gaugeCardHeaderText: {
    flex: 1,
    marginLeft: 14,
  },
  gaugeName: {
    fontSize: 20,
    fontWeight: '700',
  },
  gaugeTagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gaugePreview: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 12,
  },
  gaugeCardExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  gaugeDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: 16,
  },
  gaugeCallout: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  gaugeCalloutTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  gaugeCalloutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  gaugeScienceBox: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 14,
  },
  gaugeScienceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  gaugeScienceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Progress Section
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 4,
  },
  progressInfo: {
    marginLeft: 20,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Filter Pills
  filterScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.accentSoft,
  },
  filterPillEmoji: {
    fontSize: 16,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.accent,
  },

  // Lessons Section
  lessonsSection: {
    marginBottom: 32,
  },

  // Lesson Card
  lessonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  lessonCardCompleted: {
    borderWidth: 1,
    borderColor: COLORS.successSoft,
  },
  lessonStatus: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.locked,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lessonStatusDone: {
    backgroundColor: COLORS.success,
  },
  lessonStatusLocked: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  lessonCardMain: {
    padding: 20,
    paddingRight: 56,
  },
  lessonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  lessonCardHeader: {
    marginBottom: 8,
  },
  lessonCardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lessonCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 26,
  },
  lessonCardPreview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tapHint: {
    alignItems: 'center',
    paddingBottom: 12,
  },

  // Expanded Lesson Content
  lessonExpanded: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lessonExpandedIntro: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  conceptsSection: {
    marginBottom: 20,
  },
  conceptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  conceptItem: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  conceptName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  conceptExplanation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  deepDiveSection: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  deepDiveTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  deepDiveText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tryThisSection: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  tryThisTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 8,
  },
  tryThisText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  lessonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  lessonActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Section Shared
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionIcon: {
    fontSize: 24,
  },

  // Discovery Cards
  discoveryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discoveryEmoji: {
    fontSize: 36,
  },
  discoveryCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  discoveryContent: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  discoveryExpandedWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discoveryExpanded: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  discoveryTap: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '500',
    marginTop: 14,
  },

  // Show More
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Toolkit
  toolkitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolkitItem: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  toolkitEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolkitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  toolkitSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
