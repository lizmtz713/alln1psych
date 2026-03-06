/**
 * Mind Mail Safety — Block sender, Report message (for receiver).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/constants';
import type { ReportReason } from '../../types/mindMail';
import { blockSender, reportMessage } from '../../services/mindMailSafetyService';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'abuse', label: 'Abuse' },
  { value: 'spam', label: 'Spam' },
  { value: 'unwanted', label: 'Unwanted contact' },
  { value: 'other', label: 'Other' },
];

export interface MessageActionsProps {
  messageId: string;
  /** Sender user id or anonymous token for block */
  senderIdOrToken: string;
  /** Display label (e.g. "Someone in your Circle") */
  senderLabel: string;
  isAnonymous: boolean;
  onBlocked?: () => void;
}

export function MessageActions({
  messageId,
  senderIdOrToken,
  senderLabel,
  isAnonymous,
  onBlocked,
}: MessageActionsProps) {
  const [reporting, setReporting] = useState(false);

  const handleBlock = () => {
    Alert.alert(
      'Block sender?',
      `You won't receive future messages from ${senderLabel}. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await blockSender(senderIdOrToken);
            Alert.alert('Blocked', `You won't receive messages from ${senderLabel} anymore.`);
            onBlocked?.();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...REPORT_REASONS.map((r) => r.label)],
          cancelButtonIndex: 0,
          destructiveButtonIndex: undefined,
        },
        async (index) => {
          if (index === 0) return;
          const reason = REPORT_REASONS[index - 1];
          if (reason) {
            setReporting(true);
            await reportMessage(messageId, reason.value);
            setReporting(false);
            Alert.alert('Report submitted', 'Thank you. We take safety seriously and will review this.');
          }
        }
      );
    } else {
      Alert.alert(
        'Report message',
        'Choose a reason:',
        [
          { text: 'Cancel', style: 'cancel' },
          ...REPORT_REASONS.map((r) => ({
            text: r.label,
            onPress: async () => {
              setReporting(true);
              await reportMessage(messageId, r.value);
              setReporting(false);
              Alert.alert('Report submitted', 'Thank you. We take safety seriously.');
            },
          })),
        ]
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        onPress={handleBlock}
      >
        <Ionicons name="ban" size={18} color={COLORS.textSecondary} />
        <Text style={styles.actionText}>Block sender</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        onPress={handleReport}
        disabled={reporting}
      >
        <Ionicons name="flag" size={18} color={COLORS.textSecondary} />
        <Text style={styles.actionText}>{reporting ? 'Reporting…' : 'Report'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    ...TYPOGRAPHY.secondary,
    color: COLORS.textSecondary,
  },
  pressed: { opacity: 0.8 },
});
