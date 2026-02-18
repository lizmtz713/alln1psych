/**
 * Relate — Understand anyone through personality dynamics.
 * Premium UI with Fortune 500 polish.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';
import { getPersonality, getRelationshipDynamic } from '../../src/services/personology';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RelType = 'romantic' | 'family' | 'friendship' | 'work';

const RELATE_ACCENT = '#7C4DFF';
const RELATE_ACCENT_BG = 'rgba(124, 77, 255, 0.12)';
const RELATE_ACCENT_BORDER = 'rgba(124, 77, 255, 0.25)';

const REL_TYPES: { type: RelType; icon: string; label: string; color: string }[] = [
  { type: 'romantic', icon: '💕', label: 'Romantic', color: '#EC4899' },
  { type: 'family', icon: '👨‍👩‍👧', label: 'Family', color: '#14B8A6' },
  { type: 'friendship', icon: '🤝', label: 'Friendship', color: '#F59E0B' },
  { type: 'work', icon: '💼', label: 'Work', color: '#3B82F6' },
];

function isoToMMDDYYYY(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
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

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Relate</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          ref={scrollRef}
          style={styles.scroll} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!result ? (
            <>
              {/* Hero */}
              <AnimatedSection delay={0}>
                <View style={styles.heroSection}>
                  <Text style={styles.heroEmoji}>💫</Text>
                  <Text style={styles.heroTitle}>Understand Anyone</Text>
                  <Text style={styles.heroSubtitle}>
                    Enter two birthdays. Discover the dynamic between you.
                  </Text>
                </View>
              </AnimatedSection>

              {/* Your Birthday */}
              <AnimatedSection delay={100}>
                <Text style={styles.inputLabel}>Your birthday</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  value={myBirthday}
                  onChangeText={(t) => formatBirthday(t, setMyBirthday)}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </AnimatedSection>

              {/* Their Info */}
              <AnimatedSection delay={150}>
                <Text style={styles.inputLabel}>Their name <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex, Mom, my boss"
                  placeholderTextColor={COLORS.textMuted}
                  value={theirName}
                  onChangeText={setTheirName}
                />
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <Text style={styles.inputLabel}>Their birthday</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  value={theirBirthday}
                  onChangeText={(t) => formatBirthday(t, setTheirBirthday)}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </AnimatedSection>

              {/* Relationship Type */}
              <AnimatedSection delay={250}>
                <Text style={styles.inputLabel}>What's the relationship?</Text>
                <View style={styles.relTypeGrid}>
                  {REL_TYPES.map((r) => (
                    <Pressable
                      key={r.type}
                      style={[
                        styles.relTypeCard,
                        relType === r.type && styles.relTypeCardSelected,
                        relType === r.type && { borderColor: r.color + '60' },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRelType(r.type);
                      }}
                    >
                      <Text style={styles.relTypeEmoji}>{r.icon}</Text>
                      <Text style={[styles.relTypeLabel, relType === r.type && { color: r.color }]}>
                        {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </AnimatedSection>

              {/* Check Button */}
              <AnimatedSection delay={300}>
                <Pressable
                  style={[styles.primaryBtn, !canCheck && styles.primaryBtnDisabled]}
                  onPress={handleCheck}
                  disabled={!canCheck}
                >
                  <Text style={styles.primaryBtnText}>See the Dynamic</Text>
                </Pressable>
              </AnimatedSection>

              {/* Disclaimer */}
              <AnimatedSection delay={350}>
                <Text style={styles.disclaimer}>
                  Personality insights are based on psychological frameworks and increase self-awareness.
                  They are not deterministic. Your choices and growth matter more than any profile.
                </Text>
              </AnimatedSection>
            </>
          ) : (
            <>
              {/* Results */}
              <AnimatedSection delay={0}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    You & {theirName.trim() || 'Them'}
                  </Text>
                  <Text style={styles.resultSubtitle}>
                    {result.me.name} + {result.them.name}
                  </Text>
                </View>
              </AnimatedSection>

              {/* Their Profile */}
              <AnimatedSection delay={100}>
                <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                    <Text style={styles.profileEmoji}>✨</Text>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{theirName.trim() || 'Them'}</Text>
                      <Text style={styles.profileType}>{result.them.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.profileStyle}>{result.them.communicationStyle}</Text>
                  
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Strengths</Text>
                    <Text style={styles.profileSectionText}>{result.them.strengths.join(', ')}</Text>
                  </View>
                  
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Under stress</Text>
                    <Text style={styles.profileSectionText}>{result.them.stressResponse}</Text>
                  </View>
                  
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Needs</Text>
                    <Text style={styles.profileSectionText}>{result.them.needsInRelationships}</Text>
                  </View>
                </View>
              </AnimatedSection>

              {/* Dynamic */}
              {result.dynamic && (
                <AnimatedSection delay={200}>
                  <View style={styles.dynamicCard}>
                    <Text style={styles.dynamicTitle}>Your Dynamic</Text>
                    
                    <View style={styles.dynamicSection}>
                      <View style={styles.dynamicSectionHeader}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                        <Text style={[styles.dynamicSectionTitle, { color: COLORS.success }]}>Strengths</Text>
                      </View>
                      {result.dynamic.strengths.map((s: string, i: number) => (
                        <Text key={i} style={styles.dynamicItem}>• {s}</Text>
                      ))}
                    </View>
                    
                    <View style={styles.dynamicSection}>
                      <View style={styles.dynamicSectionHeader}>
                        <Ionicons name="alert-circle" size={18} color={COLORS.warning} />
                        <Text style={[styles.dynamicSectionTitle, { color: COLORS.warning }]}>Watch For</Text>
                      </View>
                      {result.dynamic.frictionPoints.map((f: string, i: number) => (
                        <Text key={i} style={styles.dynamicItem}>• {f}</Text>
                      ))}
                    </View>
                    
                    <View style={styles.dynamicSection}>
                      <View style={styles.dynamicSectionHeader}>
                        <Ionicons name="chatbubble" size={18} color={COLORS.info} />
                        <Text style={[styles.dynamicSectionTitle, { color: COLORS.info }]}>Communication Tip</Text>
                      </View>
                      <Text style={styles.dynamicTip}>{result.dynamic.communicationTip}</Text>
                    </View>
                  </View>
                </AnimatedSection>
              )}

              {/* AI Insight */}
              {loading && (
                <AnimatedSection delay={0}>
                  <View style={styles.loadingCard}>
                    <ActivityIndicator color={RELATE_ACCENT} />
                    <Text style={styles.loadingText}>Psych is thinking...</Text>
                  </View>
                </AnimatedSection>
              )}
              
              {aiInsight && (
                <AnimatedSection delay={300}>
                  <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <View style={styles.insightIcon}>
                        <Ionicons name="sparkles" size={18} color={RELATE_ACCENT} />
                      </View>
                      <Text style={styles.insightTitle}>Psych says</Text>
                    </View>
                    <Text style={styles.insightText}>{aiInsight}</Text>
                  </View>
                </AnimatedSection>
              )}

              {/* Actions */}
              <AnimatedSection delay={400}>
                <View style={styles.actionsContainer}>
                  {theirName.trim().length > 0 && (
                    <Pressable style={styles.primaryBtn} onPress={handleAddToCircle}>
                      <Ionicons name="person-add" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryBtnText}>Add {theirName.trim()} to Circle</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.secondaryBtn} onPress={handleTryAnother}>
                    <Text style={styles.secondaryBtnText}>Try Another</Text>
                  </Pressable>
                  <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
                    <Text style={styles.ghostBtnText}>Done</Text>
                  </Pressable>
                </View>
              </AnimatedSection>
            </>
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  headerRight: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Inputs
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  optional: {
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  
  // Relationship Types
  relTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  relTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  relTypeCardSelected: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.borderAccent,
  },
  relTypeEmoji: {
    fontSize: 18,
  },
  relTypeLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  
  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: RELATE_ACCENT,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.labelLg,
    color: '#FFF',
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  secondaryBtnText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
  },
  ghostBtn: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  ghostBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
  },
  
  // Disclaimer
  disclaimer: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  
  // Results
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  resultTitle: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  profileType: {
    ...TYPOGRAPHY.labelMd,
    color: RELATE_ACCENT,
  },
  profileStyle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  profileSection: {
    marginBottom: SPACING.md,
  },
  profileSectionTitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSectionText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text,
    lineHeight: 20,
  },
  
  // Dynamic Card
  dynamicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dynamicTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  dynamicSection: {
    marginBottom: SPACING.lg,
  },
  dynamicSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dynamicSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '600',
  },
  dynamicItem: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xxl,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  dynamicTip: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginLeft: SPACING.xxl,
    lineHeight: 22,
  },
  
  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
  },
  
  // Insight Card
  insightCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    ...TYPOGRAPHY.labelMd,
    color: RELATE_ACCENT,
    fontWeight: '600',
  },
  insightText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineHeight: 24,
  },
  
  // Actions
  actionsContainer: {
    marginTop: SPACING.md,
  },
});
