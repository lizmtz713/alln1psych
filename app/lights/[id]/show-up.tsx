/**
 * How to Show Up for Me — inviter: link + summary for this person.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useAuth } from '../../../src/providers/AuthProvider';
import { useUserStore } from '../../../src/stores/userStore';
import { useCircleStore } from '../../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../../src/stores/lightsStore';
import {
  createShowUpInvite,
  ensureSummaryForLatestResponse,
  fetchLatestSummaryForPerson,
  buildShowUpToneHint,
  buildInviterHighlightLine,
} from '../../../src/services/showUpService';
import type { ShowUpSummaryRow } from '../../../src/types/showUp';
import { DidThisHelp } from '../../../src/components/tools/DidThisHelp';

export default function ShowUpForPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profileName = useUserStore((s) => s.name);
  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
      momentumByMemberId: s.momentumByMemberId,
      lastHeroShownByMemberId: s.lastHeroShownByMemberId,
      seasonByMemberId: s.seasonByMemberId,
      timelineEventsByMemberId: s.timelineEventsByMemberId,
    }))
  );
  const lights = computeLights(Array.isArray(members) ? members : [], persistState);
  const light = lights.find((l) => l.id === id);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ShowUpSummaryRow | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inviterName = profileName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Me';

  const refresh = useCallback(async () => {
    if (!user?.id || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const pair = await fetchLatestSummaryForPerson(user.id, id);
    let sum = pair?.summary ?? null;
    if (pair?.response && !sum) {
      sum = await ensureSummaryForLatestResponse(user.id, id);
    }
    setSummary(sum);
    setLoading(false);
  }, [user?.id, id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateLink = async () => {
    if (!user?.id || !id || !light) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBusy(true);
    const res = await createShowUpInvite({
      ownerUserId: user.id,
      personId: id,
      personDisplayName: light.name,
      inviterDisplayName: String(inviterName),
    });
    setBusy(false);
    if (!res) {
      Alert.alert('Could not create link', 'Check your connection and that you are signed in.');
      return;
    }
    setLastUrl(res.url);
    await Clipboard.setStringAsync(res.url);
    Alert.alert('Link ready', 'Copied to clipboard. Share it with ' + light.name + '.');
  };

  const handleCopy = async () => {
    if (!lastUrl) return;
    await Clipboard.setStringAsync(lastUrl);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    if (!lastUrl || !light) return;
    try {
      await Share.share({
        message: `Hey — I'm using InGauge to be better about staying connected and showing up for people. If you want, you can fill this out in 2 minutes so I know what helps and what doesn't. No app needed: ${lastUrl}`,
      });
    } catch {
      /* ignore */
    }
  };

  const toneContext = summary ? buildShowUpToneHint(summary) : null;

  if (!light) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>Person not found.</Text>
      </View>
    );
  }

  if (!user?.id) {
    return (
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>How to show up for {light.name}</Text>
        <Text style={styles.body}>
          Sign in with an account that syncs to the cloud to create invite links and save answers. Your local people list
          is still here — this feature uses secure storage for responses.
        </Text>
      </ScrollView>
    );
  }

  const bullets = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerRow, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Show up for {light.name}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite them (no app needed)</Text>
        <Text style={styles.cardSub}>
          Send a short questionnaire so you can understand how they like support, check-ins, and repair.
        </Text>
        <Pressable
          style={[styles.primaryBtn, busy && { opacity: 0.7 }]}
          onPress={handleCreateLink}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Create link & copy</Text>
          )}
        </Pressable>
        {lastUrl ? (
          <View style={styles.rowBtns}>
            <Pressable style={styles.secondaryBtn} onPress={handleCopy}>
              <Text style={styles.secondaryBtnText}>Copy again</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleShare}>
              <Text style={styles.secondaryBtnText}>Share…</Text>
            </Pressable>
          </View>
        ) : null}
        {lastUrl ? (
          <Text style={styles.urlHint} numberOfLines={2}>
            {lastUrl}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 24 }} />
      ) : summary ? (
        <View style={styles.card}>
          <View style={styles.rewardBanner}>
            <Text style={styles.rewardTitle}>You now know how to show up for {light.name} better.</Text>
            <Text style={styles.rewardHighlightLabel}>At a glance</Text>
            <Text style={styles.rewardHighlight}>{buildInviterHighlightLine(summary)}</Text>
          </View>

          <Text style={styles.cardTitle}>Support summary</Text>
          <Text style={styles.updated}>Last updated {new Date(summary.generated_at).toLocaleDateString()}</Text>

          <Section title="Best ways to show up" items={bullets(summary.best_ways_to_show_up)} />
          <Section title="What helps when they’re stressed" items={bullets(summary.stress_help)} />
          <Section title="What to avoid" items={bullets(summary.avoid)} />
          {summary.communication_style_summary ? (
            <TextBlock title="Communication style" body={summary.communication_style_summary} />
          ) : null}
          {summary.repair_style_summary ? (
            <TextBlock title="Repair style" body={summary.repair_style_summary} />
          ) : null}
          {summary.easy_show_up_summary ? (
            <TextBlock title="One easy way to show up" body={summary.easy_show_up_summary} />
          ) : null}
          {summary.important_dates_note ? (
            <TextBlock title="Important dates / seasons" body={summary.important_dates_note} />
          ) : null}
          {summary.summary_text ? <Text style={styles.blurb}>{summary.summary_text}</Text> : null}

          <View style={styles.rowBtns}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/tools/reach-out',
                  params: { showUpPersonId: id, showUpPersonName: light.name },
                } as any);
              }}
            >
              <Text style={styles.secondaryBtnText}>Reach Out</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const ctx = toneContext?.trim();
                router.push({
                  pathname: '/tools/tone-check',
                  params: ctx ? { showUpContext: encodeURIComponent(ctx) } : {},
                } as any);
              }}
            >
              <Text style={styles.secondaryBtnText}>Tone Check</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(modals)/relational-bridge',
                  params: { memberId: id },
                } as any);
              }}
            >
              <Text style={styles.secondaryBtnText}>Relational Bridge</Text>
            </Pressable>
          </View>

          <DidThisHelp
            toolId={`show-up-inviter-${id}`}
            prompt="Did this help you show up better?"
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardSub}>
            When {light.name} completes the questionnaire, a practical summary will appear here. Create a link above to get
            started.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={{ marginTop: SPACING.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((line, i) => (
        <Text key={i} style={styles.bullet}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ marginTop: SPACING.md }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  card: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  cardSub: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.md },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: SPACING.md, flexWrap: 'wrap' },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  urlHint: { fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.sm },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  bullet: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 4 },
  body: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  blurb: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginTop: SPACING.md, fontStyle: 'italic' },
  updated: { fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  muted: { color: COLORS.textSecondary, fontSize: 16 },
  rewardBanner: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.card,
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
  },
  rewardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, lineHeight: 24, marginBottom: SPACING.sm },
  rewardHighlightLabel: { fontSize: 12, fontWeight: '700', color: COLORS.accent, marginBottom: 6, letterSpacing: 0.4 },
  rewardHighlight: { fontSize: 16, color: COLORS.text, lineHeight: 24, fontWeight: '500' },
});
