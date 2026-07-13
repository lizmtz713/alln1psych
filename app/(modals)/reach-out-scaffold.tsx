/**
 * Reach-Out Scaffold — Interactive reconnection builder
 * 
 * Helps you actually craft a message or repair conversation,
 * not just read about it.
 */
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { callAI, hasOpenAIKey } from '../../src/services/ai';
import { useAuth } from '../../src/providers/AuthProvider';
import { fetchLatestSummaryForPerson, buildShowUpToneHint } from '../../src/services/showUpService';

const BG = COLORS.background;
const SURFACE = COLORS.surface;
const TEXT_COLOR = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = '#14b8a6';
const CONNECTION_PINK = '#EC4899';
const BORDER = COLORS.border;

type Step = 'who' | 'context' | 'action' | 'build' | 'done';
type Context = 'drifted' | 'conflict' | 'busy' | 'something-happened';
type Action = 'check-in' | 'repair' | 'plan-time';

interface UserData {
  personName: string;
  context: Context | null;
  action: Action | null;
  // For check-in
  checkInTone: 'warm' | 'light' | 'curious' | null;
  checkInMessage: string;
  // For repair
  repairOpen: string;
  repairAcknowledge: string;
  repairAsk: string;
  repairClose: string;
  // For plan time
  activityIdea: string;
}

const CONTEXTS = [
  { id: 'drifted', emoji: '🌫️', label: "We've drifted apart", desc: 'No conflict, just... distance' },
  { id: 'conflict', emoji: '⚡', label: 'There was a conflict', desc: 'Something happened between us' },
  { id: 'busy', emoji: '🏃', label: 'Life got busy', desc: "We've both been caught up in our own stuff" },
  { id: 'something-happened', emoji: '💔', label: 'Something happened to them', desc: 'They went through something hard' },
] as const;

const ACTIONS = {
  drifted: [
    { id: 'check-in', emoji: '💬', label: 'Send a light check-in', desc: 'Break the ice without pressure' },
    { id: 'plan-time', emoji: '📅', label: 'Suggest getting together', desc: 'Propose low-pressure time together' },
  ],
  conflict: [
    { id: 'repair', emoji: '🔧', label: 'Start a repair conversation', desc: 'Address what happened thoughtfully' },
    { id: 'check-in', emoji: '💬', label: 'Test the waters first', desc: 'Send a small message to see where things stand' },
  ],
  busy: [
    { id: 'check-in', emoji: '💬', label: 'Send a thinking-of-you message', desc: 'Let them know they matter' },
    { id: 'plan-time', emoji: '📅', label: 'Make a plan to reconnect', desc: 'Put something on the calendar' },
  ],
  'something-happened': [
    { id: 'check-in', emoji: '💬', label: 'Reach out with support', desc: "Let them know you're there" },
    { id: 'plan-time', emoji: '📅', label: 'Offer specific help', desc: 'Propose something concrete' },
  ],
} as const;

const CHECK_IN_TONES = [
  { id: 'warm', emoji: '💜', label: 'Warm', example: 'Hey, I was thinking about you...' },
  { id: 'light', emoji: '☀️', label: 'Light', example: 'Hey! How have you been?' },
  { id: 'curious', emoji: '🤔', label: 'Curious', example: "What's new in your world?" },
] as const;

