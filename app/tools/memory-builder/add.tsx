/**
 * Memory Builder — Add person: name, where met, detail, optional photo & association.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useMemoryBuilderStore } from '../../../src/stores/memoryBuilderStore';
import { suggestAssociation } from '../../../src/data/memoryBuilder';
import { DISTINCTIVE_FEATURES } from '../../../src/data/memoryBuilder';
import { suggestMemoryHook, hasOpenAIKey } from '../../../src/services/ai';

let ImagePickerModule: typeof import('expo-image-picker') | null = null;
const getImagePicker = async () => {
  if (!ImagePickerModule) {
    try {
      ImagePickerModule = await import('expo-image-picker');
    } catch (e) {
      console.warn('ImagePicker not available:', e);
    }
  }
  return ImagePickerModule;
};

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function MemoryBuilderAddScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addPerson = useMemoryBuilderStore((s) => s.addPerson);

  const [name, setName] = useState('');
  const [whereMet, setWhereMet] = useState('');
  const [detail, setDetail] = useState('');
  const [association, setAssociation] = useState('');
  const [distinctiveFeature, setDistinctiveFeature] = useState<string | undefined>();
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [aiHookLoading, setAiHookLoading] = useState(false);

  const suggested = detail.trim() ? suggestAssociation(name.trim() || 'Name', detail) : '';

  const handleSuggestWithAI = async () => {
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('AI unavailable', 'Your secure AI session is unavailable. Sign in again or try later.');
      return;
    }
    setAiHookLoading(true);
    try {
      const hook = await suggestMemoryHook(name.trim() || 'Name', whereMet.trim() || undefined, detail.trim() || undefined);
      if (hook) setAssociation(hook);
    } catch {
      Alert.alert('Suggestion failed', 'Check your connection and try again.');
    } finally {
      setAiHookLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const pickPhoto = async () => {
    const ImagePicker = await getImagePicker();
    if (!ImagePicker) {
      Alert.alert('Photo', 'Image picker not available on this device.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Allow photo access to add a face photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) setPhotoUri(result.assets[0].uri);
  };

  const save = () => {
    const n = name.trim();
    if (!n) {
      Alert.alert('Name required', 'Enter at least a name.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPerson({
      name: n,
      whereMet: whereMet.trim() || undefined,
      detail: detail.trim() || undefined,
      association: (association || suggested).trim() || undefined,
      distinctiveFeature,
      photoUri,
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Add person</Text>
        <Pressable onPress={save} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Encoding details right after meeting someone improves recall.</Text>

        <View style={styles.photoRow}>
          {photoUri ? (
            <Pressable onPress={pickPhoto} style={styles.photoWrap}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <Text style={styles.photoChange}>Change photo</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.photoPlaceholder} onPress={pickPhoto}>
              <Ionicons name="camera" size={32} color={TEXT_MUTED} />
              <Text style={styles.photoPlaceholderText}>Add photo</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Alex"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Where you met</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Conference"
          placeholderTextColor={COLORS.textMuted}
          value={whereMet}
          onChangeText={setWhereMet}
        />

        <Text style={styles.label}>One memorable detail</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="e.g. Works in climate research"
          placeholderTextColor={COLORS.textMuted}
          value={detail}
          onChangeText={setDetail}
          multiline
        />

        {(name.trim() || suggested) && (
          <>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Memory hook (association)</Text>
              <Pressable style={styles.aiSuggestBtn} onPress={handleSuggestWithAI} disabled={aiHookLoading || !name.trim()}>
                {aiHookLoading ? <ActivityIndicator size="small" color={ACCENT} /> : <Ionicons name="sparkles" size={16} color={ACCENT} />}
                <Text style={styles.aiSuggestBtnText}>{aiHookLoading ? '…' : 'Suggest with AI'}</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder={suggested || 'e.g. Arctic Alex'}
              placeholderTextColor={COLORS.textMuted}
              value={association}
              onChangeText={setAssociation}
            />
            <Text style={styles.smallHint}>e.g. "Arctic Alex" — links name to the detail</Text>
          </>
        )}

        <Text style={styles.label}>Distinctive feature (for face)</Text>
        <View style={styles.chipRow}>
          {DISTINCTIVE_FEATURES.slice(0, 6).map((f) => (
            <Pressable
              key={f}
              style={[styles.chip, distinctiveFeature === f && styles.chipSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDistinctiveFeature((prev) => (prev === f ? undefined : f));
              }}
            >
              <Text style={[styles.chipText, distinctiveFeature === f && styles.chipTextSelected]}>{f}</Text>
            </Pressable>
          ))}
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
  saveBtn: { padding: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: ACCENT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  hint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 16 },
  photoRow: { marginBottom: 20, alignItems: 'center' },
  photoWrap: { alignItems: 'center' },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoChange: { fontSize: 13, color: ACCENT, marginTop: 8 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 13, color: TEXT_MUTED, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 8 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 16,
    color: TEXT,
    marginBottom: 16,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  smallHint: { fontSize: 12, color: TEXT_MUTED, marginTop: -8, marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  aiSuggestBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10 },
  aiSuggestBtnText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipSelected: { backgroundColor: COLORS.accentBg, borderColor: ACCENT },
  chipText: { fontSize: 14, color: TEXT },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
});
