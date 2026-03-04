/**
 * Profile — In Your Own Words (what makes you different)
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
import { COLORS } from '../../src/lib/constants';

const MAX_CHARS = 1000;

export default function ProfileInYourOwnWordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [whatMakesYouDifferent, setWhatMakesYouDifferent] = useState(user.whatMakesYouDifferent || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWhatMakesYouDifferent(user.whatMakesYouDifferent || '');
  }, []);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    const text = whatMakesYouDifferent.slice(0, MAX_CHARS);
    useUserStore.getState().setWhatMakesYouDifferent(text);
    if (authUser?.id) {
      await updateExtendedProfile(authUser.id, { what_makes_you_different: text || null });
    }
    setSaving(false);
    router.back();
  };

  const len = whatMakesYouDifferent.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>In Your Own Words</Text>
        <Pressable onPress={save} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hero}>Anything else that shapes how you experience the world?</Text>
        <Text style={styles.hint}>e.g. ADHD, autism, recovery, veteran, caregiver, chronic pain</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us in your own words..."
          placeholderTextColor={COLORS.textMuted}
          value={whatMakesYouDifferent}
          onChangeText={setWhatMakesYouDifferent}
          multiline
          maxLength={MAX_CHARS + 100}
        />
        <Text style={styles.counter}>{len} / {MAX_CHARS}</Text>
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
  hero: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, minHeight: 160, textAlignVertical: 'top' },
  counter: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
});
