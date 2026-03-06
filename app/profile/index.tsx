/**
 * Profile hub — Your Human Control Panel.
 * About You, YOUR GAUGES, Goals & Intentions, Preferences.
 */

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { COLORS } from '../../src/lib/constants';

const ABOUT_YOU = [
  { route: '/profile/human-profile', emoji: '🪞', title: 'Human Profile', subtitle: 'Identity, purpose, life blueprint from the 12 questions' },
  { route: '/your-story', emoji: '📖', title: 'Your Story', subtitle: 'Origins, culture, upbringing' },
  { route: '/profile/identity', emoji: '🪪', title: 'Identity', subtitle: 'Body, disability, gender' },
  { route: '/profile/how-you-connect', emoji: '🤝', title: 'How You Connect', subtitle: 'Love language, communication' },
  { route: '/profile/what-gives-life', emoji: '✨', title: 'What Gives You Life', subtitle: 'Interests, meaning, life stage' },
  { route: '/profile/sensitive', emoji: '🛡️', title: 'Sensitive Topics', subtitle: 'Careful areas and triggers' },
  { route: '/profile/in-your-own-words', emoji: '💬', title: 'In Your Own Words', subtitle: 'What makes you different' },
];

const YOUR_GAUGES = [
  { route: '/profile/gauges/body', emoji: '🏃', title: 'Body', subtitle: 'What Body means for me' },
  { route: '/profile/gauges/state', emoji: '🧘', title: 'State', subtitle: 'My nervous system baseline' },
  { route: '/profile/gauges/emotion', emoji: '❤️', title: 'Emotion', subtitle: 'How I experience feelings' },
  { route: '/profile/gauges/connection', emoji: '👥', title: 'Connection', subtitle: 'My relationships and needs' },
  { route: '/profile/gauges/direction', emoji: '🧭', title: 'Direction', subtitle: 'My purpose and goals' },
  { route: '/profile/gauges/alignment', emoji: '⚖️', title: 'Alignment', subtitle: 'My values and integrity' },
];

const GOALS_SECTION = [
  { route: '/profile/goals', emoji: '📋', title: 'Active Goals', subtitle: 'What you are working toward' },
  { route: '/profile/goals', emoji: '🎯', title: 'Goal Setter', subtitle: 'AI-assisted' },
  { route: '/profile/goals', emoji: '🔄', title: 'Review & Reflect', subtitle: 'Look back and adjust' },
];

const PREFERENCES_SECTION = [
  { route: '/profile/preferences', emoji: '🔔', title: 'Notifications & Reminders', subtitle: '' },
  { route: '/profile/preferences', emoji: '✓', title: 'Check-in Settings', subtitle: '' },
  { route: '/profile/preferences', emoji: '🤖', title: 'AI Preferences', subtitle: '' },
];

function SectionBlock({
  title,
  emoji,
  items,
  onOpen,
}: {
  title: string;
  emoji: string;
  items: Array<{ route: string; emoji: string; title: string; subtitle: string }>;
  onOpen: (route: string) => void;
}) {
  return (
    <>
      <Text style={styles.sectionHeader}>{emoji} {title}</Text>
      {items.map((s) => (
        <Pressable key={s.route + s.title} style={styles.card} onPress={() => onOpen(s.route)}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardEmoji}>{s.emoji}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            {s.subtitle ? <Text style={styles.cardSubtitle}>{s.subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>
      ))}
    </>
  );
}

export default function ProfileHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pct = useUserStore((s) => s.getProfileCompleteness());

  const open = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>Your Human Control Panel</Text>
        <Text style={styles.heroSub}>
          Self settings, not app settings. Define what each gauge means for you.
        </Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{pct}% complete</Text>
        </View>

        <SectionBlock title="About You" emoji="👤" items={ABOUT_YOU} onOpen={open} />
        <SectionBlock title="Your Gauges" emoji="🎯" items={YOUR_GAUGES} onOpen={open} />
        <SectionBlock title="Goals & Intentions" emoji="📋" items={GOALS_SECTION} onOpen={open} />
        <SectionBlock title="Preferences" emoji="⚙️" items={PREFERENCES_SECTION} onOpen={open} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 22 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  progressTrack: { flex: 1, height: 8, backgroundColor: COLORS.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  progressLabel: { fontSize: 13, color: COLORS.textMuted, minWidth: 72 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardEmoji: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  cardSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
