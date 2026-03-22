/**
 * OperatingSnapshotCard — A beautiful, shareable "manual" for loved ones
 * 
 * "Here"s how I work. Here's how to understand me better.\"
 * 
 * Designed to build relational literacy — helping people understand each other.
 */
import React from "react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, APP_CONFIG } from '../lib/constants';
import type { OperatingSnapshotInsight } from '../services/shareInsight';

// ============================================
// Props
// ============================================

interface Props {
  insight: OperatingSnapshotInsight;
  compact?: boolean;
}

// ============================================
// Component
// ============================================

export default function OperatingSnapshotCard({ insight, compact = false }: Props) {
  const isStabilization = insight.systemMode === 'stabilization';
  
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={isStabilization 
          ? ['rgba(251, 146, 60, 0.12)', 'transparent']
          : ['rgba(74, 222, 128, 0.12)', 'transparent']
        }
        style={styles.cardGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📖</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{insight.senderName}'s Operating Snapshot</Text>
          <Text style={styles.subtitle}>A guide to understanding me better</Text>
        </View>
      </View>
      
      {/* Last Updated */}
      <View style={styles.updatedBadge}>
        <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
        <Text style={styles.updatedText}>Updated {insight.lastUpdated}</Text>
      </View>
      
      {/* Current State Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[
            styles.sectionIcon,
            isStabilization && styles.sectionIconStabilization
          ]}>
            <Ionicons 
              name={isStabilization ? 'shield-outline' : 'sunny-outline"} 
              size={18} 
              color={isStabilization ? COLORS.orange : COLORS.green} 
            />
          </View>
          <Text style={styles.sectionTitle}>Current State</Text>
        </View>
        
        <Text style={styles.stateSummary}>{insight.currentState.summary}</Text>
        
        {!compact && insight.currentState.primaryNeeds.length > 0 && (
          <View style={styles.needsList}>
            <Text style={styles.needsLabel}>What I need most right now:</Text>
            {insight.currentState.primaryNeeds.map((need, index) => (
              <View key={index} style={styles.needItem}>
                <View style={styles.needBullet} />
                <Text style={styles.needText}>{need}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* My Patterns Section */}
      {!compact && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name=\"analytics-outline\" size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.sectionTitle}>My Patterns</Text>
          </View>
          
          {/* Sensitivities */}
          {insight.patterns.sensitivities.length > 0 && (
            <View style={styles.patternGroup}>
              <Text style={styles.patternLabel}>When I'm running low...</Text>
              {insight.patterns.sensitivities.map((sensitivity, index) => (
                <Text key={index} style={styles.patternItem}>• {sensitivity}</Text>
              ))}
            </View>
          )}
          
          {/* Warning Signs */}
          {insight.patterns.warningSignsFor.length > 0 && (
            <View style={styles.patternGroup}>
              <Text style={styles.patternLabel}>If you notice warning signs...</Text>
              {insight.patterns.warningSignsFor.map((sign, index) => (
                <Text key={index} style={styles.patternItem}>• {sign}</Text>
              ))}
            </View>
          )}
          
          {/* Recent Drift Patterns */}
          {insight.recentPatterns.length > 0 && (
            <View style={styles.patternGroup}>
              <Text style={styles.patternLabel}>Recent patterns I"ve noticed:</Text>
              {insight.recentPatterns.map((pattern, index) => (
                <Text key={index} style={styles.patternItem}>• {pattern}</Text>
              ))}
            </View>
          )}
        </View>
      )}
      
      {/* How to Support Me Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, styles.sectionIconLove]}>
            <Ionicons name="heart-outline" size={18} color={COLORS.loveAccent} />
          </View>
          <Text style={styles.sectionTitle}>How to Support Me</Text>
        </View>
        
        {/* What Helps */}
        {insight.patterns.whatHelps.length > 0 && (
          <View style={styles.supportGroup}>
            <Text style={styles.supportLabel}>What helps right now:</Text>
            {insight.patterns.whatHelps.map((help, index) => (
              <View key={index} style={styles.supportItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                <Text style={styles.supportText}>{help}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Do This / Avoid This */}
        {!compact && (
          <>
            {insight.supportGuide.doThis.length > 0 && (
              <View style={styles.supportGroup}>
                <Text style={styles.supportLabel}>✓ Do this:</Text>
                {insight.supportGuide.doThis.map((item, index) => (
                  <Text key={index} style={styles.supportItemText}>• {item}</Text>
                ))}
              </View>
            )}
            
            {insight.supportGuide.avoidThis.length > 0 && (
              <View style={styles.supportGroup}>
                <Text style={styles.supportLabel}>✗ Please avoid:</Text>
                {insight.supportGuide.avoidThis.map((item, index) => (
                  <Text key={index} style={[styles.supportItemText, styles.avoidText]}>• {item}</Text>
                ))}
              </View>
            )}
          </>
        )}
        
        {/* Check-In Guidance */}
        <View style={styles.checkInBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.accent} />
          <Text style={styles.checkInText}>{insight.supportGuide.checkIn}</Text>
        </View>
      </View>
      
      {/* Personal Note */}
      {insight.personalNote && (
        <View style={styles.personalNote}>
          <Text style={styles.personalNoteText}>"{insight.personalNote}"</Text>
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Shared with love via {APP_CONFIG.name}</Text>
        <Text style={styles.footerTagline}>Building relational literacy, together</Text>
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
    height: 180,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  // Updated Badge
  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  updatedText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  
  // Sections
  section: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sectionIconStabilization: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  sectionIconLove: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  
  // Current State
  stateSummary: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: SPACING.md,
  },
  needsList: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  needsLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  needItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  needBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  needText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    flex: 1,
  },
  
  // Patterns
  patternGroup: {
    marginBottom: SPACING.md,
  },
  patternLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  patternItem: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text,
    lineHeight: 22,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  
  // Support
  supportGroup: {
    marginBottom: SPACING.md,
  },
  supportLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  supportText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  supportItemText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text,
    lineHeight: 22,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  avoidText: {
    color: COLORS.textSecondary,
  },
  
  // Check-In Box
  checkInBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  checkInText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  // Personal Note
  personalNote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.loveAccent,
    paddingLeft: SPACING.md,
    marginVertical: SPACING.md,
  },
  personalNoteText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  
  // Footer
  footer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
  },
  footerTagline: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
