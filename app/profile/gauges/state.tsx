/**
 * State gauge — My nervous system baseline. Triggers, regulation tools, accountability.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { STATE_TRIGGERS, REGULATION_TOOLS } from '../../../src/lib/gaugeOptions';
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

export default function StateGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state: def, setState: setDef } = useGaugeDefinitionsStore();

  const [baselineNote, setBaselineNote] = useState(def.baselineNote);
  const [typicalScore, setTypicalScore] = useState(def.typicalScore == null ? '' : String(def.typicalScore));
  const [triggers, setTriggers] = useState<string[]>(def.triggers);
  const [regulationTools, setRegulationTools] = useState<string[]>(def.regulationTools);
  const [remindWhenBelow, setRemindWhenBelow] = useState(def.remindWhenBelow == null ? '' : String(def.remindWhenBelow));
  const [morningPrompt, setMorningPrompt] = useState(def.morningPrompt);
  const [eveningPrompt, setEveningPrompt] = useState(def.eveningPrompt);
  const [whatHelps, setWhatHelps] = useState<string[]>(def.whatHelps);
  const [newHelp, setNewHelp] = useState('');

  useEffect(() => {
    setBaselineNote(def.baselineNote);
    setTypicalScore(def.typicalScore == null ? '' : String(def.typicalScore));
    setTriggers(def.triggers);
    setRegulationTools(def.regulationTools);
    setRemindWhenBelow(def.remindWhenBelow == null ? '' : String(def.remindWhenBelow));
    setMorningPrompt(def.morningPrompt);
    setEveningPrompt(def.eveningPrompt);
    setWhatHelps(def.whatHelps);
  }, []);

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const t = typicalScore ? parseInt(typicalScore, 10) : null;
    const r = remindWhenBelow ? parseInt(remindWhenBelow, 10) : null;
    setDef({
      baselineNote,
      typicalScore: t != null && !isNaN(t) ? Math.min(100, Math.max(0, t)) : null,
      triggers,
      regulationTools,
      remindWhenBelow: r != null && !isNaN(r) ? Math.min(100, Math.max(0, r)) : null,
      morningPrompt,
      eveningPrompt,
      whatHelps,
    });
    router.back();
  };

  const toggle = (arr: string[], setArr: (a: string[]) => void, v: string) => {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
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
        <Text style={styles.headerTitle}>State</Text>
        <Pressable onPress={save}><Text style={styles.saveBtn}>Save</Text></Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>State</Text>
        <Text style={styles.heroSub}>Your nervous system regulation</Text>
        <Text style={styles.blockTitle}>What State measures</Text>
        <Text style={styles.blockBody}>How regulated your nervous system is. Polyvagal: Ventral (safe), Sympathetic (fight/flight), Dorsal (shutdown).</Text>
        <Text style={styles.blockTitle}>My State baseline</Text>
        <Text style={styles.blockBody}>Typical State score (0-100):</Text>
        <TextInput style={styles.input} placeholder="e.g. 50" placeholderTextColor={COLORS.textMuted} value={typicalScore} onChangeText={setTypicalScore} keyboardType="number-pad" />
        <TextInput style={styles.textArea} placeholder="e.g. I run anxious, 50 is good for me" placeholderTextColor={COLORS.textMuted} value={baselineNote} onChangeText={setBaselineNote} multiline />
        <Text style={styles.blockTitle}>My triggers</Text>
        {STATE_TRIGGERS.map((t) => <Checkbox key={t} label={t} checked={triggers.includes(t)} onToggle={() => toggle(triggers, setTriggers, t)} />)}
        <Text style={styles.blockTitle}>My regulation tools</Text>
        {REGULATION_TOOLS.map((t) => <Checkbox key={t} label={t} checked={regulationTools.includes(t)} onToggle={() => toggle(regulationTools, setRegulationTools, t)} />)}
        <Text style={styles.blockTitle}>Accountability</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Remind when State drops below</Text>
          <TextInput style={[styles.inputSmall, { width: 48, textAlign: 'center' }]} placeholder="30" value={remindWhenBelow} onChangeText={setRemindWhenBelow} keyboardType="number-pad" />
        </View>
        <View style={styles.switchRow}><Text style={styles.switchLabel}>Morning regulation prompt</Text><Switch value={morningPrompt} onValueChange={setMorningPrompt} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" /></View>
        <View style={styles.switchRow}><Text style={styles.switchLabel}>Evening wind-down prompt</Text><Switch value={eveningPrompt} onValueChange={setEveningPrompt} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" /></View>
        <Text style={styles.blockTitle}>What helps my State</Text>
        {whatHelps.map((h, i) => <View key={i} style={styles.helpRow}><Text style={styles.bullet}>•</Text><Text style={styles.helpText}>{h}</Text></View>)}
        <View style={styles.addHelpRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Box breathing works fast" placeholderTextColor={COLORS.textMuted} value={newHelp} onChangeText={setNewHelp} />
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
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12 },
  inputSmall: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, fontSize: 15, color: COLORS.text },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
  helpRow: { flexDirection: 'row', marginBottom: 4 },
  bullet: { marginRight: 8, fontSize: 14, color: COLORS.textMuted },
  helpText: { fontSize: 14, color: COLORS.text, flex: 1 },
  addHelpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addHelpBtn: { paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.accentBg, borderRadius: 12 },
  addHelpBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
