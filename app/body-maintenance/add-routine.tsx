import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useBodyMaintenanceStore } from '../../src/stores/bodyMaintenanceStore';
import type { RoutineCategory, Frequency, FrequencyType } from '../../src/types/bodyMaintenance';

const SUGGESTED: Record<RoutineCategory, { name: string; emoji: string }[]> = {
  hair: [
    { name: 'Wash hair', emoji: '💇' },
    { name: 'Haircut/trim', emoji: '💇' },
    { name: 'Color/cover grays', emoji: '💇' },
    { name: 'Deep condition', emoji: '💇' },
  ],
  nails: [
    { name: 'Trim fingernails', emoji: '💅' },
    { name: 'Trim toenails', emoji: '💅' },
    { name: 'Manicure', emoji: '💅' },
    { name: 'Pedicure', emoji: '💅' },
  ],
  skin: [
    { name: 'Skincare routine', emoji: '🧴' },
    { name: 'Exfoliate', emoji: '🧴' },
    { name: 'Face mask', emoji: '🧴' },
    { name: 'Body lotion', emoji: '🧴' },
  ],
  oral: [
    { name: 'Brush teeth', emoji: '😁' },
    { name: 'Floss', emoji: '😁' },
    { name: 'Mouthwash', emoji: '😁' },
    { name: 'Dentist visit', emoji: '🦷' },
  ],
  bathing: [
    { name: 'Shower/bath', emoji: '🛁' },
    { name: 'Wash face', emoji: '🛁' },
    { name: 'Intimate hygiene', emoji: '🛁' },
  ],
  face: [
    { name: 'Eyebrows', emoji: '👁️' },
    { name: 'Facial hair', emoji: '👁️' },
    { name: 'Ear/nose hair', emoji: '👁️' },
  ],
  environment: [
    { name: 'Change sheets', emoji: '🛏️' },
    { name: 'Wash towels', emoji: '🛏️' },
    { name: 'Clean bathroom', emoji: '🛏️' },
    { name: 'Replace toothbrush', emoji: '🛏️' },
  ],
  wardrobe: [
    { name: 'Laundry', emoji: '👕' },
    { name: 'Replace underwear', emoji: '👕' },
    { name: 'Replace socks', emoji: '👕' },
    { name: 'Organize closet', emoji: '👕' },
  ],
  other: [],
};

const FREQUENCIES: { type: FrequencyType; label: string }[] = [
  { type: 'daily', label: 'Daily' },
  { type: 'every_x_days', label: 'Every X days' },
  { type: 'weekly', label: 'Weekly' },
  { type: 'biweekly', label: 'Bi-weekly' },
  { type: 'monthly', label: 'Monthly' },
  { type: 'every_x_months', label: 'Every X months' },
  { type: 'quarterly', label: 'Quarterly' },
  { type: 'yearly', label: 'Yearly' },
];

const CATEGORIES: RoutineCategory[] = ['hair', 'nails', 'skin', 'oral', 'bathing', 'face', 'environment', 'wardrobe', 'other'];

