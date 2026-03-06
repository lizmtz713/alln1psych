/**
 * Creativity Tool — Browse saved ideas. Route: /tools/creativity/ideas
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useCreativityStore } from '../../../src/stores/creativityStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString();
}

export default function CreativityIdeasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ideas = useCreativityStore((s) => s.getIdeas());

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
        <Text style={styles.headerTitle}>My ideas</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {ideas.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💡</Text>
            <Text style={styles.emptyTitle}>No ideas yet</Text>
            <Text style={styles.emptySub}>Capture ideas from the Creativity home screen.</Text>
          </View>
        ) : (
          ideas.map((idea) => (
            <View key={idea.id} style={styles.card}>
              <Text style={styles.cardBody} numberOfLines={5}>{idea.body}</Text>
              <Text style={styles.cardDate}>{formatDate(idea.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 4 },
  emptySub: { fontSize: 14, color: TEXT_MUTED },
  card: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: SPACING.lg, marginBottom: SPACING.md },
  cardBody: { fontSize: 15, color: TEXT, lineHeight: 22 },
  cardDate: { fontSize: 12, color: TEXT_MUTED, marginTop: 8 },
});
