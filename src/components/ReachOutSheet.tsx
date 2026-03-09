/**
 * ReachOutSheet — All the ways to connect with someone
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../lib/constants';
import type { Light } from '../types/lights';
import {
  REACH_OUT_ACTIONS,
  getRecommendedActions,
  getSuggestedMessages,
  executeReachOut,
  getLoveLanguageTips,
  getToneForContext,
  MESSAGE_TONE_ORDER,
  type ReachOutAction,
  type MessageContext,
  type MessageTone,
} from '../services/reachOutActions';
import { useLightsStore } from '../stores/lightsStore';

const CONTEXT_LABELS: Record<MessageContext, string> = {
  'just-checking-in': '👋 Check in',
  'been-a-while': '⏰ Reconnect',
  'they-struggling': '💛 Support',
  'celebration': '🎉 Celebrate',
  'random-love': '✨ Appreciation',
  'thinking-of-you': '💭 Thinking of you',
  'need-to-reconnect': '🔄 Reconnect',
  'funny': '😂 Funny',
};

interface ReachOutSheetProps {
  visible: boolean;
  onClose: () => void;
  light: Light;
}

export function ReachOutSheet({ visible, onClose, light }: ReachOutSheetProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [showAllActions, setShowAllActions] = useState(false);
  const [messageTone, setMessageTone] = useState<MessageTone | null>(null);
  const addConnectionEntry = useLightsStore((s) => s.addConnectionEntry);

  const recommendedActions = getRecommendedActions(light);
  const suggestedMessages = getSuggestedMessages(light);
  const loveLanguageTips = getLoveLanguageTips(light.loveLanguage);
  const quickActions = recommendedActions.slice(0, 3);

  const handleActionPress = async (action: ReachOutAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await executeReachOut(action, light);
    if (success) {
      const typeMap: Record<string, 'text' | 'call' | 'video' | 'in-person' | 'social' | 'mind-mail' | 'other'> = {
        text: 'text',
        call: 'call',
        video: 'video',
        'voice-note': 'text',
      };
      const entryType = typeMap[action.id];
      if (entryType) {
        addConnectionEntry(light.id, { type: entryType, date: new Date() });
      }
      onClose();
    } else if (action.id === 'mind-mail') {
      Alert.alert('Mind Mail', 'Opening Mind Mail composer...');
      onClose();
    }
  };

  const handleCopyMessage = async (message: string) => {
    await Clipboard.setStringAsync(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Message copied. Paste it when you reach out.');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reach out to {light.name}</Text>
            {light.loveLanguage && <Text style={styles.subtitle}>Love language: {light.loveLanguage}</Text>}
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <Pressable key={action.id} style={styles.quickActionBtn} onPress={() => handleActionPress(action)}>
                  <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Suggested Messages — tone filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Say</Text>
            <Text style={styles.sectionSubtitle}>Tap to copy, then send</Text>
            <View style={styles.toneRow}>
              {MESSAGE_TONE_ORDER.map((tone) => (
                <Pressable
                  key={tone}
                  style={[styles.toneChip, messageTone === tone && styles.toneChipActive]}
                  onPress={() => setMessageTone(messageTone === tone ? null : tone)}
                >
                  <Text style={[styles.toneChipText, messageTone === tone && styles.toneChipTextActive]}>{tone}</Text>
                </Pressable>
              ))}
            </View>
            {(messageTone
              ? suggestedMessages.filter((s) => getToneForContext(s.context) === messageTone)
              : suggestedMessages
            ).map((suggestion, index) => (
              <Pressable key={index} style={styles.messageCard} onPress={() => handleCopyMessage(suggestion.message)}>
                <Text style={styles.messageContext}>{CONTEXT_LABELS[suggestion.context]}</Text>
                <Text style={styles.messageText}>"{suggestion.message}"</Text>
                <Text style={styles.copyHint}>Tap to copy</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Write Your Own</Text>
            <TextInput
              style={styles.customInput}
              placeholder={`Write a message for ${light.name}...`}
              placeholderTextColor={COLORS.textMuted}
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={3}
            />
            {customMessage.length > 0 && (
              <Pressable
                style={styles.sendBtn}
                onPress={() => {
                  const textAction = REACH_OUT_ACTIONS.find((a) => a.id === 'text')!;
                  handleActionPress(textAction);
                }}
              >
                <Ionicons name="send" size={18} color="#000" />
                <Text style={styles.sendBtnText}>Send via Text</Text>
              </Pressable>
            )}
          </View>

          {/* Love Language Tips */}
          {loveLanguageTips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💝 Tips for {light.loveLanguage}</Text>
              <View style={styles.tipsCard}>
                {loveLanguageTips.tips.map((tip, i) => (
                  <Text key={i} style={styles.tipItem}>• {tip}</Text>
                ))}
              </View>
            </View>
          )}

          {/* More options — keep primary 3, expand to full list on tap */}
          <Pressable style={styles.showAllBtn} onPress={() => setShowAllActions(!showAllActions)}>
            <Text style={styles.showAllText}>{showAllActions ? 'Hide options' : 'More options →'}</Text>
            <Ionicons name={showAllActions ? 'chevron-up' : 'chevron-forward'} size={18} color={COLORS.accent} />
          </Pressable>

          {showAllActions && (
            <View style={styles.section}>
              {REACH_OUT_ACTIONS.map((action) => (
                <Pressable key={action.id} style={styles.actionRow} onPress={() => handleActionPress(action)}>
                  <Text style={styles.actionEmoji}>{action.emoji}</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionDesc}>{action.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  closeBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  toneChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.input ?? 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  toneChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg ?? 'rgba(124,77,255,0.12)' },
  toneChipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  toneChipTextActive: { color: COLORS.accent, fontWeight: '600' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionBtn: { width: '30%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  quickActionEmoji: { fontSize: 28, marginBottom: 8 },
  quickActionLabel: { fontSize: 13, fontWeight: '500', color: COLORS.text, textAlign: 'center' },
  messageCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  messageContext: { fontSize: 12, fontWeight: '600', color: COLORS.accent, marginBottom: 8 },
  messageText: { fontSize: 15, color: COLORS.text, lineHeight: 22, fontStyle: 'italic' },
  copyHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  customInput: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 16, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 80, textAlignVertical: 'top' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.button, paddingVertical: 14, marginTop: 12 },
  sendBtnText: { fontSize: 16, fontWeight: '600', color: '#000' },
  tipsCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  tipItem: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 8 },
  showAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 16 },
  showAllText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  actionEmoji: { fontSize: 24, marginRight: 12 },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  actionDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
});
