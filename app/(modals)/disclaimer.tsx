/**
 * Global disclaimer — always accessible from Settings and footer.
 * InGauge Disclaimer, Mental Health Boundary, Crisis resources link.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, APP_CONFIG } from '../../src/lib/constants';
import {
  GLOBAL_DISCLAIMER,
  MENTAL_HEALTH_BOUNDARY,
  SAFETY_NOTICE,
  EDUCATIONAL_DISCLAIMER,
  SIMULATION_DISCLAIMER,
  PATTERN_DISCLAIMER,
  RESEARCH_TRANSPARENCY,
  AI_DISCLOSURE_FULL,
  SAFETY_GUIDELINES,
} from '../../src/data/legalDisclaimers';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function DisclaimerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>{APP_CONFIG.name} Disclaimer</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>What {APP_CONFIG.name} Is</Text>
          <Text style={styles.body}>{GLOBAL_DISCLAIMER.full}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Not Therapy or Counseling</Text>
          <Text style={styles.body}>{MENTAL_HEALTH_BOUNDARY.full}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Safety & Crisis</Text>
          <Text style={styles.body}>{SAFETY_NOTICE.short}</Text>
          <Pressable
            style={styles.crisisBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(modals)/crisis-resources'); }}
          >
            <Text style={styles.crisisBtnText}>View crisis resources</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Educational Content</Text>
          <Text style={styles.body}>{EDUCATIONAL_DISCLAIMER}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Roleplay & Simulations</Text>
          <Text style={styles.body}>{SIMULATION_DISCLAIMER}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Text style={styles.body}>{PATTERN_DISCLAIMER}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Research & education</Text>
          <Text style={styles.body}>{RESEARCH_TRANSPARENCY}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>{AI_DISCLOSURE_FULL.title}</Text>
          <Text style={styles.body}>{AI_DISCLOSURE_FULL.intro}</Text>
          {AI_DISCLOSURE_FULL.points.map((point, i) => (
            <Text key={i} style={[styles.body, styles.bullet]}>• {point}</Text>
          ))}
        </View>
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>{SAFETY_GUIDELINES.title}</Text>
          <Text style={styles.body}>{SAFETY_GUIDELINES.report}</Text>
          <Text style={[styles.body, styles.bullet]}>{SAFETY_GUIDELINES.crisis}</Text>
        </View>
        <View style={styles.footer}>
          <Pressable onPress={() => Linking.openURL('https://alln1network.com/terms')}>
            <Text style={styles.link}>Terms of Service</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://alln1network.com/privacy')}>
            <Text style={styles.link}>Privacy Policy</Text>
          </Pressable>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  block: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: ACCENT, marginBottom: 8 },
  body: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  bullet: { marginTop: 6 },
  crisisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.button,
    marginTop: 12,
  },
  crisisBtnText: { fontSize: 15, fontWeight: '600', color: '#fff', marginRight: 8 },
  footer: { marginTop: 24, gap: 12 },
  link: { fontSize: 15, color: ACCENT },
});
