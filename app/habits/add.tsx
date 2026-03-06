/**
 * Habit Tracker — Add new habit (boolean, count, timer).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useHabitStore } from '../../src/stores/habitStore';
import type { HabitType } from '../../src/types/habits';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const TYPES: { id: HabitType; label: string; subtitle: string; emoji: string }[] = [
  { id: 'boolean', label: 'Yes / No', subtitle: 'Done or not (e.g. took vitamins)', emoji: '✅' },
  { id: 'count', label: 'Count', subtitle: 'How many (e.g. glasses of water)', emoji: '🔢' },
  { id: 'timer', label: 'Timer', subtitle: 'Minutes (e.g. meditation)', emoji: '⏱️' },
];

export default function HabitsAddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const targetNum = type !== 'boolean' ? Math.max(1, parseInt(target, 10) || 1) : undefined;
    addHabit({
      name: trimmed,
      type,
      target: targetNum,
      unit: unit.trim() || undefined,
      emoji: type === 'boolean' ? '✅' : type === 'count' ? '🔢' : '⏱️',
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>New habit</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn} disabled={!name.trim()}>
          <Text style={[styles.saveBtnText, !name.trim() && styles.saveBtnTextDisabled]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Take vitamins"
          placeholderTextColor={TEXT_MUTED}
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.typeCard, type === t.id && styles.typeCardSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setType(t.id);
              }}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, type === t.id && styles.typeLabelSelected]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {(type === 'count' || type === 'timer') && (
          <>
            <Text style={styles.label}>{type === 'count' ? 'Target per day' : 'Target minutes'}</Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'count' ? 'e.g. 8' : 'e.g. 10'}
              placeholderTextColor={TEXT_MUTED}
              value={target}
              onChangeText={setTarget}
              keyboardType="number-pad"
            />
            {type === 'count' && (
              <>
                <Text style={styles.label}>Unit (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. glasses"
                  placeholderTextColor={TEXT_MUTED}
                  value={unit}
                  onChangeText={setUnit}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  saveBtn: { padding: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  saveBtnTextDisabled: { color: TEXT_MUTED },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 16,
    color: TEXT,
  },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 8 },
  typeCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 2,
    borderColor: BORDER,
    padding: SPACING.md,
    alignItems: 'center',
  },
  typeCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  typeEmoji: { fontSize: 28, marginBottom: 4 },
  typeLabel: { fontSize: 13, fontWeight: '600', color: TEXT },
  typeLabelSelected: { color: COLORS.accent },
});
