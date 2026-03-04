/**
 * Mind Mail Compose — New Mind Mail with To, Type (Open/Anon/Soft), message, AI assist panel
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useMindMailStore, type NoteType, type SendType } from '../../src/stores/mindMailStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { clarifyNote, rephraseNote } from '../../src/services/heartNotesAI';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

const SEND_OPTIONS: { id: SendType; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'anonymous', label: 'Anon' },
  { id: 'soft', label: 'Soft' },
];

export default function MindMailComposeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ draftId?: string }>();
  const { members } = useCircleStore();
  const { createNote, updateNote, sendNote, notes } = useMindMailStore();

  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [content, setContent] = useState('');
  const [sendType, setSendType] = useState<SendType>('open');
  const [showRecipientPicker, setShowRecipientPicker] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMode, setAiMode] = useState<'help' | 'vent' | 'hard' | 'examples' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    if (params.draftId) {
      const draft = notes.find((n) => n.id === params.draftId);
      if (draft) {
        setRecipientId(draft.recipientId || '');
        setRecipientName(draft.recipientName);
        setContent(draft.content);
        setSendType((draft.sendType as SendType) || 'open');
        setShowRecipientPicker(false);
      }
    }
  }, [params.draftId, notes]);

  const handleBack = () => {
    if (content.trim()) {
      Alert.alert('Discard?', 'You have unsaved changes.', [
        { text: 'Keep Writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSaveDraft = async () => {
    if (!recipientName || !content.trim()) {
      Alert.alert('Missing info', 'Select a recipient and write a message.');
      return;
    }
    setSaving(true);
    try {
      if (params.draftId) {
        await updateNote(params.draftId, {
          recipientName,
          recipientId: recipientId || undefined,
          content: content.trim(),
          sendType,
        });
      } else {
        await createNote({
          recipientName,
          recipientId: recipientId || undefined,
          recipientType: recipientId ? 'circle' : 'external',
          content: content.trim(),
          noteType: 'general',
          sendType,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Draft saved.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Error', 'Could not save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!recipientName || !content.trim()) {
      Alert.alert('Missing info', 'Select a recipient and write a message.');
      return;
    }
    setSaving(true);
    try {
      let noteId = params.draftId;
      if (!noteId) {
        const note = await createNote({
          recipientName,
          recipientId: recipientId || undefined,
          recipientType: recipientId ? 'circle' : 'external',
          content: content.trim(),
          noteType: 'general',
          sendType,
        });
        noteId = note?.id;
      } else {
        await updateNote(noteId, {
          recipientName,
          recipientId: recipientId || undefined,
          content: content.trim(),
          sendType,
        });
      }
      if (noteId) {
        await sendNote(noteId, sendType);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Sent',
          sendType === 'soft'
            ? `${recipientName} can accept when ready.`
            : sendType === 'anonymous'
            ? `Sent anonymously to ${recipientName}.`
            : `Sent to ${recipientName}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch {
      Alert.alert('Error', 'Could not send. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAiHelp = async () => {
    if (!content.trim() || !recipientName) {
      setAiSuggestion('Write something above and select a recipient, then try again.');
      return;
    }
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const result = await clarifyNote(content, recipientName, 'general');
      const text = result.suggestions?.length
        ? result.suggestions.join('\n\n') + (result.coreMessage ? '\n\nCore idea: ' + result.coreMessage : '')
        : result.coreMessage || 'Could not generate suggestions.';
      setAiSuggestion(text);
    } catch {
      setAiSuggestion('Having trouble connecting. Try again in a moment.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiRephrase = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const rephrased = await rephraseNote(content, recipientName || 'them', 'softer');
      setAiSuggestion(rephrased);
    } catch {
      setAiSuggestion('Try again in a moment.');
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setContent(aiSuggestion);
      setAiSuggestion('');
      setAiMode(null);
    }
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>New Mind Mail</Text>
          <Pressable onPress={handleSaveDraft} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Draft'}</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            {showRecipientPicker ? (
              <View style={styles.pickerWrap}>
                {members.length === 0 ? (
                  <Text style={styles.muted}>No Circle members. Add someone first.</Text>
                ) : (
                  members.map((m) => (
                    <Pressable
                      key={m.id}
                      style={styles.pickerRow}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRecipientId(m.id);
                        setRecipientName(m.name);
                        setShowRecipientPicker(false);
                      }}
                    >
                      <Text style={styles.pickerName}>{m.name}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : (
              <Pressable style={styles.recipientRow} onPress={() => setShowRecipientPicker(true)}>
                <Text style={styles.recipientText}>{recipientName}</Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
              </Pressable>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {SEND_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[styles.typeBtn, sendType === opt.id && styles.typeBtnActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSendType(opt.id);
                  }}
                >
                  <Text style={[styles.typeBtnText, sendType === opt.id && styles.typeBtnTextActive]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.input}
              placeholder="Write from the mind..."
              placeholderTextColor={COLORS.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length}/2000</Text>
          </View>

          <Pressable
            style={styles.aiToggle}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAiPanel(!showAiPanel);
              if (!showAiPanel) setAiMode(null);
              setAiSuggestion('');
            }}
          >
            <Ionicons name="sparkles" size={20} color={COLORS.accent} />
            <Text style={styles.aiToggleText}>Need help expressing this?</Text>
            <Ionicons name={showAiPanel ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
          </Pressable>

          {showAiPanel && (
            <View style={styles.aiPanel}>
              <Pressable
                style={styles.aiOption}
                onPress={() => { setAiMode('help'); handleAiHelp(); }}
                disabled={aiLoading}
              >
                <Text style={styles.aiOptionText}>Help me say this</Text>
                <Text style={styles.aiOptionSub}>AI suggests clearer, compassionate phrasing</Text>
              </Pressable>
              <Pressable
                style={styles.aiOption}
                onPress={() => {
                  setAiMode('vent');
                  setAiSuggestion('Write freely. When you\'re done, choose: Send, Save as draft, or Just let it go (don\'t send).');
                }}
              >
                <Text style={styles.aiOptionText}>Just getting it off my chest</Text>
                <Text style={styles.aiOptionSub}>Vent — then choose to send, save, or let go</Text>
              </Pressable>
              <Pressable
                style={styles.aiOption}
                onPress={() => {
                  setAiMode('hard');
                  setAiSuggestion('Guided prompts:\n\n• What do you want them to understand?\n• How did this make you feel?\n• What do you need from them?\n\nUse these to build your message.');
                }}
              >
                <Text style={styles.aiOptionText}>This is hard to say</Text>
                <Text style={styles.aiOptionSub}>Guided prompts to build your message</Text>
              </Pressable>
              <Pressable
                style={styles.aiOption}
                onPress={() => {
                  setAiMode('examples');
                  setAiSuggestion('Examples by situation:\n\n• Apologizing to a parent: "I know I hurt you. I\'m sorry and I want to make it right."\n• Gratitude to a friend: "You showing up meant more than you know."\n• Setting a boundary: "I need some space to process. It\'s not about you."');
                }}
              >
                <Text style={styles.aiOptionText}>Show me examples</Text>
                <Text style={styles.aiOptionSub}>Templates by relationship and topic</Text>
              </Pressable>
              {aiLoading && <Text style={styles.aiLoading}>Thinking...</Text>}
              {aiSuggestion ? (
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionText}>{aiSuggestion}</Text>
                  <Pressable style={styles.applyBtn} onPress={applySuggestion}>
                    <Text style={styles.applyBtnText}>Use this</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={[styles.sendBtn, (!content.trim() || !recipientName) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={saving || !content.trim() || !recipientName}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.sendBtnText}>{saving ? 'Sending...' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  saveBtn: { padding: 4 },
  saveBtnText: { fontSize: 15, fontWeight: '500', color: COLORS.accent },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  row: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  pickerWrap: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  pickerRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerName: { fontSize: 16, color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.textMuted, padding: 14 },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipientText: { fontSize: 16, color: COLORS.text },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.15)', borderColor: COLORS.accent },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  typeBtnTextActive: { color: COLORS.accent },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  aiToggleText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  aiPanel: { marginBottom: 16, paddingLeft: 4 },
  aiOption: {
    paddingVertical: 12,
    paddingRight: 12,
    marginBottom: 8,
  },
  aiOptionText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  aiOptionSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  aiLoading: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  suggestionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
  },
  suggestionText: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 12 },
  applyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  applyBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button ?? 12,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
