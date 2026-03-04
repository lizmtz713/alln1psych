/**
 * Log a connection (call, text, in-person, etc.) with duration, mood, summary, follow-ups.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useCircleStore } from '../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';
import type { ConnectionMood } from '../../src/types/lights';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';

const CONNECTION_TYPES = [
  { value: 'call' as const, label: 'Call', icon: 'call' },
  { value: 'text' as const, label: 'Text', icon: 'chatbubble' },
  { value: 'video' as const, label: 'Video', icon: 'videocam' },
  { value: 'in-person' as const, label: 'In person', icon: 'person' },
  { value: 'social' as const, label: 'Social', icon: 'share-social' },
  { value: 'mind-mail' as const, label: 'Mind Mail', icon: 'mail' },
  { value: 'other' as const, label: 'Other', icon: 'ellipsis-horizontal' },
];

const MOODS: { value: ConnectionMood; label: string }[] = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'hard', label: 'Hard' },
  { value: 'other', label: 'Other' },
];

export default function LogEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
    }))
  );
  const lights = useMemo(() => computeLights(members, persistState), [members, persistState]);
  const light = lights.find((l) => l.id === id);
  const addConnectionEntry = useLightsStore((s) => s.addConnectionEntry);

  const [type, setType] = useState<typeof CONNECTION_TYPES[0]['value']>('call');
  const [duration, setDuration] = useState('');
  const [mood, setMood] = useState<ConnectionMood | ''>('');
  const [summary, setSummary] = useState('');
  const [followUpsText, setFollowUpsText] = useState('');

  if (!light || !id) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Light not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const followUps = followUpsText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSave = () => {
    const durationNum = duration ? parseInt(duration, 10) : undefined;
    addConnectionEntry(id, {
      date: new Date(),
      type,
      duration: durationNum && durationNum > 0 ? durationNum : undefined,
      mood: mood || undefined,
      summary: summary.trim() || undefined,
      followUps: followUps.length > 0 ? followUps : undefined,
    });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Log connection with {light.name}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.chipRow}>
          {CONNECTION_TYPES.map((t) => (
            <Pressable
              key={t.value}
              style={[styles.chip, type === t.value && styles.chipSelected]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.chipText, type === t.value && styles.chipTextSelected]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="e.g. 15"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it felt</Text>
        <View style={styles.chipRow}>
          {MOODS.map((m) => (
            <Pressable
              key={m.value}
              style={[styles.chip, mood === m.value && styles.chipSelected]}
              onPress={() => setMood(m.value)}
            >
              <Text style={[styles.chipText, mood === m.value && styles.chipTextSelected]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What you talked about</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Brief summary..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Follow-ups to remember</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={followUpsText}
          onChangeText={setFollowUpsText}
          placeholder="One per line or comma-separated, e.g. Ask about her interview"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={2}
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Save</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  muted: { fontSize: 14, color: COLORS.textMuted, padding: 24 },
  link: { fontSize: 16, color: COLORS.accent, padding: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: COLORS.accent, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
  },
  secondaryButtonText: { fontSize: 15, color: COLORS.text },
});
