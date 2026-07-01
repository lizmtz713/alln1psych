/**
 * Purpose Through Pattern — Direction Insights Display
 * 
 * Philosophy:
 * - Instead of asking "What's your purpose?", show data-driven insights
 * - "Purpose is often reverse-engineered from patterns"
 * - Discovery-oriented: "Your data suggests..." not prescriptive
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import { type DirectionCorrelation, type DirectionInsights } from '../services/patternEngine';

interface Props {
  insights: DirectionInsights;
  compact?: boolean; // For embedding in other views
  onExploreMore?: () => void;
}

const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const TEXT_DIM = COLORS.textMuted;
const ACCENT = COLORS.accent;

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  sleep: { icon: 'moon', color: '#A78BFA', label: 'Rest' },
  body: { icon: 'body', color: '#4ADE80', label: 'Physical' },
  connection: { icon: 'people', color: '#60A5FA', label: 'Social' },
  time: { icon: 'time', color: '#FACC15', label: 'Timing' },
  pattern: { icon: 'git-branch', color: '#FB923C', label: 'Pattern' },
};

const STRENGTH_COLORS = {
  strong: '#4ADE80',
  moderate: '#60A5FA',
  emerging: '#A78BFA',
};

function CorrelationCard({ correlation }: { correlation: DirectionCorrelation }) {
  const config = CATEGORY_CONFIG[correlation.category] || CATEGORY_CONFIG.pattern;
  const strengthColor = STRENGTH_COLORS[correlation.strength];

  return (
    <View style={styles.correlationCard}>
      <View style={styles.correlationHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={14} color={config.color} />
          <Text style={[styles.categoryLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <View style={[styles.strengthDot, { backgroundColor: strengthColor }]} />
      </View>
      <Text style={styles.correlationNarrative}>{correlation.narrative}</Text>
      <Text style={styles.correlationFrequency}>{correlation.frequency}</Text>
    </View>
  );
}

function InsufficientDataState({ message, dataPoints }: { message: string; dataPoints: number }) {
  const progress = Math.min(dataPoints / 14, 1);
  
  return (
    <View style={styles.insufficientCard}>
      <Text style={styles.insufficientEmoji}>🧭</Text>
      <Text style={styles.insufficientTitle}>Direction patterns emerging...</Text>
      <Text style={styles.insufficientText}>{message}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{dataPoints}/14 check-ins</Text>
      </View>
      
      <Text style={styles.hintText}>
        Keep rating your Direction gauge — patterns will reveal what lifts your sense of purpose.
      </Text>
    </View>
  );
}

export default function PurposeThroughPattern({ insights, compact, onExploreMore }: Props) {
  const router = useRouter();

  const handleExploreMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onExploreMore) {
      onExploreMore();
    } else {
      router.push('/(modals)/patterns');
    }
  };

  // Not enough data yet
  if (!insights.hasEnoughData) {
    if (compact) {
      return null; // Don't show in compact mode if no data
    }
    return (
      <InsufficientDataState 
        message={insights.insufficientDataMessage || "More check-ins needed."} 
        dataPoints={insights.dataPoints}
      />
    );
  }

  // No correlations found (unusual but possible)
  if (insights.correlations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          No strong Direction patterns detected yet. Your sense of purpose seems to vary independently — which can mean you're adaptable.
        </Text>
      </View>
    );
  }

  // Compact mode: Show summary
  if (compact) {
    const topCorrelation = insights.correlations[0];
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleExploreMore}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactEmoji}>🧭</Text>
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle}>Purpose Through Pattern</Text>
            <Text style={styles.compactSubtitle} numberOfLines={1}>
              {topCorrelation.narrative}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={TEXT_DIM} />
        </View>
      </TouchableOpacity>
    );
  }

  // Full display
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🧭</Text>
        <View>
          <Text style={styles.headerTitle}>What Lifts Your Direction?</Text>
          <Text style={styles.headerSubtitle}>
            In your recent data, Direction rises when:
          </Text>
        </View>
      </View>

      {/* Correlations */}
      <View style={styles.correlationsList}>
        {insights.correlations.map((correlation) => (
          <CorrelationCard key={correlation.id} correlation={correlation} />
        ))}
      </View>

      {/* Philosophy note */}
      <View style={styles.philosophyBox}>
        <Text style={styles.philosophyText}>
          💡 Purpose is often reverse-engineered from patterns. Instead of searching for meaning, notice what already gives you momentum.
        </Text>
      </View>

      {/* Explore more */}
      {onExploreMore && (
        <TouchableOpacity style={styles.exploreButton} onPress={handleExploreMore}>
          <Text style={styles.exploreButtonText}>Explore all patterns</Text>
          <Ionicons name="arrow-forward" size={16} color={ACCENT} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontStyle: 'italic',
  },

  // Correlations
  correlationsList: {
    gap: 10,
  },
  correlationCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  correlationNarrative: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 20,
    marginBottom: 4,
  },
  correlationFrequency: {
    fontSize: 12,
    color: TEXT_DIM,
    fontWeight: '500',
  },

  // Philosophy box
  philosophyBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  philosophyText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // Explore button
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  exploreButtonText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '500',
  },

  // Insufficient data
  insufficientCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  insufficientEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  insufficientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 6,
    textAlign: 'center',
  },
  insufficientText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 14,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: TEXT_DIM,
  },
  hintText: {
    fontSize: 13,
    color: TEXT_DIM,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // No data
  noDataText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    padding: 8,
  },

  // Compact mode
  compactCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactEmoji: {
    fontSize: 24,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});
