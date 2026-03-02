/**
 * Heart Compose Modal
 * Write and send Heart Mail to Circle members
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useHeartNotesStore, type NoteType, type SendType } from '../../src/stores/heartNotesStore';
import { useCircleStore } from '../../src/stores/circleStore';

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
  green: '#4ADE80',
  amber: '#F59E0B',
};

const NOTE_TYPES: Array<{ id: NoteType; emoji: string; label: string; desc: string }> = [
  { id: 'general', emoji: '💌', label: 'Message', desc: 'General love note' },
  { id: 'gratitude', emoji: '🙏', label: 'Gratitude', desc: 'Express appreciation' },
  { id: 'encouragement', emoji: '✨', label: 'Encouragement', desc: 'Lift them up' },
  { id: 'concern', emoji: '💭', label: 'Concern', desc: 'Share a worry' },
  { id: 'apology', emoji: '🤝', label: 'Apology', desc: 'Make amends' },
  { id: 'forgiveness', emoji: '💜', label: 'Forgiveness', desc: 'Let them know' },
];

const SEND_TYPES: Array<{ id: SendType; icon: string; label: string; desc: string }> = [
  { id: 'open', icon: 'person', label: 'Open', desc: 'They see who sent it' },
  { id: 'anonymous', icon: 'eye-off', label: 'Anonymous', desc: "They know it's from their Circle, but not who" },
  { id: 'soft', icon: 'hand-right', label: 'Soft Share', desc: 'They accept before seeing the message' },
];

export default function HeartComposeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ recipientId?: string; recipientName?: string; draftId?: string }>();
  
  const { members } = useCircleStore();
  const { createNote, updateNote, sendNote, notes } = useHeartNotesStore();
  
  const [recipientId, setRecipientId] = useState(params.recipientId || '');
  const [recipientName, setRecipientName] = useState(params.recipientName || '');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [sendType, setSendType] = useState<SendType>('open');
  const [showRecipientPicker, setShowRecipientPicker] = useState(!params.recipientId);
  const [saving, setSaving] = useState(false);
  
  // Load draft if provided
  useEffect(() => {
    if (params.draftId) {
      const draft = notes.find((n) => n.id === params.draftId);
      if (draft) {
        setRecipientId(draft.recipientId || '');
        setRecipientName(draft.recipientName);
        setContent(draft.content);
        setNoteType(draft.noteType);
        setSendType(draft.sendType || 'open');
        setShowRecipientPicker(false);
      }
    }
  }, [params.draftId]);
  
  const handleSelectRecipient = (member: typeof members[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecipientId(member.id);
    setRecipientName(member.name);
    setShowRecipientPicker(false);
  };
  
  const handleSaveDraft = async () => {
    if (!recipientName || !content.trim()) {
      Alert.alert('Missing info', 'Please select a recipient and write a message.');
      return;
    }
    
    setSaving(true);
    try {
      if (params.draftId) {
        await updateNote(params.draftId, {
          recipientName,
          recipientId: recipientId || undefined,
          content: content.trim(),
          noteType,
          sendType,
        });
      } else {
        await createNote({
          recipientName,
          recipientId: recipientId || undefined,
          recipientType: recipientId ? 'circle' : 'external',
          content: content.trim(),
          noteType,
          sendType,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSend = async () => {
    if (!recipientName || !content.trim()) {
      Alert.alert('Missing info', 'Please select a recipient and write a message.');
      return;
    }
    
    setSaving(true);
    try {
      let noteId = params.draftId;
      
      if (!noteId) {
        const note = await createNote({
          recipientName,
          recipientId: recipientId || undefined,
          recipientType: recipientId ? 'circle' : 'external',
          content: content.trim(),
          noteType,
          sendType,
        });
        noteId = note?.id;
      } else {
        await updateNote(noteId, {
          recipientName,
          recipientId: recipientId || undefined,
          content: content.trim(),
          noteType,
          sendType,
        });
      }
      
      if (noteId) {
        await sendNote(noteId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Sent! 💌',
          sendType === 'soft'
            ? `${recipientName} will be notified. They can accept when ready.`
            : sendType === 'anonymous'
            ? `Your message was sent anonymously to ${recipientName}.`
            : `Your message was sent to ${recipientName}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not send message. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>New Heart Mail</Text>
          <Pressable
            onPress={handleSaveDraft}
            style={styles.saveButton}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
        </View>
        
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Recipient */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>To</Text>
            {showRecipientPicker ? (
              <View style={styles.recipientPicker}>
                {members.length === 0 ? (
                  <Text style={styles.emptyText}>No Circle members yet. Add someone first!</Text>
                ) : (
                  members.map((member) => (
                    <Pressable
                      key={member.id}
                      style={styles.recipientOption}
                      onPress={() => handleSelectRecipient(member)}
                    >
                      <Text style={styles.recipientName}>{member.name}</Text>
                      <Text style={styles.recipientRel}>{member.relationship}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : (
              <Pressable
                style={styles.recipientSelected}
                onPress={() => setShowRecipientPicker(true)}
              >
                <Text style={styles.recipientSelectedText}>{recipientName}</Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
              </Pressable>
            )}
          </View>
          
          {/* Note Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Type of message</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeRow}>
                {NOTE_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[styles.typeChip, noteType === type.id && styles.typeChipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNoteType(type.id);
                    }}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text style={[styles.typeLabel, noteType === type.id && styles.typeLabelActive]}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder={`Write to ${recipientName || 'them'}...`}
              placeholderTextColor={COLORS.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length}/2000</Text>
          </View>
          
          {/* Send Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How to send</Text>
            {SEND_TYPES.map((type) => (
              <Pressable
                key={type.id}
                style={[styles.sendTypeCard, sendType === type.id && styles.sendTypeCardActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSendType(type.id);
                }}
              >
                <View style={[styles.sendTypeIcon, sendType === type.id && styles.sendTypeIconActive]}>
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={sendType === type.id ? COLORS.pink : COLORS.textMuted}
                  />
                </View>
                <View style={styles.sendTypeText}>
                  <Text style={[styles.sendTypeLabel, sendType === type.id && styles.sendTypeLabelActive]}>
                    {type.label}
                  </Text>
                  <Text style={styles.sendTypeDesc}>{type.desc}</Text>
                </View>
                {sendType === type.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.pink} />
                )}
              </Pressable>
            ))}
          </View>
          
          {/* Hint for anonymous */}
          {sendType === 'anonymous' && (
            <View style={styles.hintCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.amber} />
              <Text style={styles.hintText}>
                Anonymous messages can help share hard truths without fear of judgment. They'll know someone in their Circle cares.
              </Text>
            </View>
          )}
          
          {/* Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* Send Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={[styles.sendButton, (!content.trim() || !recipientName) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={saving || !content.trim() || !recipientName}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>
              {saving ? 'Sending...' : `Send ${sendType === 'anonymous' ? 'Anonymously' : ''}`}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.accent,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientPicker: {
    gap: 8,
  },
  recipientOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  recipientRel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  recipientSelected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.pink + '44',
  },
  recipientSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pink,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    backgroundColor: COLORS.pinkSoft,
    borderColor: COLORS.pink + '44',
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  typeLabelActive: {
    color: COLORS.pink,
  },
  messageInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  sendTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendTypeCardActive: {
    borderColor: COLORS.pink + '44',
    backgroundColor: 'rgba(236,72,153,0.05)',
  },
  sendTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sendTypeIconActive: {
    backgroundColor: COLORS.pinkSoft,
  },
  sendTypeText: {
    flex: 1,
  },
  sendTypeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  sendTypeLabelActive: {
    color: COLORS.text,
  },
  sendTypeDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.amber,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.pink,
    paddingVertical: 16,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
