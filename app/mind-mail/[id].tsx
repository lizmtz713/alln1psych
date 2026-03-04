/**
 * Mind Mail detail — full message view, Reply, Archive, Delete
 */

import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMindMailStore, type MindMail, type MindNote } from '../../src/stores/mindMailStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MindMailDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, sent } = useLocalSearchParams<{ id: string; sent?: string }>();
  const { inbox, notes, markMailRead, archiveMail, respondToMail } = useMindMailStore();

  const isSent = sent === '1';
  const mail = useMemo(
    () => (!isSent ? inbox.find((m) => m.id === id) ?? null : null),
    [inbox, id, isSent]
  );
  const note = useMemo(() => notes.find((n) => n.id === id) ?? null, [notes, id]);
  const item = mail ?? note;
  const isInboxItem = mail != null;

  React.useEffect(() => {
    if (mail && mail.status === 'pending') markMailRead(mail.id);
  }, [mail?.id, mail?.status]);

  const [response, setResponse] = React.useState('');
  const [sending, setSending] = React.useState(false);

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centered]}>
        <Text style={styles.emptyText}>Message not found.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const senderLabel = isInboxItem
    ? (item as MindMail).isAnonymous
      ? 'Someone in your Circle'
      : (item as MindMail).senderName || 'Someone'
    : null;
  const canReply = isInboxItem && !(item as MindMail).isAnonymous && !(item as MindMail).response;

  const handleReply = async () => {
    if (!response.trim() || !isInboxItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSending(true);
    try {
      await respondToMail(item.id, response.trim());
      Alert.alert('Sent', 'Your response has been delivered.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not send response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleArchive = () => {
    if (!isInboxItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Archive message?',
      'You can find it in the Archive tab.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await archiveMail(item.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            router.back();
            // If we add deleteNote for received mail we could call it
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mind Mail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isInboxItem && (item as MindMail).isAnonymous && styles.cardAnonymous]}>
          <View style={styles.metaRow}>
            <Text style={styles.sender}>
              {isInboxItem ? senderLabel : `To: ${(item as MindNote).recipientName}`}
            </Text>
            {(item as MindMail).isAnonymous && (
              <View style={styles.anonBadge}>
                <Text style={styles.anonBadgeText}>Anonymous</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.content}>{(item as MindMail).content ?? (item as MindNote).content}</Text>
        </View>

        {isInboxItem && (item as MindMail).isAnonymous && (
          <Text style={styles.anonHint}>
            This message was sent anonymously by someone in your Circle.
          </Text>
        )}

        {canReply && (
          <View style={styles.replySection}>
            <Text style={styles.replyLabel}>Reply</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Write back..."
              placeholderTextColor={COLORS.textMuted}
              value={response}
              onChangeText={setResponse}
              multiline
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.replyBtn, (!response.trim() || sending) && styles.replyBtnDisabled]}
              onPress={handleReply}
              disabled={!response.trim() || sending}
            >
              <Ionicons name="arrow-undo" size={20} color="#fff" />
              <Text style={styles.replyBtnText}>{sending ? 'Sending...' : 'Send Reply'}</Text>
            </Pressable>
          </View>
        )}

        {(item as MindMail).response && (
          <View style={styles.theirResponse}>
            <Text style={styles.theirResponseLabel}>Your response</Text>
            <Text style={styles.theirResponseText}>{(item as MindMail).response}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {isInboxItem && (item as MindMail).status !== 'archived' && (
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]} onPress={handleArchive}>
              <Ionicons name="archive-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.actionBtnText}>Archive</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginBottom: 16 },
  linkText: { fontSize: 16, color: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardAnonymous: {
    borderStyle: 'dashed',
    borderColor: COLORS.textMuted,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  sender: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  date: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  content: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  anonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
  },
  anonBadgeText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  anonHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  replySection: { marginBottom: 24 },
  replyLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  replyInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button ?? 12,
  },
  replyBtnDisabled: { opacity: 0.5 },
  replyBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  theirResponse: {
    backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: (COLORS as any).borderAccent ?? COLORS.border,
    marginBottom: 16,
  },
  theirResponseLabel: { fontSize: 12, fontWeight: '600', color: COLORS.accent, marginBottom: 6 },
  theirResponseText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionBtnText: { fontSize: 15, color: COLORS.textSecondary },
  pressed: { opacity: 0.9 },
});
