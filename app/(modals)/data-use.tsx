/**
 * How Your Data Is Used — transparency page.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, APP_CONFIG } from '../../src/lib/constants';
import { DATA_USE_SECTIONS, DATA_MINIMIZATION_NOTE } from '../../src/data/legalDisclaimers';

const BG = COLORS.background;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function DataUseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>How Your Data Is Used</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          {APP_CONFIG.name} is transparent about what we collect and how it’s used. You stay in control.
        </Text>
        <Text style={styles.minimization}>{DATA_MINIMIZATION_NOTE}</Text>
        {DATA_USE_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
        ))}
        <Text style={styles.note}>
          You can download or delete your data anytime from Settings → Privacy & Data.
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
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  minimization: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', lineHeight: 20, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: ACCENT, marginBottom: 8 },
  bullet: { fontSize: 14, color: TEXT_MUTED, lineHeight: 22, marginBottom: 4 },
  note: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', marginTop: 8 },
});
