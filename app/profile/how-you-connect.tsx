/**
 * Profile — How You Connect (love language, learning style, communication, conflict, energy)
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore, type LoveLanguage, type LearningStyle } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { updateExtendedProfile } from '../../src/services/profileService';
import {
  CONFLICT_STYLE_OPTIONS,
  ENERGY_PATTERN_OPTIONS,
  INTROVERT_EXTROVERT_OPTIONS,
} from '../../src/lib/profileOptions';
import { COLORS } from '../../src/lib/constants';

const LOVE_LANGUAGE_OPTIONS: { value: LoveLanguage; label: string }[] = [
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'quality-time', label: 'Quality Time' },
  { value: 'acts-of-service', label: 'Acts of Service' },
  { value: 'physical-touch', label: 'Physical Touch' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'unknown', label: 'Not set' },
];
const LEARNING_OPTIONS: { value: LearningStyle; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
  { value: 'doing', label: 'Doing' },
  { value: 'talking', label: 'Talking' },
  { value: 'unknown', label: 'Not set' },
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileHowYouConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage>(user.loveLanguage || 'unknown');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(user.learningStyle || 'unknown');
  const [communicationDirect, setCommunicationDirect] = useState(user.communicationStyleDirect || 0);
  const [communicationEmotional, setCommunicationEmotional] = useState(user.communicationStyleEmotional || 0);
  const [conflictStyle, setConflictStyle] = useState(user.conflictStyle || '');
  const [energyPattern, setEnergyPattern] = useState(user.energyPattern || '');
  const [introvertExtrovert, setIntrovertExtrovert] = useState(user.introvertExtrovert || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoveLanguage(user.loveLanguage || 'unknown');
    setLearningStyle(user.learningStyle || 'unknown');
    setCommunicationDirect(user.communicationStyleDirect || 0);
    setCommunicationEmotional(user.communicationStyleEmotional || 0);
    setConflictStyle(user.conflictStyle || '');
    setEnergyPattern(user.energyPattern || '');
    setIntrovertExtrovert(user.introvertExtrovert || '');
  }, []);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    const store = useUserStore.getState();
    store.setLoveLanguage(loveLanguage === 'unknown' ? null : loveLanguage);
    store.setLearningStyle(learningStyle === 'unknown' ? null : learningStyle);
    store.setCommunicationStyleDirect(communicationDirect);
    store.setCommunicationStyleEmotional(communicationEmotional);
    store.setConflictStyle(conflictStyle);
    store.setEnergyPattern(energyPattern);
    store.setIntrovertExtrovert(introvertExtrovert);
    if (authUser?.id) {
      await updateExtendedProfile(authUser.id, {
        love_language: loveLanguage === 'unknown' ? null : loveLanguage,
        learning_style: learningStyle === 'unknown' ? null : learningStyle,
        communication_style_direct: communicationDirect || null,
        communication_style_emotional: communicationEmotional || null,
        conflict_style: conflictStyle || null,
        energy_pattern: energyPattern || null,
        introvert_extrovert: introvertExtrovert || null,
      });
    }
    setSaving(false);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>How You Connect</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Love Language</Text>
        <View style={styles.chipRow}>
          {LOVE_LANGUAGE_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} selected={loveLanguage === o.value} onPress={() => setLoveLanguage(o.value)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Learning Style</Text>
        <View style={styles.chipRow}>
          {LEARNING_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} selected={learningStyle === o.value} onPress={() => setLearningStyle(o.value)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Communication — Direct (1) vs Indirect (5)</Text>
        <View style={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} style={[styles.scaleDot, communicationDirect === n && styles.scaleDotSelected]} onPress={() => setCommunicationDirect(n)}>
              <Text style={styles.scaleNum}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Communication — Emotional (1) vs Analytical (5)</Text>
        <View style={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} style={[styles.scaleDot, communicationEmotional === n && styles.scaleDotSelected]} onPress={() => setCommunicationEmotional(n)}>
              <Text style={styles.scaleNum}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Conflict Style</Text>
        <View style={styles.chipRow}>
          {CONFLICT_STYLE_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={conflictStyle === o} onPress={() => setConflictStyle(o)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Energy Pattern</Text>
        <View style={styles.chipRow}>
          {ENERGY_PATTERN_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={energyPattern === o} onPress={() => setEnergyPattern(o)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Introvert / Extrovert</Text>
        <View style={styles.chipRow}>
          {INTROVERT_EXTROVERT_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={introvertExtrovert === o} onPress={() => setIntrovertExtrovert(o)} />
          ))}
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
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface },
  chipSelected: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  scaleRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  scaleDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  scaleDotSelected: { backgroundColor: COLORS.accent },
  scaleNum: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
