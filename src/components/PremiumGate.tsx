/**
 * PremiumGate — Shows upsell when user hits free tier limits
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import { usePremiumStore } from '../stores/premiumStore';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  feature?: 'ai' | 'voice' | 'circle' | 'replay';
}

const FEATURE_COPY = {
  ai: {
    title: "You've used your 3 free chats today",
    subtitle: 'Psych is here whenever you need — upgrade for unlimited conversations.',
    icon: 'chatbubbles',
  },
  voice: {
    title: 'Voice mode is a premium feature',
    subtitle: 'Hear Psych speak back to you with natural voice responses.',
    icon: 'mic',
  },
  circle: {
    title: 'Expand your Circle',
    subtitle: 'Connect with unlimited people who care about you.',
    icon: 'people',
  },
  replay: {
    title: 'Unlimited Replay sessions',
    subtitle: 'Process as many life moments as you need.',
    icon: 'refresh',
  },
};

const PREMIUM_FEATURES = [
  { icon: 'chatbubbles', text: 'Unlimited AI conversations' },
  { icon: 'mic', text: 'Voice mode — hear Psych speak' },
  { icon: 'people', text: 'Unlimited Circle connections' },
  { icon: 'refresh', text: 'Unlimited Replay sessions' },
  { icon: 'star', text: 'Early access to new features' },
];

export function PremiumGate({ visible, onClose, feature = 'ai' }: PremiumGateProps) {
  const copy = FEATURE_COPY[feature];
  
  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Integrate with RevenueCat or App Store
    // For now, just close and show coming soon
    onClose();
  };
  
  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Restore purchases
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </Pressable>

          {/* Header */}
          <View style={styles.iconWrap}>
            <Ionicons name={copy.icon as any} size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>

          {/* Features list */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>InGauge Premium includes:</Text>
            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name={f.icon as any} size={20} color={COLORS.accent} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceWrap}>
            <Text style={styles.price}>$9.99</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
          <Text style={styles.priceHint}>Cancel anytime. Your growth matters more than a subscription.</Text>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.upgradeButton, pressed && styles.upgradeButtonPressed]}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </Pressable>

          <Pressable style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore purchase</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline premium badge for feature labels
 */
export function PremiumBadge() {
  return (
    <View style={styles.badge}>
      <Ionicons name="star" size={10} color="#FFD700" />
      <Text style={styles.badgeText}>PRO</Text>
    </View>
  );
}

/**
 * Usage indicator for free tier
 */
export function AIUsageIndicator() {
  const remaining = usePremiumStore((s) => s.getRemainingAIChats());
  const isPremium = usePremiumStore((s) => s.isPremium());
  
  if (isPremium) return null;
  if (remaining === Infinity) return null;
  
  return (
    <View style={styles.usageIndicator}>
      <Text style={styles.usageText}>
        {remaining > 0 
          ? `${remaining} chat${remaining !== 1 ? 's' : ''} left today`
          : 'No chats left today'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  features: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.text,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceUnit: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  priceHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFD700' + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD700',
  },
  usageIndicator: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
