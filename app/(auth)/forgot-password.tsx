import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const e = email.trim();
    if (!e) {
      setError('Please enter your email.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(e);
    setLoading(false);
    if (err) {
      setError(err.message || 'Something went wrong. Try again.');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.header}>Check your email</Text>
        <Text style={styles.message}>
          We sent a reset link to {email.trim()}. Open it to set a new password.
        </Text>
        <Pressable style={styles.button} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Reset your password</Text>
      <Text style={styles.subheader}>Enter your email and we'll send you a reset link.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textMuted}
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </Pressable>

      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back to Sign In</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 28,
  },
  error: {
    fontSize: 14,
    color: COLORS.recording,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  back: {
    alignSelf: 'center',
  },
  backText: {
    fontSize: 15,
    color: COLORS.accent,
  },
});
