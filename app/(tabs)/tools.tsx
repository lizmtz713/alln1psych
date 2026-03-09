/**
 * Tools — Situation-first life navigation.
 * "What do you need help with right now?" → then the right tools.
 * Human OS: decision pathway (understand situation → people → act → support → self).
 */

import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const TOOLS_BY_KEY: Record<string, ToolItem> = Object.fromEntries(TOOLS.map((t) => [t.key, t]));

type SectionId = 'understandSituation' | 'navigatePeople' | 'takeAction' | 'getSupport' | 'understandYourself';

const SECTIONS: { id: SectionId; title: string; toolKeys: string[] }[] = [
  {
    id: 'understandSituation',
    title: 'Understand the Situation',
    toolKeys: ['decode', 'critical', 'replay', 'drift', 'pre-check'],
  },
  {
    id: 'navigatePeople',
    title: 'Navigate People',
    toolKeys: ['relate', 'boundaries', 'difficult', 'flags', 'attachment', 'attraction'],
  },
  {
    id: 'takeAction',
    title: 'Take Action',
    toolKeys: ['resolve', 'roleplay', 'referee', 'reach-out', 'share-insight'],
  },
  {
    id: 'getSupport',
    title: 'Get Support',
    toolKeys: ['help', 'crisis', 'body', 'love'],
  },
  {
    id: 'understandYourself',
    title: 'Understand Yourself',
    toolKeys: ['learning-style', 'awe', 'prompts'],
  },
];

const SITUATIONS: { id: string; label: string; sectionId: SectionId }[] = [
  { id: 'conversation', label: 'A conversation', sectionId: 'understandSituation' },
  { id: 'conflict', label: 'A conflict', sectionId: 'takeAction' },
  { id: 'difficultPerson', label: 'A difficult person', sectionId: 'navigatePeople' },
  { id: 'emotions', label: 'My emotions', sectionId: 'getSupport' },
  { id: 'bigDecision', label: 'A big decision', sectionId: 'understandSituation' },
  { id: 'struggling', label: "I'm struggling", sectionId: 'getSupport' },
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionId, number>>({
    understandSituation: 0,
    navigatePeople: 0,
    takeAction: 0,
    getSupport: 0,
    understandYourself: 0,
  });

  const handleSituationPress = (sectionId: SectionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const y = sectionOffsets[sectionId];
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
  };

  const handleToolPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const onSectionLayout = (sectionId: SectionId) => (e: { nativeEvent: { layout: { y: number } } }) => {
    const { y } = e.nativeEvent.layout;
    setSectionOffsets((prev) => {
      if (prev[sectionId] === y) return prev;
      return { ...prev, [sectionId]: y };
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>How do I handle this situation?</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Situation router */}
        <View style={styles.routerSection}>
          <Text style={styles.routerQuestion}>What do you need help with right now?</Text>
          <View style={styles.situationGrid}>
            {SITUATIONS.map((s) => (
              <Pressable
                key={s.id}
                style={({ pressed }) => [styles.situationChip, pressed && styles.situationChipPressed]}
                onPress={() => handleSituationPress(s.sectionId)}
              >
                <Text style={styles.situationLabel}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sectioned tools */}
        {SECTIONS.map((section) => {
          const items = section.toolKeys
            .map((k) => TOOLS_BY_KEY[k])
            .filter(Boolean);
          if (items.length === 0) return null;
          return (
            <View
              key={section.id}
              style={styles.toolSection}
              onLayout={onSectionLayout(section.id)}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.toolRow}>
                {items.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [styles.toolCard, pressed && styles.toolCardPressed]}
                    onPress={() => handleToolPress(item.route)}
                  >
                    <Text style={styles.toolIcon}>{item.icon}</Text>
                    <Text style={styles.toolLabel} numberOfLines={2}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textMuted },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: SPACING.xl },
  routerSection: {
    marginBottom: 28,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  routerQuestion: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 14,
  },
  situationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  situationChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  situationChipPressed: { opacity: 0.9 },
  situationLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toolSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toolCard: {
    minWidth: 96,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  toolCardPressed: { opacity: 0.9 },
  toolIcon: { fontSize: 26, marginBottom: 6 },
  toolLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});
