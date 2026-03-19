/**
 * Human Roles — Choose your role. Route: /tools/human-roles
 * Scientifically grounded guides for how to show up in relationships.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { HUMAN_ROLES } from '../../../src/data/humanRoles';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function HumanRolesIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRole = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tools/human-roles/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Human Roles</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          What role are you in right now? Tap one for a short, science-based guide on what that person needs and what works best.
        </Text>
        <Text style={styles.prompt}>Choose your role today</Text>
        <View style={styles.roleGrid}>
          {HUMAN_ROLES.map((role) => (
            <Pressable
              key={role.id}
              style={({ pressed }) => [styles.roleCard, pressed && styles.cardPressed]}
              onPress={() => handleRole(role.id)}
            >
              <Text style={styles.roleEmoji}>{role.emoji}</Text>
              <Text style={styles.roleLabel}>{role.shortLabel}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.disclaimer}>
          This is education and guidance, not therapy. Consult a professional when you need clinical support.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24, marginBottom: SPACING.md },
  prompt: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: SPACING.md },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  roleCard: {
    width: '31%',
    minWidth: 100,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: { opacity: 0.9 },
  roleEmoji: { fontSize: 28, marginBottom: 4 },
  roleLabel: { fontSize: 13, fontWeight: '600', color: TEXT, textAlign: 'center' },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: SPACING.xl,
    fontStyle: 'italic',
  },
});
