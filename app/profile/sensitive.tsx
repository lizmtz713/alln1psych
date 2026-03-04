/**
 * Profile — Sensitive Topics (topics to handle carefully, triggers to avoid, strength meaning)
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
import { updateUserStory } from '../../src/services/userStoryService';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/profileOptions';
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

export default function ProfileSensitiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [sensitiveTopics, setSensitiveTopics] = useState<string[]>(user.sensitiveTopics || []);
  const [sensitiveTopicsCustom, setSensitiveTopicsCustom] = useState<string[]>(user.sensitiveTopicsCustom || []);
  const [triggersToAvoid, setTriggersToAvoid] = useState(user.triggersToAvoid || '');
  const [strengthMeaning, setStrengthMeaning] = useState(user.strengthMeaning || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSensitiveTopics(user.sensitiveTopics || []);
    setSensitiveTopicsCustom(user.sensitiveTopicsCustom || []);
    setTriggersToAvoid(user.triggersToAvoid || '');
    setStrengthMeaning(user.strengthMeaning || '');
  }, []);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    const store = useUserStore.getState();
    store.setSensitiveTopics(sensitiveTopics);
    store.setSensitiveTopicsCustom(sensitiveTopicsCustom);
    store.setTriggersToAvoid(triggersToAvoid);
    store.setStrengthMeaning(strengthMeaning);
    if (authUser?.id) {
      await updateExtendedProfile(authUser.id, {
        sensitive_topics_custom: sensitiveTopicsCustom.length ? sensitiveTopicsCustom : null,
        triggers_to_avoid: triggersToAvoid || null,
      });
      await updateUserStory(authUser.id, { strength_meaning: strengthMeaning || null });
    }
    setSaving(false);
    router.back();
  };

  const toggleTopic = (v: string) => {
    setSensitiveTopics((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sensitive Topics</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Topics to handle carefully</Text>
        <Text style={styles.hint}>We will not bring these up casually. Select any that apply.</Text>
        <MultiChip options={SENSITIVE_TOPIC_OPTIONS} selected={sensitiveTopics} onToggle={toggleTopic} />
        <Text style={styles.sectionLabel}>Triggers to avoid</Text>
        <TextInput
          style={styles.input}
          placeholder="Specific words, topics, or scenarios we should avoid?"
          placeholderTextColor={COLORS.textMuted}
          value={triggersToAvoid}
          onChangeText={setTriggersToAvoid}
          multiline
        />
        <Text style={styles.sectionLabel}>What being strong meant in your family</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Do not cry. Handle it yourself."
          placeholderTextColor={COLORS.textMuted}
          value={strengthMeaning}
          onChangeText={setStrengthMeaning}
        />
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
  hint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface },
  chipSelected: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
});
