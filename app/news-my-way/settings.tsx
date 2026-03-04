import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useNewsMyWayStore } from '../../src/stores/newsMyWayStore';

export default function NewsSettingsScreen() {
  const settings = useNewsMyWayStore((s) => s.settings);
  const setSettings = useNewsMyWayStore((s) => s.setSettings);
  const setNewsFreeToday = useNewsMyWayStore((s) => s.setNewsFreeToday);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Capacity & news-free</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Skip news when State is below</Text>
        <TextInput
          style={styles.input}
          value={String(settings.newsFreeWhenStateBelow)}
          onChangeText={(t) => setSettings({ newsFreeWhenStateBelow: Math.max(0, Math.min(100, parseInt(t, 10) || 0)) })}
          keyboardType="number-pad"
          placeholder="20"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <Text style={styles.hint}>When your State gauge is below this, we suggest a news-free day. 0 = never skip.</Text>

      <Pressable style={styles.card} onPress={() => setNewsFreeToday(today)}>
        <Text style={styles.cardTitle}>Mark today as news-free</Text>
        <Text style={styles.cardSubtitle}>No digest today. You can change your mind from the main screen.</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Doomscroll check-in</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Ask "How do you feel?" after (minutes)</Text>
        <TextInput
          style={styles.input}
          value={settings.doomscrollCheckInMinutes ? String(settings.doomscrollCheckInMinutes) : ''}
          onChangeText={(t) => setSettings({ doomscrollCheckInMinutes: t === '' ? 0 : Math.max(0, parseInt(t, 10) || 15) })}
          keyboardType="number-pad"
          placeholder="15"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
      <Text style={styles.hint}>0 = disabled. After this many minutes we'll prompt a quick check-in.</Text>

      <Text style={styles.sectionTitle}>Pre-Flight</Text>
      <Pressable
        style={styles.toggleRow}
        onPress={() => setSettings({ preFlightIntegration: !settings.preFlightIntegration })}
      >
        <Text style={styles.toggleLabel}>Include news in Pre-Flight</Text>
        <View style={[styles.toggle, settings.preFlightIntegration && styles.toggleOn]}>
          <View style={[styles.toggleThumb, settings.preFlightIntegration && styles.toggleThumbOn]} />
        </View>
      </Pressable>
      <Text style={styles.hint}>Morning prompt: "Include news in today's digest?"</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  row: { marginBottom: 8 },
  label: { fontSize: 14, color: COLORS.text, marginBottom: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, marginBottom: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  toggleLabel: { fontSize: 15, color: COLORS.text },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', paddingHorizontal: 4 },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.textMuted },
  toggleThumbOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
});
