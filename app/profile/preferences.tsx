/**
 * Preferences — Notifications & reminders, Check-in settings, AI preferences.
 * Placeholder hub; can link to existing settings or add dedicated screens.
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';

export default function ProfilePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Coming soon</Text>
        <Text style={styles.placeholderBody}>Notifications & reminders, check-in settings, and AI preferences will live here.</Text>
        <Pressable style={styles.settingsLink} onPress={() => router.push('/(modals)/settings')}>
          <Text style={styles.settingsLinkText}>Open App Settings</Text>
          <Ionicons name="open-outline" size={18} color={COLORS.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  placeholderBody: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  settingsLinkText: { fontSize: 15, fontWeight: '500', color: COLORS.accent },
});
