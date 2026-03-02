/**
 * Heart Mail detail — full message view, Accept/Decline for soft share, Reply.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  useHeartInboxStore,
  type HeartInboxMessage,
} from '../../src/stores/heartInboxStore';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = 'rgba(255,255,255,0.06)';
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function getSenderLabel(m: HeartInboxMessage): string {
  if (m.type === 'anonymous') return 'Someone in your Circle 💜';
  if (m.type === 'soft' && m.accepted !== true) return 'Someone in your Circle 💜';
  return m.fromName;
}

export default function HeartMailDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const messages = useHeartInboxStore((s) => s.messages);
  const markRead = useHeartInboxStore((s) => s.markRead);
  const acceptSoftShare = useHeartInboxStore((s) => s.acceptSoftShare);
  const declineSoftShare = useHeartInboxStore((s) => s.declineSoftShare);
  const archiveMessage = useHeartInboxStore((s) => s.archiveMessage);

  const message = useMemo(() => messages.find((m) => m.id === id), [messages, id]);

  React.useEffect(() => {
    if (message && !message.read) markRead(message.id);
  }, [message?.id, message?.read]);

  if (!message) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.centered]}>
        <Text style={styles.emptyText}>Message not found.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isSoftPending = message.type === 'soft' && message.accepted === undefined;
  const showContent = message.type !== 'soft' || message.accepted === true;
  const canReply = (message.type === 'open' || (message.type === 'soft' && message.accepted === true)) && message.from;

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    acceptSoftShare(message.id);
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Decline?',
      "The sender won't be notified. The message will be removed from your inbox.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            declineSoftShare(message.id);
            archiveMessage(message.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleReply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(modals)/heart-mail-compose',
      params: { replyTo: message.from, replyToName: message.fromName },
    });
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
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Heart Mail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sender}>{getSenderLabel(message)}</Text>
          <Text style={styles.date}>{new Date(message.createdAt).toLocaleString()}</Text>

          {isSoftPending ? (
            <>
              <Text style={styles.teaser}>{message.teaser ?? 'Someone sent you a note. Accept to read it.'}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed]}
                  onPress={handleAccept}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.declineBtn, pressed && styles.pressed]}
                  onPress={handleDecline}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </Pressable>
              </View>
            </>
          ) : (
            showContent && (
              <Text style={styles.content}>{message.content}</Text>
            )
          )}
        </View>

        {canReply && (
          <Pressable
            style={({ pressed }) => [styles.replyBtn, pressed && styles.pressed]}
            onPress={handleReply}
          >
            <Ionicons name="arrow-undo" size={20} color={ACCENT} />
            <Text style={styles.replyBtnText}>Reply to {message.fromName}</Text>
          </Pressable>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  emptyText: { fontSize: 16, color: TEXT_MUTED, marginBottom: 16 },
  linkText: { fontSize: 16, color: ACCENT },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 14,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sender: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 4 },
  date: { fontSize: 13, color: TEXT_MUTED, marginBottom: 16 },
  teaser: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 20 },
  content: { fontSize: 16, color: TEXT, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  acceptBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  declineBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  declineBtnText: { fontSize: 16, color: TEXT_MUTED },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
  },
  replyBtnText: { fontSize: 16, color: ACCENT, fontWeight: '500' },
  pressed: { opacity: 0.9 },
});
