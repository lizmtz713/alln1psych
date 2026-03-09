/**
 * Emergency Mode — Reach out. Contact someone from your people. Call / Text.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useEmergencyStore } from '../../src/stores/emergencyStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const SUGGESTED_MESSAGE = "I'm having a hard time and just needed to hear a friendly voice.";

export default function EmergencyReachOutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const recordAction = useEmergencyStore((s) => s.recordAction);
  const members = useCircleStore((s) => s.members) ?? [];
  const getLights = useLightsStore((s) => s.getLights);
  const lights = getLights(members);
  const tierLabel = 'One of your 5';

  const handleCall = (lightId: string, phone?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordAction('reach_out', { contactedLightId: lightId });
    if (phone) Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const handleText = (lightId: string, phone?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordAction('reach_out', { contactedLightId: lightId });
    const body = encodeURIComponent(SUGGESTED_MESSAGE);
    if (phone) Linking.openURL(`sms:${phone.replace(/\D/g, '')}?body=${body}`);
  };

  const handleCopilotHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(tabs)/talk', params: { crisisMode: 'true' } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Reach out</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>Sometimes you just need a person.</Text>
        <Text style={styles.sectionLabel}>Your closest people</Text>

        {lights.slice(0, 5).map((light) => (
          <View key={light.id} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{light.name}</Text>
              <View style={styles.actions}>
                {light.phone && (
                  <>
                    <Pressable style={styles.iconBtn} onPress={() => handleCall(light.id, light.phone)}>
                      <Ionicons name="call" size={22} color={ACCENT} />
                      <Text style={styles.iconBtnLabel}>Call</Text>
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => handleText(light.id, light.phone)}>
                      <Ionicons name="chatbubble" size={22} color={ACCENT} />
                      <Text style={styles.iconBtnLabel}>Text</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
            <Text style={styles.cardTier}>☀️ {tierLabel}</Text>
          </View>
        ))}

        {lights.length === 0 && (
          <Text style={styles.empty}>Add people so you can reach out when you need them.</Text>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Don't know what to say?</Text>
        <Pressable style={styles.copilotBtn} onPress={handleCopilotHelp}>
          <Text style={styles.copilotBtnText}>CoPilot can help you start →</Text>
        </Pressable>
        <Text style={styles.suggested}>"{SUGGESTED_MESSAGE}"</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  intro: { fontSize: 16, color: TEXT_MUTED, marginBottom: SPACING.lg },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED, marginBottom: 10 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 17, fontWeight: '600', color: TEXT },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { alignItems: 'center' },
  iconBtnLabel: { fontSize: 11, color: ACCENT, marginTop: 2 },
  cardTier: { fontSize: 13, color: TEXT_MUTED, marginTop: 6 },
  empty: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center', padding: 24 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: SPACING.xl },
  copilotBtn: { paddingVertical: 14, alignItems: 'center' },
  copilotBtnText: { fontSize: 16, fontWeight: '600', color: ACCENT },
  suggested: { marginTop: 8, fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic', textAlign: 'center' },
});
