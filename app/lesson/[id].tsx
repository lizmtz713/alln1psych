import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
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
import { useJournalStore } from '../../src/stores/journalStore';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { sendMessageWithSystemPrompt, hasOpenAIKey } from '../../src/services/ai';
import * as Haptics from 'expo-haptics';
import {
  getLessonById,
  getModuleByLessonId,
  getContentForAge,
} from '../../src/data/educationContent';
import {
  getManualLessonById,
  getManualModuleByLessonId,
  getManualSectionByLessonId,
  contentAgeToManualAge,
} from '../../src/data/manualContent';

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
  const addJournalEntry = useJournalStore((s) => s.addEntry);
  const [reflectionText, setReflectionText] = useState(reflections[id ?? ''] ?? '');
  const [justCompleted, setJustCompleted] = useState(false);
  const [completionAiResponse, setCompletionAiResponse] = useState('');
  const [completionLoading, setCompletionLoading] = useState(false);
  const scrollRef = React.useRef<ScrollView>(null);

  const legacyLesson = id ? getLessonById(id) : null;
  const manualLesson = id ? getManualLessonById(id) : null;
  const isManual = !!manualLesson;

  const legacyModule = legacyLesson ? getModuleByLessonId(legacyLesson.id) : null;
  const manualModule = manualLesson ? getManualModuleByLessonId(manualLesson.id) : null;
  const manualSection = manualLesson ? getManualSectionByLessonId(manualLesson.id) : null;

  const legacyContent = legacyLesson ? getContentForAge(legacyLesson, contentAge) : null;
  const manualAge = contentAgeToManualAge(contentAge);
  const manualContent = manualLesson ? manualLesson.content[manualAge] : null;

  const lesson = legacyLesson ?? manualLesson;
  const module = legacyModule ?? manualModule;
  const content = legacyContent ?? manualContent;
  const completed = id ? isLessonCompleted(id) : false;

  if (!lesson || !content) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.error}>Lesson not found.</Text>
      </View>
    );
  }

  const lessonIndex = module
    ? module.lessons.findIndex((l: { id: string }) => l.id === lesson.id) + 1
    : 1;
  const headerLabel = module
    ? `${module.emoji} ${module.title}${lessonIndex ? ` · Lesson ${lessonIndex}` : ''}`
    : manualSection
      ? `${manualSection.emoji} ${manualSection.title}`
      : 'Manual';

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveReflection(lesson.id, reflectionText);
    completeLesson(lesson.id, reflectionText);
    if (reflectionText.trim()) {
      addJournalEntry(reflectionText.trim(), { source: 'manual' });
    }
    useCockpitStore.getState().addLessonBonus?.();
    setJustCompleted(true);
    if (reflectionText && reflectionText.trim().length > 5) {
      setCompletionLoading(true);
      setCompletionAiResponse('');
      try {
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `I just completed a lesson called "${lesson.title}". Here's what I reflected on: "${reflectionText}". Give me a brief, personalized insight connecting what I shared to the lesson. Be warm, specific to what I said. 2-3 sentences.` }],
          'You are Psych, an emotional intelligence companion. Give a brief personalized insight based on their reflection. Be warm and specific. Never generic.'
        );
        setCompletionAiResponse(response ?? '');
      } catch (e) {
        if (__DEV__) console.warn('Lesson AI response failed:', e);
      }
      setCompletionLoading(false);
    }
  };

  // Manual lesson layout (introduction, keyConcepts, reflectionPrompt)
  if (isManual && manualContent && 'introduction' in manualContent) {
    const mc = manualContent as { introduction: string; keyConcepts: { title: string; explanation: string }[]; reflectionPrompt: string };
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.moduleLabel}>{headerLabel}</Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{lesson.emoji} {lesson.title}</Text>
            <View style={styles.body}>
              {renderBody(mc.introduction)}
            </View>
            {mc.keyConcepts.map((kc, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{kc.title}</Text>
                <Text style={styles.cardBody}>{kc.explanation}</Text>
              </View>
            ))}
            <View style={styles.reflection}>
              <Text style={styles.reflectionQuestion}>{mc.reflectionPrompt}</Text>
              <TextInput
                style={styles.reflectionInput}
                placeholder="Your thoughts (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={reflectionText}
                onChangeText={setReflectionText}
                multiline
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
              />
            </View>
            {justCompleted ? (
              <>
                <View style={styles.completeSuccess}>
                  <Text style={styles.completeSuccessText}>Lesson complete ✓</Text>
                </View>
                {completionLoading && <ActivityIndicator color="#7C4DFF" style={{ marginTop: 12 }} />}
                {completionAiResponse ? (
                  <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                    <Text style={{ color: '#7C4DFF', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Psych says</Text>
                    <Text style={{ color: '#E0E0E0', fontSize: 15, lineHeight: 22 }}>{completionAiResponse}</Text>
                  </View>
                ) : null}
                <View style={styles.completeActions}>
                  <Pressable style={({ pressed }) => [styles.completeActionBtn, pressed && { opacity: 0.9 }]} onPress={() => router.push('/(tabs)/learn')}>
                    <Text style={styles.completeActionText}>Next lesson →</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.completeActionBtnSecondary, pressed && { opacity: 0.9 }]} onPress={() => router.back()}>
                    <Text style={styles.completeActionTextSecondary}>Back to Manual</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>{completed ? 'Done' : 'Complete'}</Text>
              </Pressable>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  // Legacy lesson layout (body, exercise, reflection)
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.moduleLabel}>{headerLabel}</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>{lesson.title}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{(lesson as { duration?: number }).duration ?? 5} min read</Text>
        </View>

        <View style={styles.body}>{renderBody((content as { body: string }).body)}</View>

        {(content as { exercise?: string }).exercise && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Try it</Text>
            <Text style={styles.cardBody}>{(content as { exercise: string }).exercise}</Text>
          </View>
        )}

        {(content as { reflection?: string }).reflection && (
          <View style={styles.reflection}>
            <Text style={styles.reflectionQuestion}>{(content as { reflection: string }).reflection}</Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Your thoughts (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
            />
          </View>
        )}

        {justCompleted ? (
          <>
            <View style={styles.completeSuccess}>
              <Text style={styles.completeSuccessText}>Lesson complete ✓</Text>
            </View>
            {completionLoading && <ActivityIndicator color="#7C4DFF" style={{ marginTop: 12 }} />}
            {completionAiResponse ? (
              <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#7C4DFF', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Psych says</Text>
                <Text style={{ color: '#E0E0E0', fontSize: 15, lineHeight: 22 }}>{completionAiResponse}</Text>
              </View>
            ) : null}
            <View style={styles.completeActions}>
              <Pressable style={({ pressed }) => [styles.completeActionBtn, pressed && { opacity: 0.9 }]} onPress={() => router.push('/(tabs)/learn')}>
                <Text style={styles.completeActionText}>Next lesson →</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.completeActionBtnSecondary, pressed && { opacity: 0.9 }]} onPress={() => router.back()}>
                <Text style={styles.completeActionTextSecondary}>Back to Manual</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>{completed ? 'Done' : 'Complete'}</Text>
          </Pressable>
        )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  completeSuccess: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  completeSuccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  aiResponseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  aiResponseLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  aiResponseText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  completeActions: {
    gap: 12,
  },
  completeActionBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
    marginBottom: 8,
  },
  completeActionBtnSecondary: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeActionText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  completeActionTextSecondary: { fontSize: 15, color: COLORS.textMuted },
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
