/**
 * ShareInsightCard — Beautiful preview card for shareable insights
 * 
 * Displays a preview of what will be shared, styled for each insight type.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, APP_CONFIG } from '../lib/constants';
import type {
  ShareableInsight,
  GaugeStatusInsight,
  LessonInsight,
  DiscoveryInsight,
  PersonologyInsight,
  OperatingSnapshotInsight,
  GaugeReading,
} from '../services/shareInsight';
import type { GaugeKey } from '../stores/cockpitStore';
import OperatingSnapshotCard from './OperatingSnapshotCard';

// ============================================
// Props
// ============================================

interface Props {
  insight: ShareableInsight;
  compact?: boolean;
}

// ============================================
// Constants
// ============================================

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'Mental State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const GAUGE_ICONS: Record<GaugeKey, string> = {
  body: 'body-outline',
  state: 'cloudy-outline',
  emotion: 'heart-outline',
  connection: 'people-outline',
  direction: 'compass-outline',
  alignment: 'star-outline',
};

const getGaugeColor = (value: number): string => {
  if (value >= 70) return COLORS.green;
  if (value >= 50) return COLORS.yellow;
  if (value >= 30) return COLORS.orange;
  return COLORS.red;
};

const getTrendIcon = (trend: string | null): string => {
  if (trend === 'improving') return 'trending-up';
  if (trend === 'declining') return 'trending-down';
  return 'remove';
};

// ============================================
// Component
// ============================================

export default function ShareInsightCard({ insight, compact = false }: Props) {
  // Render based on insight type
  switch (insight.type) {
    case 'gauge-status':
      return <GaugeStatusCard insight={insight} compact={compact} />;
    case 'lesson':
      return <LessonCard insight={insight} compact={compact} />;
    case 'discovery':
      return <DiscoveryCard insight={insight} compact={compact} />;
    case 'personology':
      return <PersonologyCard insight={insight} compact={compact} />;
    case 'operating-snapshot':
      return <OperatingSnapshotCard insight={insight} compact={compact} />;
    default:
      return null;
  }
}

// ============================================
// Gauge Status Card
// ============================================

function GaugeStatusCard({ insight, compact }: { insight: GaugeStatusInsight; compact: boolean }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <LinearGradient
        colors={[COLORS.accentBg, 'transparent']}
        style={styles.cardGradient}
      />
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.senderName}>{insight.senderName}</Text>
        <Text style={styles.shareLabel}>shared how they're feeling</Text>
      </View>
      
      {/* Mode Badge */}
      <View style={[
        styles.modeBadge,
        insight.systemMode === "stabilization' && styles.modeBadgeStabilization
      ]}>
        <Ionicons
          name={insight.systemMode === 'capacity' ? 'checkmark-circle' : 'alert-circle'}
          size={14}
          color={insight.systemMode === 'capacity' ? COLORS.green : COLORS.orange}
        />
        <Text style={[
          styles.modeBadgeText,
          insight.systemMode === 'stabilization' && styles.modeBadgeTextStabilization
        ]}>
          {insight.systemMode === 'capacity' ? 'Doing okay' : 'Needs some TLC'}
        </Text>
      </View>
      
      {/* Context */}
      {insight.context && (
        <Text style={styles.contextText}>"{insight.context}"</Text>
      )}
      
      {/* Gauge Readings */}
      {!compact && insight.gauges.length > 0 && (
        <View style={styles.gaugeList}>
          {insight.gauges.map((gauge) => (
            <GaugeReadingRow key={gauge.key} gauge={gauge} />
          ))}
        </View>
      )}
      
      {/* Personal Note */}
      {insight.personalNote && (
        <View style={styles.personalNote}>
          <Text style={styles.personalNoteText}>"{insight.personalNote}"</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.appBranding}>via {APP_CONFIG.name}</Text>
      </View>
    </View>
  );
}

