/**
 * Body Maintenance Schedule — like a car service schedule for your body.
 * Categories: Health, Dental, Grooming, Skin, Movement, Recovery, Mental/Emotional.
 * All frequencies editable. Typical guidelines only; not medical advice.
 * Route: /(modals)/body-maintenance
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { BODY_MAINTENANCE_CATEGORIES } from '../../src/data/bodyMaintenance';
import {
  useBodyMaintenanceStore,
  formatInterval,
  formatNextDue,
} from '../../src/stores/bodyMaintenanceStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function BodyMaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const markDone = useBodyMaintenanceStore((s) => s.markDone);
  const getLastDone = useBodyMaintenanceStore((s) => s.getLastDone);
  const getNextDue = useBodyMaintenanceStore((s) => s.getNextDue);
  const isOverdue = useBodyMaintenanceStore((s) => s.isOverdue);
  const getInterval = useBodyMaintenanceStore((s) => s.getInterval);
  const getTimelineEntries = useBodyMaintenanceStore((s) => s.getTimelineEntries);
  const timelineEntries = getTimelineEntries();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleCategory = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCheck = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markDone(itemId);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Body Maintenance</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.disclaimer}>
          Typical guidelines — always follow advice from your healthcare provider.
        </Text>
        <Text style={styles.intro}>
          Like a service schedule for your body. Check off when done; adjust frequencies to fit you.
        </Text>

        {timelineEntries.length > 0 && (
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Timeline</Text>
            {timelineEntries.map((entry) => (
              <View key={entry.monthKey} style={styles.timelineRow}>
                <Text style={[styles.timelineMonth, entry.isOverdue && styles.timelineMonthOverdue]}>
                  {entry.monthLabel}
                </Text>
                <Text style={styles.timelineItems} numberOfLines={2}>
                  {entry.items.map((i) => i.label).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {BODY_MAINTENANCE_CATEGORIES.map((category) => {
          const isExpanded = expandedId === category.id;
          return (
            <View key={category.id} style={styles.categoryCard}>
              <Pressable
                style={[styles.categoryHeader, isExpanded && styles.categoryHeaderExpanded]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
              </Pressable>
              {isExpanded && (
                <View style={styles.categoryBody}>
                  {category.items.map((item) => {
                    const lastDone = getLastDone(item.id);
                    const nextDue = getNextDue(item.id);
                    const overdue = isOverdue(item.id);
                    const interval = getInterval(item.id);
                    const dueLabel = formatNextDue(nextDue, overdue);
                    return (
                      <View key={item.id} style={styles.itemRow}>
                        <Pressable
                          style={styles.itemCheckWrap}
                          onPress={() => handleCheck(item.id)}
                        >
                          <View style={[styles.checkbox, lastDone && styles.checkboxDone]}>
                            {lastDone ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                          </View>
                        </Pressable>
                        <Pressable
                          style={styles.itemBody}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push({ pathname: '/(modals)/body-maintenance-edit', params: { itemId: item.id } });
                          }}
                        >
                          <Text style={styles.itemLabel}>{item.label}</Text>
                          <Text style={[styles.itemMeta, overdue && styles.itemMetaOverdue]}>
                            {interval ? formatInterval(interval) : item.defaultLabel}
                            {nextDue != null && ` · Next due: ${dueLabel}`}
                          </Text>
                          <Text style={styles.editHint}>Tap to change frequency</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Body maintenance affects your Body, State, and Emotion gauges. Staying on schedule helps your system run better.
          </Text>
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  disclaimer: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 18,
  },
  intro: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 20,
  },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  timelineRow: { marginBottom: 6 },
  timelineMonth: { fontSize: 13, fontWeight: '600', color: ACCENT },
  timelineMonthOverdue: { color: COLORS.error },
  timelineItems: { fontSize: 13, color: TEXT_MUTED, marginTop: 2, marginLeft: 0 },
  categoryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryHeaderExpanded: { borderBottomWidth: 1, borderBottomColor: BORDER },
  categoryEmoji: { fontSize: 24, marginRight: 12 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: TEXT, flex: 1 },
  categoryBody: { padding: SPACING.md, paddingTop: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  itemCheckWrap: { marginRight: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: ACCENT, borderColor: ACCENT },
  itemBody: { flex: 1, minWidth: 0 },
  itemLabel: { fontSize: 15, fontWeight: '500', color: TEXT },
  itemMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  itemMetaOverdue: { color: COLORS.error },
  editHint: { fontSize: 11, color: TEXT_MUTED, marginTop: 4 },
  footer: { marginTop: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
