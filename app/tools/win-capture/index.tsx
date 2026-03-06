/**
 * Win Capture — Quick capture flow: text, optional tags, optional gauge.
 * Route: /tools/win-capture
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../src/lib/constants';
import { useWinStore } from '../../../src/stores/winStore';
import { GAUGE_CONFIG } from '../../../src/utils/gaugeHelpers';
import { runAchievementChecks } from '../../../src/services/achievementChecker';
import type { GaugeKey } from '../../../src/stores/cockpitStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const PRESET_TAGS = ['Small win', 'Work', 'Relationship', 'Health', 'Movement', 'Mindset'];

const GAUGES: (GaugeKey | null)[] = [
  null,
  'body',
  'state',
  'emotion',
  'connection',
  'direction',
  'alignment',
];

export default function WinCaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addWin = useWinStore((s) => s.addWin);

  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [gauge, setGauge] = useState<GaugeKey | null>(null);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addWin({ text: trimmed, tags, gauge });
    runAchievementChecks();
    router.back();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const canSave = text.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>Capture a win</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>What went right?</Text>
        <TextInput
          style={styles.input}
          placeholder="Even something small counts."
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={300}
          autoFocus
        />
        <Text style={styles.charCount}>{text.length}/300</Text>

        <Text style={[styles.label, { marginTop: 24 }]}>Tags (optional)</Text>
        <View style={styles.tagRow}>
          {PRESET_TAGS.map((tag) => {
            const selected = tags.includes(tag);
            return (
              <Pressable
                key={tag}
                style={[styles.tagChip, selected && styles.tagChipSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>Link to a gauge (optional)</Text>
        <View style={styles.gaugeRow}>
          {GAUGES.map((g) => {
            const label = g === null ? 'None' : GAUGE_CONFIG[g]?.label ?? g;
            const selected = gauge === g;
            return (
              <Pressable
                key={g ?? 'none'}
                style={[styles.gaugeChip, selected && styles.gaugeChipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGauge(g);
                }}
              >
                <Text style={[styles.gaugeChipText, selected && styles.gaugeChipTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveBtnText}>Save win</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 24 },
  label: { ...TYPOGRAPHY.secondary, color: TEXT_MUTED, marginBottom: 8 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    color: TEXT,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, color: TEXT_MUTED, marginTop: 4, textAlign: 'right' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  tagChipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  tagChipText: { fontSize: 14, color: TEXT },
  tagChipTextSelected: { color: COLORS.accent, fontWeight: '600' },
  gaugeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gaugeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  gaugeChipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  gaugeChipText: { fontSize: 13, color: TEXT },
  gaugeChipTextSelected: { color: COLORS.accent, fontWeight: '600' },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl + 8, borderTopWidth: 1, borderTopColor: BORDER },
  saveBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
