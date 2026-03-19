/**
 * Tools — Situation-first life navigation.
 * "What do you need help with right now?" → then the right tools.
 * Human OS: decision pathway (understand situation → people → act → support → self).
 */

import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../src/lib/constants';

type ToolItem = { key: string; label: string; icon: string; route: string };

const TOOLS: ToolItem[] = [
  // Understand the situation
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode' },
  { key: 'critical', label: 'Think', icon: '🧠', route: '/(modals)/critical-thinking' },
  { key: 'replay', label: 'Replay', icon: '🔄', route: '/(modals)/replay' },
  { key: 'drift', label: 'Drift', icon: '📐', route: '/(modals)/drift-detector' },
  { key: 'pre-check', label: 'Pre-Check', icon: '✅', route: '/(modals)/pre-conversation-check' },
  // Relationship repair MVP + signature tool
  { key: 'conversation-builder', label: 'Conversation Builder', icon: '💬', route: '/tools/conversation-builder' },
  { key: 'repair', label: 'Repair Builder', icon: '🔧', route: '/tools/repair' },
  { key: 'tone-check', label: 'Tone Check', icon: '🎯', route: '/tools/tone-check' },
  { key: 'after-fight', label: 'After the Fight', icon: '💬', route: '/tools/after-fight' },
  // Navigate people
  { key: 'relate', label: 'Relate', icon: '💬', route: '/(modals)/relate' },
  { key: 'boundaries', label: 'Boundaries', icon: '🚧', route: '/(modals)/boundaries' },
  { key: 'difficult', label: 'Difficult People', icon: '👤', route: '/(modals)/difficult-people' },
  { key: 'flags', label: 'Flags', icon: '🚩', route: '/(modals)/red-green-flags' },
  { key: 'human-roles', label: 'Human Roles', icon: '📖', route: '/tools/human-roles' },
  { key: 'family-conflict', label: 'Family Conflict', icon: '🏠', route: '/tools/family-conflict' },
  { key: 'parent-compass', label: 'Parent Compass', icon: '🧭', route: '/tools/parent-compass' },
  { key: 'memory-builder', label: 'Memory Builder', icon: '🧠', route: '/tools/memory-builder' },
  { key: 'perspective-translator', label: 'Perspective Translator', icon: '🔄', route: '/tools/perspective-translator' },
  { key: 'attachment', label: 'Attachment', icon: '🌳', route: '/(modals)/attachment-style' },
  { key: 'attraction', label: 'Attraction', icon: '💫', route: '/(modals)/attraction' },
  // Take action
  { key: 'resolve', label: 'Resolve', icon: '🤝', route: '/(modals)/resolve' },
  { key: 'roleplay', label: 'Role Play', icon: '🎭', route: '/(modals)/role-play' },
  { key: 'referee', label: 'Referee', icon: '⚖️', route: '/(modals)/referee' },
  { key: 'relationship-repair', label: 'Relationship Repair', icon: '🤝', route: '/tools/relationship-repair' },
  { key: 'relational-bridge', label: 'Relational Bridge', icon: '🌉', route: '/tools/relational-bridge' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/tools/reach-out' },
  { key: 'share-insight', label: 'Share Insight', icon: '💡', route: '/(modals)/share-insight' },
  // Get support
  { key: 'help', label: 'Help', icon: '🆘', route: '/tools/help-someone' },
  { key: 'crisis', label: 'Crisis', icon: '🆘', route: '/(modals)/crisis-resources' },
  { key: 'body', label: 'Body', icon: '🫀', route: '/foundation/body' },
  { key: 'body-maintenance', label: 'Body Maintenance', icon: '🔧', route: '/(modals)/body-maintenance' },
  { key: 'love', label: 'Love', icon: '❤️', route: '/(modals)/love' },
  // Understand yourself
  { key: 'self-discovery', label: 'Self-Discovery', icon: '🔬', route: '/learn/self-discovery' },
  { key: 'learning-style', label: 'Learning Style', icon: '📚', route: '/(modals)/learning-style-quiz' },
  { key: 'awe', label: 'Awe', icon: '🌟', route: '/(modals)/awe-activities' },
  { key: 'prompts', label: 'Prompts', icon: '✨', route: '/(modals)/prompt-generator' },
  // Life tools
  { key: 'decision', label: 'Decision', icon: '🔀', route: '/tools/decision' },
  { key: 'bias-check', label: 'Bias Check', icon: '🧠', route: '/tools/bias-check' },
  { key: 'quick-reset', label: 'Quick Reset', icon: '🌬️', route: '/tools/quick-reset' },
  { key: 'focus', label: 'Focus', icon: '⏱️', route: '/tools/focus' },
  { key: 'creativity', label: 'Creativity', icon: '✨', route: '/tools/creativity' },
  { key: 'win-capture', label: 'Win capture', icon: '🏆', route: '/tools/win-capture' },
  { key: 'life-direction-finder', label: 'Life Direction Finder', icon: '🧭', route: '/tools/life-direction-finder' },
];

const TOOLS_BY_KEY: Record<string, ToolItem> = Object.fromEntries(TOOLS.map((t) => [t.key, t]));

/** Minimal ship set: 7 Core Human Tools (see docs/CORE-HUMAN-TOOLS.md) */
const ESSENTIAL_7: ToolItem[] = [
  { key: 'quick-reset', label: 'Quick Reset', icon: '🌬️', route: '/tools/quick-reset' },
  { key: 'reflect', label: 'Check in', icon: '📋', route: '/(modals)/cockpit-checkin' },
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode' },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/tools/reach-out' },
  { key: 'prioritize', label: 'Prioritize', icon: '🎯', route: '/profile/goals' },
  { key: 'rituals', label: 'Rituals', icon: '☀️', route: '/flight-log' },
  { key: 'crisis', label: 'Crisis', icon: '🆘', route: '/(modals)/crisis-resources' },
];

