import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore, type RelationshipType } from '../../src/stores/circleStore';

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'partner', label: 'Partner' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'other', label: 'Other' },
];

export default function InviteCircleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addMember = useCircleStore((s) => s.addMember);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('friend');
  const [contact, setContact] = useState('');
  const [sharingLevel, setSharingLevel] = useState<'full' | 'limited'>('full');

  const handleSend = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addMember({
      name: trimmedName,
      relationship,
      contactMethod: contact.trim(),
      sharingLevel,
    });
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Who would you like to add?</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Relationship</Text>
      <View style={styles.chipRow}>
        {RELATIONSHIPS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.chip, relationship === opt.value && styles.chipSelected]}
            onPress={() => setRelationship(opt.value)}
          >
            <Text style={[styles.chipText, relationship === opt.value && styles.chipTextSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>How should we reach them?</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone or email"
        placeholderTextColor={COLORS.textMuted}
        value={contact}
        onChangeText={setContact}
        keyboardType="email-address"
      />
      <Text style={styles.label}>Sharing level</Text>
      <Pressable
        style={[styles.optionCard, sharingLevel === 'full' && styles.optionCardSelected]}
        onPress={() => setSharingLevel('full')}
      >
        <Text style={[styles.optionTitle, sharingLevel === 'full' && styles.optionTitleSelected]}>
          Full temperature
        </Text>
        <Text style={styles.optionSub}>They see your green / yellow / orange / red status</Text>
      </Pressable>
      <Pressable
        style={[styles.optionCard, sharingLevel === 'limited' && styles.optionCardSelected]}
        onPress={() => setSharingLevel('limited')}
      >
        <Text style={[styles.optionTitle, sharingLevel === 'limited' && styles.optionTitleSelected]}>
          Limited
        </Text>
        <Text style={styles.optionSub}>They only get nudged if you're orange or red</Text>
      </Pressable>
      <View style={styles.preview}>
        <Text style={styles.previewText}>
          {name.trim() || 'They'} will see your emotional temperature but NEVER your conversations or
          journal entries.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed, !name.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!name.trim()}
      >
        <Text style={styles.sendButtonText}>Send Invite</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  optionCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
  },
  optionTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTitleSelected: {
    color: COLORS.accentMuted,
  },
  optionSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  preview: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: BORDER_RADIUS.input,
    marginTop: 8,
    marginBottom: 24,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  sendButtonPressed: { opacity: 0.9 },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
});
