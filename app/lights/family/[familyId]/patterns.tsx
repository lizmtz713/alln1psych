import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../src/lib/constants';
import { useFamilyStore } from '../../../../src/stores/familyStore';

export default function FamilyPatternsScreen() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const family = useFamilyStore((s) => s.getFamilyById(familyId ?? ''));
  const insights = useFamilyStore((s) => s.getFamilyInsights(familyId ?? ''));
  const patternInsights = insights.filter((i) => i.type === 'pattern');

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Family not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Family patterns</Text>
      {patternInsights.length > 0 ? (
        patternInsights.map((insight, i) => (
          <View key={i} style={styles.patternCard}>
            <Text style={styles.patternTitle}>{insight.title}</Text>
            <Text style={styles.patternDesc}>{insight.description}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          Check in more and log care actions to see family patterns over time.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { fontSize: 16, color: COLORS.text, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  patternCard: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  patternTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  patternDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
