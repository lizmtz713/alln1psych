/**
 * StabilizationBanner — Shown when system is under strain
 * 
 * Calm, protective messaging. Never alarming.
 * Offers Quick Reset option but preserves user autonomy.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GaugeKey, GAUGE_TIERS } from '../stores/cockpitStore';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../lib/constants';

const AMBER = '#F59E0B';
const AMBER_BG = 'rgba(245, 158, 11, 0.08)';
const AMBER_BORDER = 'rgba(245, 158, 11, 0.20)';

interface StabilizationBannerProps {
  triggers: GaugeKey[];
  onQuickReset?: () => void;
  onDismiss?: () => void;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export function StabilizationBanner({ triggers, onQuickReset, onDismiss }: StabilizationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const triggerText = triggers.length > 0
    ? triggers.map(t => GAUGE_LABELS[t]).join(' and ')
    : 'Your foundation';

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDismissed(true);
    onDismiss?.();
  };

  const handleQuickReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onQuickReset?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.modeIndicator}>
          <View style={styles.amberDot} />
          <Text style={styles.modeText}>Stabilization Mode</Text>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12}>
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.message}>
        {triggerText} {triggers.length === 1 ? 'needs' : 'need'} some attention right now.
      </Text>
      
      <Text style={styles.subMessage}>
        All tools are available — simpler actions tend to land better when the system is strained.
      </Text>

      <View style={styles.actions}>
        {onQuickReset && (
          <Pressable style={styles.resetButton} onPress={handleQuickReset}>
            <Ionicons name="refresh" size={16} color={AMBER} />
            <Text style={styles.resetText}>Quick Reset</Text>
          </Pressable>
        )}
        <Pressable style={styles.continueButton} onPress={handleDismiss}>
          <Text style={styles.continueText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * ToolCautionModal — Shown before opening deep tools in stabilization mode
 */
interface ToolCautionModalProps {
  visible: boolean;
  toolName: string;
  triggers: GaugeKey[];
  onContinue: () => void;
  onQuickReset?: () => void;
}

export function ToolCautionModal({ visible, toolName, triggers, onContinue, onQuickReset }: ToolCautionModalProps) {
  const triggerText = triggers.length > 0
    ? triggers.map(t => GAUGE_LABELS[t]).join(' and ')
    : 'Your system';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            <Ionicons name="bulb-outline" size={28} color={AMBER} />
          </View>
          
          <Text style={styles.modalTitle}>A note before you start</Text>
          
          <Text style={styles.modalMessage}>
            {triggerText} {triggers.length === 1 ? 'is' : 'are'} running low right now.
            Deep processing works best on a stable foundation.
          </Text>
          
          <Text style={styles.modalSubMessage}>
            You can absolutely continue — or try a Quick Reset first (2 min).
          </Text>

          <View style={styles.modalActions}>
            {onQuickReset && (
              <Pressable 
                style={[styles.modalButton, styles.resetModalButton]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onQuickReset();
                }}
              >
                <Ionicons name="refresh" size={18} color={AMBER} />
                <Text style={styles.resetModalText}>Quick Reset</Text>
              </Pressable>
            )}
            <Pressable 
              style={[styles.modalButton, styles.continueModalButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onContinue();
              }}
            >
              <Text style={styles.continueModalText}>Continue to {toolName}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * StabilizationFooter — Subtle hint shown inside tools during stabilization
 */
export function StabilizationFooter() {
  return (
    <View style={styles.footer}>
      <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
      <Text style={styles.footerText}>
        If this feels harder than usual, it might be your system, not you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AMBER_BG,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AMBER,
  },
  modeText: {
    color: AMBER,
    fontSize: 13,
    fontWeight: '600',
  },
  message: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  subMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: BORDER_RADIUS.md,
  },
  resetText: {
    color: AMBER,
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  continueText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AMBER_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMessage: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubMessage: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalActions: {
    width: '100%',
    gap: SPACING.sm,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
  },
  resetModalButton: {
    backgroundColor: AMBER_BG,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
  },
  resetModalText: {
    color: AMBER,
    fontSize: 15,
    fontWeight: '600',
  },
  continueModalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  continueModalText: {
    color: COLORS.text,
    fontSize: 15,
  },

  // Footer styles
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
  },
});
