import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import {
  useCircleStore,
  TEMPERATURE_LABELS,
  type CircleMember,
  type Temperature,
  type Nudge,
} from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { getPersonality, getRelationshipDynamic } from '../../src/services/personology';

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

function formatBirthday(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!m || !d) return iso;
  return `${m}/${d}/${y}`;
}

function formatBirthdayInput(text: string, setter: (t: string) => void): void {
  const digits = text.replace(/\D/g, '');
  let out = '';
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += '/' + digits.slice(2, 4);
  if (digits.length > 4) out += '/' + digits.slice(4, 8);
  setter(out);
}

function parseBirthdayToIso(mmDdYyyy: string): string | undefined {
  const parts = mmDdYyyy.split('/').map((p) => p.trim());
  if (parts.length !== 3) return undefined;
  const [mm, dd, yyyy] = parts;
  if (!mm || !dd || !yyyy || mm.length !== 2 || dd.length !== 2 || yyyy.length !== 4) return undefined;
  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  const y = parseInt(yyyy, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return undefined;
  return `${y}-${mm}-${dd}`;
}

export default function CircleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedNudgeId, setExpandedNudgeId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingBirthday, setEditingBirthday] = useState<string | null>(null);
  const [editBirthdayValue, setEditBirthdayValue] = useState('');
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
    updateMemberBirthday,
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
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Send text to ${m.name}`,
        'Enter their phone number',
        (phone) => {
          if (phone?.trim()) Linking.openURL(`sms:${phone.trim().replace(/\D/g, '')}`);
        }
      );
    } else {
      if (m.contactMethod && !m.contactMethod.includes('@')) {
        Linking.openURL(`sms:${m.contactMethod.replace(/\D/g, '')}`);
      } else {
        Alert.alert(
          `Send text to ${m.name}`,
          'Enter their phone number in your circle, or open your messages app.',
          [
            { text: 'Open messages', onPress: () => Linking.openURL('sms:') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    }
  };

  const handleCall = (m: CircleMember) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Call ${m.name}`,
        'Enter their phone number',
        (phone) => {
          if (phone?.trim()) Linking.openURL(`tel:${phone.trim().replace(/\D/g, '')}`);
        }
      );
    } else {
      if (m.contactMethod && !m.contactMethod.includes('@')) {
        Linking.openURL(`tel:${m.contactMethod.replace(/\D/g, '')}`);
      } else {
        Alert.alert(
          `Call ${m.name}`,
          'Add their phone number in your circle, or open your dialer.',
          [
            { text: 'Open dialer', onPress: () => Linking.openURL('tel:') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    }
  };

  const handleReachedOut = (m: CircleMember) => {
    const n = nudges.find((x) => x.memberName === m.name);
    if (n) markNudgeActedOn(n.id);
    setToast('Reached out recorded');
    setTimeout(() => setToast(null), 2000);
  };

  const saveBirthday = (memberId: string, value: string) => {
    const iso = parseBirthdayToIso(value);
    if (iso) {
      updateMemberBirthday(memberId, iso);
      setToast('Birthday saved');
    } else {
      setToast('Use MM/DD/YYYY');
    }
    setEditingBirthday(null);
    setEditBirthdayValue('');
    setTimeout(() => setToast(null), 2000);
  };

  const startEditBirthday = (m: CircleMember) => {
    setEditingBirthday(m.id);
    setEditBirthdayValue(m.birthday ? formatBirthday(m.birthday) : '');
  };

  return (
    <ErrorBoundary>
    <>
      {toast ? (
        <View style={[styles.toast, { top: insets.top + 10 }]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
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
                      {(m.birthday || editingBirthday === m.id) ? (
                        <>
                          {editingBirthday !== m.id ? (
                            <Pressable onPress={() => startEditBirthday(m)} style={{ marginBottom: 8 }}>
                              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                                🎂 {formatBirthday(m.birthday)} ✏️
                              </Text>
                            </Pressable>
                          ) : (
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <TextInput
                                value={editBirthdayValue}
                                onChangeText={(t) => formatBirthdayInput(t, setEditBirthdayValue)}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="number-pad"
                                maxLength={10}
                                style={{ backgroundColor: COLORS.surface, color: COLORS.text, borderRadius: BORDER_RADIUS.input, padding: 10, flex: 1, minWidth: 120 }}
                              />
                              <Pressable onPress={() => saveBirthday(m.id, editBirthdayValue)}>
                                <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: '600' }}>Save</Text>
                              </Pressable>
                              <Pressable onPress={() => { setEditingBirthday(null); setEditBirthdayValue(''); }}>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Cancel</Text>
                              </Pressable>
                            </View>
                          )}
                        </>
                      ) : (
                        <Pressable onPress={() => startEditBirthday(m)} style={{ marginBottom: 8 }}>
                          <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>🎂 Add birthday</Text>
                        </Pressable>
                      )}
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
                        <Pressable style={styles.actionBtn} onPress={() => handleReachedOut(m)}>
                          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.accent} />
                          <Text style={styles.actionBtnText}>I reached out</Text>
                        </Pressable>
                      </View>
                      {(m.temperature === 'orange' || m.temperature === 'red') && (
                        <Pressable
                          style={styles.helpSomeoneBtn}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push({
                              pathname: '/(modals)/help-someone',
                              params: { name: m.name, relationship: m.relationship.charAt(0).toUpperCase() + m.relationship.slice(1) },
                            });
                          }}
                        >
                          <Text style={styles.helpSomeoneBtnText}>Need help talking to {m.name}?</Text>
                        </Pressable>
                      )}
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
                            onPress={() => {
                              markNudgeActedOn(n.id);
                              setToast('Reached out recorded');
                              setTimeout(() => setToast(null), 2000);
                            }}
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
    </>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    color: COLORS.text,
  },
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
  helpSomeoneBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    alignSelf: 'flex-start',
  },
  helpSomeoneBtnText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
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
