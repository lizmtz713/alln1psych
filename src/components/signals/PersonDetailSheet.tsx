/**
 * PersonDetailSheet — Bottom sheet from Signals for person detail and quick actions.
 * Keeps users inside Signals; "See full profile" routes to legacy /lights/[id].
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TemperatureGauge } from '../circle/TemperatureGauge';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import { getRelationshipStatusLabel } from '../../lib/signalsCopy';
import { SEASON_LABELS, SEASON_HELPERS } from '../../types/seasons';
import { buildTimelineFromLight, formatTimelineDate } from '../../services/timelineEngine';
import type { TimelineEventType } from '../../types/timeline';
import type { Light } from '../../types/lights';
import type { RelationshipSeason } from '../../types/seasons';
import { useLightsStore } from '../../stores/lightsStore';
import type { LightTier } from '../../types/lights';
import type { MindMailIntent } from '../../types/mindMail';

const TIER_LABELS: Record<LightTier, string> = {
  five: 'Your 5',
  fifteen: 'Your 15',
  fifty: 'Your 50',
  network: 'Your 150',
  archived: 'Archived',
};

function timelineIconForType(type: TimelineEventType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'message_sent': return 'mail-outline';
    case 'call': return 'call-outline';
    case 'meeting': return 'people-outline';
    case 'celebration': return 'heart-outline';
    case 'repair': return 'hand-left-outline';
    case 'milestone': return 'flag-outline';
    case 'season_change': return 'leaf-outline';
    case 'reconnection': return 'heart-outline';
    default: return 'ellipse-outline';
  }
}

function ConnectionTimeline({ light }: { light: Light }) {
  const items = buildTimelineFromLight(light);
  if (items.length === 0) return null;
  return (
    <View style={timelineStyles.section}>
      <Text style={timelineStyles.sectionTitle}>Connection Timeline</Text>
      {items.map((item) => (
        <View key={item.id} style={timelineStyles.row}>
          <View style={timelineStyles.dotWrap}>
            <Ionicons name={timelineIconForType(item.type)} size={14} color={COLORS.textMuted} />
          </View>
          <View style={timelineStyles.textWrap}>
            <Text style={timelineStyles.date}>{formatTimelineDate(item.date)}</Text>
            <Text style={timelineStyles.label}>
              {item.label}
              {item.sublabel ? ` (${item.sublabel})` : ''}
              {item.count != null && item.count > 1 ? ` · ${item.count} this day` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  dotWrap: { width: 24, alignItems: 'center', marginTop: 2 },
  textWrap: { flex: 1 },
  date: { fontSize: 12, color: COLORS.textMuted, marginBottom: 1 },
  label: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
});

function SeasonControl({
  memberId,
  season,
  onClose,
}: {
  memberId: string;
  season: RelationshipSeason;
  onClose: () => void;
}) {
  const setSeason = useLightsStore((s) => s.setSeason);
  if (season === 'archived') return null;

  if (season === 'dormant') {
    return (
      <Pressable
        style={({ pressed }) => [seasonControlStyles.pill, pressed && seasonControlStyles.pillPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSeason(memberId, 'growth');
          onClose();
        }}
      >
        <Text style={seasonControlStyles.pillText}>Reconnect</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [seasonControlStyles.pill, pressed && seasonControlStyles.pillPressed]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSeason(memberId, 'dormant');
      }}
    >
      <Text style={seasonControlStyles.pillText}>Mark as Dormant</Text>
    </Pressable>
  );
}

const seasonControlStyles = StyleSheet.create({
  pill: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.input ?? 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillPressed: { opacity: 0.9 },
  pillText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
});

/** Direct communication — native rails (Apple Messages, Phone, Mail). InGauge stays the brain; Apple handles delivery. */
const DIRECT_ACTIONS: { id: 'text' | 'call' | 'email'; label: string; icon: keyof typeof Ionicons.glyphMap; needPhone?: boolean; needEmail?: boolean }[] = [
  { id: 'text', label: 'Text', icon: 'chatbubble-outline', needPhone: true },
  { id: 'call', label: 'Call', icon: 'call-outline', needPhone: true },
  { id: 'email', label: 'Email', icon: 'mail-outline', needEmail: true },
];

/** InGauge communication — guided relational layer (Transmit, intents). */
const SECONDARY_ACTIONS: { id: string; label: string; emoji: string }[] = [
  { id: 'check-in', label: 'Check in', emoji: '👋' },
  { id: 'appreciate', label: 'Appreciate', emoji: '🙏' },
  { id: 'support', label: 'Support', emoji: '💛' },
  { id: 'repair', label: 'Repair', emoji: '🤝' },
  { id: 'celebrate', label: 'Celebrate', emoji: '🎉' },
  { id: 'transmit', label: 'Transmit', emoji: '💌' },
];

export interface PersonDetailSheetProps {
  visible: boolean;
  light: Light | null;
  needsAttention: boolean;
  onClose: () => void;
  /** (recipientId, recipientName, optional preset intent e.g. 'encouragement') */
  onTransmit: (recipientId: string, recipientName: string, presetIntent?: MindMailIntent) => void;
  onQuickAction?: (actionId: string, light: Light) => void;
  onSeeFullProfile: (lightId: string) => void;
}

