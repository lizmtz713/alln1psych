/**
 * VoiceQuestion — Reusable check-in question: emoji picker and/or voice answer.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { VoiceRecorder, VoicePlayer } from './index';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export type AnswerType = 'emoji' | 'voice' | 'text';

export interface VoiceQuestionAnswer {
  type: AnswerType;
  value?: number; // 1-5 for emoji
  text?: string;
  voiceUri?: string;
  voiceDurationSec?: number;
  transcript?: string;
}

export interface VoiceQuestionProps {
  question: string;
  onAnswer: (answer: VoiceQuestionAnswer) => void;
  emojiOptions?: string[];
  allowEmoji?: boolean;
  allowVoice?: boolean;
  /** Initial answer if resuming */
  initialAnswer?: VoiceQuestionAnswer | null;
}

const DEFAULT_EMOJIS = ['😫', '😕', '😐', '🙂', '😴'];

export function VoiceQuestion({
  question,
  onAnswer,
  emojiOptions = DEFAULT_EMOJIS,
  allowEmoji = true,
  allowVoice = true,
  initialAnswer = null,
}: VoiceQuestionProps) {
  const [mode, setMode] = useState<'emoji' | 'voice'>(
    initialAnswer?.type === 'voice' ? 'voice' : !allowEmoji && allowVoice ? 'voice' : 'emoji'
  );
  const [emojiValue, setEmojiValue] = useState<number | null>(
    initialAnswer?.type === 'emoji' && initialAnswer.value != null ? initialAnswer.value : null
  );
  const [voiceValue, setVoiceValue] = useState<{
    uri: string;
    durationSec: number;
    transcript?: string;
  } | null>(
    initialAnswer?.type === 'voice' && initialAnswer.voiceUri
      ? {
          uri: initialAnswer.voiceUri,
          durationSec: initialAnswer.voiceDurationSec ?? 0,
          transcript: initialAnswer.transcript,
        }
      : null
  );

  const handleEmojiSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmojiValue(value);
    onAnswer({ type: 'emoji', value });
  };

  const handleVoiceDone = (result: { uri: string; durationSec: number; transcript?: string }) => {
    setVoiceValue({ uri: result.uri, durationSec: result.durationSec, transcript: result.transcript });
    onAnswer({
      type: 'voice',
      voiceUri: result.uri,
      voiceDurationSec: result.durationSec,
      transcript: result.transcript,
    });
  };

  const handleReRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceValue(null);
  };

  return (
    <View style={styles.wrap}>
      {question ? <Text style={styles.questionLabel}>{question}</Text> : null}

      {allowEmoji && allowVoice && (
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, mode === 'emoji' && styles.toggleBtnActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMode('emoji');
            }}
          >
            <Text style={styles.toggleEmoji}>😊</Text>
            <Text style={[styles.toggleText, mode === 'emoji' && styles.toggleTextActive]}>Tap</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mode === 'voice' && styles.toggleBtnActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMode('voice');
            }}
          >
            <Ionicons name="mic" size={18} color={mode === 'voice' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.toggleText, mode === 'voice' && styles.toggleTextActive]}>Voice</Text>
          </Pressable>
        </View>
      )}

      {mode === 'emoji' && allowEmoji && (
        <View style={styles.emojiRow}>
          {emojiOptions.map((emoji, i) => (
            <Pressable
              key={i}
              style={[styles.emojiBtn, emojiValue === i + 1 && styles.emojiBtnActive]}
              onPress={() => handleEmojiSelect(i + 1)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {mode === 'voice' && allowVoice && !voiceValue && (
        <VoiceRecorder
          onDone={handleVoiceDone}
          requestTranscribe={true}
          onCancel={() => setMode('emoji')}
          compact
        />
      )}

      {mode === 'voice' && allowVoice && voiceValue && (
        <View style={styles.voicePreview}>
          <VoicePlayer
            uri={voiceValue.uri}
            durationSec={voiceValue.durationSec}
            transcript={voiceValue.transcript}
            compact
          />
          <Pressable onPress={handleReRecord} style={styles.reRecord}>
            <Text style={styles.reRecordText}>Re-record</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: SPACING.md },
  questionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleEmoji: { fontSize: 16 },
  toggleText: { fontSize: 13, color: COLORS.textMuted },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  emojiBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  emoji: { fontSize: 28 },
  voicePreview: { marginTop: 8 },
  reRecord: { marginTop: 12 },
  reRecordText: { fontSize: 14, color: COLORS.accent },
});
