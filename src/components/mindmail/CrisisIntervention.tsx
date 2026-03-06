/**
 * Mind Mail Safety - Crisis intervention: 988, Crisis Text Line.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import { CRISIS_RESOURCES } from '../../types/mindMail';

export interface CrisisInterventionProps {
  message?: string;
  onDismiss?: () => void;
  variant?: 'sender' | 'receiver';
}

export function CrisisIntervention(props: CrisisInterventionProps) {
  const { message, onDismiss } = props;

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL('tel:' + phone);
  };
  const handleText = (textNumber?: string) => {
    if (textNumber) Linking.openURL('sms:' + textNumber + '?body=HOME');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>We care about you</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Text style={styles.sub}>
        If you are in crisis or having thoughts of hurting yourself, please reach out.
      </Text>
      {CRISIS_RESOURCES.map((r) => (
        <View key={r.name} style={styles.resourceRow}>
          <View style={styles.resourceText}>
            <Text style={styles.resourceName}>{r.name}</Text>
            <Text style={styles.resourceAction}>{r.action}</Text>
          </View>
          <View style={styles.buttons}>
            {r.phone && (
              <Pressable style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]} onPress={() => handleCall(r.phone)}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Call</Text>
              </Pressable>
            )}
            {(r.textNumber || r.phone) && (
              <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={() => handleText(r.textNumber || r.phone)}>
                <Ionicons name="chatbubble" size={18} color={COLORS.accent} />
                <Text style={styles.btnText}>Text</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
      {onDismiss && (
        <Pressable style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]} onPress={onDismiss}>
          <Text style={styles.dismissText}>I am not in crisis - continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.warning, padding: SPACING.lg },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  message: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  sub: { fontSize: 13, lineHeight: 18, color: COLORS.textSecondary, marginBottom: SPACING.md },
  resourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm, paddingVertical: SPACING.xs },
  resourceText: {},
  resourceName: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  resourceAction: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  buttons: { flexDirection: 'row', gap: SPACING.sm },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.button, borderWidth: 1, borderColor: COLORS.accent },
  btnPrimary: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  btnPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  btnText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  pressed: { opacity: 0.8 },
  dismiss: { marginTop: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  dismissText: { fontSize: 13, color: COLORS.textMuted },
});
