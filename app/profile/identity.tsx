/**
 * Profile — Identity & Body (ethnicity, gender, disability, body relationship)
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { updateExtendedProfile } from '../../src/services/profileService';
import {
  GENDER_IDENTITY_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  DISABILITY_OPTIONS,
  BODY_RELATIONSHIP_OPTIONS,
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

export default function ProfileIdentityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [ethnicity, setEthnicity] = useState('');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState('');
  const [disability, setDisability] = useState<string[]>([]);
  const [disabilityDetails, setDisabilityDetails] = useState('');
  const [bodyRelationship, setBodyRelationship] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEthnicity(user.ethnicity || '');
    setGenderIdentity(user.genderIdentity || '');
    setSexualOrientation(user.sexualOrientation || '');
    setDisability(user.disability || []);
    setDisabilityDetails(user.disabilityDetails || '');
    setBodyRelationship(user.bodyRelationship || '');
  }, []);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    useUserStore.getState().setEthnicity(ethnicity);
    useUserStore.getState().setGenderIdentity(genderIdentity);
    useUserStore.getState().setSexualOrientation(sexualOrientation);
    useUserStore.getState().setDisability(disability);
    useUserStore.getState().setDisabilityDetails(disabilityDetails);
    useUserStore.getState().setBodyRelationship(bodyRelationship);
    if (authUser?.id) {
      await updateExtendedProfile(authUser.id, {
        ethnicity: ethnicity || null,
        gender_identity: genderIdentity || null,
        sexual_orientation: sexualOrientation || null,
        disability: disability.length ? disability : null,
        disability_details: disabilityDetails || null,
        body_relationship: bodyRelationship || null,
      });
    }
    setSaving(false);
    router.back();
  };

  const toggleDisability = (v: string) => {
    setDisability((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Identity</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Ethnicity / Race</Text>
        <TextInput
          style={styles.input}
          placeholder="How do you identify ethnically or racially?"
          placeholderTextColor={COLORS.textMuted}
          value={ethnicity}
          onChangeText={setEthnicity}
        />
        <Text style={styles.sectionLabel}>Gender Identity</Text>
        <View style={styles.chipRow}>
          {GENDER_IDENTITY_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={genderIdentity === o} onPress={() => setGenderIdentity(o)} />
          ))}
        </View>
        <Text style={styles.sectionLabel}>Sexual Orientation (optional)</Text>
        <View style={styles.chipRow}>
          {SEXUAL_ORIENTATION_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={sexualOrientation === o} onPress={() => setSexualOrientation(o)} />
          ))}
        </View>
        <Text style={styles.sectionLabel}>Disability / Chronic Conditions</Text>
        <MultiChip options={DISABILITY_OPTIONS} selected={disability} onToggle={toggleDisability} />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Tell us more if you would like"
          placeholderTextColor={COLORS.textMuted}
          value={disabilityDetails}
          onChangeText={setDisabilityDetails}
        />
        <Text style={styles.sectionLabel}>Relationship with your body</Text>
        <View style={styles.chipRow}>
          {BODY_RELATIONSHIP_OPTIONS.map((o) => (
            <Chip key={o} label={o} selected={bodyRelationship === o} onPress={() => setBodyRelationship(o)} />
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
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text },
  inputSmall: { marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface },
  chipSelected: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
});
