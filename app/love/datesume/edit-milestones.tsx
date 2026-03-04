/**
 * Datésumé — Edit milestones: suggested + custom.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { MILESTONE_SUGGESTIONS } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function EditMilestonesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, addMilestone, removeMilestone } = useDatesumeStore();
  const [customEmoji, setCustomEmoji] = useState('🎯');
  const [customTitle, setCustomTitle] = useState('');
  const [customYear, setCustomYear] = useState('');

  useEffect(() => { init(); }, [init]);

  const list = datesume?.milestones ?? [];
  const hasMilestone = (emoji: string, title: string) => list.some((m) => m.emoji === emoji && m.title === title);

  const addSuggested = (emoji: string, title: string) => {
    if (hasMilestone(emoji, title)) {
      const m = list.find((x) => x.emoji === emoji && x.title === title);
      if (m) removeMilestone(m.id);
    } else {
      addMilestone({ emoji, title });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addCustom = () => {
    const title = customTitle.trim();
    if (!title) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addMilestone({ emoji: customEmoji || '🎯', title, year: customYear.trim() ? parseInt(customYear.trim(), 10) : undefined });
    setCustomTitle('');
    setCustomYear('');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Suggested</Text>
      <View style={styles.chipRow}>
        {MILESTONE_SUGGESTIONS.map((m) => {
          const added = hasMilestone(m.emoji, m.title);
          return (
            <Pressable key={m.emoji + m.title} style={[styles.suggestionChip, added && styles.chipSelected]} onPress={() => addSuggested(m.emoji, m.title)}>
              <Text style={styles.suggestionEmoji}>{m.emoji}</Text>
              <Text style={[styles.suggestionText, added && styles.chipTextSelected]} numberOfLines={1}>{m.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>Your milestones</Text>
      {list.map((m) => (
        <View key={m.id} style={styles.row}>
          <Text style={styles.emoji}>{m.emoji}</Text>
          <Text style={styles.milestoneTitle}>{m.title}{m.year ? ' (' + m.year + ')' : ''}</Text>
          <Pressable onPress={() => { removeMilestone(m.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Add custom</Text>
      <View style={styles.addRow}>
        <TextInput style={[styles.input, { width: 50 }]} value={customEmoji} onChangeText={setCustomEmoji} placeholder="Emoji" placeholderTextColor={COLORS.textMuted} />
        <TextInput style={[styles.input, { flex: 1 }]} value={customTitle} onChangeText={setCustomTitle} placeholder="Milestone title" placeholderTextColor={COLORS.textMuted} />
        <TextInput style={[styles.input, { width: 60 }]} value={customYear} onChangeText={setCustomYear} placeholder="Year" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
      </View>
      <Pressable style={[styles.addBtn, !customTitle.trim() && styles.addBtnDisabled]} onPress={addCustom} disabled={!customTitle.trim()}>
        <Text style={styles.addBtnText}>Add milestone</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  suggestionEmoji: { fontSize: 18 },
  suggestionText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  emoji: { fontSize: 22, marginRight: 10 },
  milestoneTitle: { flex: 1, fontSize: 15, color: COLORS.text },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: ACCENT, paddingVertical: 14, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
