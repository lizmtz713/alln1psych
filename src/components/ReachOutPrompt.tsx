/**
 * ReachOutPrompt — Cockpit card for low Connection
 * 
 * Shows when Connection < 40 for 2+ days.
 * Warm, dismissible, not pushy.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import {
  checkConnectionLowPersistence,
  wasRecentlyDismissed,
  dismissReachOutPrompt,
} from '../services/reachOutScaffold';

const SURFACE = COLORS.surface;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;

// Soft pink/connection color
const CONNECTION_ACCENT = '#EC4899';

interface Props {
  onDismiss?: () => void;
}

export default function ReachOutPrompt({ onDismiss }: Props) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [daysBelowThreshold, setDaysBelowThreshold] = useState(2);
  const [connectionLevel, setConnectionLevel] = useState(30);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkShouldShow();
  }, []);

  const checkShouldShow = async () => {
    const [persistence, dismissed] = await Promise.all([
      checkConnectionLowPersistence(),
      wasRecentlyDismissed(),
    ]);

    if (persistence.isLow && !dismissed) {
      setDaysBelowThreshold(persistence.daysBelowThreshold);
      setConnectionLevel(persistence.currentLevel);
      setIsVisible(true);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(modals)/reach-out-scaffold',
      params: {
        days: daysBelowThreshold.toString(),
        level: connectionLevel.toString(),
      },
    } as any);
  };

  const handleDismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      await dismissReachOutPrompt();
      setIsVisible(false);
      onDismiss?.();
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={handlePress}
      >
        {/* Dismiss button */}
        <Pressable
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={TEXT_MUTED} />
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="heart-half" size={24} color={CONNECTION_ACCENT} />
          </View>
          
          <View style={styles.textContent}>
            <Text style={styles.title}>
              Connection has been low
            </Text>
            <Text style={styles.subtitle}>
              {daysBelowThreshold} days. Want some ideas for reconnecting?
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: CONNECTION_ACCENT,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CONNECTION_ACCENT + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContent: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
});