type SectionId = 'relationshipRepairMVP' | 'understandSituation' | 'navigatePeople' | 'takeAction' | 'getSupport' | 'understandYourself' | 'lifeTools';

const SECTIONS: { id: SectionId; title: string; toolKeys: string[] }[] = [
  {
    id: 'relationshipRepairMVP',
    title: 'Relationship repair',
    toolKeys: ['conversation-builder', 'repair', 'tone-check', 'roleplay', 'after-fight'],
  },
  {
    id: 'understandSituation',
    title: 'Understand the Situation',
    toolKeys: ['decode', 'critical', 'replay', 'drift', 'pre-check'],
  },
  {
    id: 'navigatePeople',
    title: 'Navigate People',
    toolKeys: ['tone-check', 'relate', 'boundaries', 'difficult', 'flags', 'human-roles', 'family-conflict', 'parent-compass', 'memory-builder', 'perspective-translator', 'relational-bridge', 'attachment', 'attraction'],
  },
  {
    id: 'takeAction',
    title: 'Take Action',
    toolKeys: ['resolve', 'roleplay', 'referee', 'relationship-repair', 'relational-bridge', 'reach-out', 'tone-check', 'share-insight'],
  },
  {
    id: 'getSupport',
    title: 'Get Support',
    toolKeys: ['help', 'crisis', 'body', 'body-maintenance', 'love'],
  },
  {
    id: 'understandYourself',
    title: 'Understand Yourself',
    toolKeys: ['self-discovery', 'learning-style', 'awe', 'prompts'],
  },
  {
    id: 'lifeTools',
    title: 'Life tools',
    toolKeys: ['decision', 'bias-check', 'quick-reset', 'focus', 'creativity', 'win-capture', 'life-direction-finder'],
  },
];

