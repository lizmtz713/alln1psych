/**
 * Good to Know — Attachment & Emotional.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { ATTACHMENT_STYLES, type GoodToKnow } from '../../../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function AttachmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;

  const [attachmentStyle, setAttachmentStyle] = useState<GoodToKnow['attachmentStyle']>();
  const [howIHandleHardEmotions, setHowIHandleHardEmotions] = useState('');
  const [howISelfSoothe, setHowISelfSoothe] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (g) {
      setAttachmentStyle(g.attachmentStyle);
      setHowIHandleHardEmotions(g.howIHandleHardEmotions ?? '');
      setHowISelfSoothe(g.howISelfSoothe ?? '');
    }
  }, [g?.attachmentStyle, g?.howIHandleHardEmotions, g?.howISelfSoothe]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGoodToKnow({
      attachmentStyle,
      howIHandleHardEmotions: howIHandleHardEmotions.trim() || undefined,
      howISelfSoothe: howISelfSoothe.trim() || undefined,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>Attachment style</Text>
      <View style={styles.chipRow}>
        {ATTACHMENT_STYLES.map((opt) => (
          <Pressable key={opt.value} style={[styles.chip, attachmentStyle === opt.value && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttachmentStyle(opt.value); }}>
            <Text style={[styles.chipText, attachmentStyle === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>How I handle hard emotions</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howIHandleHardEmotions} onChangeText={setHowIHandleHardEmotions} placeholder="e.g. I need to name it first, then talk" placeholderTextColor={COLORS.textMuted} multiline />
      <Text style={styles.label}>How I self-soothe</Text>
      <TextInput style={[styles.input, styles.textArea]} value={howISelfSoothe} onChangeText={setHowISelfSoothe} placeholder="e.g. Walk, music, alone time" placeholderTextColor={COLORS.textMuted} multiline />
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
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
