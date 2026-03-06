import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../../../src/lib/constants';
import { useFamilyStore } from '../../../../src/stores/familyStore';
import { useCircleStore } from '../../../../src/stores/circleStore';
import { useShallow } from 'zustand/react/shallow';
import { useLightsStore, computeLights } from '../../../../src/stores/lightsStore';
import type { CareAction } from '../../../../src/types/family';

const ACTIONS: { key: CareAction; icon: string; title: string; desc: string }[] = [
  { key: 'reached_out', icon: 'I', title: "I'll reach out", desc: 'Log it so others know' },
  { key: 'called', icon: 'C', title: "I'll call them", desc: 'Sometimes a voice helps' },
  { key: 'sent_mind_mail', icon: 'M', title: 'Send Mind Mail', desc: 'Write something heartfelt' },
];

export default function CoordinateCareScreen() {
  const { familyId, lightId } = useLocalSearchParams<{ familyId: string; lightId?: string }>();
  const router = useRouter();
  const family = useFamilyStore((s) => s.getFamilyById(familyId ?? ''));
  const members = useFamilyStore((s) => s.getFamilyMembers(familyId ?? ''));
  const logCareAction = useFamilyStore((s) => s.logCareAction);
  const circleMembers = useCircleStore((s) => s.members);
  const persistState = useLightsStore(
    useShallow((s) => ({
      tierByMemberId: s.tierByMemberId,
      connectionLogByMemberId: s.connectionLogByMemberId,
      lastContactByMemberId: s.lastContactByMemberId,
      lightExtrasByMemberId: s.lightExtrasByMemberId,
      momentumByMemberId: s.momentumByMemberId,
      lastHeroShownByMemberId: s.lastHeroShownByMemberId,
      seasonByMemberId: s.seasonByMemberId,
      timelineEventsByMemberId: s.timelineEventsByMemberId,
    }))
  );
  const lights = useMemo(() => computeLights(Array.isArray(circleMembers) ? circleMembers : [], persistState), [circleMembers, persistState]);
  const light = lightId ? lights.find((l) => l.id === lightId) : null;
  const [selectedAction, setSelectedAction] = useState<CareAction | null>(null);

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Family not found</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.link}>Back</Text></Pressable>
      </View>
    );
  }

  const targetLight = light ?? members[0];
  if (!targetLight) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No member to coordinate for</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.link}>Back</Text></Pressable>
      </View>
    );
  }

  const otherMembers = members.filter((m) => m.id !== targetLight.id);

  const confirmAction = () => {
    if (!selectedAction) return;
    logCareAction({
      familyId: familyId!,
      actorId: 'me',
      actorName: 'You',
      targetId: targetLight.id,
      targetName: targetLight.name,
      action: selectedAction,
    });
    router.back();
  };

  const askFamilyMember = (memberId: string, memberName: string) => {
    logCareAction({
      familyId: familyId!,
      actorId: 'me',
      actorName: 'You',
      targetId: memberId,
      targetName: memberName,
      action: 'coordinated',
      note: 'Asked ' + memberName + ' to check on ' + targetLight.name,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{targetLight.name} needs support</Text>
        <Text style={styles.subtitle}>
          {targetLight.temperature === 'cool' ? "They're having a hard time" : 'They could use some connection'}
        </Text>
      </View>
      <Text style={styles.question}>Who can reach out?</Text>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.key}
          style={[styles.actionCard, selectedAction === a.key && styles.actionSelected]}
          onPress={() => {
            if (a.key === 'sent_mind_mail') {
              router.push('/mind-mail/compose?to=' + targetLight.id);
              return;
            }
            setSelectedAction(a.key);
          }}
        >
          <Text style={styles.actionIcon}>{a.icon}</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDesc}>{a.desc}</Text>
          </View>
        </Pressable>
      ))}
      {otherMembers.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Ask another family member</Text>
          {otherMembers.map((member) => (
            <Pressable
              key={member.id}
              style={styles.memberCard}
              onPress={() => askFamilyMember(member.id, member.name)}
            >
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberAction}>Ask to check in</Text>
            </Pressable>
          ))}
        </>
      )}
      <Pressable
        style={styles.familyMailCard}
        onPress={() => router.push('/mind-mail/compose?to=' + targetLight.id + '&type=family')}
      >
        <Text style={styles.familyMailIcon}>F</Text>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>Family Mind Mail</Text>
          <Text style={styles.actionDesc}>Send encouragement together</Text>
        </View>
      </Pressable>
      <Pressable style={styles.laterButton} onPress={() => router.back()}>
        <Text style={styles.laterText}>Remind me later</Text>
      </Pressable>
      {selectedAction && (
        <Pressable style={styles.confirmButton} onPress={confirmAction}>
          <Text style={styles.confirmText}>Log and done</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { fontSize: 16, color: COLORS.text, padding: 20 },
  link: { fontSize: 16, color: COLORS.accent, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  question: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 10,
  },
  actionSelected: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  actionIcon: { fontSize: 28, marginRight: 14 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  actionDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 20, marginBottom: 10 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
  },
  memberName: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  memberAction: { fontSize: 14, color: COLORS.accent },
  familyMailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    marginTop: 12,
  },
  familyMailIcon: { fontSize: 28, marginRight: 14 },
  laterButton: { marginTop: 24, alignItems: 'center' },
  laterText: { fontSize: 15, color: COLORS.textSecondary },
  confirmButton: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  confirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
