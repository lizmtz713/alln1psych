/**
 * Creativity Tool — Respond to a prompt. Route: /tools/creativity/prompt?id=w1
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useCreativityStore } from '../../../src/stores/creativityStore';
import { getPromptById, CREATIVE_PROMPT_CATEGORIES } from '../../../src/data/creativePrompts';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

export default function CreativityPromptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const promptId = id ?? '';
  const promptData = getPromptById(promptId);
  const [body, setBody] = useState('');
  const addResponse = useCreativityStore((s) => s.addResponse);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = () => {
    const trimmed = body.trim();
    if (!trimmed || !promptData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addResponse(promptData.id, trimmed);
    router.back();
  };

  const categoryLabel = promptData ? (CREATIVE_PROMPT_CATEGORIES.find((c) => c.id === promptData.category)?.label ?? '') : '';

  if (!promptData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.error}>Prompt not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryLabel}</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn} disabled={!body.trim()}>
          <Text style={[styles.saveBtnText, !body.trim() && styles.saveBtnDisabled]}>Save</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.promptBlock}>
          <Text style={styles.promptText}>{promptData.text}</Text>
          {promptData.hint ? <Text style={styles.promptHint}>{promptData.hint}</Text> : null}
        </View>
        <Text style={styles.label}>Your response</Text>
        <TextInput
          style={styles.input}
          placeholder="Write here..."
          placeholderTextColor={TEXT_MUTED}
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={2000}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  saveBtn: { padding: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  saveBtnDisabled: { color: TEXT_MUTED },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  backText: { fontSize: 16, color: COLORS.accent },
  error: { padding: SPACING.lg, color: TEXT_MUTED },
  promptBlock: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: SPACING.lg, marginBottom: SPACING.xl },
  promptText: { fontSize: 17, color: TEXT, lineHeight: 26 },
  promptHint: { fontSize: 14, color: TEXT_MUTED, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 8 },
  input: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: SPACING.lg, fontSize: 16, color: TEXT, minHeight: 160, textAlignVertical: 'top' },
});
