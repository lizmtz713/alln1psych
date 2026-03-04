/**
 * Emergency Mode — Simplified UI when you're not okay. Crisis lines, CoPilot, Breathe, Reach out.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useEmergencyStore } from '../../src/stores/emergencyStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const CARDS = [
  {
    id: 'crisis' as const,
    emoji: '🆘',
    title: 'Crisis lines',
    subtitle: '988, Crisis Text Line, Trevor, Trans Lifeline',
    route: '/emergency/crisis',
  },
  {
    id: 'copilot' as const,
    emoji: '💬',
    title: 'Talk to CoPilot',
    subtitle: "I'm here. No judgment.",
    route: '/(tabs)/talk',
    params: { crisisMode: 'true' },
  },
  {
    id: 'breathe' as const,
    emoji: '🌬️',
    title: 'Breathe with me',
    subtitle: '2-minute calming exercise',
    route: '/emergency/breathe',
  },
  {
    id: 'reach_out' as const,
    emoji: '👤',
    title: 'Reach out',
    subtitle: 'Contact someone from your Lights',
    route: '/emergency/reach-out',
  },
];

export default function EmergencyIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recordAction = useEmergencyStore((s) => s.recordAction);
  const deactivate = useEmergencyStore((s) => s.deactivate);

  const handleCardPress = (card: (typeof CARDS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordAction(card.id === 'copilot' ? 'copilot' : card.id === 'crisis' ? 'crisis_lines' : card.id === 'breathe' ? 'breathe' : 'reach_out');
    if (card.params) {
      router.push({ pathname: card.route as any, params: card.params });
    } else {
      router.push(card.route as any);
    }
  };

  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    deactivate();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hero}>You're not alone.</Text>

        {CARDS.map((card) => (
          <Pressable
            key={card.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleCardPress(card)}
          >
            <Text style={styles.cardEmoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSub}>{card.subtitle}</Text>
          </Pressable>
        ))}

        <View style={styles.divider} />
        <Pressable style={({ pressed }) => [styles.exitBtn, pressed && styles.exitBtnPressed]} onPress={handleExit}>
          <Text style={styles.exitBtnText}>Exit Emergency Mode</Text>
        </Pressable>
        <Text style={styles.exitHint}>You can leave anytime. No judgment.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingTop: SPACING.xxl },
  hero: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  cardSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: SPACING.xl },
  exitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: BORDER,
  },
  exitBtnPressed: { opacity: 0.9 },
  exitBtnText: { fontSize: 16, fontWeight: '600', color: TEXT_MUTED },
  exitHint: { marginTop: 12, fontSize: 13, color: TEXT_MUTED, textAlign: 'center' },
});
