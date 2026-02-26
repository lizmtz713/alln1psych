/**
 * Monthly Sovereignty Report Screen
 * Displays the "Season Review" with patterns, lead/lag indicators, and sovereignty score
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getSovereigntyReport,
  type SovereigntyReport,
  type GaugeTrend,
  type LeadLagRelationship,
  type ExternalTrigger,
} from '../../src/services/sovereigntyReport';
import { type GaugeKey } from '../../src/stores/cockpitStore';
import * as Haptics from 'expo-haptics';

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const GAUGE_COLORS: Record<GaugeKey, string> = {
  body: '#FF6B6B',
  state: '#4ECDC4',
  emotion: '#A78BFA',
  connection: '#F472B6',
  direction: '#FBBF24',
  alignment: '#34D399',
};

export default function SovereigntyReportScreen() {
  const router = useRouter();
  const [report, setReport] = useState<SovereigntyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async (forceRefresh = false) => {
    const data = await getSovereigntyReport(forceRefresh);
    setReport(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadReport(true);
    setRefreshing(false);
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
          <Text style={styles.loadingText}>Analyzing your patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Monthly Report</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Not Enough Data Yet</Text>
          <Text style={styles.emptyText}>
            Keep checking in daily. Your first Monthly Report will unlock after 7 days of data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const healthColors = {
    thriving: '#4CAF50',
    stable: '#8BC34A',
    recovering: '#FF9800',
    strained: '#F44336',
  };

  const healthEmojis = {
    thriving: '🌟',
    stable: '✨',
    recovering: '🌱',
    strained: '⚠️',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#7C4DFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7C4DFF" />
        }
      >
        {/* Sovereignty Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>SOVEREIGNTY SCORE</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{report.sovereigntyScore}</Text>
          </View>
          <View style={styles.scoreFactors}>
            <View style={styles.factorItem}>
              <Text style={styles.factorValue}>{report.sovereigntyFactors.selfAwareness}</Text>
              <Text style={styles.factorLabel}>Awareness</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorValue}>{report.sovereigntyFactors.consistency}</Text>
              <Text style={styles.factorLabel}>Consistency</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorValue}>{report.sovereigntyFactors.resilience}</Text>
              <Text style={styles.factorLabel}>Resilience</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorValue}>{report.sovereigntyFactors.growth}</Text>
              <Text style={styles.factorLabel}>Growth</Text>
            </View>
          </View>
        </View>

        {/* System Health */}
        <View style={[styles.healthCard, { borderLeftColor: healthColors[report.systemHealth] }]}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthEmoji}>{healthEmojis[report.systemHealth]}</Text>
            <Text style={[styles.healthStatus, { color: healthColors[report.systemHealth] }]}>
              {report.systemHealth.charAt(0).toUpperCase() + report.systemHealth.slice(1)}
            </Text>
          </View>
          <Text style={styles.healthNarrative}>{report.systemHealthNarrative}</Text>
        </View>

        {/* Top Insights */}
        {report.topInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            {report.topInsights.map((insight, i) => (
              <View key={i} style={styles.insightItem}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Lead/Lag Relationships */}
        {report.leadLagRelationships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔮 Leading Indicators</Text>
            <Text style={styles.sectionSubtitle}>
              Gauges that predict changes in other gauges
            </Text>
            {report.leadLagRelationships.map((rel, i) => (
              <View key={i} style={styles.leadLagCard}>
                <View style={styles.leadLagHeader}>
                  <View style={[styles.gaugeBadge, { backgroundColor: GAUGE_COLORS[rel.leadGauge] + '22' }]}>
                    <Text style={[styles.gaugeBadgeText, { color: GAUGE_COLORS[rel.leadGauge] }]}>
                      {GAUGE_LABELS[rel.leadGauge]}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                  <View style={[styles.gaugeBadge, { backgroundColor: GAUGE_COLORS[rel.lagGauge] + '22' }]}>
                    <Text style={[styles.gaugeBadgeText, { color: GAUGE_COLORS[rel.lagGauge] }]}>
                      {GAUGE_LABELS[rel.lagGauge]}
                    </Text>
                  </View>
                  <Text style={styles.lagTime}>{rel.lagHours}h</Text>
                </View>
                <Text style={styles.leadLagNarrative}>{rel.narrative}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{rel.confidence}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* External Triggers */}
        {report.externalTriggers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Detected Patterns</Text>
            <Text style={styles.sectionSubtitle}>
              External factors affecting your gauges
            </Text>
            {report.externalTriggers.map((trigger, i) => (
              <View key={i} style={styles.triggerCard}>
                <Text style={styles.triggerDescription}>{trigger.description}</Text>
                <Text style={styles.triggerFrequency}>{trigger.frequency}</Text>
                <View style={styles.triggerImpact}>
                  <Ionicons 
                    name={trigger.averageImpact > 0 ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={trigger.averageImpact > 0 ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={[
                    styles.triggerImpactText,
                    { color: trigger.averageImpact > 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {trigger.averageImpact > 0 ? '+' : ''}{trigger.averageImpact} points
                  </Text>
                </View>
                <Text style={styles.triggerSuggestion}>{trigger.suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gauge Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Gauge Trends</Text>
          <Text style={styles.sectionSubtitle}>
            How each gauge changed this month
          </Text>
          {report.gaugeTrends.map((trend, i) => (
            <View key={i} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <View style={[styles.gaugeDot, { backgroundColor: GAUGE_COLORS[trend.gauge] }]} />
                <Text style={styles.trendGauge}>{GAUGE_LABELS[trend.gauge]}</Text>
                <View style={[
                  styles.directionBadge,
                  { backgroundColor: 
                    trend.direction === 'improving' ? '#4CAF5022' :
                    trend.direction === 'declining' ? '#F4433622' : '#66666622'
                  }
                ]}>
                  <Ionicons 
                    name={
                      trend.direction === 'improving' ? 'trending-up' :
                      trend.direction === 'declining' ? 'trending-down' : 'remove'
                    }
                    size={14}
                    color={
                      trend.direction === 'improving' ? '#4CAF50' :
                      trend.direction === 'declining' ? '#F44336' : '#888'
                    }
                  />
                  <Text style={[
                    styles.directionText,
                    { color: 
                      trend.direction === 'improving' ? '#4CAF50' :
                      trend.direction === 'declining' ? '#F44336' : '#888'
                    }
                  ]}>
                    {trend.change > 0 ? '+' : ''}{trend.change}
                  </Text>
                </View>
              </View>
              <View style={styles.trendStats}>
                <Text style={styles.trendStat}>Start: {trend.monthStart}%</Text>
                <Text style={styles.trendStat}>End: {trend.monthEnd}%</Text>
                <Text style={styles.trendStat}>Best: {trend.bestDay}</Text>
                <Text style={styles.trendStat}>Worst: {trend.worstDay}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Maintenance Plan */}
        {report.maintenancePlan.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Maintenance Plan</Text>
            {report.maintenancePlan.map((item, i) => (
              <View key={i} style={[
                styles.maintenanceCard,
                { borderLeftColor: 
                  item.priority === 'high' ? '#F44336' :
                  item.priority === 'medium' ? '#FF9800' : '#4CAF50'
                }
              ]}>
                <View style={styles.maintenanceHeader}>
                  <View style={[styles.gaugeBadge, { backgroundColor: GAUGE_COLORS[item.focus] + '22' }]}>
                    <Text style={[styles.gaugeBadgeText, { color: GAUGE_COLORS[item.focus] }]}>
                      {GAUGE_LABELS[item.focus]}
                    </Text>
                  </View>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: 
                      item.priority === 'high' ? '#F4433622' :
                      item.priority === 'medium' ? '#FF980022' : '#4CAF5022'
                    }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: 
                        item.priority === 'high' ? '#F44336' :
                        item.priority === 'medium' ? '#FF9800' : '#4CAF50'
                      }
                    ]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>
                <Text style={styles.maintenanceAction}>{item.action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Report Info */}
        <View style={styles.reportInfo}>
          <Text style={styles.reportInfoText}>
            Based on {report.dataPoints} check-ins over the last 30 days
          </Text>
          <Text style={styles.reportInfoText}>
            Generated {new Date(report.generatedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7C4DFF22',
    borderWidth: 4,
    borderColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#7C4DFF',
  },
  scoreFactors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  factorItem: {
    alignItems: 'center',
  },
  factorValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  factorLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  healthCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  healthEmoji: {
    fontSize: 24,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: '600',
  },
  healthNarrative: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  insightItem: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  leadLagCard: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  leadLagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  gaugeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gaugeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lagTime: {
    fontSize: 12,
    color: '#888',
    marginLeft: 'auto',
  },
  leadLagNarrative: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
    marginBottom: 8,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
  },
  triggerCard: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  triggerDescription: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  triggerFrequency: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  triggerImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  triggerImpactText: {
    fontSize: 13,
    fontWeight: '600',
  },
  triggerSuggestion: {
    fontSize: 13,
    color: '#AAA',
    fontStyle: 'italic',
  },
  trendCard: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  gaugeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  trendGauge: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendStat: {
    fontSize: 12,
    color: '#888',
  },
  maintenanceCard: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  maintenanceAction: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  reportInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  reportInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
