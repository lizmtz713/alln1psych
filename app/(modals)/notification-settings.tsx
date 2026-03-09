/**
 * Notification Settings — toggles per type, quiet hours, frequency, smart timing.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotificationSettingsStore } from '../../src/stores/notificationSettingsStore';
import type { SmartNotificationType, NotificationFrequency } from '../../src/services/smartNotifications';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = 'rgba(255,255,255,0.06)';
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const NOTIFICATION_TYPE_LABELS: Record<SmartNotificationType, string> = {
  checkin_reminder: "Check-in reminders",
  gauge_alert: "Gauge alerts",
  circle_alert: "Circle alerts",
  drift_warning: "Relationship drift",
  streak_celebration: "Streak celebration",
  trend_positive: "Trend positive",
  pattern_insight: "Pattern insights",
  gentle_reconnect: "Gentle reconnect",
};

const NOTIFICATION_TYPE_HINTS: Record<SmartNotificationType, string> = {
  checkin_reminder: "e.g. It's been 2 days since you checked in",
  gauge_alert: "e.g. Your State has been below 40 for 3 days",
  circle_alert: "e.g. [Name] could use a check-in",
  drift_warning: "e.g. [Name] is drifting — you usually talk every X days",
  streak_celebration: "e.g. 7-day streak! 🔥",
  trend_positive: "You're trending up this week!",
  pattern_insight: "e.g. You tend to feel better on days you exercise",
  gentle_reconnect: "e.g. Hey, we miss you — it's been 5 days",
};

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'twice_weekly', label: 'Twice a week' },
  { value: 'weekly', label: 'Weekly' },
];

function formatHour(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function QuietHoursRow({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  const incHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onHourChange((hour + 1) % 24);
  };
  const decHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onHourChange((hour - 1 + 24) % 24);
  };
  return (
    <View style={styles.quietRow}>
      <Text style={styles.quietLabel}>{label}</Text>
      <View style={styles.quietControls}>
        <Pressable style={styles.quietBtn} onPress={decHour}>
          <Ionicons name="chevron-back" size={20} color={ACCENT} />
        </Pressable>
        <Text style={styles.quietValue}>{formatHour(hour, minute)}</Text>
        <Pressable style={styles.quietBtn} onPress={incHour}>
          <Ionicons name="chevron-forward" size={20} color={ACCENT} />
        </Pressable>
      </View>
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const settings = useNotificationSettingsStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Notification settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification types */}
        <Text style={styles.sectionTitle}>Notification types</Text>
        <View style={styles.card}>
          {(Object.keys(NOTIFICATION_TYPE_LABELS) as SmartNotificationType[]).map((type) => (
            <View key={type}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>{NOTIFICATION_TYPE_LABELS[type]}</Text>
                  <Text style={styles.toggleHint}>{NOTIFICATION_TYPE_HINTS[type]}</Text>
                </View>
                <Switch
                  value={settings.types[type]?.enabled ?? true}
                  onValueChange={(v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    settings.setTypeEnabled(type, v);
                  }}
                  trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
                  thumbColor={settings.types[type]?.enabled ? ACCENT : TEXT_MUTED}
                />
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </View>

        {/* Quiet hours */}
        <Text style={styles.sectionTitle}>Quiet hours</Text>
        <View style={styles.card}>
          <QuietHoursRow
            label="Do not disturb from"
            hour={settings.quietHours.startHour}
            minute={settings.quietHours.startMinute}
            onHourChange={(h) => settings.setQuietHours({ startHour: h })}
            onMinuteChange={(m) => settings.setQuietHours({ startMinute: m })}
          />
          <View style={styles.divider} />
          <QuietHoursRow
            label="Until"
            hour={settings.quietHours.endHour}
            minute={settings.quietHours.endMinute}
            onHourChange={(h) => settings.setQuietHours({ endHour: h })}
            onMinuteChange={(m) => settings.setQuietHours({ endMinute: m })}
          />
        </View>

        {/* Frequency */}
        <Text style={styles.sectionTitle}>Frequency</Text>
        <View style={styles.card}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={styles.freqRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                settings.setFrequency(opt.value);
              }}
            >
              <Text style={styles.freqLabel}>{opt.label}</Text>
              {settings.frequency === opt.value ? (
                <Ionicons name="checkmark-circle" size={22} color={ACCENT} />
              ) : (
                <View style={{ width: 22, height: 22 }} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Smart timing */}
        <Text style={styles.sectionTitle}>Smart timing</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Learn best times</Text>
              <Text style={styles.toggleHint}>Use when you usually open the app and check in to send notifications when you're likely to see them</Text>
            </View>
            <Switch
              value={settings.smartTiming}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                settings.setSmartTiming(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.smartTiming ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: TEXT },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleLabel: { fontSize: 16, color: TEXT },
  toggleHint: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  divider: { height: 1, backgroundColor: BORDER, marginLeft: 16 },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  quietLabel: { fontSize: 15, color: TEXT },
  quietControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quietBtn: { padding: 8 },
  quietValue: { fontSize: 16, fontWeight: '600', color: TEXT, minWidth: 80, textAlign: 'center' },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  freqLabel: { fontSize: 16, color: TEXT },
});
