/**
 * Direction gauge — My purpose and goals. Big picture, this season, goals, blocks, what helps.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { DIRECTION_BLOCKS } from '../../../src/lib/gaugeOptions';
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

export default function DirectionGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { direction: def, setDirection: setDef } = useGaugeDefinitionsStore();

  const [bigPicture, setBigPicture] = useState(def.bigPicture);
  const [thisSeason, setThisSeason] = useState(def.thisSeason);
  const [goals, setGoals] = useState<string[]>(def.goals);
  const [newGoal, setNewGoal] = useState('');
  const [blocks, setBlocks] = useState<string[]>(def.blocks);
  const [weeklyCheckin, setWeeklyCheckin] = useState(def.weeklyCheckin);
  const [monthlyReflection, setMonthlyReflection] = useState(def.monthlyReflection);
  const [whatHelps, setWhatHelps] = useState<string[]>(def.whatHelps);
  const [newHelp, setNewHelp] = useState('');

  useEffect(() => {
    setBigPicture(def.bigPicture);
    setThisSeason(def.thisSeason);
    setGoals(def.goals);
    setBlocks(def.blocks);
    setWeeklyCheckin(def.weeklyCheckin);
    setMonthlyReflection(def.monthlyReflection);
    setWhatHelps(def.whatHelps);
  }, []);

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDef({ bigPicture, thisSeason, goals, blocks, weeklyCheckin, monthlyReflection, whatHelps });
    router.back();
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals((prev) => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (i: number) => {
    setGoals((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleBlock = (v: string) => {
    setBlocks((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const addHelp = () => {
    if (newHelp.trim()) {
      setWhatHelps((prev) => [...prev, newHelp.trim()]);
      setNewHelp('');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Direction</Text>
        <Pressable onPress={save}><Text style={styles.saveBtn}>Save</Text></Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Direction</Text>
        <Text style={styles.heroSub}>Your sense of purpose</Text>
        <Text style={styles.blockTitle}>What Direction measures</Text>
        <Text style={styles.blockBody}>Do you feel movement toward something meaningful? Not about a 5-year plan — about a sense of forward motion.</Text>
        <Pressable style={styles.aiCta} onPress={() => router.push('/profile/gauges/direction-discovery')}>
          <Ionicons name="sparkles" size={20} color={COLORS.accent} />
          <Text style={styles.aiCtaText}>Help me figure it out</Text>
        </Pressable>
        <Text style={styles.blockTitle}>My current direction</Text>
        <Text style={styles.blockBody}>Big picture:</Text>
        <TextInput style={styles.textArea} placeholder="e.g. Building a career that helps people while supporting my family" placeholderTextColor={COLORS.textMuted} value={bigPicture} onChangeText={setBigPicture} multiline />
        <Text style={styles.blockBody}>This season or year:</Text>
        <TextInput style={styles.textArea} placeholder="e.g. Launch InGauge. Get 1000 users." placeholderTextColor={COLORS.textMuted} value={thisSeason} onChangeText={setThisSeason} multiline />
        <Text style={styles.blockTitle}>Direction goals</Text>
        {goals.map((g, i) => (
          <View key={i} style={styles.goalRow}>
            <Text style={styles.checkLabel}>{g}</Text>
            <Pressable onPress={() => removeGoal(i)}><Ionicons name="close-circle-outline" size={22} color={COLORS.textMuted} /></Pressable>
          </View>
        ))}
        <View style={styles.addGoalRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Ship MVP by March" placeholderTextColor={COLORS.textMuted} value={newGoal} onChangeText={setNewGoal} />
          <Pressable style={styles.addBtn} onPress={addGoal}><Text style={styles.addBtnText}>+ Add</Text></Pressable>
        </View>
        <Text style={styles.blockTitle}>What blocks my direction</Text>
        {DIRECTION_BLOCKS.map((b) => <Checkbox key={b} label={b} checked={blocks.includes(b)} onToggle={() => toggleBlock(b)} />)}
        <Text style={styles.blockTitle}>Accountability</Text>
        <View style={styles.switchRow}><Text style={styles.switchLabel}>Weekly direction check-in</Text><Switch value={weeklyCheckin} onValueChange={setWeeklyCheckin} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" /></View>
        <View style={styles.switchRow}><Text style={styles.switchLabel}>Monthly reflection</Text><Switch value={monthlyReflection} onValueChange={setMonthlyReflection} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" /></View>
        <Text style={styles.blockTitle}>What helps my direction</Text>
        {whatHelps.map((h, i) => <View key={i} style={styles.helpRow}><Text style={styles.bullet}>•</Text><Text style={styles.helpText}>{h}</Text></View>)}
        <View style={styles.addHelpRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Writing clarifies my thinking" placeholderTextColor={COLORS.textMuted} value={newHelp} onChangeText={setNewHelp} />
          <Pressable style={styles.addHelpBtn} onPress={addHelp}><Text style={styles.addHelpBtnText}>+ Add</Text></Pressable>
        </View>
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
  aiCta: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: COLORS.accentBg, borderRadius: 12, marginBottom: 12 },
  aiCtaText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 6 },
  addGoalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.accentBg, borderRadius: 12 },
  addBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  helpRow: { flexDirection: 'row', marginBottom: 4 },
  bullet: { marginRight: 8, fontSize: 14, color: COLORS.textMuted },
  helpText: { fontSize: 14, color: COLORS.text, flex: 1 },
  addHelpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addHelpBtn: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.accentBg, borderRadius: 12 },
  addHelpBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
