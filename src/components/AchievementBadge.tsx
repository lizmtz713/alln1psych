import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../lib/constants';

export function AchievementBadge(props: any) {
  const { achievement, index } = props;
  const scale = useRef(new Animated.Value(achievement.unlocked ? 1 : 0.9)).current;
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (achievement.unlocked && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true, speed: 12, bounciness: 8 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
      ]).start();
    }
  }, [achievement.unlocked]);
  return (
    <Animated.View
      style={[
        styles.achievementBadge,
        !achievement.unlocked && styles.achievementLocked,
        { transform: [{ scale }] },
      ]}
    >
      <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
      <Text
        style={[styles.achievementTitle, !achievement.unlocked && styles.achievementTitleLocked]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      {!achievement.unlocked && (
        <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} style={styles.achievementLock} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  achievementBadge: {
    width: 100,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  achievementLocked: {
    borderColor: 'transparent',
    opacity: 0.7,
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: COLORS.textMuted,
  },
  achievementLock: {
    marginTop: 4,
  },
});
