/**
 * Heart Inbox — View all incoming heart messages
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHeartInboxStore } from '../../src/stores/heartInboxStore';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';

export default function HeartInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, fetchMessages } = useHeartInboxStore();

  useEffect(() => {
    fetchMessages();
  }, []);

  const unread = messages.filter(m => !m.read);
  const read = messages.filter(m => m.read);

  const renderMessage = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, !item.read && styles.unread]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/(modals)/heart-mail-detail', params: { id: item.id } });
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.fromName}>
          {item.type === 'anonymous' ? 'Someone in your Circle' : item.from_name}
        </Text>
        {!item.read && <View style={styles.dot} />}
      </View>
      <Text style={styles.preview} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.time}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Heart Inbox</Text>
        <View style={{ width: 28 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="mail-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            When someone sends you a Heart Note, it'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...unread, ...read]}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fromName: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  preview: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  time: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});
