/**
 * Emotion gauge — How I experience feelings. Style, struggles, context, goal.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { EMOTION_STYLE_OPTIONS, EMOTIONS_STRUGGLE } from '../../../src/lib/gaugeOptions';
import { COLORS } from '../../../src/lib/constants';

function Checkbox({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable style={styles.checkRow} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

export default function EmotionGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { emotion: def, setEmotion: setDef } = useGaugeDefinitionsStore();

  const [style, setStyle] = useState(def.style);
  const [emotionsStruggle, setEmotionsStruggle] = useState<string[]>(def.emotionsStruggle);
  const [context, setContext] = useState(def.context);
  const [currentGoal, setCurrentGoal] = useState(def.currentGoal);

  useEffect(() => {
    setStyle(def.style);
    setEmotionsStruggle(def.emotionsStruggle);
    setContext(def.context);
    setCurrentGoal(def.currentGoal);
  }, []);

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDef({ style, emotionsStruggle, context, currentGoal });
    router.back();
  };

  const toggleStruggle = (v: string) => {
    setEmotionsStruggle((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Emotion</Text>
        <Pressable onPress={save}><Text style={styles.saveBtn}>Save</Text></Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Emotion</Text>
        <Text style={styles.heroSub}>Your emotional landscape</Text>
        <Text style={styles.blockTitle}>What Emotion measures</Text>
        <Text style={styles.blockBody}>Awareness, expression, processing. High = I know what I feel. Low = Numb, overwhelmed, confused.</Text>
        <Text style={styles.blockTitle}>My emotional style</Text>
        {EMOTION_STYLE_OPTIONS.map((o) => (
          <Pressable key={o} style={[styles.radioRow, style === o && styles.radioRowSelected]} onPress={() => setStyle(o)}>
            <View style={[styles.radio, style === o && styles.radioSelected]} />
            <Text style={styles.radioLabel}>{o}</Text>
          </Pressable>
        ))}
        <Text style={styles.blockTitle}>Emotions I struggle with</Text>
        {EMOTIONS_STRUGGLE.map((e) => <Checkbox key={e} label={e} checked={emotionsStruggle.includes(e)} onToggle={() => toggleStruggle(e)} />)}
        <Text style={styles.blockTitle}>My emotional context</Text>
        <TextInput style={styles.textArea} placeholder="What should AI know about how you handle emotions?" placeholderTextColor={COLORS.textMuted} value={context} onChangeText={setContext} multiline />
        <Text style={styles.blockTitle}>Current Emotion goal</Text>
        <TextInput style={styles.input} placeholder="e.g. Practice naming emotions when I notice them" placeholderTextColor={COLORS.textMuted} value={currentGoal} onChangeText={setCurrentGoal} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  saveBtn: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  scroll: { flex: 1 },
  content: { padding: 20 },
  hero: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  blockTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 20, marginBottom: 6 },
  blockBody: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  radioRowSelected: { backgroundColor: COLORS.accentBg },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10 },
  radioSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  radioLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 100, textAlignVertical: 'top', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12 },
});
