/**
 * Contextual Insights — Single card with Learn More / Try Tool.
 * Styles: fact, quote, question. Marks as shown for 7-day no-repeat.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../lib/constants';
import type { InsightCard as InsightCardType } from '../../types/insights';
import { markInsightShown } from '../../services/insightService';

interface InsightCardProps {
  card: InsightCardType;
  /** Compact layout for gauge detail page */
  compact?: boolean;
}

export function InsightCard({ card, compact }: InsightCardProps) {
  const router = useRouter();

  useEffect(() => {
    markInsightShown(card.id);
  }, [card.id]);

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (card.lessonId) router.push(`/lesson/${card.lessonId}`);
  };

  const handleTryTool = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (card.toolRoute) router.push(card.toolRoute as any);
  };

  const isQuote = card.style === 'quote';
  const isQuestion = card.style === 'question';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {isQuote && <Text style={styles.quoteMark}>"</Text>}
      <Text style={[styles.title, compact && styles.titleCompact]}>{card.title}</Text>
      <Text style={[styles.body, compact && styles.bodyCompact]}>{card.body}</Text>
      {(card.lessonId || card.toolRoute) && (
        <View style={styles.actions}>
          {card.lessonId && (
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={handleLearnMore}
            >
              <Text style={styles.btnText}>Learn more</Text>
            </Pressable>
          )}
          {card.toolRoute && (
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnAccent, pressed && styles.btnPressed]}
              onPress={handleTryTool}
            >
              <Text style={[styles.btnText, styles.btnTextAccent]}>
                Try {card.toolLabel ?? 'tool'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
      {card.source && <Text style={styles.source}>{card.source}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardCompact: {
    padding: SPACING.sm,
  },
  quoteMark: {
    fontSize: 28,
    color: COLORS.accent,
    opacity: 0.6,
    marginBottom: -8,
  },
  title: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  titleCompact: {
    fontSize: 15,
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  bodyCompact: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  btn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnAccent: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    ...TYPOGRAPHY.secondary,
    color: COLORS.textSecondary,
  },
  btnTextAccent: {
    color: COLORS.accent,
  },
  source: {
    ...TYPOGRAPHY.timestamp,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
