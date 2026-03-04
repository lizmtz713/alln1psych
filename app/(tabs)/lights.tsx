/**
 * Lights Screen — Relationship Dashboard
 * Based on Dunbar's research: Your 5/15/50/150
 */

import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, TextInput, Linking } from 'react-native';
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
import { getLightBrightness, BRIGHTNESS_CONFIG, getDailyReachOuts, getTierHealth } from '../../src/services/friendshipMaintenance';

const TEMP_COLORS = { green: '#22C55E', yellow: '#EAB308', orange: '#F97316', red: '#EF4444', unknown: 'transparent' };

const TIERS = [
  { key: 'five' as const, label: 'Your 5', subtitle: 'Weekly contact', max: 5, emoji: '💛' },
  { key: 'fifteen' as const, label: 'Your 15', subtitle: 'Every 2-3 weeks', max: 15, emoji: '🧡' },
  { key: 'fifty' as const, label: 'Your 50', subtitle: 'Monthly', max: 50, emoji: '💜' },
  { key: 'network' as const, label: 'Your 150', subtitle: 'Quarterly', max: 150, emoji: '💙' },
];

const TIER_HEALTH_LABEL: Record<string, string> = { five: '5', fifteen: '15', fifty: '50', network: '150' };

export default function LightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({ five: true, fifteen: true, fifty: false, network: false });

  const members = useCircleStore((s) => s.members);
  const persistState = useLightsStore(useShallow((s) => ({
    tierByMemberId: s.tierByMemberId,
    connectionLogByMemberId: s.connectionLogByMemberId,
    lastContactByMemberId: s.lastContactByMemberId,
    lightExtrasByMemberId: s.lightExtrasByMemberId,
  })));
  const logContact = useLightsStore((s) => s.logContact);

  const lights = useMemo(() => computeLights(members, persistState), [members, persistState]);
  const filteredLights = useMemo(() => {
    if (!searchQuery.trim()) return lights;
    const q = searchQuery.toLowerCase();
    return lights.filter((l) => l.name.toLowerCase().includes(q));
  }, [lights, searchQuery]);

  const lightsByTier = useMemo(() => {
    const map: Record<LightTier, Light[]> = { five: [], fifteen: [], fifty: [], network: [], archived: [] };
    filteredLights.forEach((l) => { if (l.tier !== 'archived') map[l.tier].push(l); });
    (Object.keys(map) as LightTier[]).forEach((tier) => { map[tier].sort((a, b) => b.daysSinceContact - a.daysSinceContact); });
    return map;
  }, [filteredLights]);

  const dailyReachOuts = useMemo(() => getDailyReachOuts(lights), [lights]);
  const hasReachOuts = dailyReachOuts.priority.length > 0 || dailyReachOuts.suggested.length > 0;
  const tierHealth = useMemo(() => getTierHealth(lights), [lights]);

  const toggleTier = (tier: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] })); };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRefreshing(true); setTimeout(() => setRefreshing(false), 600); };

  const handleQuickText = (light: Light) => { if (light.phone) { Linking.openURL(`sms:${light.phone.replace(/\D/g, '')}`); logContact(light.id, { type: 'text', quality: 'brief' }); } };
  const handleQuickCall = (light: Light) => { if (light.phone) { Linking.openURL(`tel:${light.phone.replace(/\D/g, '')}`); logContact(light.id, { type: 'call', quality: 'meaningful' }); } };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View><Text style={styles.headerTitle}>Lights</Text><Text style={styles.headerSubtitle}>Your connections</Text></View>
          <Pressable style={styles.addButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/lights/add'); }}>
            <Ionicons name="person-add" size={20} color={COLORS.accent} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search people..." placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} autoCapitalize="none" autoCorrect={false} />
          {searchQuery.length > 0 && <Pressable onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></Pressable>}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}>
          {hasReachOuts && (
            <View style={styles.reachOutSection}>
              <Text style={styles.reachOutTitle}>🌟 Reach out today</Text>
              <Text style={styles.reachOutSubtitle}>{dailyReachOuts.priority.length > 0 ? `${dailyReachOuts.priority.length} need attention` : 'Keep your connections strong'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reachOutScroll} contentContainerStyle={styles.reachOutScrollContent}>
                {[...dailyReachOuts.priority, ...dailyReachOuts.suggested].map((light) => {
                  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
                  const config = BRIGHTNESS_CONFIG[brightness];
                  return (
                    <Pressable key={light.id} style={styles.reachOutCard} onPress={() => router.push(`/lights/${light.id}`)}>
                      <View style={[styles.reachOutLight, { backgroundColor: config.color }]}><Text style={styles.reachOutEmoji}>{config.emoji}</Text></View>
                      <Text style={styles.reachOutName} numberOfLines={1}>{light.name}</Text>
                      <Text style={styles.reachOutDays}>{light.daysSinceContact}d ago</Text>
                      {light.phone && (
                        <View style={styles.quickActions}>
                          <Pressable style={styles.quickBtn} onPress={() => handleQuickText(light)}><Ionicons name="chatbubble" size={16} color={COLORS.accent} /></Pressable>
                          <Pressable style={styles.quickBtn} onPress={() => handleQuickCall(light)}><Ionicons name="call" size={16} color={COLORS.accent} /></Pressable>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.healthOverview}>
            {tierHealth.map((th) => (
              <View key={th.tier} style={styles.healthBar}>
                <Text style={styles.healthLabel}>{TIER_HEALTH_LABEL[th.tier] ?? th.tier}</Text>
                <View style={styles.healthTrack}><View style={[styles.healthFill, { width: `${th.healthPercent}%`, backgroundColor: th.healthPercent >= 70 ? '#22C55E' : th.healthPercent >= 40 ? '#EAB308' : '#EF4444' }]} /></View>
                <Text style={styles.healthPercent}>{th.healthPercent}%</Text>
              </View>
            ))}
          </View>

          {TIERS.map((tier) => {
            const tierLights = lightsByTier[tier.key];
            const isExpanded = expandedTiers[tier.key];
            const health = tierHealth.find(h => h.tier === tier.key);
            return (
              <View key={tier.key} style={styles.tierSection}>
                <Pressable style={styles.tierHeader} onPress={() => toggleTier(tier.key)}>
                  <View style={styles.tierHeaderLeft}>
                    <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                    <View><Text style={styles.tierLabel}>{tier.label}</Text><Text style={styles.tierSubtitle}>{tierLights.length}/{tier.max} · {tier.subtitle}</Text></View>
                  </View>
                  <View style={styles.tierHeaderRight}>
                    {health && health.needsAttention > 0 && <View style={styles.attentionBadge}><Text style={styles.attentionText}>{health.needsAttention}</Text></View>}
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                  </View>
                </Pressable>
                {isExpanded && (
                  <View style={styles.tierContent}>
                    {tierLights.length === 0 ? (
                      <Pressable style={styles.emptyTier} onPress={() => router.push('/lights/add')}><Ionicons name="add-circle-outline" size={24} color={COLORS.textMuted} /><Text style={styles.emptyTierText}>Add someone to {tier.label}</Text></Pressable>
                    ) : tierLights.map((light, index) => (
                      <PersonRow key={light.id} light={light} isLast={index === tierLights.length - 1} onPress={() => router.push(`/lights/${light.id}`)} onQuickText={() => handleQuickText(light)} onQuickCall={() => handleQuickCall(light)} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.scienceFooter}>
            <Text style={styles.scienceTitle}>The Science</Text>
            <Text style={styles.scienceText}>Anthropologist Robin Dunbar found humans can maintain ~150 relationships, but intimacy requires regular contact. Without it, relationships decay ~15% per missed contact window.</Text>
            <Pressable style={styles.learnMoreBtn} onPress={() => router.push('/lights/learn')}><Text style={styles.learnMoreText}>Learn more →</Text></Pressable>
          </View>

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

function PersonRow({ light, isLast, onPress, onQuickText, onQuickCall }: { light: Light; isLast: boolean; onPress: () => void; onQuickText: () => void; onQuickCall: () => void }) {
  const getTempColor = () => { if (light.temperature === 'warm') return TEMP_COLORS.green; if (light.temperature === 'neutral') return TEMP_COLORS.yellow; if (light.temperature === 'cool') return TEMP_COLORS.orange; return TEMP_COLORS.unknown; };
  const tempColor = getTempColor();
  const hasSharedTemp = tempColor !== 'transparent';
  const brightness = getLightBrightness(light.tier, light.daysSinceContact);
  const config = BRIGHTNESS_CONFIG[brightness];
  const isUrgent = brightness === 'dim' || brightness === 'dark';

  return (
    <Pressable style={[styles.personRow, isLast && styles.personRowLast]} onPress={onPress}>
      <View style={styles.lightIndicator}>
        <View style={[styles.lightGlow, { backgroundColor: config.color, opacity: config.glow }]} />
        <View style={[styles.lightCore, { backgroundColor: config.color }]} />
        {hasSharedTemp && <View style={[styles.tempBadge, { backgroundColor: tempColor }]} />}
      </View>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{light.name}</Text>
        <Text style={[styles.personMeta, { color: config.color }]}>{config.label} · {light.daysSinceContact}d{isUrgent && ' ⚠️'}</Text>
      </View>
      {light.phone && (
        <View style={styles.rowActions}>
          <Pressable style={styles.rowActionBtn} onPress={onQuickText}><Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} /></Pressable>
          <Pressable style={styles.rowActionBtn} onPress={onQuickCall}><Ionicons name="call-outline" size={18} color={COLORS.textMuted} /></Pressable>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 2 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 24, marginBottom: 16, borderRadius: BORDER_RADIUS.input, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24 },
  reachOutSection: { marginBottom: 20 },
  reachOutTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  reachOutSubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: 12 },
  reachOutScroll: { marginHorizontal: -24 },
  reachOutScrollContent: { paddingHorizontal: 24, gap: 12 },
  reachOutCard: { width: 100, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  reachOutLight: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  reachOutEmoji: { fontSize: 18 },
  reachOutName: { fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  reachOutDays: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  quickBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  healthOverview: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  healthBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  healthLabel: { width: 50, fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  healthTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginHorizontal: 8, overflow: 'hidden' },
  healthFill: { height: '100%', borderRadius: 3 },
  healthPercent: { width: 36, fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'right' },
  tierSection: { marginBottom: 16 },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.border },
  tierHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierEmoji: { fontSize: 24 },
  tierLabel: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  tierSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  attentionBadge: { backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  attentionText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  tierContent: { marginTop: 8, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  emptyTier: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  emptyTierText: { fontSize: 15, color: COLORS.textMuted },
  personRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  personRowLast: { borderBottomWidth: 0 },
  lightIndicator: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  lightGlow: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  lightCore: { width: 14, height: 14, borderRadius: 7 },
  tempBadge: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: COLORS.surface },
  personInfo: { flex: 1 },
  personName: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  personMeta: { fontSize: 13, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 4, marginRight: 8 },
  rowActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  scienceFooter: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 20, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  scienceTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  scienceText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  learnMoreBtn: { marginTop: 12 },
  learnMoreText: { fontSize: 14, color: COLORS.accent, fontWeight: '500' },
});
