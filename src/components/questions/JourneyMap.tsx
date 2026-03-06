/**
 * Life Journey Map — Visualization of the 12 Life Questions as a path.
 * Shows progress (completed nodes) and allows tapping to open a question.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getLifeQuestionsInOrder } from '../../data/lifeQuestions';
import { useLifeQuestionsStore } from '../../stores/lifeQuestionsStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

const NODE_SIZE = 44;
const CONNECTOR_HEIGHT = 24;

export interface JourneyMapProps {
  /** When true, render only the path (no ScrollView, no header). Use inside parent ScrollView. */
  embedded?: boolean;
}

export function JourneyMap({ embedded }: JourneyMapProps) {
  const router = useRouter();
  const questions = getLifeQuestionsInOrder();
  const isCompleted = useLifeQuestionsStore((s) => s.isCompleted);
  const completedCount = useLifeQuestionsStore((s) => s.completedCount());

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/learn/questions/${id}`);
  };

  const pathContent = (
    <>
      <View style={styles.path}>
        {questions.map((q, i) => {
          const done = isCompleted(q.id);
          const isLast = i === questions.length - 1;
          return (
            <React.Fragment key={q.id}>
              <View style={styles.nodeRow}>
                <Pressable
                  style={[styles.node, done && styles.nodeCompleted]}
                  onPress={() => handlePress(q.id)}
                >
                  <Text style={styles.nodeEmoji}>{q.emoji}</Text>
                  {done && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
                <View style={styles.nodeLabel}>
                  <Text style={styles.nodeTitle} numberOfLines={1}>{q.shortTitle}</Text>
                  <Text style={styles.nodeOrder}>Question {q.order}</Text>
                </View>
              </View>
              {!isLast && <View style={styles.connector} />}
            </React.Fragment>
          );
        })}
      </View>
      {!embedded && <Text style={styles.hint}>Tap a node to explore or continue</Text>}
    </>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Life Journey</Text>
          <Text style={styles.subtitle}>{completedCount} of 12 questions completed</Text>
        </View>
        {pathContent}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Life Journey</Text>
        <Text style={styles.subtitle}>{completedCount} of 12 questions completed</Text>
      </View>
      {pathContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textMuted },
  path: { marginLeft: 8 },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCompleted: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  nodeEmoji: { fontSize: 22 },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  nodeLabel: { marginLeft: SPACING.md, flex: 1 },
  nodeTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  nodeOrder: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  connector: {
    width: 2,
    height: CONNECTOR_HEIGHT,
    backgroundColor: COLORS.border,
    marginLeft: NODE_SIZE / 2 - 1,
    marginBottom: 4,
  },
  hint: { marginTop: SPACING.xl, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  embeddedWrap: { paddingHorizontal: SPACING.lg },
});
