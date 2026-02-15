import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  getAllManualLessonIds,
  type ManualSection,
} from '../../src/data/manualContent';

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

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
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
