/**
 * Creativity Tool — Hub: ideas, prompts, unblock.
 * Route: /tools/creativity
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useCreativityStore } from '../../../src/stores/creativityStore';
import { getDailyPrompt } from '../../../src/data/creativePrompts';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function CreativityIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ideasCount = useCreativityStore((s) => s.getIdeas().length);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Creativity</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Unblock, capture ideas, and respond to prompts.</Text>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/creativity/unblock');
          }}
        >
          <Text style={styles.cardEmoji}>🌊</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Unblock</Text>
            <Text style={styles.cardSub}>Short prompts to get unstuck.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const today = new Date().toISOString().slice(0, 10);
            const daily = getDailyPrompt(today);
            router.push(`/tools/creativity/prompt?id=${daily.id}`);
          }}
        >
          <Text style={styles.cardEmoji}>✨</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Creative prompt</Text>
            <Text style={styles.cardSub}>One prompt, one response.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/creativity/ideas');
          }}
        >
          <Text style={styles.cardEmoji}>💡</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>My ideas</Text>
            <Text style={styles.cardSub}>{ideasCount > 0 ? `${ideasCount} saved` : 'Saved ideas and responses.'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>
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
  subtitle: { fontSize: 16, color: TEXT_MUTED, marginBottom: SPACING.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  cardSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 2 },
});
