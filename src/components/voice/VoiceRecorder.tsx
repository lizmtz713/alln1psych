/**
 * VoiceRecorder — Foundation for Voice Journal, Voice Mind Mail, Voice Check-in.
 * Tap mic → record → stop → returns URI + duration (optional transcript).
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import * as VoiceService from '../../services/voice';
import { VoiceWaveform } from './VoiceWaveform';

export type VoiceRecorderResult = {
  uri: string;
  durationSec: number;
  transcript?: string;
};

export type VoiceRecorderProps = {
  onDone: (result: VoiceRecorderResult) => void;
  onCancel?: () => void;
  /** Request Whisper transcription after stop (costs ~$0.006/min) */
  requestTranscribe?: boolean;
  /** Max duration in seconds (default 300 = 5 min) */
  maxDurationSec?: number;
  /** Compact UI (e.g. inline in a form) */
  compact?: boolean;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({
  onDone,
  onCancel,
  requestTranscribe = false,
  maxDurationSec = 300,
  compact = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone access needed');
        Alert.alert(
          'Microphone access needed',
          'Enable microphone in Settings to record voice notes.',
          [{ text: 'OK' }]
        );
        return;
      }

      await VoiceService.startRecording();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      setDurationSec(0);

      timerRef.current = setInterval(() => {
        setDurationSec((prev) => {
          if (prev >= maxDurationSec - 1) {
            stopTimer();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not start recording';
      setError(message);
      setIsRecording(false);
    }
  }, [maxDurationSec, stopTimer]);

  const stopRecording = useCallback(async () => {
    stopTimer();
    if (!isRecording) return;

    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      const uri = await VoiceService.stopRecording();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let transcript: string | undefined;
      if (requestTranscribe) {
        try {
          transcript = await VoiceService.transcribeWithWhisper(uri);
        } catch (_) {
          // optional: keep uri + duration without transcript
        }
      }

      onDone({ uri, durationSec, transcript });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save recording';
      setError(message);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording, durationSec, requestTranscribe, onDone, stopTimer]);

  const handleCancel = useCallback(() => {
    if (isRecording) {
      stopTimer();
      VoiceService.stopRecording().catch(() => {});
      setIsRecording(false);
    }
    onCancel?.();
  }, [isRecording, onCancel, stopTimer]);

  // Auto-stop at max duration
  React.useEffect(() => {
    if (isRecording && durationSec >= maxDurationSec) {
      stopRecording();
    }
  }, [isRecording, durationSec, maxDurationSec, stopRecording]);

  React.useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  if (isProcessing) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.processingText}>
          {requestTranscribe ? 'Saving & transcribing…' : 'Saving…'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => setError(null)}>
          <Text style={styles.retryBtnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!isRecording) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Pressable
          style={({ pressed }) => [styles.micBtn, pressed && styles.micBtnPressed]}
          onPress={startRecording}
        >
          <Ionicons name="mic" size={compact ? 32 : 48} color="#fff" />
        </Pressable>
        {!compact && (
          <Text style={styles.hint}>Tap to record</Text>
        )}
        {onCancel && (
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <VoiceWaveform active={isRecording} />
      <Text style={styles.duration}>{formatDuration(durationSec)}</Text>
      {!compact && (
        <Text style={styles.recordingLabel}>Recording…</Text>
      )}
      <Pressable
        style={({ pressed }) => [styles.stopBtn, pressed && styles.stopBtnPressed]}
        onPress={stopRecording}
      >
        <Ionicons name="stop" size={28} color="#fff" />
        <Text style={styles.stopBtnText}>Stop & save</Text>
      </Pressable>
      {onCancel && (
        <Pressable style={styles.discardBtn} onPress={handleCancel}>
          <Text style={styles.discardBtnText}>Discard</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  containerCompact: {
    paddingVertical: SPACING.md,
  },
  micBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  micBtnPressed: { opacity: 0.9 },
  hint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  duration: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    fontVariant: ['tabular-nums'],
  },
  recordingLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.button ?? 12,
    marginTop: SPACING.lg,
  },
  stopBtnPressed: { opacity: 0.9 },
  stopBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  discardBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  discardBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  processingText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryBtnText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
  },
});
