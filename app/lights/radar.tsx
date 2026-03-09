/**
 * Lights Constellation — "A radar for human connection"
 * Route: /lights/radar (file name avoids "constellation" duplicate with folder routes)
 * Three-zone screen: Radar (top), Timeline (middle), Person Card or tagline (bottom).
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Share as RNShare,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { useDailyAnchorsStore } from '../../src/stores/dailyAnchorsStore';
import { getDailyReachOuts } from '../../src/services/friendshipMaintenance';
import { computeConstellationNodes } from '../../src/services/lightsConstellation';
import { getLastInteractionSummary } from '../../src/services/timelineEngine';
import { getRelationshipStatusLabel } from '../../src/lib/signalsCopy';
import type { ConstellationNode } from '../../src/types/lightsConstellation';
import { ConstellationRadar } from '../../src/components/lights/ConstellationRadar';
import { ConstellationTimeline } from '../../src/components/lights/ConstellationTimeline';
import { ConstellationPersonCard } from '../../src/components/lights/ConstellationPersonCard';
import { TransmitComposerSheet } from '../../src/components/signals/TransmitComposerSheet';
import { COLORS, SPACING } from '../../src/lib/constants';

const RADAR_SIZE = Math.min(360, 340);

export default function ConstellationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const members = useCircleStore((s) => s.members);
  const lights = useLightsStore((s) => s.getLights(members ?? []));
  const dailyReachOuts = useMemo(() => getDailyReachOuts(lights, 8), [lights]);
  const needsAttentionIds = useMemo(
    () => new Set([...dailyReachOuts.priority, ...dailyReachOuts.suggested].map((l) => l.id)),
    [dailyReachOuts.priority, dailyReachOuts.suggested]
  );
  const allNodes = useMemo(() => computeConstellationNodes(lights, needsAttentionIds), [lights, needsAttentionIds]);
  const lastTransmittedToId = useDailyAnchorsStore((s) => s.lastTransmittedToId);

  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [timelineRange, setTimelineRange] = useState<'7d' | '30d' | 'all'>('all');
  const [transmitSheetVisible, setTransmitSheetVisible] = useState(false);
  const [transmitRecipientId, setTransmitRecipientId] = useState<string | null>(null);
  const [transmitRecipientName, setTransmitRecipientName] = useState('');
  const setLastTransmittedToId = useDailyAnchorsStore((s) => s.setLastTransmittedToId);
  /** Progressive reveal: five | fifteen | fifty | all. Default = top 15 (low cognitive load). */
  const [revealLevel, setRevealLevel] = useState<'five' | 'fifteen' | 'fifty' | 'all'>('fifteen');

  const tierOrder = ['five', 'fifteen', 'fifty', 'network'] as const;
  const nodes = useMemo(() => {
    const tierForIndex = revealLevel === 'all' ? 'network' : revealLevel;
    const idx = tierOrder.indexOf(tierForIndex);
    const allowed = tierOrder.slice(0, idx + 1);
    return allNodes.filter((n) => n.tier !== 'archived' && allowed.includes(n.tier));
  }, [allNodes, revealLevel]);

  const handleNodePress = (node: ConstellationNode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNode(node);
  };

  const handleOpenFull = (node: ConstellationNode) => {
    setSelectedNode(null);
    router.push(`/lights/${node.id}`);
  };

  const handleLogContact = (node: ConstellationNode) => {
    setSelectedNode(null);
    router.push(`/lights/log-entry?id=${encodeURIComponent(node.id)}`);
  };

  const handleTransmit = (node: ConstellationNode) => {
    setTransmitRecipientId(node.id);
    setTransmitRecipientName(node.name);
    setTransmitSheetVisible(true);
  };

  const handleTransmitSent = (recipientId: string | null) => {
    if (recipientId) setLastTransmittedToId(recipientId);
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `My constellation — ${nodes.length} connection${nodes.length !== 1 ? 's' : ''} I care about. A radar for human connection. AllN1 Psych · You Are Not Alone.`,
        title: 'My Constellation',
      });
    } catch (e) {
      if ((e as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Share', 'Could not open share sheet.');
      }
    }
  };

  const selectedLight = selectedNode ? lights.find((l) => l.id === selectedNode.id) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Zone 1: Radar */}
      <View style={styles.zone1}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Signals Radar</Text>
            <Text style={styles.subtitle}>How is my social world?</Text>
          </View>
          <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={12}>
            <Ionicons name="share-outline" size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>
        <View style={[styles.radarWrap, { width: Math.min(width - 32, RADAR_SIZE), height: Math.min(width - 32, RADAR_SIZE) }]}>
          <ConstellationRadar
            nodes={nodes}
            onNodePress={handleNodePress}
            selectedId={selectedNode?.id ?? null}
            recentlyConnectedId={nodes.some((n) => n.id === lastTransmittedToId) ? lastTransmittedToId : null}
            onRecentGlowComplete={() => setLastTransmittedToId(null)}
            size={Math.min(width - 32, RADAR_SIZE)}
          />
        </View>
      </View>

      {/* Zone 2: Timeline + Progressive reveal */}
      <ConstellationTimeline value={timelineRange} onChange={setTimelineRange} />
      <View style={styles.revealRow}>
        <Text style={styles.revealLabel}>Show</Text>
        {(['five', 'fifteen', 'fifty', 'all'] as const).map((level) => (
          <Pressable
            key={level}
            style={[styles.revealChip, revealLevel === level && styles.revealChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRevealLevel(level);
            }}
          >
            <Text style={[styles.revealChipText, revealLevel === level && styles.revealChipTextActive]}>
              {level === 'five' ? '5' : level === 'fifteen' ? '15' : level === 'fifty' ? '50' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Zone 3: Focus — Person Card or tagline */}
      <View style={styles.zone3}>
        {selectedNode ? (
          <ConstellationPersonCard
            node={selectedNode}
            lastInteractionSummary={selectedLight ? getLastInteractionSummary(selectedLight) : undefined}
            relationshipStrengthLabel={
              selectedLight
                ? getRelationshipStatusLabel(selectedLight, needsAttentionIds.has(selectedNode.id))
                : undefined
            }
            recommendedAction={needsAttentionIds.has(selectedNode.id) ? 'Send a message' : undefined}
            onClose={() => setSelectedNode(null)}
            onTransmit={handleTransmit}
            onOpenFull={handleOpenFull}
            onLogContact={handleLogContact}
          />
        ) : (
          <View style={styles.taglineWrap}>
            <Text style={styles.tagline}>
              Tap a light to see who needs you.
            </Text>
            <Text style={styles.taglineSub}>
              {allNodes.length} connection{allNodes.length !== 1 ? 's' : ''} in your orbit
            </Text>
          </View>
        )}
      </View>

      <TransmitComposerSheet
        visible={transmitSheetVisible}
        recipientId={transmitRecipientId}
        recipientName={transmitRecipientName}
        onClose={() => {
          setTransmitSheetVisible(false);
          setTransmitRecipientId(null);
          setTransmitRecipientName('');
        }}
        onSent={handleTransmitSent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  zone1: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shareBtn: { padding: 8 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 0,
  },
  radarWrap: {
    alignSelf: 'center',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  revealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  revealLabel: { fontSize: 12, color: COLORS.textMuted, marginRight: 4 },
  revealChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  revealChipActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  revealChipText: { fontSize: 14, color: COLORS.textSecondary },
  revealChipTextActive: { color: COLORS.accent, fontWeight: '600' },
  zone3: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  taglineWrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xl + 24,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  taglineSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
