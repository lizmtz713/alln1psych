/**
 * Mind Mail Inbox — email-like inbox with Inbox / Sent / Drafts / Archive tabs
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useMindMailStore, type MindMail, type MindNote, type NoteType } from '../../src/stores/mindMailStore';
import { MindMailExplainer, getHasSeenMindMailOnboarding } from '../../src/components/mind-mail/MindMailExplainer';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

const NOTE_TYPE_CONFIG: Record<NoteType, { emoji: string; label: string }> = {
  general: { emoji: '💌', label: 'Message' },
  gratitude: { emoji: '🙏', label: 'Gratitude' },
  concern: { emoji: '💭', label: 'Concern' },
  apology: { emoji: '🤝', label: 'Apology' },
  forgiveness: { emoji: '💜', label: 'Forgiveness' },
  boundary: { emoji: '🚧', label: 'Boundary' },
  grief: { emoji: '🕊️', label: 'Support' },
  encouragement: { emoji: '✨', label: 'Encouragement' },
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function previewSnippet(text: string, maxLen = 50): string {
  const t = (text || '').trim();
  if (!t) return '';
  return t.length <= maxLen ? t : t.slice(0, maxLen).trim() + '…';
}

function InboxRow({ mail, onPress }: { mail: MindMail; onPress: () => void }) {
  const config = NOTE_TYPE_CONFIG[mail.noteType] || NOTE_TYPE_CONFIG.general;
  const isUnread = mail.status === 'pending';
  const sendLabel = mail.isAnonymous ? 'Anon' : 'Open';

  return (
    <Pressable style={[styles.row, isUnread && styles.rowUnread]} onPress={onPress}>
      <View style={[styles.rowIcon, isUnread && styles.rowIconUnread]}>
        <Text style={styles.rowEmoji}>{config.emoji}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowFrom, isUnread && styles.rowFromUnread]} numberOfLines={1}>
            {mail.isAnonymous ? 'Someone in your Circle' : (mail.senderName || 'Someone')}
          </Text>
          <Text style={styles.rowTime}>{formatRelativeTime(mail.createdAt)}</Text>
        </View>
        <Text style={styles.rowPreview} numberOfLines={1}>{previewSnippet(mail.content)}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeType]}>
            <Text style={styles.badgeText}>{sendLabel}</Text>
          </View>
        </View>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

function SentRow({ note, onPress }: { note: MindNote; onPress: () => void }) {
  const config = NOTE_TYPE_CONFIG[note.noteType] || NOTE_TYPE_CONFIG.general;
  const statusLabel = note.status === 'pending' ? 'Awaiting' : note.status === 'shared' ? 'Delivered' : 'Sent';

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>{config.emoji}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowFrom}>To: {note.recipientName}</Text>
          <Text style={styles.rowTime}>{formatRelativeTime(note.updatedAt || note.createdAt)}</Text>
        </View>
        <Text style={styles.rowPreview} numberOfLines={1}>{previewSnippet(note.content)}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeStatus]}>
            <Text style={styles.badgeText}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function DraftRow({ note, onPress }: { note: MindNote; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>📝</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowFrom}>To: {note.recipientName || '—'}</Text>
          <Text style={styles.rowTime}>{formatRelativeTime(note.updatedAt || note.createdAt)}</Text>
        </View>
        <Text style={styles.rowPreview} numberOfLines={1}>{previewSnippet(note.content) || 'Empty draft'}</Text>
      </View>
    </Pressable>
  );
}

export default function MindMailInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'archive'>('inbox');
  const [showExplainer, setShowExplainer] = useState(false);

  useEffect(() => {
    getHasSeenMindMailOnboarding().then((seen) => {
      if (!seen) setShowExplainer(true);
    });
  }, []);

  const {
    inbox,
    notes,
    fetchInbox,
    fetchNotes,
    markMailRead,
    loadInbox,
    loadNotes,
  } = useMindMailStore();

  const unreadCount = inbox.filter((m) => m.status === 'pending').length;
  const sentNotes = notes.filter((n) => n.status === 'shared' || n.status === 'pending');
  const draftNotes = notes.filter((n) => n.status === 'draft' || n.status === 'ready');
  const archivedInbox = inbox.filter((m) => m.status === 'archived');

  useEffect(() => {
    loadInbox().catch(() => {});
    loadNotes().catch(() => {});
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchInbox(), fetchNotes()]).finally(() => setRefreshing(false));
  };

  const handleInboxPress = async (mail: MindMail) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mail.status === 'pending') await markMailRead(mail.id);
    router.push(`/mind-mail/${mail.id}`);
  };

  const handleSentPress = (note: MindNote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/mind-mail/${note.id}?sent=1`);
  };

  const handleDraftPress = (note: MindNote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mind-mail/compose', params: { draftId: note.id } });
  };

  const handleArchivePress = (mail: MindMail) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/mind-mail/${mail.id}`);
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Mind Mail</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/mind-mail/compose');
            }}
            style={styles.composeBtn}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.accent} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {[
            { id: 'inbox' as const, label: 'Inbox', count: unreadCount },
            { id: 'sent' as const, label: 'Sent', count: 0 },
            { id: 'drafts' as const, label: 'Drafts', count: draftNotes.length },
            { id: 'archive' as const, label: 'Archive', count: archivedInbox.length },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          {activeTab === 'inbox' && (
            <>
              {inbox.filter((m) => m.status !== 'archived').length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>💌</Text>
                  <Text style={styles.emptyTitle}>Your Mind Inbox is empty</Text>
                  <Text style={styles.emptyText}>
                    Messages from your Circle will appear here.
                  </Text>
                </View>
              ) : (
                inbox
                  .filter((m) => m.status !== 'archived')
                  .map((mail) => (
                    <InboxRow key={mail.id} mail={mail} onPress={() => handleInboxPress(mail)} />
                  ))
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentNotes.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>📤</Text>
                  <Text style={styles.emptyTitle}>Nothing sent yet</Text>
                  <Text style={styles.emptyText}>
                    Messages you send to your Circle will appear here.
                  </Text>
                </View>
              ) : (
                sentNotes.map((note) => (
                  <SentRow key={note.id} note={note} onPress={() => handleSentPress(note)} />
                ))
              )}
            </>
          )}

          {activeTab === 'drafts' && (
            <>
              {draftNotes.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>📝</Text>
                  <Text style={styles.emptyTitle}>No drafts</Text>
                  <Text style={styles.emptyText}>
                    Start writing to someone you care about.
                  </Text>
                </View>
              ) : (
                draftNotes.map((note) => (
                  <DraftRow key={note.id} note={note} onPress={() => handleDraftPress(note)} />
                ))
              )}
            </>
          )}

          {activeTab === 'archive' && (
            <>
              {archivedInbox.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>📦</Text>
                  <Text style={styles.emptyTitle}>No archived messages</Text>
                  <Text style={styles.emptyText}>
                    Archive messages to clear your inbox without deleting.
                  </Text>
                </View>
              ) : (
                archivedInbox.map((mail) => (
                  <InboxRow key={mail.id} mail={mail} onPress={() => handleArchivePress(mail)} />
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>

      <MindMailExplainer
        visible={showExplainer}
        onDismiss={() => setShowExplainer(false)}
      />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  composeBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tabActive: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.15)' },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.accent },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: COLORS.textMuted,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive: { backgroundColor: COLORS.accent },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowUnread: {
    borderColor: COLORS.accent + '44',
    backgroundColor: (COLORS.accentBg ?? 'rgba(13,148,136,0.08)') as string,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconUnread: { backgroundColor: (COLORS.accentBg ?? 'rgba(13,148,136,0.2)') as string },
  rowEmoji: { fontSize: 22 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  rowFrom: { fontSize: 15, fontWeight: '500', color: COLORS.textSecondary },
  rowFromUnread: { fontWeight: '600', color: COLORS.text },
  rowTime: { fontSize: 12, color: COLORS.textMuted },
  rowPreview: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeType: { backgroundColor: COLORS.surfaceElevated },
  badgeStatus: { backgroundColor: COLORS.surfaceElevated },
  badgeText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
});
