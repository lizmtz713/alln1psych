/**
 * Heart View Modal
 * View a single Heart Mail message
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useHeartNotesStore, type NoteType } from '../../src/stores/heartNotesStore';

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
  return new Date(iso).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HeartViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; type?: string }>();
  
  const { inbox, notes, respondToMail } = useHeartNotesStore();
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  
  // Find the message
  const mail = params.type === 'note'
    ? notes.find((n) => n.id === params.id)
    : inbox.find((m) => m.id === params.id);
  
  if (!mail) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Heart Mail</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>Message not found</Text>
        </View>
      </View>
    );
  }
  
  const config = NOTE_TYPE_CONFIG[(mail as any).noteType] || NOTE_TYPE_CONFIG.general;
  const isInbox = params.type !== 'note';
  const canRespond = isInbox && !(mail as any).response;
  
  const handleRespond = async () => {
    if (!response.trim()) return;
    
    setSending(true);
    try {
      await respondToMail(mail.id, response.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sent! 💜', 'Your response has been delivered.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not send response. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>{config.label}</Text>
          <View style={{ width: 32 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Emoji & Type */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{config.emoji}</Text>
          </View>
          
          {/* From / To */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{isInbox ? 'From' : 'To'}</Text>
              <Text style={styles.metaValue}>
                {isInbox
                  ? (mail as any).isAnonymous
                    ? 'Someone in your Circle'
                    : (mail as any).senderName || 'Anonymous'
                  : (mail as any).recipientName}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Received</Text>
              <Text style={styles.metaValue}>{formatDate(mail.createdAt)}</Text>
            </View>
          </View>
          
          {/* Message Content */}
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {(mail as any).content}
            </Text>
          </View>
          
          {/* Response Section */}
          {canRespond && (
            <View style={styles.responseSection}>
              <Text style={styles.responseLabel}>Send a response</Text>
              <TextInput
                style={styles.responseInput}
                placeholder="Write back..."
                placeholderTextColor={COLORS.textMuted}
                value={response}
                onChangeText={setResponse}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Pressable
                style={[styles.respondButton, !response.trim() && styles.respondButtonDisabled]}
                onPress={handleRespond}
                disabled={sending || !response.trim()}
              >
                <Text style={styles.respondButtonText}>
                  {sending ? 'Sending...' : 'Send Response'}
                </Text>
              </Pressable>
            </View>
          )}
          
          {/* Existing Response */}
          {(mail as any).response && (
            <View style={styles.existingResponse}>
              <Text style={styles.existingResponseLabel}>
                {isInbox ? 'Your response' : 'Their response'}
              </Text>
              <Text style={styles.existingResponseText}>{(mail as any).response}</Text>
            </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
  },
  metaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.pink + '22',
  },
  messageText: {
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.text,
  },
  responseSection: {
    marginBottom: 24,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  responseInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  respondButton: {
    backgroundColor: COLORS.pink,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  respondButtonDisabled: {
    opacity: 0.5,
  },
  respondButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  existingResponse: {
    backgroundColor: 'rgba(124,77,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.2)',
  },
  existingResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  existingResponseText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
});
