/**
 * Memory Builder — Names & faces. Hub: people you've met, practice, tips.
 * Tools → People → Memory Builder.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useMemoryBuilderStore } from '../../../src/stores/memoryBuilderStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || '?';
}

export default function MemoryBuilderIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const people = useMemoryBuilderStore((s) => s.getPeople());
  const dueForRecall = useMemoryBuilderStore((s) => s.getPeopleDueForRecall());
  const metThisWeek = useMemoryBuilderStore((s) => s.getPeopleMetThisWeek());

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
        <Text style={styles.headerTitle}>Memory Builder</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Remember names and faces using attention, association, and spaced recall. Add people you meet, create a memory hook, and practice recall.
        </Text>

        {metThisWeek > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              You met {metThisWeek} new {metThisWeek === 1 ? 'person' : 'people'} this week. Review their names to strengthen memory.
            </Text>
          </View>
        )}

        {dueForRecall.length > 0 && (
          <Pressable
            style={styles.recallCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/tools/memory-builder/practice/spaced-reminder');
            }}
          >
            <Text style={styles.recallTitle}>Time to recall</Text>
            <Text style={styles.recallBody}>
              {dueForRecall.length} {dueForRecall.length === 1 ? 'person' : 'people'} due for a quick recall. Tap to practice.
            </Text>
            <Ionicons name="flash" size={20} color={ACCENT} style={styles.recallIcon} />
          </Pressable>
        )}

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>People you've met</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/tools/memory-builder/add');
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
          {people.length === 0 ? (
            <Text style={styles.empty}>No one yet. Tap Add when you meet someone new.</Text>
          ) : (
            people.slice(0, 10).map((p) => (
              <Pressable
                key={p.id}
                style={({ pressed }) => [styles.personCard, pressed && styles.personCardPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/tools/memory-builder/person/${p.id}`);
                }}
              >
                {p.photoUri ? (
                  <Image source={{ uri: p.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{getInitials(p.name)}</Text>
                  </View>
                )}
                <View style={styles.personBody}>
                  <Text style={styles.personName}>{p.name}</Text>
                  {(p.whereMet || p.detail) && (
                    <Text style={styles.personMeta} numberOfLines={1}>
                      {[p.whereMet, p.detail].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
              </Pressable>
            ))
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.bigCard, pressed && styles.bigCardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/memory-builder/practice');
          }}
        >
          <Text style={styles.bigCardEmoji}>🧠</Text>
          <Text style={styles.bigCardTitle}>Practice</Text>
          <Text style={styles.bigCardSub}>Name Lock, Face Anchor, Quick Recall — under 60 seconds each</Text>
          <Ionicons name="chevron-forward" size={22} color={ACCENT} style={styles.bigCardChevron} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.bigCard, pressed && styles.bigCardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/memory-builder/tips');
          }}
        >
          <Text style={styles.bigCardEmoji}>💡</Text>
          <Text style={styles.bigCardTitle}>Memory tips</Text>
          <Text style={styles.bigCardSub}>Pay attention, repeat, visualize — science-based rules</Text>
          <Ionicons name="chevron-forward" size={22} color={ACCENT} style={styles.bigCardChevron} />
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remembering names makes people feel valued and strengthens your Connection gauge.
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
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 20 },
  insightCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  insightText: { fontSize: 14, color: TEXT },
  recallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 20,
  },
  recallTitle: { fontSize: 15, fontWeight: '700', color: TEXT, flex: 1 },
  recallBody: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  recallIcon: { marginLeft: 8 },
  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  empty: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', marginBottom: 8 },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 8,
  },
  personCardPressed: { opacity: 0.9 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: ACCENT },
  personBody: { flex: 1, minWidth: 0 },
  personName: { fontSize: 16, fontWeight: '600', color: TEXT },
  personMeta: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  bigCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: 12,
  },
  bigCardPressed: { opacity: 0.9 },
  bigCardEmoji: { fontSize: 28, marginBottom: 8 },
  bigCardTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  bigCardSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  bigCardChevron: { position: 'absolute', right: 16, top: '50%', marginTop: -11 },
  footer: { marginTop: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
