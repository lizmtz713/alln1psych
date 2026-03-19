/**
 * Memory Builder — Single exercise: Name Lock, Face Anchor, Quick Recall, Spaced Reminder, etc.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
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

export default function MemoryBuilderExerciseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ exercise: string; personId?: string }>();
  const exercise = params.exercise;
  const personId = params.personId;

  // Select raw state + methods separately to avoid infinite loop
  const people = useMemoryBuilderStore((s) => s.people);
  const getPersonById = useMemoryBuilderStore((s) => s.getPersonById);
  const getPeopleDueForRecall = useMemoryBuilderStore((s) => s.getPeopleDueForRecall);
  const recordRecall = useMemoryBuilderStore((s) => s.recordRecall);

  const [step, setStep] = useState(0); // 0 = show name, 1 = hidden (recall), 2 = revealed
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [featurePicked, setFeaturePicked] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Resolve person(s) for this exercise
  const targetPerson = personId ? getPersonById(personId) : (exercise === 'spaced-reminder' ? getPeopleDueForRecall()[0] : people[0]);
  const othersForQuickRecall = people.filter((p) => p.id !== targetPerson?.id).slice(0, 2);
  const choices = targetPerson
    ? [targetPerson.name, ...othersForQuickRecall.map((p) => p.name)].sort(() => Math.random() - 0.5).slice(0, 3)
    : [];

  const onCorrect = () => {
    if (targetPerson) recordRecall(targetPerson.id);
  };

  if (!exercise) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Practice</Text>
          <View style={styles.backBtn} />
        </View>
      </View>
    );
  }

  // Real-Life: just a tip screen
  if (exercise === 'real-life') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Real-Life Practice</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.tipBlock}>
            Next time you meet someone, repeat their name once in conversation.
          </Text>
          <Text style={styles.tipExample}>"Nice to meet you, Alex."</Text>
          <Text style={styles.tipBody}>
            This technique alone improves recall dramatically. The brain encodes what we say and hear.
          </Text>
          <Pressable style={styles.doneBtn} onPress={handleBack}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Spaced reminder with no one due
  if (exercise === 'spaced-reminder' && !targetPerson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Spaced Reminder</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No one due right now</Text>
          <Text style={styles.emptyBody}>When someone is due for recall, they'll appear here.</Text>
          <Pressable style={styles.doneBtn} onPress={handleBack}>
            <Text style={styles.doneBtnText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Name Lock / Face Anchor / Spaced Reminder (recall one person)
  if ((exercise === 'name-lock' || exercise === 'face-anchor' || exercise === 'spaced-reminder') && targetPerson) {
    const prompt = exercise === 'spaced-reminder'
      ? `Do you remember the name of the person you met${targetPerson.whereMet ? ` at ${targetPerson.whereMet}` : ''}?`
      : exercise === 'face-anchor'
      ? 'Notice one unique feature. What feature helps you remember them?'
      : 'Say the name out loud. Create a quick mental image. Then tap to hide and recall.';
    const showName = exercise === 'name-lock' || exercise === 'spaced-reminder';

    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {exercise === 'name-lock' ? 'Name Lock' : exercise === 'face-anchor' ? 'Face Anchor' : 'Spaced Reminder'}
          </Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarBlock}>
            {targetPerson.photoUri ? (
              <Image source={{ uri: targetPerson.photoUri }} style={styles.bigAvatar} />
            ) : (
              <View style={styles.bigAvatarPlaceholder}>
                <Text style={styles.bigAvatarText}>
                  {step === 1 ? '?' : step === 2 ? targetPerson.name : getInitials(targetPerson.name)}
                </Text>
              </View>
            )}
          </View>
          {showName && step === 0 && (
            <View style={styles.nameBlock}>
              <Text style={styles.nameLabel}>Name</Text>
              <Text style={styles.nameValue}>{targetPerson.name}</Text>
              {targetPerson.detail && <Text style={styles.detailValue}>{targetPerson.detail}</Text>}
            </View>
          )}
          {showName && step === 1 && (
            <Text style={styles.promptText}>What was their name?</Text>
          )}
          {showName && step === 2 && (
            <View style={styles.nameBlock}>
              <Text style={styles.nameValue}>{targetPerson.name}</Text>
            </View>
          )}
          {step === 0 && <Text style={styles.promptText}>{prompt}</Text>}
          {exercise === 'face-anchor' && (
            <View style={styles.featureRow}>
              {['glasses', 'curly hair', 'smile', 'beard'].map((f) => (
                <Pressable
                  key={f}
                  style={[styles.featureChip, featurePicked === f && styles.featureChipPicked]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFeaturePicked(f);
                  }}
                >
                  <Text style={[styles.featureChipText, featurePicked === f && styles.featureChipTextPicked]}>{f}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            style={styles.revealBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (step === 0) setStep(1);
              else if (step === 1) setStep(2);
              else {
                onCorrect();
                handleBack();
              }
            }}
          >
            <Text style={styles.revealBtnText}>
              {step === 0 ? 'Hide name & recall' : step === 1 ? 'Reveal name' : 'Done'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Association Builder (generic: show "Baker" → what image?)
  if (exercise === 'association-builder') {
    const sampleName = targetPerson?.name || 'Baker';
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Association Builder</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.promptText}>Name: {sampleName}</Text>
          <Text style={styles.promptSub}>What image comes to mind? (e.g. bread, bakery, chef)</Text>
          <Text style={styles.tipBody}>
            The brain remembers images better than abstract words. Linking a name to a vivid image strengthens recall.
          </Text>
          <Pressable style={styles.doneBtn} onPress={handleBack}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Quick Recall: multiple choice
  if (exercise === 'quick-recall' && targetPerson && choices.length >= 3) {
    const correct = targetPerson.name;
    const isCorrect = selectedName === correct;
    const done = selectedName !== null;

    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Quick Recall</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.promptText}>Who did you meet?</Text>
          <View style={styles.avatarBlock}>
            {targetPerson.photoUri ? (
              <Image source={{ uri: targetPerson.photoUri }} style={styles.bigAvatar} />
            ) : (
              <View style={styles.bigAvatarPlaceholder}>
                <Text style={styles.bigAvatarText}>{getInitials(targetPerson.name)}</Text>
              </View>
            )}
          </View>
          {choices.map((name) => (
            <Pressable
              key={name}
              style={[
                styles.choiceBtn,
                selectedName === name && (name === correct ? styles.choiceBtnCorrect : styles.choiceBtnWrong),
                done && name === correct && styles.choiceBtnCorrect,
              ]}
              onPress={() => {
                if (selectedName !== null) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedName(name);
                if (name === correct) onCorrect();
              }}
            >
              <Text style={styles.choiceBtnText}>{name}</Text>
            </Pressable>
          ))}
          {done && (
            <Text style={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
              {isCorrect ? 'Correct!' : `It was ${correct}.`}
            </Text>
          )}
          <Pressable style={styles.doneBtn} onPress={handleBack}>
            <Text style={styles.doneBtnText}>Back</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Fallback: no people
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.centered}>
        <Text style={styles.emptyBody}>Add people you've met first.</Text>
        <Pressable style={styles.doneBtn} onPress={handleBack}>
          <Text style={styles.doneBtnText}>Back</Text>
        </Pressable>
      </View>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  bigAvatar: { width: 140, height: 140, borderRadius: 70 },
  bigAvatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: { fontSize: 48, fontWeight: '700', color: ACCENT },
  nameBlock: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  nameLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 4 },
  nameValue: { fontSize: 22, fontWeight: '700', color: TEXT },
  detailValue: { fontSize: 14, color: TEXT_MUTED, marginTop: 6 },
  promptText: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 8, textAlign: 'center' },
  promptSub: { fontSize: 15, color: TEXT_MUTED, marginBottom: 16, textAlign: 'center' },
  tipBlock: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 12, textAlign: 'center' },
  tipExample: { fontSize: 16, fontStyle: 'italic', color: ACCENT, marginBottom: 16, textAlign: 'center' },
  tipBody: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, justifyContent: 'center' },
  featureChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  featureChipPicked: { backgroundColor: COLORS.accentBg, borderColor: ACCENT },
  featureChipText: { fontSize: 15, color: TEXT },
  featureChipTextPicked: { color: ACCENT, fontWeight: '600' },
  revealBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 8,
  },
  revealBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  revealedBlock: { marginTop: 16, alignItems: 'center' },
  revealedName: { fontSize: 24, fontWeight: '700', color: TEXT },
  choiceBtn: {
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
    alignItems: 'center',
  },
  choiceBtnCorrect: { borderColor: COLORS.success, backgroundColor: 'rgba(74, 222, 128, 0.15)' },
  choiceBtnWrong: { borderColor: COLORS.error, backgroundColor: 'rgba(239, 83, 80, 0.1)' },
  choiceBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
  feedbackCorrect: { fontSize: 16, fontWeight: '700', color: COLORS.success, marginTop: 12, textAlign: 'center' },
  feedbackWrong: { fontSize: 16, color: COLORS.error, marginTop: 12, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 8 },
  emptyBody: { fontSize: 15, color: TEXT_MUTED, marginBottom: 20, textAlign: 'center' },
  doneBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 24,
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
