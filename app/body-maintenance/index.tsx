import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useBodyMaintenanceStore } from '../../src/stores/bodyMaintenanceStore';
import type { RoutineItem } from '../../src/types/bodyMaintenance';

function RoutineRow({ item, onPress, onCheck }: { item: RoutineItem; onPress: () => void; onCheck: () => void }) {
  const isDue = item.nextDue ? new Date(item.nextDue) <= new Date() : false;
  const completed = item.lastCompleted && new Date(item.lastCompleted).toDateString() === new Date().toDateString();
  return (
    <Pressable style={styles.routineRow} onPress={onPress}>
      <Pressable
        style={[styles.checkbox, completed && styles.checkboxChecked]}
        onPress={(e) => { e.stopPropagation(); onCheck(); }}
      >
        {completed ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
      </Pressable>
      <Text style={[styles.routineRowText, completed && styles.routineRowDone]}>
        {item.emoji ? item.emoji + ' ' : ''}{item.name}
      </Text>
    </Pressable>
  );
}

export default function BodyMaintenanceIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routines = useBodyMaintenanceStore((s) => s.routines);
  const providers = useBodyMaintenanceStore((s) => s.providers);
  const getRoutinesByFrequency = useBodyMaintenanceStore((s) => s.getRoutinesByFrequency);
  const getComingUp = useBodyMaintenanceStore((s) => s.getComingUp);
  const completeRoutine = useBodyMaintenanceStore((s) => s.completeRoutine);

  const comingUp = getComingUp(8);
  const daily = getRoutinesByFrequency('daily');
  const weekly = getRoutinesByFrequency('weekly');
  const monthly = getRoutinesByFrequency('monthly');
  const quarterly = getRoutinesByFrequency('quarterly');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.subtitle}>
        Your self-care schedule. No judgment, just reminders.
      </Text>
      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Coming up</Text>
      {comingUp.length === 0 ? (
        <Text style={styles.emptyHint}>Add routines and providers to see what’s due.</Text>
      ) : (
        comingUp.slice(0, 5).map((entry, i) => {
          if ('item' in entry && entry.item) {
            const r = entry.item;
            return (
              <Pressable
                key={r.id}
                style={[styles.card, entry.overdueDays != null && entry.overdueDays > 0 && styles.cardOverdue]}
                onPress={() => router.push('/body-maintenance/' + r.id)}
              >
                <Text style={styles.cardEmoji}>{r.emoji ?? '📋'}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{r.name}</Text>
                  <Text style={[styles.cardMeta, entry.overdueDays != null && styles.cardMetaOverdue]}>
                    {entry.overdueDays != null && entry.overdueDays > 0
                      ? `~${entry.overdueDays} day${entry.overdueDays !== 1 ? 's' : ''} overdue`
                      : entry.dueLabel}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => completeRoutine(r.id)}>
                    <Text style={styles.cardActionText}>Mark done</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }
          const p = entry.provider;
          if (!p) return null;
          return (
            <Pressable
              key={p.id}
              style={[styles.card, entry.overdueDays != null && entry.overdueDays > 0 && styles.cardOverdue]}
              onPress={() => router.push('/body-maintenance/providers/' + p.id)}
            >
              <Text style={styles.cardEmoji}>
                {p.type === 'hair' ? '💇' : p.type === 'nails' ? '💅' : p.type === 'dentist' ? '🦷' : '📋'}
              </Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{p.businessName}</Text>
                <Text style={[styles.cardMeta, entry.overdueDays != null && styles.cardMetaOverdue]}>
                  {entry.dueLabel}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })
      )}

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>My routines</Text>

      <Text style={styles.bandLabel}>Daily</Text>
      {daily.length === 0 ? <Text style={styles.emptyBand}>No daily routines</Text> : daily.map((r) => (
        <RoutineRow key={r.id} item={r} onPress={() => router.push('/body-maintenance/' + r.id)} onCheck={() => completeRoutine(r.id)} />
      ))}

      <Text style={styles.bandLabel}>Weekly</Text>
      {weekly.length === 0 ? <Text style={styles.emptyBand}>No weekly routines</Text> : weekly.map((r) => (
        <RoutineRow key={r.id} item={r} onPress={() => router.push('/body-maintenance/' + r.id)} onCheck={() => completeRoutine(r.id)} />
      ))}

      <Text style={styles.bandLabel}>Monthly</Text>
      {monthly.length === 0 ? <Text style={styles.emptyBand}>No monthly routines</Text> : monthly.map((r) => (
        <RoutineRow key={r.id} item={r} onPress={() => router.push('/body-maintenance/' + r.id)} onCheck={() => completeRoutine(r.id)} />
      ))}

      <Text style={styles.bandLabel}>Quarterly</Text>
      {quarterly.length === 0 ? <Text style={styles.emptyBand}>No quarterly routines</Text> : quarterly.map((r) => (
        <RoutineRow key={r.id} item={r} onPress={() => router.push('/body-maintenance/' + r.id)} onCheck={() => completeRoutine(r.id)} />
      ))}

      <Pressable style={styles.addRoutineBtn} onPress={() => router.push('/body-maintenance/add-routine')}>
        <Ionicons name="add" size={20} color={COLORS.accent} />
        <Text style={styles.addRoutineBtnText}>Add routine</Text>
      </Pressable>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Service providers</Text>
      {providers.map((p) => (
        <Pressable key={p.id} style={styles.card} onPress={() => router.push('/body-maintenance/providers/' + p.id)}>
          <Text style={styles.cardEmoji}>
            {p.type === 'hair' ? '💇' : p.type === 'nails' ? '💅' : p.type === 'dentist' ? '🦷' : '📋'}
          </Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{p.businessName}</Text>
            {p.contactPerson ? <Text style={styles.cardMeta}>{p.contactPerson}</Text> : null}
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      <Pressable style={styles.addProviderBtn} onPress={() => router.push('/body-maintenance/add-provider')}>
        <Text style={styles.addProviderBtnText}>+ Add provider</Text>
      </Pressable>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Learn</Text>
      <Pressable style={styles.learnRow} onPress={() => Linking.openURL('https://alln1network.com').catch(() => {})}>
        <Text style={styles.learnRowText}>Body Care 101</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <Pressable style={styles.learnRow} onPress={() => {}}>
        <Text style={styles.learnRowText}>When to replace things</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <Pressable style={styles.learnRow} onPress={() => {}}>
        <Text style={styles.learnRowText}>Minimum viable hygiene</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  emptyHint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 8,
  },
  cardOverdue: { borderWidth: 1, borderColor: COLORS.warning },
  cardEmoji: { fontSize: 24, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardMetaOverdue: { color: COLORS.warning },
  cardActions: { marginLeft: 8 },
  cardActionText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  chevron: { fontSize: 20, color: COLORS.textMuted },
  bandLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, marginBottom: 6 },
  emptyBand: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  routineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  routineRowText: { fontSize: 15, color: COLORS.text, flex: 1 },
  routineRowDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  addRoutineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  addRoutineBtnText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  addProviderBtn: { marginTop: 8 },
  addProviderBtnText: { fontSize: 15, color: COLORS.accent },
  learnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, marginBottom: 8 },
  learnRowText: { fontSize: 15, color: COLORS.text },
});
