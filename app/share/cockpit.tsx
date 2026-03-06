/**
 * Cockpit Snapshot — Share/save current gauges as a card.
 * Theme, format (square/story), period (now/today/week), optional note.
 * Replace this with the full share UI (CockpitSnapshotCard, pickers, save/share) when built.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/lib/constants';

export default function ShareCockpitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Share Cockpit</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.placeholderBody}>
        <Text style={styles.placeholderText}>Cockpit Snapshot screen</Text>
        <Text style={styles.placeholderSub}>Theme, format, period pickers + card preview + share/save</Text>
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
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  placeholder: { width: 40 },
  placeholderBody: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  placeholderText: { fontSize: 17, color: COLORS.text, marginBottom: 8 },
  placeholderSub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});
