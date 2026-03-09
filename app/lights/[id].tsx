/**
 * Person Profile — Everything you need to show up well for this person
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Image, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore } from '../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';
import { TIER_LABELS } from '../../src/types/lights';
import { getLightBrightness, BRIGHTNESS_CONFIG, IDEAL_CONTACT_DAYS, estimateRelationshipStrength } from '../../src/services/friendshipMaintenance';
import { ReachOutSheet } from '../../src/components/ReachOutSheet';

const TEMP_COLORS = { green: '#22C55E', yellow: '#EAB308', orange: '#F97316', red: '#EF4444' };

function daysUntilNextBirthday(iso: string): number {
  const [, month, day] = iso.split('-').map(Number);
  const today = new Date();
  const thisYear = today.getFullYear();
  let nextBirthday = new Date(thisYear, month - 1, day);
  if (nextBirthday < today) nextBirthday = new Date(thisYear + 1, month - 1, day);
  return Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PersonProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(useShallow((s) => ({
    tierByMemberId: s.tierByMemberId,
    connectionLogByMemberId: s.connectionLogByMemberId,
    lastContactByMemberId: s.lastContactByMemberId,
    lightExtrasByMemberId: s.lightExtrasByMemberId,
    momentumByMemberId: s.momentumByMemberId,
    lastHeroShownByMemberId: s.lastHeroShownByMemberId,
    seasonByMemberId: s.seasonByMemberId,
    timelineEventsByMemberId: s.timelineEventsByMemberId,
  })));
  const logContact = useLightsStore((s) => s.logContact);
  const setTier = useLightsStore((s) => s.setTier);
  const removeLight = useLightsStore((s) => s.removeLight);

  const lights = useMemo(() => computeLights(Array.isArray(members) ? members : [], persistState), [members, persistState]);
  const light = lights.find((l) => l.id === id);

  const [showTierPicker, setShowTierPicker] = useState(false);
  const [showReachOut, setShowReachOut] = useState(false);

  if (!light) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Person not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Text style={styles.backBtnText}>Go back</Text></Pressable>
      </View>
    );
  }

  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
  const brightConfig = BRIGHTNESS_CONFIG[brightness];
  const relationshipStrength = estimateRelationshipStrength(light.tier, light.daysSinceContact);
  const idealDays = light.tier !== 'archived' ? IDEAL_CONTACT_DAYS[light.tier] : 30;

  const getTempInfo = () => {
    if (light.temperature === 'warm') return { color: TEMP_COLORS.green, label: 'Doing well' };
    if (light.temperature === 'neutral') return { color: TEMP_COLORS.yellow, label: 'Okay' };
    if (light.temperature === 'cool') return { color: TEMP_COLORS.orange, label: 'Having a hard time' };
    return null;
  };
  const tempInfo = getTempInfo();
  const birthdayDays = light.birthday ? daysUntilNextBirthday(light.birthday) : null;
  const birthdaySoon = birthdayDays !== null && birthdayDays <= 14;
  const recentLog = (light.connectionLog || []).slice(0, 5);

  const handleText = () => { if (light.phone) { Linking.openURL(`sms:${light.phone.replace(/\D/g, '')}`); logContact(light.id, { type: 'text', quality: 'brief' }); } else Alert.alert('No phone number', 'Add a phone number to text this person.'); };
  const handleCall = () => { if (light.phone) { Linking.openURL(`tel:${light.phone.replace(/\D/g, '')}`); logContact(light.id, { type: 'call', quality: 'meaningful' }); } else Alert.alert('No phone number', 'Add a phone number to call this person.'); };
  const handleMindMail = () => router.push({ pathname: '/mind-mail/compose', params: { recipientId: light.id, recipientName: light.name } } as any);
  const handleLogInteraction = () => router.push(`/lights/log-entry?id=${encodeURIComponent(light.id)}`);
  const handleChangeTier = (tier: string) => { setTier(light.id, tier as keyof typeof TIER_LABELS); setShowTierPicker(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const handleArchive = () => Alert.alert('Archive this light?', `${light.name} will be moved to archived.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Archive', onPress: () => { setTier(light.id, 'archived'); router.back(); } }]);
  const handleRemove = () => Alert.alert('Remove this person?', `${light.name} will be permanently removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => { removeLight(light.id); router.replace('/(tabs)/lights'); } }]);

  const formatLogDate = (date: Date | string) => formatDate(typeof date === 'string' ? date : new Date(date).toISOString().slice(0, 10));

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {light.photoUri ? <Image source={{ uri: light.photoUri }} style={styles.avatar} /> : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: brightConfig.color + '33' }]}><Text style={styles.avatarInitial}>{light.name.charAt(0).toUpperCase()}</Text></View>
        )}
        <Text style={styles.name}>{light.name}</Text>
        <Pressable style={styles.tierBadge} onPress={() => setShowTierPicker(!showTierPicker)}>
          <Text style={styles.tierText}>{TIER_LABELS[light.tier]}</Text>
          <Text style={styles.tierRelation}> · {light.relationshipType || 'Friend'}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
        </Pressable>
        {showTierPicker && (
          <View style={styles.tierPicker}>
            {(['five', 'fifteen', 'fifty', 'network'] as const).map((tier) => (
              <Pressable key={tier} style={[styles.tierOption, light.tier === tier && styles.tierOptionSelected]} onPress={() => handleChangeTier(tier)}>
                <Text style={[styles.tierOptionText, light.tier === tier && styles.tierOptionTextSelected]}>{TIER_LABELS[tier]}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.lightOrb, { backgroundColor: brightConfig.color }]}><Text style={styles.lightEmoji}>{brightConfig.emoji}</Text></View>
            <Text style={[styles.statusLabel, { color: brightConfig.color }]}>{brightConfig.label}</Text>
            <Text style={styles.statusSub}>Your connection</Text>
          </View>
          {tempInfo && (
            <View style={styles.statusItem}>
              <View style={[styles.tempOrb, { backgroundColor: tempInfo.color }]} />
              <Text style={[styles.statusLabel, { color: tempInfo.color }]}>{tempInfo.label}</Text>
              <Text style={styles.statusSub}>How they're doing</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={handleText}><Ionicons name="chatbubble" size={22} color={COLORS.accent} /><Text style={styles.actionLabel}>Text</Text></Pressable>
        <Pressable style={styles.actionBtn} onPress={handleCall}><Ionicons name="call" size={22} color={COLORS.accent} /><Text style={styles.actionLabel}>Call</Text></Pressable>
        <Pressable style={styles.actionBtn} onPress={handleMindMail}><Ionicons name="mail" size={22} color={COLORS.accent} /><Text style={styles.actionLabel}>Mind Mail</Text></Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setShowReachOut(true)}><Ionicons name="apps" size={22} color={COLORS.accent} /><Text style={styles.actionLabel}>More</Text></Pressable>
      </View>

      <ReachOutSheet visible={showReachOut} onClose={() => setShowReachOut(false)} light={light} />

      {/* You two together */}
      <Section title="📊 You two together">
        <View style={styles.lightStats}>
          <View style={styles.statRow}><Text style={styles.statLabel}>Last contact</Text><Text style={styles.statValue}>{light.daysSinceContact === 0 ? 'Today' : light.daysSinceContact === 1 ? 'Yesterday' : light.daysSinceContact < 999 ? `${light.daysSinceContact} days ago` : 'Never'}</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Ideal frequency</Text><Text style={styles.statValue}>Every {idealDays} days</Text></View>
          <View style={styles.statRow}><Text style={styles.statLabel}>Connection strength</Text><View style={styles.strengthBar}><View style={[styles.strengthFill, { width: `${relationshipStrength}%`, backgroundColor: brightConfig.color }]} /></View><Text style={[styles.statValue, { color: brightConfig.color }]}>{relationshipStrength}%</Text></View>
        </View>
        {recentLog.length > 0 && (
          <View style={styles.recentLog}><Text style={styles.recentLogTitle}>Recent</Text>
            {recentLog.map((entry) => <View key={entry.id} style={styles.logEntry}><Text style={styles.logDate}>{formatLogDate(entry.date)}</Text><Text style={styles.logType}>{entry.type}</Text>{entry.note && <Text style={styles.logNote} numberOfLines={1}>{entry.note}</Text>}</View>)}
          </View>
        )}
        <Pressable style={styles.viewAllBtn} onPress={handleLogInteraction}><Text style={styles.viewAllText}>View full history →</Text></Pressable>
      </Section>

      {birthdaySoon && <View style={styles.alertCard}><Text style={styles.alertEmoji}>🎂</Text><View style={styles.alertContent}><Text style={styles.alertTitle}>Birthday {birthdayDays === 0 ? 'today!' : `in ${birthdayDays} days`}</Text></View></View>}

      {(light.loveLanguage || light.bestWayToConnect || light.whatTheyNeed || light.howTheyShowLove) && (
        <Section title="💝 How to Love Them">
          {light.loveLanguage && <InfoRow label="Love language" value={light.loveLanguage} />}
          {light.bestWayToConnect && <InfoRow label="Best way to connect" value={light.bestWayToConnect} />}
          {light.whatTheyNeed && <InfoRow label="What they need" value={light.whatTheyNeed} />}
          {light.howTheyShowLove && <InfoRow label="How they show love" value={light.howTheyShowLove} />}
        </Section>
      )}

      <Section title="🧠 Know Them Better">
        {light.birthday && <InfoRow label="Birthday" value={formatDate(light.birthday)} />}
        {light.howWeMet && <InfoRow label="How you met" value={light.howWeMet} />}
        {light.interests && <InfoRow label="Interests" value={light.interests} />}
        {light.values && <InfoRow label="Values" value={light.values} />}
        {light.family && <InfoRow label="Family" value={light.family} />}
        {!light.interests && !light.values && !light.howWeMet && <Pressable style={styles.addInfoBtn} onPress={() => router.push(`/lights/edit/${light.id}` as any)}><Ionicons name="add" size={18} color={COLORS.accent} /><Text style={styles.addInfoText}>Add more details</Text></Pressable>}
      </Section>

      {(light.notes || (light.relateInsights && light.relateInsights.length > 0)) && (
        <Section title="📝 Notes & Context">
          {light.notes && <Text style={styles.notesText}>{light.notes}</Text>}
          {light.relateInsights?.map((insight, i) => <Text key={i} style={styles.insightItem}>• {insight}</Text>)}
        </Section>
      )}

      {((light.giftIdeas && light.giftIdeas.length > 0) || (light.pastGifts && light.pastGifts.length > 0) || light.favoritesSizes) && (
        <Section title="🎁 Gifts">
          {light.favoritesSizes && <InfoRow label="Sizes & favorites" value={light.favoritesSizes} />}
          {light.giftIdeas && light.giftIdeas.length > 0 && <InfoRow label="Gift ideas" value={light.giftIdeas.join(', ')} />}
          {light.pastGifts && light.pastGifts.length > 0 && <InfoRow label="Past gifts" value={light.pastGifts.join(', ')} />}
        </Section>
      )}

      <Section title="📍 Contact Info">
        {light.phone && <InfoRow label="Phone" value={light.phone} />}
        {light.email && <InfoRow label="Email" value={light.email} />}
        {light.address && <InfoRow label="Address" value={light.address} />}
        {!light.phone && !light.email && <Pressable style={styles.addInfoBtn} onPress={() => router.push(`/lights/edit/${light.id}` as any)}><Ionicons name="add" size={18} color={COLORS.accent} /><Text style={styles.addInfoText}>Add contact info</Text></Pressable>}
      </Section>

      <Section title="⚙️ Settings">
        <Pressable style={styles.settingRow} onPress={() => router.push(`/lights/edit/${light.id}` as any)}><Text style={styles.settingText}>Edit profile</Text><Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} /></Pressable>
        <Pressable style={styles.settingRow} onPress={handleArchive}><Text style={styles.settingText}>Archive this light</Text><Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} /></Pressable>
        <Pressable style={[styles.settingRow, styles.dangerRow]} onPress={handleRemove}><Text style={styles.dangerText}>Remove from People</Text></Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionCard}>{children}</View></View>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 24 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginBottom: 16 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.button },
  backBtnText: { fontSize: 16, color: COLORS.accent, fontWeight: '600' },
  header: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 16 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: COLORS.text },
  name: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: 20, gap: 4 },
  tierText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tierRelation: { fontSize: 14, color: COLORS.textMuted },
  tierPicker: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12, padding: 12, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card },
  tierOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.background },
  tierOptionSelected: { backgroundColor: COLORS.accent },
  tierOptionText: { fontSize: 14, color: COLORS.text },
  tierOptionTextSelected: { color: '#000', fontWeight: '600' },
  statusRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 20 },
  statusItem: { alignItems: 'center' },
  lightOrb: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  lightEmoji: { fontSize: 20 },
  tempOrb: { width: 48, height: 48, borderRadius: 24, marginBottom: 8 },
  statusLabel: { fontSize: 14, fontWeight: '600' },
  statusSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  actionBtn: { alignItems: 'center', minWidth: 60 },
  actionLabel: { fontSize: 12, color: COLORS.text, marginTop: 6 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  lightStats: { marginBottom: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { fontSize: 14, color: COLORS.textMuted },
  statValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  strengthBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginHorizontal: 12, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 3 },
  recentLog: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 },
  recentLogTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  logEntry: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  logDate: { fontSize: 13, color: COLORS.textMuted, width: 50 },
  logType: { fontSize: 13, color: COLORS.text, textTransform: 'capitalize' },
  logNote: { flex: 1, fontSize: 13, color: COLORS.textMuted },
  viewAllBtn: { paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  viewAllText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBBF2420', borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 20, gap: 12 },
  alertEmoji: { fontSize: 28 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  infoValue: { fontSize: 15, color: COLORS.text },
  notesText: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 8 },
  insightItem: { fontSize: 14, color: COLORS.text, marginBottom: 6 },
  addInfoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.input, borderStyle: 'dashed' },
  addInfoText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingText: { fontSize: 15, color: COLORS.text },
  dangerRow: { borderBottomWidth: 0 },
  dangerText: { fontSize: 15, color: '#EF4444' },
});
