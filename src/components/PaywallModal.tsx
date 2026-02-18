/**
 * Paywall Modal
 * Shows upgrade options when user hits a premium feature
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';
import { PRICING, usePremiumStore } from '../stores/premiumStore';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string; // What feature triggered the paywall
}

const FEATURES = {
  free: [
    { icon: 'shield-checkmark', text: 'Crisis support 24/7 forever' },
    { icon: 'speedometer', text: 'All 6 gauges + daily check-ins' },
    { icon: 'book', text: 'Full Human Manual (48 lessons)' },
    { icon: 'chatbubbles', text: '3 AI chats per day' },
  ],
  pro: [
    { icon: 'infinite', text: 'Unlimited AI conversations' },
    { icon: 'mic', text: 'Voice responses from Psych' },
    { icon: 'people', text: 'Full Circle features' },
    { icon: 'finger-print', text: 'Personology deep dives' },
    { icon: 'construct', text: 'All 7 AI tools unlocked' },
  ],
  family: [
    { icon: 'home', text: 'Pro features for up to 5 people' },
    { icon: 'heart-circle', text: 'Shared family Circle' },
    { icon: 'wallet', text: 'Best value for families' },
  ],
};

export function PaywallModal({ visible, onClose, feature }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'family'>('pro');
  const [loading, setLoading] = useState(false);
  const _setTier = usePremiumStore((s) => s._setTier);

  const handlePurchase = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Implement actual IAP with expo-in-app-purchases or revenue-cat
    // For now, just show coming soon
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Coming Soon! 🚀',
        'Premium subscriptions are launching soon. You\'ll be the first to know!',
        [{ text: 'Can\'t wait!', onPress: onClose }]
      );
    }, 500);
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Restore Purchases', 'No previous purchases found.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        {/* Feature trigger */}
        {feature && (
          <View style={styles.featureBanner}>
            <Ionicons name="sparkles" size={16} color={COLORS.accent} />
            <Text style={styles.featureText}>
              Unlock {feature} with Pro
            </Text>
          </View>
        )}

        {/* Plan Toggle */}
        <View style={styles.planToggle}>
          <Pressable
            style={[styles.planTab, selectedPlan === 'pro' && styles.planTabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan('pro');
            }}
          >
            <Text style={[styles.planTabText, selectedPlan === 'pro' && styles.planTabTextActive]}>
              Pro
            </Text>
          </Pressable>
          <Pressable
            style={[styles.planTab, selectedPlan === 'family' && styles.planTabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan('family');
            }}
          >
            <Text style={[styles.planTabText, selectedPlan === 'family' && styles.planTabTextActive]}>
              Family
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>BEST VALUE</Text>
            </View>
          </Pressable>
        </View>

        {/* Price Display */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            ${selectedPlan === 'pro' ? PRICING.pro.monthly : PRICING.family.monthly}
          </Text>
          <Text style={styles.priceUnit}>/month</Text>
        </View>
        {selectedPlan === 'family' && (
          <Text style={styles.familyNote}>For up to 5 family members</Text>
        )}

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>
            {selectedPlan === 'pro' ? 'Everything in Pro' : 'Family includes'}
          </Text>
          {(selectedPlan === 'pro' ? FEATURES.pro : FEATURES.family).map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.accent} />
              <Text style={styles.featureRowText}>{item.text}</Text>
            </View>
          ))}
          
          {selectedPlan === 'family' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Plus all Pro features</Text>
              {FEATURES.pro.slice(0, 3).map((item, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.textSecondary} />
                  <Text style={[styles.featureRowText, { color: COLORS.textSecondary }]}>{item.text}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Free features reminder */}
        <View style={styles.freeReminder}>
          <Ionicons name="heart" size={16} color={COLORS.success} />
          <Text style={styles.freeReminderText}>
            Crisis support is always free, 24/7/365
          </Text>
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.9 },
            loading && { opacity: 0.6 },
          ]}
          onPress={handlePurchase}
          disabled={loading}
        >
          <Text style={styles.ctaText}>
            {loading ? 'Processing...' : `Start ${selectedPlan === 'pro' ? 'Pro' : 'Family'} Plan`}
          </Text>
        </Pressable>

        {/* Restore / Terms */}
        <View style={styles.footer}>
          <Pressable onPress={handleRestore}>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </Pressable>
          <Text style={styles.footerDot}>•</Text>
          <Pressable>
            <Text style={styles.footerLink}>Terms</Text>
          </Pressable>
          <Text style={styles.footerDot}>•</Text>
          <Pressable>
            <Text style={styles.footerLink}>Privacy</Text>
          </Pressable>
        </View>

        {/* Dev toggle */}
        {__DEV__ && (
          <Pressable
            style={styles.devButton}
            onPress={() => {
              _setTier(selectedPlan);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onClose();
            }}
          >
            <Text style={styles.devButtonText}>DEV: Activate {selectedPlan}</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent + '15',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  planTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  planTabActive: {
    backgroundColor: COLORS.accent,
  },
  planTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  planTabTextActive: {
    color: '#fff',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceUnit: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  familyNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureRowText: {
    fontSize: 15,
    color: COLORS.text,
  },
  freeReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  freeReminderText: {
    fontSize: 13,
    color: COLORS.success,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  footerDot: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  devButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
