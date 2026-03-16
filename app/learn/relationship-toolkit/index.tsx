/**
 * Relationship Toolkit — Under People / Connection.
 * Making, maintaining, nurturing, repairing, replacing, removing harmful relationships + signals.
 * Route: /learn/relationship-toolkit
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { RELATIONSHIP_TOOLKIT_SECTIONS } from '../../../src/data/relationshipToolkit';
import { FriendshipRadar } from '../../../src/components/circle/FriendshipRadar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function RelationshipToolkitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Relationship Toolkit</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Relationships are one of the strongest predictors of long-term happiness. Here’s how to make, maintain, nurture, repair—and when needed, replace or step back from—relationships in your life.
        </Text>
        <FriendshipRadar />
        {RELATIONSHIP_TOOLKIT_SECTIONS.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <View key={section.id} style={styles.sectionCard}>
              <Pressable
                style={[styles.sectionHeader, isExpanded && styles.sectionHeaderExpanded]}
                onPress={() => toggle(section.id)}
              >
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
              </Pressable>
              {isExpanded && (
                <View style={styles.sectionBody}>
                  <Text style={styles.principle}>{section.principle}</Text>
                  {section.content.map((para, i) => (
                    <Text key={i} style={styles.para}>{para}</Text>
                  ))}
                  {section.actions && section.actions.length > 0 && (
                    <>
                      <Text style={styles.actionsLabel}>Quick actions</Text>
                      {section.actions.map((action, i) => (
                        <Text key={i} style={styles.actionItem}>• {action}</Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your Connection gauge reflects how your relationships are doing. Use Reach Out, Family Conflict Navigator, or Perspective Translator when you need to act.
          </Text>
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  sectionHeaderExpanded: { borderBottomWidth: 1, borderBottomColor: BORDER },
  sectionEmoji: { fontSize: 24, marginRight: 12 },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  sectionSubtitle: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  sectionBody: { padding: SPACING.md, paddingTop: 0 },
  principle: { fontSize: 14, fontWeight: '600', color: ACCENT, marginBottom: 10, fontStyle: 'italic' },
  para: { fontSize: 14, color: TEXT, lineHeight: 21, marginBottom: 8 },
  actionsLabel: { fontSize: 13, fontWeight: '600', color: TEXT, marginTop: 8, marginBottom: 4 },
  actionItem: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 2 },
  footer: { marginTop: 16 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
