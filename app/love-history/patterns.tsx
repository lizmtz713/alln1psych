/**
 * Love History — My Patterns. User-added patterns they have noticed.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLoveHistoryStore } from '../../src/stores/loveHistoryStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';

const ACCENT = '#EC4899';

export default function LoveHistoryPatternsScreen() {
  const insets = useSafeAreaInsets();
  const patterns = useLoveHistoryStore((s) => s.patterns);
  const addPattern = useLoveHistoryStore((s) => s.addPattern);
  const deletePattern = useLoveHistoryStore((s) => s.deletePattern);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPattern({ title: title.trim(), description: description.trim() });
    setTitle('');
    setDescription('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove pattern', 'Remove this pattern?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePattern(id) },
    ]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.subtitle}>Patterns you have noticed in yourself. For your eyes only.</Text>
      {patterns.length === 0 && !showAdd && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💡</Text>
          <Text style={styles.emptyText}>No patterns yet. Add one when something clicks.</Text>
        </View>
      )}
      {patterns.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.cardTitle}>{p.title}</Text>
          {p.description ? <Text style={styles.cardDesc}>{p.description}</Text> : null}
          <Pressable style={styles.deleteWrap} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleDelete(p.id); }}>
            <Ionicons name="close-circle-outline" size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>
      ))}
      {showAdd ? (
        <View style={styles.addForm}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. I avoid conflict" placeholderTextColor={COLORS.textMuted} />
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Optional note" placeholderTextColor={COLORS.textMuted} multiline />
          <View style={styles.addRow}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
            <Pressable style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]} onPress={handleAdd} disabled={!title.trim()}>
              <Text style={styles.saveBtnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdd(true); }}>
          <Ionicons name="add-circle-outline" size={28} color={ACCENT} />
          <Text style={styles.addCardText}>Add a pattern</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: SPACING.lg, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  deleteWrap: { position: 'absolute', top: 12, right: 12 },
  addForm: { marginTop: 16 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  addRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, color: COLORS.textMuted },
  saveBtn: { flex: 1, backgroundColor: ACCENT, paddingVertical: 14, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  addCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: ACCENT + '66', borderRadius: BORDER_RADIUS.card, marginTop: 8 },
  addCardText: { fontSize: 16, color: ACCENT, fontWeight: '500' },
});
