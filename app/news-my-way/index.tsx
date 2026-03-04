import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useNewsMyWayStore } from '../../src/stores/newsMyWayStore';
import { fetchDigest } from '../../src/services/newsMyWayService';
import { NEWS_CATEGORY_LABELS, CAPACITY_MODE_LABELS } from '../../src/types/newsMyWay';
import type { NewsStory } from '../../src/types/newsMyWay';

const DOOMSCROLL_CHECK_MINUTES = 15;

function StoryCard({
  story,
  onReaction,
  onOpen,
}: {
  story: NewsStory;
  onReaction: (reaction: 'better' | 'worse' | 'neutral') => void;
  onOpen: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryBadge}>{NEWS_CATEGORY_LABELS[story.category]}</Text>
        <Text style={styles.source}>{story.sourceName}</Text>
      </View>
      <Pressable onPress={onOpen}>
        <Text style={styles.title}>{story.title}</Text>
        {story.description ? <Text style={styles.description} numberOfLines={2}>{story.description}</Text> : null}
      </Pressable>
      {story.whyShowing ? (
        <Text style={styles.whyShowing}>{story.whyShowing}</Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Pressable style={styles.reactBtn} onPress={() => onReaction('better')}>
          <Text style={styles.reactEmoji}>👍</Text>
        </Pressable>
        <Pressable style={styles.reactBtn} onPress={() => onReaction('neutral')}>
          <Text style={styles.reactEmoji}>😐</Text>
        </Pressable>
        <Pressable style={styles.reactBtn} onPress={() => onReaction('worse')}>
          <Text style={styles.reactEmoji}>👎</Text>
        </Pressable>
        <Pressable style={styles.openBtn} onPress={onOpen}>
          <Text style={styles.openBtnText}>Read</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DoomscrollCheckInModal({
  visible,
  sessionMinutes,
  onAnswer,
  onClose,
}: {
  visible: boolean;
  sessionMinutes: number;
  onAnswer: (feeling: 'better' | 'same' | 'worse') => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>How do you feel?</Text>
          <Text style={styles.modalSubtitle}>You've been reading for about {sessionMinutes} min. Quick check-in.</Text>
          <Pressable style={styles.modalBtn} onPress={() => { onAnswer('better'); onClose(); }}>
            <Text style={styles.modalBtnText}>Better</Text>
          </Pressable>
          <Pressable style={styles.modalBtn} onPress={() => { onAnswer('same'); onClose(); }}>
            <Text style={styles.modalBtnText}>Same</Text>
          </Pressable>
          <Pressable style={styles.modalBtn} onPress={() => { onAnswer('worse'); onClose(); }}>
            <Text style={styles.modalBtnText}>Worse</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text style={styles.modalSkip}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function NewsMyWayIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDoomscrollCheckIn, setShowDoomscrollCheckIn] = useState(false);

  const stateValue = useCockpitStore((s) => s.state.value >= 0 ? s.state.value : 50);
  const directionValue = useCockpitStore((s) => s.direction.value >= 0 ? s.direction.value : 50);
  const connectionValue = useCockpitStore((s) => s.connection.value >= 0 ? s.connection.value : 50);

  const digest = useNewsMyWayStore((s) => s.digest);
  const setDigest = useNewsMyWayStore((s) => s.setDigest);
  const sessionStartedAt = useNewsMyWayStore((s) => s.sessionStartedAt);
  const startSession = useNewsMyWayStore((s) => s.startSession);
  const clearSession = useNewsMyWayStore((s) => s.clearSession);
  const recordImpact = useNewsMyWayStore((s) => s.recordImpact);
  const recordDoomscrollCheckIn = useNewsMyWayStore((s) => s.recordDoomscrollCheckIn);
  const settings = useNewsMyWayStore((s) => s.settings);
  const isNewsFreeToday = useNewsMyWayStore((s) => s.isNewsFreeToday);
  const setNewsFreeToday = useNewsMyWayStore((s) => s.setNewsFreeToday);
  const removeNewsFreeDate = useNewsMyWayStore((s) => s.removeNewsFreeDate);

  const today = new Date().toISOString().slice(0, 10);
  const newsFree = isNewsFreeToday(today);
  const stateLow = stateValue < (settings.newsFreeWhenStateBelow || 0);

  const load = useCallback(async () => {
    try {
      const d = await fetchDigest({ stateValue, directionValue, connectionValue });
      setDigest(d);
    } catch (e) {
      const d = await fetchDigest({ stateValue: 50, directionValue: 50, connectionValue: 50 });
      setDigest(d);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stateValue, directionValue, connectionValue, setDigest]);

  useEffect(() => {
    startSession();
    if (!digest || digest.stories.length === 0) load();
    else setLoading(false);
    return () => {};
  }, []);

  useEffect(() => {
    if (!sessionStartedAt || !settings.doomscrollCheckInMinutes) return;
    const interval = setInterval(() => {
      const start = new Date(sessionStartedAt).getTime();
      const elapsed = (Date.now() - start) / 60000;
      if (elapsed >= settings.doomscrollCheckInMinutes && !showDoomscrollCheckIn) {
        setShowDoomscrollCheckIn(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sessionStartedAt, settings.doomscrollCheckInMinutes, showDoomscrollCheckIn]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleDoomscrollAnswer = (feeling: 'better' | 'same' | 'worse') => {
    const start = sessionStartedAt ? new Date(sessionStartedAt).getTime() : Date.now();
    const minutes = Math.round((Date.now() - start) / 60000);
    recordDoomscrollCheckIn(feeling, minutes);
    setShowDoomscrollCheckIn(false);
  };

  if (newsFree || (stateLow && settings.newsFreeWhenStateBelow > 0)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📵</Text>
          <Text style={styles.emptyTitle}>News-free today</Text>
          <Text style={styles.emptyText}>
            {newsFree ? "You chose to skip news today." : "Your State is low — we're not showing a digest."}
          </Text>
          {newsFree && (
            <Pressable style={styles.changeMindBtn} onPress={() => { removeNewsFreeDate(today); setLoading(true); load(); }}>
              <Text style={styles.changeMindText}>Show digest anyway</Text>
            </Pressable>
          )}
          <Pressable style={styles.settingsLink} onPress={() => router.push('/news-my-way/settings')}>
            <Text style={styles.settingsLinkText}>News settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Building your digest...</Text>
      </View>
    );
  }

  const stories = digest?.stories ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {digest?.digestNote ? (
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>{digest.digestNote}</Text>
          <Text style={styles.noteMode}>{CAPACITY_MODE_LABELS[digest.capacityMode]} mode</Text>
        </View>
      ) : null}

      <Pressable style={styles.thinkRow} onPress={() => router.push('/(modals)/critical-thinking')}>
        <Text style={styles.thinkRowText}>🧠 Check claims with Critical Thinking</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Today's digest</Text>
      {stories.length === 0 ? (
        <Text style={styles.emptyHint}>No stories right now. Pull to refresh.</Text>
      ) : (
        stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onReaction={(r) => recordImpact(story.id, r)}
            onOpen={() => Linking.openURL(story.url).catch(() => {})}
          />
        ))
      )}

      <Pressable style={styles.settingsRow} onPress={() => router.push('/news-my-way/settings')}>
        <Text style={styles.settingsRowText}>News settings</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <DoomscrollCheckInModal
        visible={showDoomscrollCheckIn}
        sessionMinutes={settings.doomscrollCheckInMinutes || 15}
        onAnswer={handleDoomscrollAnswer}
        onClose={() => setShowDoomscrollCheckIn(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  noteCard: { backgroundColor: COLORS.accentBg, borderRadius: BORDER_RADIUS.card, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accentMuted },
  noteText: { fontSize: 14, color: COLORS.text },
  noteMode: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  emptyHint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  categoryBadge: { fontSize: 11, fontWeight: '600', color: COLORS.accent, textTransform: 'uppercase' },
  source: { fontSize: 12, color: COLORS.textMuted },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  description: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  whyShowing: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reactBtn: { padding: 8 },
  reactEmoji: { fontSize: 18 },
  openBtn: { marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.button },
  openBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  changeMindBtn: { padding: 12 },
  changeMindText: { fontSize: 15, color: COLORS.accent },
  settingsLink: { marginTop: 16 },
  settingsLinkText: { fontSize: 14, color: COLORS.textMuted },
  thinkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  thinkRowText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, marginTop: 8 },
  settingsRowText: { fontSize: 16, color: COLORS.text },
  chevron: { fontSize: 20, color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  modalBtn: { backgroundColor: COLORS.accent, padding: 14, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 10 },
  modalBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalSkip: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 12 },
});
