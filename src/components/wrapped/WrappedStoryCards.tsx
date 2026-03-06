/**
 * Life Wrapped — Instagram-style horizontal swipe (PagerView) + progress dots.
 * 14 story cards; last card has Share + Done.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import type { WrappedStoryCard } from '../../types/wrapped';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';

export interface WrappedStoryCardsProps {
  cards: WrappedStoryCard[];
  onComplete?: () => void;
  onShare?: () => void;
}

function SingleCard({ card }: { card: WrappedStoryCard }) {
  return (
    <View style={styles.card}>
      {card.emoji && <Text style={styles.emoji}>{card.emoji}</Text>}
      {card.emotionalLabel ? (
        <Text style={styles.emotionalLabel}>{card.emotionalLabel}</Text>
      ) : null}
      <Text style={styles.title}>{card.title}</Text>
      {card.subtitle && <Text style={styles.subtitle}>{card.subtitle}</Text>}
      {card.stat != null && (
        <Text style={[styles.stat, card.gaugeColor ? { color: card.gaugeColor } : undefined]}>
          {card.stat}
        </Text>
      )}
      {card.gaugeLabel && (
        <View style={[styles.gaugeBlock, card.gaugeColor ? { borderLeftColor: card.gaugeColor } : undefined]}>
          <Text style={[styles.gaugeLabel, card.gaugeColor ? { color: card.gaugeColor } : undefined]}>
            {card.gaugeLabel}
          </Text>
          {card.gaugeDescription ? (
            <Text style={styles.gaugeDescription}>{card.gaugeDescription}</Text>
          ) : null}
        </View>
      )}
      {card.insight && <Text style={styles.insight}>{card.insight}</Text>}
    </View>
  );
}

export function WrappedStoryCards({ cards, onComplete, onShare }: WrappedStoryCardsProps) {
  const [index, setIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const pagerRef = React.useRef<PagerView>(null);

  const onPageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setIndex(e.nativeEvent.position);
  }, []);

  if (!cards.length) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.title}>Your Wrapped</Text>
        <Pressable style={styles.btn} onPress={onComplete}>
          <Text style={styles.btnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  const currentCard = cards[index];
  const isShareCard = currentCard?.id === 'end';

  const goNext = useCallback(() => {
    if (index >= cards.length - 1) return;
    pagerRef.current?.setPage(index + 1);
  }, [index, cards.length]);

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <PagerView
        ref={pagerRef}
        style={[styles.pager, { width, height }]}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {cards.map((card) => (
          <View key={card.id} style={[styles.page, { width }]} collapsable={false}>
            <SingleCard card={card} />
          </View>
        ))}
      </PagerView>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {cards.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Bottom actions: Share + Done on last card, else tap hint */}
      {isShareCard ? (
        <View style={styles.shareRow}>
          {onShare && (
            <Pressable style={styles.shareBtn} onPress={onShare}>
              <Text style={styles.shareBtnText}>Share</Text>
            </Pressable>
          )}
          <Pressable style={styles.doneBtn} onPress={onComplete}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.tapArea} onPress={goNext}>
          <Text style={styles.tapHint}>Swipe or tap to continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: { alignItems: 'center', marginBottom: SPACING.xl },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  emotionalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 17, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 },
  stat: { fontSize: 48, fontWeight: '800', color: COLORS.accent },
  gaugeBlock: {
    marginTop: SPACING.md,
    paddingLeft: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    alignSelf: 'stretch',
    maxWidth: 280,
  },
  gaugeLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  gaugeDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  insight: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md, paddingHorizontal: SPACING.lg },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  tapArea: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 16 },
  tapHint: { fontSize: 13, color: COLORS.textDim },
  shareRow: { position: 'absolute', bottom: 48, flexDirection: 'row', gap: 12 },
  shareBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.accent, borderRadius: 12 },
  shareBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  doneBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  btn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.accent, borderRadius: 12 },
  btnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
