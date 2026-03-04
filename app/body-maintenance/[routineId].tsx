import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useBodyMaintenanceStore } from '../../src/stores/bodyMaintenanceStore';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function frequencyLabel(f: { type: string; value?: number }): string {
  if (f.type === 'daily') return 'Daily';
  if (f.type === 'every_x_days') return 'Every ' + (f.value ?? 1) + ' days';
  if (f.type === 'weekly') return 'Weekly';
  if (f.type === 'biweekly') return 'Bi-weekly';
  if (f.type === 'monthly') return 'Monthly';
  if (f.type === 'every_x_months') return 'Every ' + (f.value ?? 1) + ' months';
  if (f.type === 'quarterly') return 'Quarterly';
  if (f.type === 'yearly') return 'Yearly';
  return '—';
}

export default function RoutineDetailScreen() {
  const params = useLocalSearchParams<{ routineId: string }>();
  const routineId = params.routineId ?? '';
  const router = useRouter();
  const getRoutine = useBodyMaintenanceStore((s) => s.getRoutine);
  const completeRoutine = useBodyMaintenanceStore((s) => s.completeRoutine);
  const snoozeRoutine = useBodyMaintenanceStore((s) => s.snoozeRoutine);
  const removeRoutine = useBodyMaintenanceStore((s) => s.removeRoutine);

  const routine = getRoutine(routineId);

  if (!routine) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Routine not found.</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.link}>Back</Text></Pressable>
      </View>
    );
  }

  const onDelete = () => {
    Alert.alert('Delete routine', 'Remove this routine?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeRoutine(routine.id); router.back(); } },
    ]);
  };

  const overdue = routine.nextDue && new Date(routine.nextDue) < new Date();
  const overdueDays = overdue && routine.nextDue
    ? Math.ceil((new Date().getTime() - new Date(routine.nextDue).getTime()) / 86400000)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{routine.emoji ?? '📋'}</Text>
        <Text style={styles.name}>{routine.name}</Text>
        <Text style={styles.freq}>{frequencyLabel(routine.frequency)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Last completed</Text>
        <Text style={styles.cardValue}>{formatDate(routine.lastCompleted)}</Text>
        <Text style={styles.cardLabel}>Next due</Text>
        <Text style={[styles.cardValue, overdue && styles.overdue]}>
          {formatDate(routine.nextDue)}
          {overdueDays > 0 && ' (' + overdueDays + ' days overdue)'}
        </Text>
        {routine.streak != null && routine.streak > 0 && (
          <>
            <Text style={styles.cardLabel}>Streak</Text>
            <Text style={styles.cardValue}>{routine.streak}</Text>
          </>
        )}
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => { completeRoutine(routine.id); router.back(); }}>
        <Text style={styles.primaryBtnText}>Mark done</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={() => { snoozeRoutine(routine.id, 1); router.back(); }}>
        <Text style={styles.secondaryBtnText}>Snooze 1 day</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={() => { snoozeRoutine(routine.id, 7); router.back(); }}>
        <Text style={styles.secondaryBtnText}>Snooze 1 week</Text>
      </Pressable>

      <Pressable style={styles.dangerBtn} onPress={onDelete}>
        <Text style={styles.dangerBtnText}>Delete routine</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  error: { fontSize: 16, color: COLORS.text, padding: 20 },
  link: { fontSize: 16, color: COLORS.accent, padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 48, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  freq: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 16 },
  cardLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
  cardValue: { fontSize: 16, color: COLORS.text, marginTop: 2 },
  overdue: { color: COLORS.warning },
  primaryBtn: { backgroundColor: COLORS.accent, padding: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryBtn: { padding: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 10, backgroundColor: COLORS.surface },
  secondaryBtnText: { fontSize: 16, color: COLORS.text },
  dangerBtn: { marginTop: 24, padding: 16, alignItems: 'center' },
  dangerBtnText: { fontSize: 16, color: COLORS.error },
});
