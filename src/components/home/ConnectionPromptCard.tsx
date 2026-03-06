/**
 * Connection Prompt card — "Your Life Today": who to reach out to (priority from Lights).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useCircleStore } from '../../stores/circleStore';
import { useLightsStore, computeLights } from '../../stores/lightsStore';
import { getDailyReachOuts } from '../../services/friendshipMaintenance';
import { useDailyAnchorsStore } from '../../stores/dailyAnchorsStore';
import { COLORS, SPACING } from '../../lib/constants';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ConnectionPromptCardProps {
  onPressReachOut?: () => void;
}

export function ConnectionPromptCard({ onPressReachOut }: ConnectionPromptCardProps) {
  const router = useRouter();
  const ensureDate = useDailyAnchorsStore((s) => s.ensureDate);
  const date = useDailyAnchorsStore((s) => s.date);
  const connectionPromptActedOn = useDailyAnchorsStore((s) => s.connectionPromptActedOn);
  const setConnectionPromptActedOn = useDailyAnchorsStore((s) => s.setConnectionPromptActedOn);
  const isToday = date === todayKey();

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

  const lights = React.useMemo(
    () => computeLights(Array.isArray(members) ? members : [], persistState),
    [members, persistState]
  );
  const reachOuts = React.useMemo(() => getDailyReachOuts(lights, 5), [lights]);

  React.useEffect(() => {
    ensureDate();
  }, [ensureDate]);

  const priority = reachOuts.priority[0] ?? reachOuts.suggested[0];
  const actedOn = isToday && connectionPromptActedOn;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (priority) {
      setConnectionPromptActedOn(true);
      router.push(`/lights/log-entry?id=${encodeURIComponent(priority.id)}`);
    } else {
      onPressReachOut?.();
      router.push('/(modals)/reach-out-scaffold');
    }
  };

  if (actedOn) {
    return (
      <View style={[styles.card, styles.cardDone]}>
        <Text style={styles.emoji}>💬</Text>
        <View style={styles.textWrap}>
          <Text style={styles.title}>You reached out today</Text>
          <Text style={styles.sub}>Connection matters. Nice work.</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <Text style={styles.emoji}>👋</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {priority
            ? `Reach out to ${priority.name}`
            : 'Connect with someone'}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {priority
            ? `${priority.daysSinceContact} days since contact`
            : 'Send a quick note or plan a call'}
        </Text>
      </View>
      <Text style={styles.cta}>Go</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardPressed: { opacity: 0.9 },
  cardDone: { opacity: 0.85 },
  emoji: { fontSize: 24 },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  sub: { fontSize: 13, color: COLORS.textSecondary },
  cta: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