function GaugeReadingRow({ gauge }: { gauge: GaugeReading }) {
  const color = getGaugeColor(gauge.value);
  
  return (
    <View style={styles.gaugeRow}>
      <View style={styles.gaugeInfo}>
        <Ionicons
          name={GAUGE_ICONS[gauge.key] as any}
          size={16}
          color={COLORS.textMuted}
        />
        <Text style={styles.gaugeLabel}>{GAUGE_LABELS[gauge.key]}</Text>
      </View>
      <View style={styles.gaugeValueContainer}>
        <View style={[styles.gaugeBar, { backgroundColor: COLORS.surface }]}>
          <View style={[styles.gaugeFill, { width: `${gauge.value}%`, backgroundColor: color }]} />
        </View>
        {gauge.trend && (
          <Ionicons
            name={getTrendIcon(gauge.trend) as any}
            size={14}
            color={gauge.trend === 'improving' ? COLORS.green : gauge.trend === 'declining' ? COLORS.red : COLORS.textMuted}
          />
        )}
      </View>
    </View>
  );
}

// ============================================
// Lesson Card
// ============================================

function LessonCard({ insight, compact }: { insight: LessonInsight; compact: boolean }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <LinearGradient
        colors={['rgba(124, 77, 255, 0.15)', 'transparent']}
        style={styles.cardGradient}
      />
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.senderName}>{insight.senderName}</Text>
        <Text style={styles.shareLabel}>shared a lesson</Text>
      </View>
      
      {/* Lesson Info */}
      <View style={styles.lessonContainer}>
        <Text style={styles.lessonEmoji}>{insight.lessonEmoji}</Text>
        <Text style={styles.lessonTitle}>{insight.lessonTitle}</Text>
      </View>
      
      {/* Summary */}
      {!compact && insight.summary && (
        <Text style={styles.lessonSummary} numberOfLines={3}>
          {insight.summary}
        </Text>
      )}
      
      {/* Why Sharing */}
      <View style={styles.whySharingBox}>
        <Text style={styles.whySharingLabel}>Why they shared this:</Text>
        <Text style={styles.whySharingText}>"{insight.whySharing}"</Text>
      </View>
      
      {/* Personal Note */}
      {insight.personalNote && (
        <View style={styles.personalNote}>
          <Text style={styles.personalNoteText}>"{insight.personalNote}"</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.appBranding}>via {APP_CONFIG.name} Human Manual</Text>
      </View>
    </View>
  );
}

// ============================================
// Discovery Card
// ============================================

function DiscoveryCard({ insight, compact }: { insight: DiscoveryInsight; compact: boolean }) {
  const categoryColors: Record<string, [string, string]> = {
    ancient: ['rgba(255, 183, 77, 0.15)', 'transparent'],
    science: ['rgba(96, 165, 250, 0.15)', 'transparent'],
    funfact: ['rgba(74, 222, 128, 0.15)', 'transparent'],
    future: ['rgba(168, 85, 247, 0.15)', 'transparent'],
  };
  
  const categoryLabels: Record<string, string> = {
    ancient: 'Ancient Wisdom',
    science: 'Science',
    funfact: 'Fun Fact',
    future: 'Future',
  };
  
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <LinearGradient
        colors={categoryColors[insight.category] || categoryColors.science}
        style={styles.cardGradient}
      />
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.senderName}>{insight.senderName}</Text>
        <Text style={styles.shareLabel}>shared a discovery</Text>
      </View>
      
      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{categoryLabels[insight.category] || insight.category}</Text>
      </View>
      
      {/* Discovery Content */}
      <View style={styles.discoveryContainer}>
        <Text style={styles.discoveryEmoji}>{insight.emoji}</Text>
        <Text style={styles.discoveryTitle}>{insight.title}</Text>
      </View>
      
      {!compact && (
        <Text style={styles.discoveryContent} numberOfLines={4}>
          {insight.content}
        </Text>
      )}
      
      {/* Why Sharing */}
      {insight.whySharing && (
        <View style={styles.whySharingBox}>
          <Text style={styles.whySharingLabel}>Why they shared this:</Text>
          <Text style={styles.whySharingText}>"{insight.whySharing}"</Text>
        </View>
      )}
      
      {/* Personal Note */}
      {insight.personalNote && (
        <View style={styles.personalNote}>
          <Text style={styles.personalNoteText}>"{insight.personalNote}"</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.appBranding}>via {APP_CONFIG.name} 101 Discoveries</Text>
      </View>
    </View>
  );
}

