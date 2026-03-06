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
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>The Art of Friendship</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.scroll}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
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
