import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useContextualLessons, getWhyThisLesson, type SuggestedLesson } from '../hooks/useContextualLessons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  suggestBg: 'rgba(124,77,255,0.08)',
  suggestBorder: 'rgba(124,77,255,0.20)',
};

interface SuggestedLessonCardProps {
  lesson: SuggestedLesson;
  onPress: () => void;
}

function SuggestedLessonCard({ lesson, onPress }: SuggestedLessonCardProps) {
  const [showWhy, setShowWhy] = useState(false);

  const toggleWhy = useCallback((e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowWhy(prev => !prev);
  }, []);

  return (
    <Pressable style={styles.lessonCard} onPress={onPress}>
      <View style={styles.lessonHeader}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{lesson.emoji}</Text>
        </View>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
          <Text style={styles.lessonMeta}>{lesson.duration} min</Text>
        </View>
        <Pressable 
          style={styles.whyButton} 
          onPress={toggleWhy}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={showWhy ? 'help-circle' : 'help-circle-outline"} 
            size={20} 
            color={COLORS.accent} 
          />
        </Pressable>
      </View>
      
      {showWhy && (
        <View style={styles.whySection}>
          <Text style={styles.whyText}>
            {getWhyThisLesson(lesson)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Shows contextually relevant lessons based on current gauge state.
 * Only renders if there are matching lessons.
 */
export function SuggestedLessons() {
  const router = useRouter();
  const suggestedLessons = useContextualLessons();

  const openLesson = useCallback((lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/lesson/${lessonId}`);
  }, [router]);

  // Don't render if no suggestions
  if (suggestedLessons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name=\"sparkles\" size={16} color={COLORS.accent} />
        <Text style={styles.headerText}>Your system suggests</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        {suggestedLessons.map((lesson) => (
          <SuggestedLessonCard
            key={lesson.id}
            lesson={lesson}
            onPress={() => openLesson(lesson.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.suggestBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.suggestBorder,
  },
  headerRow: {
    flexDirection: "row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
  cardsContainer: {
    gap: 10,
  },
  lessonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
  },
  lessonMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  whyButton: {
    padding: 4,
    marginLeft: 8,
  },
  whySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  whyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default SuggestedLessons;
