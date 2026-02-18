/**
 * Love — Love languages info: expandable cards with description and example.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../src/lib/constants';

const LOVE_LANGUAGES = [
  { name: 'Words of Affirmation', icon: '💬', description: 'You feel most loved when someone tells you they appreciate you, gives compliments, or uses words to build you up. Criticism hits you harder than most.', example: '"I noticed how hard you worked on that. I\'m proud of you."' },
  { name: 'Acts of Service', icon: '🤝', description: 'Actions speak louder than words for you. When someone helps without being asked — making dinner, fixing something, handling a task — that\'s love.', example: 'They fill your gas tank without you asking.' },
  { name: 'Receiving Gifts', icon: '🎁', description: "It's not about materialism — it's about the thought. A small gift that shows someone was thinking of you means the world.", example: 'They bring you your favorite snack because they remembered.' },
  { name: 'Quality Time', icon: '⏰', description: 'Undivided attention is everything. Phone down, eyes on you, fully present. Being in the same room isn\'t enough — you need engagement.', example: 'A walk together with no phones, just talking.' },
  { name: 'Physical Touch', icon: '🤗', description: 'A hug, a hand on the shoulder, sitting close. Physical connection makes you feel safe, loved, and connected.', example: 'They reach for your hand without thinking about it.' },
];

export default function LoveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpanded = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => (prev === name ? null : name));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Love Languages</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Tap a card to learn more about each love language.</Text>
        {LOVE_LANGUAGES.map((lang) => (
          <Pressable
            key={lang.name}
            onPress={() => toggleExpanded(lang.name)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{lang.icon} {lang.name}</Text>
            {expanded === lang.name && (
              <View style={styles.cardExpand}>
                <Text style={styles.cardDescription}>{lang.description}</Text>
                <Text style={styles.cardExample}>Example: {lang.example}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8 },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  cardExpand: { marginTop: 8 },
  cardDescription: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  cardExample: { color: COLORS.accent, fontSize: 13, marginTop: 8, fontStyle: 'italic' },
});
