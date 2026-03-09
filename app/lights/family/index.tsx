import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';
import { useFamilyStore } from '../../../src/stores/familyStore';

export default function FamilyDashboardIndex() {
  const router = useRouter();
  const families = useFamilyStore((s) => s.families);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Group your people for coordinated care, events, and family patterns.
      </Text>

      {families.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.emptyText}>No family groups yet</Text>
          <Text style={styles.emptyHint}>Create one to see everyone's temperatures in one place.</Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => router.push('/lights/family/create')}
          >
            <Text style={styles.primaryButtonText}>Create Family Group</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={({ pressed }) => [styles.createCard, pressed && styles.pressed]}
            onPress={() => router.push('/lights/family/create')}
          >
            <Text style={styles.createCardEmoji}>+</Text>
            <Text style={styles.createCardText}>Create another family</Text>
          </Pressable>

          {families.map((f) => (
            <Pressable
              key={f.id}
              style={({ pressed }) => [styles.familyCard, pressed && styles.pressed]}
              onPress={() => router.push(`/lights/family/${f.id}`)}
            >
              <Text style={styles.familyEmoji}>{f.emoji ?? '👨‍👩‍👧'}</Text>
              <View style={styles.familyInfo}>
                <Text style={styles.familyName}>{f.name}</Text>
                <Text style={styles.familyMeta}>{f.memberIds.length} members</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  createCardEmoji: { fontSize: 24, marginRight: 12 },
  createCardText: { fontSize: 16, color: COLORS.textSecondary },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
  },
  familyEmoji: { fontSize: 32, marginRight: 14 },
  familyInfo: { flex: 1 },
  familyName: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  familyMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.textMuted },
  pressed: { opacity: 0.9 },
});
