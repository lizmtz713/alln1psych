/**
 * Adaptive Onboarding - "Try this feature" modal by milestone.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { markInvitationShown } from '../../services/onboardingService';
import type { InvitationId } from '../../types/onboarding';
import type { PendingInvitationPayload } from '../../services/onboardingService';

export interface FeatureInvitationModalProps {
  invitation: PendingInvitationPayload | null;
  onDismiss: () => void;
  onMarkLowState?: () => void;
  onMarkLowConnection?: () => void;
}

export function FeatureInvitationModal(props: FeatureInvitationModalProps) {
  const { invitation, onDismiss } = props;
  const router = useRouter();

  useEffect(() => {
    if (!invitation) return;
    if (invitation.id === 'quick-reset-intro') props.onMarkLowState?.();
    if (invitation.id === 'reach-out-intro') props.onMarkLowConnection?.();
  }, [invitation?.id]);

  const handleCta = () => {
    if (!invitation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markInvitationShown(invitation.id);
    onDismiss();
    router.push(invitation.route as any);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (invitation) markInvitationShown(invitation.id);
    onDismiss();
  };

  if (!invitation) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{invitation.title}</Text>
          <Text style={styles.body}>{invitation.body}</Text>
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]} onPress={handleCta}>
              <Text style={styles.btnPrimaryText}>{invitation.ctaLabel}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]} onPress={handleDismiss}>
              <Text style={styles.btnSecondaryText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  body: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  actions: { gap: SPACING.sm },
  btn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.accent },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  btnSecondary: { alignItems: 'center', paddingVertical: SPACING.sm },
  btnSecondaryText: { fontSize: 14, color: COLORS.textMuted },
  pressed: { opacity: 0.8 },
});
