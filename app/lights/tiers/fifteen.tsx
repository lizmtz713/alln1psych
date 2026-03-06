import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCircleStore } from '../../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../../src/stores/lightsStore';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { LIGHT_TEMPERATURE_SCALE } from '../../../src/types/lights';

export default function YourFifteenScreen() {
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
  const fifteen = lights.filter((l) => l.tier === 'fifteen');

  return (
    <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 24 }]} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your 15 — Close friends</Text>
      {fifteen.length === 0 ? (
        <Text style={styles.empty}>No one in Your 15 yet.</Text>
      ) : (
        fifteen.map((l) => (
          <Pressable key={l.id} style={styles.row} onPress={() => router.push(`/lights/${l.id}`)}>
            <View style={[styles.dot, { backgroundColor: LIGHT_TEMPERATURE_SCALE[l.temperature === 'unknown' ? 'neutral' : l.temperature]?.color ?? COLORS.textMuted }]} />
            <Text style={styles.name}>{l.name}</Text>
            <Text style={styles.temp}>{l.temperatureLabel}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 20 },
  empty: { fontSize: 15, color: COLORS.textMuted, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
  temp: { fontSize: 14, color: COLORS.textMuted },
});
