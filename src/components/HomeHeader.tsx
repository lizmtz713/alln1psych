/**
 * HomeHeader — "Hey, {name}" with date and time-based ritual shortcuts.
 * • ☀️ 6am–6pm → Pre-Flight
 * • 🌙 6pm–6am → Post-Flight
 * • 🚨 Always → Emergency Mode
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../lib/constants';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatHeaderDate(): string {
  const d = new Date();
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

/** 6:00–17:59 = day (Pre-Flight); 18:00–5:59 = night (Post-Flight) */
function isDaytime(): boolean {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
}

export interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  const router = useRouter();
  const day = isDaytime();
  const displayName = (userName?.trim() && userName !== 'there') ? userName : 'there';

  const onPreFlight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/rituals/pre-flight');
  };

  const onPostFlight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/rituals/post-flight');
  };

  const onEmergency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/emergency');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.hey}>Hey, {displayName}</Text>
        <View style={styles.iconsRow}>
          {day ? (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={onPreFlight}
              accessibilityLabel="Pre-Flight"
              accessibilityHint="Opens morning check-in"
            >
              <Text style={styles.icon}>☀️</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={onPostFlight}
              accessibilityLabel="Post-Flight"
              accessibilityHint="Opens evening debrief"
            >
              <Text style={styles.icon}>🌙</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            onPress={onEmergency}
            accessibilityLabel="Emergency"
            accessibilityHint="Opens emergency support"
          >
            <Text style={styles.icon}>🚨</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.date}>{formatHeaderDate()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hey: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 22,
  },
  date: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
