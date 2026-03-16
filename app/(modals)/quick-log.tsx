/**
 * Quick Log — State → Drivers → System Impact. Under 10 seconds, tap-only.
 * "What caused this?" then "What part of my life does this affect?"
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import { GAUGE_CONFIG } from '../../src/utils/gaugeHelpers';
import { DRIVERS_BY_GAUGE } from '../../src/data/driversByGauge';
import { CircumplexEmotionPicker, type CircumplexOption } from '../../src/components/checkin/CircumplexEmotionPicker';

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

export default function QuickLogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const updateState = useCockpitStore((s) => s.updateState);
  const updateEmotion = useCockpitStore((s) => s.updateEmotion);
  const setCheckInSystemImpact = useCockpitStore((s) => s.setCheckInSystemImpact);
  const setCheckInDrivers = useCockpitStore((s) => s.setCheckInDrivers);
  const setLastCheckInSnapshot = useCockpitStore((s) => s.setLastCheckInSnapshot);
  const setLastCheckInDate = useCockpitStore((s) => s.setLastCheckInDate);
  const recordGaugesForDrift = useCockpitStore((s) => s.recordGaugesForDrift);

  const [step, setStep] = useState(0);
  const [statePick, setStatePick] = useState<CircumplexOption | null>(null);
  const [systemImpact, setSystemImpact] = useState<GaugeKey[]>([]);
  const [driverIds, setDriverIds] = useState<string[]>([]);

  const handleStatePick = (opt: CircumplexOption) => {
    setStatePick(opt);
  };

  const toggleSystemImpact = (g: GaugeKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSystemImpact((prev) => (prev.includes(g) ? prev.filter((k) => k !== g) : [...prev, g]));
  };

  const toggleDriver = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDriverIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    if (!statePick) return;
    updateState(statePick.state);
    updateEmotion(statePick.emotion);
    setCheckInSystemImpact(systemImpact.length > 0 ? systemImpact : null);
    setCheckInDrivers(driverIds.length > 0 ? driverIds : null);
    const snap = useCockpitStore.getState();
    const gauges: Partial<Record<import('../../src/stores/cockpitStore').GaugeKey, number>> = {};
    if (snap.body.value >= 0) gauges.body = snap.body.value;
    if (snap.state.value >= 0) gauges.state = snap.state.value;
    if (snap.emotion.value >= 0) gauges.emotion = snap.emotion.value;
    if (snap.connection.value >= 0) gauges.connection = snap.connection.value;
    if (snap.direction.value >= 0) gauges.direction = snap.direction.value;
    if (snap.alignment.value >= 0) gauges.alignment = snap.alignment.value;
    setLastCheckInSnapshot({
      state: statePick.state,
      emotion: statePick.emotion,
      systemImpact,
      drivers: driverIds,
      timestamp: new Date().toISOString(),
      gauges: Object.keys(gauges).length > 0 ? gauges : undefined,
    });
    setLastCheckInDate(new Date().toISOString().slice(0, 10));
    recordGaugesForDrift().catch(() => {});
    router.back();
  };

  const canNext = step === 0 ? statePick !== null : true;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Quick log</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <Text style={styles.question}>How are you?</Text>
            <Text style={styles.hint}>Tap one — energy × mood (under 10 sec)</Text>
            <CircumplexEmotionPicker
              selectedId={statePick?.id ?? null}
              onSelect={handleStatePick}
              compact
            />
          </>
        )}

        {/* Step 1: What's influencing this? (causes first) */}
        {step === 1 && (
          <>
            <Text style={styles.question}>What's influencing this?</Text>
            <Text style={styles.hint}>Optional — tap what's affecting how you feel</Text>
            <View style={styles.driverGroups}>
              {(Object.entries(DRIVERS_BY_GAUGE) as [GaugeKey, { id: string; label: string }[]][]).map(([gauge, drivers]) => (
                <View key={gauge} style={styles.driverGroup}>
                  <Text style={styles.driverGroupLabel}>{GAUGE_CONFIG[gauge]?.label ?? gauge}</Text>
                  <View style={styles.chipRow}>
                    {drivers.map((d) => {
                      const selected = driverIds.includes(d.id);
                      return (
                        <Pressable
                          key={d.id}
                          style={[styles.chipSmall, selected && styles.chipSelected]}
                          onPress={() => toggleDriver(d.id)}
                        >
                          <Text style={[styles.chipSmallText, selected && styles.chipTextSelected]}>{d.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Which parts of your system feel affected? */}
        {step === 2 && (
          <>
            <Text style={styles.question}>Which parts of your system feel affected?</Text>
            <Text style={styles.hint}>Optional — tap any that apply</Text>
            <View style={styles.chipRow}>
              {GAUGE_KEYS.map((key) => {
                const config = GAUGE_CONFIG[key];
                const selected = systemImpact.includes(key);
                return (
                  <Pressable
                    key={key}
                    style={[styles.chip, styles.chipGauge, selected && styles.chipSelected]}
                    onPress={() => toggleSystemImpact(key)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{config?.label ?? key}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.nextBtn, !canNext && step === 0 && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={step === 0 && !canNext}
        >
          <Text style={styles.nextBtnText}>{step === 2 ? 'Done' : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, minWidth: 40 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.accent },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  question: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipGauge: {},
  chipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.15)' },
  chipText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  chipTextSelected: { color: COLORS.accent },
  chipSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSmallText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  driverGroups: { gap: 20 },
  driverGroup: { marginBottom: 16 },
  driverGroupLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
