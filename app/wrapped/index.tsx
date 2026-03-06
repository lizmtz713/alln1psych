/**
 * Life Wrapped — Full screen: story flow (14 cards) or "coming December" when not ready.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateWrappedReport, isWrappedReady } from '../../src/services/wrappedReportGenerator';
import { WrappedStoryCards } from '../../src/components/wrapped/WrappedStoryCards';
import { WRAPPED_YEAR } from '../../src/types/wrapped';
import { COLORS, SPACING } from '../../src/lib/constants';

export default function WrappedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState<boolean | null>(null);
  const [report, setReport] = useState<Awaited<ReturnType<typeof generateWrappedReport>>>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await isWrappedReady();
      if (cancelled) return;
      setReady(r);
      if (r) {
        const rep = await generateWrappedReport();
        if (!cancelled) setReport(rep);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (ready === null) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!ready || !report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>{WRAPPED_YEAR} Life Wrapped</Text>
        <Text style={styles.subtitle}>Coming December 21</Text>
        <Text style={styles.body}>Your report will generate automatically. Keep checking in, journaling, and logging connections.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleShare = () => {
    Share.share({
      message: `My ${WRAPPED_YEAR} Life Wrapped — ${report?.stats ? report.stats.checkIns + report.stats.journalEntries + report.stats.connectionLogs + report.stats.preFlights + report.stats.postFlights : 0} moments. AllN1 Psych · You Are Not Alone.`,
      title: `${WRAPPED_YEAR} Life Wrapped`,
    }).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <WrappedStoryCards
        cards={report.cards}
        onComplete={() => router.back()}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: 48 },
  subtitle: { fontSize: 17, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  body: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginHorizontal: SPACING.xl, marginTop: 24 },
  backBtn: { marginTop: 48, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { fontSize: 16, color: COLORS.accent, fontWeight: '600' },
});
