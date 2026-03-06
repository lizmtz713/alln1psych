/**
 * Foundation: Values Workshop
 * Setup flow for defining personal values (Alignment anchor)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/stores/userStore';
import { useFoundationStore, SUGGESTED_VALUES } from '../../src/stores/foundationStore';

type Step = 'intro' | 'select' | 'prioritize' | 'done';
const MIN_VALUES = 3;
const MAX_VALUES = 5;

export default function FoundationValuesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const existingValues = useUserStore((s) => s.values);
  const setValues = useUserStore((s) => s.setValues);
  const setValuesPriority = useFoundationStore((s) => s.setValuesPriority);
  const markValuesSet = useFoundationStore((s) => s.markValuesSet);
  
  const [step, setStep] = useState<Step>(existingValues.length > 0 ? 'select' : 'intro');
  const [selectedValues, setSelectedValues] = useState<string[]>(existingValues);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [prioritizedValues, setPrioritizedValues] = useState<string[]>([]);

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step === 'intro') setStep('select');
    else if (step === 'select') { setPrioritizedValues([...selectedValues]); setStep('prioritize'); }
    else if (step === 'prioritize') {
      setValues(selectedValues);
      setValuesPriority(prioritizedValues);
      markValuesSet();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');
    }
  };

  const handleSelectValue = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedValues((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= MAX_VALUES) return prev;
      return [...prev, value];
    });
  };

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (trimmed && selectedValues.length < MAX_VALUES && !selectedValues.includes(trimmed)) {
      setSelectedValues((prev) => [...prev, trimmed]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrioritizedValues((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr;
    });
  };

  const canProceed = step === 'select' ? selectedValues.length >= MIN_VALUES : true;
  return
  (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose}><Ionicons name="close" size={24} color="#FFF" /></Pressable>
        <Text style={styles.headerTitle}>{step === 'intro' ? 'Your Values' : step === 'select' ? 'Select Values' : step === 'prioritize' ? 'Prioritize' : 'All Set!'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {step === 'intro' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>💎</Text>
              <Text style={styles.title}>What Do You Actually Value?</Text>
              <Text style={styles.subtitle}>Not what you think you should value.{'\n'}What actually matters to YOU.</Text>
              <View style={styles.card}><Text style={styles.cardText}>Your values are your compass. When you're aligned with them, you feel whole.</Text></View>
            </View>
          )}

          {step === 'select' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Pick {MIN_VALUES}-{MAX_VALUES} values</Text>
              <Text style={styles.countText}>{selectedValues.length}/{MAX_VALUES} selected</Text>
              {selectedValues.length > 0 && (
                <View style={styles.selectedRow}>
                  {selectedValues.map((v) => (
                    <Pressable key={v} style={styles.selectedChip} onPress={() => handleSelectValue(v)}>
                      <Text style={styles.selectedChipText}>{v}</Text>
                      <Ionicons name="close" size={16} color="#FFF" />
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.valueGrid}>
                {SUGGESTED_VALUES.map((value) => (
                  <Pressable key={value} style={[styles.valueChip, selectedValues.includes(value) && styles.valueChipSelected]} onPress={() => handleSelectValue(value)}>
                    <Text style={[styles.valueChipText, selectedValues.includes(value) && styles.valueChipTextSelected]}>{value}</Text>
                  </Pressable>
                ))}
              </View>
              {!showCustomInput ? (
                <Pressable style={styles.addCustomBtn} onPress={() => setShowCustomInput(true)}>
                  <Ionicons name="add" size={20} color="#60A5FA" /><Text style={styles.addCustomText}>Add your own</Text>
                </Pressable>
              ) : (
                <View style={styles.customInputRow}>
                  <TextInput style={styles.customInput} placeholder="Your value..." placeholderTextColor="#666" value={customValue} onChangeText={setCustomValue} autoFocus maxLength={30} onSubmitEditing={handleAddCustom} />
                  <Pressable style={styles.customAddBtn} onPress={handleAddCustom}><Text style={styles.customAddBtnText}>Add</Text></Pressable>
                </View>
              )}
            </View>
          )}

          {step === 'prioritize' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Rank by importance</Text>
              <View style={styles.priorityList}>
                {prioritizedValues.map((value, index) => (
                  <View key={value} style={styles.priorityRow}>
                    <View style={styles.priorityRank}><Text style={styles.priorityRankText}>{index + 1}</Text></View>
                    <Text style={styles.priorityValue}>{value}</Text>
                    <Pressable onPress={() => handleMovePriority(index, 'up')} disabled={index === 0}><Ionicons name="chevron-up" size={20} color={index === 0 ? '#444' : '#FFF'} /></Pressable>
                    <Pressable onPress={() => handleMovePriority(index, 'down')} disabled={index === prioritizedValues.length - 1}><Ionicons name="chevron-down" size={20} color={index === prioritizedValues.length - 1 ? '#444' : '#FFF'} /></Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}
  
            {step === 'done' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={styles.title}>Your Values Are Set</Text>
                <View style={styles.valuesDisplay}>
                  {prioritizedValues.map((v, i) => (<Text key={v} style={[styles.valueDisplayText, i === 0 && styles.valueDisplayTextFirst]}>{i === 0 ? '👑 ' : ''}{v}</Text>))}
                </View>
                <View style={styles.card}><Text style={styles.cardText}>These will appear during your Alignment check-in.</Text></View>
              </View>
            )}
          </ScrollView>
  
          <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]} onPress={step === 'done' ? handleClose : handleNext} disabled={!canProceed}>
              <Text style={styles.primaryBtnText}>{step === 'intro' ? "Let's Find Out" : step === 'done' ? 'Done' : 'Continue'}</Text>
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
    card: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20, width: '100%', marginBottom: 16 },
    cardText: { fontSize: 15, color: '#9CA3AF', lineHeight: 22, textAlign: 'center' },
    countText: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
    selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
    selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#60A5FA33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#60A5FA' },
    selectedChipText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
    valueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
    valueChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1A1A2E' },
    valueChipSelected: { backgroundColor: '#60A5FA22', borderWidth: 1, borderColor: '#60A5FA' },
    valueChipText: { fontSize: 14, color: '#9CA3AF' },
    valueChipTextSelected: { color: '#FFF', fontWeight: '600' },
    addCustomBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
    addCustomText: { fontSize: 15, color: '#60A5FA', fontWeight: '500' },
    customInputRow: { flexDirection: 'row', gap: 10, width: '100%' },
    customInput: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF' },
    customAddBtn: { backgroundColor: '#60A5FA', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
    customAddBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
    priorityList: { width: '100%', gap: 10 },
    priorityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, gap: 12 },
    priorityRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#60A5FA33', alignItems: 'center', justifyContent: 'center' },
    priorityRankText: { fontSize: 14, fontWeight: '700', color: '#60A5FA' },
    priorityValue: { flex: 1, fontSize: 16, fontWeight: '500', color: '#FFF' },
    valuesDisplay: { marginVertical: 20, gap: 8, alignItems: 'center' },
    valueDisplayText: { fontSize: 18, color: '#9CA3AF' },
    valueDisplayTextFirst: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    bottomContainer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1A1A2E' },
    primaryBtn: { backgroundColor: '#60A5FA', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.4 },
    primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#FFF' },
  });
  