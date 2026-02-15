import { useState } from 'react';
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

  const handleMicPress = async () => {
    const hasKey = await hasOpenAIKey();
    if (!hasKey || !Voice.hasVoiceSupport()) {
      Alert.alert('Voice not available', 'Add your OpenAI API key in Settings to use voice.');
      return;
    }
    if (isRecording) {
      try {
        const uri = await Voice.stopRecording();
        setIsRecording(false);
        setIsProcessingVoice(true);
        const text = await Voice.transcribeWithWhisper(uri);
        setIsProcessingVoice(false);
        if (text.trim()) setContent((c) => (c ? c + '\n\n' + text.trim() : text.trim()));
      } catch (e) {
        setIsRecording(false);
        setIsProcessingVoice(false);
        Alert.alert('Voice failed', 'Try again or type instead.');
      }
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone access needed', 'Go to Settings to enable it.', [{ text: 'OK' }]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setIsRecording(true);
      await Voice.startRecording();
    } catch (e) {
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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>What's on your mind?</Text>
      {(isRecording || isProcessingVoice) && (
        <Text style={styles.recordingLabel}>
          {isRecording ? 'Recording... Tap mic to stop.' : 'Processing...'}
        </Text>
      )}
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
