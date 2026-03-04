/**
 * Good to Know — Overview + Three Things to Know (max 3).
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useDatesumeStore } from '../../../../../src/stores/datesumeStore';
import { COLORS, BORDER_RADIUS } from '../../../../../src/lib/constants';

const ACCENT = '#EC4899';
const SECTIONS = [
  { key: 'attachment', title: 'Attachment & Emotional', route: '/love/datesume/edit/good-to-know/attachment', emoji: '🧠' },
  { key: 'values', title: 'Core Values', route: '/love/datesume/edit/good-to-know/values', emoji: '💎' },
  { key: 'life-goals', title: 'Life Goals', route: '/love/datesume/edit/good-to-know/life-goals', emoji: '🎯' },
  { key: 'conflict', title: 'Conflict & Communication', route: '/love/datesume/edit/good-to-know/conflict', emoji: '🗣️' },
  { key: 'love-style', title: 'Love Style', route: '/love/datesume/edit/good-to-know/love-style', emoji: '❤️' },
  { key: 'relationships', title: 'How I Relate', route: '/love/datesume/edit/good-to-know/relationships', emoji: '👥' },
  { key: 'lifestyle', title: 'Lifestyle Basics', route: '/love/datesume/edit/good-to-know/lifestyle', emoji: '☀️' },
];

export default function GoodToKnowIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, updateGoodToKnow } = useDatesumeStore();
  const g = datesume?.goodToKnow;
  const [thing1, setThing1] = useState('');
  const [thing2, setThing2] = useState('');
  const [thing3, setThing3] = useState('');

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    const list = g?.threeThingsToKnow ?? [];
    setThing1(list[0] ?? '');
    setThing2(list[1] ?? '');
    setThing3(list[2] ?? '');
  }, [datesume?.updatedAt]);

  const saveThreeThings = () => {
    const three = [thing1.trim(), thing2.trim(), thing3.trim()].filter(Boolean).slice(0, 3);
    updateGoodToKnow({ threeThingsToKnow: three });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.intro}>Science-based compatibility: what actually predicts a good match.</Text>
      <Text style={styles.sectionTitle}>Three things to know about me (max 3)</Text>
      <TextInput style={styles.input} value={thing1} onChangeText={setThing1} placeholder="e.g. Makes breakfast tacos from scratch" placeholderTextColor={COLORS.textMuted} onBlur={saveThreeThings} />
      <TextInput style={styles.input} value={thing2} onChangeText={setThing2} placeholder="e.g. Cries at dog commercials" placeholderTextColor={COLORS.textMuted} onBlur={saveThreeThings} />
      <TextInput style={styles.input} value={thing3} onChangeText={setThing3} placeholder="e.g. Needs 20 min to process before talking" placeholderTextColor={COLORS.textMuted} onBlur={saveThreeThings} />
      <Text style={styles.sectionTitle}>Sections</Text>
      {SECTIONS.map((s) => (
        <Pressable key={s.key} style={styles.card} onPress={() => router.push(s.route as any)}>
          <Text style={styles.cardEmoji}>{s.emoji}</Text>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  intro: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardEmoji: { fontSize: 22, marginRight: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
});
