/**
 * Post-Flight Logger — Family Edition (evening debrief)
 * Route: /tools/post-flight-logger
 *
 * Log daily fuel level, pothole report, and mechanic's thanks. Fleet-scoped.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { supabase } from '../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';
const LABEL = '#38bdf8';

export default function PostFlightLoggerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const trackWidthRef = useRef(0);

  const [fuelLevel, setFuelLevel] = useState(50);
  const [potholeReport, setPotholeReport] = useState('');
  const [mechanicsThanks, setMechanicsThanks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  };

  const onTrackPress = (e: { nativeEvent: { locationX: number } }) => {
    const w = trackWidthRef.current;
    if (w <= 0) return;
    const pct = Math.round((e.nativeEvent.locationX / w) * 100);
    const clamped = Math.min(100, Math.max(0, pct));
    setFuelLevel(clamped);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to log flight data.');
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

      const { error } = await supabase.from('post_flight_logs').insert({
        pilot_id: user.id,
        fleet_id: fleetId,
        fuel_remaining: fuelLevel,
        pothole_report: potholeReport.trim() || null,
        mechanics_thanks: mechanicsThanks.trim() || null,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Flight data logged', 'Flight data logged successfully. Rest well, Pilot.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not log flight data.';
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
        <Text style={styles.headerTitle}>Post-Flight Debrief</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Odometer */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CURRENT FUEL LEVEL (%)</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.fuelValue}>{fuelLevel}</Text>
            <Pressable
              style={styles.trackWrap}
              onLayout={onTrackLayout}
              onPress={onTrackPress}
            >
              <View style={[styles.track, styles.trackBg]}>
                <View style={[styles.trackFill, { width: `${fuelLevel}%` }]} />
              </View>
            </Pressable>
          </View>
          <Text style={styles.subtext}>How much capacity do you have left at the end of this route?</Text>
        </View>

        {/* Section 2: Pothole Report */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🕳️ POTHOLE REPORT</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What drained your system today? (e.g., test anxiety, sibling argument)"
            placeholderTextColor={TEXT_MUTED}
            value={potholeReport}
            onChangeText={setPotholeReport}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        {/* Section 3: Mechanic's Thanks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>💙 MECHANIC'S THANKS</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Name one thing a fleet member did to help the system run smoothly."
            placeholderTextColor={TEXT_MUTED}
            value={mechanicsThanks}
            onChangeText={setMechanicsThanks}
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
            <Text style={styles.submitLabel}>LOG FLIGHT DATA</Text>
          )}
        </Pressable>
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
  section: { marginBottom: SPACING.xxl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: LABEL,
    marginBottom: SPACING.md,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fuelValue: { fontSize: 24, fontWeight: '700', color: TEXT, minWidth: 44, textAlign: 'right' },
  trackWrap: { flex: 1, height: 32, justifyContent: 'center' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  trackBg: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: CYAN, borderRadius: 5 },
  subtext: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
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
});
