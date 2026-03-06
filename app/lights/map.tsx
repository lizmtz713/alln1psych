/**
 * Lights Map — Full implementation: constellation, node detail, share, tier/temp summary.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Share as RNShare,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import {
  computeMapNodes,
  getTierBreakdown,
  getTemperatureSummary,
} from '../../src/services/lightsMap';
import { LightsConstellation } from '../../src/components/lights/LightsConstellation';
import { LightsMapSnapshot } from '../../src/components/lights/LightsMapSnapshot';
import type { MapNode } from '../../src/types/lightsMap';
import type { MapFormat } from '../../src/types/lightsMap';
import { COLORS, SPACING } from '../../src/lib/constants';
import { TIER_LABELS } from '../../src/types/lights';
import { LIGHT_TEMPERATURE_SCALE, getLightTemperatureLabel } from '../../src/types/lights';

export default function LightsMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const members = useCircleStore((s) => s.members);
  const getLights = useLightsStore((s) => s.getLights);

  const lights = useMemo(() => getLights(members), [members, getLights]);
  const nodes = useMemo(() => computeMapNodes(lights), [lights]);
  const tierBreakdown = useMemo(() => getTierBreakdown(lights), [lights]);
  const temperatureSummary = useMemo(() => getTemperatureSummary(lights), [lights]);

  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareFormat, setShareFormat] = useState<MapFormat>('square');

  const handleNodePress = (node: MapNode) => setSelectedNode(node);
  const handleSharePress = () => setShareModalVisible(true);
  const handleShareClose = () => setShareModalVisible(false);

  const handleShareConfirm = async () => {
    try {
      await RNShare.share({
        message: `My Lights Map — ${nodes.length} connections. AllN1 Psych · You Are Not Alone.`,
        title: 'Lights Map',
      });
      setShareModalVisible(false);
    } catch (e) {
      if ((e as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Share', 'Could not open share sheet.');
      }
    }
  };

  const openLightDetail = (node: MapNode) => {
    setSelectedNode(null);
    router.push(`/lights/${node.id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.constellationWrap}>
          <LightsConstellation nodes={nodes} onNodePress={handleNodePress} />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Tier breakdown</Text>
          <View style={styles.tierCards}>
            {tierBreakdown.map((t) => (
              <View key={t.tier} style={styles.tierCard}>
                <Text style={styles.tierCardLabel}>{TIER_LABELS[t.tier]}</Text>
                <Text style={styles.tierCardCount}>
                  {t.count} / {t.max}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Temperature</Text>
          <View style={styles.tempRow}>
            <View style={styles.tempItem}>
              <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.warm.color }]} />
              <Text style={styles.tempLabel}>Warm</Text>
              <Text style={styles.tempCount}>{temperatureSummary.warm}</Text>
            </View>
            <View style={styles.tempItem}>
              <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.neutral.color }]} />
              <Text style={styles.tempLabel}>Neutral</Text>
              <Text style={styles.tempCount}>{temperatureSummary.neutral}</Text>
            </View>
            <View style={styles.tempItem}>
              <View style={[styles.tempDot, { backgroundColor: LIGHT_TEMPERATURE_SCALE.cool.color }]} />
              <Text style={styles.tempLabel}>Cool</Text>
              <Text style={styles.tempCount}>{temperatureSummary.cool}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.shareBtn} onPress={handleSharePress}>
          <Ionicons name="share-outline" size={20} color={COLORS.text} />
          <Text style={styles.shareBtnText}>Share map</Text>
        </Pressable>
      </ScrollView>

      {/* Node detail modal */}
      <Modal
        visible={!!selectedNode}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNode(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedNode(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedNode && (
              <>
                <Text style={styles.modalName}>{selectedNode.name}</Text>
                <Text style={styles.modalMeta}>
                  {TIER_LABELS[selectedNode.tier]} · {getLightTemperatureLabel(selectedNode.temperature)}
                </Text>
                <Text style={styles.modalDays}>
                  {selectedNode.daysSinceContact} day{selectedNode.daysSinceContact !== 1 ? 's' : ''} since contact
                </Text>
                <Pressable
                  style={styles.modalOpenBtn}
                  onPress={() => openLightDetail(selectedNode)}
                >
                  <Text style={styles.modalOpenBtnText}>Open Light</Text>
                </Pressable>
                <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedNode(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share modal with format picker */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleShareClose}
      >
        <View style={[styles.shareOverlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Share Lights Map</Text>
            <Text style={styles.shareFormatLabel}>Format</Text>
            <View style={styles.formatRow}>
              <Pressable
                style={[styles.formatOption, shareFormat === 'square' && styles.formatOptionActive]}
                onPress={() => setShareFormat('square')}
              >
                <Text style={[styles.formatOptionText, shareFormat === 'square' && styles.formatOptionTextActive]}>
                  Square
                </Text>
              </Pressable>
              <Pressable
                style={[styles.formatOption, shareFormat === 'story' && styles.formatOptionActive]}
                onPress={() => setShareFormat('story')}
              >
                <Text style={[styles.formatOptionText, shareFormat === 'story' && styles.formatOptionTextActive]}>
                  Story
                </Text>
              </Pressable>
            </View>
            <View style={styles.snapshotPreview}>
              <LightsMapSnapshot
                format={shareFormat}
                tierBreakdown={tierBreakdown}
                temperatureSummary={temperatureSummary}
                nodeCount={nodes.length}
              />
            </View>
            <View style={styles.shareActions}>
              <Pressable style={styles.shareConfirmBtn} onPress={handleShareConfirm}>
                <Text style={styles.shareConfirmBtnText}>Share</Text>
              </Pressable>
              <Pressable style={styles.shareCancelBtn} onPress={handleShareClose}>
                <Text style={styles.shareCancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  constellationWrap: { alignItems: 'center', paddingVertical: SPACING.lg },
  summarySection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  tierCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tierCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  tierCardLabel: { fontSize: 12, color: COLORS.textMuted },
  tierCardCount: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tempRow: { flexDirection: 'row', gap: SPACING.xl },
  tempItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tempDot: { width: 10, height: 10, borderRadius: 5 },
  tempLabel: { fontSize: 13, color: COLORS.textSecondary },
  tempCount: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalMeta: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  modalDays: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.lg },
  modalOpenBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalOpenBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  modalCloseBtn: { paddingVertical: 8, alignItems: 'center' },
  modalCloseBtnText: { fontSize: 15, color: COLORS.textMuted },

  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  shareFormatLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  formatRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  formatOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatOptionActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  formatOptionText: { fontSize: 15, color: COLORS.textSecondary },
  formatOptionTextActive: { color: COLORS.text, fontWeight: '600' },
  snapshotPreview: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  shareActions: { gap: 10 },
  shareConfirmBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareConfirmBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  shareCancelBtn: { paddingVertical: 12, alignItems: 'center' },
  shareCancelBtnText: { fontSize: 15, color: COLORS.textMuted },
});
