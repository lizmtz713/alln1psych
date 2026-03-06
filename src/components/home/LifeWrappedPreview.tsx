/**
 * Life Wrapped — Home screen preview: "2026 Life Wrapped — Coming December" with progress %.
 * Taps through to full story when ready (Dec 21+).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useWrappedTracking } from '../../hooks/useWrappedTracking';
import { isWrappedReady } from '../../services/wrappedReportGenerator';
import { WRAPPED_YEAR } from '../../types/wrapped';
import { COLORS, SPACING } from '../../lib/constants';

export function LifeWrappedPreview() {
  const router = useRouter();
  const { progress, refresh } = useWrappedTracking();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refresh();
    isWrappedReady().then(setReady);
  }, [refresh]);

  const handlePress = () => {
    router.push('/wrapped');
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>{WRAPPED_YEAR} Life Wrapped</Text>
      </View>
      {ready ? (
        <Text style={styles.ready}>Your Life Wrapped is ready!</Text>
      ) : (
        <>
          <Text style={styles.coming}>Coming December</Text>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.percent}>{progress}%</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  emoji: { fontSize: 24 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  coming: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  ready: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  progressWrap: { height: 6, backgroundColor: COLORS.surfaceElevated, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  percent: { fontSize: 12, color: COLORS.textMuted },
});
