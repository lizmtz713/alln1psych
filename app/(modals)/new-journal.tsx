import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useJournalStore, type JournalMood } from '../../src/stores/journalStore';
import * as Voice from '../../src/services/voice';
import { hasOpenAIKey } from '../../src/services/ai';

const MOOD_OPTIONS: { mood: JournalMood; emoji: string }[] = [
  { mood: 'green', emoji: '😊' },
  { mood: 'yellow', emoji: '😐' },
  { mood: 'orange', emoji: '😟' },
  { mood: 'red', emoji: '😢' },
];

export default function NewJournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addEntry = useJournalStore((s) => s.addEntry);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const lastResultRef = useRef('');

  const handleMicPress = async () => {
    if (!Voice.hasVoiceSupport()) {
      Alert.alert('Voice not available', 'Voice input is not supported on this device.');
      return;
    }
    if (isRecording) {
      try {
        await Voice.stopOnDeviceListening();
      } catch (_) {}
      setIsRecording(false);
      const text = (lastResultRef.current || liveTranscript).trim();
      lastResultRef.current = '';
      setLiveTranscript('');
      if (text) setContent((c) => (c ? c + '\n\n' + text : text));
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone access needed', 'Go to Settings to enable it.', [{ text: 'OK' }]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiveTranscript('');
    lastResultRef.current = '';
    setIsRecording(true);
    try {
      await Voice.startOnDeviceListening({
        onPartial: (t) => setLiveTranscript(t),
        onResult: (t) => { lastResultRef.current = t; },
        onError: () => {
          Voice.cancelOnDeviceListening();
          setLiveTranscript('');
          setIsRecording(false);
        },
      });
    } catch (_) {
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    addEntry(trimmed, { mood, source: 'manual' });
    setSaved(true);
  };

  if (saved) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom }]}>
        <Text style={styles.affirmation}>Saved. This is just for you. 🔒</Text>
        <Pressable style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={styles.cancelRow}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Text style={styles.title}>What's on your mind?</Text>
      {(isRecording || isProcessingVoice) && (
        <Text style={styles.recordingLabel}>
          {isRecording ? 'Listening... Tap mic when done.' : 'Processing...'}
        </Text>
      )}
      {isRecording && liveTranscript ? (
        <Text style={styles.liveTranscript} numberOfLines={2}>{liveTranscript}</Text>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write anything... or tap the mic to speak."
          placeholderTextColor={COLORS.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          editable={!isRecording && !isProcessingVoice}
        />
        <Pressable
          style={[styles.micButton, isRecording && styles.micButtonRecording]}
          onPress={handleMicPress}
          disabled={isProcessingVoice}
        >
          <Ionicons name="mic" size={24} color={COLORS.text} />
        </Pressable>
      </View>
      <Text style={styles.moodLabel}>Mood (optional)</Text>
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.mood}
            style={[styles.moodChip, mood === opt.mood && styles.moodChipSelected]}
            onPress={() => setMood(mood === opt.mood ? undefined : opt.mood)}
          >
            <Text style={styles.moodEmoji}>{opt.emoji}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed, !content.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!content.trim()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24 },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  cancelText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 180,
  },
  recordingLabel: {
    fontSize: 14,
    color: COLORS.recording,
  },
  liveTranscript: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: COLORS.recording,
  },
  moodLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  moodChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChipSelected: {
    backgroundColor: COLORS.accent,
  },
  moodEmoji: {
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  saveButtonPressed: { opacity: 0.9 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  affirmation: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    fontSize: 17,
    color: COLORS.accent,
    fontWeight: '600',
  },
});
