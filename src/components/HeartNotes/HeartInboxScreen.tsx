/**
 * Heart Inbox Screen — Mail I've received
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHeartNotesStore, type HeartMail } from '../../stores/heartNotesStore';
import { format, formatDistanceToNow } from 'date-fns';

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

function MailCard({ mail, onOpen }: { mail: HeartMail; onOpen: () => void }) {
  const emoji = NOTE_TYPE_EMOJI[mail.noteType] || '💜';
  const isUnread = mail.status === 'pending';
  const timeAgo = formatDistanceToNow(new Date(mail.createdAt), { addSuffix: true });
  
  const senderDisplay = mail.isAnonymous
    ? 'Someone in your Circle'
    : mail.senderName || 'Someone';

  const preview = mail.content.slice(0, 100) + (mail.content.length > 100 ? '...' : '');

  return (
    <TouchableOpacity
      style={[styles.mailCard, isUnread && styles.mailCardUnread]}
      onPress={onOpen}
      activeOpacity={0.7}
    >
      <View style={styles.mailHeader}>
        <View style={styles.senderRow}>
          {mail.isAnonymous ? (
            <View style={styles.anonymousIcon}>
              <Ionicons name="heart" size={20} color="#EC4899" />
            </View>
          ) : (
            <View style={styles.senderIcon}>
              <Text style={styles.senderInitial}>
                {(mail.senderName || 'S')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{senderDisplay}</Text>
            <Text style={styles.mailTime}>{timeAgo}</Text>
          </View>
        </View>
        
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      {mail.isAnonymous && (
        <View style={styles.anonymousBanner}>
          <Ionicons name="eye-off" size={14} color="#EC4899" />
          <Text style={styles.anonymousText}>Anonymous Heart Mail</Text>
        </View>
      )}

      <Text style={styles.mailPreview} numberOfLines={3}>{preview}</Text>

      <View style={styles.mailFooter}>
        <Text style={styles.mailEmoji}>{emoji}</Text>
        {mail.response && (
          <View style={styles.respondedBadge}>
            <Ionicons name="chatbubble" size={12} color="#10B981" />
            <Text style={styles.respondedText}>Responded</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HeartInboxScreen() {
  const navigation = useNavigation<any>();
  const { inbox, inboxLoading, unreadCount, loadInbox, thankCircle } = useHeartNotesStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInbox();
    setRefreshing(false);
  };

  const handleThankCircle = () => {
    Alert.alert(
      'Thank Your Circle',
      'Send gratitude to everyone in your Circle. No one will know who sent the anonymous message.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Thank Them 💜',
          onPress: async () => {
            await thankCircle();
            Alert.alert('Sent!', 'Your Circle will know someone appreciated their care.');
          },
        },
      ]
    );
  };

  const activeMail = inbox.filter(m => m.status !== 'archived');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Heart Inbox</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleThankCircle} style={styles.thankButton}>
          <Ionicons name="heart" size={20} color="#EC4899" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Messages from people who care about you
      </Text>

      <FlatList
        data={activeMail}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MailCard
            mail={item}
            onOpen={() => navigation.navigate('HeartMailDetail', { mailId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No Heart Mail yet</Text>
            <Text style={styles.emptyText}>
              When someone in your Circle sends you something, it'll appear here
            </Text>
          </View>
        }
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  unreadBadge: {
    backgroundColor: '#EC4899',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thankButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mailCardUnread: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  mailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  anonymousIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  senderInfo: {
    gap: 2,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  mailTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EC4899',
  },
  anonymousBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  anonymousText: {
    fontSize: 12,
    color: '#EC4899',
    fontWeight: '500',
  },
  mailPreview: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  mailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  mailEmoji: {
    fontSize: 16,
  },
  respondedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  respondedText: {
    fontSize: 12,
    color: '#10B981',
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
    paddingHorizontal: 40,
  },
});
