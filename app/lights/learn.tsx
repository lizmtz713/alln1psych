import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { FRIENDSHIP_LESSONS } from '../../src/data/friendshipLessons';

export default function LightsLearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>The Art of Friendship</Text>
      <Text style={styles.subtitle}>Connection and friendship from many angles.</Text>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lessons</Text>
        {FRIENDSHIP_LESSONS.slice(0, 6).map((lesson) => (
          <Pressable
            key={lesson.id}
            style={styles.row}
            onPress={() => router.push(`/lights/lessons/${lesson.id}`)}
          >
            <Text style={styles.rowIcon}>{lesson.icon}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{lesson.title}</Text>
              <Text style={styles.rowSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.seeAllRow}
        onPress={() => router.push('/lights/lessons')}
      >
        <Text style={styles.seeAllText}>See all friendship lessons</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  rowIcon: { fontSize: 22, marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rowSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  seeAllText: { fontSize: 15, fontWeight: '500', color: COLORS.accent },
});
