/**
 * Therapist Share Modal
 * 
 * Generate and share professional reports with healthcare providers.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { subDays, subMonths, format } from 'date-fns';
import {
  generateTherapistReport,
  shareReport,
  REPORT_PRESETS,
  type ReportConfig,
  type ReportPreset,
} from '../../src/services/therapistShare';

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  success: '#10B981',
};

type TimeRange = '7d' | '30d' | '90d' | 'custom';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 3 months' },
];

export default function TherapistShareModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState<'therapist' | 'psychiatrist' | 'counselor' | 'other'>('therapist');
  const [patientId, setPatientId] = useState('');
  
  const [includeGauges, setIncludeGauges] = useState(true);
  const [includePatterns, setIncludePatterns] = useState(true);
  const [includeCrisis, setIncludeCrisis] = useState(false);
  const [includeCycle, setIncludeCycle] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const getDateRange = (): { start: Date; end: Date } => {
    const end = new Date();
    let start: Date;
    
    switch (timeRange) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '90d':
        start = subMonths(end, 3);
        break;
      case '30d':
      default:
        start = subDays(end, 30);
    }
    
    return { start, end };
  };

  const handleGenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGenerating(true);
    
    try {
      const { start, end } = getDateRange();
      
      const config: ReportConfig = {
        startDate: start,
        endDate: end,
        includeGauges,
        includePatterns,
        includeCrisisEvents: includeCrisis,
        includeCircleContext: false,
        includeCycleData: includeCycle,
        includeJournalSummary: false,
        providerName: providerName || undefined,
        providerType,
        anonymizeNames: true,
        patientIdentifier: patientId || undefined,
      };
      
      const report = await generateTherapistReport(config);
      await shareReport(report);
      
      Alert.alert(
        'Report Ready',
        'Your wellness report has been generated and is ready to share.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Report generation failed:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const applyPreset = (preset: ReportPreset) => {
    const settings = REPORT_PRESETS[preset];
    setIncludeGauges(settings.includeGauges);
    setIncludePatterns(settings.includePatterns);
    setIncludeCrisis(settings.includeCrisisEvents);
    setIncludeCycle(settings.includeCycleData);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Share with Provider</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="medical" size={32} color={COLORS.accent} />
          <Text style={styles.introTitle}>Professional Wellness Report</Text>
          <Text style={styles.introText}>
            Generate a detailed report to share with your therapist, psychiatrist, or counselor. 
            You control exactly what data is included.
          </Text>
        </View>

        {/* Provider Info */}
        <Text style={styles.sectionTitle}>Provider Details (Optional)</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Provider Name</Text>
            <TextInput
              style={styles.input}
              value={providerName}
              onChangeText={setProviderName}
              placeholder="Dr. Sarah Chen"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Patient ID</Text>
            <TextInput
              style={styles.input}
              value={patientId}
              onChangeText={setPatientId}
              placeholder="Optional identifier"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Time Range */}
        <Text style={styles.sectionTitle}>Time Range</Text>
        <View style={styles.timeRangeRow}>
          {TIME_RANGES.map(range => (
            <TouchableOpacity
              key={range.key}
              style={[
                styles.timeRangeBtn,
                timeRange === range.key && styles.timeRangeBtnActive,
              ]}
              onPress={() => {
                setTimeRange(range.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range.key && styles.timeRangeTextActive,
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Presets */}
        <Text style={styles.sectionTitle}>Quick Presets</Text>
        <View style={styles.presetsRow}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => applyPreset('briefSummary')}
          >
            <Text style={styles.presetEmoji}>📋</Text>
            <Text style={styles.presetText}>Brief</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => applyPreset('fullReport')}
          >
            <Text style={styles.presetEmoji}>📊</Text>
            <Text style={styles.presetText}>Full</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => applyPreset('psychiatristReport')}
          >
            <Text style={styles.presetEmoji}>💊</Text>
            <Text style={styles.presetText}>Psychiatry</Text>
          </TouchableOpacity>
        </View>

        {/* Data Selection */}
        <Text style={styles.sectionTitle}>Include in Report</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Gauge History</Text>
              <Text style={styles.toggleDesc}>Daily scores for all 6 gauges</Text>
            </View>
            <Switch
              value={includeGauges}
              onValueChange={setIncludeGauges}
              trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
              thumbColor={includeGauges ? COLORS.accent : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Detected Patterns</Text>
              <Text style={styles.toggleDesc}>Recurring trends in your data</Text>
            </View>
            <Switch
              value={includePatterns}
              onValueChange={setIncludePatterns}
              trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
              thumbColor={includePatterns ? COLORS.accent : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Crisis Events</Text>
              <Text style={styles.toggleDesc}>Flagged difficult moments</Text>
            </View>
            <Switch
              value={includeCrisis}
              onValueChange={setIncludeCrisis}
              trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
              thumbColor={includeCrisis ? COLORS.accent : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Cycle Correlation</Text>
              <Text style={styles.toggleDesc}>Menstrual phase patterns</Text>
            </View>
            <Switch
              value={includeCycle}
              onValueChange={setIncludeCycle}
              trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
              thumbColor={includeCycle ? COLORS.accent : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.privacyText}>
            All names are anonymized. Only data you select is included. 
            You can review before sharing.
          </Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Generate & Share Report</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This report is for informational purposes and does not constitute 
          medical advice. Share only with trusted healthcare providers.
        </Text>
      </ScrollView>
    </View>
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  
  introCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  
  inputRow: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  
  timeRangeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  timeRangeBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeRangeBtnActive: {
    backgroundColor: COLORS.accent + '20',
    borderColor: COLORS.accent,
  },
  timeRangeText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: COLORS.accent,
  },
  
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  presetText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  toggleDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  
  generateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
