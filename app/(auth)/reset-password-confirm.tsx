/**
 * Password recovery confirm — set a new password after PASSWORD_RECOVERY event.
 * Route: /(auth)/reset-password-confirm
 */

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
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ResetPasswordConfirmScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearPasswordRecovery, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Could not update password.');
        setLoading(false);
        return;
      }
      clearPasswordRecovery();
      setDone(true);
      // Force a clean re-auth so Cockpit never hydrates on a recovery session.
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.header}>Password updated</Text>
        <Text style={styles.message}>Sign in with your new password to continue.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Go to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Choose a new password</Text>
      <Text style={styles.subheader}>
        You opened a recovery link. Set a new password here — we will not load your Cockpit until
        you sign in normally.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor={COLORS.textMuted}
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor={COLORS.textMuted}
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          setError(null);
        }}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.buttonText}>Save password</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.back}
        onPress={() => {
          clearPasswordRecovery();
          void signOut();
        }}
      >
        <Text style={styles.backText}>Cancel and sign in</Text>
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
    lineHeight: 22,
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
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
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
