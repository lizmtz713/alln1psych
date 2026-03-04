/**
 * Connection gauge — My relationships and needs. Needs, my people, struggles, goal.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGaugeDefinitionsStore } from '../../../src/stores/gaugeDefinitionsStore';
import { CONNECTION_NEEDS, CONNECTION_STRUGGLES } from '../../../src/lib/gaugeOptions';
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

export default function ConnectionGaugeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connection: def, setConnection: setDef } = useGaugeDefinitionsStore();

  const [needs, setNeeds] = useState<string[]>(def.needs);
  const [myPeople, setMyPeople] = useState(def.myPeople);
  const [struggles, setStruggles] = useState<string[]>(def.struggles);
  const [goal, setGoal] = useState(def.goal);
  const [weeklyReminder, setWeeklyReminder] = useState(def.weeklyReminder);

  useEffect(() => {
    setNeeds(def.needs);
    setMyPeople(def.myPeople);
    setStruggles(def.struggles);
    setGoal(def.goal);
    setWeeklyReminder(def.weeklyReminder);
  }, []);

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDef({ needs, myPeople, struggles, goal, weeklyReminder });
    router.back();
  };

  const toggle = (arr: string[], setArr: (a: string[]) => void, v: string) => {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Connection</Text>
        <Pressable onPress={save}><Text style={styles.saveBtn}>Save</Text></Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Connection</Text>
        <Text style={styles.heroSub}>Your relational world</Text>
        <Text style={styles.blockTitle}>What Connection measures</Text>
        <Text style={styles.blockBody}>How connected you feel — not just do you have people, but do you feel seen, supported, loved?</Text>
        <Text style={styles.blockTitle}>My connection needs</Text>
        {CONNECTION_NEEDS.map((n) => <Checkbox key={n} label={n} checked={needs.includes(n)} onToggle={() => toggle(needs, setNeeds, n)} />)}
        <Text style={styles.blockTitle}>My people</Text>
        <Text style={styles.blockBody}>Who matters most? (Helps AI context.) Partner, best friend, family, community.</Text>
        <TextInput style={styles.textArea} placeholder="e.g. Partner: Sam. Best friend: Alex. Family: close to mom and sister." placeholderTextColor={COLORS.textMuted} value={myPeople} onChangeText={setMyPeople} multiline />
        <Text style={styles.blockTitle}>My connection struggles</Text>
        {CONNECTION_STRUGGLES.map((s) => <Checkbox key={s} label={s} checked={struggles.includes(s)} onToggle={() => toggle(struggles, setStruggles, s)} />)}
        <Text style={styles.blockTitle}>Connection goal</Text>
        <TextInput style={styles.input} placeholder="e.g. Reach out to one friend per week, even just a text" placeholderTextColor={COLORS.textMuted} value={goal} onChangeText={setGoal} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Weekly reminder: Who could you reach out to?</Text>
          <Switch value={weeklyReminder} onValueChange={setWeeklyReminder} trackColor={{ false: COLORS.surfaceElevated, true: COLORS.accent }} thumbColor="#fff" />
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 15, color: COLORS.text, flex: 1 },
});
