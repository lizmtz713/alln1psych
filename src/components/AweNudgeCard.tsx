/**
 * Awe Nudge Card — Wonder-inducing intervention for low Direction
 * 
 * Shows when Direction is low/stagnant.
 * Light touch, not pushy. Invites curiosity.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import {
  type AweActivity,
  getSuggestedAweActivity,
  recordAweShown,
  recordAweCompleted,
  generateAwePrompt,
} from '../services/aweNudge';

interface Props {
  onDismiss?: () => void;
  /** Override the suggested activity */
  activity?: AweActivity;
}

// Soft, wonder-inducing accent
const AWE_ACCENT = '#7B68EE'; // Medium slate blue - mystical but not harsh
const AWE_BG = 'rgba(123, 104, 238, 0.08)';
const AWE_BORDER = 'rgba(123, 104, 238, 0.20)';

export default function AweNudgeCard({ onDismiss, activity: propActivity }: Props) {
  const router = useRouter();
  const [activity, setActivity] = useState<AweActivity | null>(propActivity || null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!propActivity) {
      getSuggestedAweActivity().then(setActivity);
    }
    // Record that we showed this
    recordAweShown();
  }, [propActivity]);

  const handleTryThis = async () => {
    if (!activity) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await recordAweCompleted(activity.id);
    
    if (activity.externalLink) {
      // Open external link
      Linking.openURL(activity.externalLink);
    } else if (activity.hasTimer) {
      // Navigate to awe activities with timer
      router.push({
        pathname: '/(modals)/awe-activities',
        params: { startActivity: activity.id },
      });
    } else {
      // Navigate to full awe activities list
      router.push('/(modals)/awe-activities');
    }
    
    onDismiss?.();
  };

  const handleMoreOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/awe-activities');
    onDismiss?.();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss?.();
  };

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  if (!activity) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>✨</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Feeling stuck?</Text>
            <Text style={styles.subtitle}>Awe might help</Text>
          </View>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={20} color={COLORS.textMuted} />
        </Pressable>
      </View>

      {/* Science snippet - expandable */}
      <Pressable style={styles.scienceBox} onPress={toggleExpanded}>
        <View style={styles.scienceHeader}>
          <Text style={styles.scienceLabel}>💡 The science</Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={COLORS.textMuted} 
          />
        </View>
        {expanded ? (
          <Text style={styles.scienceTextFull}>
            Awe — the feeling of encountering something vast — literally "shrinks the ego" and expands perspective. 
            Researcher Dacher Keltner found that brief awe experiences (even watching a video) 
            can shift us out of rumination and reconnect us to something larger than our problems.
          </Text>
        ) : (
          <Text style={styles.scienceText}>
            Awe shrinks the ego and expands perspective.
          </Text>
        )}
      </Pressable>

      {/* Suggested activity */}
      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            {activity.duration && (
              <Text style={styles.activityDuration}>{activity.duration}</Text>
            )}
          </View>
        </View>
        <Text style={styles.activityDescription}>{activity.description}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable 
          style={styles.primaryButton} 
          onPress={handleTryThis}
        >
          <Text style={styles.primaryButtonText}>Try This</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={handleMoreOptions}>
          <Text style={styles.secondaryButtonText}>More options</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: AWE_BORDER,
    borderLeftWidth: 3,
    borderLeftColor: AWE_ACCENT,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: AWE_ACCENT,
    marginTop: 2,
  },
  scienceBox: {
    backgroundColor: AWE_BG,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scienceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  scienceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  scienceTextFull: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 19,
  },
  activityCard: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AWE_ACCENT,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AWE_BG,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  secondaryButtonText: {
    color: AWE_ACCENT,
    fontWeight: '500',
    fontSize: 15,
  },
});
