import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useUserStore } from '../../src/stores/userStore';
import {
  useEducationStore,
  userAgeToContentAge,
} from '../../src/stores/educationStore';
import {
  getLessonById,
  getModuleByLessonId,
  getContentForAge,
} from '../../src/data/educationContent';

function renderBody(text: string): React.ReactNode[] {
  const lines = text.split(/\n\n+/);
  return lines.map((para, i) => {
    const bold = /\*\*(.+?)\*\*/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;
    while ((match = bold.exec(para)) !== null) {
      if (match.index > lastIndex) {
        parts.push(para.slice(lastIndex, match.index));
      }
      parts.push(
        <Text key={`${i}-${match.index}`} style={styles.bold}>
          {match[1]}
        </Text>
      );
      lastIndex = bold.lastIndex;
    }
    if (lastIndex < para.length) parts.push(para.slice(lastIndex));
    return (
      <Text key={i} style={styles.paragraph}>
        {parts}
      </Text>
    );
  });
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ageGroup = useUserStore((s) => s.ageGroup);
  const contentAge = userAgeToContentAge(ageGroup);
  const { completeLesson, saveReflection, reflections, isLessonCompleted } = useEducationStore();
  const [reflectionText, setReflectionText] = useState(reflections[id ?? ''] ?? '');

  const lesson = id ? getLessonById(id) : null;
  const module = lesson ? getModuleByLessonId(lesson.id) : null;
  const content = lesson ? getContentForAge(lesson, contentAge) : null;
  const completed = id ? isLessonCompleted(id) : false;

  if (!lesson || !content || !module) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.error}>Lesson not found.</Text>
      </View>
    );
  }

  const lessonIndex = module.lessons.findIndex((l) => l.id === lesson.id) + 1;

  const handleComplete = () => {
    saveReflection(lesson.id, reflectionText);
    completeLesson(lesson.id);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.moduleLabel}>
          {module.emoji} {module.title} · Lesson {lessonIndex}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{lesson.title}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{lesson.duration} min read</Text>
        </View>

        <View style={styles.body}>{renderBody(content.body)}</View>

        {content.exercise && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Try it</Text>
            <Text style={styles.cardBody}>{content.exercise}</Text>
          </View>
        )}

        {content.reflection && (
          <View style={styles.reflection}>
            <Text style={styles.reflectionQuestion}>{content.reflection}</Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Your thoughts (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
            />
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>{completed ? 'Done' : 'Complete'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surface,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  moduleLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  error: {
    fontSize: 16,
    color: COLORS.textMuted,
    padding: 24,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 34,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  durationText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  body: {
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.text,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  reflection: {
    marginBottom: 24,
  },
  reflectionQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  reflectionInput: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
  },
  completeButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  completeButtonPressed: {
    opacity: 0.9,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
});
