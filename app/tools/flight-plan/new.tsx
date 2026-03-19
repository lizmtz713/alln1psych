/**
 * Flight Plan — New request (Pilot: "I'm overwhelmed by...")
 * Route: /tools/flight-plan/new
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';

export default function FlightPlanNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubmit = async () => {
    const d = description.trim();
    if (!d) {
      Alert.alert('Description required', 'What feels overwhelming?');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to request a Flight Plan.');
        setIsSubmitting(false);
        return;
      }
      let fleetId: string | null = null;
      const { data: members } = await supabase.from('fleet_members').select('fleet_id').eq('user_id', user.id).limit(1);
      if (members?.[0]) fleetId = members[0].fleet_id;

      const { error } = await supabase.from('flight_plan_requests').insert({
        pilot_id: user.id,
        fleet_id: fleetId,
        description: d,
        status: 'pending',
      });
      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['flight_plan_requests'] });
      Alert.alert('Request sent', 'Ground Control can add micro-steps. Check back soon.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create request.');
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Request a Flight Plan</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.body}>
        <Text style={styles.hint}>What feels overwhelming? Ground Control will break it into small steps.</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. This school project, cleaning my room, applying for jobs"
          placeholderTextColor={TEXT_MUTED}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator size="small" color={BG} /> : <Text style={styles.submitLabel}>SEND REQUEST</Text>}
        </Pressable>
      </View>
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
  body: { flex: 1, padding: SPACING.xl },
  hint: { fontSize: 14, color: TEXT_MUTED, marginBottom: SPACING.lg },
  input: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 15,
    color: TEXT,
    minHeight: 120,
    marginBottom: SPACING.xl,
  },
  submitBtn: {
    backgroundColor: CYAN,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.8 },
  submitLabel: { fontSize: 15, fontWeight: '700', color: BG },
});
