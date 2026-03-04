/**
 * Love History — View or edit a single entry.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLoveHistoryStore } from '../../src/stores/loveHistoryStore';
import { ENDING_TYPES, type RelationshipType, type EndingType } from '../../src/types/loveHistory';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';

const REL_LABELS: Record<RelationshipType, string> = {
  crush: 'Crush', kiss: 'Kiss', fling: 'Fling', situationship: 'Situationship',
  dating: 'Dating', relationship: 'Relationship', engaged: 'Engaged',
  married: 'Married', divorced: 'Divorced',
};
const END_LABELS: Record<EndingType, string> = {
  mutual: 'Mutual', ghosted: 'Ghosted', 'grew-apart': 'Grew apart',
  cheating: 'Cheating', 'moved-away': 'Moved away', 'wrong-timing': 'Wrong timing', other: 'Other',
};
const ACCENT = '#EC4899';

export default function LoveHistoryEntryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getEntry = useLoveHistoryStore((s) => s.getEntry);
  const updateEntry = useLoveHistoryStore((s) => s.updateEntry);
  const deleteEntry = useLoveHistoryStore((s) => s.deleteEntry);
  const entry = id ? getEntry(id) : null;
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [lessons, setLessons] = useState(entry?.lessons?.join('\n') ?? '');

  useEffect(() => {
    if (entry) {
      setNotes(entry.notes);
      setLessons(entry.lessons?.join('\n') ?? '');
    }
  }, [entry?.id]);

  if (!id || !entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Entry not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateEntry(id, {
      notes,
      lessons: lessons.trim() ? lessons.trim().split(/\n/).filter(Boolean) : [],
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete entry', 'This cannot be undone. Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteEntry(id); router.back(); } },
    ]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.name}>{entry.isAnonymous ? 'Anonymous' : entry.name || 'Unnamed'}</Text>
        <Text style={styles.type}>{REL_LABELS[entry.type]}</Text>
        <Text style={styles.dates}>
          {entry.startDate}{entry.endDate ? ` – ${entry.endDate}` : ' – present'}
          {entry.durationMonths != null ? ` · ${entry.durationMonths} mo` : ''}
        </Text>
        {entry.howItEnded && (
          <Text style={styles.ended}>
            Ended: {END_LABELS[entry.howItEnded]}{entry.howItEndedOther ? ` — ${entry.howItEndedOther}` : ''}
          </Text>
        )}
      </View>
      <Text style={styles.label}>Lessons</Text>
      <TextInput style={[styles.input, styles.textArea]} value={lessons} onChangeText={setLessons} placeholder="One per line" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={COLORS.textMuted} multiline />
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save changes</Text>
      </Pressable>
      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        <Text style={styles.deleteBtnText}>Delete entry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontSize: 15, color: COLORS.textMuted },
  backBtn: { marginTop: 16 },
  backBtnText: { fontSize: 16, color: COLORS.accent },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  type: { fontSize: 14, color: ACCENT, marginTop: 4 },
  dates: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  ended: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginTop: 24 },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 12 },
  deleteBtnText: { fontSize: 15, color: COLORS.error },
});
