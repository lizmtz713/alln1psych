/**
 * Conversation History — list saved conversation summaries; tap to view, share.
 */
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getSummaries = useConversationSummaryStore((s) => s.getSummaries);
  const summaries = getSummaries();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return `Today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const onShare = async (title: string, summary: string, insights: string) => {
    try {
      await Share.share({
        message: `${title}\n\n${summary}${insights ? `\n\nInsights: ${insights}` : ''}`,
        title: 'Conversation with Psych',
      });
    } catch (_) {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Conversation History</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {summaries.length === 0 ? (
          <Text style={styles.empty}>No conversations yet. Chat with Psych to see summaries here.</Text>
        ) : (
          summaries.map((s) => (
            <Pressable
              key={s.id}
              style={styles.row}
              onPress={() => {}}
            >
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle} numberOfLines={1}>{s.title || 'Conversation'}</Text>
                <Text style={styles.rowDate}>{formatDate(s.createdAt)}</Text>
                {s.summary ? <Text style={styles.rowSummary} numberOfLines={2}>{s.summary}</Text> : null}
              </View>
              <Pressable
                style={styles.shareBtn}
                onPress={() => onShare(s.title || 'Conversation', s.summary, s.insights)}
              >
                <Ionicons name="share-outline" size={20} color={COLORS.accent} />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  empty: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 32 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  rowDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  rowSummary: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, lineHeight: 18 },
  shareBtn: { padding: 8 },
});
