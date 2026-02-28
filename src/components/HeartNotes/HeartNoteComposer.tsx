/**
 * Heart Note Composer — Write a note to someone
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHeartNotesStore, type NoteType } from '../../stores/heartNotesStore';
import { clarifyNote, getWritingPrompts, rephraseNote } from '../../services/heartNotesAI';

const NOTE_TYPES: { type: NoteType; emoji: string; label: string }[] = [
  { type: 'general', emoji: '💜', label: 'General' },
  { type: 'gratitude', emoji: '✨', label: 'Gratitude' },
  { type: 'concern', emoji: '💭', label: 'Concern' },
  { type: 'apology', emoji: '🙏', label: 'Apology' },
  { type: 'forgiveness', emoji: '🕊️', label: 'Forgiveness' },
  { type: 'boundary', emoji: '🚧', label: 'Boundary' },
  { type: 'grief', emoji: '💔', label: 'Grief' },
  { type: 'encouragement', emoji: '🌟', label: 'Encouragement' },
];

export default function HeartNoteComposer() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { createNote, updateNote } = useHeartNotesStore();

  const existingNoteId = route.params?.noteId;
  const existingNote = route.params?.note;

  const [recipientName, setRecipientName] = useState(existingNote?.recipientName || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(existingNote?.noteType || 'general');
  const [saving, setSaving] = useState(false);
  const [aiHelping, setAiHelping] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    setPrompts(getWritingPrompts(noteType));
  }, [noteType]);

  const handleSave = async (status: 'draft' | 'private' | 'ready') => {
    if (!recipientName.trim()) {
      Alert.alert('Who is this for?', 'Please enter a recipient name.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Write something', 'Your note is empty.');
      return;
    }

    setSaving(true);
    try {
      if (existingNoteId) {
        await updateNote(existingNoteId, {
          recipientName: recipientName.trim(),
          content: content.trim(),
          noteType,
          status,
        });
      } else {
        await createNote({
          recipientName: recipientName.trim(),
          recipientType: 'external',
          content: content.trim(),
          noteType,
          status,
        });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAIClarify = async () => {
    if (!content.trim()) {
      Alert.alert('Write something first', 'Add some content for AI to help with.');
      return;
    }

    setAiHelping(true);
    try {
      const result = await clarifyNote(content, recipientName || 'them', noteType);
      Alert.alert(
        'Core Message',
        `${result.coreMessage}\n\nEmotion: ${result.emotion}\n\nSuggestions:\n${result.suggestions.map(s => `• ${s}`).join('\n')}`,
        [{ text: 'Got it' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to get AI help. Please try again.');
    } finally {
      setAiHelping(false);
    }
  };

  const handleRephrase = async (adjustment: 'softer' | 'clearer' | 'shorter') => {
    if (!content.trim()) return;

    setAiHelping(true);
    try {
      const rephrased = await rephraseNote(content, recipientName || 'them', adjustment);
      Alert.alert(
        `${adjustment.charAt(0).toUpperCase() + adjustment.slice(1)} Version`,
        rephrased,
        [
          { text: 'Keep Original', style: 'cancel' },
          { text: 'Use This', onPress: () => setContent(rephrased) },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to rephrase. Please try again.');
    } finally {
      setAiHelping(false);
    }
  };

  const selectedType = NOTE_TYPES.find(t => t.type === noteType) || NOTE_TYPES[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Heart Note</Text>
          <TouchableOpacity
            onPress={() => handleSave('draft')}
            disabled={saving}
            style={styles.saveButton}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#EC4899" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {/* Recipient */}
          <View style={styles.section}>
            <Text style={styles.label}>To</Text>
            <TextInput
              style={styles.recipientInput}
              placeholder="Name or description (e.g., 'Dad', 'My ex')"
              placeholderTextColor="#6B7280"
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          {/* Note Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <Text style={styles.typeEmoji}>{selectedType.emoji}</Text>
              <Text style={styles.typeLabel}>{selectedType.label}</Text>
              <Ionicons
                name={showTypeSelector ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            {showTypeSelector && (
              <View style={styles.typeGrid}>
                {NOTE_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeOption,
                      noteType === type.type && styles.typeOptionSelected,
                    ]}
                    onPress={() => {
                      setNoteType(type.type);
                      setShowTypeSelector(false);
                    }}
                  >
                    <Text style={styles.typeOptionEmoji}>{type.emoji}</Text>
                    <Text style={styles.typeOptionLabel}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Writing Prompts */}
          {!content && (
            <View style={styles.promptsSection}>
              <Text style={styles.promptsLabel}>Start with...</Text>
              {prompts.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.promptChip}
                  onPress={() => setContent(prompt + ' ')}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.label}>Your message</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="What do you want them to know?"
              placeholderTextColor="#6B7280"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* AI Help */}
          {content.length > 20 && (
            <View style={styles.aiSection}>
              <Text style={styles.aiLabel}>AI Help</Text>
              <View style={styles.aiButtons}>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={handleAIClarify}
                  disabled={aiHelping}
                >
                  <Ionicons name="bulb-outline" size={18} color="#8B5CF6" />
                  <Text style={styles.aiButtonText}>Clarify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => handleRephrase('softer')}
                  disabled={aiHelping}
                >
                  <Ionicons name="heart-outline" size={18} color="#EC4899" />
                  <Text style={styles.aiButtonText}>Softer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => handleRephrase('shorter')}
                  disabled={aiHelping}
                >
                  <Ionicons name="resize-outline" size={18} color="#10B981" />
                  <Text style={styles.aiButtonText}>Shorter</Text>
                </TouchableOpacity>
              </View>
              {aiHelping && (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={styles.aiLoadingText}>AI is thinking...</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSave('private')}
              disabled={saving}
            >
              <Ionicons name="lock-closed" size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Keep Private</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => handleSave('ready')}
              disabled={saving}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Ready to Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
  },
  typeOptionEmoji: {
    fontSize: 14,
  },
  typeOptionLabel: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  promptsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  promptsLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  promptChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#C4B5FD',
    fontStyle: 'italic',
  },
  contentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  aiSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  aiButtonText: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  aiLoadingText: {
    fontSize: 13,
    color: '#8B5CF6',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonPrimary: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  actionTextPrimary: {
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
