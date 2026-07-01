/**
 * Cycle Intelligence Dashboard
 * 
 * Shows current cycle phase, predictions, and insights.
 * Integrates with all 6 gauges.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../lib/constants';
import { useCycleStore, useCycleData, PHASE_INFO, type CyclePhase } from '../stores/cycleStore';
import { useHealthStore } from '../stores/healthStore';

// ============ Phase Ring Component ============

const PhaseRing: React.FC<{
  currentPhase: CyclePhase | null;
  dayOfCycle: number | null;
  cycleLength: number;
}> = ({ currentPhase, dayOfCycle, cycleLength }) => {
  const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  
  // Calculate progress through cycle (0-1)
  const progress = dayOfCycle ? dayOfCycle / cycleLength : 0;
  
  return (
    <View style={styles.phaseRingContainer}>
      {/* Center info */}
      <View style={styles.phaseRingCenter}>
        {dayOfCycle ? (
          <>
            <Text style={styles.dayText}>Day {dayOfCycle}</Text>
            <Text style={styles.ofCycleText}>of {cycleLength}</Text>
            {currentPhase && (
              <View style={styles.phaseChip}>
                <Text style={styles.phaseEmoji}>{PHASE_INFO[currentPhase].emoji}</Text>
                <Text style={styles.phaseName}>{PHASE_INFO[currentPhase].name}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noDataText}>No cycle data</Text>
        )}
      </View>
      
      {/* Phase indicators around the ring */}
      <View style={styles.phaseIndicators}>
        {phases.map((phase, index) => {
          const isActive = phase === currentPhase;
          const info = PHASE_INFO[phase];
          const angle = (index * 90) - 90; // Start from top
          
          return (
            <View
              key={phase}
              style={[
                styles.phaseIndicator,
                {
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateX: 70 },
                    { rotate: `${-angle}deg` },
                  ],
                },
                isActive && styles.phaseIndicatorActive,
              ]}
            >
              <Text style={[styles.indicatorEmoji, isActive && styles.indicatorEmojiActive]}>
                {info.emoji}
              </Text>
            </View>
          );
        })}
      </View>
      
      {/* Progress arc (simplified) */}
      <View style={[styles.progressArc, { opacity: dayOfCycle ? 1 : 0.3 }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress * 100}%`,
              backgroundColor: currentPhase ? PHASE_INFO[currentPhase].color : COLORS.textMuted,
            }
          ]} 
        />
      </View>
    </View>
  );
};

// ============ Insight Card Component ============

const InsightCard: React.FC<{
  icon: string;
  title: string;
  message: string;
  color?: string;
}> = ({ icon, title, message, color = COLORS.accent }) => (
  <View style={[styles.insightCard, { borderLeftColor: color }]}>
    <View style={styles.insightHeader}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <Text style={styles.insightTitle}>{title}</Text>
    </View>
    <Text style={styles.insightMessage}>{message}</Text>
  </View>
);

// ============ Setup Card Component ============

const SetupCard: React.FC<{
  onEnable: () => void;
}> = ({ onEnable }) => (
  <View style={styles.setupCard}>
    <Text style={styles.setupEmoji}>🌙</Text>
    <Text style={styles.setupTitle}>Cycle Intelligence</Text>
    <Text style={styles.setupDescription}>
      Understand how your cycle affects every aspect of your system.
      Connect Apple Health to automatically sync your cycle data.
    </Text>
    <TouchableOpacity style={styles.setupButton} onPress={onEnable}>
      <Ionicons name="heart" size={20} color={COLORS.background} />
      <Text style={styles.setupButtonText}>Enable Cycle Tracking</Text>
    </TouchableOpacity>
    <Text style={styles.setupPrivacy}>
      Your data stays private. You control what you share.
    </Text>
  </View>
);

// ============ Manual Entry Card ============

const ManualEntryCard: React.FC<{
  onSetPeriodStart: () => void;
}> = ({ onSetPeriodStart }) => (
  <View style={styles.manualCard}>
    <Text style={styles.manualTitle}>No cycle data detected</Text>
    <Text style={styles.manualDescription}>
      We couldn't find cycle data in Apple Health. You can enter it manually:
    </Text>
    <TouchableOpacity style={styles.manualButton} onPress={onSetPeriodStart}>
      <Ionicons name="calendar" size={18} color={COLORS.accent} />
      <Text style={styles.manualButtonText}>Set Last Period Start</Text>
    </TouchableOpacity>
  </View>
);

// ============ Main Component ============

export const CycleDashboard: React.FC = () => {
  const {
    trackingEnabled,
    currentPhase,
    dayOfCycle,
    cycleLength,
    daysUntilPeriod,
    daysUntilOvulation,
    phaseInfo,
    insights,
  } = useCycleData();

  const setTrackingEnabled = useCycleStore((s) => s.setTrackingEnabled);
  const setManualPeriodStart = useCycleStore((s) => s.setManualPeriodStart);
  const syncFromHealthKit = useCycleStore((s) => s.syncFromHealthKit);
  
  const healthIsAuthorized = useHealthStore((s) => s.isAuthorized);
  const requestHealthPermissions = useHealthStore((s) => s.requestPermissions);
  const syncHealthData = useHealthStore((s) => s.syncHealthData);

  const handleEnable = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'iOS Only',
        'Cycle tracking via Apple Health is only available on iOS devices.'
      );
      return;
    }

    // Request HealthKit permissions if not already authorized
    if (!healthIsAuthorized) {
      const authorized = await requestHealthPermissions();
      if (!authorized) {
        Alert.alert(
          'Permission Required',
          'Please allow access to Apple Health to enable cycle tracking.'
        );
        return;
      }
    }

    // Sync health data
    await syncHealthData();
    
    // Enable tracking
    setTrackingEnabled(true);
    syncFromHealthKit();
  };

  const handleManualPeriodStart = () => {
    // In a real app, show a date picker
    Alert.prompt(
      'Last Period Start',
      'Enter the date (YYYY-MM-DD) your last period started:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (date?: string) => {
            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
              setManualPeriodStart(date);
              syncFromHealthKit();
            } else {
              Alert.alert('Invalid Date', 'Please use format YYYY-MM-DD');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Sync on mount
  useEffect(() => {
    if (trackingEnabled) {
      syncFromHealthKit();
    }
  }, [trackingEnabled]);

  // Not enabled yet
  if (!trackingEnabled) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SetupCard onEnable={handleEnable} />
      </ScrollView>
    );
  }

  // Enabled but no data
  if (!currentPhase || dayOfCycle === null) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PhaseRing currentPhase={null} dayOfCycle={null} cycleLength={cycleLength} />
        <ManualEntryCard onSetPeriodStart={handleManualPeriodStart} />
      </ScrollView>
    );
  }

  // Full dashboard
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Phase Ring */}
      <PhaseRing
        currentPhase={currentPhase}
        dayOfCycle={dayOfCycle}
        cycleLength={cycleLength}
      />

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {daysUntilOvulation !== null && daysUntilOvulation > 0 && (
          <View style={styles.statChip}>
            <Text style={styles.statEmoji}>☀️</Text>
            <Text style={styles.statText}>{daysUntilOvulation}d to ovulation</Text>
          </View>
        )}
        {daysUntilPeriod !== null && (
          <View style={styles.statChip}>
            <Text style={styles.statEmoji}>🩸</Text>
            <Text style={styles.statText}>{daysUntilPeriod}d to period</Text>
          </View>
        )}
      </View>

      {/* Phase Info */}
      {phaseInfo && (
        <View style={styles.phaseInfoCard}>
          <Text style={styles.phaseInfoTitle}>
            {phaseInfo.emoji} {phaseInfo.name} Phase
          </Text>
          <Text style={styles.phaseInfoDescription}>{phaseInfo.description}</Text>
          
          <Text style={styles.sectionLabel}>Best For</Text>
          <View style={styles.tagContainer}>
            {phaseInfo.bestFor.map((item, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Self-Care</Text>
          <View style={styles.tagContainer}>
            {phaseInfo.selfCare.map((item, i) => (
              <View key={i} style={[styles.tag, styles.selfCareTag]}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Insights */}
      <Text style={styles.sectionHeader}>Today's Insights</Text>
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          icon={insight.type === 'prediction' ? '🔮' : insight.type === 'pattern' ? '📊' : '💡'}
          title={
            insight.type === 'prediction'
              ? 'Looking Ahead'
              : insight.type === 'pattern'
              ? 'Your Pattern'
              : 'Right Now'
          }
          message={insight.message}
          color={
            insight.severity === 'important'
              ? COLORS.temperature.red
              : insight.severity === 'gentle'
              ? COLORS.warning
              : COLORS.accent
          }
        />
      ))}

      {/* How This Affects Your Gauges */}
      <Text style={styles.sectionHeader}>How This Affects Your Gauges</Text>
      <View style={styles.gaugeEffects}>
        {['body', 'state', 'emotion', 'connection', 'direction', 'alignment'].map((gauge) => {
          const gaugeInsights = useCycleStore.getState().getInsightsForGauge(gauge);
          const contextInsight = gaugeInsights.find((i) => i.type === 'context');
          
          if (!contextInsight) return null;
          
          const gaugeEmojis: Record<string, string> = {
            body: '🫀',
            state: '🧘',
            emotion: '💜',
            connection: '🤝',
            direction: '🎯',
            alignment: '⚖️',
          };
          
          return (
            <View key={gauge} style={styles.gaugeEffect}>
              <Text style={styles.gaugeEmoji}>{gaugeEmojis[gauge]}</Text>
              <View style={styles.gaugeEffectContent}>
                <Text style={styles.gaugeLabel}>{gauge.charAt(0).toUpperCase() + gauge.slice(1)}</Text>
                <Text style={styles.gaugeMessage}>{contextInsight.message}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Settings Toggle */}
      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Cycle Tracking</Text>
            <Text style={styles.settingDescription}>Include cycle context in insights</Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={setTrackingEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// ============ Compact Card for Home Screen ============

export const CycleContextCard: React.FC = () => {
  const { trackingEnabled, currentPhase, dayOfCycle, daysUntilPeriod, phaseInfo } = useCycleData();

  if (!trackingEnabled || !currentPhase || !phaseInfo) {
    return null;
  }

  return (
    <View style={styles.contextCard}>
      <View style={styles.contextHeader}>
        <Text style={styles.contextEmoji}>{phaseInfo.emoji}</Text>
        <View>
          <Text style={styles.contextPhase}>{phaseInfo.name} Phase</Text>
          <Text style={styles.contextDay}>Day {dayOfCycle}</Text>
        </View>
      </View>
      <Text style={styles.contextTip}>
        {phaseInfo.energyLevel === 'low' && '💤 Rest is productive today'}
        {phaseInfo.energyLevel === 'rising' && '🌱 Great time for new beginnings'}
        {phaseInfo.energyLevel === 'peak' && '⚡ Peak energy — make it count'}
        {phaseInfo.energyLevel === 'declining' && '🍂 Winding down — be gentle'}
      </Text>
      {daysUntilPeriod && daysUntilPeriod <= 5 && (
        <Text style={styles.contextWarning}>🩸 Period in {daysUntilPeriod} days</Text>
      )}
    </View>
  );
};

// ============ Gauge Context Badge ============

export const CycleGaugeBadge: React.FC<{ gaugeType: string }> = ({ gaugeType }) => {
  const { trackingEnabled, currentPhase } = useCycleData();
  const getInsightsForGauge = useCycleStore((s) => s.getInsightsForGauge);

  if (!trackingEnabled || !currentPhase) {
    return null;
  }

  const insights = getInsightsForGauge(gaugeType);
  const contextInsight = insights.find((i) => i.type === 'context');

  if (!contextInsight) {
    return null;
  }

  const phaseInfo = PHASE_INFO[currentPhase];

  return (
    <View style={styles.gaugeBadge}>
      <Text style={styles.gaugeBadgeEmoji}>{phaseInfo.emoji}</Text>
      <Text style={styles.gaugeBadgeText} numberOfLines={1}>
        {contextInsight.message}
      </Text>
    </View>
  );
};

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Phase Ring
  phaseRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 24,
  },
  phaseRingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  dayText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  ofCycleText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  phaseEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  phaseName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  phaseIndicators: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  phaseIndicatorActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '20',
  },
  indicatorEmoji: {
    fontSize: 16,
    opacity: 0.5,
  },
  indicatorEmojiActive: {
    opacity: 1,
  },
  progressArc: {
    position: 'absolute',
    bottom: 20,
    width: '80%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Phase Info Card
  phaseInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phaseInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  phaseInfoDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selfCareTag: {
    backgroundColor: COLORS.success + '20',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text,
  },

  // Section Header
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },

  // Insight Card
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Gauge Effects
  gaugeEffects: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeEffect: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gaugeEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  gaugeEffectContent: {
    flex: 1,
  },
  gaugeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  gaugeMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  // Settings
  settingsSection: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Setup Card
  setupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  setupEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  setupDescription: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  setupPrivacy: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 16,
  },

  // Manual Entry Card
  manualCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  manualDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Context Card (for home screen)
  contextCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contextEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  contextPhase: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  contextDay: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  contextTip: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  contextWarning: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 8,
  },

  // Gauge Badge
  gaugeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  gaugeBadgeEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  gaugeBadgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
});

export default CycleDashboard;
