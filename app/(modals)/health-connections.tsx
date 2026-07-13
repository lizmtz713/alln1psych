/**
 * Health Connections - PHOSM Data Integration
 * Connect health devices to enhance gauge intelligence
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { APP_CONFIG } from '../../src/lib/constants';
import { useHealthStore } from '../../src/stores/healthStore';
import type { NormalizedHealthSnapshot } from '../../src/types/normalizedHealthSnapshot';

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.15)',
  warning: '#F59E0B',
  error: '#EF4444',
  pink: '#EC4899',
  blue: '#3B82F6',
  teal: '#14B8A6',
};

// Data types we can pull from HealthKit
const HEALTH_DATA_TYPES = [
  {
    id: 'sleep',
    category: 'Sleep',
    icon: 'moon',
    color: '#6366F1',
    types: [
      { name: 'Sleep Duration', desc: 'Hours of sleep last night', gauges: ['Body', 'State'] },
      { name: 'Sleep Quality', desc: 'Time in each sleep stage', gauges: ['Body', 'State', 'Emotion'] },
      { name: 'Time in Bed', desc: 'Total time in bed', gauges: ['Body'] },
      { name: 'Sleep Consistency', desc: 'How regular your sleep schedule is', gauges: ['Body', 'State'] },
    ],
  },
  {
    id: 'heart',
    category: 'Heart',
    icon: 'heart',
    color: '#EF4444',
    types: [
      { name: 'Resting Heart Rate', desc: 'Your baseline heart rate', gauges: ['Body', 'State'] },
      { name: 'Heart Rate Variability', desc: 'Key stress/recovery indicator', gauges: ['State', 'Emotion'], highlight: true },
      { name: 'Walking Heart Rate', desc: 'Heart rate while moving', gauges: ['Body'] },
      { name: 'Blood Oxygen (SpO2)', desc: 'Oxygen saturation levels', gauges: ['Body', 'State'] },
    ],
  },
  {
    id: 'activity',
    category: 'Activity',
    icon: 'footsteps',
    color: '#F59E0B',
    types: [
      { name: 'Steps', desc: 'Daily step count', gauges: ['Body', 'State'] },
      { name: 'Active Energy', desc: 'Calories burned through activity', gauges: ['Body'] },
      { name: 'Exercise Minutes', desc: 'Time spent exercising', gauges: ['Body', 'State', 'Emotion'] },
      { name: 'Stand Hours', desc: 'Hours with standing/movement', gauges: ['Body'] },
      { name: 'Walking Distance', desc: 'Distance walked/run', gauges: ['Body'] },
    ],
  },
  {
    id: 'cycle',
    category: 'Cycle',
    icon: 'flower',
    color: '#EC4899',
    types: [
      { name: 'Menstrual Cycle', desc: 'Period tracking & phase', gauges: ['ALL'], highlight: true },
      { name: 'Cycle Day', desc: 'Current day in cycle', gauges: ['Body', 'State', 'Emotion'] },
      { name: 'Symptoms', desc: 'Logged cycle symptoms', gauges: ['Body', 'Emotion'] },
      { name: 'Predictions', desc: 'Predicted period & fertile window', gauges: ['Body'] },
    ],
  },
  {
    id: 'mindfulness',
    category: 'Mindfulness',
    icon: 'leaf',
    color: '#14B8A6',
    types: [
      { name: 'Mindful Minutes', desc: 'Time spent meditating', gauges: ['Emotion', 'Alignment'] },
      { name: 'Stress Level', desc: 'Apple Watch stress detection', gauges: ['State', 'Emotion'] },
    ],
  },
  {
    id: 'environment',
    category: 'Environment',
    icon: 'volume-high',
    color: '#3B82F6',
    types: [
      { name: 'Environmental Sound', desc: 'Noise exposure levels', gauges: ['State'] },
      { name: 'Headphone Audio', desc: 'Listening volume levels', gauges: ['Body'] },
    ],
  },
];

// Gauge enhancement explanations
const GAUGE_ENHANCEMENTS = {
  Body: {
    emoji: '🧬',
    examples: [
      'Auto-suggest Body score based on sleep + activity',
      'You only got 5 hours of sleep — your Body might feel it',
      'Track how movement affects your physical state',
    ],
  },
  State: {
    emoji: '⚡',
    examples: [
      'HRV shows your nervous system capacity',
      'Your HRV is low — less buffer for stress today',
      'Connect sleep quality to energy levels',
    ],
  },
  Emotion: {
    emoji: '💜',
    examples: [
      'Low HRV = emotions feel bigger',
      'Cycle phase affects emotional patterns',
      'Exercise correlation with mood',
    ],
  },
  Connection: {
    emoji: '🤝',
    examples: [
      'Low energy affects social capacity',
      'Cycle phase affects social preferences',
    ],
  },
  Direction: {
    emoji: '🧭',
    examples: [
      'Sleep debt clouds sense of purpose',
      'Activity correlates with motivation',
    ],
  },
  Alignment: {
    emoji: '⭐',
    examples: [
      'Mindful minutes support values work',
      'Chronic fatigue can cause values drift',
    ],
  },
};

function formatSyncedAt(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function countNormalizedMetrics(n: NormalizedHealthSnapshot | null): number {
  if (!n) return 0;
  let c = 0;
  if (n.sleepHours != null) c++;
  if (n.steps != null) c++;
  if (n.restingHeartRate != null) c++;
  if (n.heartRateVariability != null) c++;
  if (n.latestHeartRate != null) c++;
  if (n.workoutsThisWeek != null) c++;
  return c;
}

export default function HealthConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAvailable = useHealthStore((s) => s.isAvailable);
  const isAuthorized = useHealthStore((s) => s.isAuthorized);
  const normalizedSnapshot = useHealthStore((s) => s.normalizedSnapshot);
  const lastSyncAttempt = useHealthStore((s) => s.lastSyncAttempt);
  const syncError = useHealthStore((s) => s.syncError);
  const initialize = useHealthStore((s) => s.initialize);
  const requestPermissions = useHealthStore((s) => s.requestPermissions);
  const syncHealthData = useHealthStore((s) => s.syncHealthData);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({
    sleep: true,
    heart: true,
    activity: true,
    cycle: true,
    mindfulness: true,
    environment: false,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleConnect = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'Apple Health is only available on iOS devices. Android support via Google Fit is coming soon!');
      return;
    }

    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const kitReady = await initialize();
      if (!kitReady) {
        Alert.alert(
          'Apple Health unavailable',
          'Health data could not be opened on this device. Use a physical iPhone with Health, or rebuild the dev client with HealthKit enabled.'
        );
        setIsConnecting(false);
        return;
      }

      const granted = await requestPermissions();

      if (granted) {
        await syncHealthData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Connected',
          'InGauge can read supporting signals from Apple Health. Oura and other apps that sync into Health can contribute automatically.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission needed',
          `To use health data as supporting signals, enable access in:\n\nSettings → Privacy & Security → Health → ${APP_CONFIG.name}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch {
      Alert.alert('Connection error', 'Could not connect to Apple Health. Please try again.');
    }

    setIsConnecting(false);
  };

  const handleRefresh = async () => {
    if (!isAuthorized) return;
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await syncHealthData();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const toggleCategory = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCategory(expandedCategory === id ? null : id);
  };
  
  const toggleEnabled = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnabledTypes(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Apple Health</Text>
          <View style={{ width: 32 }} />
        </View>
        
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconRow}>
              <View style={[styles.heroIcon, { backgroundColor: '#FF375522' }]}>
                <Ionicons name="heart" size={32} color="#FF3755" />
              </View>
              <Ionicons name="add" size={20} color={COLORS.textMuted} />
              <View style={[styles.heroIcon, { backgroundColor: COLORS.accentSoft }]}>
                <Text style={{ fontSize: 28 }}>🧠</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Body Data → Mind Intelligence</Text>
            <Text style={styles.heroText}>
              Connect Apple Health so sleep, activity, and heart signals can gently inform your Body and State gauges. Oura can sync into Health on iPhone — one permission flow for you.
            </Text>

            {Platform.OS === 'ios' && !isAuthorized && (
              <View style={styles.explainerBox}>
                <Text style={styles.explainerTitle}>What we’ll ask for</Text>
                <Text style={styles.explainerBody}>
                  Read-only access to a small first set: sleep, steps, workouts, heart rate, HRV, and resting heart rate. You can change this anytime in the Health app.
                </Text>
              </View>
            )}
            
            {/* Connection Status */}
            <View style={[styles.statusBar, isAuthorized && styles.statusBarConnected]}>
              <View style={[styles.statusDot, { backgroundColor: isAuthorized ? COLORS.success : COLORS.textMuted }]} />
              <Text style={[styles.statusText, isAuthorized && { color: COLORS.success }]}>
                {!isAvailable && Platform.OS === 'ios'
                  ? 'HealthKit not available on this build'
                  : isAuthorized
                    ? 'Connected'
                    : 'Not connected'}
              </Text>
            </View>

            {syncError ? (
              <Text style={styles.syncErrorText}>{syncError}</Text>
            ) : null}
            
            {!isAuthorized && (
              <Pressable 
                style={styles.connectButton}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="fitness" size={20} color="#FFF" />
                    <Text style={styles.connectButtonText}>Connect Apple Health</Text>
                  </>
                )}
              </Pressable>
            )}

            {isAuthorized && (
              <Pressable
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator color={COLORS.accent} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color={COLORS.accent} />
                    <Text style={styles.refreshButtonText}>Refresh from Health</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          {/* Normalized snapshot — UI reads this model, not raw HealthKit */}
          {(isAuthorized || normalizedSnapshot) && (
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Supporting signals</Text>
              <Text style={styles.metricsSub}>
                Last synced: {formatSyncedAt(normalizedSnapshot?.syncedAt ?? lastSyncAttempt)}
                {normalizedSnapshot?.source === 'mixed' ? ' · Sources: mixed (Health + Oura)' : ''}
              </Text>
              {countNormalizedMetrics(normalizedSnapshot) === 0 && isAuthorized ? (
                <Text style={styles.metricsEmpty}>
                  No samples yet for the metrics we read. Add data in Apple Health (Watch, iPhone, or apps like Oura), then tap Refresh.
                </Text>
              ) : (
                <View style={styles.metricsRows}>
                  {normalizedSnapshot?.sleepHours != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Sleep (last night)</Text>
                      <Text style={styles.metricValue}>{normalizedSnapshot.sleepHours.toFixed(1)} h</Text>
                    </View>
                  )}
                  {normalizedSnapshot?.steps != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Steps (today)</Text>
                      <Text style={styles.metricValue}>{Math.round(normalizedSnapshot.steps)}</Text>
                    </View>
                  )}
                  {normalizedSnapshot?.restingHeartRate != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Resting heart rate</Text>
                      <Text style={styles.metricValue}>{normalizedSnapshot.restingHeartRate} bpm</Text>
                    </View>
                  )}
                  {normalizedSnapshot?.heartRateVariability != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>HRV (SDNN)</Text>
                      <Text style={styles.metricValue}>{normalizedSnapshot.heartRateVariability} ms</Text>
                    </View>
                  )}
                  {normalizedSnapshot?.latestHeartRate != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Latest heart rate</Text>
                      <Text style={styles.metricValue}>{normalizedSnapshot.latestHeartRate} bpm</Text>
                    </View>
                  )}
                  {normalizedSnapshot?.workoutsThisWeek != null && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Workouts (7 days)</Text>
                      <Text style={styles.metricValue}>{normalizedSnapshot.workoutsThisWeek}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          
          {/* What We Read Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Read</Text>
            <Text style={styles.sectionSubtitle}>
              Tap each category to see specific data types and which gauges they enhance
            </Text>
            
            {HEALTH_DATA_TYPES.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Pressable 
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '22' }]}>
                      <Ionicons name={category.icon as any} size={20} color={category.color} />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{category.category}</Text>
                      <Text style={styles.categoryCount}>{category.types.length} data types</Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Switch
                      value={enabledTypes[category.id]}
                      onValueChange={() => toggleEnabled(category.id)}
                      trackColor={{ false: COLORS.border, true: category.color + '66' }}
                      thumbColor={enabledTypes[category.id] ? category.color : COLORS.textMuted}
                    />
                    <Ionicons 
                      name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={COLORS.textMuted} 
                    />
                  </View>
                </Pressable>
                
                {expandedCategory === category.id && (
                  <View style={styles.categoryExpanded}>
                    {category.types.map((type, idx) => (
                      <View key={idx} style={styles.dataTypeRow}>
                        <View style={styles.dataTypeInfo}>
                          <Text style={[styles.dataTypeName, type.highlight && { color: category.color }]}>
                            {type.name}
                            {type.highlight && ' ⭐'}
                          </Text>
                          <Text style={styles.dataTypeDesc}>{type.desc}</Text>
                        </View>
                        <View style={styles.gaugeChips}>
                          {type.gauges.map((gauge) => (
                            <View key={gauge} style={styles.gaugeChip}>
                              <Text style={styles.gaugeChipText}>{gauge}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
          
          {/* How It Enhances Your Gauges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Enhances Your Gauges</Text>
            
            {Object.entries(GAUGE_ENHANCEMENTS).map(([gauge, info]) => (
              <View key={gauge} style={styles.enhancementCard}>
                <View style={styles.enhancementHeader}>
                  <Text style={styles.enhancementEmoji}>{info.emoji}</Text>
                  <Text style={styles.enhancementGauge}>{gauge}</Text>
                </View>
                <View style={styles.enhancementExamples}>
                  {info.examples.map((example, idx) => (
                    <View key={idx} style={styles.enhancementExample}>
                      <View style={styles.enhancementBullet} />
                      <Text style={styles.enhancementText}>{example}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          
          {/* The PHOSM Difference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The PHOSM Difference</Text>
            
            <View style={styles.differenceCard}>
              <View style={styles.differenceRow}>
                <View style={styles.differenceLabel}>
                  <Text style={styles.differenceLabelText}>Apple Health says:</Text>
                </View>
                <Text style={styles.differenceValue}>"You slept 5.5 hours"</Text>
              </View>
              
              <View style={styles.differenceArrow}>
                <Ionicons name="arrow-down" size={20} color={COLORS.accent} />
              </View>
              
              <View style={styles.differenceRow}>
                <View style={[styles.differenceLabel, { backgroundColor: COLORS.accentSoft }]}>
                  <Text style={[styles.differenceLabelText, { color: COLORS.accent }]}>{APP_CONFIG.name} says:</Text>
                </View>
                <Text style={styles.differenceValueHighlight}>
                  "You slept 5.5 hours, and you're on Day 24 of your cycle when energy naturally dips. Your State might feel 20% lower than usual today. That's not weakness — that's two systems working against you. What would 'good enough' look like?"
                </Text>
              </View>
            </View>
          </View>
          
          {/* Privacy */}
          <View style={styles.privacyCard}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Your Data Stays Yours</Text>
              <Text style={styles.privacyDesc}>
                Health data never leaves your device. We don't store it on our servers, sell it, or share it. It's only used locally to generate personalized insights.
              </Text>
            </View>
          </View>
          
          {/* Manage in Settings Link */}
          {isAuthorized && (
            <Pressable 
              style={styles.settingsLink}
              onPress={() => Linking.openSettings()}
            >
              <Ionicons name="settings-outline" size={18} color={COLORS.accent} />
              <Text style={styles.settingsLinkText}>Manage in iOS Settings</Text>
            </Pressable>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  
  // Hero
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBarConnected: {
    backgroundColor: COLORS.successSoft,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3755',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  explainerBox: {
    width: '100%',
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  explainerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  explainerBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  syncErrorText: {
    fontSize: 13,
    color: COLORS.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  metricsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricsSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  metricsEmpty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  metricsRows: {
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  
  // Categories
  categoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryExpanded: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  dataTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dataTypeInfo: {
    flex: 1,
    marginRight: 12,
  },
  dataTypeName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  dataTypeDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  gaugeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gaugeChip: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gaugeChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
  },
  
  // Enhancement Cards
  enhancementCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  enhancementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  enhancementEmoji: {
    fontSize: 20,
  },
  enhancementGauge: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  enhancementExamples: {
    gap: 6,
  },
  enhancementExample: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  enhancementBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 6,
  },
  enhancementText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  // Difference
  differenceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  differenceRow: {
    marginBottom: 8,
  },
  differenceLabel: {
    backgroundColor: COLORS.cardElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  differenceLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  differenceValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  differenceValueHighlight: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  differenceArrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  
  // Privacy
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.successSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 13,
    color: COLORS.success,
    lineHeight: 18,
    opacity: 0.9,
  },
  
  // Settings Link
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  settingsLinkText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
});
