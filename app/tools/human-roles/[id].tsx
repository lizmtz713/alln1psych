/**
 * Human Role Guide — Single role deep dive. Route: /tools/human-roles/[id]
 * Layer 1: Quick Truth → Layer 2: Why It Matters → Layer 3: What To Do → Layer 4: Learn More.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getHumanRoleById } from '../../../src/data/humanRoles';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function HumanRoleGuideScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = id ? getHumanRoleById(id) : undefined;
  const [expandedLearnMore, setExpandedLearnMore] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleQuickAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Could deep-link to Talk, Reach Out, or a generic "Check in" flow
    router.push('/(tabs)/talk');
  };

  if (!role) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Role not found</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>This role guide isn’t available.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>How to be a better {role.shortLabel.toLowerCase()}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Layer 1: Quick Truth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{role.needsSectionTitle}</Text>
          <View style={styles.bulletList}>
            {role.whatTheyNeed.map((item, i) => (
              <Text key={i} style={styles.bulletItem}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* Layer 2: Why It Matters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why it matters</Text>
          <Text style={styles.paragraph}>{role.whyItMatters}</Text>
        </View>

        {/* Common mistakes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common mistakes</Text>
          <View style={styles.bulletList}>
            {role.commonMistakes.map((item, i) => (
              <Text key={i} style={styles.bulletItemMuted}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* What works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What works best</Text>
          <View style={styles.bulletList}>
            {role.whatWorks.map((item, i) => (
              <Text key={i} style={styles.bulletItem}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* Layer 3: Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsRow}>
            {role.quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                onPress={handleQuickAction}
              >
                <Text style={styles.actionBtnText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Layer 4: Learn more (optional) */}
        {role.learnMoreTopics && role.learnMoreTopics.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.learnMoreHeader}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedLearnMore((v) => !v);
              }}
            >
              <Text style={styles.sectionTitle}>Learn deeper</Text>
              <Ionicons name={expandedLearnMore ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
            </Pressable>
            {expandedLearnMore && (
              <View style={styles.bulletList}>
                {role.learnMoreTopics.map((topic, i) => (
                  <Text key={i} style={styles.bulletItemMuted}>• {topic}</Text>
                ))}
              </View>
            )}
          </View>
        )}

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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  paragraph: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  bulletList: { marginTop: 4 },
  bulletItem: { fontSize: 15, color: TEXT, lineHeight: 22, marginBottom: 4 },
  bulletItemMuted: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 4 },
  actionBtn: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionBtnPressed: { opacity: 0.9 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  learnMoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: TEXT_MUTED },
});
