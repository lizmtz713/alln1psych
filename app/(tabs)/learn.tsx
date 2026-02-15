import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/lib/constants';

export default function LearnScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learn</Text>
      <Text style={styles.sub}>Your gentle space to grow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 17,
    color: COLORS.textMuted,
  },
});
