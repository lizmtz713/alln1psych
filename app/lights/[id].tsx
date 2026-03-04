import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Image, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCircleStore } from '../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';
import { TIER_LABELS, LIGHT_TEMPERATURE_SCALE } from '../../src/types/lights';

function daysUntil(iso: string): number {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  return diff;
}

function formatBirthday(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

export default function LightProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
    }))
  );
  const lights = useMemo(() => computeLights(members, persistState), [members, persistState]);
  const light = lights.find((l) => l.id === id);
  const setTier = useLightsStore((s) => s.setTier);
  const removeLight = useLightsStore((s) => s.removeLight);

  if (!light) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Light not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back to Lights</Text>
        </Pressable>
      </View>
    );
  }

  const tempKey = light.temperature === 'unknown' ? 'neutral' : light.temperature;
  const tempColor = LIGHT_TEMPERATURE_SCALE[tempKey]?.color ?? COLORS.textMuted;
  const connectionLog = light.connectionLog ?? [];
  const hasContactInfo = light.phone || light.email || light.address;

  const openTel = () => {
    const raw = (light.phone ?? '').replace(/\D/g, '');
    if (raw) Linking.openURL(`tel:${raw}`);
    else Alert.alert('No number', 'No phone number saved for this light.');
  };
  const openSms = () => {
    const raw = (light.phone ?? '').replace(/\D/g, '');
    if (raw) Linking.openURL(`sms:${raw}`);
    else Alert.alert('No number', 'No phone number saved for this light.');
  };
  const openEmail = () => {
    if (light.email) Linking.openURL(`mailto:${light.email}`);
    else Alert.alert('No email', 'No email saved for this light.');
  };
  const openMaps = () => {
    if (light.address) Linking.openURL(`maps://?address=${encodeURIComponent(light.address)}`);
    else Alert.alert('No address', 'No address saved for this light.');
  };
  const copyToClipboard = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const scrollRef = useRef<ScrollView>(null);
  const giftsSectionY = useRef<number>(0);

  const openLogEntry = () => {
    router.push(`/lights/log-entry?id=${encodeURIComponent(light.id)}`);
  };

  const scrollToGifts = () => {
    scrollRef.current?.scrollTo({ y: giftsSectionY.current, animated: true });
  };

  // Smart hints (after light is defined)
  const smartHints = useMemo(() => {
    const hints: string[] = [];
    if (light.daysSinceContact >= 14) {
      const weeks = Math.floor(light.daysSinceContact / 7);
      hints.push(`You haven't talked to ${light.name} in ${weeks} week${weeks !== 1 ? 's' : ''}`);
    }
    if (light.birthday) {
      const d = daysUntil(light.birthday);
      if (d >= 0 && d <= 14) hints.push(`${light.name}'s birthday is in ${d === 0 ? 'today!' : d === 1 ? '1 day' : `${d} days`}`);
    }
    if (light.anniversary) {
      const d = daysUntil(light.anniversary);
      if (d >= 0 && d <= 14) hints.push(`Anniversary in ${d === 0 ? 'today!' : d === 1 ? '1 day' : `${d} days`}`);
    }
    const pendingFollowUps = (light.connectionLog ?? [])
      .flatMap((e) => e.followUps ?? [])
      .filter(Boolean)
      .slice(0, 2);
    pendingFollowUps.forEach((f) => hints.push(`Follow-up: ${f}`));
    return hints;
  }, [light]);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarWrap}>
        {light.photoUri ? (
          <Image source={{ uri: light.photoUri }} style={[styles.avatar, styles.avatarImage]} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: tempColor + '33' }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.name}>{light.name}</Text>
        <Text style={styles.tierBadge}>{TIER_LABELS[light.tier]}</Text>
        <View style={[styles.tempChip, { backgroundColor: tempColor + '22' }]}>
          <Text style={[styles.tempChipText, { color: tempColor }]}>{light.temperatureLabel}</Text>
        </View>
      </View>

      {smartHints.length > 0 ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REMINDERS</Text>
            <View style={styles.card}>
              {smartHints.map((hint, i) => (
                <View key={i} style={styles.hintRow}>
                  <Ionicons name="bulb-outline" size={18} color={COLORS.accent} />
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : null}

      {hasContactInfo ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.quickActions}>
              {light.phone ? (
                <>
                  <Pressable style={styles.quickActionBtn} onPress={openTel}>
                    <Ionicons name="call" size={24} color={COLORS.accent} />
                    <Text style={styles.quickActionLabel}>Call</Text>
                  </Pressable>
                  <Pressable style={styles.quickActionBtn} onPress={openSms}>
                    <Ionicons name="chatbubble" size={24} color={COLORS.accent} />
                    <Text style={styles.quickActionLabel}>Text</Text>
                  </Pressable>
                </>
              ) : null}
              {light.email ? (
                <Pressable style={styles.quickActionBtn} onPress={openEmail}>
                  <Ionicons name="mail" size={24} color={COLORS.accent} />
                  <Text style={styles.quickActionLabel}>Email</Text>
                </Pressable>
              ) : null}
              {(light.giftIdeas?.length ?? 0) + (light.pastGifts?.length ?? 0) > 0 || light.favoritesSizes ? (
                <Pressable style={styles.quickActionBtn} onPress={scrollToGifts}>
                  <Ionicons name="gift" size={24} color={COLORS.accent} />
                  <Text style={styles.quickActionLabel}>Gift</Text>
                </Pressable>
              ) : null}
              {light.address ? (
                <Pressable style={styles.quickActionBtn} onPress={openMaps}>
                  <Ionicons name="car" size={24} color={COLORS.accent} />
                  <Text style={styles.quickActionLabel}>
                    Visit{light.driveTimeMinutes ? ` · ${light.driveTimeMinutes} min` : ''}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTACT INFO</Text>
            <View style={styles.card}>
              {light.phone ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <View style={styles.contactValueRow}>
                    <Text style={styles.contactValue}>{light.phone}</Text>
                    <Pressable onPress={() => copyToClipboard(light.phone!, 'Phone')}>
                      <Text style={styles.copyLink}>Copy</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              {light.email ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <View style={styles.contactValueRow}>
                    <Text style={styles.contactValue}>{light.email}</Text>
                    <Pressable onPress={() => copyToClipboard(light.email!, 'Email')}>
                      <Text style={styles.copyLink}>Copy</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              {light.address ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Address</Text>
                  <View style={styles.contactValueRow}>
                    <Text style={styles.contactValue} numberOfLines={2}>{light.address}</Text>
                    <Pressable onPress={openMaps}>
                      <Text style={styles.copyLink}>Maps</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              {light.birthday ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Birthday</Text>
                  <Text style={styles.contactValue}>{formatBirthday(light.birthday)} 🎂</Text>
                </View>
              ) : null}
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WHO THEY ARE</Text>
        <View style={styles.card}>
          <Row label="Relationship" value={light.relationshipType} />
          {light.howWeMet && <Row label="How we met" value={light.howWeMet} />}
          {light.birthday && <Row label="Birthday" value={formatBirthday(light.birthday)} />}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LOVE LANGUAGE & NOTES</Text>
        <View style={styles.card}>
          {light.loveLanguage && <Row label="Love language" value={light.loveLanguage} />}
          {light.loveLanguageNotes && <Row label="Notes on how they feel loved" value={light.loveLanguageNotes} />}
          {light.notes && <Row label="Notes" value={light.notes} />}
        </View>
      </View>

      {(light.howTheyOperate || light.howTheyShowLove || light.whatTheyNeed || light.bestWayToConnect) ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DO PROFILE — How they operate</Text>
            <View style={styles.card}>
              {light.howTheyOperate && <Row label="How they operate" value={light.howTheyOperate} />}
              {light.howTheyShowLove && <Row label="How they show love" value={light.howTheyShowLove} />}
              {light.whatTheyNeed && <Row label="What they need" value={light.whatTheyNeed} />}
              {light.bestWayToConnect && <Row label="Best way to connect" value={light.bestWayToConnect} />}
            </View>
          </View>
        </>
      ) : null}

      {(light.relateInsights?.length ?? 0) > 0 ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RELATE INSIGHTS</Text>
            <View style={styles.card}>
              {light.relateInsights!.map((insight, i) => (
                <Text key={i} style={styles.insightBullet}>• {insight}</Text>
              ))}
            </View>
          </View>
        </>
      ) : null}

      {(light.birthday || light.anniversary) ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KEY DATES</Text>
            <View style={styles.card}>
              {light.birthday && <Row label="Birthday" value={`${formatBirthday(light.birthday)} 🎂`} />}
              {light.anniversary && <Row label="Anniversary" value={formatBirthday(light.anniversary)} />}
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THEIR TEMPERATURE</Text>
        <View style={styles.card}>
          <Text style={styles.tempLabel}>{light.temperatureLabel}</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: '/mind-mail/compose', params: { recipientId: light.id, recipientName: light.name } })}
          >
            <Text style={styles.primaryButtonText}>Send Mind Mail</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={openLogEntry}>
            <Text style={styles.secondaryButtonText}>Log a call</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONNECTION LOG</Text>
        <View style={styles.card}>
          {connectionLog.length === 0 ? (
            <Text style={styles.muted}>No entries yet. Log a call or interaction to remember follow-ups.</Text>
          ) : (
            connectionLog.slice(0, 15).map((e) => (
              <View key={e.id} style={styles.logEntry}>
                <View style={styles.logRow}>
                  <Text style={styles.logDate}>{new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
                  <Text style={styles.logType}>{e.type}</Text>
                  {e.duration != null ? <Text style={styles.logMeta}>{e.duration} min</Text> : null}
                  {e.mood ? <Text style={styles.logMeta}>{String(e.mood)}</Text> : null}
                </View>
                {(e.summary || e.note) ? (
                  <Text style={styles.logNote} numberOfLines={2}>{e.summary || e.note}</Text>
                ) : null}
                {(e.followUps?.length ?? 0) > 0 ? (
                  <View style={styles.followUpsWrap}>
                    {e.followUps!.map((f, i) => (
                      <Text key={i} style={styles.followUpChip}>→ {f}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))
          )}
          <Pressable style={styles.secondaryButton} onPress={openLogEntry}>
            <Text style={styles.secondaryButtonText}>+ Log interaction</Text>
          </Pressable>
        </View>
      </View>

      {(light.giftIdeas?.length ?? 0) + (light.pastGifts?.length ?? 0) > 0 || light.favoritesSizes ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section} onLayout={(e) => { giftsSectionY.current = e.nativeEvent.layout.y; }}>
            <Text style={styles.sectionTitle}>GIFTS</Text>
            <View style={styles.card}>
              {light.favoritesSizes ? <Row label="Favorites / sizes" value={light.favoritesSizes} /> : null}
              {(light.giftIdeas?.length ?? 0) > 0 ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Gift ideas</Text>
                  <Text style={styles.rowValue}>{light.giftIdeas!.join(' · ')}</Text>
                </View>
              ) : null}
              {(light.pastGifts?.length ?? 0) > 0 ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Past gifts</Text>
                  <Text style={styles.rowValue}>{light.pastGifts!.join(' · ')}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </>
      ) : null}

      {(light.family || light.interests || light.values) ? (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FAMILY · INTERESTS · VALUES</Text>
            <View style={styles.card}>
              {light.family && <Row label="Family" value={light.family} />}
              {light.interests && <Row label="Interests" value={light.interests} />}
              {light.values && <Row label="Values" value={light.values} />}
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LIGHT STATUS</Text>
        <View style={styles.card}>
          <Row label="Tier" value={TIER_LABELS[light.tier]} />
          <Row label="Brightness" value={light.brightness + '%'} />
          <Row label="Health" value={light.status === 'healthy' ? 'Healthy' : light.status} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Pressable style={styles.linkRow} onPress={() => setTier(light.id, 'archived')}>
          <Text style={styles.linkRowText}>Archive this light</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>
        <Pressable
          style={[styles.linkRow, styles.dangerRow]}
          onPress={() => { removeLight(light.id); router.replace('/(tabs)/lights'); }}
        >
          <Text style={styles.dangerText}>Remove from Lights</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  error: { color: COLORS.textMuted, padding: 24 },
  link: { color: COLORS.accent, padding: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarImage: { backgroundColor: COLORS.surface },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  tierBadge: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  tempChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  tempChipText: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  row: { marginBottom: 12 },
  rowLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  rowValue: { fontSize: 15, color: COLORS.text },
  tempLabel: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  primaryButton: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 10 },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  secondaryButton: { paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.input },
  secondaryButtonText: { fontSize: 15, color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  logDate: { fontSize: 14, color: COLORS.text, width: 48 },
  logType: { fontSize: 14, color: COLORS.textMuted, textTransform: 'capitalize' },
  logNote: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  linkRowText: { fontSize: 15, color: COLORS.text },
  dangerRow: { borderColor: COLORS.error + '44' },
  dangerText: { fontSize: 15, color: COLORS.error },
  quickActions: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  quickActionBtn: { alignItems: 'center', minWidth: 72 },
  quickActionLabel: { fontSize: 13, color: COLORS.text, marginTop: 6 },
  contactRow: { marginBottom: 14 },
  contactLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  contactValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  contactValue: { flex: 1, fontSize: 15, color: COLORS.text },
  copyLink: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  hintRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  hintText: { flex: 1, fontSize: 14, color: COLORS.text },
  logEntry: { marginBottom: 14 },
  logMeta: { fontSize: 12, color: COLORS.textMuted, textTransform: 'capitalize', marginLeft: 4 },
  followUpsWrap: { marginTop: 4, marginLeft: 0 },
  followUpChip: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
  insightBullet: { fontSize: 14, color: COLORS.text, marginBottom: 8 },
});
