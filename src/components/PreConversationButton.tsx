/**
 * PreConversationButton — A gentle prompt to check your system before high-stakes interactions
 * 
 * Design philosophy: Empowering, not blocking. "Would you like to..." Insert pause without control.
 * Shows State gauge value and offers regulation options.
 */
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import { useCockpitStore } from '../stores/cockpitStore';

const AMBER = COLORS.amber;
const AMBER_BG = COLORS.amberBg;
const AMBER_BORDER = COLORS.amberBorder;
const GREEN = COLORS.green;

interface PreConversationButtonProps {
  /** Where to return after pre-conversation check */
  returnTo?: string;
  /** Custom label (default: "Check your system first?") */
  label?: string;
  /** Show even when State is regulated */
  alwaysShow?: boolean;
  /** Compact mode for inline use */
  compact?: boolean;
}

function getStateLabel(value: number): string {
  if (value < 0) return 'Not set';
  if (value < 25) return 'Very activated';
  if (value < 40) return 'Activated';
  if (value < 60) return 'Settling';
  if (value < 75) return 'Calm';
  return 'Grounded';
}

function getStateColor(value: number): string {
  if (value < 0) return COLORS.textMuted;
  if (value < 40) return AMBER;
  if (value < 60) return COLORS.yellow;
  return GREEN;
}

export function PreConversationButton({ 
  returnTo,
  label,
  alwaysShow = false,
  compact = false,
}: PreConversationButtonProps) {
  const router = useRouter();
  const stateValue = useCockpitStore((s) => s.state.value);
  const systemMode = useCockpitStore((s) => s.systemMode);
  
  const isActivated = stateValue >= 0 && stateValue < 50;
  const isStabilization = systemMode === 'stabilization';
  const stateColor = getStateColor(stateValue);
  const stateLabel = getStateLabel(stateValue);
  
  // Only show if activated, in stabilization mode, or alwaysShow is true
  const shouldShow = alwaysShow || isActivated || isStabilization;
  if (!shouldShow) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(modals)/pre-conversation-check',
      params: returnTo ? { returnTo } : undefined,
    });
  };

  const handleQuickReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/quick-reset');
  };

  if (compact) {
    return (
      <Pressable style={styles.compactContainer} onPress={handlePress}>
        <View style={styles.compactContent}>
          <Ionicons name="pulse-outline" size={16} color={stateColor} />
          <Text style={styles.compactText}>
            State: {stateValue >= 0 ? stateValue : '—'} ({stateLabel.toLowerCase()})
          </Text>
          {isActivated && (
            <Pressable 
              style={styles.compactResetBtn} 
              onPress={(e) => { e.stopPropagation(); handleQuickReset(); }}
              hitSlop={8}
            >
              <Text style={styles.compactResetText}>Regulate?</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          isActivated && styles.cardActivated,
          pressed && styles.cardPressed,
        ]}
        onPress={handlePress}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="pulse-outline" 
              size={20} 
              color={isActivated ? AMBER : COLORS.textSecondary} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>
              {label || (isActivated ? 'Your State is activated' : 'Check your system first?')}
            </Text>
            <Text style={styles.sublabel}>
              <Text style={[styles.stateValue, { color: stateColor }]}>
                {stateValue >= 0 ? stateValue : '—'}
              </Text>
              {' '}· {stateLabel}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={COLORS.textMuted} 
          />
        </View>

        {isActivated && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              High-stakes conversations land better on a stable foundation
            </Text>
            <Pressable 
              style={styles.quickResetBtn}
              onPress={(e) => { e.stopPropagation(); handleQuickReset(); }}
            >
              <Ionicons name="refresh" size={14} color={AMBER} />
              <Text style={styles.quickResetText}>Quick Reset</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Minimal inline version for use in tool headers
 */
export function PreConversationInline({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const stateValue = useCockpitStore((s) => s.state.value);
  
  const isActivated = stateValue >= 0 && stateValue < 50;
  if (!isActivated) return null;

  const stateColor = getStateColor(stateValue);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(modals)/pre-conversation-check',
      params: returnTo ? { returnTo } : undefined,
    });
  };

  return (
    <Pressable style={styles.inlineContainer} onPress={handlePress}>
      <View style={[styles.inlineDot, { backgroundColor: stateColor }]} />
      <Text style={styles.inlineText}>
        State: <Text style={{ color: stateColor, fontWeight: '600' }}>{stateValue}</Text>
      </Text>
      <Text style={styles.inlineAction}>Regulate?</Text>
    </Pressable>
  );
}

export default PreConversationButton;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardActivated: {
    backgroundColor: AMBER_BG,
    borderColor: AMBER_BORDER,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stateValue: {
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  quickResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: BORDER_RADIUS.sm,
  },
  quickResetText: {
    fontSize: 13,
    fontWeight: '600',
    color: AMBER,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  compactResetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  compactResetText: {
    fontSize: 13,
    fontWeight: '500',
    color: AMBER,
  },

  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: AMBER_BG,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  inlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inlineText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  inlineAction: {
    fontSize: 13,
    fontWeight: '500',
    color: AMBER,
  },
});
