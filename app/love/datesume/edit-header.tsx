/**
 * Datésumé — Edit header: name, age, location, pronouns, tagline, status.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { RELATIONSHIP_STATUS_LABELS, type RelationshipStatus } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';
const STATUS_OPTIONS: RelationshipStatus[] = ['single', 'dating', 'in_relationship', 'engaged', 'married', 'divorced', 'its_complicated'];

export default function EditHeaderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [tagline, setTagline] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('single');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d) {
      setDisplayName(d.displayName ?? '');
      setAge(d.age != null ? String(d.age) : '');
      setLocation(d.location ?? '');
      setPronouns(d.pronouns ?? '');
      setTagline(d.tagline ?? '');
      setRelationshipStatus(d.relationshipStatus);
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({
      displayName: displayName.trim() || '',
      age: age.trim() ? parseInt(age.trim(), 10) : undefined,
      location: location.trim() || undefined,
      pronouns: pronouns.trim() || undefined,
      tagline: tagline.trim() || undefined,
      relationshipStatus,
    });
    router.back();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Display name</Text>
      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="How you want to be called" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Age (optional)</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="e.g. 32" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
      <Text style={styles.label}>Location (optional)</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City or region" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Pronouns (optional)</Text>
      <TextInput style={styles.input} value={pronouns} onChangeText={setPronouns} placeholder="e.g. she/her" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Tagline (optional)</Text>
      <TextInput style={styles.input} value={tagline} onChangeText={setTagline} placeholder="Short one-liner" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Relationship status</Text>
      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, relationshipStatus === s && styles.chipSelected]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRelationshipStatus(s); }}
          >
            <Text style={[styles.chipText, relationshipStatus === s && styles.chipTextSelected]}>{RELATIONSHIP_STATUS_LABELS[s]}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
