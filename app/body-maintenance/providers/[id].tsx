import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useBodyMaintenanceStore, computeNextDue } from '../../../src/stores/bodyMaintenanceStore';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const TYPE_EMOJI: Record<string, string> = {
  hair: '💇',
  nails: '💅',
  spa: '🧖',
  dentist: '🦷',
  brows: '👁️',
  skincare: '🧴',
  tailor: '👔',
  cleaning: '🧹',
  other: '✨',
};

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getProvider = useBodyMaintenanceStore((s) => s.getProvider);
  const updateProvider = useBodyMaintenanceStore((s) => s.updateProvider);
  const removeProvider = useBodyMaintenanceStore((s) => s.removeProvider);

  const provider = getProvider(id ?? '');

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Provider not found.</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.link}>Back</Text></Pressable>
      </View>
    );
  }

  const onCall = () => {
    if (!provider.phone) return;
    const num = provider.phone.replace(/\D/g, '');
    Linking.openURL('tel:' + num).catch(() => {});
  };

  const onDirections = () => {
    if (!provider.address) return;
    Linking.openURL('https://maps.google.com/?q=' + encodeURIComponent(provider.address)).catch(() => {});
  };

  const onMarkVisit = () => {
    const today = new Date().toISOString().slice(0, 10);
    const next = provider.frequency ? computeNextDue(provider.frequency, today) : undefined;
    updateProvider(provider.id, { lastVisit: today, nextDue: next });
  };

  const onDelete = () => {
    Alert.alert('Delete provider', `Remove "${provider.businessName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeProvider(provider.id); router.back(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{TYPE_EMOJI[provider.type] ?? '✨'}</Text>
        <Text style={styles.name}>{provider.businessName}</Text>
        {provider.contactPerson ? <Text style={styles.sub}>{provider.contactPerson}</Text> : null}
      </View>

      {(provider.phone || provider.address || provider.website) && (
        <View style={styles.card}>
          {provider.phone && (
            <Pressable style={styles.row} onPress={onCall}>
              <Ionicons name="call-outline" size={20} color={COLORS.accent} />
              <Text style={styles.rowText}>{provider.phone}</Text>
            </Pressable>
          )}
          {provider.address && (
            <Pressable style={styles.row} onPress={onDirections}>
              <Ionicons name="location-outline" size={20} color={COLORS.accent} />
              <Text style={styles.rowText}>{provider.address}</Text>
            </Pressable>
          )}
          {provider.website && (
            <Pressable style={styles.row} onPress={() => Linking.openURL(provider.website!).catch(() => {})}>
              <Ionicons name="open-outline" size={20} color={COLORS.accent} />
              <Text style={styles.rowText}>Website</Text>
            </Pressable>
          )}
        </View>
      )}

      {(provider.typicalCost || provider.paymentMethods.length > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          {provider.typicalCost ? <Text style={styles.cardText}>{provider.typicalCost}</Text> : null}
          <Text style={styles.cardText}>{provider.paymentMethods.map((p) => p.type).join(', ')}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scheduling</Text>
        <Text style={styles.cardLabel}>Last visit</Text>
        <Text style={styles.cardText}>{formatDate(provider.lastVisit)}</Text>
        <Text style={styles.cardLabel}>Next due</Text>
        <Text style={styles.cardText}>{formatDate(provider.nextDue)}</Text>
      </View>

      {provider.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.cardText}>{provider.notes}</Text>
        </View>
      ) : null}

      <Pressable style={styles.primaryBtn} onPress={onMarkVisit}>
        <Text style={styles.primaryBtnText}>Mark visited today</Text>
      </Pressable>

      <Pressable style={styles.dangerBtn} onPress={onDelete}>
        <Text style={styles.dangerBtnText}>Delete provider</Text>
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
  sub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  cardLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  cardText: { fontSize: 15, color: COLORS.text, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rowText: { fontSize: 15, color: COLORS.text, flex: 1 },
  primaryBtn: { backgroundColor: COLORS.accent, padding: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  dangerBtn: { marginTop: 24, padding: 16, alignItems: 'center' },
  dangerBtnText: { fontSize: 16, color: COLORS.error },
});
