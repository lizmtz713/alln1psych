/**
 * MemoryMomentsCard — "Your app remembers moments"
 * Birthday reminder + last time you saw someone, with CTAs.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { BirthdayReminder, LastTimeMoment } from '../../services/memoryEngine';
import { formatTimelineDate } from '../../services/timelineEngine';

export interface MemoryMomentsCardProps {
  birthdayReminders: BirthdayReminder[];
  lastTimeMoments: LastTimeMoment[];
  onPersonPress: (light: { id: string; name: string }) => void;
  onPlanSomething?: (light: { id: string; name: string }) => void;
}

export function MemoryMomentsCard({
  birthdayReminders,
  lastTimeMoments,
  onPersonPress,
  onPlanSomething,
}: MemoryMomentsCardProps) {
  const birthday = birthdayReminders[0];
  const lastTime = lastTimeMoments[0];
  if (!birthday && !lastTime) return null;

  return (
    <View style={styles.card}>
      {birthday ? (
        <Pressable
          style={({ pressed }) => [styles.block, pressed && styles.blockPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPersonPress(birthday.light);
          }}
        >
          <Text style={styles.emoji}>🎂</Text>
          <View style={styles.blockContent}>
            <Text style={styles.title}>{birthday.light.name}'s birthday {birthday.label}</Text>
            <Text style={styles.cta}>Want to plan something?</Text>
            {onPlanSomething ? (
              <Pressable
                style={({ p }) => [styles.btn, p && styles.btnPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPlanSomething(birthday.light);
                }}
              >
                <Text style={styles.btnText}>Plan something</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      ) : null}
      {lastTime ? (
        <Pressable
          style={({ pressed }) => [styles.block, styles.blockLast, pressed && styles.blockPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPersonPress(lastTime.light);
          }}
        >
          <Text style={styles.emoji}>💭</Text>
          <View style={styles.blockContent}>
            <Text style={styles.title}>
              You and {lastTime.light.name} haven't hung out since {formatTimelineDate(lastTime.lastDate)}.
            </Text>
            {lastTime.lastActivities.length > 0 ? (
              <>
                <Text style={styles.sub}>Last time you:</Text>
                {lastTime.lastActivities.map((a, i) => (
                  <Text key={i} style={styles.bullet}>• {a}</Text>
                ))}
              </>
            ) : null}
            <Text style={styles.cta}>Want to reach out?</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  block: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  blockLast: { marginBottom: 0 },
  blockPressed: { opacity: 0.92 },
  blockContent: { flex: 1, marginLeft: 12 },
  emoji: { fontSize: 28 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, marginBottom: 2 },
  bullet: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4, marginBottom: 2 },
  cta: { fontSize: 14, fontWeight: '600', color: COLORS.accent, marginTop: 6 },
  btn: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: BORDER_RADIUS.input ?? 10, backgroundColor: COLORS.accent },
  btnPressed: { opacity: 0.9 },
  btnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
