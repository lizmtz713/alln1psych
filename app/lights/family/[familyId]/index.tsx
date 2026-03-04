import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../../../src/lib/constants';
import { useFamilyStore } from '../../../../src/stores/familyStore';
import { TemperatureGauge } from '../../../../src/components/circle/TemperatureGauge';
import type { Temperature } from '../../../../src/stores/circleStore';
import type { LightTemperature } from '../../../../src/types/lights';

function lightTempToGauge(t: LightTemperature): Temperature {
  if (t === 'warm') return 'green';
  if (t === 'neutral') return 'yellow';
  if (t === 'cool') return 'orange';
  return 'yellow';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return diff + ' days ago';
  return d.toLocaleDateString();
}

function formatCareAction(action: string): string {
  const map: Record<string, string> = {
    reached_out: 'reached out to',
    sent_mind_mail: 'sent Mind Mail to',
    called: 'called',
    visited: 'visited',
    coordinated: 'coordinated care for',
  };
  return map[action] ?? action;
}

export default function FamilyDashboardScreen() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const router = useRouter();
  const fid = familyId ?? '';

  const family = useFamilyStore((s) => s.getFamilyById(fid));
  const members = useFamilyStore((s) => s.getFamilyMembers(fid));
  const familyTemp = useFamilyStore((s) => s.getFamilyTemperature(fid));
  const needingCare = useFamilyStore((s) => s.getMembersNeedingCare(fid));
  const insights = useFamilyStore((s) => s.getFamilyInsights(fid));
  const upcomingEvents = useFamilyStore((s) => s.getUpcomingEvents(fid, 30));
  const careLog = useFamilyStore((s) => s.getCareLog(fid, 5));

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Family not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const tempLabel = familyTemp >= 67 ? 'Mostly warm' : familyTemp >= 34 ? 'Mixed' : 'Needs attention';
  const actionableInsights = insights.filter((i) => i.actionable);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.familyEmoji}>{family.emoji ?? '👨‍👩‍👧'}</Text>
        <Text style={styles.familyName}>{family.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family temperature</Text>
        <View style={styles.tempCard}>
          <Text style={styles.tempScore}>{familyTemp}</Text>
          <Text style={styles.tempLabel}>{tempLabel}</Text>
          <View style={styles.memberRings}>
            {members.map((member) => (
              <Pressable
                key={member.id}
                style={styles.memberRing}
                onPress={() => router.push('/lights/' + member.id)}
              >
                <TemperatureGauge temperature={lightTempToGauge(member.temperature)} size="sm" />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name.split(' ')[0]}
                </Text>
                <Text style={styles.memberTemp}>{member.sharedTemperature?.value ?? '—'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {needingCare.length > 0 && (
          <Pressable
            style={styles.careAlert}
            onPress={() => router.push('/lights/family/' + family.id + '/coordinate?lightId=' + needingCare[0].id)}
          >
            <Text style={styles.careAlertText}>{needingCare[0].name} is having a hard time.</Text>
            <Text style={styles.careAlertAction}>Coordinate care →</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming events</Text>
        {upcomingEvents.slice(0, 3).map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.eventEmoji}>
              {event.type === 'birthday' ? '🎂' : event.type === 'anniversary' ? '💕' : '📅'}
            </Text>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
            </View>
          </View>
        ))}
        {upcomingEvents.length === 0 && <Text style={styles.emptyText}>No upcoming events</Text>}
        <Pressable style={styles.addButton} onPress={() => {}}>
          <Text style={styles.addButtonText}>+ Add event</Text>
        </Pressable>
      </View>

      {actionableInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family nudges</Text>
          {actionableInsights.map((insight, i) => (
            <Pressable
              key={i}
              style={styles.nudgeCard}
              onPress={() => insight.action && router.push(insight.action.route)}
            >
              <Text style={styles.nudgeText}>{insight.title}</Text>
              <Text style={styles.nudgeDesc}>{insight.description}</Text>
              {insight.action && (
                <Text style={styles.nudgeActionText}>{insight.action.label}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family log</Text>
        {careLog.map((entry) => (
          <View key={entry.id} style={styles.logEntry}>
            <Text style={styles.logDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.logText}>
              {entry.actorName} {formatCareAction(entry.action)} {entry.targetName ?? ''}
            </Text>
          </View>
        ))}
        {careLog.length === 0 && (
          <Text style={styles.emptyText}>Care actions will appear here</Text>
        )}
      </View>

      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push('/lights/family/' + family.id + '/settings')}
      >
        <Text style={styles.settingsButtonText}>Family settings</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { fontSize: 16, color: COLORS.text, padding: 20 },
  link: { fontSize: 16, color: COLORS.accent, padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  familyEmoji: { fontSize: 48, marginBottom: 8 },
  familyName: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  tempCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    alignItems: 'center',
  },
  tempScore: { fontSize: 36, fontWeight: '700', color: COLORS.text },
  tempLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  memberRings: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  memberRing: { alignItems: 'center', minWidth: 56 },
  memberName: { fontSize: 12, color: COLORS.text, marginTop: 4, maxWidth: 56 },
  memberTemp: { fontSize: 11, color: COLORS.textSecondary },
  careAlert: {
    marginTop: 12,
    padding: 14,
    backgroundColor: COLORS.amberBg,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
  },
  careAlertText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  careAlertAction: { fontSize: 14, color: COLORS.accent, marginTop: 4 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
  },
  eventEmoji: { fontSize: 24, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  eventDate: { fontSize: 13, color: COLORS.textSecondary },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, paddingVertical: 8 },
  addButton: { marginTop: 8 },
  addButtonText: { fontSize: 15, color: COLORS.accent },
  nudgeCard: {
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
  },
  nudgeText: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  nudgeDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  nudgeActionText: { fontSize: 14, color: COLORS.accent, marginTop: 6 },
  logEntry: { marginBottom: 8 },
  logDate: { fontSize: 12, color: COLORS.textMuted },
  logText: { fontSize: 14, color: COLORS.text },
  settingsButton: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    alignItems: 'center',
  },
  settingsButtonText: { fontSize: 16, color: COLORS.text },
});
