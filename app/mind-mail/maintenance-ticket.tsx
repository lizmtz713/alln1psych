/**
 * Maintenance Ticket — Mind Mail / Family Edition
 * Route: /mind-mail/maintenance-ticket
 *
 * Pilot (Teen) requests low-demand support from Ground Control (Parent)
 * when system is Amber or Red. Async, structured — like a technical
 * diagnostic report, not an emotional text.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../src/lib/constants';

// Vehicle diagnostic / flight manual palette
const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const LABEL = '#38bdf8';
const AMBER = '#f59e0b';
const CYAN = '#22d3ee';
const RED = '#ef4444';

type SystemStatus = 'amber' | 'red';

const RESOURCE_OPTIONS: { id: string; emoji: string; label: string; desc: string }[] = [
  { id: 'silent', emoji: '🤫', label: 'Silent Parking', desc: 'Need space, no talking' },
  { id: 'fuel', emoji: '⛽', label: 'High-Octane Fuel', desc: 'Bring food/water, leave at door' },
  { id: 'presence', emoji: '🎧', label: 'Passive Presence', desc: 'Sit in the same room, no questions' },
  { id: 'navigation', emoji: '🗺️', label: 'Navigation Help', desc: 'Need help breaking down a task later' },
];

export default function MaintenanceTicketScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [resources, setResources] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleResource = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (systemStatus == null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to submit a maintenance ticket.');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('maintenance_tickets').insert({
        sender_id: user.id,
        system_status: systemStatus,
        requested_resources: Array.from(resources),
        notes: notes.trim() || null,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Transmission Successful', 'Ground Control notified.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Transmission failed. Try again.';
      Alert.alert('Transmission failed', message, [{ text: 'OK' }]);
      setIsSubmitting(false);
    }
  };

  const submitBorder = systemStatus === 'red' ? AMBER : CYAN;
  const canSubmit = systemStatus != null && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Submit Maintenance Ticket</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Current Telemetry */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SYSTEM STATUS</Text>
          <View style={styles.radioRow}>
            <Pressable
              style={[
                styles.radioOption,
                systemStatus === 'amber' && styles.radioOptionSelected,
                systemStatus === 'amber' && { borderColor: AMBER, backgroundColor: AMBER + '18' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSystemStatus('amber');
              }}
            >
              <View style={[styles.radioDot, systemStatus === 'amber' && { backgroundColor: AMBER }]} />
              <Text style={styles.radioLabel}>Amber (Stabilizing)</Text>
            </Pressable>
            <Pressable
              style={[
                styles.radioOption,
                systemStatus === 'red' && styles.radioOptionSelected,
                systemStatus === 'red' && { borderColor: RED, backgroundColor: RED + '18' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSystemStatus('red');
              }}
            >
              <View style={[styles.radioDot, systemStatus === 'red' && { backgroundColor: RED }]} />
              <Text style={styles.radioLabel}>Red (Critical Overload)</Text>
            </Pressable>
          </View>
        </View>

        {/* Section 2: Requested Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REQUIRED RESOURCES (CHECK ALL THAT APPLY)</Text>
          {RESOURCE_OPTIONS.map((opt) => {
            const checked = resources.has(opt.id);
            return (
              <Pressable
                key={opt.id}
                style={[styles.checkOption, checked && styles.checkOptionChecked]}
                onPress={() => toggleResource(opt.id)}
              >
                <View style={[styles.checkbox, checked && { borderColor: LABEL, backgroundColor: LABEL + '20' }]}>
                  {checked && <Ionicons name="checkmark" size={16} color={LABEL} />}
                </View>
                <View style={styles.checkContent}>
                  <Text style={styles.checkLabel}>
                    {opt.emoji} {opt.label}
                  </Text>
                  <Text style={styles.checkDesc}>{opt.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Section 3: Transmission (optional notes) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRANSMISSION</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Optional: Log brief system notes here..."
            placeholderTextColor={TEXT_MUTED}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[
            styles.submitBtn,
            { borderColor: submitBorder, backgroundColor: canSubmit ? submitBorder + '22' : SURFACE },
            canSubmit && { shadowColor: submitBorder, shadowOpacity: 0.4, shadowRadius: 12, elevation: 4 },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={submitBorder} />
          ) : (
            <Ionicons name="send" size={18} color={canSubmit ? submitBorder : TEXT_MUTED} />
          )}
          <Text style={[styles.submitLabel, { color: canSubmit ? submitBorder : TEXT_MUTED }]}>
            {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT TO GROUND CONTROL'}
          </Text>
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: LABEL,
    marginBottom: SPACING.md,
  },
  radioRow: {
    gap: SPACING.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  radioOptionSelected: {
    borderWidth: 2,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
    marginRight: SPACING.md,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT,
  },
  checkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    marginBottom: SPACING.sm,
  },
  checkOptionChecked: {
    borderColor: LABEL + '55',
    backgroundColor: LABEL + '0c',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkContent: { flex: 1 },
  checkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  checkDesc: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  textArea: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 15,
    color: TEXT,
    minHeight: 100,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    marginTop: SPACING.lg,
  },
  submitLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomPad: {
    height: SPACING.xxl,
  },
});
