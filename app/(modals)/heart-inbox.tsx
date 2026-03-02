/**
 * Heart Inbox Modal
 * View received Heart Mail messages
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
import { useHeartNotesStore, type HeartMail, type NoteType } from '../../src/stores/heartNotesStore';

const COLORS = {
  bg: '#09090F',
  surface: '#111118',
  surfaceElevated: '#1A1A24',
  border: 'rgba(255,255,255,0.06)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  pink: '#EC4899',
  pinkSoft: 'rgba(236,72,153,0.12)',
};

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

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function MailCard({ mail, onPress }: { mail: HeartMail; onPress: () => void }) {
  const config = NOTE_TYPE_CONFIG[mail.noteType] || NOTE_TYPE_CONFIG.general;
  const isUnread = mail.status === 'pending';
  
  return (
    <Pressable
      style={[styles.mailCard, isUnread && styles.mailCardUnread]}
      onPress={onPress}
    >
      <View style={[styles.mailEmoji, isUnread && styles.mailEmojiUnread]}>
        <Text style={{ fontSize: 24 }}>{config.emoji}</Text>
      </View>
      <View style={styles.mailContent}>
        <View style={styles.mailHeader}>
          <Text style={[styles.mailFrom, isUnread && styles.mailFromUnread]}>
            {mail.isAnonymous ? 'Someone in your Circle' : mail.senderName || 'Anonymous'}
          </Text>
          <Text style={styles.mailTime}>{formatDate(mail.createdAt)}</Text>
        </View>
        <Text style={styles.mailType}>{config.label}</Text>
        <Text style={styles.mailPreview} numberOfLines={2}>
          {mail.content}
        </Text>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function HeartInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  
  const { inbox, notes, fetchInbox, fetchNotes, markMailRead } = useHeartNotesStore();
  
  useEffect(() => {
    fetchInbox().catch(() => {});
    fetchNotes().catch(() => {});
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchInbox(), fetchNotes()])
      .finally(() => setRefreshing(false));
  };
  
  const handleMailPress = async (mail: HeartMail) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mail.status === 'pending') {
      await markMailRead(mail.id);
    }
    router.push({ pathname: '/(modals)/heart-view', params: { id: mail.id } });
  };
  
  const sentNotes = notes.filter((n) => n.status === 'shared' || n.status === 'pending');
  const draftNotes = notes.filter((n) => n.status === 'draft' || n.status === 'ready');
  
  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Heart Mail</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(modals)/heart-compose');
            }}
            style={styles.composeButton}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.pink} />
          </Pressable>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { id: 'inbox' as const, label: 'Inbox', count: inbox.filter((m) => m.status === 'pending').length },
            { id: 'sent' as const, label: 'Sent', count: 0 },
            { id: 'drafts' as const, label: 'Drafts', count: draftNotes.length },
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
        
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.pink} />
          }
        >
          {activeTab === 'inbox' && (
            <>
              {inbox.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>💌</Text>
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptyText}>
                    Heart Mail you receive from your Circle will appear here.
                  </Text>
                </View>
              ) : (
                inbox.map((mail) => (
                  <MailCard key={mail.id} mail={mail} onPress={() => handleMailPress(mail)} />
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
                  <Pressable
                    key={note.id}
                    style={styles.mailCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/(modals)/heart-view', params: { id: note.id, type: 'note' } });
                    }}
                  >
                    <View style={styles.mailEmoji}>
                      <Text style={{ fontSize: 24 }}>
                        {NOTE_TYPE_CONFIG[note.noteType]?.emoji || '💌'}
                      </Text>
                    </View>
                    <View style={styles.mailContent}>
                      <Text style={styles.mailFrom}>To: {note.recipientName}</Text>
                      <Text style={styles.mailType}>
                        {note.status === 'pending' ? 'Awaiting response' : 'Delivered'}
                      </Text>
                      <Text style={styles.mailPreview} numberOfLines={2}>
                        {note.content}
                      </Text>
                    </View>
                  </Pressable>
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
                    Start writing a Heart Note and save it as a draft.
                  </Text>
                </View>
              ) : (
                draftNotes.map((note) => (
                  <Pressable
                    key={note.id}
                    style={styles.mailCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/(modals)/heart-compose', params: { draftId: note.id } });
                    }}
                  >
                    <View style={styles.mailEmoji}>
                      <Text style={{ fontSize: 24 }}>📝</Text>
                    </View>
                    <View style={styles.mailContent}>
                      <Text style={styles.mailFrom}>To: {note.recipientName}</Text>
                      <Text style={styles.mailType}>Draft</Text>
                      <Text style={styles.mailPreview} numberOfLines={2}>
                        {note.content || 'Empty draft'}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  composeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.pinkSoft,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.pink,
  },
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
  tabBadgeActive: {
    backgroundColor: COLORS.pink,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  mailCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mailCardUnread: {
    borderColor: COLORS.pink + '44',
    backgroundColor: 'rgba(236,72,153,0.05)',
  },
  mailEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mailEmojiUnread: {
    backgroundColor: COLORS.pinkSoft,
  },
  mailContent: {
    flex: 1,
  },
  mailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  mailFrom: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  mailFromUnread: {
    fontWeight: '600',
    color: COLORS.text,
  },
  mailTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  mailType: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  mailPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.pink,
    alignSelf: 'center',
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
