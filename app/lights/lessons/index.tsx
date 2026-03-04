import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  FRIENDSHIP_LESSONS,
  FRIENDSHIP_DEEP_DIVES,
  type FriendshipLesson,
} from '../../../src/data/friendshipLessons';

function LessonRow({
  lesson,
  onPress,
}: {
  lesson: FriendshipLesson;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{lesson.icon}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{lesson.title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
      </View>
      <Text style={styles.rowTime}>{lesson.readTime} min</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </Pressable>
  );
}

export default function FriendshipLessonsIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.tagline}>Connection and friendship from many angles.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core lessons</Text>
        {FRIENDSHIP_LESSONS.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            onPress={() => router.push(`/lights/lessons/${lesson.id}`)}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deep dives</Text>
        {FRIENDSHIP_DEEP_DIVES.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            onPress={() => router.push(`/lights/lessons/${lesson.id}`)}
          />
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  tagline: { fontSize: 15, color: COLORS.textMuted, marginBottom: 24 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowIcon: { fontSize: 24, marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  rowSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  rowTime: { fontSize: 12, color: COLORS.textMuted, marginRight: 8 },
});
