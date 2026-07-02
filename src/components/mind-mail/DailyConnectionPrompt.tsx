/**
 * DailyConnectionPrompt — Hero card: "Reach out to [Name]" or "Connect with someone".
 * When parent passes priority + lifeEventLabel (from Hero engine), uses those; else falls back to getDailyReachOuts.
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
import type { Light } from '../../types/lights';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DailyConnectionPromptProps {
  /** When provided, used as the hero (overrides internal reach-out logic) */
  priority?: Light | null;
  /** When provided with priority, used as the hero title (e.g. \"Celebrate with Sarah\") */
  lifeEventLabel?: string;
  /** Story-based nudge from timeline (e.g. \"You haven't talked with Alex since your last call in January\") */
  timelineHint?: string | null;
  /** Called when user taps \"Connect with someone\" (no priority person) */
  onPressComposeNoRecipient?: () => void;
  /** When provided and priority exists, called instead of routing to compose (e.g. open sheet) */
  onPressWithRecipient?: (recipientId: string, recipientName: string) => void;
}

export function DailyConnectionPrompt({
  priority: priorityProp,
  lifeEventLabel,
  timelineHint,
  onPressComposeNoRecipient,
  onPressWithRecipient,
}: DailyConnectionPromptProps) {
  const router = useRouter();
  const ensureDate = useDailyAnchorsStore((s) => s.ensureDate);
  const date = useDailyAnchorsStore((s) => s.date);
  const connectionPromptActedOn = useDailyAnchorsStore((s) => s.connectionPromptActedOn);
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

  const lights = React.useMemo(() => computeLights(members ?? [], persistState), [members, persistState]);
  const reachOuts = React.useMemo(() => getDailyReachOuts(lights, 5), [lights]);
  const fallbackPriority = reachOuts.priority[0] ?? reachOuts.suggested[0];
  const priority = priorityProp ?? fallbackPriority;

  React.useEffect(() => {
    ensureDate();
  }, [ensureDate]);

  const actedOn = isToday && connectionPromptActedOn;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (priority) {
      if (onPressWithRecipient) {
        onPressWithRecipient(priority.id, priority.name);
      } else {
        router.push({
          pathname: '/mind-mail/compose',
          params: { recipientId: priority.id, recipientName: priority.name, from: 'connections' },
        });
      }
    } else {
      if (onPressComposeNoRecipient) {
        onPressComposeNoRecipient();
      } else {
        router.push({ pathname: '/mind-mail/compose', params: { from: 'connections' } });
      }
    }
  };

  if (actedOn) {
    return (
      <View style={[styles.card, styles.cardDone]}>
        <Text style={styles.emojiDone}>💬</Text>
        <View style={styles.textWrap}>
          <Text style={styles.titleDone}>You reached out today</Text>
          <Text style={styles.subDone}>That matters.</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.accentBar} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {priority
            ? (lifeEventLabel ?? `${priority.name} could use a moment from you today`)
            : 'Who could use a message today?'}
        </Text>
        {priority && timelineHint ? (
          <Text style={styles.sub} numberOfLines={2}>
            {timelineHint}
          </Text>
        ) : !priority ? (
          <Text style={styles.sub} numberOfLines={1}>
            Send a note or plan a call
          </Text>
        ) : null}
      </View>
      <Text style={styles.cta}>Transmit</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    paddingLeft: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    marginBottom: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardPressed: { opacity: 0.92 },
  cardDone: { opacity: 0.9 },
  emojiDone: { fontSize: 28, marginRight: 4 },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2, lineHeight: 24 },
  titleDone: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.textMuted },
  subDone: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  cta: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
});
