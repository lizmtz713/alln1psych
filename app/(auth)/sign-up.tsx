import { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';
import { GoogleSignInButton } from '../../src/components/GoogleSignInButton';
import { supabase } from '../../src/lib/supabase';
import { useUserStore } from '../../src/stores/userStore';

const HAS_GOOGLE = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim());

async function routeAfterSignIn(userId: string): Promise<'/(tabs)' | '/(modals)/onboarding' | '/'> {
  const { data: profile } = await supabase.from('profiles').select('onboarding_completed, name, age_group').eq('id', userId).single();
  if (profile?.onboarding_completed) return '/(tabs)';
  if (profile && (profile.name || profile.age_group)) return '/(modals)/onboarding';
  return '/';
}

function humanError(message: string): string {
  if (message.includes('already registered') || message.includes('already exists')) return 'That email is already taken.';
  if (message.includes('Password')) return 'Password must be at least 8 characters.';
  return message || 'Something went wrong. Try again.';
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
  }, []);

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert('Sign in failed', 'No identity token received.');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (signInError) {
        Alert.alert('Sign in failed', signInError.message);
        return;
      }

      if (credential.fullName?.givenName) {
        const fullName = [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(' ');
        useUserStore.getState().setName(fullName);
      }

      const route = data?.user?.id ? await routeAfterSignIn(data.user.id) : '/';
      if (route === '/(tabs)' || route === '/(modals)/onboarding') {
        router.replace(route as any);
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      console.error('Apple Sign In error:', e);
      Alert.alert('Sign in failed', 'Something went wrong. Please try again.');
    }
  };

  const handleSignUp = async () => {
    const n = name.trim();
    const e = email.trim();
    const p = password;
    const c = confirmPassword;
    if (!e || !p) {
      setError('Please enter email and password.');
      return;
    }
    if (p.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (p !== c) {
      setError('Passwords don\'t match.');
      return;
    }
    if (!ageConfirm) {
      setError('Please confirm you are 13 or older.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(e, p, n || 'Friend');
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
        <Text style={styles.header}>Create your space</Text>
        <Text style={styles.subheader}>Your private place to reflect and grow.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {appleAuthAvailable && (
          <>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={(t) => { setName(t); setError(null); }}
          autoCapitalize="words"
        />
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
            placeholder="Password (min 8 characters)"
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
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={COLORS.textMuted}
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />

        <Pressable
          style={styles.ageRow}
          onPress={() => setAgeConfirm(!ageConfirm)}
        >
          <View style={[styles.checkbox, ageConfirm && styles.checkboxChecked]}>
            {ageConfirm ? <Ionicons name="checkmark" size={16} color={COLORS.text} /> : null}
          </View>
          <Text style={styles.ageLabel}>I confirm I am 13 years of age or older</Text>
        </Pressable>
        {!ageConfirm && (
          <Text style={styles.ageHint}>InGauge is available for users 13 and older. We're working on a family plan for younger users.</Text>
        )}

        <Pressable
          style={[styles.button, (loading || !ageConfirm) && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading || !ageConfirm}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.link}>Sign in</Text>
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
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  ageLabel: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  ageHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
});
