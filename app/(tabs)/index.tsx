import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/lib/constants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to your space.</Text>
      <Text style={styles.sub}>Everything here is just for you.</Text>
      <Text style={styles.prompt}>How are you feeling today?</Text>
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
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 17,
    color: COLORS.textMuted,
    marginBottom: 40,
  },
  prompt: {
    fontSize: 17,
    color: COLORS.accent,
  },
});
