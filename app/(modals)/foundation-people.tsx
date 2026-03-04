/**
 * Foundation: Connection Compass
 * Setup flow for defining key relationships (Connection anchor)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useFoundationStore, ConnectionFrequency, RelationshipType } from '../../src/stores/foundationStore';

type Step = 'intro' | 'add' | 'intentions' | 'done';
const MIN_PEOPLE = 3;
const MAX_PEOPLE = 7;

const RELATIONSHIP_TYPES: Array<{ type: RelationshipType; label: string; emoji: string }> = [
  { type: 'partner', label: 'Partner', emoji: '💕' },
  { type: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { type: 'friend', label: 'Friend', emoji: '👋' },
  { type: 'mentor', label: 'Mentor', emoji: '🎓' },
  { type: 'colleague', label: 'Colleague', emoji: '💼' },
  { type: 'other', label: 'Other', emoji: '✨' },
];

const FREQUENCY_OPTIONS: Array<{ value: ConnectionFrequency; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'asNeeded', label: 'As needed' },
];

interface NewPerson { name: string; type: RelationshipType; frequency: ConnectionFrequency; intention: string; }
const defaultPerson: NewPerson = { name: '', type: 'friend', frequency: 'weekly', intention: '' };

export default function FoundationPeopleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const existingPeople = useFoundationStore((s) => s.keyPeople);
  const addKeyPerson = useFoundationStore((s) => s.addKeyPerson);
  const removeKeyPerson = useFoundationStore((s) => s.removeKeyPerson);
  const markConnectionReviewed = useFoundationStore((s) => s.markConnectionReviewed);
  
  const [step, setStep] = useState<Step>(existingPeople.length > 0 ? 'add' : 'intro');
  const [people, setPeople] = useState<NewPerson[]>(existingPeople.map((p) => ({ name: p.name, type: p.type, frequency: p.frequency, intention: p.intention || '' })));
  const [currentPerson, setCurrentPerson] = useState<NewPerson>({ ...defaultPerson });
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentIntentionIndex, setCurrentIntentionIndex] = useState(0);

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step === 'intro') setStep('add');
    else if (step === 'add' && people.length >= MIN_PEOPLE) { setCurrentIntentionIndex(0); setStep('intentions'); }
    else if (step === 'intentions') {
      existingPeople.forEach((p) => removeKeyPerson(p.id));
      people.forEach((p) => addKeyPerson({ name: p.name, type: p.type, frequency: p.frequency, intention: p.intention || undefined }));
      markConnectionReviewed();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('done');
    }
  };

  const handleAddPerson = () => {
    if (currentPerson.name.trim() && people.length < MAX_PEOPLE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPeople((prev) => [...prev, { ...currentPerson, name: currentPerson.name.trim() }]);
      setCurrentPerson({ ...defaultPerson });
      setShowAddForm(false);
    }
  };

  const handleRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPeople((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFrequencyChange = (freq: ConnectionFrequency) => {
    setPeople((prev) => {
        const updated = [...prev];
        updated[currentIntentionIndex] = { ...updated[currentIntentionIndex], frequency: freq };
        return updated;
      });
    };
  
    const handleIntentionChange = (text: string) => {
      setPeople((prev) => {
        const updated = [...prev];
        updated[currentIntentionIndex] = { ...updated[currentIntentionIndex], intention: text };
        return updated;
      });
    };
  
    const handleNextIntention = () => {
      if (currentIntentionIndex < people.length - 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentIntentionIndex((prev) => prev + 1);
      } else handleNext();
    };
  
    const canProceed = step === 'add' ? people.length >= MIN_PEOPLE : true;
    const currentPersonForIntention = people[currentIntentionIndex];
    return
    (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Pressable onPress={handleClose}><Ionicons name="close" size={24} color="#FFF" /></Pressable>
            <Text style={styles.headerTitle}>{step === 'intro' ? 'Your People' : step === 'add' ? 'Inner Circle' : step === 'intentions' ? 'Connection Goals' : 'All Set!'}</Text>
            <View style={{ width: 24 }} />
          </View>
    
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {step === 'intro' && (
                <View style={styles.stepContainer}>
                  <Text style={styles.emoji}>💜</Text>
                  <Text style={styles.title}>Who Matters Most?</Text>
                  <Text style={styles.subtitle}>Connection isn't about how many people you know.{'\n\n'}It's about how deeply you invest in the ones who matter.</Text>
                  <View style={styles.card}><Text style={styles.cardText}>Your inner circle: the {MIN_PEOPLE}-{MAX_PEOPLE} people you want to stay connected to.</Text></View>
                </View>
              )}
    
              {step === 'add' && (
                <View style={styles.stepContainer}>
                  <Text style={styles.title}>Your Inner Circle</Text>
                  <Text style={styles.countText}>{people.length}/{MAX_PEOPLE} people {people.length < MIN_PEOPLE && `(need ${MIN_PEOPLE - people.length} more)`}</Text>
                  
                  {people.length > 0 && (
                    <View style={styles.peopleList}>
                      {people.map((p, index) => {
                        const typeEmoji = RELATIONSHIP_TYPES.find((t) => t.type === p.type)?.emoji || '👤';
                        return (
                          <View key={index} style={styles.personCard}>
                            <Text style={styles.personEmoji}>{typeEmoji}</Text>
                            <View style={styles.personInfo}><Text style={styles.personName}>{p.name}</Text><Text style={styles.personType}>{p.type}</Text></View>
                            <Pressable onPress={() => handleRemove(index)}><Ionicons name="close-circle" size={22} color="#666" /></Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}
    
                  {people.length < MAX_PEOPLE && (
                    !showAddForm ? (
                      <Pressable style={styles.addTrigger} onPress={() => setShowAddForm(true)}>
                        <Ionicons name="add-circle" size={24} color="#C4B5FD" /><Text style={styles.addTriggerText}>Add a person</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.addForm}>
                        <Text style={styles.addFormLabel}>Name</Text>
                        <TextInput style={styles.nameInput} placeholder="Their name..." placeholderTextColor="#666" value={currentPerson.name} onChangeText={(t) => setCurrentPerson((p) => ({ ...p, name: t }))} autoFocus maxLength={30} />
                        <Text style={styles.addFormLabel}>Relationship</Text>
                        <View style={styles.typeGrid}>
                          {RELATIONSHIP_TYPES.map((t) => (
                            <Pressable key={t.type} style={[styles.typeChip, currentPerson.type === t.type && styles.typeChipSelected]} onPress={() => setCurrentPerson((p) => ({ ...p, type: t.type }))}>
                              <Text style={styles.typeEmoji}>{t.emoji}</Text><Text style={[styles.typeLabel, currentPerson.type === t.type && styles.typeLabelSelected]}>{t.label}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <View style={styles.addFormActions}>
                          <Pressable style={styles.cancelBtn} onPress={() => { setShowAddForm(false); setCurrentPerson({ ...defaultPerson }); }}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
                      <Pressable style={[styles.confirmBtn, !currentPerson.name.trim() && { opacity: 0.4 }]} onPress={handleAddPerson} disabled={!currentPerson.name.trim()}><Text style={styles.confirmBtnText}>Add</Text></Pressable>
                    </View>
                  </View>
                )
              )}
            </View>
          )}

          {step === 'intentions' && currentPersonForIntention && (
            <View style={styles.stepContainer}>
              <Text style={styles.intentionProgress}>{currentIntentionIndex + 1} of {people.length}</Text>
              <Text style={styles.intentionEmoji}>{RELATIONSHIP_TYPES.find((t) => t.type === currentPersonForIntention.type)?.emoji || '👤'}</Text>
              <Text style={styles.title}>{currentPersonForIntention.name}</Text>
              <Text style={styles.subtitle}>How often do you want to connect?</Text>
              <View style={styles.frequencyList}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <Pressable key={f.value} style={[styles.frequencyOption, currentPersonForIntention.frequency === f.value && styles.frequencyOptionSelected]} onPress={() => handleFrequencyChange(f.value)}>
                    <Text style={[styles.frequencyLabel, currentPersonForIntention.frequency === f.value && styles.frequencyLabelSelected]}>{f.label}</Text>
                    {currentPersonForIntention.frequency === f.value && <Ionicons name="checkmark-circle" size={22} color="#C4B5FD" />}
                  </Pressable>
                ))}
              </View>
              <Text style={styles.addFormLabel}>Intention (optional)</Text>
              <TextInput style={styles.intentionInput} placeholder="e.g., Call on Sundays..." placeholderTextColor="#666" value={currentPersonForIntention.intention} onChangeText={handleIntentionChange} maxLength={60} />
            </View>
          )}

          {step === 'done' && (
            <View style={styles.stepContainer}>
              <Text style={styles.emoji}>💜</Text>
              <Text style={styles.title}>Your Circle Is Set</Text>
              <View style={styles.peopleDisplay}>
                {people.map((p, i) => (
                  <View key={i} style={styles.personDisplayCard}>
                    <Text style={styles.personDisplayEmoji}>{RELATIONSHIP_TYPES.find((t) => t.type === p.type)?.emoji || '👤'}</Text>
                    <View style={styles.personDisplayInfo}>
                      <Text style={styles.personDisplayName}>{p.name}</Text>
                      <Text style={styles.personDisplayFreq}>{FREQUENCY_OPTIONS.find((f) => f.value === p.frequency)?.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.card}><Text style={styles.cardText}>These will appear during your Connection check-in.</Text></View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]} onPress={step === 'done' ? handleClose : step === 'intentions' ? handleNextIntention : handleNext} disabled={!canProceed}>
            <Text style={styles.primaryBtnText}>{step === 'intro' ? "Identify My People" : step === 'done' ? 'Done' : step === 'intentions' && currentIntentionIndex < people.length - 1 ? 'Next Person' : 'Continue'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles =StyleSheet.create({
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
    countText: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
    peopleList: { width: '100%', gap: 10, marginBottom: 16 },
    personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, gap: 12 },
    personEmoji: { fontSize: 28 },
    personInfo: { flex: 1 },
    personName: { fontSize: 16, fontWeight: '600', color: '#FFF' },
    personType: { fontSize: 13, color: '#666', textTransform: 'capitalize' },
    addTrigger: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
    addTriggerText: { fontSize: 16, color: '#C4B5FD', fontWeight: '500' },
    addForm: { width: '100%', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20 },
    addFormLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 12 },
    nameInput: { backgroundColor: '#0A0A0F', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: '#0A0A0F' },
    typeChipSelected: { backgroundColor: '#C4B5FD22', borderWidth: 1, borderColor: '#C4B5FD' },
    typeEmoji: { fontSize: 16 },
    typeLabel: { fontSize: 14, color: '#9CA3AF' },
    typeLabelSelected: { color: '#C4B5FD', fontWeight: '600' },
    addFormActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#0A0A0F' },
    cancelBtnText: { fontSize: 15, color: '#666' },
    confirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#C4B5FD' },
    confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#000' },
    intentionProgress: { fontSize: 14, color: '#666', marginBottom: 8 },
    intentionEmoji: { fontSize: 48, marginBottom: 8 },
    frequencyList: { width: '100%', gap: 8, marginBottom: 20 },
    frequencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16 },
    frequencyOptionSelected: { backgroundColor: '#C4B5FD15', borderWidth: 1, borderColor: '#C4B5FD' },
    frequencyLabel: { fontSize: 16, color: '#FFF' },
    frequencyLabelSelected: { color: '#C4B5FD' },
    intentionInput: { width: '100%', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFF' },
    peopleDisplay: { width: '100%', gap: 12, marginVertical: 20 },
    personDisplayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, gap: 12, borderLeftWidth: 3, borderLeftColor: '#C4B5FD' },
    personDisplayEmoji: { fontSize: 32 },
    personDisplayInfo: { flex: 1 },
    personDisplayName: { fontSize: 17, fontWeight: '600', color: '#FFF' },
    personDisplayFreq: { fontSize: 13, color: '#C4B5FD', marginTop: 2 },
    bottomContainer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1A1A2E' },
    primaryBtn: { backgroundColor: '#C4B5FD', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.4 },
    primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#000' },
  });
  