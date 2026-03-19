/**
 * After the Fight — Post-conflict guided reflection (MVP).
 * Route: /tools/after-fight
 * Questions: What hurt you most? What do you think hurt them? What do you want now?
 * Output: Repair suggestion + example message + next step.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getAfterFightAdvice, type AfterFightResult } from '../../../src/services/ai';
import { hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function AfterFightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AfterFightResult | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (result) setResult(null);
    else router.back();
  };

  const runAdvice = async () => {
    const a1 = q1.trim();
    const a2 = q2.trim();
    const a3 = q3.trim();
    if (!a1 || !a2 || !a3) return;
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API key needed', 'Add your OpenAI API key in Me → Bring Your Own Key.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await getAfterFightAdvice(a1, a2, a3);
      setResult(res || null);
    } catch {
      Alert.alert('Something went wrong', 'Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = q1.trim().length > 0 && q2.trim().length > 0 && q3.trim().length > 0;

  if (result) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Next steps</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <Text style={[styles.resultLabel, styles.resultLabelFirst]}>Repair suggestion</Text>
            <Text style={styles.resultBody}>{result.repairSuggestion}</Text>
            <Text style={styles.resultLabel}>Example message</Text>
            <Text style={[styles.resultBody, styles.script]}>{result.exampleMessage}</Text>
            <Text style={styles.resultLabel}>Next step</Text>
            <Text style={styles.resultBody}>{result.nextStep}</Text>
          </View>
          <Pressable style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/tone-check'); }}>
            <Ionicons name="chatbubble-outline" size={20} color={ACCENT} />
            <Text style={styles.ctaBtnText}>Check tone before sending</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>After the Fight</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>A short reflection to point you toward repair.</Text>
        <Text style={styles.questionLabel}>What hurt you the most?</Text>
        <TextInput
          style={styles.input}
          placeholder="A sentence or two..."
          placeholderTextColor={MUTED}
          value={q1}
          onChangeText={setQ1}
          multiline
        />
        <Text style={styles.questionLabel}>What do you think hurt them?</Text>
        <TextInput
          style={styles.input}
          placeholder="Your best guess..."
          placeholderTextColor={MUTED}
          value={q2}
          onChangeText={setQ2}
          multiline
        />
        <Text style={styles.questionLabel}>What do you want now?</Text>
        <TextInput
          style={styles.input}
          placeholder="To repair, to be heard, to move on..."
          placeholderTextColor={MUTED}
          value={q3}
          onChangeText={setQ3}
          multiline
        />
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={runAdvice}
          disabled={!canSubmit || loading}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Get repair steps</Text>}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: MUTED, marginBottom: SPACING.xl },
  questionLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  input: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT,
    minHeight: 80,
    marginBottom: SPACING.lg,
  },
  submitBtn: {
    marginTop: SPACING.md,
    backgroundColor: ACCENT,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  resultLabel: { fontSize: 12, fontWeight: '700', color: MUTED, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  resultLabelFirst: { marginTop: 0 },
  resultBody: { fontSize: 15, color: TEXT, lineHeight: 22 },
  script: { fontStyle: 'italic', color: ACCENT },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
});
