/**
 * Foundation — Body Baseline (sleep, nutrition, movement)
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useFoundationStore } from '../../src/stores/foundationStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;
const BORDER = COLORS.border;

function FoundationBodyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bodyBaseline = useFoundationStore((s) => s.bodyBaseline);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Body Baseline</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Sleep, nutrition, movement</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            {bodyBaseline?.sleep || bodyBaseline?.nutrition || bodyBaseline?.movement
              ? `Last updated: ${bodyBaseline?.updatedAt ? new Date(bodyBaseline.updatedAt).toLocaleDateString() : '—'}`
              : 'Track how sleep, food, and movement affect your baseline. Content and inputs can be added here.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function FoundationBodyModal() {
  return (
    <ErrorBoundary>
      <FoundationBodyScreen />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...TYPOGRAPHY.headlineMd, color: TEXT },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  subtitle: { ...TYPOGRAPHY.bodyMd, color: TEXT_MUTED, marginBottom: SPACING.lg },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
  },
  cardText: { ...TYPOGRAPHY.bodyMd, color: TEXT },
});
