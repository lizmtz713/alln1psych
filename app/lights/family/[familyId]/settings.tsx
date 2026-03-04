import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../../../src/lib/constants';
import { useFamilyStore } from '../../../../src/stores/familyStore';

export default function FamilySettingsScreen() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const router = useRouter();
  const family = useFamilyStore((s) => s.getFamilyById(familyId ?? ''));
  const deleteFamily = useFamilyStore((s) => s.deleteFamily);

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Family not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete family group',
      `Remove "${family.name}"? This won't delete your Lights, only the group.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFamily(family.id);
            router.replace('/lights/family');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.hint}>
          Care coordination and temperature sharing are on by default. More options can be added
          here (e.g. notify when someone's temperature drops).
        </Text>
      </View>

      <Pressable style={styles.dangerButton} onPress={handleDelete}>
        <Text style={styles.dangerButtonText}>Delete family group</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { fontSize: 16, color: COLORS.text, padding: 20 },
  link: { fontSize: 16, color: COLORS.accent, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textSecondary },
  dangerButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  dangerButtonText: { fontSize: 16, color: COLORS.error, fontWeight: '500' },
});
