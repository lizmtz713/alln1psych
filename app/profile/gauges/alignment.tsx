/**
 * Alignment gauge — My values and integrity. Core values, gap, intentions, what helps.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { ALIGNMENT_VALUES, ALIGNMENT_INTENTIONS } from '../../../src/lib/gaugeOptions';
import { COLORS } from '../../../src/lib/constants';

const TOP_VALUES_COUNT = 5;

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

export default function AlignmentGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { alignment: def, setAlignment: setDef } = useGaugeDefinitionsStore();

  const [coreValuesSelected, setCoreValuesSelected] = useState<string[]>(def.coreValuesSelected);
  const [topValues, setTopValues] = useState<string[]>(def.topValues.length ? def.topValues : ['', '', '', '', '']);
  const [gapText, setGapText] = useState(def.gapText);
  const [intentions, setIntentions] = useState<string[]>(def.intentions);
  const [weeklyCheckin, setWeeklyCheckin] = useState(def.weeklyCheckin);
  const [remindWhenBelow, setRemindWhenBelow] = useState(def.remindWhenBelow == null ? '' : String(def.remindWhenBelow));
  const [whatHelps, setWhatHelps] = useState<string[]>(def.whatHelps);
  const [newHelp, setNewHelp] = useState('');

  useEffect(() => {
    setCoreValuesSelected(def?.coreValuesSelected ?? []);
    setTopValues(def?.topValues?.length ? [...def.topValues] : ['', '', '', '', '']);
    setGapText(def?.gapText ?? '');
    setIntentions(def?.intentions ?? []);
    setWeeklyCheckin(def?.weeklyCheckin ?? false);
    setRemindWhenBelow(def?.remindWhenBelow == null ? '' : String(def.remindWhenBelow));
    setWhatHelps(def?.whatHelps ?? []);
  }, []); // sync from store once on mount; def may hydrate async

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const r = remindWhenBelow ? parseInt(remindWhenBelow, 10) : null;
    setDef({
      coreValuesSelected,
      topValues: topValues.filter(Boolean),
      gapText,
      intentions,
      weeklyCheckin,
      remindWhenBelow: r != null && !isNaN(r) ? Math.min(100, Math.max(0, r)) : null,
      whatHelps,
    });
    router.back();
  };

  const toggleValue = (v: string) => {
    setCoreValuesSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const setTopValue = (i: number, val: string) => {
    const next = [...topValues];
    next[i] = val;
    setTopValues(next);
  };

  const toggleIntention = (v: string) => {
    setIntentions((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
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
        <Text style={styles.headerTitle}>Alignment</Text>
        <Pressable onPress={save}><Text style={styles.saveBtn}>Save</Text></Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Alignment</Text>
        <Text style={styles.heroSub}>Living by your values</Text>
        <Text style={styles.blockTitle}>What Alignment measures</Text>
        <Text style={styles.blockBody}>Are you living in integrity with who you want to be? High = actions match values. Low = feel off-track or like a fraud.</Text>
        <Pressable style={styles.aiCta} onPress={() => router.push('/profile/gauges/alignment-discovery')}>
          <Ionicons name="sparkles" size={20} color={COLORS.accent} />
          <Text style={styles.aiCtaText}>Discover my values</Text>
        </Pressable>
        <Text style={styles.blockTitle}>My core values</Text>
        <Text style={styles.blockBody}>Select 5-7 that feel true. Then rank your top 5 below.</Text>
        <View style={styles.chipRow}>
          {(ALIGNMENT_VALUES?.length ? ALIGNMENT_VALUES : []).map((v) => (
            <Checkbox key={v} label={v} checked={coreValuesSelected.includes(v)} onToggle={() => toggleValue(v)} />
          ))}
        </View>
        {(!ALIGNMENT_VALUES || ALIGNMENT_VALUES.length === 0) && (
          <Text style={styles.blockBody}>No value options loaded.</Text>
        )}
        <Text style={styles.blockTitle}>My top 5 values</Text>
        {Array.from({ length: TOP_VALUES_COUNT }).map((_, i) => (
          <TextInput key={i} style={styles.input} placeholder={`${i + 1}.`} placeholderTextColor={COLORS.textMuted} value={topValues[i] ?? ''} onChangeText={(t) => setTopValue(i, t)} />
        ))}
        <Text style={styles.blockTitle}>Where I am out of alignment</Text>
        <TextInput style={styles.textArea} placeholder="e.g. I value health but I am not taking care of my body..." placeholderTextColor={COLORS.textMuted} value={gapText} onChangeText={setGapText} multiline />
        <Text style={styles.blockTitle}>Alignment intentions</Text>
        {ALIGNMENT_INTENTIONS.map((int) => <Checkbox key={int} label={int} checked={intentions.includes(int)} onToggle={() => toggleIntention(int)} />)}
        <Text style={styles.blockTitle}>Accountability</Text>
        <View style={styles.switchRow}><Text style={styles.switchLabel}>Weekly values check</Text><Switch value={weeklyCheckin} onValueChange={setWeeklyCheckin} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" /></View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>When Alignment drops below</Text>
          <TextInput style={[styles.inputSmall, { width: 48, textAlign: 'center' }]} placeholder="30" value={remindWhenBelow} onChangeText={setRemindWhenBelow} keyboardType="number-pad" />
        </View>
        <Text style={styles.blockTitle}>What helps my alignment</Text>
        {whatHelps.map((h, i) => <View key={i} style={styles.helpRow}><Text style={styles.bullet}>•</Text><Text style={styles.helpText}>{h}</Text></View>)}
        <View style={styles.addHelpRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Add what helps" placeholderTextColor={COLORS.textMuted} value={newHelp} onChangeText={setNewHelp} />
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
  checkLabel: { fontSize: 15, color: COLORS.text, flex: 1 }, // explicit text color so chips are visible on dark bg
  textArea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12 },
  inputSmall: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, fontSize: 15, color: COLORS.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
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
