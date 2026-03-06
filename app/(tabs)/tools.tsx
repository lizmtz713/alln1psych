/**
 * Tools — Life problem solving.
 * "How do I handle this situation?"
 * Human OS tab: 27+ tools (Decode, Resolve, Role Play, Relate, Boundaries, etc.)
 */

import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/lib/constants';

type ToolItem = { key: string; label: string; icon: string; route: string };

const TOOLS: ToolItem[] = [
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode' },
  { key: 'resolve', label: 'Resolve', icon: '🤝', route: '/(modals)/resolve' },
  { key: 'roleplay', label: 'Role Play', icon: '🎭', route: '/(modals)/role-play' },
  { key: 'referee', label: 'Referee', icon: '⚖️', route: '/(modals)/referee' },
  { key: 'replay', label: 'Replay', icon: '🔄', route: '/(modals)/replay' },
  { key: 'relate', label: 'Relate', icon: '💬', route: '/(modals)/relate' },
  { key: 'prompts', label: 'Prompts', icon: '✨', route: '/(modals)/prompt-generator' },
  { key: 'love', label: 'Love', icon: '❤️', route: '/(modals)/love' },
  { key: 'help', label: 'Help', icon: '🆘', route: '/(modals)/help-someone' },
  { key: 'attraction', label: 'Attraction', icon: '💫', route: '/(modals)/attraction' },
  { key: 'attachment', label: 'Attachment', icon: '🌳', route: '/(modals)/attachment-style' },
  { key: 'boundaries', label: 'Boundaries', icon: '🚧', route: '/(modals)/boundaries' },
  { key: 'difficult', label: 'Difficult People', icon: '👤', route: '/(modals)/difficult-people' },
  { key: 'flags', label: 'Flags', icon: '🚩', route: '/(modals)/red-green-flags' },
  { key: 'critical', label: 'Think', icon: '🧠', route: '/(modals)/critical-thinking' },
  { key: 'body', label: 'Body', icon: '🫀', route: '/(modals)/foundation-body' },
  { key: 'pre-check', label: 'Pre-Check', icon: '✅', route: '/(modals)/pre-conversation-check' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/(modals)/reach-out-scaffold' },
  { key: 'share-insight', label: 'Share Insight', icon: '💡', route: '/(modals)/share-insight' },
  { key: 'drift', label: 'Drift', icon: '📐', route: '/(modals)/drift-detector' },
  { key: 'awe', label: 'Awe', icon: '🌟', route: '/(modals)/awe-activities' },
  { key: 'crisis', label: 'Crisis', icon: '🆘', route: '/(modals)/crisis-resources' },
  { key: 'learning-style', label: 'Learning Style', icon: '📚', route: '/(modals)/learning-style-quiz' },
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>How do I handle this situation?</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {TOOLS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.toolCard, pressed && styles.toolCardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <Text style={styles.toolIcon}>{item.icon}</Text>
              <Text style={styles.toolLabel} numberOfLines={2}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textMuted },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  toolCardPressed: { opacity: 0.9 },
  toolIcon: { fontSize: 28, marginBottom: 6 },
  toolLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});
