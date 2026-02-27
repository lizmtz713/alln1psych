/**
 * Patterns Screen
 * The bigger picture — all data, all correlations, know yourself
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useSpotifyStore } from '../../src/stores/spotifyStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { getEnvironmentContext, getMoonPhase, getTimeContext } from '../../src/services/environment';
import { analyzePatterns, formatConfidence, type NarrativePattern, type PatternAnalysis } from '../../src/services/patternEngine';
import { usePatternReadiness } from '../../src/hooks/usePatternReadiness';
import { PatternsBuildingState } from '../../src/components/PatternsBuildingState';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const TEXT_DIM = COLORS.textMuted;
const ACCENT = COLORS.accent;

// Gauge colors
const GAUGE_COLORS = {
  green: '#4ADE80',
  yellow: '#FACC15',
  orange: '#FB923C',
  red: '#F87171',
};

function getGaugeColor(value: number): string {
  if (value < 0) return TEXT_DIM;
  if (value >= 75) return GAUGE_COLORS.green;
  if (value >= 50) return GAUGE_COLORS.yellow;
  if (value >= 25) return GAUGE_COLORS.orange;
  return GAUGE_COLORS.red;
}

function GaugeBar({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  const color = getGaugeColor(value);
  const width = value >= 0 ? `${value}%` : '0%';
  
  return (
    <View style={styles.gaugeBar}>
      <View style={styles.gaugeBarHeader}>
        <Text style={styles.gaugeBarEmoji}>{emoji}</Text>
        <Text style={styles.gaugeBarLabel}>{label}</Text>
        <Text style={[styles.gaugeBarValue, { color }]}>
          {value >= 0 ? value : '—'}
        </Text>
      </View>
      <View style={styles.gaugeBarTrack}>
        <View style={[styles.gaugeBarFill, { width: width as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function DataSourceCard({ 
  title, 
  icon, 
  iconColor, 
  connected, 
  children 
}: { 
  title: string; 
  icon: string; 
  iconColor: string;
  connected: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.dataCard}>
      <View style={styles.dataCardHeader}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <Text style={styles.dataCardTitle}>{title}</Text>
        {connected ? (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        ) : (
          <View style={styles.notConnectedBadge}>
            <Text style={styles.notConnectedText}>Not set up</Text>
          </View>
        )}
      </View>
      {connected && children}
    </View>
  );
}

function PatternCard({ 
  emoji, 
  title, 
  description 
}: { 
  emoji: string; 
  title: string; 
  description: string;
}) {
  return (
    <View style={styles.patternCard}>
      <Text style={styles.patternEmoji}>{emoji}</Text>
      <View style={styles.patternContent}>
        <Text style={styles.patternTitle}>{title}</Text>
        <Text style={styles.patternDesc}>{description}</Text>
      </View>
    </View>
  );
}

// Narrative Pattern Card (data-grounded, probabilistic language)
function NarrativePatternCard({ pattern }: { pattern: NarrativePattern }) {
  const confidenceColors = {
    early_signal: '#F59E0B',  // amber
    emerging: '#A78BFA',      // purple
    established: '#4ADE80',   // green
  };
  
  const typeEmojis = {
    feedback_loop: '🔄',
    correlation: '🔗',
    trend: '📈',
    trigger: '⚡',
  };

  return (
    <View style={styles.narrativeCard}>
      <View style={styles.narrativeHeader}>
        <Text style={styles.narrativeEmoji}>{typeEmojis[pattern.type]}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColors[pattern.confidence] + '20' }]}>
          <Text style={[styles.confidenceText, { color: confidenceColors[pattern.confidence] }]}>
            {formatConfidence(pattern.confidence)}
          </Text>
        </View>
      </View>
      <Text style={styles.narrativeText}>{pattern.narrative}</Text>
      {pattern.actionable && (
        <Text style={styles.actionableText}>💡 {pattern.actionable}</Text>
      )}
    </View>
  );
}

// Insufficient Data Card
function InsufficientDataCard({ message, uniqueDays }: { message: string; uniqueDays: number }) {
  return (
    <View style={styles.insufficientCard}>
      <Text style={styles.insufficientEmoji}>🌱</Text>
      <Text style={styles.insufficientTitle}>Patterns emerge with time</Text>
      <Text style={styles.insufficientText}>{message}</Text>
      <View style={styles.progressDots}>
        {[...Array(7)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.progressDot, 
              i < uniqueDays && styles.progressDotFilled
            ]} 
          />
        ))}
      </View>
      <Text style={styles.progressLabel}>{uniqueDays}/7 days</Text>
    </View>
  );
}

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Pattern readiness check (minimum data gate)
  const {
    loading: readinessLoading,
    isReady: patternsReady,
    checkInCount,
    neededForPatterns,
    progressPercent,
    message: readinessMessage,
  } = usePatternReadiness();
  
  // Narrative patterns from pattern engine
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [patternsLoading, setPatternsLoading] = useState(true);

  // Gauge data
  const body = useCockpitStore((s) => s.body.value);
  const state = useCockpitStore((s) => s.state.value);
  const emotion = useCockpitStore((s) => s.emotion.value);
  const connection = useCockpitStore((s) => s.connection.value);
  const direction = useCockpitStore((s) => s.direction.value);
  const alignment = useCockpitStore((s) => s.alignment.value);
  const crossSystemInsight = useCockpitStore((s) => s.crossSystemInsight);

  // Data sources
  const spotifyConnected = useSpotifyStore((s) => s.isConnected);
  const spotifyMood = useSpotifyStore((s) => s.listeningMood);
  const spotifyScore = useSpotifyStore((s) => s.moodScore);
  
  const weatherConfigured = useWeatherStore((s) => s.isConfigured);
  const weather = useWeatherStore((s) => s.weather);
  
  const healthSnapshot = useHealthStore((s) => s.snapshot);
  const healthAuthorized = useHealthStore((s) => s.isAuthorized);

  // Environment (always available)
  const [env, setEnv] = useState(getEnvironmentContext());
  const moon = getMoonPhase();
  const time = getTimeContext();

  // Insights
  const getEngagementStreak = useInsightsStore((s) => s.getEngagementStreak);
  const streak = getEngagementStreak?.() || 0;

  useEffect(() => {
    setEnv(getEnvironmentContext());
  }, []);

  // Load narrative patterns on mount
  useEffect(() => {
    const loadPatterns = async () => {
      setPatternsLoading(true);
      try {
        const analysis = await analyzePatterns();
        setPatternAnalysis(analysis);
      } catch (e) {
        console.error('Pattern analysis error:', e);
      } finally {
        setPatternsLoading(false);
      }
    };
    loadPatterns();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Refresh all data sources
    if (spotifyConnected) {
      useSpotifyStore.getState().refreshData();
    }
    if (weatherConfigured) {
      useWeatherStore.getState().refreshWeather();
    }
    
    setEnv(getEnvironmentContext());
    setRefreshing(false);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Build shareable summary
    const gauges = [
      `Body: ${body >= 0 ? body : 'not set'}`,
      `State: ${state >= 0 ? state : 'not set'}`,
      `Emotion: ${emotion >= 0 ? emotion : 'not set'}`,
      `Connection: ${connection >= 0 ? connection : 'not set'}`,
      `Direction: ${direction >= 0 ? direction : 'not set'}`,
      `Alignment: ${alignment >= 0 ? alignment : 'not set'}`,
    ].join('\n');

    let summary = `🧠 My InGauge Snapshot\n\n${gauges}`;
    
    if (crossSystemInsight) {
      summary += `\n\n💡 Insight: ${crossSystemInsight}`;
    }
    
    if (spotifyMood) {
      summary += `\n\n🎵 Listening mood: ${spotifyMood.moodLabel}`;
    }
    
    summary += `\n\n${moon.emoji} ${moon.phase} moon`;
    summary += `\n📅 ${time.dayOfWeek} ${time.timeOfDay}`;
    
    if (streak > 0) {
      summary += `\n🔥 ${streak}-day streak`;
    }

    try {
      await Share.share({ message: summary });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  // Calculate overall and find lowest gauge
  const activeGauges = [
    { name: 'Body', value: body, emoji: '🫀' },
    { name: 'State', value: state, emoji: '🧘' },
    { name: 'Emotion', value: emotion, emoji: '💜' },
    { name: 'Connection', value: connection, emoji: '🤝' },
    { name: 'Direction', value: direction, emoji: '🧭' },
    { name: 'Alignment', value: alignment, emoji: '⚖️' },
  ].filter((g) => g.value >= 0);

  const overall = activeGauges.length > 0
    ? Math.round(activeGauges.reduce((sum, g) => sum + g.value, 0) / activeGauges.length)
    : -1;

  const lowestGauge = activeGauges.length > 0
    ? activeGauges.reduce((low, g) => (g.value < low.value ? g : low))
    : null;

  const highestGauge = activeGauges.length > 0
    ? activeGauges.reduce((high, g) => (g.value > high.value ? g : high))
    : null;

  // Build patterns
  const patterns: { emoji: string; title: string; description: string }[] = [];

  if (lowestGauge && lowestGauge.value < 50) {
    patterns.push({
      emoji: '📉',
      title: `${lowestGauge.name} needs attention`,
      description: `At ${lowestGauge.value}, this is your lowest gauge. Focus here first.`,
    });
  }

  if (highestGauge && highestGauge.value >= 70) {
    patterns.push({
      emoji: '💪',
      title: `${highestGauge.name} is your strength`,
      description: `At ${highestGauge.value}, you're doing well here. Lean on it.`,
    });
  }

  if (body >= 0 && state >= 0 && body < 40 && state < 50) {
    patterns.push({
      emoji: '🔗',
      title: 'Body-State connection',
      description: 'Your physical state is affecting your nervous system. Body first.',
    });
  }

  if (time.timeOfDay === 'late-night') {
    patterns.push({
      emoji: '🌙',
      title: 'Late night check-in',
      description: 'You\'re up late. Sleep affects every gauge tomorrow.',
    });
  }

  if (time.dayOfWeek === 'Sunday' && time.timeOfDay === 'evening') {
    patterns.push({
      emoji: '😰',
      title: 'Sunday evening pattern',
      description: 'Anticipatory anxiety about the week is common. You\'re not alone.',
    });
  }

  if (moon.phase === 'full') {
    patterns.push({
      emoji: moon.emoji,
      title: 'Full moon tonight',
      description: moon.moodNote,
    });
  }

  if (spotifyMood && spotifyMood.averageValence < 0.4 && emotion >= 0 && emotion < 50) {
    patterns.push({
      emoji: '🎵',
      title: 'Music matches mood',
      description: 'Your listening is melancholic and so is your Emotion gauge. Processing something?',
    });
  }

  if (weather && weather.moodImpact === 'negative') {
    patterns.push({
      emoji: '🌧',
      title: 'Weather factor',
      description: 'Current conditions may be affecting your mood. Not your fault.',
    });
  }

  if (streak >= 7) {
    patterns.push({
      emoji: '🔥',
      title: `${streak}-day streak!`,
      description: 'Consistency builds self-awareness. You\'re doing the work.',
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Patterns</Text>
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={ACCENT} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      >
        {/* Overall Status */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallLabel}>Overall</Text>
            <Text style={[styles.overallValue, { color: getGaugeColor(overall) }]}>
              {overall >= 0 ? overall : '—'}
            </Text>
          </View>
          {crossSystemInsight && (
            <Text style={styles.insightText}>{crossSystemInsight}</Text>
          )}
        </View>

        {/* Gauges */}
        <Text style={styles.sectionTitle}>Your 6 Gauges</Text>
        <View style={styles.card}>
          <GaugeBar label="Body" value={body} emoji="🫀" />
          <GaugeBar label="State" value={state} emoji="🧘" />
          <GaugeBar label="Emotion" value={emotion} emoji="💜" />
          <GaugeBar label="Connection" value={connection} emoji="🤝" />
          <GaugeBar label="Direction" value={direction} emoji="🧭" />
          <GaugeBar label="Alignment" value={alignment} emoji="⚖️" />
        </View>

        {/* LONGITUDINAL PATTERNS - Narrative-first, data-grounded */}
        <Text style={styles.sectionTitle}>Cross-Gauge Patterns</Text>
        {readinessLoading || patternsLoading ? (
          <View style={styles.card}>
            <Text style={styles.loadingText}>Analyzing your history...</Text>
          </View>
        ) : !patternsReady ? (
          /* Pattern minimum data gate - show encouraging building state */
          <PatternsBuildingState
            checkInCount={checkInCount}
            neededForPatterns={neededForPatterns}
            progressPercent={progressPercent}
            message={readinessMessage}
          />
        ) : patternAnalysis && patternAnalysis.patterns.length > 0 ? (
          <View style={styles.narrativeSection}>
            <Text style={styles.narrativeIntro}>
              In your last {patternAnalysis.uniqueDays} days of check-ins:
            </Text>
            {patternAnalysis.patterns.map((pattern, i) => (
              <NarrativePatternCard key={pattern.id || i} pattern={pattern} />
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noPatternsText}>
              No strong patterns detected yet in your data. Your gauges tend to vary — which can be a good thing. Keep checking in to see if patterns emerge.
            </Text>
          </View>
        )}

        {/* Today's Context (real-time patterns) */}
        {patterns.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today's Context</Text>
            <View style={styles.card}>
              {patterns.map((p, i) => (
                <PatternCard key={i} {...p} />
              ))}
            </View>
          </>
        )}

        {/* Data Sources */}
        <Text style={styles.sectionTitle}>Data Sources</Text>

        {/* Health */}
        <DataSourceCard
          title="Apple Health"
          icon="heart-circle"
          iconColor="#FF6B6B"
          connected={healthAuthorized}
        >
          {healthSnapshot && (
            <View style={styles.dataStats}>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>
                  {healthSnapshot.sleep?.lastNight?.duration?.toFixed(1) || '—'}h
                </Text>
                <Text style={styles.dataStatLabel}>Sleep</Text>
              </View>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>
                  {healthSnapshot.activity?.steps?.toLocaleString() || '—'}
                </Text>
                <Text style={styles.dataStatLabel}>Steps</Text>
              </View>
            </View>
          )}
        </DataSourceCard>

        {/* Spotify */}
        <DataSourceCard
          title="Spotify"
          icon="musical-notes"
          iconColor="#1DB954"
          connected={spotifyConnected}
        >
          {spotifyMood && (
            <View style={styles.dataContent}>
              <Text style={styles.dataHighlight}>{spotifyMood.moodLabel}</Text>
              <View style={styles.dataStats}>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>
                    {Math.round(spotifyMood.averageValence * 100)}%
                  </Text>
                  <Text style={styles.dataStatLabel}>Positivity</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>
                    {Math.round(spotifyMood.averageEnergy * 100)}%
                  </Text>
                  <Text style={styles.dataStatLabel}>Energy</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>{spotifyMood.trackCount}</Text>
                  <Text style={styles.dataStatLabel}>Tracks</Text>
                </View>
              </View>
            </View>
          )}
        </DataSourceCard>

        {/* Weather */}
        <DataSourceCard
          title="Weather"
          icon="partly-sunny"
          iconColor="#60A5FA"
          connected={weatherConfigured}
        >
          {weather && (
            <View style={styles.dataContent}>
              <Text style={styles.dataHighlight}>
                {weather.temperature}°F — {weather.description}
              </Text>
              <Text style={styles.dataMoodImpact}>
                {weather.moodImpact === 'positive' && '☀️ Good for mood'}
                {weather.moodImpact === 'neutral' && '🌤 Neutral impact'}
                {weather.moodImpact === 'negative' && '🌧 May affect mood'}
              </Text>
            </View>
          )}
        </DataSourceCard>

        {/* Environment (always on) */}
        <DataSourceCard
          title="Time & Environment"
          icon="time"
          iconColor="#A78BFA"
          connected={true}
        >
          <View style={styles.dataContent}>
            <Text style={styles.dataHighlight}>
              {time.dayOfWeek} {time.timeOfDay} {time.isWeekend ? '(weekend)' : ''}
            </Text>
            <View style={styles.envRow}>
              <Text style={styles.envItem}>{moon.emoji} {moon.phase}</Text>
              <Text style={styles.envItem}>🌿 {time.season}</Text>
            </View>
          </View>
        </DataSourceCard>

        {/* Connect More */}
        <Pressable
          style={styles.connectMoreBtn}
          onPress={() => router.push('/(modals)/settings')}
        >
          <Ionicons name="add-circle-outline" size={20} color={ACCENT} />
          <Text style={styles.connectMoreText}>Connect more data sources</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  shareBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  
  // Overall card
  overallCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
    marginTop: 4,
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Gauge bars
  gaugeBar: {
    marginBottom: 14,
  },
  gaugeBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gaugeBarEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  gaugeBarLabel: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
  },
  gaugeBarValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  gaugeBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Pattern cards
  patternCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  patternEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  patternContent: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  patternDesc: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },

  // Data source cards
  dataCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dataCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: TEXT,
  },
  connectedBadge: {
    backgroundColor: '#4ADE80' + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  connectedText: {
    fontSize: 11,
    color: '#4ADE80',
    fontWeight: '500',
  },
  notConnectedBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  notConnectedText: {
    fontSize: 11,
    color: TEXT_DIM,
  },
  dataContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dataHighlight: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  dataMoodImpact: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  dataStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dataStat: {
    alignItems: 'center',
  },
  dataStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  dataStatLabel: {
    fontSize: 11,
    color: TEXT_DIM,
    marginTop: 2,
  },
  envRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  envItem: {
    fontSize: 13,
    color: TEXT_MUTED,
    textTransform: 'capitalize',
  },

  // Connect more
  connectMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  connectMoreText: {
    fontSize: 14,
    color: ACCENT,
  },

  // Narrative patterns (longitudinal, data-grounded)
  narrativeSection: {
    marginBottom: 20,
  },
  narrativeIntro: {
    fontSize: 13,
    color: TEXT_DIM,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  narrativeCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  narrativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  narrativeEmoji: {
    fontSize: 20,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  narrativeText: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
  },
  actionableText: {
    fontSize: 13,
    color: ACCENT,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_DIM,
    textAlign: 'center',
    padding: 20,
  },
  noPatternsText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    padding: 8,
  },

  // Insufficient data card
  insufficientCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  insufficientEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  insufficientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  insufficientText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotFilled: {
    backgroundColor: ACCENT,
  },
  progressLabel: {
    fontSize: 12,
    color: TEXT_DIM,
  },
});
