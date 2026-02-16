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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';
import { GoogleSignInButton } from '../../src/components/GoogleSignInButton';

const HAS_GOOGLE = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim());

function humanError(message: string): string {
  if (message.includes('Invalid login')) return 'Wrong email or password. Try again.';
  if (message.includes('Email not confirmed')) return 'Check your email to confirm your account.';
  return message || 'Something went wrong. Try again.';
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) {
      setError('Please enter email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(e, p);
    setLoading(false);
    if (err) {
      setError(humanError(err.message));
      return;
    }
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Welcome back</Text>
        <Text style={styles.subheader}>Sign in to your space.</Text>

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
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eye}
            hitSlop={12}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        {HAS_GOOGLE && (
          <>
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <GoogleSignInButton
              onSuccess={() => router.replace('/')}
              onError={(msg) => setError(msg)}
            />
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
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
    marginBottom: 12,
  },
  passwordWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surface,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  link: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
  },
});
