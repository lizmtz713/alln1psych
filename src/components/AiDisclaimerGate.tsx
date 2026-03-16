/**
 * Shows AI Guidance Notice before first AI use. Blocks children until user taps "I understand".
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLegalConsentStore } from '../stores/legalConsentStore';
import { AI_DISCLAIMER } from '../data/legalDisclaimers';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export function AiDisclaimerGate({ children }: { children: React.ReactNode }) {
  const hasAccepted = useLegalConsentStore((s) => s.hasAcceptedAiDisclaimer());
  const setAiDisclaimerAccepted = useLegalConsentStore((s) => s.setAiDisclaimerAccepted);

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAiDisclaimerAccepted();
  };

  if (hasAccepted) return <>{children}</>;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{AI_DISCLAIMER.title}</Text>
          <Text style={styles.body}>{AI_DISCLAIMER.body}</Text>
          <Pressable style={styles.btn} onPress={handleAccept}>
            <Text style={styles.btnText}>✓ {AI_DISCLAIMER.button}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
  },
  title: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 12 },
  body: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  btn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
