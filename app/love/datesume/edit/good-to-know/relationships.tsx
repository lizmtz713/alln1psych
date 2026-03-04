import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function RelationshipsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;
  const [familyRelationship, setFamilyRelationship] = useState('');
  const [friendshipStyle, setFriendshipStyle] = useState('');
  const [exRelationships, setExRelationships] = useState('');
  const [howITreatStrangers, setHowITreatStrangers] = useState('');

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (g) {
      setFamilyRelationship(g.familyRelationship ?? '');
      setFriendshipStyle(g.friendshipStyle ?? '');
      setExRelationships(g.exRelationships ?? '');
      setHowITreatStrangers(g.howITreatStrangers ?? '');
    }
  }, [datesume?.updatedAt]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({
      familyRelationship: familyRelationship.trim() || undefined,
      friendshipStyle: friendshipStyle.trim() || undefined,
      exRelationships: exRelationships.trim() || undefined,
      howITreatStrangers: howITreatStrangers.trim() || undefined,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Family relationship</Text>
      <TextInput style={[styles.input, styles.textArea]} value={familyRelationship} onChangeText={setFamilyRelationship} placeholder="e.g. Close with mom" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>Friendship style</Text>
      <TextInput style={[styles.input, styles.textArea]} value={friendshipStyle} onChangeText={setFriendshipStyle} placeholder="e.g. Small circle" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>Ex relationships</Text>
      <TextInput style={[styles.input, styles.textArea]} value={exRelationships} onChangeText={setExRelationships} placeholder="e.g. On good terms" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>How I treat strangers</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howITreatStrangers} onChangeText={setHowITreatStrangers} placeholder="e.g. Friendly, tip well" placeholderTextColor={COLORS.textMuted} multiline />
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
