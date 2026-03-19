/**
 * Flight Plan — List requests (Family Edition)
 * Route: /tools/flight-plan
 *
 * My requests + fleet requests. "Request a Flight Plan" → new. Tap row → detail.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';

type RequestRow = {
  id: string;
  pilot_id: string;
  description: string;
  status: string;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function FlightPlanListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: currentUser } = useQuery({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['flight_plan_requests', currentUser],
    queryFn: async (): Promise<RequestRow[]> => {
      const { data, error } = await supabase
        .from('flight_plan_requests')
        .select('id, pilot_id, description, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RequestRow[];
    },
    enabled: !!currentUser,
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const isMine = (r: RequestRow) => r.pilot_id === currentUser;

  const renderItem: ListRenderItem<RequestRow> = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/tools/flight-plan/${item.id}`);
      }}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.cardMeta}>
          {formatDate(item.created_at)} · {item.status === 'pending' ? 'Needs steps' : item.status === 'steps_added' ? 'Ready' : 'Done'}
          {!isMine(item) && ' · Fleet'}
        </Text>
      </View>
      <Text style={styles.cardArrow}>→</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Flight Plan</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={CYAN} />
        </View>
      ) : (
        <>
          <FlatList
            data={requests}
            keyExtractor={(r) => r.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No flight plans yet.</Text>
                <Text style={styles.emptySub}>Request one when something feels overwhelming.</Text>
              </View>
            }
          />
          <Pressable
            style={styles.fab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/tools/flight-plan/new');
            }}
          >
            <Text style={styles.fabText}>+ Request a Flight Plan</Text>
          </Pressable>
        </>
      )}
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
  listContent: { padding: SPACING.xl, paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardPressed: { opacity: 0.9 },
  cardTop: { flex: 1, minWidth: 0 },
  cardDesc: { fontSize: 15, color: TEXT, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: TEXT_MUTED },
  cardArrow: { fontSize: 18, color: CYAN, marginLeft: SPACING.md },
  empty: { paddingVertical: SPACING.xxl, alignItems: 'center' },
  emptyText: { fontSize: 16, color: TEXT_MUTED, marginBottom: 4 },
  emptySub: { fontSize: 13, color: TEXT_MUTED },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    backgroundColor: CYAN,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  fabText: { fontSize: 15, fontWeight: '700', color: BG },
});
