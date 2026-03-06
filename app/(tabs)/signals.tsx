/**
 * Signals — Unified relationship hub (Lights + Mind Mail merged).
 * One place to see who matters, who needs attention, and take action (Transmit / Check in / Log).
 */

import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { useDailyAnchorsStore } from '../../src/stores/dailyAnchorsStore';
import {
  getDailyReachOuts,
  getTierHealth,
  getLightBrightness,
} from '../../src/services/friendshipMaintenance';
import { selectHero } from '../../src/services/heroEngine';
import { DailyConnectionPrompt } from '../../src/components/mind-mail/DailyConnectionPrompt';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { PersonDetailSheet } from '../../src/components/signals/PersonDetailSheet';
import { TransmitComposerSheet } from '../../src/components/signals/TransmitComposerSheet';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';
import { getRelationshipStatusLabel } from '../../src/lib/signalsCopy';
import { getHeroTimelineHint } from '../../src/services/timelineEngine';
import type { Light, LightTier } from '../../src/types/lights';
import type { MindMailIntent } from '../../src/types/mindMail';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SignalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'attention' | 'tier'>('attention');
  const [personSheetLight, setPersonSheetLight] = useState<Light | null>(null);
  const [transmitSheetVisible, setTransmitSheetVisible] = useState(false);
  const [transmitRecipientId, setTransmitRecipientId] = useState<string | null>(null);
  const [transmitRecipientName, setTransmitRecipientName] = useState('');
  const [transmitPresetIntent, setTransmitPresetIntent] = useState<MindMailIntent | null>(null);

  const members = useCircleStore((s) => s.members ?? []);
  const lights = useLightsStore((s) => {
    try {
      return s.getLights(Array.isArray(members) ? members : []);
    } catch {
      return [];
    }
  });
  const lastHeroShownByMemberId = useLightsStore(useShallow((s) => s.lastHeroShownByMemberId));
  const setLastHeroShown = useLightsStore((s) => s.setLastHeroShown);

  const dailyReachOuts = useMemo(() => getDailyReachOuts(lights, 8), [lights]);
  const tierHealth = useMemo(() => getTierHealth(lights), [lights]);

  const heroResult = useMemo(
    () =>
      selectHero(lights, {
        momentumByMemberId: Object.fromEntries(
          lights.filter((l): l is Light & { momentumScore: number } => l.momentumScore != null).map((l) => [l.id, l.momentumScore])
        ),
        lastHeroByMemberId: lastHeroShownByMemberId,
      }),
    [lights, lastHeroShownByMemberId]
  );

  const priority = heroResult?.light ?? dailyReachOuts.priority[0] ?? dailyReachOuts.suggested[0];
  const heroLifeEventLabel = heroResult?.lifeEventLabel;

  useEffect(() => {
    if (priority?.id) setLastHeroShown(priority.id);
  }, [priority?.id, setLastHeroShown]);

  const ensureDate = useDailyAnchorsStore((s) => s.ensureDate);
  const date = useDailyAnchorsStore((s) => s.date);
  const connectionPromptActedOn = useDailyAnchorsStore((s) => s.connectionPromptActedOn);
  const isToday = date === todayKey();
  const actedOn = isToday && connectionPromptActedOn;
  const needAttentionCount = dailyReachOuts.priority.length + dailyReachOuts.suggested.length;
  const warmCount = lights.filter(
    (l) => l.tier !== 'archived' && getLightBrightness(l.tier, l.daysSinceContact) === 'bright'
  ).length;
  const driftingCount = tierHealth.reduce((sum, th) => sum + th.dimming + th.needsAttention, 0);

  const sortedLights = useMemo(() => {
    const active = lights.filter((l) => l.tier !== 'archived');
    if (sortBy === 'attention') {
      const priorityIds = new Set([...dailyReachOuts.priority, ...dailyReachOuts.suggested].map((l) => l.id));
      return [...active].sort((a, b) => {
        const aPri = priorityIds.has(a.id);
        const bPri = priorityIds.has(b.id);
        if (aPri && !bPri) return -1;
        if (!aPri && bPri) return 1;
        return a.daysSinceContact - b.daysSinceContact;
      });
    }
    return [...active].sort((a, b) => {
      const tierOrder: Record<LightTier, number> = { five: 0, fifteen: 1, fifty: 2, network: 3, archived: 4 };
      const t = tierOrder[a.tier] - tierOrder[b.tier];
      if (t !== 0) return t;
      return a.daysSinceContact - b.daysSinceContact;
    });
  }, [lights, sortBy, dailyReachOuts.priority, dailyReachOuts.suggested]);

  useEffect(() => { ensureDate(); }, [ensureDate]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const openTransmitSheet = (recipientId: string | null, recipientName: string, presetIntent?: MindMailIntent | null) => {
    setTransmitRecipientId(recipientId);
    setTransmitRecipientName(recipientName || '');
    setTransmitPresetIntent(presetIntent ?? null);
    setTransmitSheetVisible(true);
  };

  const openPersonSheet = (light: Light) => {
    setPersonSheetLight(light);
  };

  const closePersonSheet = () => setPersonSheetLight(null);

  const needsAttentionLights = useMemo(
    () => [...dailyReachOuts.priority, ...dailyReachOuts.suggested],
    [dailyReachOuts.priority, dailyReachOuts.suggested]
  );

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* A. Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Signals</Text>
            <Text style={styles.headerSubtitle}>
              Your people, their signals, and your next best action.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/lights/add');
              }}
            >
              <Ionicons name="person-add" size={22} color={COLORS.accent} />
            </Pressable>
            <Pressable
              style={styles.headerBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/mind-mail');
              }}
              accessibilityLabel="Inbox"
            >
              <Ionicons name="mail" size={22} color={COLORS.accent} />
            </Pressable>
          </View>
        </View>

        {/* B. Today's Focus / Hero */}
        <View style={styles.heroSection}>
          <DailyConnectionPrompt
            priority={priority}
            lifeEventLabel={heroLifeEventLabel}
            timelineHint={priority ? getHeroTimelineHint(priority) : null}
            onPressComposeNoRecipient={() => openTransmitSheet(null, '')}
            onPressWithRecipient={(id, name) => openTransmitSheet(id, name, 'encouragement')}
          />
        </View>

        {/* C. Signals strip */}
        <View style={styles.signalsStrip}>
          {needAttentionCount > 0 && (
            <Text style={styles.signalsStripText}>
              {needAttentionCount} need attention
            </Text>
          )}
          {warmCount > 0 && (
            <Text style={[styles.signalsStripText, styles.signalsStripMuted]}>
              {warmCount} doing well
            </Text>
          )}
          {driftingCount > 0 && needAttentionCount === 0 && (
            <Text style={[styles.signalsStripText, styles.signalsStripMuted]}>
              {driftingCount} drifting
            </Text>
          )}
          {needAttentionCount === 0 && warmCount === 0 && driftingCount === 0 && lights.length > 0 && (
            <Text style={[styles.signalsStripText, styles.signalsStripMuted]}>
              Relationship signals today
            </Text>
          )}
        </View>

        {/* D. Needs attention — explicit section */}
        {needsAttentionLights.length > 0 && (
          <View style={styles.attentionSection}>
            <Text style={styles.sectionTitle}>Needs attention</Text>
            {needsAttentionLights.map((light) => (
              <PersonRow
                key={light.id}
                light={light}
                dailyPriorityIds={new Set(needsAttentionLights.map((l) => l.id))}
                onPress={() => openPersonSheet(light)}
                onTransmit={() => openTransmitSheet(light.id, light.name)}
                statusLabel={getRelationshipStatusLabel(light, true)}
              />
            ))}
          </View>
        )}

        {/* E. Constellation */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/lights/radar');
          }}
        >
          <Text style={styles.cardEmoji}>🪐</Text>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Constellation</Text>
            <Text style={styles.cardSub}>Your relationship universe — who's close, who's drifting</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>

        {/* F. Your people list */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Your people</Text>
          <View style={styles.sortRow}>
            <Pressable
              style={[styles.sortChip, sortBy === 'attention' && styles.sortChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortBy('attention'); }}
            >
              <Text style={[styles.sortChipText, sortBy === 'attention' && styles.sortChipTextActive]}>
                Needs attention
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sortChip, sortBy === 'tier' && styles.sortChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortBy('tier'); }}
            >
              <Text style={[styles.sortChipText, sortBy === 'tier' && styles.sortChipTextActive]}>
                By circle
              </Text>
            </Pressable>
          </View>

          {sortedLights.length === 0 ? (
            <Pressable
              style={styles.emptyList}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/add'); }}
            >
              <Text style={styles.emptyListEmoji}>👋</Text>
              <Text style={styles.emptyListTitle}>Add someone</Text>
              <Text style={styles.emptyListSub}>Start with the people who matter most.</Text>
            </Pressable>
          ) : (
            sortedLights.map((light) => (
              <PersonRow
                key={light.id}
                light={light}
                dailyPriorityIds={new Set([...dailyReachOuts.priority, ...dailyReachOuts.suggested].map((l) => l.id))}
                onPress={() => openPersonSheet(light)}
                onTransmit={() => openTransmitSheet(light.id, light.name)}
                statusLabel={getRelationshipStatusLabel(light, dailyReachOuts.priority.some((l) => l.id === light.id) || dailyReachOuts.suggested.some((l) => l.id === light.id))}
              />
            ))
          )}
        </View>

        {/* G. More */}
        <View style={styles.moreRow}>
          <Pressable
            style={styles.moreCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/map'); }}
          >
            <Text style={styles.moreEmoji}>🌟</Text>
            <Text style={styles.moreLabel}>Map</Text>
          </Pressable>
          <Pressable
            style={styles.moreCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/world'); }}
          >
            <Text style={styles.moreEmoji}>🌡️</Text>
            <Text style={styles.moreLabel}>World temp</Text>
          </Pressable>
          <Pressable
            style={styles.moreCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/learn'); }}
          >
            <Text style={styles.moreEmoji}>📖</Text>
            <Text style={styles.moreLabel}>Learn</Text>
          </Pressable>
        </View>
      </ScrollView>

      <PersonDetailSheet
        visible={personSheetLight != null}
        light={personSheetLight}
        needsAttention={personSheetLight ? (dailyReachOuts.priority.some((l) => l.id === personSheetLight.id) || dailyReachOuts.suggested.some((l) => l.id === personSheetLight.id)) : false}
        onClose={closePersonSheet}
        onTransmit={(id, name, presetIntent) => { closePersonSheet(); openTransmitSheet(id, name, presetIntent); }}
        onSeeFullProfile={(id) => router.push(`/lights/${id}`)}
      />

      <TransmitComposerSheet
        visible={transmitSheetVisible}
        recipientId={transmitRecipientId}
        recipientName={transmitRecipientName}
        presetIntent={transmitPresetIntent}
        onClose={() => { setTransmitSheetVisible(false); setTransmitRecipientId(null); setTransmitRecipientName(''); setTransmitPresetIntent(null); }}
        onSent={(id) => {
          useDailyAnchorsStore.getState().setConnectionPromptActedOn(true);
          if (id) useDailyAnchorsStore.getState().setLastTransmittedToId(id);
        }}
      />
    </ErrorBoundary>
  );
}

function PersonRow({
  light,
  dailyPriorityIds,
  onPress,
  onTransmit,
  statusLabel,
}: {
  light: Light;
  dailyPriorityIds: Set<string>;
  onPress: () => void;
  onTransmit: () => void;
  statusLabel?: string;
}) {
  const needsAttention = dailyPriorityIds.has(light.id);
  const circleTemp = light.sharedTemperature?.label === 'warm' ? 'green' : light.sharedTemperature?.label === 'neutral' ? 'yellow' : light.sharedTemperature?.label === 'cool' ? 'orange' : 'green';
  const label = statusLabel ?? getRelationshipStatusLabel(light, needsAttention);

  return (
    <Pressable style={[styles.row, needsAttention && styles.rowAttention]} onPress={onPress}>
      <TemperatureGauge
        temperature={circleTemp as 'green' | 'yellow' | 'orange' | 'red'}
        size="sm"
        noPulse
      />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>{light.name}</Text>
        <Text style={styles.rowMeta}>
          {label} · {light.daysSinceContact}d
        </Text>
      </View>
      <Pressable
        style={styles.transmitBtn}
        onPress={(e) => { e.stopPropagation(); onTransmit(); }}
      >
        <Text style={styles.transmitBtnText}>Transmit</Text>
      </Pressable>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.lg,
    paddingHorizontal: 0,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 4, maxWidth: 240 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroSection: { marginBottom: SPACING.md },
  signalsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  signalsStripText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  signalsStripMuted: { color: COLORS.textMuted, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  cardSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  attentionSection: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10 },
  listSection: { marginBottom: SPACING.xl },
  listHeader: { marginBottom: SPACING.sm },
  listTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  sortChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  sortChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  sortChipTextActive: { color: COLORS.accent },
  emptyList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyListEmoji: { fontSize: 40, marginBottom: 12 },
  emptyListTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  emptyListSub: { fontSize: 14, color: COLORS.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: SPACING.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowAttention: {
    borderColor: COLORS.accent + '44',
    backgroundColor: COLORS.accentBg as string,
  },
  rowBody: { flex: 1, marginLeft: SPACING.md, minWidth: 0 },
  rowName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  rowMeta: { fontSize: 13, marginTop: 2 },
  transmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.accentBg as string,
  },
  transmitBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  moreRow: { flexDirection: 'row', gap: 12 },
  moreCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreEmoji: { fontSize: 24, marginBottom: 6 },
  moreLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
});
