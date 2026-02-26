/**
 * Replay — "Decode what happened". Tell → Mirror → Decode → Coach → Checkout.
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import * as Voice from '../../src/services/voice';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { ShareInsight } from '../../src/features/share-insight';
import { buildReplayShareContent } from '../../src/features/share-insight';
import { StepProgressIndicator } from '../../src/components/ui/StepProgressIndicator';
import { ToolCautionModal, StabilizationFooter } from '../../src/components/StabilizationBanner';

const BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const ACCENT = '#7C4DFF';
const AI_HEADER = '#7C4DFF';
const AI_BODY = '#E0E0E0';
const LOADING_TEXT = '#8888A0';

const REPLAY_MIRROR_SYSTEM = `You are Gauge, an emotional intelligence companion. The user just told you something that happened to them. Your job in this phase is ONLY to mirror it back accurately.
Restate what happened in clear, organized language. Use this format:
"Here's what I heard: [restate the situation]. [Restate what they felt]. [Restate what they needed]. Did I get that right?"
Be accurate. Don't interpret yet. Don't give advice yet. Just mirror. If details are unclear, ask ONE clarifying question.`;

const REPLAY_DECODE_SYSTEM = `You are Gauge. The user confirmed their story. Now do FOUR things in your response, clearly separated:

GAUGE TRIPPED
Start with "🎯 Gauge tripped:" — Identify the PRIMARY gauge that got activated by this event. Choose ONE:
• Body — if physical symptoms (tension, exhaustion, racing heart)
• State — if nervous system activation (fight/flight/freeze response)
• Emotion — if emotional flooding or confusion
• Connection — if about belonging, rejection, or relationship rupture
• Direction — if about purpose, meaning, or feeling lost
• Alignment — if about values being violated or integrity conflict

Then briefly explain WHY this gauge specifically. Example: "🎯 Gauge tripped: Connection. This hit your belonging needs — you felt excluded from a group that matters to you."

MISFIRE CHECK
Check if this might be a "misfire" — when your system reacts to a perceived threat that isn't actually dangerous:
• If the reaction seems proportional to the situation: "This reaction matches the situation."
• If the reaction seems bigger than the situation warrants: "⚠️ Possible misfire: Your State gauge is at a 9, but the actual threat level is probably a 3. Your system might be responding to an OLD wound, not just this moment. Ask yourself: does this remind me of something from before?"

DECODE THEIR FEELINGS
Start with "What you're feeling:" — Name the surface emotion, then go deeper. What's underneath? If they said angry, it might be hurt, fear of rejection, or feeling unseen. Be specific to THEIR story.

DECODE THE OTHER PERSON
Start with "Their perspective:" — Without excusing bad behavior, explain what might be happening for the other person. What gauge of theirs might be off? Always caveat: "This doesn't make it okay. But understanding it helps you respond from clarity, not reaction."

Be warm, specific, and direct. Never generic. Every sentence should reference THEIR specific situation.`;

const REPLAY_COACH_SYSTEM = `You are Gauge. The user has heard the decode. Now coach them. Provide:

WHAT TO SAY — Give them 2-3 actual response options they could use with the other person. Not generic. Specific to their situation. For each option, briefly explain what it prioritizes (honesty, preservation, boundary-setting, etc.)
WHAT NOT TO SAY — One thing they should avoid and why.
WHEN TO SAY NOTHING — If the best move is to wait, say so and explain why.
THE BIGGER QUESTION — One deeper reflection question that connects this situation to a pattern in their life. Example: "This is the third time someone didn't make you feel valued. The question isn't what to say to them — it's why you keep accepting less than you need."

End with: "How do you feel now that you've worked through this?"`;

type Phase = 'tell' | 'mirror' | 'decode' | 'coach' | 'checkout';

const DECODE_HEADERS = ["Gauge tripped:", "Misfire", "What you're feeling:", "Their perspective:"];
const COACH_HEADERS = ['WHAT TO SAY', 'WHAT NOT TO SAY', 'WHEN TO SAY NOTHING', 'THE BIGGER QUESTION'];

function sectionedText(text: string, headers: string[]) {
  const parts: { bold: boolean; content: string }[] = [];
  let remaining = text;
  for (const h of headers) {
    const i = remaining.search(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    if (i === -1) continue;
    if (i > 0) parts.push({ bold: false, content: remaining.slice(0, i) });
    const end = remaining.indexOf('\n', i) !== -1 ? remaining.indexOf('\n', i) : remaining.length;
    parts.push({ bold: true, content: remaining.slice(i, end).trim() });
    remaining = remaining.slice(end);
  }
  if (remaining.trim()) parts.push({ bold: false, content: remaining.trim() });
  if (parts.length === 0) parts.push({ bold: false, content: text });
  return parts;
}

export default function ReplayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const updateEmotion = useCockpitStore((s) => s.updateEmotion);
  const updateConnection = useCockpitStore((s) => s.updateConnection);
  const systemMode = useCockpitStore((s) => s.systemMode);
  const stabilizationTriggers = useCockpitStore((s) => s.stabilizationTriggers);

  const [phase, setPhase] = useState<Phase>('tell');
  const [story, setStory] = useState('');
  const [mirrorResponse, setMirrorResponse] = useState('');
  const [decodeResponse, setDecodeResponse] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [clarity, setClarity] = useState(-1);
  const [connectionFeeling, setConnectionFeeling] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const lastResultRef = useRef('');
  
  // Stabilization mode caution
  const [showCaution, setShowCaution] = useState(systemMode === 'stabilization');
  const isStabilization = systemMode === 'stabilization';

  const runPhase = async (sysPrompt: string, userContent: string, setResult: (s: string) => void, nextPhase: Phase) => {
    if (!userContent.trim()) return;
    setLoading(true);
    try {
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        sysPrompt
      );
      setResult(response?.trim() ?? '');
      setPhase(nextPhase);
    } catch (e) {
      if (__DEV__) console.warn('Replay AI error:', e);
      setResult("I couldn't process that right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleMicPress = async () => {
    if (!Voice.hasVoiceSupport()) {
      Alert.alert('Voice not available', 'Voice input is not supported on this device.');
      return;
    }
    if (isRecording) {
      try {
        await Voice.stopOnDeviceListening();
      } catch (_) {}
      setIsRecording(false);
      const text = (lastResultRef.current || liveTranscript).trim();
      lastResultRef.current = '';
      setLiveTranscript('');
      if (text) setStory((s) => (s ? s + '\n\n' + text : text));
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone access needed', 'Go to Settings to enable it.', [{ text: 'OK' }]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiveTranscript('');
    lastResultRef.current = '';
    setIsRecording(true);
    try {
      await Voice.startOnDeviceListening({
        onPartial: (t) => setLiveTranscript(t),
        onResult: (t) => { lastResultRef.current = t; },
        onError: () => {
          Voice.cancelOnDeviceListening();
          setLiveTranscript('');
          setIsRecording(false);
        },
      });
    } catch (_) {
      setIsRecording(false);
    }
  };

  const onNextTell = () => {
    if (story.trim().length < 10 || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runPhase(REPLAY_MIRROR_SYSTEM, story.trim(), setMirrorResponse, 'mirror');
  };

  const onMirrorYes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    (async () => {
      try {
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `Story: ${story}\n\nMirror (confirmed): ${mirrorResponse}` }],
          REPLAY_DECODE_SYSTEM
        );
        setDecodeResponse(response?.trim() ?? '');
        setPhase('decode');
      } catch (e) {
        if (__DEV__) console.warn('Replay decode error:', e);
        setDecodeResponse("I couldn't process that right now. Try again in a moment.");
      } finally {
        setLoading(false);
      }
    })();
  };

  const onMirrorClarify = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('tell');
  };

  const onDecodeNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    (async () => {
      try {
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `Story: ${story}\n\nMirror: ${mirrorResponse}\n\nDecode: ${decodeResponse}` }],
          REPLAY_COACH_SYSTEM
        );
        setCoachResponse(response?.trim() ?? '');
        setPhase('coach');
      } catch (e) {
        if (__DEV__) console.warn('Replay coach error:', e);
        setCoachResponse("I couldn't process that right now. Try again in a moment.");
      } finally {
        setLoading(false);
      }
    })();
  };

  const onCoachCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('checkout');
  };

  const onDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (clarity >= 0) useCockpitStore.getState().updateEmotion(clarity);
    if (connectionFeeling >= 0) useCockpitStore.getState().updateConnection(connectionFeeling);
    router.back();
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 'tell') {
      router.back();
      return;
    }
    const order: Phase[] = ['tell', 'mirror', 'decode', 'coach', 'checkout'];
    const idx = order.indexOf(phase);
    if (idx > 0) setPhase(order[idx - 1]);
    else router.back();
  };

  const renderDecodeContent = () => {
    const parts = sectionedText(decodeResponse, DECODE_HEADERS);
    return (
      <View style={styles.responseCard}>
        {parts.map((p, i) => (
          <Text key={i} style={p.bold ? styles.sectionHeader : styles.aiBody}>
            {p.content}
            {p.bold && '\n'}
          </Text>
        ))}
      </View>
    );
  };

  const renderCoachContent = () => {
    const parts = sectionedText(coachResponse, COACH_HEADERS);
    return (
      <View style={styles.responseCard}>
        {parts.map((p, i) => (
          <Text key={i} style={p.bold ? styles.sectionHeader : styles.aiBody}>
            {p.content}
            {p.bold && '\n'}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <ErrorBoundary>
      {/* Stabilization Mode Caution */}
      <ToolCautionModal
        visible={showCaution && isStabilization}
        toolName="Replay"
        triggers={stabilizationTriggers}
        onContinue={() => setShowCaution(false)}
        onQuickReset={() => {
          setShowCaution(false);
          router.replace('/(modals)/quick-reset');
        }}
      />
      
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color={ACCENT} />
          </Pressable>
          <View style={styles.progressContainer}>
            <StepProgressIndicator 
              currentStep={Math.max(1, ['tell', 'mirror', 'decode', 'coach', 'checkout'].indexOf(phase) + 1)} 
              totalSteps={5}
              accentColor={ACCENT}
            />
          </View>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={TEXT_SECONDARY} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {phase === 'tell' && (
            <>
              <Text style={styles.prompt}>Tell me what happened.</Text>
              <Text style={styles.subtitle}>Just talk — no structure needed.</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.largeInput}
                  placeholder="What happened?"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={story}
                  onChangeText={setStory}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.inputRow}>
                  <Pressable style={[styles.micBtn, isRecording && styles.micBtnRecording]} onPress={handleMicPress}>
                    <Ionicons name="mic" size={24} color={TEXT_PRIMARY} />
                  </Pressable>
                  {isRecording && <Text style={styles.liveText}>{liveTranscript || 'Listening...'}</Text>}
                </View>
              </View>
              <Pressable
                style={[styles.primaryBtn, (story.trim().length < 10 || loading) && styles.primaryBtnDisabled]}
                onPress={onNextTell}
                disabled={story.trim().length < 10 || loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.primaryBtnText}>Gauge is thinking...</Text>
                  </>
                ) : (
                  <Text style={styles.primaryBtnText}>Next</Text>
                )}
              </Pressable>
            </>
          )}

          {phase === 'mirror' && (
            <>
              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="small" color={ACCENT} />
                  <Text style={styles.loadingText}>Gauge is thinking...</Text>
                </View>
              ) : (
                <View style={styles.responseCard}>
                  <Text style={styles.aiBody}>{mirrorResponse}</Text>
                </View>
              )}
              {!loading && mirrorResponse ? (
                <View style={styles.twoButtonRow}>
                  <Pressable style={styles.secondaryBtn} onPress={onMirrorClarify}>
                    <Text style={styles.secondaryBtnText}>Let me clarify</Text>
                  </Pressable>
                  <Pressable style={styles.primaryBtn} onPress={onMirrorYes} disabled={loading}>
                    <Text style={styles.primaryBtnText}>Yes, that's right</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}

          {phase === 'decode' && (
            <>
              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="small" color={ACCENT} />
                  <Text style={styles.loadingText}>Gauge is thinking...</Text>
                </View>
              ) : (
                decodeResponse ? renderDecodeContent() : null
              )}
              {!loading && decodeResponse ? (
                <Pressable style={styles.primaryBtn} onPress={onDecodeNext}>
                  <Text style={styles.primaryBtnText}>What should I do?</Text>
                </Pressable>
              ) : null}
            </>
          )}

          {phase === 'coach' && (
            <>
              {coachResponse ? renderCoachContent() : null}
              {coachResponse ? (
                <Pressable style={styles.primaryBtn} onPress={onCoachCheckIn}>
                  <Text style={styles.primaryBtnText}>Check in</Text>
                </Pressable>
              ) : null}
            </>
          )}

          {phase === 'checkout' && (
            <>
              <Text style={styles.checkoutPrompt}>How clear do you feel about this now?</Text>
              <View style={styles.chipRow}>
                {[
                  { label: 'Much clearer', value: 85 },
                  { label: 'Somewhat', value: 55 },
                  { label: 'Still confused', value: 25 },
                ].map((o) => (
                  <Pressable
                    key={o.value}
                    style={[styles.chip, clarity === o.value && styles.chipSelected]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setClarity(o.value); }}
                  >
                    <Text style={[styles.chipText, clarity === o.value && styles.chipTextSelected]}>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.checkoutPrompt}>Do you feel more connected or more isolated?</Text>
              <View style={styles.chipRow}>
                {[
                  { label: 'More connected', value: 80 },
                  { label: 'Same', value: 50 },
                  { label: 'More isolated', value: 20 },
                ].map((o) => (
                  <Pressable
                    key={o.value}
                    style={[styles.chip, connectionFeeling === o.value && styles.chipSelected]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConnectionFeeling(o.value); }}
                  >
                    <Text style={[styles.chipText, connectionFeeling === o.value && styles.chipTextSelected]}>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[styles.primaryBtn, (clarity < 0 || connectionFeeling < 0) && styles.primaryBtnDisabled]}
                onPress={onDone}
                disabled={clarity < 0 || connectionFeeling < 0}
              >
                <Text style={styles.primaryBtnText}>Done</Text>
              </Pressable>

              {/* Share option after processing */}
              {(mirrorResponse || decodeResponse || coachResponse) && (
                <ShareInsight
                  content={buildReplayShareContent(
                    'What I Processed',
                    [
                      ...(mirrorResponse ? [{ phase: 'What Happened', content: mirrorResponse }] : []),
                      ...(decodeResponse ? [{ phase: 'The Decode', content: decodeResponse }] : []),
                      ...(coachResponse ? [{ phase: 'The Coach', content: coachResponse }] : []),
                    ]
                  )}
                  trigger={(onPress) => (
                    <Pressable style={styles.shareBtn} onPress={onPress}>
                      <Ionicons name="share-outline" size={16} color={ACCENT} />
                      <Text style={styles.shareBtnText}>Share what I learned</Text>
                    </Pressable>
                  )}
                />
              )}
            </>
          )}
          
          {/* Stabilization footer hint */}
          {isStabilization && <StabilizationFooter />}
        </ScrollView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  backBtn: { width: 40, padding: 8, justifyContent: 'center' },
  progressContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 40, padding: 8, alignItems: 'flex-end', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  prompt: { fontSize: 18, fontWeight: '500', color: TEXT_PRIMARY, marginBottom: 4 },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 16, lineHeight: 22 },
  inputCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: CARD_BORDER, padding: 16, marginBottom: 16 },
  largeInput: { backgroundColor: CARD_BG, color: TEXT_PRIMARY, fontSize: 16, minHeight: 140, padding: 14, borderRadius: 12, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  micBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  micBtnRecording: { backgroundColor: 'rgba(124,77,255,0.3)' },
  liveText: { fontSize: 14, color: TEXT_SECONDARY, flex: 1 },
  primaryBtn: { backgroundColor: ACCENT, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', flex: 1 },
  secondaryBtnText: { fontSize: 17, fontWeight: '600', color: TEXT_PRIMARY },
  twoButtonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  responseCard: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 14, padding: 16, marginBottom: 20 },
  sectionHeader: { fontWeight: '700', color: AI_HEADER, fontSize: 15, marginBottom: 4 },
  aiBody: { color: AI_BODY, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  loadingText: { fontSize: 15, color: LOADING_TEXT, marginTop: 8 },
  checkoutPrompt: { fontSize: 16, fontWeight: '500', color: TEXT_PRIMARY, marginBottom: 12, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  chip: { backgroundColor: CARD_BG, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: CARD_BORDER },
  chipSelected: { borderColor: ACCENT, backgroundColor: 'rgba(124,77,255,0.1)' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },
  shareBtnText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '500',
  },
  chipText: { fontSize: 15, color: TEXT_PRIMARY },
  chipTextSelected: { color: ACCENT },
});
