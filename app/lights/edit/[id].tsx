/**
 * Edit Light — Birthday and profile details (for Memory Engine and relationship intelligence).
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useCircleStore } from '../../../src/stores/circleStore';
import { useLightsStore, computeLights } from '../../../src/stores/lightsStore';
import { useShallow } from 'zustand/react/shallow';

export default function EditLightScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(useShallow((s) => ({
    tierByMemberId: s.tierByMemberId,
    connectionLogByMemberId: s.connectionLogByMemberId,
    lastContactByMemberId: s.lastContactByMemberId,
    lightExtrasByMemberId: s.lightExtrasByMemberId,
    momentumByMemberId: s.momentumByMemberId,
    lastHeroShownByMemberId: s.lastHeroShownByMemberId,
    seasonByMemberId: s.seasonByMemberId,
    timelineEventsByMemberId: s.timelineEventsByMemberId,
  })));
  const lights = useMemo(() => computeLights(Array.isArray(members) ? members : [], persistState), [members, persistState]);
  const light = lights.find((l) => l.id === id);
  const updateMemberBirthday = useCircleStore((s) => s.updateMemberBirthday);

  const [birthday, setBirthday] = useState('');

  useEffect(() => {
    if (light?.birthday) setBirthday(light.birthday);
  }, [light?.id, light?.birthday]);

  const normalizeBirthday = (raw: string): string | undefined => {
    const t = raw.trim();
    if (!t) return undefined;
    const match = t.match(/^(\d{1,2})-(\d{1,2})(?:-(\d{4}))?$/);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    return undefined;
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const value = normalizeBirthday(birthday);
    updateMemberBirthday(id, value);
    router.back();
  };

  if (!light) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Person not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.name}>{light.name}</Text>

        <Text style={styles.label}>Birthday</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 12-25 or 1990-12-25"
          placeholderTextColor={COLORS.textMuted}
          value={birthday}
          onChangeText={setBirthday}
        />
        <Text style={styles.hint}>Used for birthday reminders and Memory Engine.</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginBottom: 16 },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, color: COLORS.accent, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  saveBtn: { padding: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
});