export default function AddRoutineScreen() {
  const router = useRouter();
  const addRoutine = useBodyMaintenanceStore((s) => s.addRoutine);

  const [category, setCategory] = useState<RoutineCategory>('hair');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('weekly');
  const [customDays, setCustomDays] = useState('');
  const [customMonths, setCustomMonths] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [addToCalendar, setAddToCalendar] = useState(false);

  const frequency: Frequency = frequencyType === 'every_x_days'
    ? { type: 'every_x_days', value: Math.max(1, parseInt(customDays, 10) || 7) }
    : frequencyType === 'every_x_months'
      ? { type: 'every_x_months', value: Math.max(1, parseInt(customMonths, 10) || 1) }
      : { type: frequencyType };

  const handleSelectSuggested = (item: { name: string; emoji: string }) => {
    setName(item.name);
    setEmoji(item.emoji);
  };

  const handleAdd = () => {
    const displayName = name.trim() || 'Routine';
    addRoutine({
      category,
      name: displayName,
      emoji: emoji || undefined,
      frequency,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      addToCalendar,
      streak: 0,
    });
    router.back();
  };

  const canAdd = name.trim().length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>What do you want to track?</Text>
      {CATEGORIES.filter((c) => c !== 'other').map((c) => (
        <View key={c} style={styles.categoryBlock}>
          <Text style={styles.categoryLabel}>
            {c === 'hair' ? '💇' : c === 'nails' ? '💅' : c === 'skin' ? '🧴' : c === 'oral' ? '😁' : c === 'bathing' ? '🛁' : c === 'face' ? '👁️' : c === 'environment' ? '🛏️' : '👕'} {c.charAt(0).toUpperCase() + c.slice(1)}
          </Text>
          <View style={styles.suggestedRow}>
            {(SUGGESTED[c] ?? []).map((item) => (
              <Pressable
                key={item.name}
                style={[styles.suggestedChip, category === c && name === item.name && styles.suggestedChipSelected]}
                onPress={() => { setCategory(c); handleSelectSuggested(item); }}
              >
                <Text style={styles.suggestedChipText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Custom name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Shower"
        placeholderTextColor={COLORS.textMuted}
      />

      <Text style={styles.sectionTitle}>Frequency</Text>
      {FREQUENCIES.map((f) => (
        <Pressable
          key={f.type}
          style={[styles.freqRow, frequencyType === f.type && styles.freqRowSelected]}
          onPress={() => setFrequencyType(f.type)}
        >
          <View style={[styles.radio, frequencyType === f.type && styles.radioSelected]} />
          <Text style={styles.freqLabel}>{f.label}</Text>
        </Pressable>
      ))}
      {frequencyType === 'every_x_days' && (
        <TextInput
          style={styles.input}
          value={customDays}
          onChangeText={setCustomDays}
          placeholder="Days (e.g. 3)"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
        />
      )}
      {frequencyType === 'every_x_months' && (
        <TextInput
          style={styles.input}
          value={customMonths}
          onChangeText={setCustomMonths}
          placeholder="Months (e.g. 2)"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
        />
      )}

      <Text style={styles.sectionTitle}>Reminders</Text>
      <Pressable style={styles.switchRow} onPress={() => setReminderEnabled(!reminderEnabled)}>
        <Text style={styles.switchLabel}>Push notification</Text>
        <View style={[styles.toggle, reminderEnabled && styles.toggleOn]}>
          <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbOn]} />
        </View>
      </Pressable>
      {reminderEnabled && (
        <TextInput
          style={styles.input}
          value={reminderTime}
          onChangeText={setReminderTime}
          placeholder="08:00"
          placeholderTextColor={COLORS.textMuted}
        />
      )}
      <Pressable style={styles.switchRow} onPress={() => setAddToCalendar(!addToCalendar)}>
        <Text style={styles.switchLabel}>Add to calendar</Text>
        <View style={[styles.toggle, addToCalendar && styles.toggleOn]}>
          <View style={[styles.toggleThumb, addToCalendar && styles.toggleThumbOn]} />
        </View>
      </Pressable>

      <Pressable style={[styles.addBtn, !canAdd && styles.addBtnDisabled]} onPress={handleAdd} disabled={!canAdd}>
        <Text style={styles.addBtnText}>Add to My Routines</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  categoryBlock: { marginBottom: 16 },
  categoryLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  suggestedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestedChip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card },
  suggestedChipSelected: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  suggestedChipText: { fontSize: 14, color: COLORS.text },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 12 },
  freqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  freqRowSelected: {},
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10 },
  radioSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  freqLabel: { fontSize: 15, color: COLORS.text },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  switchLabel: { fontSize: 15, color: COLORS.text },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', paddingHorizontal: 4 },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.textMuted },
  toggleThumbOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  addBtn: { marginTop: 24, backgroundColor: COLORS.accent, padding: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
