import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function GaugeDetailScreen() {
  const router = useRouter();
  const { gauge } = useLocalSearchParams<{ gauge?: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{gauge ?? 'Gauge'}</Text>
      <Text style={styles.sub}>Detail view for this gauge.</Text>
      <Pressable onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: '#F0F0F5', marginBottom: 8, textTransform: 'capitalize' },
  sub: { fontSize: 16, color: '#8888A0', marginBottom: 24 },
  button: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#7C4DFF', borderRadius: 12, alignSelf: 'flex-start' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
