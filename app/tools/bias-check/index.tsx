/**
 * Bias Check — Input text and see which cognitive bias patterns match.
 * Route: /tools/bias-check
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useBiasStore } from '../../../src/stores/biasStore';
import { detectBiasesInText } from '../../../src/services/biasDetection';
import { runAchievementChecks } from '../../../src/services/achievementChecker';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BiasCheckIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useBiasStore((s) => s.entries);
  const addEntry = useBiasStore((s) => s.addEntry);

  const [input, setInput] = useState('');
  const [lastDetected, setLastDetected] = useState<{ detected: ReturnType<typeof detectBiasesInText> } | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/bias-check/library');
  };

  const handleCheck = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const detected = detectBiasesInText(trimmed);
    setLastDetected({ detected });
    addEntry(trimmed, detected);
    runAchievementChecks();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Bias Check</Text>
        <Pressable onPress={handleLibrary} style={styles.libraryBtn}>
          <Ionicons name="library-outline" size={22} color={TEXT} />
          <Text style={styles.libraryText}>Library</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          Paste or type text to spot possible cognitive bias patterns. Not judgment — just awareness.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. I knew it all along — that just confirms what I thought..."
          placeholderTextColor={TEXT_MUTED}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={4}
        />
        <Pressable
          style={[styles.checkBtn, !input.trim() && styles.checkBtnDisabled]}
          onPress={handleCheck}
          disabled={!input.trim()}
        >
          <Text style={styles.checkBtnText}>Check for bias patterns</Text>
        </Pressable>

        {lastDetected && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              {lastDetected.detected.length === 0
                ? 'No patterns matched'
                : `Matched ${lastDetected.detected.length} pattern${lastDetected.detected.length === 1 ? '' : 's'}`}
            </Text>
            {lastDetected.detected.length === 0 ? (
              <Text style={styles.noMatch}>
                None of the library patterns matched. Try the Library to see what we look for.
              </Text>
            ) : (
              lastDetected.detected.map((d) => (
                <Pressable
                  key={d.biasId}
                  style={({ pressed }) => [styles.detectedCard, pressed && styles.cardPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/tools/bias-check/library/${d.biasId}`);
                  }}
                >
                  <Text style={styles.detectedName}>{d.biasName}</Text>
                  {d.snippet ? <Text style={styles.detectedSnippet}>"{d.snippet}"</Text> : null}
                  {d.matchedPattern ? (
                    <Text style={styles.detectedPattern}>Matched: {d.matchedPattern}</Text>
                  ) : null}
                  <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} style={styles.detectedChevron} />
                </Pressable>
              ))
            )}
          </View>
        )}

        {entries.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent checks</Text>
            {entries.slice(0, 5).map((e) => (
              <Pressable
                key={e.id}
                style={({ pressed }) => [styles.entryCard, pressed && styles.cardPressed]}
                onPress={() => {
                  setInput(e.inputText);
                  setLastDetected({ detected: e.detected });
                }}
              >
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {e.inputText}
                </Text>
                <Text style={styles.entryMeta}>
                  {formatDate(e.createdAt)} · {e.detected.length} pattern{e.detected.length === 1 ? '' : 's'} matched
                </Text>
              </Pressable>
            ))}
          </>
        )}
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  libraryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  libraryText: { fontSize: 15, color: TEXT, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, marginBottom: SPACING.lg },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  checkBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkBtnDisabled: { opacity: 0.5 },
  checkBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultSection: { marginBottom: SPACING.xl },
  resultTitle: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  noMatch: { fontSize: 14, color: TEXT_MUTED },
  detectedCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  detectedName: { fontSize: 16, fontWeight: '600', color: TEXT, width: '100%', marginBottom: 4 },
  detectedSnippet: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', width: '100%', marginBottom: 2 },
  detectedPattern: { fontSize: 12, color: TEXT_MUTED, width: '100%' },
  detectedChevron: { position: 'absolute', right: 12, top: '50%', marginTop: -9 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: SPACING.sm },
  entryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  entryPreview: { fontSize: 14, color: TEXT },
  entryMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 6 },
});
