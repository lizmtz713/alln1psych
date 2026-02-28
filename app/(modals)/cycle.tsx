/**
 * Cycle Intelligence Modal
 * 
 * Full-screen modal for cycle tracking dashboard.
 */

import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { CycleDashboard } from '../../src/components/CycleDashboard';

const COLORS = {
  bg: '#09090F',
  text: '#F0F0F5',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  border: 'rgba(255,255,255,0.08)',
};

export default function CycleModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cycle Intelligence</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <CycleDashboard />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
});
