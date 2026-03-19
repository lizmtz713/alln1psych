/**
 * Your Human Timeline — Personal life record.
 * Chronological stream: check-ins, connection moments, insights, journal.
 * Narrative identity: see patterns of who you're becoming.
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, APP_CONFIG } from '../../src/lib/constants';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { buildHumanTimeline, groupTimelineByDate, type HumanTimelineEvent, type HumanTimelineEventType } from '../../src/services/humanTimelineService';

const EVENT_ICONS: Record<HumanTimelineEventType, keyof typeof Ionicons.glyphMap> = {
  connection: 'chatbubble-ellipses',
  mood: 'pulse',
  insight: 'bulb',
  journal: 'book',
  relationship: 'people',
  conversation: 'chatbubbles',
};

export default function HumanTimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const moodHistory = useCircleStore((s) => s.moodHistory ?? []);
  const members = useCircleStore((s) => s.members ?? []);
  const connectionLogByMemberId = useLightsStore((s) => s.connectionLogByMemberId ?? {});
  const timelineEventsByMemberId = useLightsStore((s) => s.timelineEventsByMemberId ?? {});
  const getSummaries = useConversationSummaryStore((s) => s.getSummaries);
  const journalEntries = useJournalStore((s) => s.entries ?? []);

  const summaries = useMemo(() => getSummaries(), [getSummaries]);
  const memberList = useMemo(() => members.map((m) => ({ id: m.id, name: m.name })), [members]);

  const moodHistoryForTimeline = useMemo(
    () =>
      moodHistory.map((m) => ({
        id: m.id,
        mood: (m as { mood?: string }).mood,
        mood_label: (m as { mood_label?: string }).mood_label,
        label: (m as { label?: string }).label,
        note: (m as { note?: string }).note ?? null,
        timestamp: (m as { timestamp?: Date }).timestamp,
        createdAt: (m as { createdAt?: Date }).createdAt,
      })),
    [moodHistory]
  );

  const input = useMemo(
    () => ({
      moodHistory: moodHistoryForTimeline,
      members: memberList,
      connectionLogByMemberId,
      timelineEventsByMemberId,
      conversationSummaries: summaries.map((s) => ({ id: s.id, title: s.title, createdAt: s.createdAt })),
      journalEntries: journalEntries.map((e) => ({ id: e.id, content: e.content, createdAt: e.createdAt })),
    }),
    [moodHistoryForTimeline, memberList, connectionLogByMemberId, timelineEventsByMemberId, summaries, journalEntries]
  );

  const events = useMemo(() => buildHumanTimeline(input), [input]);
  const grouped = useMemo(() => groupTimelineByDate(events), [events]);

  const handleEventPress = (event: HumanTimelineEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (event.payload?.memberId) {
      router.push({ pathname: '/lights/[id]', params: { id: event.payload.memberId } });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Your Human Timeline</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your timeline will grow as you use {APP_CONFIG.name}</Text>
            <Text style={styles.emptySub}>
              Check in, reach out to people, talk with Gauge, and add journal entries. They’ll appear here so you can see patterns over time.
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.dateKey} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.dateLabel}</Text>
              {group.events.map((event) => (
                <Pressable
                  key={event.id}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={EVENT_ICONS[event.type]} size={18} color={COLORS.accent} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel} numberOfLines={2}>{event.label}</Text>
                    {event.sublabel ? <Text style={styles.rowSub} numberOfLines={1}>{event.sublabel}</Text> : null}
                  </View>
                  {event.payload?.memberId ? <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} /> : null}
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: SPACING.xl },
  empty: { marginTop: 32, paddingHorizontal: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowPressed: { opacity: 0.9 },
  iconWrap: { marginRight: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rowSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
