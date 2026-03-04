import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.text}>Patterns coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  backButton: { padding: 8, marginBottom: 16, alignSelf: 'flex-start' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 17, color: COLORS.textSecondary },
});
