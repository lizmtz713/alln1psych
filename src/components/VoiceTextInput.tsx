/**
 * TextInput with optional voice: tap mic to record → transcribe → set value.
 * Use anywhere the user can type; supports voice input per Global System Architecture.
 */

import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, type TextInputProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import * as VoiceService from '../services/voice';
import { useLegalConsentStore } from '../stores/legalConsentStore';
import { VoiceDisclosureModal } from './VoiceDisclosureModal';

const ACCENT = COLORS.accent;
const TEXT_MUTED = COLORS.textMuted;
const BORDER = COLORS.border;
const CARD_BG = COLORS.surface;

export type VoiceTextInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  /** Show mic button (default true) */
  showVoice?: boolean;
  /** Append transcript to value (default true). If false, replaces. */
  appendTranscript?: boolean;
};

export function VoiceTextInput({
  value,
  onChangeText,
  showVoice = true,
  appendTranscript = true,
  style,
  ...rest
}: VoiceTextInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showVoiceDisclosure, setShowVoiceDisclosure] = useState(false);
  const hasAcceptedVoiceDisclosure = useLegalConsentStore((s) => s.hasAcceptedVoiceDisclosure());
  const setVoiceDisclosureAccepted = useLegalConsentStore((s) => s.setVoiceDisclosureAccepted);

  const doStartRecording = async () => {
    setVoiceError(null);
    setIsRecording(true);
    try {
      await VoiceService.startRecording();
    } catch (e) {
      setVoiceError(e instanceof Error ? e.message : 'Could not start recording');
      setIsRecording(false);
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      try {
        const uri = await VoiceService.stopRecording();
        const transcript = await VoiceService.transcribeWithWhisper(uri);
        if (transcript?.trim()) {
          onChangeText(appendTranscript ? (value ? `${value} ${transcript}` : transcript) : transcript);
        }
      } catch (e) {
        setVoiceError(e instanceof Error ? e.message : 'Voice failed');
      }
      setIsRecording(false);
      return;
    }
    if (!hasAcceptedVoiceDisclosure) {
      setShowVoiceDisclosure(true);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await doStartRecording();
  };

  const handleVoiceDisclosureAccept = () => {
    setVoiceDisclosureAccepted();
    setShowVoiceDisclosure(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    doStartRecording();
  };

  return (
    <View style={styles.wrap}>
      <VoiceDisclosureModal visible={showVoiceDisclosure} onAccept={handleVoiceDisclosureAccept} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style]}
        placeholderTextColor={TEXT_MUTED}
        {...rest}
      />
      {showVoice && (
        <Pressable
          style={[styles.micBtn, isRecording && styles.micBtnActive]}
          onPress={handleMicPress}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={isRecording ? '#fff' : TEXT_MUTED} />
        </Pressable>
      )}
      {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', flex: 1 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input ?? 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 44,
  },
  micBtn: {
    position: 'absolute',
    right: 8,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: ACCENT },
  errorText: { fontSize: 12, color: COLORS.error ?? '#EF5350', marginTop: 4 },
});
