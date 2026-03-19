/**
 * Edit frequency for one Body Maintenance item.
 * Route: /(modals)/body-maintenance-edit?itemId=xxx
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { getMaintenanceItemById } from '../../src/data/bodyMaintenance';
import type { MaintenanceInterval } from '../../src/data/bodyMaintenance';
import { useBodyMaintenanceStore, formatInterval } from '../../src/stores/bodyMaintenanceStore';

const PRESETS: MaintenanceInterval[] = [
  { value: 1, unit: 'days' },
  { value: 1, unit: 'weeks' },
  { value: 2, unit: 'weeks' },
  { value: 3, unit: 'weeks' },
  { value: 1, unit: 'months' },
  { value: 3, unit: 'months' },
  { value: 6, unit: 'months' },
  { value: 1, unit: 'years' },
  { value: 2, unit: 'years' },
];

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function BodyMaintenanceEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const item = itemId ? getMaintenanceItemById(itemId) : undefined;
  const getInterval = useBodyMaintenanceStore((s) => s.getInterval);
  const setCustomInterval = useBodyMaintenanceStore((s) => s.setCustomInterval);

  const currentInterval = itemId ? getInterval(itemId) : null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const select = (interval: MaintenanceInterval) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (itemId) setCustomInterval(itemId, interval);
    router.back();
  };

  const resetToDefault = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (itemId) setCustomInterval(itemId, null);
    router.back();
  };

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={styles.backBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Frequency</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.current}>
          Current: {currentInterval ? formatInterval(currentInterval) : (item.defaultLabel ?? 'Default')}
        </Text>

        <Text style={styles.sectionLabel}>How often?</Text>
        {PRESETS.map((interval) => {
          const label = formatInterval(interval);
          const isSelected =
            currentInterval?.value === interval.value && currentInterval?.unit === interval.unit;
          return (
            <Pressable
              key={label}
              style={[styles.presetRow, isSelected && styles.presetRowSelected]}
              onPress={() => select(interval)}
            >
              <Text style={styles.presetLabel}>{label}</Text>
              {isSelected ? <Ionicons name="checkmark-circle" size={22} color={ACCENT} /> : null}
            </Pressable>
          );
        })}

        <Pressable style={styles.resetBtn} onPress={resetToDefault}>
          <Text style={styles.resetText}>Reset to default ({item.defaultLabel ?? 'recommended'})</Text>
        </Pressable>
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  itemLabel: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 4 },
  current: { fontSize: 14, color: TEXT_MUTED, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 12, textTransform: 'uppercase' },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  presetRowSelected: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  presetLabel: { fontSize: 16, color: TEXT },
  resetBtn: { marginTop: 24, paddingVertical: 12, alignItems: 'center' },
  resetText: { fontSize: 14, color: TEXT_MUTED },
});
