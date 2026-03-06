import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';

export default function WorldTemperatureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>World Temperature</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>🌡️ World Temperature</Text>
      <Text style={styles.subtitle}>How humanity is feeling right now.</Text>

      <View style={styles.divider} />

      <View style={styles.bigTempWrap}>
        <Text style={styles.bigTemp}>72°</Text>
        <Text style={styles.bigLabel}>WARM TODAY</Text>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: '75%' }]} />
        </View>
        <Text style={styles.barHint}>Based on 12,847 check-ins today</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>📊 TRENDS</Text>
      <View style={styles.card}>
        <Row label="Today" value="72° Warm" trend="↗️" />
        <Row label="This week" value="68° Neutral" />
        <Row label="This month" value="65° Neutral" />
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>💡 YOUR LIGHTS vs WORLD</Text>
      <View style={styles.card}>
        <Text style={styles.hint}>Your circle average: 68°</Text>
        <Text style={styles.hint}>World average: 72°</Text>
        <Text style={styles.insight}>
          Your circle is slightly cooler than the world right now.
        </Text>
      </View>

      <View style={styles.quote}>
        <Text style={styles.quoteText}>
          "We're all in this together. When you check in, you're adding to our collective awareness."
        </Text>
      </View>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <View style={rowStyles.valueRow}>
        <Text style={rowStyles.value}>{value}</Text>
        {trend ? <Text style={rowStyles.trend}>{trend}</Text> : null}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 15, color: COLORS.textMuted },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  trend: { fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
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
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  bigTempWrap: { alignItems: 'center', paddingVertical: 24 },
  bigTemp: { fontSize: 64, fontWeight: '700', color: COLORS.text },
  bigLabel: { fontSize: 18, color: COLORS.textMuted, marginTop: 8, letterSpacing: 1 },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.inputSurface,
    width: '100%',
    marginTop: 24,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 6,
  },
  barHint: { fontSize: 13, color: COLORS.textMuted, marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 6 },
  insight: { fontSize: 15, color: COLORS.text, marginTop: 12, lineHeight: 22 },
  quote: {
    marginTop: 32,
    padding: 20,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  quoteText: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 22 },
});
