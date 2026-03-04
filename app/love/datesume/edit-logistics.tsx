/**
 * Datésumé — Edit logistics: LDR, travel, communication, living, pets, kids, marriage.
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';
const KIDS_OPTIONS = ['yes', 'no', 'maybe', 'have_them'] as const;

export default function EditLogisticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();

  const [openToLDR, setOpenToLDR] = useState<boolean | undefined>(undefined);
  const [willingToTravel, setWillingToTravel] = useState<boolean | undefined>(undefined);
  const [communicationPref, setCommunicationPref] = useState('');
  const [livingSituation, setLivingSituation] = useState('');
  const [pets, setPets] = useState('');
  const [wantsKids, setWantsKids] = useState<'yes' | 'no' | 'maybe' | 'have_them' | undefined>(undefined);
  const [openToMarriage, setOpenToMarriage] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d?.logistics) {
      const L = d.logistics;
      setOpenToLDR(L.openToLDR);
      setWillingToTravel(L.willingToTravel);
      setCommunicationPref(L.communicationPref ?? '');
      setLivingSituation(L.livingSituation ?? '');
      setPets(L.pets ?? '');
      setWantsKids(L.wantsKids);
      setOpenToMarriage(L.openToMarriage);
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({
      logistics: {
        openToLDR,
        willingToTravel,
        communicationPref: communicationPref.trim() || undefined,
        livingSituation: livingSituation.trim() || undefined,
        pets: pets.trim() || undefined,
        wantsKids,
        openToMarriage,
      },
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
      <View style={styles.row}>
        <Text style={styles.label}>Open to long distance</Text>
        <View style={styles.switchRow}>
          <Pressable style={[styles.toggle, openToLDR === false && styles.toggleOn]} onPress={() => setOpenToLDR(false)}>
            <Text style={styles.toggleText}>No</Text>
          </Pressable>
          <Pressable style={[styles.toggle, openToLDR === true && styles.toggleOn]} onPress={() => setOpenToLDR(true)}>
            <Text style={styles.toggleText}>Yes</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Willing to travel</Text>
        <View style={styles.switchRow}>
          <Pressable style={[styles.toggle, willingToTravel === false && styles.toggleOn]} onPress={() => setWillingToTravel(false)}>
            <Text style={styles.toggleText}>No</Text>
          </Pressable>
          <Pressable style={[styles.toggle, willingToTravel === true && styles.toggleOn]} onPress={() => setWillingToTravel(true)}>
            <Text style={styles.toggleText}>Yes</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.label}>Communication preference</Text>
      <TextInput style={styles.input} value={communicationPref} onChangeText={setCommunicationPref} placeholder="e.g. Text daily, call weekly" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Living situation</Text>
      <TextInput style={styles.input} value={livingSituation} onChangeText={setLivingSituation} placeholder="e.g. Own place, roommates" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Pets</Text>
      <TextInput style={styles.input} value={pets} onChangeText={setPets} placeholder="e.g. Dog, cat, none" placeholderTextColor={COLORS.textMuted} />
      <Text style={styles.label}>Kids</Text>
      <View style={styles.chipRow}>
        {KIDS_OPTIONS.map((k) => (
          <Pressable key={k} style={[styles.chip, wantsKids === k && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWantsKids(k); }}>
            <Text style={[styles.chipText, wantsKids === k && styles.chipTextSelected]}>{k.replace('_', ' ')}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Open to marriage</Text>
        <View style={styles.switchRow}>
          <Pressable style={[styles.toggle, openToMarriage === false && styles.toggleOn]} onPress={() => setOpenToMarriage(false)}>
            <Text style={styles.toggleText}>No</Text>
          </Pressable>
          <Pressable style={[styles.toggle, openToMarriage === true && styles.toggleOn]} onPress={() => setOpenToMarriage(true)}>
            <Text style={styles.toggleText}>Yes</Text>
          </Pressable>
        </View>
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
  row: { marginBottom: 16 },
  switchRow: { flexDirection: 'row', gap: 8 },
  toggle: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  toggleOn: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  toggleText: { fontSize: 14, color: COLORS.text },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: BORDER_RADIUS.input, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  saveBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
