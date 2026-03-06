/**
 * Mind Mail Compose — New Mind Mail with To, Type (Open/Anon/Soft), message, AI assist panel
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useMindMailStore, type NoteType, type SendType, calculateGlimpseDuration, GLIMPSE_DURATIONS } from '../../src/stores/mindMailStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { useDailyAnchorsStore } from '../../src/stores/dailyAnchorsStore';
import { clarifyNote, rephraseNote } from '../../src/services/heartNotesAI';
import { VoiceRecorder, VoicePlayer } from '../../src/components/voice';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';
import { checkContent, getCooldownRemaining, recordSend } from '../../src/services/mindMailSafetyService';
import { CrisisIntervention } from '../../src/components/mindmail/CrisisIntervention';
import { EmotionalSafetyCheck } from '../../src/components/mindmail/EmotionalSafetyCheck';
import { CooldownTimer } from '../../src/components/mindmail/CooldownTimer';
import { IntentSelector } from '../../src/components/mind-mail/IntentSelector';
import { GuidedPrompts } from '../../src/components/mind-mail/GuidedPrompts';
import { PostSendReinforcement } from '../../src/components/mind-mail/PostSendReinforcement';
import type { MindMailIntent } from '../../src/types/mindMail';

const SEND_OPTIONS: { id: SendType; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'anonymous', label: 'Anon' },
  { id: 'soft', label: 'Soft' },
  { id: 'glimpse', label: 'Glimpse' },
];

export default function MindMailComposeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ draftId?: string; recipientId?: string; recipientName?: string; from?: string }>();
  const fromConnectionsFlow = params.from === 'connections';
  const { members } = useCircleStore();
  const { createNote, updateNote, sendNote, notes } = useMindMailStore();

  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [content, setContent] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [voiceNote, setVoiceNote] = useState<{
    uri: string;
    durationSec: number;
    transcript?: string;
  } | null>(null);
  const [sendType, setSendType] = useState<SendType>('open');
  const [glimpseDuration, setGlimpseDuration] = useState<number | 'auto'>('auto');
  const [showRecipientPicker, setShowRecipientPicker] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMode, setAiMode] = useState<'help' | 'vent' | 'hard' | 'examples' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [contentWarning, setContentWarning] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState<string | undefined>();
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [cooldownMins, setCooldownMins] = useState(0);
  const sendAfterSafetyRef = useRef(false);
  const [selectedIntent, setSelectedIntent] = useState<MindMailIntent | null>(null);
  const [showPostSendReinforcement, setShowPostSendReinforcement] = useState(false);

  const isGlimpse = sendType === 'glimpse';
  const calculatedDuration =
    inputMode === 'voice' && voiceNote
      ? Math.max(5, Math.min(60, voiceNote.durationSec))
      : calculateGlimpseDuration(content);
  const finalDuration = glimpseDuration === 'auto' ? calculatedDuration : glimpseDuration;
  const hasContent = inputMode === 'text' ? content.trim().length > 0 : voiceNote != null;

  useEffect(() => {
    getCooldownRemaining(sendType).then(setCooldownMins);
    const interval = setInterval(() => getCooldownRemaining(sendType).then(setCooldownMins), 60000);
    return () => clearInterval(interval);
  }, [sendType]);

  const intentToNoteType = (i: MindMailIntent): NoteType => i;
  const noteTypeForSend = selectedIntent ? intentToNoteType(selectedIntent) : 'general';

  useEffect(() => {
    if (params.draftId) {
      const draft = notes.find((n) => n.id === params.draftId);
      if (draft) {
        setRecipientId(draft.recipientId || '');
        setRecipientName(draft.recipientName);
        setContent(draft.content);
        setSendType((draft.sendType as SendType) || 'open');
        setGlimpseDuration(
          draft.glimpseAutoCalculated ? 'auto' : (draft.glimpseViewSeconds ?? 'auto')
        );
        setShowRecipientPicker(false);
        const dt = draft.noteType as MindMailIntent | undefined;
        if (dt && ['encouragement', 'gratitude', 'apology', 'concern', 'boundary', 'grief'].includes(dt)) {
          setSelectedIntent(dt);
        }
      }
    } else if (params.recipientId || params.recipientName) {
      setRecipientId(params.recipientId || '');
      setRecipientName(params.recipientName || '');
      setShowRecipientPicker(false);
    }
  }, [params.draftId, params.recipientId, params.recipientName, notes]);

  const handleBack = () => {
    if (content.trim() || voiceNote) {
      Alert.alert('Discard?', 'You have unsaved changes.', [
        { text: 'Keep Writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSaveDraft = async () => {
    if (!recipientName || !hasContent) {
      Alert.alert('Missing info', 'Select a recipient and write or record a message.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        recipientName,
        recipientId: recipientId || undefined,
        content: inputMode === 'text' ? content.trim() : (voiceNote?.transcript ?? ''),
        sendType,
        ...(isGlimpse && {
          glimpseViewSeconds: finalDuration,
          glimpseAutoCalculated: glimpseDuration === 'auto',
        }),
        ...(inputMode === 'voice' &&
          voiceNote && {
            hasVoice: true,
            voiceUri: voiceNote.uri,
            voiceDurationSec: voiceNote.durationSec,
            voiceTranscript: voiceNote.transcript,
          }),
      };
      if (params.draftId) {
        await updateNote(params.draftId, payload);
      } else {
        await createNote({
          ...payload,
          recipientType: recipientId ? 'circle' : 'external',
          noteType: 'general',
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

  const doActualSend = async () => {
    if (!recipientName || !hasContent) return;
    setSaving(true);
    try {
      const textContent = inputMode === 'text' ? content.trim() : (voiceNote?.transcript ?? '');
      const voicePayload =
        inputMode === 'voice' && voiceNote
          ? {
              hasVoice: true,
              voiceUri: voiceNote.uri,
              voiceDurationSec: voiceNote.durationSec,
              voiceTranscript: voiceNote.transcript,
            }
          : {};
      let noteId = params.draftId;
      if (!noteId) {
        const note = await createNote({
          recipientName,
          recipientId: recipientId || undefined,
          recipientType: recipientId ? 'circle' : 'external',
          content: textContent || 'Voice message',
          noteType: noteTypeForSend,
          sendType,
          contentWarning: contentWarning || undefined,
          ...(isGlimpse && {
            glimpseViewSeconds: finalDuration,
            glimpseAutoCalculated: glimpseDuration === 'auto',
          }),
          ...voicePayload,
        });
        noteId = note?.id;
        if (noteId && Object.keys(voicePayload).length > 0) {
          await updateNote(noteId, voicePayload);
        }
      } else {
        await updateNote(noteId, {
          recipientName,
          recipientId: recipientId || undefined,
          content: textContent || 'Voice message',
          sendType,
          contentWarning: contentWarning || undefined,
          ...(isGlimpse && {
            glimpseViewSeconds: finalDuration,
            glimpseAutoCalculated: glimpseDuration === 'auto',
          }),
          ...voicePayload,
        });
      }
      if (noteId && isGlimpse) {
        await updateNote(noteId, {
          glimpseViewSeconds: finalDuration,
          glimpseAutoCalculated: glimpseDuration === 'auto',
        });
      }
      if (noteId) {
        await sendNote(noteId, sendType);
        await recordSend(sendType);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (fromConnectionsFlow) {
          useDailyAnchorsStore.getState().completeConnectionPrompt();
          if (recipientId) useLightsStore.getState().recordConnection(recipientId);
          setShowPostSendReinforcement(true);
        } else {
          const typeLabel = inputMode === 'voice' ? 'Voice message' : 'Message';
          const glimpseLabel = sendType === 'glimpse' ? ' (Glimpse)' : '';
          const sentMessage =
            sendType === 'glimpse'
              ? `${typeLabel}${glimpseLabel} sent to ${recipientName}. They can ${inputMode === 'voice' ? 'hear it' : 'view it'} once.`
              : sendType === 'soft'
              ? `${recipientName} can accept when ready.`
              : sendType === 'anonymous'
              ? `Sent anonymously to ${recipientName}.`
              : `Sent to ${recipientName}.`;
          Alert.alert('Sent', sentMessage, [{ text: 'OK', onPress: () => router.back() }]);
        }
      }
    } catch {
      Alert.alert('Error', 'Could not send. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!recipientName || !hasContent) {
      Alert.alert('Empty message', 'Write or record something first.');
      return;
    }
    const textContent = inputMode === 'text' ? content.trim() : (voiceNote?.transcript ?? '');
    const safetyCheck = checkContent(textContent);
    if (safetyCheck.isCrisis) {
      setCrisisMessage(safetyCheck.message);
      setShowCrisisModal(true);
      return;
    }
    const remaining = await getCooldownRemaining(sendType);
    if (remaining > 0) {
      Alert.alert('Cooldown', `You can send another ${sendType === 'anonymous' ? 'anonymous' : 'soft-share'} message in ${remaining} min.`);
      return;
    }
    if (sendType === 'anonymous' || sendType === 'soft') {
      sendAfterSafetyRef.current = true;
      setShowSafetyCheck(true);
      return;
    }
    await doActualSend();
  };

  const handleSafetyConfirm = () => {
    setShowSafetyCheck(false);
    if (sendAfterSafetyRef.current) {
      sendAfterSafetyRef.current = false;
      doActualSend();
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
          <IntentSelector selectedIntent={selectedIntent} onSelect={setSelectedIntent} />
          {selectedIntent && (
            <GuidedPrompts intent={selectedIntent} onSelectPrompt={setContent} />
          )}
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

            {(sendType === 'anonymous' || sendType === 'soft') && cooldownMins > 0 && (
              <CooldownTimer sendType={sendType} onDone={() => getCooldownRemaining(sendType).then(setCooldownMins)} />
            )}

            {isGlimpse && (
              <View style={styles.glimpseSection}>
                <View style={styles.glimpseExplainer}>
                  <Text style={styles.glimpseExplainerText}>
                    👁️ This message will be viewable once for {finalDuration}s, then disappear forever. They can't screenshot or re-read it.
                  </Text>
                </View>
                <View style={styles.durationRow}>
                  <Text style={styles.durationLabel}>View time:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationScroll}>
                    <Pressable
                      style={[styles.durationChip, glimpseDuration === 'auto' && styles.durationChipActive]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGlimpseDuration('auto');
                      }}
                    >
                      <Text style={[styles.durationChipText, glimpseDuration === 'auto' && styles.durationChipTextActive]}>
                        Auto ({calculatedDuration}s)
                      </Text>
                    </Pressable>
                    {GLIMPSE_DURATIONS.map((d) => (
                      <Pressable
                        key={d.value}
                        style={[styles.durationChip, glimpseDuration === d.value && styles.durationChipActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setGlimpseDuration(d.value);
                        }}
                      >
                        <Text style={[styles.durationChipText, glimpseDuration === d.value && styles.durationChipTextActive]}>
                          {d.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Message</Text>
            <View style={styles.inputModeToggle}>
              <Pressable
                style={[styles.inputModeBtn, inputMode === 'text' && styles.inputModeBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setInputMode('text');
                }}
              >
                <Ionicons name="document-text-outline" size={18} color={inputMode === 'text' ? '#fff' : COLORS.textMuted} />
                <Text style={[styles.inputModeBtnText, inputMode === 'text' && styles.inputModeBtnTextActive]}>Text</Text>
              </Pressable>
              <Pressable
                style={[styles.inputModeBtn, inputMode === 'voice' && styles.inputModeBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setInputMode('voice');
                }}
              >
                <Ionicons name="mic" size={18} color={inputMode === 'voice' ? '#fff' : COLORS.textMuted} />
                <Text style={[styles.inputModeBtnText, inputMode === 'voice' && styles.inputModeBtnTextActive]}>Voice</Text>
              </Pressable>
            </View>

            {inputMode === 'text' && (
              <>
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
              </>
            )}

            {inputMode === 'voice' && !voiceNote && (
              <View style={styles.voiceRecordSection}>
                <Text style={styles.voiceHint}>Record a voice message</Text>
                <VoiceRecorder
                  onDone={(result) =>
                    setVoiceNote({
                      uri: result.uri,
                      durationSec: result.durationSec,
                      transcript: result.transcript,
                    })
                  }
                  requestTranscribe={true}
                  onCancel={() => setInputMode('text')}
                  compact
                />
              </View>
            )}

            {inputMode === 'voice' && voiceNote && (
              <View style={styles.voicePreviewSection}>
                <VoicePlayer
                  uri={voiceNote.uri}
                  durationSec={voiceNote.durationSec}
                  transcript={voiceNote.transcript}
                  compact
                />
                <View style={styles.voiceActions}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setVoiceNote(null);
                    }}
                    style={styles.reRecordBtn}
                  >
                    <Text style={styles.reRecordText}>Re-record</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <Pressable style={styles.checkRow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setContentWarning((w) => !w); }}>
              <View style={[styles.checkbox, contentWarning && styles.checkboxChecked]}>{contentWarning ? <Text style={styles.checkmark}>✓</Text> : null}</View>
              <Text style={styles.checkLabel}>Mark as sensitive (content warning for recipient)</Text>
            </Pressable>
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
            style={[styles.sendBtn, (!hasContent || !recipientName || cooldownMins > 0) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={saving || !hasContent || !recipientName || cooldownMins > 0}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.sendBtnText}>{saving ? 'Sending...' : 'Send'}</Text>
          </Pressable>
        </View>
      <Modal visible={showCrisisModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <CrisisIntervention message={crisisMessage} onDismiss={() => setShowCrisisModal(false)} />
            </View>
          </View>
        </Modal>
        <Modal visible={showSafetyCheck} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <EmotionalSafetyCheck onConfirm={handleSafetyConfirm} onCancel={() => { setShowSafetyCheck(false); sendAfterSafetyRef.current = false; }} />
            </View>
          </View>
        </Modal>
        <PostSendReinforcement
          visible={showPostSendReinforcement}
          onDismiss={() => {
            setShowPostSendReinforcement(false);
            router.back();
          }}
        />
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
  glimpseSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glimpseExplainer: { marginBottom: 12 },
  glimpseExplainerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  durationRow: { flexDirection: 'row', alignItems: 'center' },
  durationScroll: { flexGrow: 0 },
  durationLabel: { fontSize: 14, color: COLORS.textMuted, marginRight: 12 },
  durationChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
  },
  durationChipActive: { backgroundColor: COLORS.accent },
  durationChipText: { fontSize: 13, color: COLORS.text },
  durationChipTextActive: { color: '#fff' },
  inputModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  inputModeBtnActive: { backgroundColor: COLORS.accent },
  inputModeBtnText: { fontSize: 14, color: COLORS.textMuted },
  inputModeBtnTextActive: { color: '#fff', fontWeight: '600' },
  voiceRecordSection: { marginTop: 8 },
  voiceHint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  voicePreviewSection: { marginTop: 8 },
  voiceActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  reRecordBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  reRecordText: { fontSize: 14, color: COLORS.accent },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: SPACING.lg },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  checkmark: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  checkLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
});
