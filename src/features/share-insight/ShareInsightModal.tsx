/**
 * ShareInsight Component
 * 
 * Allows users to share educational content (lessons, discoveries, AI insights)
 * with others via a link. Includes context field for personal message.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../lib/supabase';
import { useUserStore } from '../../stores/userStore';

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  success: '#4ADE80',
};

export type InsightType = 'manual_lesson' | 'discovery' | 'ai_response' | 'relate_insight' | 'replay_insight';
export type RecipientType = 'family' | 'friend' | 'partner' | 'coworker' | 'other';

export interface ShareableContent {
  type: InsightType;
  id?: string;
  title: string;
  summary: string;
  keyPoints?: string[];
  deepContent?: string;
  science?: string;
  realWorldExamples?: string[];
  tryThis?: string;
  sourceLabel: string;
  // Academic backing
  connectedGauges?: ('body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment')[];
  academicSources?: { author: string; insight: string }[];
}

interface ShareInsightProps {
  content: ShareableContent;
  /** Render prop for the trigger button */
  trigger?: (onPress: () => void) => React.ReactNode;
}

const RECIPIENT_OPTIONS: { value: RecipientType; label: string; emoji: string }[] = [
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'friend', label: 'Friend', emoji: '👋' },
  { value: 'partner', label: 'Partner', emoji: '💕' },
  { value: 'coworker', label: 'Coworker', emoji: '💼' },
  { value: 'other', label: 'Other', emoji: '🌍' },
];

export function ShareInsight({ content, trigger }: ShareInsightProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'context' | 'loading' | 'success'>('context');
  const [senderContext, setSenderContext] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  
  const userName = useUserStore((s) => s.name) || 'Someone';

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    setStep('context');
    setSenderContext('');
    setRecipientType(null);
    setShareUrl('');
    setError('');
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    setStep('loading');
    setError('');

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Please sign in to share insights');
        setStep('context');
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/share-insight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            insightType: content.type,
            insightId: content.id,
            title: content.title,
            summary: content.summary,
            keyPoints: content.keyPoints,
            deepContent: content.deepContent,
            science: content.science,
            realWorldExamples: content.realWorldExamples,
            tryThis: content.tryThis,
            sourceLabel: content.sourceLabel,
            senderName: userName,
            senderContext: senderContext.trim() || undefined,
            recipientType: recipientType || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareUrl(data.url);
      setStep('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Share error:', err);
      setError(err.message || 'Something went wrong');
      setStep('context');
    }
  };

  const handleNativeShare = async () => {
    const message = senderContext
      ? `${senderContext}\n\n${shareUrl}`
      : `I wanted to share this with you: ${shareUrl}`;
    
    try {
      await Share.share({
        message,
        url: Platform.OS === 'ios' ? shareUrl : undefined,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error('Native share error:', err);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Default trigger button
  const defaultTrigger = (
    <Pressable style={styles.triggerButton} onPress={handleOpen}>
      <Ionicons name="share-outline" size={18} color={COLORS.accent} />
      <Text style={styles.triggerText}>Share This Insight</Text>
    </Pressable>
  );

  return (
    <>
      {trigger ? trigger(handleOpen) : defaultTrigger}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.headerTitle}>Share Insight</Text>
              <View style={{ width: 50 }} />
            </View>

            {step === 'context" && (
              <View style={styles.content}>
                {/* What you're sharing */}
                <View style={styles.previewCard}>
                  <Text style={styles.previewLabel}>{content.sourceLabel}</Text>
                  <Text style={styles.previewTitle}>{content.title}</Text>
                  <Text style={styles.previewSummary} numberOfLines={3}>
                    {content.summary}
                  </Text>
                </View>

                {/* Context input */}
                <Text style={styles.sectionLabel}>Why are you sharing this?</Text>
                <TextInput
                  style={styles.contextInput}
                  placeholder=\"I read this and thought of you... or I"m working on this and wanted you to understand..."
                  placeholderTextColor={COLORS.textMuted}
                  value={senderContext}
                  onChangeText={setSenderContext}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>{senderContext.length}/500</Text>

                {/* Recipient type */}
                <Text style={styles.sectionLabel}>Who is this for?</Text>
                <View style={styles.recipientGrid}>
                  {RECIPIENT_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.recipientPill,
                        recipientType === opt.value && styles.recipientPillSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRecipientType(opt.value);
                      }}
                    >
                      <Text style={styles.recipientEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.recipientLabel,
                          recipientType === opt.value && styles.recipientLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Generate button */}
                <Pressable style={styles.shareButton} onPress={handleShare}>
                  <Text style={styles.shareButtonText}>Generate Share Link</Text>
                </Pressable>

                <Text style={styles.privacyNote}>
                  They'll see this content + your message. No app required to view.
                </Text>
              </View>
            )}

            {step === 'loading' && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>Creating your share link...</Text>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.content}>
                <View style={styles.successIcon}>
                  <Text style={{ fontSize: 48 }}>🔗</Text>
                </View>
                <Text style={styles.successTitle}>Ready to share!</Text>
                <Text style={styles.successSubtitle}>
                  Send this link to help someone understand.
                </Text>

                <View style={styles.linkBox}>
                  <Text style={styles.linkText} numberOfLines={1}>
                    {shareUrl}
                  </Text>
                </View>

                <View style={styles.shareActions}>
                  <Pressable style={styles.primaryAction} onPress={handleNativeShare}>
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>Share</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryAction} onPress={handleCopyLink}>
                    <Ionicons name="copy-outline" size={20} color={COLORS.accent} />
                    <Text style={styles.secondaryActionText}>Copy Link</Text>
                  </Pressable>
                </View>

                <Pressable style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// Compact inline share button for lesson screens
export function ShareInsightButton({ content }: { content: ShareableContent }) {
  return (
    <ShareInsight
      content={content}
      trigger={(onPress) => (
        <Pressable
          style={styles.inlineButton}
          onPress={onPress}
        >
          <Ionicons name="share-outline" size={16} color={COLORS.accent} />
          <Text style={styles.inlineButtonText}>Share with someone</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  triggerText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewLabel: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSummary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  contextInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 20,
  },
  recipientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  recipientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipientPillSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  recipientEmoji: {
    fontSize: 16,
  },
  recipientLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  recipientLabelSelected: {
    color: COLORS.accent,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  privacyNote: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  successIcon: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  linkBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 14,
    padding: 16,
  },
  secondaryActionText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 16,
  },
  inlineButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
});
