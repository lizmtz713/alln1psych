/**
 * Review & Reflect — Weekly reflection on a goal. Feeds insights.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { useGoalsStore, weekKey } from '../../stores/goalsStore';

export interface ReviewReflectModalProps {
  visible: boolean;
  goalId: string | null;
  goalTitle: string;
  onClose: () => void;
}

type Rating = 'great' | 'okay' | 'struggled' | null;

const SUCCESS_DURATION_MS = 2200;

export function ReviewReflectModal({ visible, goalId, goalTitle, onClose }: ReviewReflectModalProps) {
  const addReflection = useGoalsStore((s) => s.addReflection);
  const [rating, setRating] = useState<Rating>(null);
  const [whatHelped, setWhatHelped] = useState('');
  const [whatGotInTheWay, setWhatGotInTheWay] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!visible) setShowSuccess(false);
  }, [visible]);

  const handleSubmit = () => {
    if (!goalId || !rating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addReflection({
      goalId,
      weekKey: weekKey(),
      rating,
      whatHelped: whatHelped.trim() || undefined,
      whatGotInTheWay: whatGotInTheWay.trim() || undefined,
    });
    setRating(null);
    setWhatHelped('');
    setWhatGotInTheWay('');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, SUCCESS_DURATION_MS);
  };

  if (!visible) return null;

  if (showSuccess) {
    return (
      <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={[styles.body, styles.successBody]}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.success} style={styles.successIcon} />
            <Text style={styles.successTitle}>Reflection saved</Text>
            <Text style={styles.successSub}>Nice work taking time to review your progress.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly reflection</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.body}>
          <Text style={styles.goalLabel}>{goalTitle}</Text>
          <Text style={styles.prompt}>How did this goal go this week?</Text>
          <View style={styles.ratingRow}>
            {(['great', 'okay', 'struggled'] as const).map((r) => (
              <Pressable
                key={r}
                style={[styles.ratingBtn, rating === r && styles.ratingBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRating(r); }}
              >
                <Text style={[styles.ratingText, rating === r && styles.ratingTextActive]}>
                  {r === 'great' ? 'Great' : r === 'okay' ? 'Okay' : 'Struggled'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.prompt}>What helped? (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning routine, accountability partner"
            placeholderTextColor={COLORS.textMuted}
            value={whatHelped}
            onChangeText={setWhatHelped}
            multiline
          />
          <Text style={styles.prompt}>What got in the way? (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Busy week, low energy"
            placeholderTextColor={COLORS.textMuted}
            value={whatGotInTheWay}
            onChangeText={setWhatGotInTheWay}
            multiline
          />
        </View>
        <View style={styles.footer}>
          <Pressable
            style={[styles.submitBtn, !rating && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!rating}
          >
            <Text style={[styles.submitBtnText, !rating && styles.submitBtnTextDisabled]}>Save reflection</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  closeBtn: { padding: 8 },
  body: { flex: 1, padding: 20 },
  goalLabel: { fontSize: 15, fontWeight: '600', color: COLORS.accent, marginBottom: 16 },
  prompt: { fontSize: 15, fontWeight: '500', color: COLORS.text, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  ratingBtn: { flex: 1, paddingVertical: 14, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  ratingBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  ratingText: { fontSize: 15, color: COLORS.textSecondary },
  ratingTextActive: { color: COLORS.accent, fontWeight: '600' },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, borderWidth: 1, borderColor: COLORS.border, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { paddingVertical: 16, borderRadius: BORDER_RADIUS.button, backgroundColor: COLORS.accent, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: COLORS.surface, opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  submitBtnTextDisabled: { color: COLORS.textMuted },
  successBody: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  successSub: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' },
});