const SITUATIONS: { id: string; label: string; sectionId: SectionId }[] = [
  { id: 'conversation', label: 'A conversation', sectionId: 'understandSituation' },
  { id: 'conflict', label: 'A conflict', sectionId: 'takeAction' },
  { id: 'difficultPerson', label: 'A difficult person', sectionId: 'navigatePeople' },
  { id: 'emotions', label: 'My emotions', sectionId: 'getSupport' },
  { id: 'bigDecision', label: 'A big decision', sectionId: 'lifeTools' },
  { id: 'struggling', label: "I'm struggling", sectionId: 'getSupport' },
];

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionId, number>>({
    relationshipRepairMVP: 0,
    understandSituation: 0,
    navigatePeople: 0,
    takeAction: 0,
    getSupport: 0,
    understandYourself: 0,
    lifeTools: 0,
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
        {/* Essential 7 — minimal tool set (see docs/CORE-HUMAN-TOOLS.md) */}
        <View style={styles.essentialSection}>
          <Text style={styles.essentialTitle}>Essential</Text>
          <Text style={styles.essentialSubtitle}>Reset, reflect, decide, connect, structure, crisis.</Text>
          <View style={styles.toolRow}>
            {ESSENTIAL_7.map((item) => (
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

        {/* Family Fleet & Communication — telemetry entry points */}
        <View style={styles.familyFleetSection}>
          <Text style={styles.familyFleetSectionTitle}>FAMILY FLEET & COMMUNICATION</Text>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardCyan, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/tools/role-play')}
          >
            <Text style={styles.familyFleetCardIcon}>🎭</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Role Play: Conflict Simulator</Text>
              <Text style={styles.familyFleetCardSubtitle}>Practice InGauge optimization protocols.</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardAmber, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/mind-mail/maintenance-ticket')}
          >
            <Text style={styles.familyFleetCardIcon}>🛠️</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Submit Maintenance Ticket</Text>
              <Text style={styles.familyFleetCardSubtitle}>Request asynchronous system support (Low-RPM).</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardCyan, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/tools/behavior-translator')}
          >
            <Text style={styles.familyFleetCardIcon}>📖</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Behavior Translator</Text>
              <Text style={styles.familyFleetCardSubtitle}>Decode surface behavior into systemic data.</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardCyan, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/tools/post-flight-logger')}
          >
            <Text style={styles.familyFleetCardIcon}>📋</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Post-Flight Debrief</Text>
              <Text style={styles.familyFleetCardSubtitle}>Log daily odometer and system reflections.</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardAmber, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/tools/collision-report')}
          >
            <Text style={styles.familyFleetCardIcon}>📄</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Collision Report</Text>
              <Text style={styles.familyFleetCardSubtitle}>Post-fight repair without shame.</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.familyFleetCard, styles.familyFleetCardCyan, pressed && styles.familyFleetCardPressed]}
            onPress={() => handleToolPress('/tools/flight-plan')}
          >
            <Text style={styles.familyFleetCardIcon}>📋</Text>
            <View style={styles.familyFleetCardBody}>
              <Text style={styles.familyFleetCardTitle}>Flight Plan</Text>
              <Text style={styles.familyFleetCardSubtitle}>Break overwhelming tasks into micro-steps.</Text>
            </View>
            <Text style={styles.familyFleetCardArrow}>→</Text>
          </Pressable>
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
  essentialSection: { marginBottom: 24 },
  essentialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  essentialSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
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
  // Family Fleet & Communication — telemetry entry points
  familyFleetSection: { marginBottom: 24, paddingHorizontal: 4 },
  familyFleetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  familyFleetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  familyFleetCardCyan: { borderColor: '#06b6d4' },
  familyFleetCardAmber: { borderColor: '#f59e0b' },
  familyFleetCardPressed: { opacity: 0.88 },
  familyFleetCardIcon: { fontSize: 24, marginRight: 12 },
  familyFleetCardBody: { flex: 1 },
  familyFleetCardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  familyFleetCardSubtitle: { fontSize: 13, color: COLORS.textMuted },
  familyFleetCardArrow: { fontSize: 18, fontWeight: '600', color: COLORS.textMuted, marginLeft: 8 },
});
