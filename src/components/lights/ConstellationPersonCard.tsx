/**
 * ConstellationPersonCard — Focus zone: name, tier, temperature, quick actions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { ConstellationNode } from '../../types/lightsConstellation';
import { TIER_LABELS } from '../../types/lights';
import { getLightTemperatureLabel } from '../../types/lights';
import { COLORS, SPACING } from '../../lib/constants';

export interface ConstellationPersonCardProps {
  node: ConstellationNode;
  /** Timeline-based summary (e.g. "Last interaction: 3 weeks ago — Call") */
  lastInteractionSummary?: string;
  /** e.g. "Doing well" / "Needs attention" */
  relationshipStrengthLabel?: string;
  /** e.g. "Send a message" */
  recommendedAction?: string;
  onClose: () => void;
  onTransmit?: (node: ConstellationNode) => void;
  onOpenFull: (node: ConstellationNode) => void;
  onLogContact: (node: ConstellationNode) => void;
}

export function ConstellationPersonCard({
  node,
  lastInteractionSummary,
  relationshipStrengthLabel,
  recommendedAction,
  onClose,
  onTransmit,
  onOpenFull,
  onLogContact,
}: ConstellationPersonCardProps) {
  const handleCall = () => {
    if (node.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${node.phone.replace(/\D/g, '')}`);
    }
  };
  const handleText = () => {
    if (node.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`sms:${node.phone.replace(/\D/g, '')}`);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{node.name}</Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.meta}>
        Temperature: {getLightTemperatureLabel(node.temperature)}
        {relationshipStrengthLabel != null ? ` · Relationship: ${relationshipStrengthLabel}` : ''}
      </Text>
      <Text style={styles.days}>
        Last contact: {lastInteractionSummary ?? (node.daysSinceContact === 0
          ? 'today'
          : node.daysSinceContact === 1
            ? '1 day ago'
            : `${node.daysSinceContact} days ago`)}
      </Text>
      {recommendedAction ? (
        <Text style={styles.recommended}>Recommended: {recommendedAction}</Text>
      ) : null}
      {node.note ? (
        <Text style={styles.note} numberOfLines={2}>{node.note}</Text>
      ) : null}

      <View style={styles.actions}>
        {onTransmit && (
          <Pressable
            style={[styles.actionBtn, styles.primaryAction]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTransmit(node);
            }}
          >
            <Text style={styles.primaryActionText}>Transmit</Text>
            <Ionicons name="send" size={18} color={COLORS.text} />
          </Pressable>
        )}
        {node.phone && (
          <>
            <Pressable style={styles.actionBtn} onPress={handleCall}>
              <Ionicons name="call" size={20} color={COLORS.accent} />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleText}>
              <Ionicons name="chatbubble" size={20} color={COLORS.accent} />
              <Text style={styles.actionText}>Text</Text>
            </Pressable>
          </>
        )}
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onLogContact(node);
          }}
        >
          <Ionicons name="create" size={20} color={COLORS.accent} />
          <Text style={styles.actionText}>Log contact</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenFull(node);
          }}
        >
          <Text style={styles.actionText}>Open profile</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, flex: 1 },
  closeBtn: { padding: 4 },
  meta: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  days: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  recommended: { fontSize: 14, fontWeight: '600', color: COLORS.accent, marginBottom: 8 },
  note: { fontSize: 14, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 12 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  primaryAction: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
  },
  primaryActionText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
});
