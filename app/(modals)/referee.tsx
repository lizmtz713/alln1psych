/**
 * Referee — Settle disputes fairly. Enter both sides, get a balanced verdict.
 * Premium UI with Fortune 500 polish.
 */
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { StepProgressIndicator } from '../../src/components/ui/StepProgressIndicator';

type Phase = 'input' | 'clarify' | 'verdict';

const REFEREE_ACCENT = '#F59E0B'; // Whistle gold
const REFEREE_ACCENT_BG = 'rgba(245, 158, 11, 0.12)';
const REFEREE_ACCENT_BORDER = 'rgba(245, 158, 11, 0.25)';

const DISPUTE_TYPES = [
  { id: 'romantic', emoji: '💕', label: 'Partner' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'friend', emoji: '🤝', label: 'Friend' },
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'roommate', emoji: '🏠', label: 'Roommate' },
  { id: 'other', emoji: '💬', label: 'Other' },
] as const;

const REFEREE_CLARIFY_SYSTEM = `You are Psych in "Referee" mode — a fair, insightful mediator who helps people understand disputes.

The user has described both sides of a conflict. Your job is to ask 2-3 SHORT clarifying questions that will help you give a fair verdict. Focus on:
- Missing context that could change the picture
- The history between these people
- What each person actually wants (not just what they're arguing about)
- Whether there were any agreements or expectations broken

Keep questions direct and conversational. Number them. Don't be preachy.`;

const REFEREE_VERDICT_SYSTEM = `You are Psych in "Referee" mode — a fair, insightful mediator.

Based on both sides and the clarifying answers, give your verdict. Use these sections (ALL CAPS headers):

🏁 THE CALL
State who you think is more in the right, OR if it's genuinely a draw. Be direct. Don't hedge unless it's truly 50/50.

📍 SIDE A's POINT
What's valid about their position? What are they right about?

📍 SIDE B's POINT
What's valid about their position? What are they right about?

⚡ THE REAL ISSUE
What's this fight ACTUALLY about underneath? (Often it's not what people think.)

🤝 THE PATH FORWARD
One concrete suggestion for resolving this. Not generic advice — specific to their situation.

Be warm but honest. It's okay to say someone was wrong. People want truth, not empty validation.`;

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

