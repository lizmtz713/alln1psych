/**
 * Body gauge — What Body means for me. Priorities, context, goals, accountability, patterns.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { useBodyMaintenanceStore } from '../../../src/stores/bodyMaintenanceStore';
import { BODY_PRIORITIES, CHECK_IN_FREQUENCY_OPTIONS } from '../../../src/lib/gaugeOptions';
import { COLORS } from '../../../src/lib/constants';

function Checkbox({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable style={styles.checkRow} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

function BodyMaintenancePreview() {
  const router = useRouter();
  const getComingUp = useBodyMaintenanceStore((s) => s.getComingUp);
  const comingUp = getComingUp(5);
  const overdueCount = comingUp.filter((e) => (e.overdueDays ?? 0) > 0).length;
  const dueThisWeek = comingUp.length;

  if (dueThisWeek === 0) {
    return (
      <View style={styles.maintenanceCard}>
        <Text style={styles.maintenanceText}>No items due right now.</Text>
        <Pressable onPress={() => router.push('/body-maintenance')}>
          <Text style={styles.link}>See all maintenance</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.maintenanceCard}>
      <Text style={styles.maintenanceText}>
        {dueThisWeek} item{dueThisWeek !== 1 ? 's' : ''} due soon
        {overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
      </Text>
      {comingUp.slice(0, 3).map((entry, i) => {
        if ('item' in entry) {
          const r = entry.item;
          return (
            <Text key={r.id} style={styles.maintenanceBullet}>
              {r.emoji ?? '📋'} {r.name} — {entry.overdueDays != null && entry.overdueDays > 0 ? entry.overdueDays + ' days overdue' : entry.dueLabel}
            </Text>
          );
        }
        const p = entry.provider;
        return (
          <Text key={p.id} style={styles.maintenanceBullet}>
            {p.type === 'hair' ? '💇' : p.type === 'nails' ? '💅' : '📋'} {p.businessName} — {entry.dueLabel}
          </Text>
        );
      })}
      <Pressable onPress={() => router.push('/body-maintenance')}>
        <Text style={styles.link}>See all maintenance</Text>
      </Pressable>
    </View>
  );
}

export default function BodyGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { body, setBody } = useGaugeDefinitionsStore();

  const [priorities, setPriorities] = useState<string[]>(body.priorities);
  const [context, setContext] = useState(body.context);
  const [currentGoal, setCurrentGoal] = useState(body.currentGoal);
  const [goals, setGoals] = useState<string[]>(body.goals);
  const [checkInFrequency, setCheckInFrequency] = useState(body.checkInFrequency);
  const [morningReminder, setMorningReminder] = useState(body.morningReminder);
  const [eveningReminder, setEveningReminder] = useState(body.eveningReminder);
  const [customReminder, setCustomReminder] = useState(body.customReminder);
  const [whatHelps, setWhatHelps] = useState<string[]>(body.whatHelps);
  const [newHelp, setNewHelp] = useState('');

  useEffect(() => {
    setPriorities(body.priorities);
    setContext(body.context);
    setCurrentGoal(body.currentGoal);
    setGoals(body.goals);
    setCheckInFrequency(body.checkInFrequency);
    setMorningReminder(body.morningReminder);
    setEveningReminder(body.eveningReminder);
    setCustomReminder(body.customReminder);
    setWhatHelps(body.whatHelps);
  }, [body.priorities.length, body.context, body.currentGoal, body.goals.length, body.whatHelps.length]);

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBody({
      priorities,
      context,
      currentGoal,
      goals,
      checkInFrequency,
      morningReminder,
      eveningReminder,
      customReminder,
      whatHelps,
    });
    router.back();
  };

  const togglePriority = (p: string) => {
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const addHelp = () => {
    if (newHelp.trim()) {
      setWhatHelps((prev) => [...prev, newHelp.trim()]);
      setNewHelp('');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Body</Text>
        <Pressable onPress={save}>
          <Text style={styles.saveBtn}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hero}>Body</Text>
        <Text style={styles.heroSub}>Your physical self</Text>

        <Text style={styles.blockTitle}>What Body measures</Text>
        <Text style={styles.blockBody}>
          How your physical body feels — energy, pain, rest, nourishment, movement, physical comfort.
        </Text>

        <Text style={styles.blockTitle}>My Body priorities</Text>
        <Text style={styles.blockBody}>What matters most to you physically? (Helps AI understand your context)</Text>
        {BODY_PRIORITIES.map((p) => (
          <Checkbox key={p} label={p} checked={priorities.includes(p)} onToggle={() => togglePriority(p)} />
        ))}
        <Checkbox label="Other" checked={priorities.includes('Other')} onToggle={() => togglePriority('Other')} />

        <Text style={styles.blockTitle}>My Body context</Text>
        <Text style={styles.blockBody}>Tell AI about your body situation:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. I have chronic fatigue. A good Body day for me is 60, not 100..."
          placeholderTextColor={COLORS.textMuted}
          value={context}
          onChangeText={setContext}
          multiline
        />

        <Text style={styles.blockTitle}>Current Body goal</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sleep 7+ hours, 5 nights/week"
          placeholderTextColor={COLORS.textMuted}
          value={currentGoal}
          onChangeText={setCurrentGoal}
        />
        <Pressable style={styles.addBtn}>
          <Ionicons name="add" size={20} color={COLORS.accent} />
          <Text style={styles.addBtnText}>Add Body goal</Text>
        </Pressable>

        <Text style={styles.blockTitle}>Accountability</Text>
        <Text style={styles.blockBody}>How often do you want Body check-ins?</Text>
        {CHECK_IN_FREQUENCY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.radioRow, checkInFrequency === opt.value && styles.radioRowSelected]}
            onPress={() => setCheckInFrequency(opt.value)}
          >
            <View style={[styles.radio, checkInFrequency === opt.value && styles.radioSelected]} />
            <Text style={styles.radioLabel}>{opt.label}</Text>
          </Pressable>
        ))}
        <Text style={styles.blockBody}>Want reminders for Body goals?</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Morning: How did you sleep?</Text>
          <Switch value={morningReminder} onValueChange={setMorningReminder} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Evening: Did you move today?</Text>
          <Switch value={eveningReminder} onValueChange={setEveningReminder} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Custom reminder"
          placeholderTextColor={COLORS.textMuted}
          value={customReminder}
          onChangeText={setCustomReminder}
        />

        <Text style={styles.blockTitle}>Body Maintenance</Text>
        <BodyMaintenancePreview />

        <Text style={styles.blockTitle}>My Body patterns</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Average: —  Trend: —  Best/hardest days: —</Text>
          <Pressable><Text style={styles.link}>See Full Body Insights</Text></Pressable>
        </View>

        <Text style={styles.blockTitle}>What helps my Body</Text>
        {whatHelps.map((h, i) => (
          <View key={i} style={styles.helpRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.helpText}>{h}</Text>
          </View>
        ))}
        <View style={styles.addHelpRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="e.g. Morning walks boost my energy"
            placeholderTextColor={COLORS.textMuted}
            value={newHelp}
            onChangeText={setNewHelp}
          />
          <Pressable style={styles.addHelpBtn} onPress={addHelp}>
            <Text style={styles.addHelpBtnText}>+ Add</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  saveBtn: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  scroll: { flex: 1 },
  content: { padding: 20 },
  hero: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  blockTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 20, marginBottom: 6 },
  blockBody: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 100, textAlignVertical: 'top', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  addBtnText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  radioRowSelected: { backgroundColor: COLORS.accentBg },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10 },
  radioSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  radioLabel: { fontSize: 15, color: COLORS.text },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 15, color: COLORS.text },
  maintenanceCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12 },
  maintenanceText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  maintenanceBullet: { fontSize: 13, color: COLORS.text, marginBottom: 4 },
  statsCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12 },
  statsText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  link: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  helpRow: { flexDirection: 'row', marginBottom: 4 },
  bullet: { marginRight: 8, fontSize: 14, color: COLORS.textMuted },
  helpText: { fontSize: 14, color: COLORS.text, flex: 1 },
  addHelpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addHelpBtn: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.accentBg, borderRadius: 12 },
  addHelpBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
