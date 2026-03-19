/**
 * Flight Log — Entry point for Pre-Flight & Post-Flight rituals.
 * Linked from Me → Insights. Routes to rituals.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../../src/lib/constants';

export default function FlightLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Flight Log</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Pre-Flight & Post-Flight — your daily bookends.</Text>
        <Pressable
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/rituals/pre-flight');
          }}
        >
          <Text style={styles.cardEmoji}>☀️</Text>
          <Text style={styles.cardTitle}>Pre-Flight</Text>
          <Text style={styles.cardDesc}>Morning ritual — set intention, check sleep, and how you feel.</Text>
          <Text style={styles.cardCta}>Open Pre-Flight →</Text>
        </Pressable>
        <Pressable
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/rituals/post-flight');
          }}
        >
          <Text style={styles.cardEmoji}>🌙</Text>
          <Text style={styles.cardTitle}>Post-Flight</Text>
          <Text style={styles.cardDesc}>Evening ritual — reflect on the day and wind down.</Text>
          <Text style={styles.cardCta}>Open Post-Flight →</Text>
        </Pressable>
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  cardCta: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
});
