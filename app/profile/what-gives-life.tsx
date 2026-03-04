/**
 * Profile — What Gives You Life (identify as, meaning, life stage, relationship, parenting)
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { updateExtendedProfile } from '../../src/services/profileService';
import {
  IDENTIFY_AS_OPTIONS,
  WHAT_BRINGS_MEANING_OPTIONS,
  CURRENT_LIFE_STAGE_OPTIONS,
  RELATIONSHIP_STATUS_OPTIONS,
  PARENTING_STATUS_OPTIONS,
} from '../../src/lib/profileOptions';
import { COLORS } from '../../src/lib/constants';

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function MultiChip({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={selected.includes(o)} onPress={() => onToggle(o)} />
      ))}
    </View>
  );
}

export default function ProfileWhatGivesLifeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [identifyAs, setIdentifyAs] = useState<string[]>(user.identifyAs || []);
  const [whatBringsMeaning, setWhatBringsMeaning] = useState<string[]>(user.whatBringsMeaning || []);
  const [currentLifeStage, setCurrentLifeStage] = useState(user.currentLifeStage || '');
  const [relationshipStatus, setRelationshipStatus] = useState(user.relationshipStatus || '');
  const [parentingStatus, setParentingStatus] = useState(user.parentingStatus || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIdentifyAs(user.identifyAs || []);
    setWhatBringsMeaning(user.whatBringsMeaning || []);
    setCurrentLifeStage(user.currentLifeStage || '');
    setRelationshipStatus(user.relationshipStatus || '');
    setParentingStatus(user.parentingStatus || '');
  }, []);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    const store = useUserStore.getState();
    store.setIdentifyAs(identifyAs);
    store.setWhatBringsMeaning(whatBringsMeaning);
    store.setCurrentLifeStage(currentLifeStage);
    store.setRelationshipStatus(relationshipStatus);
    store.setParentingStatus(parentingStatus);
    if (authUser?.id) {
      await updateExtendedProfile(authUser.id, {
        identify_as: identifyAs.length ? identifyAs : null,
        what_brings_meaning: whatBringsMeaning.length ? whatBringsMeaning : null,
        current_life_stage: currentLifeStage || null,
        relationship_status: relationshipStatus || null,
        parenting_status: parentingStatus || null,
      });
    }
    setSaving(false);
    router.back();
  };

  const toggleIdentify = (v: string) => {
    setIdentifyAs((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };
  const toggleMeaning = (v: string) => {
    setWhatBringsMeaning((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>What Gives You Life</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>I identify as (multi-select)</Text>
        <MultiChip options={IDENTIFY_AS_OPTIONS} selected={identifyAs} onToggle={toggleIdentify} />
        <Text style={styles.sectionLabel}>What brings you meaning</Text>
        <MultiChip options={WHAT_BRINGS_MEANING_OPTIONS} selected={whatBringsMeaning} onToggle={toggleMeaning} />
        <Text style={styles.sectionLabel}>Current life stage</Text>
        <View style={styles.chipRow}>
          {CURRENT_LIFE_STAGE_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={currentLifeStage === o} onPress={() => setCurrentLifeStage(o)} />
          ))}
        </View>
        <Text style={styles.sectionLabel}>Relationship status</Text>
        <View style={styles.chipRow}>
          {RELATIONSHIP_STATUS_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={relationshipStatus === o} onPress={() => setRelationshipStatus(o)} />
          ))}
        </View>
        <Text style={styles.sectionLabel}>Parenting</Text>
        <View style={styles.chipRow}>
          {PARENTING_STATUS_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={parentingStatus === o} onPress={() => setParentingStatus(o)} />
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
});
