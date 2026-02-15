import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import {
  useCircleStore,
  TEMPERATURE_LABELS,
  type CircleMember,
  type Temperature,
  type Nudge,
} from '../../src/stores/circleStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUGGESTED_ACTIONS: Record<Temperature, (name: string) => string> = {
  green: () => 'All good! No action needed.',
  yellow: (name) => `${name} could use some love. Maybe send a text?`,
  orange: (name) => `${name} is having a hard time. A call would mean a lot.`,
  red: (name) => `${name} is really struggling. Please reach out.`,
};

const DEMO_MEMBER_IDS = ['demo-mom', 'demo-sarah', 'demo-dad'];

export default function CircleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedNudgeId, setExpandedNudgeId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const {
    members,
    myTemperature,
    myTemperatureLabel,
    nudges,
    markNudgeRead,
    markNudgeActedOn,
  } = useCircleStore();

  const isDemoData = members.some((m) => DEMO_MEMBER_IDS.includes(m.id));

  const handleUpdateTemp = () => {
    router.push('/(modals)/mood-checkin');
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleNudgeExpand = (n: Nudge) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNudgeId(expandedNudgeId === n.id ? null : n.id);
    if (!n.read) markNudgeRead(n.id);
  };

  const handleSendText = (m: CircleMember) => {
    if (m.contactMethod && m.contactMethod.includes('@')) {
      Linking.openURL(`mailto:${m.contactMethod}`);
    } else if (m.contactMethod) {
      Linking.openURL(`sms:${m.contactMethod.replace(/\D/g, '')}`);
    }
  };

  const handleCall = (m: CircleMember) => {
    if (m.contactMethod) Linking.openURL(`tel:${m.contactMethod.replace(/\D/g, '')}`);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
    >
      {/* Demo badge – dev only */}
      {__DEV__ && isDemoData && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>Demo data</Text>
        </View>
      )}

      {/* YOUR TEMPERATURE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your temperature</Text>
        <View style={styles.gaugeWrap}>
          <TemperatureGauge temperature={myTemperature} size="lg" label={myTemperatureLabel} />
        </View>
        <Pressable style={styles.updateButton} onPress={handleUpdateTemp}>
          <Text style={styles.updateButtonText}>Update</Text>
        </Pressable>
        <Text style={styles.hint}>Your circle can see this. Tap to change anytime.</Text>
      </View>

      {/* YOUR CIRCLE */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Circle</Text>
          <Pressable style={styles.inviteButton} onPress={() => router.push('/(modals)/invite-circle')}>
            <Ionicons name="add" size={22} color={COLORS.accent} />
            <Text style={styles.inviteButtonText}>Invite +</Text>
          </Pressable>
        </View>

        {members.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💜</Text>
            <Text style={styles.emptyTitle}>Your circle is empty</Text>
            <Text style={styles.emptySub}>
              Invite the people who matter most. They'll see how you're doing — but never what
              you've said.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/(modals)/invite-circle')}
            >
              <Text style={styles.emptyButtonText}>Invite Someone</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.memberList}>
            {members.map((m) => {
              const expanded = expandedId === m.id;
              const action = SUGGESTED_ACTIONS[m.temperature](m.name);
              return (
                <View key={m.id} style={styles.memberCard}>
                  <Pressable style={styles.memberHeader} onPress={() => toggleExpand(m.id)}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberRel}>
                        {m.relationship.charAt(0).toUpperCase() + m.relationship.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.memberGauge}>
                      <TemperatureGauge temperature={m.temperature} size="sm" pulse />
                      <Text style={styles.memberLabel}>{m.temperatureLabel}</Text>
                    </View>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </Pressable>
                  {expanded && (
                    <View style={styles.memberExpand}>
                      <Text style={styles.actionText}>{action}</Text>
                      <View style={styles.actionRow}>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => handleSendText(m)}
                        >
                          <Ionicons name="chatbubble-outline" size={18} color={COLORS.accent} />
                          <Text style={styles.actionBtnText}>Send a text</Text>
                        </Pressable>
                        <Pressable style={styles.actionBtn} onPress={() => handleCall(m)}>
                          <Ionicons name="call-outline" size={18} color={COLORS.accent} />
                          <Text style={styles.actionBtnText}>Call</Text>
                        </Pressable>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => {
                            const n = nudges.find((x) => x.memberName === m.name);
                            if (n) markNudgeActedOn(n.id);
                          }}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.accent} />
                          <Text style={styles.actionBtnText}>I reached out</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* NUDGE HISTORY */}
      {nudges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Nudges</Text>
          <View style={styles.nudgeList}>
            {nudges.map((n) => {
              const expanded = expandedNudgeId === n.id;
              const member = members.find((m) => m.name === n.memberName);
              const action = member
                ? SUGGESTED_ACTIONS[member.temperature](n.memberName)
                : n.message;
              return (
                <Pressable
                  key={n.id}
                  style={styles.nudgeCard}
                  onPress={() => toggleNudgeExpand(n)}
                >
                  <View style={styles.nudgeHeader}>
                    <Text style={styles.nudgeMessage}>{n.message}</Text>
                    <Text style={styles.nudgeTime}>
                      {n.timestamp.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </View>
                  {expanded && (
                    <View style={styles.nudgeExpand}>
                      <Text style={styles.actionText}>{action}</Text>
                      {member && (
                        <View style={styles.actionRow}>
                          <Pressable
                            style={styles.actionBtn}
                            onPress={() => handleSendText(member)}
                          >
                            <Text style={styles.actionBtnText}>Send a text</Text>
                          </Pressable>
                          <Pressable style={styles.actionBtn} onPress={() => handleCall(member)}>
                            <Text style={styles.actionBtnText}>Call</Text>
                          </Pressable>
                          <Pressable
                            style={styles.actionBtn}
                            onPress={() => markNudgeActedOn(n.id)}
                          >
                            <Text style={styles.actionBtnText}>I reached out</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  demoBadge: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  demoBadgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    marginBottom: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inviteButtonText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: BORDER_RADIUS.button,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  memberList: { gap: 12 },
  memberCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    overflow: 'hidden',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  memberRel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  memberGauge: {
    alignItems: 'center',
    marginRight: 12,
  },
  memberLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  memberExpand: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  nudgeList: { gap: 10 },
  nudgeCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nudgeMessage: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  nudgeTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  nudgeExpand: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
});
