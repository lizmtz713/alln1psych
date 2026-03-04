/**
 * HeartMailMini — small card for Home: unread/draft counts, tap → Heart Inbox.
 * Only render when user has Circle members.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border ?? 'rgba(255,255,255,0.08)';

export interface HeartMailMiniProps {
  unreadCount: number;
  draftCount: number;
  hasCircleMembers: boolean;
}

export function HeartMailMini({ unreadCount, draftCount, hasCircleMembers }: HeartMailMiniProps) {
  const router = useRouter();

  if (!hasCircleMembers) return null;

  const messageLine =
    unreadCount > 0
      ? `You have ${unreadCount} new ${unreadCount === 1 ? 'message' : 'messages'}`
      : 'No new messages';
  const draftLine = draftCount > 0 ? `${draftCount} draft${draftCount === 1 ? '' : 's'}` : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(modals)/heart-inbox');
      }}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="heart" size={22} color={COLORS.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.messageText}>{messageLine}</Text>
        {draftLine != null && <Text style={styles.draftText}>{draftLine}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardPressed: { opacity: 0.92 },
  iconWrap: {
    marginRight: SPACING.md,
  },
  content: { flex: 1 },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  draftText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
