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
  Alert,
  TextInput,
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

export default function CircleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedNudgeId, setExpandedNudgeId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingBirthdayId, setEditingBirthdayId] = useState<string | null>(null);
  const [birthdayInput, setBirthdayInput] = useState('');
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
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
    updateMember,
  } = useCircleStore();
  const myBirthday = useUserStore((s) => s.birthday);

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
    const number = m.phone || (m.contactMethod && !m.contactMethod.includes('@') ? m.contactMethod : null);
    if (number) {
      Linking.openURL(`sms:${number.replace(/\D/g, '')}`);
      return;
    }
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Send text to ${m.name}`,
        'Enter their phone number',
        (phone) => {
          if (phone?.trim()) Linking.openURL(`sms:${phone.trim().replace(/\D/g, '')}`);
        }
      );
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
  };

  const handleCall = (m: CircleMember) => {
    const number = m.phone || (m.contactMethod && !m.contactMethod.includes('@') ? m.contactMethod : null);
    if (number) {
      Linking.openURL(`tel:${number.replace(/\D/g, '')}`);
      return;
    }
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Call ${m.name}`,
        'Enter their phone number',
        (phone) => {
          if (phone?.trim()) Linking.openURL(`tel:${phone.trim().replace(/\D/g, '')}`);
        }
      );
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
  };

  const handleReachedOut = (m: CircleMember) => {
    updateMember(m.id, {
      lastReachedOut: new Date().toISOString(),
      reachedOutCount: (m.reachedOutCount || 0) + 1,
    });
    const n = nudges.find((x) => x.memberName === m.name);
    if (n) markNudgeActedOn(n.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToast('Reached out recorded');
    setTimeout(() => setToast(null), 2000);
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

      {/* Time to check in — members who need a check-in (7+ days or never) */}
      {(() => {
        const needsCheckIn = members.filter((m) => {
          if (!m.lastReachedOut) return true;
          const daysSince = Math.floor((Date.now() - new Date(m.lastReachedOut).getTime()) / 86400000);
          return daysSince >= 7;
        });
        return needsCheckIn.length > 0 ? (
          <View style={{ backgroundColor: 'rgba(124,77,255,0.08)', borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}>
            <Text style={{ color: '#7C4DFF', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Time to check in</Text>
            {needsCheckIn.map((m) => {
              const days = m.lastReachedOut
                ? Math.floor((Date.now() - new Date(m.lastReachedOut).getTime()) / 86400000)
                : null;
              return (
                <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ color: '#F0F0F5', fontSize: 14 }}>
                    {m.name} — {days !== null ? `${days} days ago` : 'never reached out'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      updateMember(m.id, {
                        lastReachedOut: new Date().toISOString(),
                        reachedOutCount: (m.reachedOutCount || 0) + 1,
                      });
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    style={{ backgroundColor: '#7C4DFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12 }}>Done ✓</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null;
      })()}

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
                      <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 10 }}>
                        {m.lastReachedOut
                          ? `Last reached out: ${(() => {
                              const days = Math.floor((Date.now() - new Date(m.lastReachedOut!).getTime()) / 86400000);
                              return days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
                            })()}`
                          : "You've never reached out"}
                      </Text>
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
                      {/* Phone: show or add */}
                      {m.phone ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
                          <Text style={{ color: '#8888A0', fontSize: 13 }}>Phone: </Text>
                          <Text style={{ color: '#F0F0F5', fontSize: 13 }}>{m.phone}</Text>
                        </View>
                      ) : (
                        <View style={{ marginTop: 12 }}>
                          {editingPhoneId === m.id ? (
                            <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}>
                              <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 6 }}>Phone number</Text>
                              <TextInput
                                style={{ backgroundColor: '#09090F', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10 }}
                                placeholder="(555) 123-4567"
                                placeholderTextColor="#55556A"
                                value={phoneInput}
                                onChangeText={setPhoneInput}
                                keyboardType="phone-pad"
                              />
                              <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Pressable onPress={() => { setEditingPhoneId(null); setPhoneInput(''); }} style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}>
                                  <Text style={{ color: '#8888A0', fontSize: 14 }}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    if (phoneInput.trim()) {
                                      updateMember(m.id, { phone: phoneInput.trim() });
                                      setEditingPhoneId(null);
                                      setPhoneInput('');
                                    }
                                  }}
                                  style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
                                >
                                  <Text style={{ color: '#7C4DFF', fontSize: 14, fontWeight: '600' }}>Save</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <Pressable onPress={() => { setEditingPhoneId(m.id); setPhoneInput(''); }} style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}>
                              <Text style={{ color: '#7C4DFF', fontSize: 14, textAlign: 'center' }}>Add phone number</Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                      {/* Birthday: show when present */}
                      {m.birthday && (
                        <Text style={{ color: '#8888A0', fontSize: 13, marginTop: 6 }}>
                          Birthday: {new Date(m.birthday + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      )}
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
                      {/* Personology: their personality */}
                      {getPersonality(m.birthday ?? '') && (
                        <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                          <Text style={{ color: '#7C4DFF', fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
                            {m.name}: {getPersonality(m.birthday!)!.name}
                          </Text>
                          <Text style={{ color: '#B0B0C0', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>
                            {getPersonality(m.birthday!)!.communicationStyle}
                          </Text>
                          <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 4 }}>
                            Strengths: {getPersonality(m.birthday!)!.strengths.join(', ')}
                          </Text>
                          <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 4 }}>
                            Under stress: {getPersonality(m.birthday!)!.stressResponse}
                          </Text>
                          <Text style={{ color: '#8888A0', fontSize: 13 }}>
                            Needs: {getPersonality(m.birthday!)!.needsInRelationships}
                          </Text>
                        </View>
                      )}
                      {/* Our Dynamic — both birthdays */}
                      {myBirthday && m.birthday && getRelationshipDynamic(myBirthday, m.birthday) && (() => {
                        const dynamic = getRelationshipDynamic(myBirthday, m.birthday!);
                        if (!dynamic) return null;
                        return (
                          <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                            <Text style={{ color: '#7C4DFF', fontSize: 15, fontWeight: '600', marginBottom: 10 }}>Our Dynamic</Text>
                            <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Strengths</Text>
                            {dynamic.strengths.map((s, i) => (
                              <Text key={i} style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18, marginBottom: 4, marginLeft: 8 }}>• {s}</Text>
                            ))}
                            <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Watch For</Text>
                            {dynamic.frictionPoints.map((f, i) => (
                              <Text key={i} style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18, marginBottom: 4, marginLeft: 8 }}>• {f}</Text>
                            ))}
                            <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Communication Tip</Text>
                            <Text style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18 }}>{dynamic.communicationTip}</Text>
                            <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Your Conflict Pattern</Text>
                            <Text style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18 }}>{dynamic.conflictPattern}</Text>
                          </View>
                        );
                      })()}
                      {/* Relationship Check — when member has birthday */}
                      {m.birthday && (
                        <Pressable
                          style={{ marginTop: 12, backgroundColor: '#111118', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push({ pathname: '/(modals)/relate', params: { name: m.name, birthday: m.birthday } });
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>💫</Text>
                          <Text style={{ color: '#7C4DFF', fontSize: 14, fontWeight: '500' }}>Relationship Check with {m.name}</Text>
                        </Pressable>
                      )}
                      {/* Add birthday */}
                      {!m.birthday && (
                        <View style={{ marginTop: 16 }}>
                          {editingBirthdayId === m.id ? (
                            <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}>
                              <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 6 }}>Birthday (MM/DD/YYYY)</Text>
                              <TextInput
                                style={{ backgroundColor: '#09090F', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10 }}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="#55556A"
                                value={birthdayInput}
                                onChangeText={(text) => {
                                  const cleaned = text.replace(/\D/g, '');
                                  if (cleaned.length <= 2) setBirthdayInput(cleaned);
                                  else if (cleaned.length <= 4) setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
                                  else setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
                                }}
                                keyboardType="number-pad"
                                maxLength={10}
                              />
                              <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Pressable onPress={() => { setEditingBirthdayId(null); setBirthdayInput(''); }} style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}>
                                  <Text style={{ color: '#8888A0', fontSize: 14 }}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    if (birthdayInput.length === 10) {
                                      const [mm, dd, yyyy] = birthdayInput.split('/');
                                      if (mm && dd && yyyy) {
                                        updateMember(m.id, { birthday: `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` });
                                        setEditingBirthdayId(null);
                                        setBirthdayInput('');
                                      }
                                    }
                                  }}
                                  style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
                                >
                                  <Text style={{ color: '#7C4DFF', fontSize: 14, fontWeight: '600' }}>Save</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <Pressable onPress={() => { setEditingBirthdayId(m.id); setBirthdayInput(''); }} style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)' }}>
                              <Text style={{ color: '#7C4DFF', fontSize: 14, textAlign: 'center' }}>Add their birthday to unlock relationship insights</Text>
                            </Pressable>
                          )}
                        </View>
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
