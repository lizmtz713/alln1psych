/**
 * Heart Notes Screen — My notes to others
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useHeartNotesStore, type HeartNote, type NoteStatus } from '../../stores/heartNotesStore';
import { format } from 'date-fns';

const NOTE_TYPE_EMOJI: Record<string, string> = {
  general: '💜',
  gratitude: '✨',
  concern: '💭',
  apology: '🙏',
  forgiveness: '🕊️',
  boundary: '🚧',
  grief: '💔',
  encouragement: '🌟',
};

const STATUS_COLORS: Record<NoteStatus, string> = {
  draft: '#6B7280',
  private: '#8B5CF6',
  ready: '#3B82F6',
  pending: '#F59E0B',
  shared: '#10B981',
  declined: '#EF4444',
  archived: '#374151',
};

const STATUS_LABELS: Record<NoteStatus, string> = {
  draft: 'Draft',
  private: 'Private',
  ready: 'Ready to send',
  pending: 'Waiting...',
  shared: 'Shared',
  declined: 'Declined',
  archived: 'Archived',
};

function NoteCard({ note, onPress }: { note: HeartNote; onPress: () => void }) {
  const emoji = NOTE_TYPE_EMOJI[note.noteType] || '💜';
  const statusColor = STATUS_COLORS[note.status];
  const statusLabel = STATUS_LABELS[note.status];
  const preview = note.content.slice(0, 80) + (note.content.length > 80 ? '...' : '');
  const date = format(new Date(note.updatedAt), 'MMM d');

  return (
    <TouchableOpacity style={styles.noteCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.noteHeader}>
        <View style={styles.noteRecipient}>
          <Text style={styles.noteEmoji}>{emoji}</Text>
          <Text style={styles.recipientName}>To: {note.recipientName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      
      <Text style={styles.notePreview} numberOfLines={2}>{preview}</Text>
      
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>{date}</Text>
        {note.sendType === 'anonymous' && (
          <View style={styles.anonymousBadge}>
            <Ionicons name="eye-off" size={12} color="#EC4899" />
            <Text style={styles.anonymousText}>Anonymous</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HeartNotesScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { notes, loading, loadNotes } = useHeartNotesStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const activeNotes = notes.filter(n => n.status !== 'archived');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Heart Notes</Text>
        <TouchableOpacity
          style={styles.inboxButton}
          onPress={() => navigation.navigate('HeartInbox')}
        >
          <Ionicons name="mail" size={24} color="#EC4899" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Write to anyone. Send when ready. Or never.
      </Text>

      <FlatList
        data={activeNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => navigation.navigate('HeartNoteDetail", { noteId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor=\"#fff\" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💜</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyText}>
              Write something you've been wanting to say
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("HeartNoteComposer')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeBtn: { padding: 8 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  inboxButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteEmoji: {
    fontSize: 18,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notePreview: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonymousText: {
    fontSize: 12,
    color: '#EC4899',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
