/**
 * PatternsBuildingState
 * 
 * Friendly empty state shown when user doesn't have enough
 * check-ins for pattern detection. Encouraging, not disappointing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../lib/constants';

const BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const TEXT_DIM = COLORS.textMuted;
const ACCENT = COLORS.accent;

interface PatternsBuildingStateProps {
  checkInCount: number;
  neededForPatterns: number;
  progressPercent: number;
  message: string | null;
}

export function PatternsBuildingState({
  checkInCount,
  neededForPatterns,
  progressPercent,
  message,
}: PatternsBuildingStateProps) {
  // Show different content based on progress
  const isJustStarting = checkInCount < 3;
  const isHalfway = checkInCount >= 3 && checkInCount < 5;
  const isAlmostThere = checkInCount >= 5;

  return (
    <View style={styles.container}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustrationEmoji}>
          {isJustStarting ? '🌱' : isHalfway ? '🌿' : '🌳'}
        </Text>
        <View style={styles.sparkles}>
          {[...Array(checkInCount)].map((_, i) => (
            <Text 
              key={i} 
              style={[
                styles.sparkle,
                { opacity: 0.4 + (i * 0.1) }
              ]}
            >
              ✦
            </Text>
          ))}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {isJustStarting 
          ? 'Your patterns will grow here'
          : isHalfway 
            ? 'Patterns are forming...'
            : 'Almost ready!'}
      </Text>

      {/* Message */}
      <Text style={styles.message}>
        {message || 'Keep checking in to reveal your patterns'}
      </Text>

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.progressDots}>
          {[...Array(7)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressDot, 
                i < checkInCount && styles.progressDotFilled
              ]} 
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>
          {checkInCount}/7 check-ins
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${progressPercent}%` }
          ]} 
        />
      </View>

      {/* Encouraging copy */}
      <View style={styles.encouragementCard}>
        <Text style={styles.encouragementEmoji}>💡</Text>
        <Text style={styles.encouragementText}>
          {isJustStarting
            ? 'Each check-in teaches your system model something new. Patterns need data to emerge.'
            : isHalfway
              ? 'You\'re building a picture of how your gauges move together. The more data, the clearer the patterns.'
              : 'Just a few more check-ins and you\'ll start seeing connections — like how your Body affects your State, or when your Connection tends to dip."}
        </Text>
      </View>

      {/* Pattern preview skeleton */}
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>What you'll see:</Text>
        <View style={styles.previewCards}>
          <View style={styles.previewCard}>
            <Text style={styles.previewEmoji}>🔄</Text>
            <View style={styles.previewSkeleton}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, styles.skeletonShort]} />
            </View>
          </View>
          <View style={styles.previewCard}>
            <Text style={styles.previewEmoji}>🔗</Text>
            <View style={styles.previewSkeleton}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, styles.skeletonShort]} />
            </View>
          </View>
          <View style={styles.previewCard}>
            <Text style={styles.previewEmoji}>📈</Text>
            <View style={styles.previewSkeleton}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, styles.skeletonShort]} />
            </View>
          </View>
        </View>
        <Text style={styles.previewCaption}>
          Feedback loops • Correlations • Trends
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)',
    alignItems: 'center',
  },

  // Illustration
  illustrationContainer: {
    position: 'relative',
    marginBottom: 16,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 56,
  },
  sparkles: {
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    right: -20,
    gap: 4,
  },
  sparkle: {
    fontSize: 12,
    color: ACCENT,
  },

  // Title & message
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Progress dots
  progressSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotFilled: {
    backgroundColor: ACCENT,
  },
  progressLabel: {
    fontSize: 12,
    color: TEXT_DIM,
  },

  // Progress bar
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },

  // Encouragement
  encouragementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  encouragementEmoji: {
    fontSize: 20,
  },
  encouragementText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 19,
  },

  // Preview section
  previewSection: {
    width: '100%',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 12,
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewCards: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  previewCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 20,
    marginBottom: 8,
    opacity: 0.5,
  },
  previewSkeleton: {
    width: '100%',
    gap: 6,
  },
  skeletonLine: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    width: '100%',
  },
  skeletonShort: {
    width: '60%',
  },
  previewCaption: {
    fontSize: 11,
    color: TEXT_DIM,
    textAlign: 'center',
  },
});
