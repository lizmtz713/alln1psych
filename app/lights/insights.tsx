import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore } from '../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';

export default function LightsInsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
      momentumByMemberId: s.momentumByMemberId,
      lastHeroShownByMemberId: s.lastHeroShownByMemberId,
      seasonByMemberId: s.seasonByMemberId,
      timelineEventsByMemberId: s.timelineEventsByMemberId,
    }))
  );
  const lights = useMemo(() => computeLights(Array.isArray(members) ? members : [], persistState), [members, persistState]);
  const flickering = lights.filter((l) => l.status === 'flickering');
  const cool = lights.filter((l) => l.temperature === 'cool');

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lights Insights</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Lights Insights</Text>
      <View style={styles.divider} />
      <View style={styles.card}>
        <Text style={styles.line}>{flickering.length} flickering</Text>
        <Text style={styles.line}>{cool.length} cooled down</Text>
      </View>
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
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  line: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
});
