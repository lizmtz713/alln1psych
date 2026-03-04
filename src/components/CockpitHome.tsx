/**
 * CockpitHome — The Human Cockpit (Oura-inspired)
 * 
 * Design inspired by Oura Ring app:
 * - Swipeable gauge row at top
 * - Big featured score with arc visualization
 * - Scrollable cards below
 * - "PAY ATTENTION" alerts
 * - Clean, premium dark aesthetic
 * 
 * This is the main home screen for InGauge.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GaugeArc, GaugeRow } from './gauges/GaugeArc';
import { AuroraBackground, GlassCard } from './ui/AuroraBackground';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, ANIMATION } from '../lib/constants';
import { getGaugeColor } from '../utils/gaugeHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface GaugeData {
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

interface CockpitHomeProps {
  gauges: GaugeData;
  userName?: string;
  cycleDay?: number;
  cyclePhase?: string;
  onGaugePress?: (gauge: GaugeName) => void;
  onCheckIn?: () => void;
}

// Gauge metadata
const GAUGE_INFO: Record<GaugeName, { label: string; description: string; emoji: string }> = {
  body: { label: 'Body', description: 'Your physical state', emoji: '🫀' },
  state: { label: 'State', description: 'Your nervous system regulation', emoji: '🌊' },
  emotion: { label: 'Emotion', description: 'What you\'re feeling', emoji: '💫' },
  connection: { label: 'Connection', description: 'Your relational energy', emoji: '🤝' },
  direction: { label: 'Direction', description: 'Your sense of purpose', emoji: '🧭' },
  alignment: { label: 'Alignment', description: 'Living your values', emoji: '⭐' },
};

export function CockpitHome({
  gauges,
  userName,
  cycleDay,
  cyclePhase,
  onGaugePress,
  onCheckIn,
}: CockpitHomeProps) {
  const [selectedGauge, setSelectedGauge] = useState<GaugeName>('state');
  const scrollRef = useRef<ScrollView>(null);
  
  const selectedValue = gauges[selectedGauge];
  const selectedInfo = GAUGE_INFO[selectedGauge];
  
  // Calculate overall system score (average of all gauges)
  const allValues = Object.values(gauges).filter(v => v >= 0);
  const systemScore = allValues.length > 0
    ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
    : -1;
  
  // Determine system status
  const getSystemStatus = () => {
    if (systemScore < 0) return { text: 'Check in to start', color: COLORS.textMuted };
    if (systemScore < 30) return { text: 'PAY ATTENTION', color: COLORS.warning };
    if (systemScore < 50) return { text: 'NEEDS CARE', color: COLORS.amber };
    if (systemScore < 70) return { text: 'STABLE', color: COLORS.accent };
    return { text: 'THRIVING', color: COLORS.success };
  };
  
  const status = getSystemStatus();
  
  return (
    <AuroraBackground variant={systemScore < 50 ? 'warm' : 'cool'}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {userName ? `Hey, ${userName}` : 'Your Cockpit'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {/* Gauge Row (Swipeable) - Like Oura's top bar */}
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gaugeRowScroll}
          snapToInterval={80}
          decelerationRate="fast"
        >
          {(Object.keys(GAUGE_INFO) as GaugeName[]).map((gauge) => {
            const value = gauges[gauge];
            const info = GAUGE_INFO[gauge];
            const isSelected = gauge === selectedGauge;
            
            return (
              <TouchableOpacity
                key={gauge}
                style={[
                  styles.gaugeRowItem,
                  isSelected && styles.gaugeRowItemSelected,
                ]}
                onPress={() => setSelectedGauge(gauge)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.gaugeRowScore,
                  { color: value >= 0 ? getGaugeColor(value) : COLORS.textMuted },
                  !isSelected && styles.gaugeRowScoreInactive,
                ]}>
                  {value >= 0 ? Math.round(value) : '--'}
                </Text>
                <Text style={[
                  styles.gaugeRowLabel,
                  isSelected && styles.gaugeRowLabelSelected,
                ]}>
                  {info.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* Featured Gauge (Big Arc) */}
        <TouchableOpacity 
          style={styles.featuredGauge}
          onPress={() => onGaugePress?.(selectedGauge)}
          activeOpacity={0.9}
        >
          <GaugeArc
            value={selectedValue}
            gauge={selectedGauge}
            size={220}
            strokeWidth={12}
            label={selectedInfo.label}
            animated={true}
          />
          
          {/* "Your first X Score!" for onboarding */}
          {selectedValue >= 0 && (
            <Text style={styles.featuredDescription}>
              {selectedInfo.description}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* System Status Card */}
        <GlassCard gaugeColor={status.color} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusLabel, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusScore}>{systemScore >= 0 ? systemScore : '--'}</Text>
            <Text style={styles.statusScoreLabel}>System Score</Text>
          </View>
          <Text style={styles.statusHint}>
            Average of all 6 gauges
          </Text>
        </GlassCard>
        
        {/* Cycle Context (if available) */}
        {cycleDay && cyclePhase && (
          <GlassCard gaugeColor={COLORS.gauges.body} style={styles.cycleCard}>
            <View style={styles.cycleHeader}>
              <Text style={styles.cycleEmoji}>🌙</Text>
              <View>
                <Text style={[styles.cyclePhase, { color: COLORS.gauges.body }]}>
                  {cyclePhase.toUpperCase()}
                </Text>
                <Text style={styles.cycleDay}>Cycle Day {cycleDay}</Text>
              </View>
            </View>
          </GlassCard>
        )}
        
        {/* Check-In Button */}
        <TouchableOpacity 
          style={styles.checkInButton}
          onPress={onCheckIn}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkInGradient}
          >
            <Text style={styles.checkInText}>Check In</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionCard
            emoji="🗣️"
            title="Talk to Psych"
            subtitle="AI companion"
          />
          <QuickActionCard
            emoji="🛠️"
            title="Toolkit"
            subtitle="7 AI tools"
          />
        </View>
        
        {/* Spacing at bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </AuroraBackground>
  );
}

// Quick action card component
function QuickActionCard({ 
  emoji, 
  title, 
  subtitle,
  onPress,
}: { 
  emoji: string; 
  title: string; 
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60, // Safe area
    paddingHorizontal: SPACING.lg,
  },
  
  // Header
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.text,
  },
  date: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  // Gauge Row (horizontal scroll)
  gaugeRowScroll: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  gaugeRowItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 70,
  },
  gaugeRowItemSelected: {
    backgroundColor: COLORS.surfaceGlass,
  },
  gaugeRowScore: {
    ...TYPOGRAPHY.scoreSm,
  },
  gaugeRowScoreInactive: {
    opacity: 0.6,
  },
  gaugeRowLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gaugeRowLabelSelected: {
    color: COLORS.textSecondary,
  },
  
  // Featured Gauge
  featuredGauge: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  featuredDescription: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  
  // Status Card
  statusCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statusHeader: {
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    ...TYPOGRAPHY.alert,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  statusScore: {
    ...TYPOGRAPHY.scoreMd,
    color: COLORS.text,
  },
  statusScoreLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  statusHint: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  
  // Cycle Card
  cycleCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cycleEmoji: {
    fontSize: 28,
  },
  cyclePhase: {
    ...TYPOGRAPHY.alert,
  },
  cycleDay: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginTop: 2,
  },
  
  // Check-In Button
  checkInButton: {
    marginVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
  },
  checkInGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  checkInText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    fontWeight: '600',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
  },
  quickActionSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default CockpitHome;