export default function RefereeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [phase, setPhase] = useState<Phase>('input');
  const [disputeType, setDisputeType] = useState<string | null>(null);
  const [sideA, setSideA] = useState('');
  const [sideAName, setSideAName] = useState('');
  const [sideB, setSideB] = useState('');
  const [sideBName, setSideBName] = useState('');
  const [clarifyQuestions, setClarifyQuestions] = useState('');
  const [clarifyAnswers, setClarifyAnswers] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = sideA.trim().length >= 10 && sideB.trim().length >= 10 && disputeType !== null;

  const handleGetClarifyQuestions = async () => {
    if (!canSubmit || loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      const nameA = sideAName.trim() || 'Side A';
      const nameB = sideBName.trim() || 'Side B';
      
      const userContent = `Dispute type: ${disputeType}

${nameA}'s side:
${sideA}

${nameB}'s side:
${sideB}`;
      
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        REFEREE_CLARIFY_SYSTEM
      );
      
      setClarifyQuestions(response?.trim() ?? '');
      setPhase('clarify');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (e) {
      setClarifyQuestions("I couldn't process that right now. Try again in a moment.");
      setPhase('clarify');
    } finally {
      setLoading(false);
    }
  };

  const handleGetVerdict = async () => {
    if (loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      const nameA = sideAName.trim() || 'Side A';
      const nameB = sideBName.trim() || 'Side B';
      
      const userContent = `Dispute type: ${disputeType}

${nameA}'s side:
${sideA}

${nameB}'s side:
${sideB}

My clarifying questions:
${clarifyQuestions}

User's answers:
${clarifyAnswers.trim() || '(No additional context provided)'}`;
      
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        REFEREE_VERDICT_SYSTEM
      );
      
      setVerdict(response?.trim() ?? '');
      setPhase('verdict');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (e) {
      setVerdict("I couldn't generate a verdict right now. Try again in a moment.");
      setPhase('verdict');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipClarify = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetVerdict();
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 'input') {
      router.back();
    } else if (phase === 'verdict') {
      setPhase('clarify');
    } else {
      setPhase('input');
    }
  };

  const startOver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('input');
    setDisputeType(null);
    setSideA('');
    setSideAName('');
    setSideB('');
    setSideBName('');
    setClarifyQuestions('');
    setClarifyAnswers('');
    setVerdict('');
  };

  const getHeaderTitle = () => {
    switch (phase) {
      case 'clarify': return 'Quick Questions';
      case 'verdict': return 'The Verdict';
      default: return 'Referee';
    }
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={REFEREE_ACCENT} />
          </Pressable>
          <View style={styles.progressContainer}>
            <StepProgressIndicator 
              currentStep={['input', 'clarify', 'verdict'].indexOf(phase) + 1} 
              totalSteps={3}
              accentColor={REFEREE_ACCENT}
            />
          </View>
          <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {phase === 'input' && (
            <>
              {/* Hero */}
              <AnimatedSection delay={0}>
                <View style={styles.heroSection}>
                  <Text style={styles.heroEmoji}>⚖️</Text>
                  <Text style={styles.heroTitle}>Settle It</Text>
                  <Text style={styles.heroSubtitle}>
                    Enter both sides of the dispute.{'\n'}
                    Get a fair, honest verdict.
                  </Text>
                </View>
              </AnimatedSection>

              {/* Dispute Type */}
              <AnimatedSection delay={100}>
                <Text style={styles.inputLabel}>What kind of relationship?</Text>
                <View style={styles.typeGrid}>
                  {DISPUTE_TYPES.map((t) => (
                    <Pressable
                      key={t.id}
                      style={[
                        styles.typeCard,
                        disputeType === t.id && styles.typeCardSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDisputeType(t.id);
                      }}
                    >
                      <Text style={styles.typeEmoji}>{t.emoji}</Text>
                      <Text style={[styles.typeLabel, disputeType === t.id && styles.typeLabelSelected]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </AnimatedSection>

              {/* Side A */}
              <AnimatedSection delay={150}>
                <View style={styles.sideHeader}>
                  <View style={[styles.sideBadge, { backgroundColor: '#4ADE80' + '30' }]}>
                    <Text style={[styles.sideBadgeText, { color: '#4ADE80' }]}>A</Text>
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Their name (optional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={sideAName}
                    onChangeText={setSideAName}
                  />
                </View>
                <TextInput
                  style={styles.sideInput}
                  placeholder="What's their side of the story? What do they think happened?"
                  placeholderTextColor={COLORS.textMuted}
                  value={sideA}
                  onChangeText={setSideA}
                  multiline
                  textAlignVertical="top"
                />
              </AnimatedSection>

              {/* Side B */}
              <AnimatedSection delay={200}>
                <View style={styles.sideHeader}>
                  <View style={[styles.sideBadge, { backgroundColor: '#60A5FA' + '30' }]}>
                    <Text style={[styles.sideBadgeText, { color: '#60A5FA' }]}>B</Text>
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Their name (optional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={sideBName}
                    onChangeText={setSideBName}
                  />
                </View>
                <TextInput
                  style={styles.sideInput}
                  placeholder="What's the other side? What do they believe?"
                  placeholderTextColor={COLORS.textMuted}
                  value={sideB}
                  onChangeText={setSideB}
                  multiline
                  textAlignVertical="top"
                />
              </AnimatedSection>

              {/* Submit */}
              <AnimatedSection delay={250}>
                {loading ? (
                  <View style={styles.loadingCard}>
                    <ActivityIndicator color={REFEREE_ACCENT} />
                    <Text style={styles.loadingText}>Reviewing the case...</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
                    onPress={handleGetClarifyQuestions}
                    disabled={!canSubmit}
                  >
                    <Text style={styles.primaryBtnText}>🏁 Make the Call</Text>
                  </Pressable>
                )}
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Text style={styles.disclaimer}>
                  Referee helps you see both perspectives clearly. It's not legal advice,
                  and relationships are complex — use your judgment alongside the verdict.
                </Text>
              </AnimatedSection>
            </>
          )}

          {phase === 'clarify' && (
            <>
              <AnimatedSection delay={0}>
                <View style={styles.clarifyCard}>
                  <View style={styles.clarifyHeader}>
                    <Ionicons name="help-circle" size={24} color={REFEREE_ACCENT} />
                    <Text style={styles.clarifyTitle}>A few quick questions</Text>
                  </View>
                  <Text style={styles.clarifyText}>{clarifyQuestions}</Text>
                </View>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Your answers (or skip if you don't have more context)..."
                  placeholderTextColor={COLORS.textMuted}
                  value={clarifyAnswers}
                  onChangeText={setClarifyAnswers}
                  multiline
                  textAlignVertical="top"
                />
              </AnimatedSection>

              <AnimatedSection delay={150}>
                {loading ? (
                  <View style={styles.loadingCard}>
                    <ActivityIndicator color={REFEREE_ACCENT} />
                    <Text style={styles.loadingText}>Deliberating...</Text>
                  </View>
                ) : (
                  <>
                    <Pressable style={styles.primaryBtn} onPress={handleGetVerdict}>
                      <Text style={styles.primaryBtnText}>Get the Verdict</Text>
                    </Pressable>
                    <Pressable style={styles.ghostBtn} onPress={handleSkipClarify}>
                      <Text style={styles.ghostBtnText}>Skip — I don't have more info</Text>
                    </Pressable>
                  </>
                )}
              </AnimatedSection>
            </>
          )}

          {phase === 'verdict' && (
            <>
              <AnimatedSection delay={0}>
                <View style={styles.verdictCard}>
                  <VerdictContent text={verdict} nameA={sideAName.trim() || 'Side A'} nameB={sideBName.trim() || 'Side B'} />
                </View>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Done</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={startOver}>
                  <Text style={styles.secondaryBtnText}>New Dispute</Text>
                </Pressable>
              </AnimatedSection>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

function VerdictContent({ text, nameA, nameB }: { text: string; nameA: string; nameB: string }) {
  // Parse sections by emoji headers
  const sections = text.split(/(?=🏁|📍|⚡|🤝)/g).filter(Boolean);
  
  return (
    <View>
      {sections.map((section, i) => {
        const isCall = section.startsWith('🏁');
        const isSideA = section.includes('SIDE A');
        const isSideB = section.includes('SIDE B');
        const isRealIssue = section.startsWith('⚡');
        const isPath = section.startsWith('🤝');
        
        let bgColor = 'transparent';
        if (isCall) bgColor = REFEREE_ACCENT_BG;
        if (isSideA) bgColor = 'rgba(74, 222, 128, 0.08)';
        if (isSideB) bgColor = 'rgba(96, 165, 250, 0.08)';
        
        // Replace generic labels with names
        let displayText = section
          .replace(/Side A/g, nameA)
          .replace(/SIDE A/g, nameA.toUpperCase());
        displayText = displayText
          .replace(/Side B/g, nameB)
          .replace(/SIDE B/g, nameB.toUpperCase());
        
        const lines = displayText.split('\n');
        const header = lines[0];
        const body = lines.slice(1).join('\n').trim();
        
        return (
          <View key={i} style={[styles.verdictSection, { backgroundColor: bgColor }]}>
            <Text style={[styles.verdictHeader, isCall && { color: REFEREE_ACCENT }]}>
              {header}
            </Text>
            {body && <Text style={styles.verdictBody}>{body}</Text>}
          </View>
        );
      })}
    </View>
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
  progressContainer: { 
    flex: 1, 
    alignItems: 'center' 
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
    lineHeight: 22,
  },
  
  // Dispute Types
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  typeCardSelected: {
    backgroundColor: REFEREE_ACCENT_BG,
    borderColor: REFEREE_ACCENT_BORDER,
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
  },
  typeLabelSelected: {
    color: REFEREE_ACCENT,
  },
  
  // Side Inputs
  sideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sideBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBadgeText: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
  },
  nameInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sideInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    textAlignVertical: 'top',
  },
  
  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: REFEREE_ACCENT,
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
  
  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
  },
  
  // Disclaimer
  disclaimer: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  
  // Clarify
  clarifyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clarifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  clarifyTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
  },
  clarifyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    textAlignVertical: 'top',
  },
  
  // Verdict
  verdictCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verdictSection: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  verdictHeader: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  verdictBody: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineHeight: 22,
  },
});
