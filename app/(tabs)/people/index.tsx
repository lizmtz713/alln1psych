/**
 * People — Relationship subsystem (Dunbar tiers, temperatures, drift, Transmit).
 * One place to see who matters, who needs attention, and take action.
 */

import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../../src/components/ErrorBoundary';
import { useCircleStore } from '../../../src/stores/circleStore';
import { useLightsStore } from '../../../src/stores/lightsStore';
import { useDailyAnchorsStore } from '../../../src/stores/dailyAnchorsStore';
import { getDailyReachOuts } from '../../../src/services/friendshipMaintenance';
import { RelationshipRing } from '../../../src/components/signals/RelationshipRing';
import { PersonDetailSheet } from '../../../src/components/signals/PersonDetailSheet';
import { TransmitComposerSheet } from '../../../src/components/signals/TransmitComposerSheet';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../src/lib/constants';
import {
  getRelationshipStatusLabel,
  getRelationshipScoreFromLight,
  getTemperatureRingColorForLight,
} from '../../../src/lib/signalsCopy';
import type { Light, LightTier } from '../../../src/types/lights';
import type { MindMailIntent } from '../../../src/types/mindMail';

const CARD_WIDTH = 88;
const CARD_MARGIN = 10;
const RING_SIZE = 36;
const AVATAR_SIZE = 26;

function RelationshipCard({
  light,
  needsAttention,
  onPress,
  onTransmit,
}: {
  light: Light;
  needsAttention: boolean;
  onPress: () => void;
  onTransmit: (id: string, name: string) => void;
}) {
  const relationshipScore = getRelationshipScoreFromLight(light);
  const temperatureColor = getTemperatureRingColorForLight(light, needsAttention);
  const avatarUri = light.photoUri || light.photoUrl;
  const initial = (light.name || '?').trim()[0]?.toUpperCase() || '?';

  return (
    <Pressable
      style={[styles.hCard, needsAttention && styles.hCardAttention]}
      onPress={onPress}
    >
      <View style={styles.ringWithAvatar}>
        <RelationshipRing
          relationshipScore={relationshipScore}
          temperatureColor={temperatureColor}
          attentionNeeded={needsAttention}
          size="sm"
        />
        <View style={[styles.hCardAvatar, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.hCardAvatarImage} />
          ) : (
            <Text style={styles.hCardAvatarInitial} numberOfLines={1}>{initial}</Text>
          )}
        </View>
      </View>
      <Text style={styles.hCardName} numberOfLines={1}>{light.name}</Text>
    </Pressable>
  );
}

