/**
 * Profile — Personal Values (for alignment insights and Drift Detector).
 * Uses ALIGNMENT_VALUES; stores in userStore.values via setValues.
 * See docs/HUMAN-OS-FIVE-LAYERS.md.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { ALIGNMENT_VALUES } from '../../src/lib/gaugeOptions';
import { COLORS, SPACING } from '../../src/lib/constants';

const MAX_VALUES = 5;

function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileValuesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userValues = useUserStore((s) => s.values) ?? [];
  const setValues = useUserStore((s) => s.setValues);

  const [selected, setSelected] = useState<string[]>(() => userValues ?? []);
  const [saving, setSaving] = useState(false);

  const toggle = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : prev.length >= MAX_VALUES ? prev : [...prev, value]
    );
  };

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    setValues(selected);
    setSaving(false);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Personal Values</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.paragraph}>
          Choose up to {MAX_VALUES} values that matter most to you. This powers alignment insights and the Drift Detector so the app can notice when your actions match — or drift from — what you care about.
        </Text>
        <Text style={styles.sectionLabel}>Your values ({selected.length} of {MAX_VALUES})</Text>
        <View style={styles.chipRow}>
          {ALIGNMENT_VALUES.map((value) => (
            <Chip
              key={value}
              label={value}
              selected={selected.includes(value)}
              onPress={() => toggle(value)}
              disabled={!selected.includes(value) && selected.length >= MAX_VALUES}
            />
          ))}
        </View>
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
  saveBtn: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  paragraph: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface },
  chipSelected: { backgroundColor: COLORS.accent },
  chipDisabled: { opacity: 0.5 },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
});
