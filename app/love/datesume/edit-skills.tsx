/**
 * Datésumé — Edit skills: expert, proficient, developing (chips + custom).
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { SKILL_SUGGESTIONS } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';

type Tier = 'expert' | 'proficient' | 'developing';

export default function EditSkillsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();

  const [expert, setExpert] = useState<string[]>([]);
  const [proficient, setProficient] = useState<string[]>([]);
  const [developing, setDeveloping] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customTier, setCustomTier] = useState<Tier>('proficient');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d?.skills) {
      setExpert(d.skills.expert ?? []);
      setProficient(d.skills.proficient ?? []);
      setDeveloping(d.skills.developing ?? []);
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const toggle = (tier: Tier, skill: string) => {
    const setter = tier === 'expert' ? setExpert : tier === 'proficient' ? setProficient : setDeveloping;
    const list = tier === 'expert' ? expert : tier === 'proficient' ? proficient : developing;
    if (list.includes(skill)) {
      setter(list.filter((s) => s !== skill));
    } else {
      setter([...list, skill]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addCustom = () => {
    const s = customInput.trim();
    if (!s) return;
    const setter = customTier === 'expert' ? setExpert : customTier === 'proficient' ? setProficient : setDeveloping;
    const list = customTier === 'expert' ? expert : customTier === 'proficient' ? proficient : developing;
    if (!list.includes(s)) {
      setter([...list, s]);
      setCustomInput('');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const remove = (tier: Tier, skill: string) => {
    const setter = tier === 'expert' ? setExpert : tier === 'proficient' ? setProficient : setDeveloping;
    const list = tier === 'expert' ? expert : tier === 'proficient' ? proficient : developing;
    setter(list.filter((s) => s !== skill));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    update({ skills: { expert, proficient, developing } });
    router.back();
  };

  const ChipSection = ({ title, list, tier }: { title: string; list: string[]; tier: Tier }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipRow}>
        {list.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => remove(tier, s)}>
            <Text style={styles.chipText}>{s}</Text>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Tap to add to tier</Text>
      <View style={styles.chipRow}>
        {SKILL_SUGGESTIONS.map((s) => {
          const inExpert = expert.includes(s);
          const inProficient = proficient.includes(s);
          const inDeveloping = developing.includes(s);
          const inAny = inExpert || inProficient || inDeveloping;
          return (
            <Pressable
              key={s}
              style={[
                styles.suggestionChip,
                inExpert && styles.chipExpert,
                inProficient && styles.chipProficient,
                inDeveloping && styles.chipDeveloping,
              ]}
              onPress={() => {
                if (inExpert) toggle('expert', s);
                else if (inProficient) toggle('proficient', s);
                else if (inDeveloping) toggle('developing', s);
                else toggle('proficient', s);
              }}
            >
              <Text style={styles.suggestionChipText} numberOfLines={1}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <ChipSection title="Expert" list={expert} tier="expert" />
      <ChipSection title="Proficient" list={proficient} tier="proficient" />
      <ChipSection title="Developing" list={developing} tier="developing" />

      <Text style={styles.label}>Add custom skill</Text>
      <View style={styles.row}>
        <View style={styles.tierChips}>
          {(['expert', 'proficient', 'developing'] as Tier[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.tierChip, customTier === t && styles.tierChipSelected]}
              onPress={() => setCustomTier(t)}
            >
              <Text style={[styles.tierChipText, customTier === t && styles.tierChipTextSelected]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={customInput}
          onChangeText={setCustomInput}
          placeholder="Skill name"
          placeholderTextColor={COLORS.textMuted}
          onSubmitEditing={addCustom}
        />
        <Pressable style={styles.addBtn} onPress={addCustom}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 14, color: COLORS.text },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionChipText: { fontSize: 13, color: COLORS.textSecondary },
  chipExpert: { borderColor: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.15)' },
  chipProficient: { borderColor: ACCENT, backgroundColor: `${ACCENT}20` },
  chipDeveloping: { borderColor: '#FACC15', backgroundColor: 'rgba(250, 204, 21, 0.15)' },
  row: { marginBottom: 12 },
  tierChips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tierChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tierChipSelected: { borderColor: ACCENT },
  tierChipText: { fontSize: 14, color: COLORS.textSecondary },
  tierChipTextSelected: { color: ACCENT, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.input,
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  saveBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
