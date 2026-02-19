import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import { useAuth } from '../providers/AuthProvider';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

type Props = {
  onSuccess: () => void;
  onError: (message: string) => void;
};

/**
 * Renders only when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is set.
 * Uses makeRedirectUri (not useRedirectUri) for expo-auth-session compatibility.
 */
export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri();
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token' as const,
    },
    discovery ?? null
  );

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    if (!response || response.type !== 'success') return;
    const params = (response as { type: 'success'; params?: { id_token?: string } }).params;
    if (!params?.id_token) return;
    const token = params.id_token;
    (async () => {
      setLoading(true);
      onError('');
      const { error: err } = await signInWithGoogle(token);
      setLoading(false);
      if (err) {
        onError(err.message || 'Google sign-in failed.');
        return;
      }
      onSuccess();
    })();
  }, [response]);

  const handlePress = () => {
    onError('');
    promptAsync();
  };

  return (
    <Pressable
      style={[styles.googleButton, (!request || loading) && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={!request || loading}
    >
      {loading ? (
        <ActivityIndicator color="#1f1f1f" />
      ) : (
        <>
          <Text style={styles.googleLogo}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  googleLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f1f1f',
  },
});
