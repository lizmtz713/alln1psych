import { useMemo, useState } from 'react';
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
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore, computeLights } from '../../src/stores/lightsStore';
import type { Light, LightTier } from '../../src/types/lights';
import { TIER_LABELS, LIGHT_TEMPERATURE_SCALE } from '../../src/types/lights';

const TEMP_EMOJI: Record<string, string> = {
  warm: '🟠',
  neutral: '🟡',
  cool: '🔵',
  unknown: '○',
};

const TEMP_COLOR: Record<string, string> = {
  warm: LIGHT_TEMPERATURE_SCALE.warm.color,
  neutral: LIGHT_TEMPERATURE_SCALE.neutral.color,
  cool: LIGHT_TEMPERATURE_SCALE.cool.color,
  unknown: COLORS.textMuted,
};

export default function LightsHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const members = useCircleStore((s) => s.members);
  const myTemperatureLabel = useCircleStore((s) => s.myTemperatureLabel);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
    }))
  );

  const lights = useMemo(
    () => computeLights(members, persistState),
    [members, persistState.tierByMemberId, persistState.connectionLogByMemberId, persistState.lastContactByMemberId, persistState.lightExtrasByMemberId]
  );

  const lightsByTier = useMemo(() => {
    const map: Record<LightTier, Light[]> = {
      five: [],
      fifteen: [],
      fifty: [],
      network: [],
      archived: [],
    };
    lights.forEach((l) => {
      if (l.tier !== 'archived') map[l.tier].push(l);
    });
    return map;
  }, [lights]);

  const five = lightsByTier.five;
  const fifteen = lightsByTier.fifteen;
  const fifty = lightsByTier.fifty;
  const network = lightsByTier.network;

  const flickering = lights.filter((l) => l.status === 'flickering');
  const coolLights = lights.filter((l) => l.temperature === 'cool');
  const firstFlickeringCool = flickering.find((l) => l.temperature === 'cool');

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>💡</Text>
          <Text style={styles.headerTitle}>Lights</Text>
          <Text style={styles.headerSubtitle}>Your relationship dashboard</Text>
        </View>

        {/* World Temperature */}
        <Pressable
          style={styles.worldCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/lights/world');
          }}
        >
          <Text style={styles.worldLabel}>🌡️ World Temperature</Text>
          <Text style={styles.worldValue}>72° Warm</Text>
          <Text style={styles.worldHint}>Based on check-ins today</Text>
          <View style={styles.worldBar}>
            <View style={[styles.worldBarFill, { width: '75%' }]} />
          </View>
          <Text style={styles.worldLink}>See world temperature →</Text>
        </Pressable>

        <Pressable
          style={styles.worldCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/lights/family');
          }}
        >
          <Text style={styles.worldLabel}>👨‍👩‍👧 Family Dashboard</Text>
          <Text style={styles.worldHint}>Group Lights for coordinated care and family patterns</Text>
          <Text style={styles.worldLink}>Family groups →</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Your 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☀️ YOUR 5 — The ones who matter most</Text>
          <View style={styles.tierCard}>
            <View style={styles.fiveRow}>
              {(five.length > 0 ? five : lights.slice(0, 4)).map((l) => (
                <Pressable
                  key={l.id}
                  style={styles.lightDotWrap}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/lights/${l.id}`);
                  }}
                >
                  <View style={[styles.lightDot, { backgroundColor: TEMP_COLOR[l.temperature] ?? TEMP_COLOR.unknown }]}>
                    <Text style={styles.lightDotEmoji}>{TEMP_EMOJI[l.temperature] ?? '○'}</Text>
                  </View>
                  <Text style={styles.lightDotName} numberOfLines={1}>{l.name}</Text>
                  <Text style={styles.lightDotTemp}>{l.temperatureLabel}</Text>
                  <Text style={styles.lightDotDays}>
                    {l.daysSinceContact < 999
                      ? `${l.daysSinceContact}d ago`
                      : '—'}
                    {l.status === 'flickering' ? ' ⚠️' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={styles.addTierButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/lights/add');
              }}
            >
              <Ionicons name="add" size={24} color={COLORS.accent} />
              <Text style={styles.addTierButtonText}>Add to Your 5</Text>
            </Pressable>
          </View>

          {firstFlickeringCool && (
            <Pressable
              style={styles.nudgeBanner}
              onPress={() => router.push(`/lights/${firstFlickeringCool.id}`)}
            >
              <Text style={styles.nudgeBannerText}>
                {firstFlickeringCool.name}'s light is cool and flickering.
              </Text>
              <Text style={styles.nudgeBannerCta}>Send warmth →</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.divider} />

        {/* Your 15 */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>💡 YOUR 15 — Close friends</Text>
            <Pressable onPress={() => router.push('/lights/tiers/fifteen')}>
              <Text style={styles.seeAllLink}>See all 15 →</Text>
            </Pressable>
          </View>
          <SummaryRow lights={fifteen} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierScroll}>
            {fifteen.slice(0, 10).map((l) => (
              <Pressable
                key={l.id}
                style={styles.smallLightCard}
                onPress={() => router.push(`/lights/${l.id}`)}
              >
                <View style={[styles.smallDot, { backgroundColor: TEMP_COLOR[l.temperature] ?? TEMP_COLOR.unknown }]} />
                <Text style={styles.smallLightName} numberOfLines={1}>{l.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Your 50 */}
        <View style={styles.section}>
          <Pressable style={styles.sectionRow} onPress={() => router.push('/lights/tiers/fifty')}>
            <Text style={styles.sectionTitle}>○ YOUR 50 — Friends</Text>
            <Text style={styles.seeAllLink}>Manage Your 50 →</Text>
          </Pressable>
          <SummaryRow lights={fifty} />
          <Text style={styles.slotCount}>{fifty.length}/50 slots filled</Text>
        </View>

        <View style={styles.divider} />

        {/* Your 150 */}
        <View style={styles.section}>
          <Pressable style={styles.sectionRow} onPress={() => router.push('/lights/tiers/network')}>
            <Text style={styles.sectionTitle}>· YOUR 150 — Acquaintances</Text>
            <Text style={styles.seeAllLink}>View network →</Text>
          </Pressable>
          <Text style={styles.slotCount}>{network.length}/150 in your network</Text>
        </View>

        <View style={styles.divider} />

        {/* Lights Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 LIGHTS INSIGHTS</Text>
          <View style={styles.insightsCard}>
            {flickering.length > 0 && (
              <Text style={styles.insightLine}>
                {flickering.length} light{flickering.length !== 1 ? 's' : ''} flickering (need attention)
              </Text>
            )}
            {coolLights.length > 0 && (
              <Text style={styles.insightLine}>
                {coolLights.length} light{coolLights.length !== 1 ? 's' : ''} cooled down
              </Text>
            )}
            <Text style={styles.insightLine}>You're strong with Your 5, but Your 15 could use attention.</Text>
            <Pressable onPress={() => router.push('/lights/insights')}>
              <Text style={styles.insightsLink}>See full insights →</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        {/* The Art of Friendship */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 THE ART OF FRIENDSHIP</Text>
          {[
            { title: 'How to make new friends', icon: '🤝', path: '/lesson/hm-rel-new-friends' },
            { title: 'How to maintain friendships', icon: '🔄', path: '/lesson/hm-rel-maintain' },
            { title: 'When to let a light go dark', icon: '👋', path: '/lesson/hm-rel-let-go' },
            { title: "The science of 5-15-50-150", icon: '🔬', path: '/lights/learn' },
          ].map((item) => (
            <Pressable
              key={item.path}
              style={styles.learnCard}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={styles.learnCardIcon}>{item.icon}</Text>
              <Text style={styles.learnCardTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ErrorBoundary>
  );
}

function SummaryRow({ lights }: { lights: Light[] }) {
  const warm = lights.filter((l) => l.temperature === 'warm').length;
  const neutral = lights.filter((l) => l.temperature === 'neutral').length;
  const cool = lights.filter((l) => l.temperature === 'cool').length;
  const flickering = lights.filter((l) => l.status === 'flickering').length;
  const parts = [];
  if (warm) parts.push(`${warm} warm`);
  if (neutral) parts.push(`${neutral} neutral`);
  if (cool) parts.push(`${cool} cool`);
  if (flickering) parts.push(`${flickering} flickering`);
  return (
    <Text style={styles.summaryRow}>
      {parts.length ? parts.join(' · ') : 'No lights in this tier yet'}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { marginBottom: 24 },
  headerEmoji: { fontSize: 32, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 15, color: COLORS.textMuted },
  worldCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  worldLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  worldValue: { fontSize: 36, fontWeight: '700', color: COLORS.text },
  worldHint: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  worldBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.inputSurface,
    marginTop: 12,
    overflow: 'hidden',
  },
  worldBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  worldLink: { fontSize: 14, color: COLORS.accent, marginTop: 12, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fiveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 20,
  },
  lightDotWrap: { alignItems: 'center', minWidth: 72 },
  lightDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  lightDotEmoji: { fontSize: 22 },
  lightDotName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  lightDotTemp: { fontSize: 11, color: COLORS.textMuted },
  lightDotDays: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  addTierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.accent + '66',
    borderRadius: BORDER_RADIUS.input,
  },
  addTierButtonText: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  nudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: COLORS.accentBg,
    padding: 14,
    borderRadius: BORDER_RADIUS.input,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: LIGHT_TEMPERATURE_SCALE.cool.color,
  },
  nudgeBannerText: { fontSize: 14, color: COLORS.text, flex: 1 },
  nudgeBannerCta: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  summaryRow: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  tierScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  smallLightCard: {
    alignItems: 'center',
    marginRight: 12,
    width: 64,
  },
  smallDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
  },
  smallLightName: { fontSize: 12, color: COLORS.text },
  slotCount: { fontSize: 13, color: COLORS.textMuted },
  seeAllLink: { fontSize: 14, color: COLORS.accent },
  insightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightLine: { fontSize: 14, color: COLORS.text, marginBottom: 8 },
  insightsLink: { fontSize: 14, color: COLORS.accent, marginTop: 8, fontWeight: '500' },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  learnCardIcon: { fontSize: 22, marginRight: 14 },
  learnCardTitle: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
});
