/**
 * Memory Builder — Person detail: name, photo, where met, detail, association, practice recall.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../src/lib/constants';
import { useMemoryBuilderStore } from '../../../../src/stores/memoryBuilderStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase() || '?';
}

export default function MemoryBuilderPersonScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getPersonById = useMemoryBuilderStore((s) => s.getPersonById);
  const recordRecall = useMemoryBuilderStore((s) => s.recordRecall);
  const deletePerson = useMemoryBuilderStore((s) => s.deletePerson);
  const person = id ? getPersonById(id) : undefined;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!person) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={styles.backBtn} />
        </View>
      </View>
    );
  }

  const doRecall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/tools/memory-builder/practice/name-lock', params: { personId: person.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{person.name}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarBlock}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
            </View>
          )}
          {person.distinctiveFeature && (
            <Text style={styles.featureTag}>Feature: {person.distinctiveFeature}</Text>
          )}
        </View>

        {(person.whereMet || person.detail) && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Where / detail</Text>
            <Text style={styles.cardBody}>
              {[person.whereMet, person.detail].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}

        {person.association && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Memory hook</Text>
            <Text style={styles.cardBody}>{person.association}</Text>
          </View>
        )}

        <Pressable style={styles.primaryBtn} onPress={doRecall}>
          <Text style={styles.primaryBtnText}>Practice recall</Text>
          <Ionicons name="flash" size={20} color="#fff" />
        </Pressable>

        <View style={styles.suggestCard}>
          <Text style={styles.suggestTitle}>Strengthen the relationship</Text>
          <Text style={styles.suggestBody}>
            Send a short follow-up: "Nice meeting you, {person.name.split(/\s+/)[0]}!"
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
  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: ACCENT },
  featureTag: { fontSize: 13, color: TEXT_MUTED, marginTop: 8 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 4 },
  cardBody: { fontSize: 15, color: TEXT },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  suggestCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  suggestTitle: { fontSize: 14, fontWeight: '600', color: TEXT },
  suggestBody: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
});
