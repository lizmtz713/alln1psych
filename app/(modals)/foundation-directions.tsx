/**
 * Foundation: Direction Map
 * Setup flow for defining life directions (Direction anchor)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useFoundationStore } from '../../src/stores/foundationStore';

type Step = 'intro' | 'add' | 'why' | 'done';
const MIN_DIRECTIONS = 1;
const MAX_DIRECTIONS = 3;

const EXAMPLES = [
  { cat: 'Career', items: ['Get promoted', 'Start freelancing', 'Learn new skills'] },
  { cat: 'Learning', items: ['Learn to code', 'Get certified', 'Learn a language'] },
  { cat: 'Health', items: ['Lose weight', 'Run a 5K', 'Sleep better'] },
  { cat: 'Creative', items: ['Write a book', 'Learn guitar', 'Start a podcast'] },
];

export default function FoundationDirectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const existingDirections = useFoundationStore((s) => s.directions.filter((d) => d.status === 'active'));
  const addDirection = useFoundationStore((s) => s.addDirection);
  const removeDirection = useFoundationStore((s) => s.removeDirection);
  const markDirectionsReviewed = useFoundationStore((s) => s.markDirectionsReviewed);
  
  const [step, setStep] = useState<Step>(existingDirections.length > 0 ? 'add' : 'intro');
  const [newDirections, setNewDirections] = useState<Array<{ title: string; why: string }>>(
    existingDirections.map((d) => ({ title: d.title, why: d.why || '' }))
  );
  const [currentWhyIndex, setCurrentWhyIndex] = useState(0);
  const [newTitle, setNewTitle] = useState('');

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step === 'intro') setStep('add');
    else if (step === 'add' && newDirections.length >= MIN_DIRECTIONS) { setCurrentWhyIndex(0); setStep('why'); }
    else if (step === 'why') {
      existingDirections.forEach((d) => removeDirection(d.id));
      newDirections.forEach((d) => addDirection(d.title, d.why || undefined));
      markDirectionsReviewed();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');
    }
  };

  const handleAddDirection = () => {
    const trimmed = newTitle.trim();
    if (trimmed && newDirections.length < MAX_DIRECTIONS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setNewDirections((prev) => [...prev, { title: trimmed, why: '' }]);
      setNewTitle('');
    }
  };

  const handleRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewDirections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExampleTap = (example: string) => {
    if (newDirections.length < MAX_DIRECTIONS && !newDirections.some((d) => d.title === example)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setNewDirections((prev) => [...prev, { title: example, why: '' }]);
    }
  };

  const handleWhyChange = (text: string) => {
    setNewDirections((prev) => {
      const updated = [...prev];
      updated[currentWhyIndex] = { ...updated[currentWhyIndex], why: text };
      return updated;
    });
  };

  const handleNextWhy = () => {
    if (currentWhyIndex < newDirections.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentWhyIndex((prev) => prev + 1);
    } else handleNext();
  };

  const canProceed = step === 'add' ? newDirections.length >= MIN_DIRECTIONS : true;
  const currentDirection = newDirections[currentWhyIndex];
  return
  (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose}><Ionicons name="close" size={24} color="#FFF" /></Pressable>
        <Text style={styles.headerTitle}>{step === 'intro' ? 'Your Direction' : step === 'add' ? 'Set Directions' : step === 'why' ? 'Why It Matters' : 'All Set!'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {step === 'intro' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🧭</Text>
              <Text style={styles.title}>Where Are You Headed?</Text>
              <Text style={styles.subtitle}>Direction isn't about having your whole life figured out.{'\n\n'}It's about having SOMETHING you're moving toward.</Text>
              <View style={styles.card}><Text style={styles.cardText}>Even one clear direction beats drifting.</Text></View>
            </View>
          )}

          {step === 'add' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What are you working toward?</Text>
              <Text style={styles.subtitle}>Set {MIN_DIRECTIONS}-{MAX_DIRECTIONS} directions (not a bucket list)</Text>
              
              {newDirections.length > 0 && (
                <View style={styles.currentList}>
                  {newDirections.map((d, index) => (
                    <View key={index} style={styles.directionCard}>
                      <View style={styles.directionNumber}><Text style={styles.directionNumberText}>{index + 1}</Text></View>
                      <Text style={styles.directionTitle}>{d.title}</Text>
                      <Pressable onPress={() => handleRemove(index)}><Ionicons name="close-circle" size={22} color="#666" /></Pressable>
                    </View>
                  ))}
                </View>
              )}

              {newDirections.length < MAX_DIRECTIONS && (
                <>
                  <View style={styles.addInputRow}>
                    <TextInput style={styles.addInput} placeholder="e.g., Learn Spanish..." placeholderTextColor="#666" value={newTitle} onChangeText={setNewTitle} maxLength={50} onSubmitEditing={handleAddDirection} />
                    <Pressable style={[styles.addBtn, !newTitle.trim() && { opacity: 0.5 }]} onPress={handleAddDirection} disabled={!newTitle.trim()}>
                      <Ionicons name="add" size={24} color={newTitle.trim() ? '#FFF' : '#666'} />
                    </Pressable>
                  </View>
                  <Text style={styles.examplesLabel}>Or tap an example:</Text>
                  {EXAMPLES.map((cat) => (
                    <View key={cat.cat} style={styles.exampleCategory}>
                      <Text style={styles.exampleCatLabel}>{cat.cat}</Text>
                      <View style={styles.exampleChips}>
                        {cat.items.map((ex) => {
                          const isAdded = newDirections.some((d) => d.title === ex);
                          return (
                            <Pressable key={ex} style={[styles.exampleChip, isAdded && styles.exampleChipAdded]} onPress={() => handleExampleTap(ex)} disabled={isAdded}>
                              <Text style={[styles.exampleChipText, isAdded && styles.exampleChipTextAdded]}>{ex}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {step === 'why' && currentDirection && (
            <View style={styles.stepContainer}>
              <Text style={styles.whyProgress}>{currentWhyIndex + 1} of {newDirections.length}</Text>
              <Text style={styles.title}>"{currentDirection.title}"</Text>
              <Text style={styles.subtitle}>Why does this matter to you?</Text>
              <TextInput style={styles.whyInput} placeholder="What will this give you?" placeholderTextColor="#666" value={currentDirection.why} onChangeText={handleWhyChange} multiline maxLength={200} textAlignVertical="top" />
              <Pressable style={styles.skipLink} onPress={handleNextWhy}><Text style={styles.skipLinkText}>Skip this one</Text></Pressable>
            </View>
          )}

          {step === 'done' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.title}>Directions Set</Text>
              <View style={styles.directionsDisplay}>
                {newDirections.map((d, i) => (
                  <View key={i} style={styles.directionDisplayCard}>
                    <Text style={styles.directionDisplayTitle}>{d.title}</Text>
                    {d.why && <Text style={styles.directionDisplayWhy}>"{d.why}"</Text>}
                  </View>
                ))}
              </View>
              <View style={styles.card}><Text style={styles.cardText}>These will appear during your Direction check-in.</Text></View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]} onPress={step === 'done' ? handleClose : step === 'why' ? handleNextWhy : handleNext} disabled={!canProceed}>
            <Text style={styles.primaryBtnText}>{step === 'intro' ? "Set My Directions" : step === 'done' ? 'Done' : step === 'why' && currentWhyIndex < newDirections.length - 1 ? 'Next' : 'Continue'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0F' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#FFF' },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    stepContainer: { alignItems: 'center' },
    emoji: { fontSize: 64, marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
    card: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20, width: '100%' },
    cardText: { fontSize: 15, color: '#9CA3AF', lineHeight: 22, textAlign: 'center' },
    currentList: { width: '100%', marginBottom: 20 },
    directionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, marginBottom: 10, gap: 12 },
    directionNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#86EFAC33', alignItems: 'center', justifyContent: 'center' },
    directionNumberText: { fontSize: 14, fontWeight: '700', color: '#86EFAC' },
    directionTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#FFF' },
    addInputRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
    addInput: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF' },
    addBtn: { width: 50, backgroundColor: '#1A1A2E', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    examplesLabel: { fontSize: 14, color: '#666', marginBottom: 12, alignSelf: 'flex-start' },
    exampleCategory: { width: '100%', marginBottom: 16 },
    exampleCatLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
    exampleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    exampleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#1A1A2E' },
    exampleChipAdded: { backgroundColor: '#86EFAC22', borderWidth: 1, borderColor: '#86EFAC' },
    exampleChipText: { fontSize: 13, color: '#9CA3AF' },
    exampleChipTextAdded: { color: '#86EFAC' },
    whyProgress: { fontSize: 14, color: '#666', marginBottom: 8 },
    whyInput: { width: '100%', minHeight: 120, backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, fontSize: 16, color: '#FFF', lineHeight: 24 },
    skipLink: { marginTop: 16 },
    skipLinkText: { fontSize: 15, color: '#666' },
    directionsDisplay: { width: '100%', gap: 12, marginVertical: 20 },
    directionDisplayCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#86EFAC' },
    directionDisplayTitle: { fontSize: 17, fontWeight: '600', color: '#FFF', marginBottom: 4 },
    directionDisplayWhy: { fontSize: 14, color: '#666', fontStyle: 'italic' },
    bottomContainer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1A1A2E' },
    primaryBtn: { backgroundColor: '#86EFAC', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.4 },
    primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#000' },
  });
  