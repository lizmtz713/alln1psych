/**
 * TransmitComposerSheet — Inline composer sheet from Signals.
 * Person + intent can be pre-set; reuses IntentSelector, GuidedPrompts, and store send logic.
 * Open + Glimpse send from sheet; anonymous/soft → "Open full composer".
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMindMailStore } from '../../stores/mindMailStore';
import { useDailyAnchorsStore } from '../../stores/dailyAnchorsStore';
import { useLightsStore } from '../../stores/lightsStore';
import { checkContent, recordSend } from '../../services/mindMailSafetyService';
import { IntentSelector } from '../mind-mail/IntentSelector';
import { GuidedPrompts } from '../mind-mail/GuidedPrompts';
import { PostSendReinforcement } from '../mind-mail/PostSendReinforcement';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { MindMailIntent } from '../../types/mindMail';
import type { NoteType } from '../../stores/mindMailStore';
import { calculateGlimpseDuration } from '../../stores/mindMailStore';

const SEND_MODES = [
  { id: 'open' as const, label: 'Open', sub: 'They see it\'s from you' },
  { id: 'glimpse' as const, label: 'Glimpse', sub: 'View once, then it\'s gone' },
];

export interface TransmitComposerSheetProps {
  visible: boolean;
  recipientId: string | null;
  recipientName: string;
  presetIntent?: MindMailIntent | null;
  onClose: () => void;
  /** Called after successful send with recipientId (for Constellation glow and parent refresh) */
  onSent?: (recipientId: string | null) => void;
  /** When true, open full composer instead of sending from sheet (e.g. user tapped "Open full composer") */
  openFullComposer?: () => void;
}

export function TransmitComposerSheet({
  visible,
  recipientId,
  recipientName,
  presetIntent = null,
  onClose,
  onSent,
  openFullComposer,
}: TransmitComposerSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createNote, updateNote, sendNote } = useMindMailStore();

  const [selectedIntent, setSelectedIntent] = useState<MindMailIntent | null>(presetIntent ?? null);
  const [content, setContent] = useState('');
  const [sendType, setSendType] = useState<'open' | 'glimpse'>('open');
  const [sending, setSending] = useState(false);
  const [showReinforcement, setShowReinforcement] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIntent(presetIntent ?? null);
      setContent('');
      setSendType('open');
    }
  }, [visible, presetIntent]);

  const noteType: NoteType = selectedIntent ?? 'general';
  const hasContent = content.trim().length > 0;
  const canSend = hasContent && recipientName && !sending;

  const handleSend = async () => {
    if (!canSend || !recipientName) return;
    const text = content.trim();
    const safety = checkContent(text);
    if (safety.isCrisis) {
      Alert.alert('Take care', safety.message ?? 'If you're in crisis, please reach out to 988 or 741741.');
      return;
    }
    setSending(true);
    try {
      const payload = {
        recipientName,
        recipientId: recipientId || undefined,
        recipientType: recipientId ? 'circle' : 'external',
        content: text,
        noteType,
        sendType,
      };
      const note = await createNote(payload);
      if (note?.id) {
        if (sendType === 'glimpse') {
          const sec = Math.max(5, Math.min(60, calculateGlimpseDuration(text)));
          await updateNote(note.id, { glimpseViewSeconds: sec, glimpseAutoCalculated: true });
        }
        await sendNote(note.id, sendType);
        recordSend(sendType);
        useDailyAnchorsStore.getState().completeConnectionPrompt();
        if (recipientId) useLightsStore.getState().recordConnection(recipientId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowReinforcement(true);
        onSent?.(recipientId);
      }
    } catch (e) {
      Alert.alert('Couldn’t send', 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleReinforcementDismiss = () => {
    setShowReinforcement(false);
    onClose();
  };

  const handleOpenFull = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push({
      pathname: '/mind-mail/compose',
      params: {
        ...(recipientId && recipientName ? { recipientId, recipientName } : {}),
        from: 'connections',
      },
    });
    openFullComposer?.();
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={[styles.container, { paddingBottom: insets.bottom }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Transmit</Text>
            <Pressable style={styles.closeBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>
          {recipientName ? (
            <View style={styles.recipientBar}>
              <Text style={styles.recipientLabel}>To: {recipientName}</Text>
            </View>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <IntentSelector selectedIntent={selectedIntent} onSelect={setSelectedIntent} />
            {selectedIntent && (
              <GuidedPrompts intent={selectedIntent} onSelectPrompt={setContent} />
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.input}
                placeholder="A few words is enough."
                placeholderTextColor={COLORS.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text style={styles.charCount}>{content.length}/2000</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>How they'll see it</Text>
              <View style={styles.sendModeRow}>
                {SEND_MODES.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[styles.sendModeBtn, sendType === opt.id && styles.sendModeBtnActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSendType(opt.id); }}
                  >
                    <Text style={[styles.sendModeText, sendType === opt.id && styles.sendModeTextActive]}>{opt.label}</Text>
                    {'sub' in opt && opt.sub ? <Text style={styles.sendModeSub}>{opt.sub}</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.fullComposerLink, pressed && styles.linkPressed]}
              onPress={handleOpenFull}
            >
              <Text style={styles.fullComposerText}>Anonymous or soft share — open full composer</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.accent} />
            </Pressable>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <PostSendReinforcement
        visible={showReinforcement}
        onDismiss={handleReinforcementDismiss}
        showConstellationHint={!!recipientId}
        recipientName={recipientName || undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  closeBtn: { padding: 8 },
  recipientBar: { paddingHorizontal: 20, paddingBottom: 8 },
  recipientLabel: { fontSize: 14, color: COLORS.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  row: { marginBottom: SPACING.lg },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  sendModeRow: { flexDirection: 'row', gap: 10 },
  sendModeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendModeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  sendModeText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  sendModeTextActive: { color: COLORS.accent },
  sendModeSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  fullComposerLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  linkPressed: { opacity: 0.9 },
  fullComposerText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
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
