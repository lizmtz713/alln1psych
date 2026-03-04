import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useEmergencyStore } from '../../src/stores/emergencyStore';

const LINES = [
  { title: '988 Suicide & Crisis Lifeline', sub: 'Call or text 988', phone: '988', sms: '988' },
  { title: 'Crisis Text Line', sub: 'Text HOME to 741741', sms: '741741', smsBody: 'HOME' },
  { title: 'Trevor Project (LGBTQ+)', sub: '1-866-488-7386', phone: '8664887386' },
  { title: 'Trans Lifeline', sub: '877-565-8860', phone: '8775658860' },
];

export default function EmergencyCrisisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useEmergencyStore.getState().recordAction('crisis_lines');

  const call = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:' + phone);
  };
  const text = (num: string, body?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = body ? 'sms:' + num + '?body=' + encodeURIComponent(body) : 'sms:' + num;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Crisis Support</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>You're not alone. Help is available 24/7.</Text>
        {LINES.map((line, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{line.title}</Text>
            <Text style={styles.cardSub}>{line.sub}</Text>
            <View style={styles.actions}>
              {line.phone && (
                <Pressable style={styles.primaryBtn} onPress={() => call(line.phone!)}>
                  <Ionicons name="call" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Call now</Text>
                </Pressable>
              )}
              {line.sms && (
                <Pressable style={styles.secondaryBtn} onPress={() => text(line.sms!, (line as any).smsBody)}>
                  <Text style={styles.secondaryBtnText}>{line.phone ? 'Text instead' : 'Text now'}</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
        <Text style={styles.footer}>If you're in immediate danger, call 911.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  intro: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accent, paddingVertical: 10, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.button },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.button, borderWidth: 1, borderColor: COLORS.border },
  secondaryBtnText: { fontSize: 15, color: COLORS.text },
  footer: { marginTop: 8, fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
});