// ============================================
// Personology Card
// ============================================

function PersonologyCard({ insight, compact }: { insight: PersonologyInsight; compact: boolean }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <LinearGradient
        colors={['rgba(236, 72, 153, 0.15)', 'transparent']}
        style={styles.cardGradient}
      />
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.senderName}>{insight.senderName}</Text>
        <Text style={styles.shareLabel}>shared their personality profile</Text>
      </View>
      
      {/* Personality Type */}
      <View style={styles.personalityContainer}>
        <Text style={styles.personalityEmoji}>🧬</Text>
        <Text style={styles.personalityName}>{insight.personality.name}</Text>
        <Text style={styles.personalityElement}>{insight.personality.element}</Text>
      </View>
      
      {!compact && (
        <>
          {/* Highlights */}
          <View style={styles.highlightsSection}>
            {/* Communication Style */}
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <Ionicons name="chatbubble-outline" size={16} color={COLORS.accent} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightLabel}>Communication Style</Text>
                <Text style={styles.highlightText}>{insight.highlights.communicationStyle}</Text>
              </View>
            </View>
            
            {/* Needs in Relationships */}
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <Ionicons name="heart-outline" size={16} color={COLORS.loveAccent} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightLabel}>Needs in Relationships</Text>
                <Text style={styles.highlightText}>{insight.highlights.needsInRelationships}</Text>
              </View>
            </View>
            
            {/* Stress Response */}
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <Ionicons name="flash-outline" size={16} color={COLORS.orange} />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightLabel}>Under Stress</Text>
                <Text style={styles.highlightText}>{insight.highlights.stressResponse}</Text>
              </View>
            </View>
          </View>
          
          {/* Strengths */}
          {insight.highlights.strengths.length > 0 && (
            <View style={styles.strengthsSection}>
              <Text style={styles.strengthsLabel}>Strengths</Text>
              <View style={styles.strengthsRow}>
                {insight.highlights.strengths.slice(0, 3).map((strength, i) => (
                  <View key={i} style={styles.strengthChip}>
                    <Text style={styles.strengthText}>{strength}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
      
      {/* Personal Note */}
      {insight.personalNote && (
        <View style={styles.personalNote}>
          <Text style={styles.personalNoteText}>"{insight.personalNote}"</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.appBranding}>via {APP_CONFIG.name} Personology</Text>
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardCompact: {
    padding: SPACING.lg,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  
  // Header
  cardHeader: {
    marginBottom: SPACING.md,
  },
  senderName: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
  },
  shareLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  // Mode Badge
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  modeBadgeStabilization: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  modeBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.green,
  },
  modeBadgeTextStabilization: {
    color: COLORS.orange,
  },
  
  // Context
  contextText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    lineHeight: 26,
  },
  
  // Gauge List
  gaugeList: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  gaugeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  gaugeLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  gaugeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  gaugeBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Category Badge
  categoryBadge: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  categoryText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Lesson
  lessonContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  lessonEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  lessonTitle: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    textAlign: 'center',
  },
  lessonSummary: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  
  // Discovery
  discoveryContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  discoveryEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  discoveryTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    textAlign: 'center',
  },
  discoveryContent: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  
  // Why Sharing
  whySharingBox: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  whySharingLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  whySharingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  
  // Personal Note
  personalNote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    paddingLeft: SPACING.md,
    marginTop: SPACING.md,
  },
  personalNoteText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  
  // Personality
  personalityContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  personalityEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  personalityName: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    textAlign: 'center',
  },
  personalityElement: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.loveAccent,
    marginTop: SPACING.xs,
  },
  
  // Highlights
  highlightsSection: {
    marginBottom: SPACING.lg,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  highlightText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Strengths
  strengthsSection: {
    marginBottom: SPACING.lg,
  },
  strengthsLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  strengthsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  strengthChip: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  strengthText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.green,
  },
  
  // Footer
  cardFooter: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  appBranding: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
  },
});