function HorizontalCircleStrip({
  title,
  subtitle,
  capacityLabel,
  lights,
  dailyPriorityIds,
  onPressCard,
  onTransmit,
  maxCards,
  onSeeAllPress,
}: {
  title: string;
  subtitle?: string;
  capacityLabel?: string;
  lights: Light[];
  dailyPriorityIds: Set<string>;
  onPressCard: (light: Light) => void;
  onTransmit: (id: string, name: string) => void;
  maxCards?: number;
  /** When set, show "See all" and call this on press */
  onSeeAllPress?: () => void;
}) {
  const show = maxCards != null ? lights.slice(0, maxCards) : lights;
  const hasMore = maxCards != null && lights.length > maxCards;
  const isEmpty = lights.length === 0;
  return (
    <View style={styles.hStripSection}>
      <View style={styles.hStripHeader}>
        <View style={styles.hStripTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {capacityLabel != null && <Text style={styles.capacityLabel}>{capacityLabel}</Text>}
        </View>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {isEmpty ? (
        <View style={styles.hStripEmpty}>
          <Text style={styles.hStripEmptyText}>No one in this layer yet</Text>
        </View>
      ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hStripContent}
      >
        {show.map((light) => (
          <RelationshipCard
            key={light.id}
            light={light}
            needsAttention={dailyPriorityIds.has(light.id)}
            onPress={() => onPressCard(light)}
            onTransmit={() => onTransmit(light.id, light.name)}
          />
        ))}
        {hasMore && onSeeAllPress ? (
          <Pressable style={styles.hCardSeeAll} onPress={onSeeAllPress}>
            <Text style={styles.hCardSeeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
          </Pressable>
        ) : null}
      </ScrollView>
      )}
    </View>
  );
}

function CollapsibleRingStrip({
  title,
  capacityLabel,
  lights,
  dailyPriorityIds,
  onPressCard,
  onTransmit,
  onSeeAllPress,
}: {
  title: string;
  capacityLabel?: string;
  lights: Light[];
  dailyPriorityIds: Set<string>;
  onPressCard: (light: Light) => void;
  onTransmit: (id: string, name: string) => void;
  onSeeAllPress: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = lights.length === 0;

  if (isEmpty) {
    return (
      <View style={styles.hStripSection}>
        <View style={styles.hStripHeader}>
          <View style={styles.hStripTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {capacityLabel != null && <Text style={styles.capacityLabel}>{capacityLabel}</Text>}
          </View>
        </View>
        <View style={styles.hStripEmpty}>
          <Text style={styles.hStripEmptyText}>No one in this layer yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.hStripSection}>
      <Pressable
        style={styles.collapsibleHeader}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpanded((e) => !e); }}
      >
        <View style={styles.hStripTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {capacityLabel != null && <Text style={styles.capacityLabel}>{capacityLabel}</Text>}
        </View>
        <Ionicons name={expanded ? 'chevron-down' : 'chevron-forward'} size={18} color={COLORS.textMuted} />
      </Pressable>
      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hStripContent}
        >
          {lights.slice(0, 12).map((light) => (
            <RelationshipCard
              key={light.id}
              light={light}
              needsAttention={dailyPriorityIds.has(light.id)}
              onPress={() => onPressCard(light)}
              onTransmit={onTransmit}
            />
          ))}
          {lights.length > 12 && (
            <Pressable style={styles.hCardSeeAll} onPress={onSeeAllPress}>
              <Text style={styles.hCardSeeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function SignalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [personSheetLight, setPersonSheetLight] = useState<Light | null>(null);
  const [transmitSheetVisible, setTransmitSheetVisible] = useState(false);
  const [transmitRecipientId, setTransmitRecipientId] = useState<string | null>(null);
  const [transmitRecipientName, setTransmitRecipientName] = useState('');
  const [transmitPresetIntent, setTransmitPresetIntent] = useState<MindMailIntent | null>(null);

  const members = useCircleStore((s) => s.members ?? []);
  const membersSafe = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const getLights = useLightsStore((s) => s.getLights);
  const lights = useMemo(() => {
    try {
      return getLights(membersSafe);
    } catch {
      return [];
    }
  }, [getLights, membersSafe]);
  const dailyReachOuts = useMemo(() => getDailyReachOuts(lights, 8), [lights]);
  const needAttentionCount = dailyReachOuts.priority.length + dailyReachOuts.suggested.length;

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

  const dailyPriorityIds = useMemo(
    () => new Set(needsAttentionLights.map((l) => l.id)),
    [needsAttentionLights]
  );

  const activeLights = useMemo(
    () => lights.filter((l) => l.tier !== 'archived'),
    [lights]
  );

  const lightsByTier = useMemo(() => {
    const by: Record<LightTier, Light[]> = { five: [], fifteen: [], fifty: [], network: [], archived: [] };
    activeLights.forEach((l) => { if (l.tier && by[l.tier]) by[l.tier].push(l); });
    return by;
  }, [activeLights]);

  const params = useLocalSearchParams<{ hero?: string }>();
  useEffect(() => {
    const heroId = params.hero;
    if (!heroId || lights.length === 0) return;
    const light = lights.find((l) => l.id === heroId);
    if (light) setPersonSheetLight(light);
  }, [params.hero, lights]);

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
        {/* A. Header — minimal */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>People</Text>
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

        {/* Needs Attention — who could use a check-in (insights live on Signals tab) */}
        <HorizontalCircleStrip
          title={needAttentionCount > 0 ? `Needs Attention (${needAttentionCount})` : 'Needs Attention'}
          lights={needsAttentionLights}
          dailyPriorityIds={dailyPriorityIds}
          onPressCard={openPersonSheet}
          onTransmit={openTransmitSheet}
        />

        {/* E. Inner Circle (5) — Dunbar layer */}
        <HorizontalCircleStrip
          title="Inner Circle (5)"
          subtitle="The people closest to you"
          capacityLabel={`${lightsByTier.five.length} / 5`}
          lights={lightsByTier.five}
          dailyPriorityIds={dailyPriorityIds}
          onPressCard={openPersonSheet}
          onTransmit={openTransmitSheet}
        />

        {/* E. Close Friends (15) */}
        <HorizontalCircleStrip
          title="Close Friends (15)"
          capacityLabel={`${lightsByTier.fifteen.length} / 15`}
          lights={lightsByTier.fifteen}
          dailyPriorityIds={dailyPriorityIds}
          onPressCard={openPersonSheet}
          onTransmit={openTransmitSheet}
        />

        {/* F. Community (50) — collapsible */}
        <CollapsibleRingStrip
          title="Community (50)"
          capacityLabel={`${lightsByTier.fifty.length} / 50`}
          lights={lightsByTier.fifty}
          dailyPriorityIds={dailyPriorityIds}
          onPressCard={openPersonSheet}
          onTransmit={openTransmitSheet}
          onSeeAllPress={() => router.push('/lights/tiers/fifty')}
        />

        {/* G. Network (150) — collapsible */}
        <CollapsibleRingStrip
          title="Network (150)"
          capacityLabel={`${lightsByTier.network.length} / 150`}
          lights={lightsByTier.network}
          dailyPriorityIds={dailyPriorityIds}
          onPressCard={openPersonSheet}
          onTransmit={openTransmitSheet}
          onSeeAllPress={() => router.push('/lights/tiers/network')}
        />

        {/* Empty state when no one added yet */}
        {activeLights.length === 0 && (
          <Pressable
            style={styles.emptyList}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/add'); }}
          >
            <Text style={styles.emptyListEmoji}>👋</Text>
            <Text style={styles.emptyListTitle}>Add someone</Text>
            <Text style={styles.emptyListSub}>Start with the people who matter most.</Text>
          </Pressable>
        )}

        {/* Understand People — Fleet Management, Learn, Map, World Temperature, Family Fleet */}
        <View style={styles.understandSection}>
          <Text style={styles.sectionTitle}>Understand People</Text>
          <Pressable
            style={styles.fleetManagementCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/people/fleet-management'); }}
            accessibilityLabel="Fleet Management: Link devices and manage crew"
          >
            <Text style={styles.fleetManagementCardTitle}>Fleet Management</Text>
            <Text style={styles.fleetManagementCardSub}>Link devices and manage crew</Text>
          </Pressable>
          <Pressable
            style={styles.fleetSynergyCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/people/fleet-synergy'); }}
            accessibilityLabel="Fleet Synergy: Mechanic's Thanks and positive fleet logs"
          >
            <Text style={styles.fleetSynergyCardIcon}>🔧</Text>
            <View style={styles.fleetSynergyCardBody}>
              <Text style={styles.fleetSynergyCardTitle}>Fleet Synergy</Text>
              <Text style={styles.fleetSynergyCardSub}>Review the Mechanic's Thanks and positive fleet logs.</Text>
            </View>
            <Text style={styles.fleetSynergyCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={[styles.fleetSynergyCard, { borderLeftColor: COLORS.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/people/black-box'); }}
            accessibilityLabel="Black Box: 30-day fuel trend"
          >
            <Text style={styles.fleetSynergyCardIcon}>📦</Text>
            <View style={styles.fleetSynergyCardBody}>
              <Text style={styles.fleetSynergyCardTitle}>Black Box</Text>
              <Text style={styles.fleetSynergyCardSub}>30-day fuel trend from Post-Flight debriefs.</Text>
            </View>
            <Text style={[styles.fleetSynergyCardArrow, { color: COLORS.textMuted }]}>→</Text>
          </Pressable>
          <View style={styles.moreRow}>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/people/copilot-radar'); }}
              accessibilityLabel="Co-Pilot Radar (sibling view)"
            >
              <Text style={styles.moreEmoji}>🛸</Text>
              <Text style={styles.moreLabel}>Radar</Text>
            </Pressable>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/people/family-fleet'); }}
              accessibilityLabel="Family Fleet (Ground Control)"
            >
              <Text style={styles.moreEmoji}>🛰️</Text>
              <Text style={styles.moreLabel}>Fleet</Text>
            </Pressable>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/invite-circle'); }}
              accessibilityLabel="Invite to Circle"
            >
              <Text style={styles.moreEmoji}>💛</Text>
              <Text style={styles.moreLabel}>Invite</Text>
            </Pressable>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/learn'); }}
            >
              <Text style={styles.moreEmoji}>📖</Text>
              <Text style={styles.moreLabel}>Learn</Text>
            </Pressable>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/radar'); }}
            >
              <Text style={styles.moreEmoji}>🪐</Text>
              <Text style={styles.moreLabel}>Map</Text>
            </Pressable>
            <Pressable
              style={styles.moreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/world'); }}
            >
              <Text style={styles.moreEmoji}>🌡️</Text>
              <Text style={styles.moreLabel}>World temp</Text>
            </Pressable>
          </View>
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
  const relationshipScore = getRelationshipScoreFromLight(light);
  const temperatureColor = getTemperatureRingColorForLight(light, needsAttention);
  const label = statusLabel ?? getRelationshipStatusLabel(light, needsAttention);

  return (
    <Pressable style={[styles.row, needsAttention && styles.rowAttention]} onPress={onPress}>
      <RelationshipRing
        relationshipScore={relationshipScore}
        temperatureColor={temperatureColor}
        attentionNeeded={needsAttention}
        size="sm"
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
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: 0,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
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
  systemContextWrap: { marginBottom: SPACING.sm, paddingHorizontal: 2 },
  systemContextText: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },
  signalsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  signalsStripText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  signalsStripMuted: { color: COLORS.textMuted, fontWeight: '500' },
  signalsStripSystem: { color: COLORS.textSecondary, fontWeight: '500', fontStyle: 'italic' },
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
  hStripHeader: { marginBottom: 10 },
  hStripTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  capacityLabel: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  sectionSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  hStripEmpty: { paddingVertical: 12, paddingHorizontal: 4 },
  hStripEmptyText: { fontSize: 14, color: COLORS.textMuted },
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
  understandSection: { marginBottom: SPACING.lg },
  fleetManagementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fleetManagementCardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  fleetManagementCardSub: { fontSize: 13, color: COLORS.textMuted },
  fleetSynergyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: COLORS.border,
    borderLeftColor: '#10b981',
  },
  fleetSynergyCardIcon: { fontSize: 24, marginRight: SPACING.md },
  fleetSynergyCardBody: { flex: 1 },
  fleetSynergyCardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  fleetSynergyCardSub: { fontSize: 13, color: COLORS.textMuted },
  fleetSynergyCardArrow: { fontSize: 18, color: '#10b981', marginLeft: SPACING.sm },
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
  // Horizontal circle strips
  hStripSection: { marginBottom: SPACING.lg },
  hStripContent: { paddingRight: SPACING.lg },
  hCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  hCardAttention: {
    borderColor: COLORS.accent + '44',
    backgroundColor: COLORS.accentBg as string,
  },
  ringWithAvatar: {
    position: 'relative',
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: 'center',
  },
  hCardAvatar: {
    position: 'absolute',
    left: (RING_SIZE - AVATAR_SIZE) / 2,
    top: (RING_SIZE - AVATAR_SIZE) / 2,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hCardAvatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  hCardAvatarInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  hCardName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 6, textAlign: 'center' },
  hCardSeeAll: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
  },
  hCardSeeAllText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
});