export default function ReachOutScaffoldScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    days?: string;
    showUpPersonId?: string;
    showUpPersonName?: string;
  }>();
  const days = parseInt(params.days || '2', 10);
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('who');
  const [showUpPreferencesLine, setShowUpPreferencesLine] = useState<string | null>(null);
  const [data, setData] = useState<UserData>({
    personName: params.showUpPersonName?.trim() || '',
    context: null,
    action: null,
    checkInTone: null,
    checkInMessage: '',
    repairOpen: '',
    repairAcknowledge: '',
    repairAsk: '',
    repairClose: '',
    activityIdea: '',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const pid = params.showUpPersonId;
    if (!pid || !user?.id) return;
    (async () => {
      const pair = await fetchLatestSummaryForPerson(user.id, pid);
      const line = pair?.summary ? buildShowUpToneHint(pair.summary) : null;
      setShowUpPreferencesLine(line);
    })();
  }, [params.showUpPersonId, user?.id]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'context') setStep('who');
    else if (step === 'action') setStep('context');
    else if (step === 'build') setStep('action');
    else if (step === 'done') setStep('build');
  };

  const handleNext = (nextStep: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(nextStep);
  };

  const selectContext = (ctx: Context) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setData((d) => ({ ...d, context: ctx }));
    handleNext('action');
  };

  const selectAction = (action: Action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setData((d) => ({ ...d, action }));
    handleNext('build');
  };

  const selectTone = (tone: 'warm' | 'light' | 'curious') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setData((d) => ({ ...d, checkInTone: tone }));
  };

  const getAIHelp = useCallback(async (type: 'check-in' | 'repair' | 'plan') => {
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('AI unavailable', 'Your secure AI session is unavailable. Sign in again or try later.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAiLoading(true);

    try {
      let prompt = '';
      const name = data.personName || 'them';
      const contextLabel = CONTEXTS.find((c) => c.id === data.context)?.label || 'we drifted apart';

      const pref =
        showUpPreferencesLine?.trim() &&
        `\nTheir preferences (honor these): ${showUpPreferencesLine.trim()}`;

      if (type === 'check-in') {
        const toneLabel = data.checkInTone || 'warm';
        prompt = `Write a short, ${toneLabel} check-in message to ${name}. Context: ${contextLabel}. 
Keep it 1-2 sentences. Natural, not formal. Just the message text, no quotes or explanation.${pref || ''}`;
      } else if (type === 'repair') {
        prompt = `Help me write a repair conversation opener to ${name}. Context: ${contextLabel}.${pref || ''}
I need 4 short phrases:
1. OPEN: Signal I want to connect, not fight (1 sentence)
2. ACKNOWLEDGE: What I might have contributed (1 sentence)  
3. ASK: Invite their perspective (1 sentence)
4. CLOSE: Affirm the relationship matters (1 sentence)

Format as:
OPEN: [text]
ACKNOWLEDGE: [text]
ASK: [text]
CLOSE: [text]`;
      } else {
        prompt = `Suggest a specific, low-pressure way to spend time with ${name}. Context: ${contextLabel}.
Keep it casual and concrete. Just 1-2 sentences with a specific activity idea.${pref || ''}`;
      }

      const response = await callAI([{ role: 'user', content: prompt }], {
        temperature: 0.8,
        max_tokens: 300,
      });

      if (type === 'check-in') {
        setData((d) => ({ ...d, checkInMessage: response?.trim() || '' }));
      } else if (type === 'repair') {
        // Parse the response
        const lines = response?.split('\n') || [];
        const open = lines.find((l) => l.startsWith('OPEN:'))?.replace('OPEN:', '').trim() || '';
        const ack = lines.find((l) => l.startsWith('ACKNOWLEDGE:'))?.replace('ACKNOWLEDGE:', '').trim() || '';
        const ask = lines.find((l) => l.startsWith('ASK:'))?.replace('ASK:', '').trim() || '';
        const close = lines.find((l) => l.startsWith('CLOSE:'))?.replace('CLOSE:', '').trim() || '';
        setData((d) => ({ ...d, repairOpen: open, repairAcknowledge: ack, repairAsk: ask, repairClose: close }));
      } else {
        setData((d) => ({ ...d, activityIdea: response?.trim() || '' }));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate suggestion. Try again.');
    } finally {
      setAiLoading(false);
    }
  }, [data, showUpPreferencesLine]);

  const getFinalMessage = () => {
    if (data.action === 'check-in') {
      return data.checkInMessage;
    } else if (data.action === 'repair') {
      return `${data.repairOpen}\n\n${data.repairAcknowledge}\n\n${data.repairAsk}\n\n${data.repairClose}`;
    } else {
      return data.activityIdea;
    }
  };

  const handleCopy = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(getFinalMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: getFinalMessage() });
    } catch (e) {}
  };

  const handlePractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/role-play');
  };

  const canProceedToAction = data.context !== null;
  const canFinish = () => {
    if (data.action === 'check-in') return data.checkInMessage.trim().length > 0;
    if (data.action === 'repair') return data.repairOpen.trim().length > 0;
    if (data.action === 'plan-time') return data.activityIdea.trim().length > 0;
    return false;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        {step !== 'who' ? (
          <Pressable onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
        <Text style={styles.headerTitle}>Reach Out</Text>
        <Pressable onPress={handleClose} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP: Who */}
        {step === 'who' && (
          <>
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <Ionicons name="heart" size={32} color={CONNECTION_PINK} />
              </View>
              <Text style={styles.heroTitle}>Connection has been low for {days} days</Text>
              <Text style={styles.heroSubtitle}>Let's help you reconnect</Text>
            </View>

            {showUpPreferencesLine ? (
              <View style={styles.showUpBanner}>
                <Text style={styles.showUpBannerTitle}>What helps them</Text>
                <Text style={styles.showUpBannerText}>{showUpPreferencesLine}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Who do you want to reach out to?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Their name or relationship (mom, Alex, etc.)"
              placeholderTextColor={TEXT_MUTED}
              value={data.personName}
              onChangeText={(t) => setData((d) => ({ ...d, personName: t }))}
              autoFocus
            />

            <Pressable
              style={[styles.primaryBtn, !data.personName.trim() && styles.btnDisabled]}
              onPress={() => handleNext('context')}
              disabled={!data.personName.trim()}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>

            <Pressable style={styles.skipBtn} onPress={() => handleNext('context')}>
              <Text style={styles.skipBtnText}>Skip — I'll keep it general</Text>
            </Pressable>
          </>
        )}

        {/* STEP: Context */}
        {step === 'context' && (
          <>
            <Text style={styles.stepTitle}>
              What's the situation with {data.personName || 'them'}?
            </Text>
            <Text style={styles.stepSubtitle}>This helps me suggest the right approach</Text>

            <View style={styles.optionsList}>
              {CONTEXTS.map((ctx) => (
                <Pressable
                  key={ctx.id}
                  style={[styles.optionCard, data.context === ctx.id && styles.optionCardSelected]}
                  onPress={() => selectContext(ctx.id)}
                >
                  <Text style={styles.optionEmoji}>{ctx.emoji}</Text>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, data.context === ctx.id && styles.optionLabelSelected]}>
                      {ctx.label}
                    </Text>
                    <Text style={styles.optionDesc}>{ctx.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* STEP: Action */}
        {step === 'action' && data.context && (
          <>
            <Text style={styles.stepTitle}>How do you want to reconnect?</Text>
            <Text style={styles.stepSubtitle}>
              Based on what you shared, here are some options
            </Text>

            <View style={styles.optionsList}>
              {ACTIONS[data.context].map((action) => (
                <Pressable
                  key={action.id}
                  style={[styles.optionCard, data.action === action.id && styles.optionCardSelected]}
                  onPress={() => selectAction(action.id as Action)}
                >
                  <Text style={styles.optionEmoji}>{action.emoji}</Text>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, data.action === action.id && styles.optionLabelSelected]}>
                      {action.label}
                    </Text>
                    <Text style={styles.optionDesc}>{action.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
                </Pressable>
              ))}
            </View>

            {/* Regulate first */}
            <Pressable
              style={styles.regulateCard}
              onPress={() => router.push('/(modals)/quick-reset')}
            >
              <Ionicons name="pulse" size={20} color={ACCENT} />
              <Text style={styles.regulateText}>Want to regulate first? A 2-min reset can help</Text>
              <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
            </Pressable>
          </>
        )}

        {/* STEP: Build */}
        {step === 'build' && (
          <>
            {/* CHECK-IN Builder */}
            {data.action === 'check-in' && (
              <>
                <Text style={styles.stepTitle}>Craft your message</Text>
                <Text style={styles.stepSubtitle}>
                  Pick a tone, then write (or let AI help)
                </Text>

                <Text style={styles.sectionLabel}>TONE</Text>
                <View style={styles.toneRow}>
                  {CHECK_IN_TONES.map((tone) => (
                    <Pressable
                      key={tone.id}
                      style={[styles.toneChip, data.checkInTone === tone.id && styles.toneChipSelected]}
                      onPress={() => selectTone(tone.id)}
                    >
                      <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                      <Text style={[styles.toneLabel, data.checkInTone === tone.id && styles.toneLabelSelected]}>
                        {tone.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder={`Write your message to ${data.personName || 'them'}...`}
                  placeholderTextColor={TEXT_MUTED}
                  value={data.checkInMessage}
                  onChangeText={(t) => setData((d) => ({ ...d, checkInMessage: t }))}
                  multiline
                  textAlignVertical="top"
                />

                <Pressable
                  style={styles.aiHelpBtn}
                  onPress={() => getAIHelp('check-in')}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color={ACCENT} />
                      <Text style={styles.aiHelpText}>Help me write this</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}

            {/* REPAIR Builder */}
            {data.action === 'repair' && (
              <>
                <Text style={styles.stepTitle}>Build your repair script</Text>
                <Text style={styles.stepSubtitle}>
                  Fill in each part — these are prompts, not scripts
                </Text>

                <View style={styles.repairBuilder}>
                  <View style={styles.repairStep}>
                    <View style={styles.repairStepHeader}>
                      <View style={styles.repairNum}><Text style={styles.repairNumText}>1</Text></View>
                      <View>
                        <Text style={styles.repairLabel}>OPEN</Text>
                        <Text style={styles.repairHint}>Signal you want to connect, not fight</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.repairInput}
                      placeholder="e.g., Hey, I've been wanting to talk..."
                      placeholderTextColor={TEXT_MUTED}
                      value={data.repairOpen}
                      onChangeText={(t) => setData((d) => ({ ...d, repairOpen: t }))}
                      multiline
                    />
                  </View>

                  <View style={styles.repairStep}>
                    <View style={styles.repairStepHeader}>
                      <View style={styles.repairNum}><Text style={styles.repairNumText}>2</Text></View>
                      <View>
                        <Text style={styles.repairLabel}>ACKNOWLEDGE</Text>
                        <Text style={styles.repairHint}>Name what you might have contributed</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.repairInput}
                      placeholder="e.g., I know I wasn't great at..."
                      placeholderTextColor={TEXT_MUTED}
                      value={data.repairAcknowledge}
                      onChangeText={(t) => setData((d) => ({ ...d, repairAcknowledge: t }))}
                      multiline
                    />
                  </View>

                  <View style={styles.repairStep}>
                    <View style={styles.repairStepHeader}>
                      <View style={styles.repairNum}><Text style={styles.repairNumText}>3</Text></View>
                      <View>
                        <Text style={styles.repairLabel}>ASK</Text>
                        <Text style={styles.repairHint}>Invite their perspective</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.repairInput}
                      placeholder="e.g., How did it feel from your side?"
                      placeholderTextColor={TEXT_MUTED}
                      value={data.repairAsk}
                      onChangeText={(t) => setData((d) => ({ ...d, repairAsk: t }))}
                      multiline
                    />
                  </View>

                  <View style={styles.repairStep}>
                    <View style={styles.repairStepHeader}>
                      <View style={[styles.repairNum, { backgroundColor: CONNECTION_PINK + '20' }]}>
                        <Text style={[styles.repairNumText, { color: CONNECTION_PINK }]}>4</Text>
                      </View>
                      <View>
                        <Text style={[styles.repairLabel, { color: CONNECTION_PINK }]}>CLOSE</Text>
                        <Text style={styles.repairHint}>Affirm the relationship matters</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.repairInput}
                      placeholder="e.g., I care about us. I want to work through this."
                      placeholderTextColor={TEXT_MUTED}
                      value={data.repairClose}
                      onChangeText={(t) => setData((d) => ({ ...d, repairClose: t }))}
                      multiline
                    />
                  </View>
                </View>

                <Pressable
                  style={styles.aiHelpBtn}
                  onPress={() => getAIHelp('repair')}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color={ACCENT} />
                      <Text style={styles.aiHelpText}>Help me write all of these</Text>
                    </>
                  )}
                </Pressable>

                <Pressable style={styles.practiceBtn} onPress={handlePractice}>
                  <Ionicons name="chatbubbles-outline" size={18} color={ACCENT} />
                  <Text style={styles.practiceBtnText}>Practice this conversation with AI</Text>
                </Pressable>
              </>
            )}

            {/* PLAN TIME Builder */}
            {data.action === 'plan-time' && (
              <>
                <Text style={styles.stepTitle}>Plan something together</Text>
                <Text style={styles.stepSubtitle}>
                  Low-pressure activities often open conversation naturally
                </Text>

                <Text style={styles.sectionLabel}>YOUR IDEA</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder={`What could you do with ${data.personName || 'them'}? Be specific — "coffee Tuesday" beats "hang out sometime"`}
                  placeholderTextColor={TEXT_MUTED}
                  value={data.activityIdea}
                  onChangeText={(t) => setData((d) => ({ ...d, activityIdea: t }))}
                  multiline
                  textAlignVertical="top"
                />

                <Pressable
                  style={styles.aiHelpBtn}
                  onPress={() => getAIHelp('plan')}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color={ACCENT} />
                      <Text style={styles.aiHelpText}>Suggest something for us</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}

            {/* Continue button */}
            <Pressable
              style={[styles.primaryBtn, !canFinish() && styles.btnDisabled]}
              onPress={() => handleNext('done')}
              disabled={!canFinish()}
            >
              <Text style={styles.primaryBtnText}>Review & Copy</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <>
            <View style={styles.doneHeader}>
              <Ionicons name="checkmark-circle" size={48} color={ACCENT} />
              <Text style={styles.doneTitle}>Your message is ready</Text>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>TO: {data.personName || 'Someone'}</Text>
              <Text style={styles.previewText}>{getFinalMessage()}</Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.actionBtn} onPress={handleCopy}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={ACCENT} />
                <Text style={styles.actionBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={ACCENT} />
                <Text style={styles.actionBtnText}>Share</Text>
              </Pressable>
            </View>

            {data.action === 'repair' && (
              <Pressable style={styles.practiceBtn} onPress={handlePractice}>
                <Ionicons name="chatbubbles-outline" size={18} color={ACCENT} />
                <Text style={styles.practiceBtnText}>Practice saying this with AI</Text>
              </Pressable>
            )}

            <Pressable style={styles.secondaryBtn} onPress={() => setStep('build')}>
              <Text style={styles.secondaryBtnText}>Edit message</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💜 Connection ebbs and flows. You're doing something brave by reaching out.
              </Text>
            </View>
          </>
        )}
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
    paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: TEXT_COLOR },
  
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CONNECTION_PINK + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '600', color: TEXT_COLOR, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: TEXT_MUTED, textAlign: 'center' },

  // Inputs
  inputLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR, marginBottom: 12 },
  textInput: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    fontSize: 16,
    color: TEXT_COLOR,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipBtnText: { fontSize: 15, color: TEXT_MUTED },
  secondaryBtn: { alignItems: 'center', paddingVertical: 16 },
  secondaryBtnText: { fontSize: 15, color: ACCENT, fontWeight: '500' },

  // Steps
  stepTitle: { fontSize: 24, fontWeight: '700', color: TEXT_COLOR, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, letterSpacing: 1, marginBottom: 12, marginTop: 8 },

  // Options
  optionsList: { gap: 12, marginBottom: 20 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '08' },
  optionEmoji: { fontSize: 28, marginRight: 14 },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR, marginBottom: 4 },
  optionLabelSelected: { color: ACCENT },
  optionDesc: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },

  // Regulate card
  regulateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT + '10',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  regulateText: { flex: 1, fontSize: 14, color: TEXT_COLOR },

  // Tones
  toneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toneChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneChipSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '10' },
  toneEmoji: { fontSize: 24, marginBottom: 6 },
  toneLabel: { fontSize: 14, fontWeight: '500', color: TEXT_MUTED },
  toneLabelSelected: { color: ACCENT },

  // AI Help
  aiHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 16,
  },
  aiHelpText: { fontSize: 15, color: ACCENT, fontWeight: '500' },

  // Repair builder
  repairBuilder: { gap: 16, marginBottom: 16 },
  repairStep: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
  },
  repairStepHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  repairNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repairNumText: { fontSize: 14, fontWeight: '700', color: ACCENT },
  repairLabel: { fontSize: 12, fontWeight: '700', color: ACCENT, letterSpacing: 0.5, marginBottom: 2 },
  repairHint: { fontSize: 13, color: TEXT_MUTED },
  repairInput: {
    backgroundColor: BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    fontSize: 15,
    color: TEXT_COLOR,
    minHeight: 60,
  },

  // Practice button
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT + '10',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ACCENT + '25',
  },
  practiceBtnText: { fontSize: 15, fontWeight: '500', color: ACCENT },

  // Done
  doneHeader: { alignItems: 'center', marginBottom: 24 },
  doneTitle: { fontSize: 22, fontWeight: '600', color: TEXT_COLOR, marginTop: 12 },
  previewCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  previewLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 12, letterSpacing: 0.5 },
  previewText: { fontSize: 16, color: TEXT_COLOR, lineHeight: 24 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: ACCENT },

  showUpBanner: {
    backgroundColor: ACCENT + '12',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ACCENT + '35',
  },
  showUpBannerTitle: { fontSize: 12, fontWeight: '700', color: ACCENT, marginBottom: 6, letterSpacing: 0.3 },
  showUpBannerText: { fontSize: 14, color: TEXT_COLOR, lineHeight: 20 },

  // Footer
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 8,
  },
  footerText: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
});
