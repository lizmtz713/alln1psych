/**
 * Collision Report — Family Edition (Gottman-inspired post-fight repair)
 * Route: /tools/collision-report
 *
 * Structured form after a fight: what spiked my RPMs, what I misunderstood, my 1% responsibility.
 * Mechanical framing reduces shame; fleet-scoped. Shows recent reports.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';
const LABEL = '#38bdf8';

type CollisionReportRow = {
  id: string;
  what_spiked_my_rpms: string | null;
  what_i_misunderstood: string | null;
  my_one_percent: string | null;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CollisionReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [whatSpikedRpms, setWhatSpikedRpms] = useState('');
  const [whatIMisunderstood, setWhatIMisunderstood] = useState('');
  const [myOnePercent, setMyOnePercent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: recentReports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['collision_reports_recent'],
    queryFn: async (): Promise<CollisionReportRow[]> => {
      const { data, error } = await supabase
        .from('collision_reports')
        .select('id, what_spiked_my_rpms, what_i_misunderstood, my_one_percent, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as CollisionReportRow[];
    },
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to file a Collision Report.');
        setIsSubmitting(false);
        return;
      }

      let fleetId: string | null = null;
      const { data: members } = await supabase
        .from('fleet_members')
        .select('fleet_id')
        .eq('user_id', user.id)
        .limit(1);
      if (members?.[0]) fleetId = members[0].fleet_id;

      const { error } = await supabase.from('collision_reports').insert({
        pilot_id: user.id,
        fleet_id: fleetId,
        what_spiked_my_rpms: whatSpikedRpms.trim() || null,
        what_i_misunderstood: whatIMisunderstood.trim() || null,
        my_one_percent: myOnePercent.trim() || null,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWhatSpikedRpms('');
      setWhatIMisunderstood('');
      setMyOnePercent('');
      queryClient.invalidateQueries({ queryKey: ['collision_reports_recent'] });
      setIsSubmitting(false);
      Alert.alert('Report filed', 'Collision Report saved. Repair attempts help the system recover.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save report.';
      Alert.alert('Error', message);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Collision Report</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Treat the argument like a mechanical failure. No blame—just system data.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>⚠️ WHAT SPIKED MY RPMs?</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What triggered me or raised my intensity? (Not “you made me”—what in the system spiked?)"
            placeholderTextColor={TEXT_MUTED}
            value={whatSpikedRpms}
            onChangeText={setWhatSpikedRpms}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📡 WHAT I MISUNDERSTOOD ABOUT YOUR TELEMETRY</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What I got wrong about your state, intent, or needs."
            placeholderTextColor={TEXT_MUTED}
            value={whatIMisunderstood}
            onChangeText={setWhatIMisunderstood}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>1% MY RESPONSIBILITY FOR THIS CRASH</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What is my 1% of responsibility? (Systemic accountability, not “it was all you” or “all me.”)"
            placeholderTextColor={TEXT_MUTED}
            value={myOnePercent}
            onChangeText={setMyOnePercent}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BG} />
          ) : (
            <Text style={styles.submitLabel}>FILE REPORT</Text>
          )}
        </Pressable>

        {recentReports.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent reports</Text>
            {loadingReports ? (
              <ActivityIndicator size="small" color={CYAN} style={{ marginVertical: SPACING.md }} />
            ) : (
              recentReports.map((r) => (
                <View key={r.id} style={styles.recentCard}>
                  <Text style={styles.recentDate}>{formatDate(r.created_at)}</Text>
                  {(r.what_spiked_my_rpms || r.my_one_percent) && (
                    <Text style={styles.recentPreview} numberOfLines={2}>
                      {r.what_spiked_my_rpms?.trim() || r.my_one_percent?.trim() || '—'}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: TEXT },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  intro: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginBottom: SPACING.xxl,
  },
  section: { marginBottom: SPACING.xxl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: LABEL,
    marginBottom: SPACING.md,
  },
  textArea: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 15,
    color: TEXT,
    minHeight: 96,
  },
  submitBtn: {
    backgroundColor: CYAN,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitBtnDisabled: { opacity: 0.8 },
  submitLabel: { fontSize: 15, fontWeight: '700', color: BG, letterSpacing: 1 },
  recentSection: { marginTop: SPACING.xxl },
  recentTitle: { fontSize: 12, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 1, marginBottom: SPACING.md },
  recentCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: BORDER,
  },
  recentDate: { fontSize: 11, color: TEXT_MUTED, marginBottom: 4 },
  recentPreview: { fontSize: 13, color: TEXT },
});
