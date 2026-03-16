/**
 * Paywall Modal
 * Conversion-optimized upgrade flow
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, APP_CONFIG } from '../lib/constants';
import { PRICING, usePremiumStore } from '../stores/premiumStore';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string; // What feature triggered the paywall
}

const PRO_FEATURES = [
  { icon: 'infinite', text: 'Unlimited AI conversations', highlight: true },
  { icon: 'mic', text: 'Voice responses from Gauge' },
  { icon: 'people', text: 'Full Circle features' },
  { icon: 'finger-print', text: 'Personology deep dives' },
  { icon: 'construct', text: 'All 7 AI tools unlocked' },
];

const FAMILY_FEATURES = [
  { icon: 'home', text: 'Everything in Pro for up to 5 people', highlight: true },
  { icon: 'heart-circle', text: 'Shared family Circle' },
  { icon: 'wallet', text: 'Best value — less than $2/person' },
];

export function PaywallModal({ visible, onClose, feature }: PaywallModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'family'>('pro');
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);
  const _setTier = usePremiumStore((s) => s._setTier);

  const pricing = selectedPlan === 'pro' ? PRICING.pro : PRICING.family;
  const isYearly = billingCycle === 'yearly';

  const handlePurchase = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Implement actual IAP with expo-in-app-purchases or revenue-cat
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
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.title}>Unlock {APP_CONFIG.name}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Feature trigger */}
          {feature && (
            <View style={styles.featureBanner}>
              <Ionicons name="lock-open" size={16} color={COLORS.accent} />
              <Text style={styles.featureText}>
                Unlock {feature}
              </Text>
            </View>
          )}

          {/* Plan Cards */}
          <View style={styles.planCards}>
            {/* Pro Card */}
            <Pressable
              style={[styles.planCard, selectedPlan === 'pro' && styles.planCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedPlan('pro');
              }}
            >
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>Pro</Text>
                {selectedPlan === 'pro' && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                )}
              </View>
              <Text style={styles.planCardPrice}>
                ${isYearly ? PRICING.pro.yearlyPerMonth.toFixed(2) : PRICING.pro.monthly}
                <Text style={styles.planCardPriceUnit}>/mo</Text>
              </Text>
              {isYearly && (
                <Text style={styles.planCardBilled}>Billed ${PRICING.pro.yearly}/year</Text>
              )}
            </Pressable>

            {/* Family Card */}
            <Pressable
              style={[styles.planCard, selectedPlan === 'family' && styles.planCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedPlan('family');
              }}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardTitle}>Family</Text>
                {selectedPlan === 'family' && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                )}
              </View>
              <Text style={styles.planCardPrice}>
                ${isYearly ? PRICING.family.yearlyPerMonth.toFixed(2) : PRICING.family.monthly}
                <Text style={styles.planCardPriceUnit}>/mo</Text>
              </Text>
              {isYearly && (
                <Text style={styles.planCardBilled}>Billed ${PRICING.family.yearly}/year</Text>
              )}
              <Text style={styles.planCardNote}>Up to 5 people</Text>
            </Pressable>
          </View>

          {/* Billing Toggle */}
          <View style={styles.billingToggle}>
            <Pressable
              style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setBillingCycle('yearly');
              }}
            >
              <Text style={[styles.billingOptionText, billingCycle === 'yearly' && styles.billingOptionTextActive]}>
                Yearly
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE ${pricing.savings}</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setBillingCycle('monthly');
              }}
            >
              <Text style={[styles.billingOptionText, billingCycle === 'monthly' && styles.billingOptionTextActive]}>
                Monthly
              </Text>
            </Pressable>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>
              {selectedPlan === 'pro' ? 'Pro includes' : 'Family includes'}
            </Text>
            {(selectedPlan === 'pro' ? PRO_FEATURES : FAMILY_FEATURES).map((item, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIcon, item.highlight && styles.featureIconHighlight]}>
                  <Ionicons name={item.icon as any} size={18} color={item.highlight ? '#fff' : COLORS.accent} />
                </View>
                <Text style={[styles.featureRowText, item.highlight && styles.featureRowTextHighlight]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Free features reminder */}
          <View style={styles.freeReminder}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
            <Text style={styles.freeReminderText}>
              Crisis support is always free — 24/7/365
            </Text>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>
              Join thousands improving their emotional intelligence
            </Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
              <Text style={styles.starsText}>4.9</Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              loading && { opacity: 0.6 },
            ]}
            onPress={handlePurchase}
            disabled={loading}
          >
            <Text style={styles.ctaText}>
              {loading ? 'Processing...' : `Start ${selectedPlan === 'pro' ? 'Pro' : 'Family'} — $${isYearly ? pricing.yearly : pricing.monthly}${isYearly ? '/year' : '/mo'}`}
            </Text>
          </Pressable>
          
          <Text style={styles.ctaSubtext}>
            Cancel anytime. {isYearly ? '7-day' : '3-day'} free trial.
          </Text>

          {/* Footer Links */}
          <View style={styles.footer}>
            <Pressable onPress={handleRestore}>
              <Text style={styles.footerLink}>Restore</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: 20,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  planCards: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  planCardPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  planCardPriceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  planCardBilled: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  planCardNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  billingOptionActive: {
    backgroundColor: COLORS.accent,
  },
  billingOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  billingOptionTextActive: {
    color: '#fff',
  },
  saveBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
    paddingVertical: 10,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconHighlight: {
    backgroundColor: COLORS.accent,
  },
  featureRowText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  featureRowTextHighlight: {
    fontWeight: '600',
  },
  freeReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    marginBottom: 12,
  },
  freeReminderText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  socialProof: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  socialProofText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  ctaSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
