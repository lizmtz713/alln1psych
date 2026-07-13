/** Oura is intentionally disabled until its server-side OAuth flow passes security review. */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  accent: '#7C4DFF',
  success: '#4ADE80',
  error: '#EF4444',
};

export default function OuraConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        <Text style={styles.subtitle}>Coming after TestFlight</Text>
        <Text style={styles.body}>
          Direct Oura connection is paused while we finish secure server-side authorization and token storage. No Oura credentials are collected in this build.
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={28} color={COLORS.accent} />
            <Text style={styles.connectedText}>Security first</Text>
          </View>
          <Text style={styles.cardHint}>Apple Health is available now and can include Oura data that you already sync into Health on iPhone.</Text>
        </View>

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
