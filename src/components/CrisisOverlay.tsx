/**
 * Full-screen crisis overlay — 988, 741741, emergency contacts, 911.
 * Calm, safe design. "I want to keep talking to Psych" dismisses.
 */

import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import { useUserStore } from '../stores/userStore';

interface CrisisOverlayProps {
  onDismiss: () => void;
}

export function CrisisOverlay({ onDismiss }: CrisisOverlayProps) {
  const insets = useSafeAreaInsets();
  const emergencyContacts = useUserStore((s) => s.emergencyContacts);

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>You are not alone.</Text>
      <Text style={styles.sub}>Reach out anytime. These are here for you.</Text>

      <Pressable
        style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.pressed]}
        onPress={() => Linking.openURL('tel:988')}
      >
        <Text style={styles.buttonEmoji}>🆘</Text>
        <Text style={styles.buttonText}>Call 988</Text>
        <Text style={styles.buttonSub}>Suicide & Crisis Lifeline</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => Linking.openURL('sms:741741')}
      >
        <Text style={styles.buttonEmoji}>📱</Text>
        <Text style={styles.buttonText}>Text HOME to 741741</Text>
        <Text style={styles.buttonSub}>Crisis Text Line</Text>
      </Pressable>

      {emergencyContacts.slice(0, 3).map((c, i) => (
        <Pressable
          key={`${c.name}-${i}`}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => Linking.openURL(`tel:${c.phone.replace(/\D/g, '')}`)}
        >
          <Text style={styles.buttonEmoji}>👤</Text>
          <Text style={styles.buttonText}>Call {c.name}</Text>
        </Pressable>
      ))}

      <Pressable
        style={({ pressed }) => [styles.button, styles.button911, pressed && styles.pressed]}
        onPress={() => Linking.openURL('tel:911')}
      >
        <Text style={styles.buttonEmoji}>🚨</Text>
        <Text style={styles.buttonText}>Call 911</Text>
      </Pressable>

      <Pressable style={styles.keepTalking} onPress={onDismiss}>
        <Text style={styles.keepTalkingText}>I want to keep talking to Psych</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 9999,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 17,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  button911: {
    borderWidth: 2,
    borderColor: COLORS.temperature.red,
  },
  pressed: { opacity: 0.9 },
  buttonEmoji: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  buttonSub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  keepTalking: {
    marginTop: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  keepTalkingText: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '500',
  },
});
