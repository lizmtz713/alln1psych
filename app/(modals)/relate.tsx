/**
 * Relate — Understand anyone through personality dynamics.
 * Info-dense version with both profiles, full dynamic, and AI insight.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getPersonality, getRelationshipDynamic } from '../../src/services/personology';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

type RelType = 'romantic' | 'family' | 'friendship' | 'work';

const RELATE_ACCENT = '#7C4DFF';

function isoToMMDDYYYY(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function Relate() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string; birthday?: string }>();
  const userBirthday = useUserStore((s) => s.birthday);

  const [myBirthday, setMyBirthday] = useState('');
  const [theirBirthday, setTheirBirthday] = useState('');
  const [theirName, setTheirName] = useState('');
  const [relType, setRelType] = useState<RelType | null>(null);
  const [result, setResult] = useState<{ me: any; them: any; dynamic: any; myIso: string; theirIso: string } | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (userBirthday && !myBirthday) {
      const d = new Date(userBirthday);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        setMyBirthday(`${mm}/${dd}/${yyyy}`);
      }
    }
  }, [userBirthday, myBirthday]);

  useEffect(() => {
    if (params.name && params.name !== theirName) setTheirName(params.name);
    if (params.birthday) {
      const display = isoToMMDDYYYY(params.birthday);
      if (display && display !== theirBirthday) setTheirBirthday(display);
    }
  }, [params.name, params.birthday]);

  function formatBirthday(text: string, setter: (v: string) => void) {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) setter(cleaned);
    else if (cleaned.length <= 4) setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
    else setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
  }

  function parseBirthday(mmddyyyy: string): string {
    const parts = mmddyyyy.split('/');
    if (parts.length !== 3 || parts[2].length !== 4) return '';
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return '';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  async function handleCheck() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const myIso = parseBirthday(myBirthday);
      const theirIso = parseBirthday(theirBirthday);
      if (!myIso || !theirIso) return;

      const me = getPersonality(myIso);
      const them = getPersonality(theirIso);
      const dynamic = getRelationshipDynamic(myIso, theirIso);
      if (!me || !them) return;

      setResult({ me, them, dynamic, myIso, theirIso });
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);

      setLoading(true);
      try {
        const name = theirName.trim() || 'them';
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `My personality: ${me.name} (${me.communicationStyle}). Their personality: ${them.name} (${them.communicationStyle}). Relationship: ${relType}. Their name: ${name}. Give me a relationship insight.` }],
          `You are Psych, a relationship intelligence companion. Based on two personality profiles and their relationship type, give a warm, specific, insightful reading.

For ROMANTIC: Chemistry, communication differences, what makes them click, what could pull them apart, one tip for long-term success.
For FAMILY: Generational dynamics, communication gaps, unspoken expectations, how to bridge differences.
For FRIENDSHIP: What drew them together, what keeps it strong, what could cause drift, how to maintain it.
For WORK: Professional communication styles, collaboration strengths, potential friction, how to get the best from each other.

Be specific to THEIR combination. Use "you" and "${name}". Keep it 4-6 sentences. End with one surprising insight they probably have not considered. Be warm and real, not clinical.`
        );
        setAiInsight(response ?? '');
      } catch (e) {
        setAiInsight('');
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  function handleAddToCircle() {
    if (!result || !theirName.trim()) return;
    useCircleStore.getState().addMember({
      name: theirName.trim(),
      relationship: 'friend',
      contactMethod: '',
      sharingLevel: 'full',
      birthday: result.theirIso,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleTryAnother() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMyBirthday(userBirthday ? (() => { const d = new Date(userBirthday); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`; })() : '');
    setTheirBirthday('');
    setTheirName('');
    setRelType(null);
    setResult(null);
    setAiInsight('');
  }

  const canCheck = myBirthday.length === 10 && theirBirthday.length === 10 && relType !== null;

  const relTypes: { type: RelType; icon: string; label: string }[] = [
    { type: 'romantic', icon: '💕', label: 'Romantic' },
    { type: 'family', icon: '👨‍👩‍👧', label: 'Family' },
    { type: 'friendship', icon: '🤝', label: 'Friendship' },
    { type: 'work', icon: '💼', label: 'Work' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Relate</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <>
            <Text style={styles.prompt}>Understand anyone. Just enter two birthdays.</Text>

            <Text style={styles.label}>Your birthday</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.textMuted}
              value={myBirthday}
              onChangeText={(t) => formatBirthday(t, setMyBirthday)}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Their name <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex, Mom, my boss"
              placeholderTextColor={COLORS.textMuted}
              value={theirName}
              onChangeText={setTheirName}
            />

            <Text style={styles.label}>Their birthday</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.textMuted}
              value={theirBirthday}
              onChangeText={(t) => formatBirthday(t, setTheirBirthday)}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>What's the relationship?</Text>
            <View style={styles.relTypeRow}>
              {relTypes.map((r) => (
                <Pressable
                  key={r.type}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRelType(r.type); }}
                  style={[styles.relTypeBtn, relType === r.type && styles.relTypeBtnActive]}
                >
                  <Text style={[styles.relTypeText, relType === r.type && styles.relTypeTextActive]}>
                    {r.icon} {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleCheck}
              disabled={!canCheck}
              style={[styles.primaryBtn, !canCheck && styles.primaryBtnDisabled]}
            >
              <Text style={styles.primaryBtnText}>See the Dynamic</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Personality insights are based on psychological frameworks (inspired by Goldschneider).
              They increase self-awareness but are not deterministic.
            </Text>
          </>
        ) : (
          <>
            {/* Header */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderTitle}>You & {theirName.trim() || 'Them'}</Text>
              <Text style={styles.resultHeaderSub}>{result.me.name} + {result.them.name}</Text>
            </View>

            {/* YOUR PROFILE */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Text style={styles.profileEmoji}>🪞</Text>
                <View>
                  <Text style={styles.profileName}>You</Text>
                  <Text style={styles.profileType}>{result.me.name}</Text>
                </View>
              </View>
              <Text style={styles.profileStyle}>{result.me.communicationStyle}</Text>
              <Text style={styles.sectionLabel}>Strengths</Text>
              <Text style={styles.sectionText}>{result.me.strengths.join(', ')}</Text>
              <Text style={styles.sectionLabel}>Challenges</Text>
              <Text style={styles.sectionText}>{result.me.challenges.join(', ')}</Text>
              <Text style={styles.sectionLabel}>Under stress</Text>
              <Text style={styles.sectionText}>{result.me.stressResponse}</Text>
              <Text style={styles.sectionLabel}>Needs</Text>
              <Text style={styles.sectionText}>{result.me.needsInRelationships}</Text>
            </View>

            {/* THEIR PROFILE */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Text style={styles.profileEmoji}>✨</Text>
                <View>
                  <Text style={styles.profileName}>{theirName.trim() || 'Them'}</Text>
                  <Text style={styles.profileType}>{result.them.name}</Text>
                </View>
              </View>
              <Text style={styles.profileStyle}>{result.them.communicationStyle}</Text>
              <Text style={styles.sectionLabel}>Strengths</Text>
              <Text style={styles.sectionText}>{result.them.strengths.join(', ')}</Text>
              <Text style={styles.sectionLabel}>Challenges</Text>
              <Text style={styles.sectionText}>{result.them.challenges.join(', ')}</Text>
              <Text style={styles.sectionLabel}>Under stress</Text>
              <Text style={styles.sectionText}>{result.them.stressResponse}</Text>
              <Text style={styles.sectionLabel}>Needs</Text>
              <Text style={styles.sectionText}>{result.them.needsInRelationships}</Text>
            </View>

            {/* DYNAMIC */}
            {result.dynamic && (
              <View style={styles.dynamicCard}>
                <Text style={styles.dynamicTitle}>Your Dynamic</Text>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={[styles.dynamicLabel, { color: '#10B981' }]}>Strengths</Text>
                  </View>
                  {result.dynamic.strengths.map((s: string, i: number) => (
                    <Text key={i} style={styles.dynamicItem}>• {s}</Text>
                  ))}
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                    <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>Watch For</Text>
                  </View>
                  {result.dynamic.frictionPoints.map((f: string, i: number) => (
                    <Text key={i} style={styles.dynamicItem}>• {f}</Text>
                  ))}
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="chatbubble" size={16} color="#3B82F6" />
                    <Text style={[styles.dynamicLabel, { color: '#3B82F6' }]}>Communication Tip</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.communicationTip}</Text>
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="flash" size={16} color="#EC4899" />
                    <Text style={[styles.dynamicLabel, { color: '#EC4899' }]}>Conflict Pattern</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.conflictPattern}</Text>
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="heart" size={16} color="#14B8A6" />
                    <Text style={[styles.dynamicLabel, { color: '#14B8A6' }]}>What {theirName.trim() || 'They'} Need{theirName.trim() ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.whatTheyNeed}</Text>
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="heart-outline" size={16} color="#F59E0B" />
                    <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>What You Need</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.whatYouNeed}</Text>
                </View>
              </View>
            )}

            {/* AI INSIGHT */}
            {loading && (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={RELATE_ACCENT} />
                <Text style={styles.loadingText}>Psych is thinking...</Text>
              </View>
            )}

            {aiInsight ? (
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="sparkles" size={18} color={RELATE_ACCENT} />
                  <Text style={styles.insightTitle}>Psych says</Text>
                </View>
                <Text style={styles.insightText}>{aiInsight}</Text>
              </View>
            ) : null}

            {/* ACTIONS */}
            <View style={styles.actions}>
              {theirName.trim().length > 0 && (
                <Pressable onPress={handleAddToCircle} style={styles.primaryBtn}>
                  <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Add {theirName.trim()} to Circle</Text>
                </Pressable>
              )}
              <Pressable onPress={handleTryAnother} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Try Another</Text>
              </Pressable>
              <Pressable onPress={() => router.back()} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Done</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CARD_BORDER = 'rgba(255,255,255,0.06)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  backBtn: { padding: 8 },
  headerTitle: { ...TYPOGRAPHY.cardTitle, color: COLORS.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Input form
  prompt: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  optional: { color: COLORS.textMuted },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 16,
    padding: 14,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  // Relationship type buttons
  relTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  relTypeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  relTypeBtnActive: {
    backgroundColor: 'rgba(124,77,255,0.15)',
    borderColor: RELATE_ACCENT,
  },
  relTypeText: { color: COLORS.textMuted, fontSize: 14 },
  relTypeTextActive: { color: RELATE_ACCENT },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: RELATE_ACCENT,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginTop: 10,
  },
  secondaryBtnText: { fontSize: 16, color: COLORS.textMuted },
  ghostBtn: { padding: 12, alignItems: 'center', marginTop: 4 },
  ghostBtnText: { fontSize: 14, color: COLORS.textMuted },

  disclaimer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 16 },

  // Results header
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultHeaderTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  resultHeaderSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  // Profile cards
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  profileEmoji: { fontSize: 32 },
  profileName: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  profileType: { fontSize: 14, color: RELATE_ACCENT, fontWeight: '500' },
  profileStyle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 2 },
  sectionText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },

  // Dynamic card
  dynamicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  dynamicTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  dynamicSection: { marginBottom: 14 },
  dynamicLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dynamicLabel: { fontSize: 13, fontWeight: '600' },
  dynamicItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginLeft: 22, marginBottom: 2 },
  dynamicText: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginLeft: 22 },

  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  // AI insight
  insightCard: {
    backgroundColor: 'rgba(124,77,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.2)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: RELATE_ACCENT },
  insightText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },

  // Actions
  actions: { marginTop: 8 },
});
