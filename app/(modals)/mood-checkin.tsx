import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore, TEMPERATURE_LABELS, type Temperature } from '../../src/stores/circleStore';

const OPTIONS: { temp: Temperature; emoji: string; label: string }[] = [
  { temp: 'green', emoji: '😊', label: "I'm good" },
  { temp: 'yellow', emoji: '😐', label: 'Meh, could be better' },
  { temp: 'orange', emoji: '😟', label: 'Having a rough time' },
  { temp: 'red', emoji: '😢', label: "I'm really struggling" },
];

const AFFIRMATIONS: Record<Temperature, string> = {
  green: "Glad to hear it! 💚",
  yellow: "Thanks for sharing. I'm here if you need me. 💛",
  orange: "I hear you. You don't have to go through this alone. 🧡",
  red: "Thank you for being honest. You are not alone. ❤️",
};

export default function MoodCheckinScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addMoodCheckin = useCircleStore((s) => s.addMoodCheckin);
  const [selected, setSelected] = useState<Temperature | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    addMoodCheckin(selected, note.trim() || undefined);
    setSaved(true);
  };

  if (saved && selected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom }]}>
        <Text style={styles.affirmation}>{AFFIRMATIONS[selected]}</Text>
        {selected === 'red' && (
          <View style={styles.crisisBox}>
            <Text style={styles.crisisTitle}>If you need to talk to someone now:</Text>
            <Pressable onPress={() => Linking.openURL('tel:988')} style={styles.crisisLink}>
              <Text style={styles.crisisLinkText}>988 Suicide & Crisis Lifeline</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('sms:741741?body=HOME')} style={styles.crisisLink}>
              <Text style={styles.crisisLinkText}>Crisis Text Line — text HOME to 741741</Text>
            </Pressable>
          </View>
        )}
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
      <Text style={styles.title}>How are you feeling right now?</Text>
      <View style={styles.grid}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.temp}
            style={[
              styles.card,
              selected === opt.temp && styles.cardSelected,
              { borderColor: COLORS.temperature[opt.temp] },
              selected === opt.temp && { borderWidth: 3 },
            ]}
            onPress={() => setSelected(opt.temp)}
          >
            <Text style={styles.emoji}>{opt.emoji}</Text>
            <Text style={styles.cardLabel}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.noteToggle} onPress={() => setShowNote(!showNote)}>
        <Text style={styles.noteToggleText}>Want to add a note?</Text>
      </Pressable>
      {showNote && (
        <TextInput
          style={styles.input}
          placeholder="Optional..."
          placeholderTextColor={COLORS.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
      )}
      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed, !selected && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!selected}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: COLORS.surface,
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  cardLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  noteToggle: {
    marginBottom: 12,
  },
  noteToggleText: {
    fontSize: 15,
    color: COLORS.accent,
  },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  saveButtonPressed: { opacity: 0.9 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  affirmation: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  crisisBox: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 24,
  },
  crisisTitle: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },
  crisisLink: {
    marginBottom: 8,
  },
  crisisLinkText: {
    fontSize: 15,
    color: COLORS.accent,
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
