/**
 * ConstellationShareCard — Share card format: abstract constellation, no names.
 * For social share / "Year in Lights" moment.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../lib/constants';

export interface ConstellationShareCardProps {
  nodeCount: number;
  format?: 'square' | 'story';
}

const SQUARE_SIZE = 320;
const STORY_HEIGHT = 400;

export function ConstellationShareCard({
  nodeCount,
  format = 'square',
}: ConstellationShareCardProps) {
  const isStory = format === 'story';
  const width = isStory ? 280 : SQUARE_SIZE;
  const height = isStory ? STORY_HEIGHT : SQUARE_SIZE;

  return (
    <View style={[styles.card, { width, height }]}>
      <View style={styles.spaceBg} />
      <View style={styles.centerGlow} />
      {/* Abstract dots (no names) — decorative */}
      {[0.25, 0.45, 0.65, 0.85].map((r, i) => (
        <View
          key={i}
          style={[
            styles.ring,
            {
              left: width / 2 - (width * 0.4 * r) / 2,
              top: height / 2 - (width * 0.4 * r) / 2,
              width: width * 0.4 * r,
              height: width * 0.4 * r,
              borderRadius: (width * 0.4 * r) / 2,
            },
          ]}
        />
      ))}
      <Text style={styles.title}>My Constellation</Text>
      <Text style={styles.subtitle}>
        {nodeCount} people I care about
      </Text>
      <Text style={styles.tagline}>A radar for human connection</Text>
      <Text style={styles.footer}>InGauge · The Human Cockpit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#08080C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06060A',
  },
  centerGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  footer: {
    fontSize: 12,
    color: COLORS.textDim,
  },
});
