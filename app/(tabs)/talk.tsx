import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';

const MIC_BUTTON_SIZE = 80;

export default function TalkScreen() {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.micButton,
          pressed && styles.micButtonPressed,
        ]}
        onPress={() => {}}
      >
        <Ionicons name="mic" size={36} color={COLORS.text} />
      </Pressable>
      <Text style={styles.hint}>Tap to talk. I'm listening.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: MIC_BUTTON_SIZE,
    height: MIC_BUTTON_SIZE,
    borderRadius: MIC_BUTTON_SIZE / 2,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  micButtonPressed: {
    opacity: 0.85,
  },
  hint: {
    fontSize: 17,
    color: COLORS.textMuted,
  },
});
