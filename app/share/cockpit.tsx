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
        <Text style={styles.placeholderEmoji}>📊</Text>
        <Text style={styles.placeholderText}>Share your system snapshot</Text>
        <Text style={styles.placeholderSub}>Share your current gauges as a card. This screen is being built — for now you can share from Me → Share Snapshot or from the cockpit after a check-in.</Text>
        <Pressable style={styles.settingsLink} onPress={() => router.push('/(modals)/share-snapshot')}>
          <Text style={styles.settingsLinkText}>Open Share Snapshot</Text>
          <Ionicons name="open-outline" size={18} color={COLORS.accent} />
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
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  placeholder: { width: 40 },
  placeholderBody: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  placeholderEmoji: { fontSize: 40, marginBottom: 12 },
  placeholderText: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  placeholderSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  settingsLinkText: { fontSize: 15, fontWeight: '500', color: COLORS.accent },
});
