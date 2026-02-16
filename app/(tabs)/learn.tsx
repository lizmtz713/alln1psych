import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  getAllManualLessonIds,
  type ManualSection,
} from '../../src/data/manualContent';

const TOOLKIT_ACTIVITIES: { id: string; emoji: string; title: string; sub: string }[] = [
  { id: 'breathing', emoji: '🫁', title: 'Breathe', sub: 'Breathing exercise' },
  { id: 'emotion-wheel', emoji: '🎯', title: 'Emotion Wheel', sub: 'Explore your feelings' },
  { id: 'body-scan', emoji: '🧍', title: 'Body Scan', sub: 'Where do you feel it' },
  { id: 'thought-challenger', emoji: '🧠', title: 'Thought Challenger', sub: 'Reframe negative thoughts' },
  { id: 'emotion-match', emoji: '🎮', title: 'Emotion Match', sub: 'What would you feel' },
  { id: 'trigger-map', emoji: '🗺️', title: 'Trigger Map', sub: 'Map your patterns' },
  { id: 'gratitude-jar', emoji: '✨', title: 'Gratitude Jar', sub: 'Collect good moments' },
  { id: 'stress-thermo', emoji: '🌡️', title: 'Stress Check', sub: 'How stressed are you' },
  { id: 'comm-builder', emoji: '💬', title: 'Communication Builder', sub: 'Say what you feel' },
  { id: 'mood-patterns', emoji: '📊', title: 'Mood Patterns', sub: 'See your trends' },
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

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

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

  const openActivity = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(modals)/activity?id=${id}`);
  };

  return (
    <ErrorBoundary>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Your Toolkit — 10 activities at top */}
      <Text style={styles.sectionLabel}>Your Toolkit 🧰</Text>
      <View style={styles.toolkitGrid}>
        {TOOLKIT_ACTIVITIES.map((a) => (
          <Pressable
            key={a.id}
            style={({ pressed }) => [styles.toolkitCard, pressed && styles.pressed]}
            onPress={() => openActivity(a.id)}
          >
            <Text style={styles.toolkitEmoji}>{a.emoji}</Text>
            <Text style={styles.toolkitTitle} numberOfLines={2}>{a.title}</Text>
            <Text style={styles.toolkitSub} numberOfLines={2}>{a.sub}</Text>
          </Pressable>
        ))}
      </View>

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

      {/* Section cards */}
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
                color={COLORS.textMuted}
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
                          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
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
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  toolkitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  toolkitCard: {
    width: '47%',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  toolkitEmoji: { fontSize: 26, marginBottom: 6 },
  toolkitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  toolkitSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  progressBarWrap: { marginBottom: 24 },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.inputSurface,
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
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionProgress: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modulesWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  moduleBlock: { marginTop: 16 },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
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
    backgroundColor: COLORS.accent,
  },
  lessonCheckEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  lessonEmoji: { fontSize: 18, marginRight: 8 },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  lessonTitleDone: { color: COLORS.textMuted },
  pressed: { opacity: 0.9 },
});
