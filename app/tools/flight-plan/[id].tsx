/**
 * Flight Plan — Detail: view steps (Pilot checks off) or add steps (Ground Control)
 * Route: /tools/flight-plan/[id]
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';

type Request = { id: string; pilot_id: string; description: string; status: string };
type Step = { id: string; order_index: number; title: string; completed_at: string | null };

export default function FlightPlanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [stepTitles, setStepTitles] = useState(['', '', '']);
  const [addingSteps, setAddingSteps] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const { data: request, isLoading: loadingRequest } = useQuery({
    queryKey: ['flight_plan_request', id],
    queryFn: async (): Promise<Request | null> => {
      const { data, error } = await supabase
        .from('flight_plan_requests')
        .select('id, pilot_id, description, status')
        .eq('id', id!)
        .single();
      if (error || !data) return null;
      return data as Request;
    },
    enabled: !!id,
  });

  const { data: steps = [], isLoading: loadingSteps } = useQuery({
    queryKey: ['flight_plan_steps', id],
    queryFn: async (): Promise<Step[]> => {
      const { data, error } = await supabase
        .from('flight_plan_steps')
        .select('id, order_index, title, completed_at')
        .eq('request_id', id!)
        .order('order_index');
      if (error) throw error;
      return (data ?? []) as Step[];
    },
    enabled: !!id,
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const isPilot = request && currentUser && request.pilot_id === currentUser;
  const canAddSteps = request && currentUser && request.pilot_id !== currentUser && request.status === 'pending' && steps.length === 0;

  const toggleStep = async (step: Step) => {
    if (!isPilot) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCompleted = step.completed_at ? null : new Date().toISOString();
    const { error } = await supabase
      .from('flight_plan_steps')
      .update({ completed_at: newCompleted })
      .eq('id', step.id);
    if (!error) queryClient.invalidateQueries({ queryKey: ['flight_plan_steps', id] });
  };

  const addSteps = async () => {
    const titles = stepTitles.map((t) => t.trim()).filter(Boolean);
    if (titles.length < 2) {
      Alert.alert('Add at least 2 steps', 'Break the task into small, doable steps.');
      return;
    }
    setAddingSteps(true);
    try {
      for (let i = 0; i < titles.length; i++) {
        await supabase.from('flight_plan_steps').insert({
          request_id: id,
          order_index: i,
          title: titles[i],
        });
      }
      await supabase.from('flight_plan_requests').update({ status: 'steps_added' }).eq('id', id!);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['flight_plan_request', id] });
      queryClient.invalidateQueries({ queryKey: ['flight_plan_steps', id] });
      queryClient.invalidateQueries({ queryKey: ['flight_plan_requests'] });
      Alert.alert('Steps added', 'The pilot can now check them off.');
      setAddingSteps(false);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add steps.');
      setAddingSteps(false);
    }
  };

  if (!id || (!loadingRequest && !request)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.error}>Request not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Flight Plan</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {request && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>What's overwhelming</Text>
              <Text style={styles.cardDesc}>{request.description}</Text>
              <Text style={styles.cardMeta}>Status: {request.status === 'pending' ? 'Needs steps' : request.status === 'steps_added' ? 'Ready to do' : 'Completed'}</Text>
            </View>

            {canAddSteps && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Add micro-steps (Ground Control)</Text>
                <Text style={styles.hint}>2–5 small, frictionless steps. e.g. "Open laptop", "Write your name on a doc", "Take a break."</Text>
                {[0, 1, 2, 3, 4].map((i) => (
                  <TextInput
                    key={i}
                    style={styles.stepInput}
                    placeholder={`Step ${i + 1}`}
                    placeholderTextColor={TEXT_MUTED}
                    value={stepTitles[i] ?? ''}
                    onChangeText={(t) => {
                      const next = [...stepTitles];
                      next[i] = t;
                      setStepTitles(next);
                    }}
                    editable={!addingSteps}
                  />
                ))}
                <Pressable style={[styles.submitBtn, addingSteps && styles.submitBtnDisabled]} onPress={addSteps} disabled={addingSteps}>
                  {addingSteps ? <ActivityIndicator size="small" color={BG} /> : <Text style={styles.submitLabel}>ADD STEPS</Text>}
                </Pressable>
              </View>
            )}

            {steps.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Steps</Text>
                {steps.map((step) => (
                  <Pressable
                    key={step.id}
                    style={styles.stepRow}
                    onPress={() => isPilot && toggleStep(step)}
                    disabled={!isPilot}
                  >
                    <View style={[styles.checkbox, step.completed_at && styles.checkboxDone]}>
                      {step.completed_at ? <Ionicons name="checkmark" size={16} color={BG} /> : null}
                    </View>
                    <Text style={[styles.stepTitle, step.completed_at && styles.stepTitleDone]}>{step.title}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
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
  error: { fontSize: 15, color: TEXT_MUTED, padding: SPACING.xl },
  card: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 1, marginBottom: 8 },
  cardDesc: { fontSize: 15, color: TEXT, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: TEXT_MUTED },
  hint: { fontSize: 13, color: TEXT_MUTED, marginBottom: SPACING.md },
  stepInput: {
    backgroundColor: BG,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    fontSize: 15,
    color: TEXT,
    marginBottom: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: CYAN,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitBtnDisabled: { opacity: 0.8 },
  submitLabel: { fontSize: 15, fontWeight: '700', color: BG },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
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
  checkboxDone: { backgroundColor: EMERALD, borderColor: EMERALD },
  stepTitle: { flex: 1, fontSize: 15, color: TEXT },
  stepTitleDone: { textDecorationLine: 'line-through', color: TEXT_MUTED },
});