export function PersonDetailSheet({
  visible,
  light,
  needsAttention,
  onClose,
  onTransmit,
  onQuickAction,
  onSeeFullProfile,
}: PersonDetailSheetProps) {
  const insets = useSafeAreaInsets();

  if (!light) return null;

  const statusLabel = getRelationshipStatusLabel(light, needsAttention);
  const circleTemp =
    light.sharedTemperature?.label === 'warm'
      ? 'green'
      : light.sharedTemperature?.label === 'neutral'
        ? 'yellow'
        : light.sharedTemperature?.label === 'cool'
          ? 'orange'
          : 'green';

  const handlePrimaryTransmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTransmit(light.id, light.name, 'encouragement');
    onClose();
  };

  const phoneDigits = light.phone?.replace(/\D/g, '') ?? '';
  const hasPhone = phoneDigits.length >= 10;
  const hasEmail = !!light.email?.trim();

  const handleDirectAction = (actionId: 'text' | 'call' | 'email') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (actionId === 'call' && hasPhone) Linking.openURL(`tel:${phoneDigits}`);
    if (actionId === 'text' && hasPhone) Linking.openURL(`sms:${phoneDigits}`);
    if (actionId === 'email' && hasEmail) Linking.openURL(`mailto:${light.email!.trim()}`);
    onClose();
  };

  const handleAction = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (actionId === 'transmit') {
      onTransmit(light.id, light.name);
      onClose();
      return;
    }
    onQuickAction?.(actionId, light);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{light.name}</Text>
          <Pressable style={styles.closeBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <View style={styles.avatarWrap}>
              <TemperatureGauge temperature={circleTemp as 'green' | 'yellow' | 'orange' | 'red'} size="md" noPulse />
            </View>
            <Text style={styles.name}>{light.name}</Text>
            <Text style={styles.circleLabel}>{TIER_LABELS[light.tier]}</Text>
            <Text style={[styles.status, needsAttention && styles.statusAttention]}>{statusLabel}</Text>
            {light.season && (
              <View style={styles.seasonWrap}>
                <Text style={styles.seasonLabel}>Season: {SEASON_LABELS[light.season]}</Text>
                <Text style={styles.seasonHelper}>{SEASON_HELPERS[light.season]}</Text>
                <SeasonControl memberId={light.id} season={light.season} onClose={onClose} />
              </View>
            )}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Last contact {light.daysSinceContact} days ago
              {light.relationshipType ? ` · ${light.relationshipType}` : ''}
            </Text>
          </View>

          <ConnectionTimeline light={light} />

          <View style={styles.actionsSection}>
            <Text style={styles.directLabel}>Reach them directly</Text>
            <View style={styles.directRow}>
              {DIRECT_ACTIONS.map((a) => {
                const enabled = (a.needPhone && hasPhone) || (a.needEmail && hasEmail);
                return (
                  <Pressable
                    key={a.id}
                    style={[styles.directBtn, !enabled && styles.directBtnDisabled]}
                    onPress={() => enabled && handleDirectAction(a.id)}
                    disabled={!enabled}
                  >
                    <Ionicons name={a.icon} size={20} color={enabled ? COLORS.accent : COLORS.textMuted} />
                    <Text style={[styles.directBtnLabel, !enabled && styles.directBtnLabelDisabled]}>{a.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={({ pressed }) => [styles.primaryCta, pressed && styles.primaryCtaPressed]}
              onPress={handlePrimaryTransmit}
            >
              <Text style={styles.primaryCtaEmoji}>✨</Text>
              <Text style={styles.primaryCtaLabel}>Transmit</Text>
            </Pressable>
            <Text style={styles.secondaryLabel}>Share thoughtfully</Text>
            <View style={styles.secondaryRow}>
              {SECONDARY_ACTIONS.map((a) => (
                <Pressable
                  key={a.id}
                  style={({ pressed }) => [styles.actionPill, pressed && styles.actionPillPressed]}
                  onPress={() => handleAction(a.id)}
                >
                  <Text style={styles.actionEmoji}>{a.emoji}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.fullProfileLink, pressed && styles.fullProfileLinkPressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSeeFullProfile(light.id);
              onClose();
            }}
          >
            <Text style={styles.fullProfileLinkText}>See full profile</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  closeBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: SPACING.xl },
  identity: { alignItems: 'center', marginBottom: SPACING.lg },
  avatarWrap: { marginBottom: SPACING.sm },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  circleLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  status: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  statusAttention: { color: COLORS.temperature?.orange ?? '#F97316' },
  seasonWrap: { marginTop: SPACING.sm },
  seasonLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  seasonHelper: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, fontStyle: 'italic', maxWidth: 260 },
  summary: { marginBottom: SPACING.lg },
  summaryText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  actionsSection: { marginBottom: SPACING.xl },
  directLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  directRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.lg },
  directBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.input ?? 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  directBtnDisabled: { opacity: 0.5 },
  directBtnLabel: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  directBtnLabelDisabled: { color: COLORS.textMuted },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.button ?? 12,
    backgroundColor: COLORS.accent,
    gap: 10,
    marginBottom: SPACING.md,
  },
  primaryCtaPressed: { opacity: 0.92 },
  primaryCtaEmoji: { fontSize: 20 },
  primaryCtaLabel: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginBottom: 10 },
  secondaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  actionPillPressed: { opacity: 0.9 },
  actionEmoji: { fontSize: 18 },
  actionLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  fullProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  fullProfileLinkPressed: { opacity: 0.9 },
  fullProfileLinkText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
});
