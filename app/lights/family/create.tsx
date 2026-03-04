import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useCircleStore } from '../../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../../src/stores/lightsStore';
import { useFamilyStore } from '../../../src/stores/familyStore';
import type { Light } from '../../../src/types/lights';

const EMOJIS = ['👨‍👩‍👧', '👨‍👩‍👧‍👦', '👩‍👩‍👧', '👨‍👨‍👦', '👵', '🏠', '❤️', '🌳'];

const FAMILY_RELATIONSHIPS = ['parent', 'child', 'sibling', 'partner', 'spouse'];

function isFamilyLike(light: Light): boolean {
  const r = (light.relationshipType ?? '').toLowerCase();
  return FAMILY_RELATIONSHIPS.some((rel) => r.includes(rel)) || r.includes('family');
}

export default function CreateFamilyScreen() {
  const router = useRouter();
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
    }))
  );
  const lights = computeLights(members, persistState);
  const createFamily = useFamilyStore((s) => s.createFamily);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👨‍👩‍👧');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const familyLights = lights.filter(isFamilyLike);
  const otherLights = lights.filter((l) => !isFamilyLike(l));

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleCreate = () => {
    if (!name.trim() || selectedIds.length === 0) return;
    const family = createFamily(name.trim(), selectedIds, emoji);
    router.replace(`/lights/family/${family.id}` as any);
  };

  const canCreate = name.trim().length > 0 && selectedIds.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Family name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. The Martinez Family"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Emoji</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              style={[styles.emojiButton, emoji === e && styles.emojiSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emoji}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Family members</Text>
        <Text style={styles.hint}>Select from your Lights</Text>

        {familyLights.length > 0 && (
          <>
            <Text style={styles.subLabel}>Family</Text>
            {familyLights.map((light) => (
              <Pressable
                key={light.id}
                style={[styles.memberRow, selectedIds.includes(light.id) && styles.memberSelected]}
                onPress={() => toggleMember(light.id)}
              >
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{light.name}</Text>
                  <Text style={styles.memberRole}>{light.relationshipType}</Text>
                </View>
                {selectedIds.includes(light.id) && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </>
        )}

        {otherLights.length > 0 && (
          <>
            <Text style={styles.subLabel}>Others</Text>
            {otherLights.map((light) => (
              <Pressable
                key={light.id}
                style={[styles.memberRow, selectedIds.includes(light.id) && styles.memberSelected]}
                onPress={() => toggleMember(light.id)}
              >
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{light.name}</Text>
                  <Text style={styles.memberRole}>{light.relationshipType}</Text>
                </View>
                {selectedIds.includes(light.id) && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </>
        )}
      </View>

      <Pressable
        style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={!canCreate}
      >
        <Text style={styles.createButtonText}>Create family ({selectedIds.length} members)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  subLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
  hint: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiButton: {
    padding: 12,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  emojiSelected: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  emoji: { fontSize: 24 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
  },
  memberSelected: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  memberRole: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 18, color: COLORS.accent, fontWeight: 'bold' },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
