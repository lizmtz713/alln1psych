/**
 * Just-in-Time Learning Card
 * Displays contextual lesson suggestions based on gauge state
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type JustInTimeLesson, markLessonShown } from '../services/justInTimeLearning';
import * as Haptics from 'expo-haptics';

interface Props {
  lesson: JustInTimeLesson;
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

export default function JustInTimeCard({ lesson, onDismiss }: Props) {
  const router = useRouter();

  const urgencyColors = {
    gentle: '#4CAF50',
    timely: '#FF9800',
    important: '#F44336',
  };

  const urgencyLabels = {
    gentle: 'Suggestion',
    timely: 'Timely',
    important: 'Important',
  };

  const handleOpenLesson = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markLessonShown(lesson.lessonId);
    router.push(`/lesson/${lesson.lessonId}`);
    onDismiss?.();
  };

  const handleOpenTool = async () => {
    if (!lesson.operateTool) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markLessonShown(lesson.lessonId);
    
    const toolRoutes: Record<string, string> = {
      'quick-reset': '/(modals)/quick-reset',
      'replay': '/(modals)/replay',
      'relate': '/(modals)/relate',
      'journal': '/(modals)/new-journal',
      'role-play': '/(modals)/role-play',
      'patterns': '/(modals)/patterns',
    };
    
    const route = toolRoutes[lesson.operateTool];
    if (route) {
      router.push(route as any);
    }
    onDismiss?.();
  };

  const handleDismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markLessonShown(lesson.lessonId);
    onDismiss?.();
  };

  return (
    <View style={[styles.container, { borderLeftColor: urgencyColors[lesson.urgency] }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{lesson.emoji}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{lesson.title}</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: urgencyColors[lesson.urgency] + '22' }]}>
              <Text style={[styles.urgencyText, { color: urgencyColors[lesson.urgency] }]}>
                {urgencyLabels[lesson.urgency]}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Reason */}
      <Text style={styles.reason}>{lesson.reason}</Text>

      {/* Observe & Orient (collapsed by default, expandable) */}
      <View style={styles.insightBox}>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>👁️ Observe:</Text>
          <Text style={styles.insightText}>{lesson.observeNote}</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>🧭 Orient:</Text>
          <Text style={styles.insightText}>{lesson.orientNote}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenLesson}>
          <Ionicons name="book-outline" size={16} color="#FFF" />
          <Text style={styles.primaryButtonText}>Learn More</Text>
        </TouchableOpacity>
        
        {lesson.operateTool && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenTool}>
            <Ionicons name="flash-outline" size={16} color="#7C4DFF" />
            <Text style={styles.secondaryButtonText}>
              {lesson.operateTool === 'quick-reset' ? 'Quick Reset' : 
               lesson.operateTool === 'replay' ? 'Process It' :
               lesson.operateTool === 'relate' ? 'Relate' :
               lesson.operateTool === 'journal' ? 'Journal' :
               lesson.operateTool === 'role-play' ? 'Practice' :
               lesson.operateTool === 'patterns' ? 'See Patterns' : 'Use Tool'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reason: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 12,
    lineHeight: 20,
  },
  insightBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  insightRow: {
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 2,
  },
  insightText: {
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF22',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#7C4DFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
