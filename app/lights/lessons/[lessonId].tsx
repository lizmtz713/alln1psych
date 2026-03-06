import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { getFriendshipLessonById } from '../../../src/data/friendshipLessons';

function renderContent(text: string) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return paragraphs.map((para, i) => (
    <Text key={i} style={styles.paragraph}>
      {para}
    </Text>
  ));
}

export default function FriendshipLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lesson = lessonId ? getFriendshipLessonById(lessonId) : null;

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Lesson not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const related = (lesson.relatedLessons ?? [])
    .map((id) => getFriendshipLessonById(id))
    .filter((r): r is NonNullable<ReturnType<typeof getFriendshipLessonById>> => r != null);

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.icon}>{lesson.icon}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>{lesson.subtitle}</Text>
        <View style={styles.readTime}>
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.readTimeText}>{lesson.readTime} min read</Text>
        </View>
      </View>

      <View style={styles.body}>{renderContent(lesson.content)}</View>

      <View style={styles.insightBox}>
        <Text style={styles.insightLabel}>Key insight</Text>
        <Text style={styles.insightText}>{lesson.keyInsight}</Text>
      </View>

      <View style={styles.reflectionBox}>
        <Text style={styles.reflectionLabel}>Reflection</Text>
        <Text style={styles.reflectionText}>{lesson.reflectionPrompt}</Text>
      </View>

      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related lessons</Text>
          {related.map((r) => (
            <Pressable
              key={r.id}
              style={styles.relatedRow}
              onPress={() => router.push(`/lights/lessons/${r.id}`)}
            >
              <Text style={styles.relatedIcon}>{r.icon}</Text>
              <Text style={styles.relatedTitleText}>{r.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  muted: { fontSize: 14, color: COLORS.textMuted, padding: 24 },
  link: { fontSize: 16, color: COLORS.accent, padding: 24 },
  hero: { alignItems: 'center', marginBottom: 28 },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
  readTime: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  readTimeText: { fontSize: 13, color: COLORS.textMuted },
  body: { marginBottom: 24 },
  paragraph: { fontSize: 16, lineHeight: 24, color: COLORS.text, marginBottom: 16 },
  insightBox: {
    backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.12)',
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginBottom: 20,
  },
  insightLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  insightText: { fontSize: 16, fontWeight: '500', color: COLORS.text, fontStyle: 'italic' },
  reflectionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  reflectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  reflectionText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  relatedSection: { marginTop: 8 },
  relatedTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12 },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  relatedIcon: { fontSize: 20, marginRight: 12 },
  relatedTitleText: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.text },
});
