/**
 * Full-screen crisis overlay — 988, 741741, culturally relevant resources, emergency contacts, 911.
 * Calm, safe design. "I want to keep talking to Psych" dismisses.
 */

import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import { useUserStore } from '../stores/userStore';
import { getRelevantResources } from '../lib/culturalResources';

interface CrisisOverlayProps {
  onDismiss: () => void;
}

const LGBTQ_RESOURCES = [
  { emoji: '🏳️‍⚧️', title: 'Trans Lifeline: 877-565-8860', sub: 'By and for trans people', onPress: () => Linking.openURL('tel:8775658860'), style: 'trans' as const },
  { emoji: '🏳️‍🌈', title: 'Trevor Project: 866-488-7386', sub: 'LGBTQ+ youth crisis support', onPress: () => Linking.openURL('tel:8664887386'), style: 'rainbow' as const },
  { emoji: '💬', title: 'Trevor Text: Text START to 678-678', sub: 'LGBTQ+ text support', onPress: () => Linking.openURL('sms:678678'), style: 'rainbow' as const },
];

export function CrisisOverlay({ onDismiss }: CrisisOverlayProps) {
  const insets = useSafeAreaInsets();
  const emergencyContacts = useUserStore((s) => s.emergencyContacts);
  const sensitiveTopics = useUserStore((s) => s.sensitiveTopics);
  const culturalBackground = useUserStore((s) => s.culturalBackground) ?? [];
  const showLGBTQFirst =
    sensitiveTopics?.includes('gender-identity-dysphoria') ||
    sensitiveTopics?.includes('coming-out');

  const relevantResources = getRelevantResources(culturalBackground);

  const lgbtqButtons = (
    <>
      {LGBTQ_RESOURCES.map((r, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.button,
            r.style === 'trans' && styles.buttonTrans,
            r.style === 'rainbow' && styles.buttonRainbow,
            pressed && styles.pressed,
          ]}
          onPress={r.onPress}
        >
          <Text style={styles.buttonEmoji}>{r.emoji}</Text>
          <Text style={styles.buttonText}>{r.title}</Text>
          <Text style={styles.buttonSub}>{r.sub}</Text>
        </Pressable>
      ))}
    </>
  );

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>You are not alone.</Text>
      <Text style={styles.sub}>Reach out anytime. These are here for you.</Text>

      {showLGBTQFirst && lgbtqButtons}

      {relevantResources.map((r, i) => (
        <Pressable
          key={`${r.name}-${i}`}
          style={({ pressed }) => [
            styles.button,
            r.number === '988' && styles.buttonPrimary,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            if (r.number) Linking.openURL('tel:' + r.number.replace(/\D/g, ''));
            else if (r.url) Linking.openURL(r.url);
          }}
        >
          <Text style={styles.buttonEmoji}>{r.number ? '🆘' : '🔗'}</Text>
          <Text style={styles.buttonText}>{r.name}</Text>
          <Text style={styles.buttonSub}>{r.subtitle}</Text>
        </Pressable>
      ))}

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
  buttonTrans: {
    borderLeftWidth: 4,
    borderLeftColor: '#5BCEFA',
  },
  buttonRainbow: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9B54',
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
