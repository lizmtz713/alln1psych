import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore } from '../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';

export default function LightsInsightsScreen() {
  const insets = useSafeAreaInsets();
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
    }))
  );
  const lights = useMemo(() => computeLights(members, persistState), [members, persistState]);
  const flickering = lights.filter((l) => l.status === 'flickering');
  const cool = lights.filter((l) => l.temperature === 'cool');

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  line: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
});
