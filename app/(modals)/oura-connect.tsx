/**
 * Oura Ring connection — Connect or disconnect Oura for sleep, readiness, HRV.
 * Data merges with Apple Health in healthStore for Body/State gauges.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { APP_CONFIG } from '../../src/lib/constants';
import { isOuraConnected, disconnectOura } from '../../src/services/ouraIntegration';
import { useHealthStore } from '../../src/stores/healthStore';

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  accent: '#7C4DFF',
  success: '#4ADE80',
  error: '#EF4444',
};

const OURA_OAUTH_BASE = 'https://cloud.ouraring.com/oauth/authorize';
const CLIENT_ID = process.env.EXPO_PUBLIC_OURA_CLIENT_ID?.trim();
const REDIRECT_URI = 'alln1-psych://oauth/oura';

export default function OuraConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await isOuraConnected();
      if (!cancelled) setConnected(ok);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const openOuraOAuth = () => {
    if (!CLIENT_ID) {
      Alert.alert(
        'Oura connection',
        'Oura Ring can be connected once the app is configured with an Oura API client ID. Apple Health is available now in Data Sources.',
        [{ text: 'OK' }, { text: 'Open Apple Health', onPress: () => router.replace('/(modals)/health-connections') }]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnecting(true);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'email personal daily',
    });
    const url = `${OURA_OAUTH_BASE}?${params.toString()}`;
    Linking.openURL(url).catch(() => {
      setConnecting(false);
      Alert.alert('Error', 'Could not open Oura login.');
    });
    setConnecting(false);
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Disconnect Oura?',
      'Your Oura data will stop syncing to InGauge. Health data from Apple Health will still be used.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectOura();
            setConnected(false);
            useHealthStore.getState().syncHealthData();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Oura Ring</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Oura Ring</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Sleep score, readiness, HRV</Text>
        <Text style={styles.body}>
          Connect your Oura Ring so {APP_CONFIG.name} can use your sleep and recovery data for your Body and State gauges. Data is merged with Apple Health when both are connected.
        </Text>

        {connected ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
            <Text style={styles.cardHint}>Data syncs when you open the app or pull to refresh on Home.</Text>
            <Pressable style={styles.disconnectBtn} onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>Disconnect Oura</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Pressable
              style={[styles.connectBtn, connecting && styles.connectBtnDisabled]}
              onPress={openOuraOAuth}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="ellipse-outline" size={22} color="#FFF" />
                  <Text style={styles.connectBtnText}>Connect with Oura</Text>
                </>
              )}
            </Pressable>
            {!CLIENT_ID && (
              <Text style={styles.hint}>To enable Oura, add EXPO_PUBLIC_OURA_CLIENT_ID to your app config. Apple Health is available in Data Sources.</Text>
            )}
          </View>
        )}

        <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(modals)/health-connections')}>
          <Text style={styles.secondaryBtnText}>Open Apple Health settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 8 },
  body: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  connectedText: { fontSize: 17, fontWeight: '600', color: COLORS.success },
  cardHint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  disconnectBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16 },
  disconnectText: { fontSize: 15, color: COLORS.error },
  connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12 },
  connectBtnDisabled: { opacity: 0.7 },
  connectBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginTop: 12, lineHeight: 18 },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15, color: COLORS.accent },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
