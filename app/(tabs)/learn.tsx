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
  Dimensions,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
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

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardHover: '#16161F',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.12)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.15)',
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

function getSectionProgress(section: ManualSection, isLessonCompleted: (id: string) => boolean) {
  let total = 0, completed = 0;
  section.modules.forEach((m) => m.lessons.forEach((l) => {
    total++;
    if (isLessonCompleted(l.id)) completed++;
  }));
  return { completed, total };
}

// Premium Discovery Card
function DiscoveryCard({
  discovery,
  showLearnMore,
  onToggleLearnMore,
  onDismiss,
  onAskGauge,
}: {
  discovery: Discovery;
  showLearnMore: boolean;
  onToggleLearnMore: () => void;
  onDismiss: () => void;
  onAskGauge?: () => void;
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
      
      <View style={styles.discoveryActions}>
        <Pressable style={styles.discoveryAction} onPress={onToggleLearnMore}>
          <Text style={styles.discoveryActionText}>
            {showLearnMore ? 'Less' : 'More'}
          </Text>
        </Pressable>
        {onAskGauge && (
          <Pressable style={styles.discoveryAction} onPress={onAskGauge}>
            <Text style={styles.discoveryActionText}>Ask Gauge</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const initialDiscoveries = useMemo(() => getDiscoveriesForDay(), []);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState<Discovery[]>(initialDiscoveries);
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
  }, []);

  const allManualIds = getAllManualLessonIds();
  const totalManualLessons = allManualIds.length;
  const completedManualCount = allManualIds.filter((id) => isLessonCompleted(id)).length;
  const progressPercent = totalManualLessons ? Math.round((completedManualCount / totalManualLessons) * 100) : 0;

  const handleOpenLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lessonId}` as const);
  };

  const toggleSection = (sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const openActivity = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'talk') return router.push('/(tabs)/talk');
    if (id === 'journal') return router.push('/(modals)/new-journal');
    router.push(`/(modals)/activity?id=${id}`);
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Learn</Text>
          <Text style={styles.heroSubtitle}>Your emotional intelligence journey</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Human Manual</Text>
              <Text style={styles.progressStats}>{completedManualCount} of {totalManualLessons} lessons</Text>
            </View>
            <View style={styles.progressPercent}>
              <Text style={styles.progressPercentText}>{progressPercent}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Manual Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Human Manual</Text>
          <Text style={styles.sectionSubtitle}>Everything they should have taught you</Text>
          
          {MANUAL_SECTIONS.map((section) => {
            const { completed, total } = getSectionProgress(section, isLessonCompleted);
            const isExpanded = expandedSectionId === section.id;
            const progressPct = total ? Math.round((completed / total) * 100) : 0;
            
            return (
              <View key={section.id} style={styles.manualCard}>
                <Pressable
                  style={styles.manualHeader}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={[styles.manualIconWrap, { backgroundColor: section.color + '20' }]}>
                    <Text style={styles.manualIcon}>{section.emoji}</Text>
                  </View>
                  <View style={styles.manualHeaderText}>
                    <Text style={styles.manualTitle}>{section.title}</Text>
                    <Text style={styles.manualSubtitle}>{section.subtitle}</Text>
                    <View style={styles.manualMiniProgress}>
                      <View style={styles.manualMiniBar}>
                        <View style={[styles.manualMiniFill, { width: `${progressPct}%`, backgroundColor: section.color }]} />
                      </View>
                      <Text style={styles.manualMiniText}>{completed}/{total}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </Pressable>

                {isExpanded && (
                  <View style={styles.modulesContainer}>
                    {section.modules.map((module) => (
                      <View key={module.id} style={styles.moduleBlock}>
                        <Text style={styles.moduleHeader}>{module.emoji} {module.title}</Text>
                        {module.lessons.map((lesson, idx) => {
                          const done = isLessonCompleted(lesson.id);
                          return (
                            <Pressable
                              key={lesson.id}
                              style={[styles.lessonRow, idx === module.lessons.length - 1 && styles.lessonRowLast]}
                              onPress={() => handleOpenLesson(lesson.id)}
                            >
                              <View style={[styles.lessonStatus, done && styles.lessonStatusDone]}>
                                {done && <Ionicons name="checkmark" size={12} color="#fff" />}
                              </View>
                              <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                              <Text style={[styles.lessonTitle, done && styles.lessonTitleDone]} numberOfLines={2}>
                                {lesson.title}
                              </Text>
                              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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

        <View style={{ height: 100 }} />
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
    paddingBottom: 24,
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

  // Progress Card
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressPercent: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPercentText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },

  // Sections
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

  // Manual Cards
  manualCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  manualIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualIcon: {
    fontSize: 24,
  },
  manualHeaderText: {
    flex: 1,
    marginLeft: 14,
  },
  manualTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  manualSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  manualMiniProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  manualMiniBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  manualMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  manualMiniText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Modules & Lessons
  modulesContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  moduleBlock: {
    paddingTop: 16,
  },
  moduleHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lessonRowLast: {
    borderBottomWidth: 0,
  },
  lessonStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonStatusDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  lessonEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  lessonTitleDone: {
    color: COLORS.textMuted,
  },

  // Discovery Cards
  discoveryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
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
    fontSize: 32,
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
  discoveryActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  discoveryAction: {
    paddingVertical: 8,
  },
  discoveryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
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
