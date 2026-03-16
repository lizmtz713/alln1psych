/**
 * Fleet Management — Link devices and manage crew
 * Route: /(tabs)/people/fleet-management
 *
 * Ground Control: create a fleet, get invite code.
 * Pilot: enter invite code to join and sync telemetry.
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

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';
const LABEL = '#38bdf8';

function generateInviteCode(): string {
  const letter = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rest = '';
  for (let i = 0; i < 4; i++) rest += chars[Math.floor(Math.random() * chars.length)];
  return `${letter}-${rest}`;
}

export default function FleetManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fleetDesignation, setFleetDesignation] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCreateFleet = async () => {
    const name = fleetDesignation.trim();
    if (!name) {
      Alert.alert('Fleet Designation required', 'Enter a name for your fleet.');
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to create a fleet.');
        setCreating(false);
        return;
      }

      const code = generateInviteCode();

      const { data: fleet, error: fleetError } = await supabase
        .from('fleet_groups')
        .insert({ fleet_name: name, invite_code: code })
        .select('id')
        .single();

      if (fleetError) throw fleetError;
      if (!fleet?.id) throw new Error('Fleet not created');

      const { error: memberError } = await supabase
        .from('fleet_members')
        .insert({ fleet_id: fleet.id, user_id: user.id, role: 'ground_control' });

      if (memberError) throw memberError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Fleet initialized', `Invite code: ${code}\n\nShare this code with Pilots to link devices.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create fleet.';
      Alert.alert('Error', message);
      setCreating(false);
    }
  };

  const handleJoinFleet = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Invite code required', 'Enter the 6-character code from Ground Control.');
      return;
    }

    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to join a fleet.');
        setJoining(false);
        return;
      }

      const { data: fleet, error: lookupError } = await supabase
        .from('fleet_groups')
        .select('id')
        .eq('invite_code', code)
        .single();

      if (lookupError || !fleet?.id) {
        Alert.alert('Invalid code', 'No fleet found for this invite code. Check and try again.');
        setJoining(false);
        return;
      }

      const { error: memberError } = await supabase
        .from('fleet_members')
        .insert({ fleet_id: fleet.id, user_id: user.id, role: 'pilot' });

      if (memberError) {
        if (memberError.code === '23505') {
          Alert.alert('Already joined', 'You are already in this fleet.');
        } else throw memberError;
        setJoining(false);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Telemetry synced', 'You are now linked to Ground Control.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not join fleet.';
      Alert.alert('Error', message);
      setJoining(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Fleet Operations</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Establish Ground Control */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ESTABLISH GROUND CONTROL (CREATE FLEET)</Text>
          <TextInput
            style={styles.input}
            placeholder="Fleet Designation (e.g., Martinez Fleet)"
            placeholderTextColor={TEXT_MUTED}
            value={fleetDesignation}
            onChangeText={setFleetDesignation}
            editable={!creating}
          />
          <Pressable
            style={[styles.primaryBtn, creating && styles.primaryBtnDisabled]}
            onPress={handleCreateFleet}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color={BG} />
            ) : (
              <Text style={styles.primaryBtnLabel}>INITIALIZE NEW FLEET</Text>
            )}
          </Pressable>
        </View>

        {/* Section 2: Connect to Ground Control */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONNECT TO GROUND CONTROL (JOIN FLEET)</Text>
          <TextInput
            style={[styles.input, styles.inputMonospace]}
            placeholder="Invite Code (e.g., M-49XT)"
            placeholderTextColor={TEXT_MUTED}
            value={inviteCode}
            onChangeText={(t) => setInviteCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!joining}
          />
          <Pressable
            style={[styles.primaryBtn, joining && styles.primaryBtnDisabled]}
            onPress={handleJoinFleet}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator size="small" color={BG} />
            ) : (
              <Text style={styles.primaryBtnLabel}>SYNC TELEMETRY (JOIN)</Text>
            )}
          </Pressable>
        </View>
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
  input: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT,
    marginBottom: SPACING.lg,
  },
  inputMonospace: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  primaryBtn: {
    backgroundColor: CYAN,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: BG,
    letterSpacing: 1,
  },
});
