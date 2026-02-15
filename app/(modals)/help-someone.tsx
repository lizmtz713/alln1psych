import React, { useState, useRef, useEffect } from 'react';
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
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useHelpSomeoneStore, type HelpSession } from '../../src/stores/helpSomeoneStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { TemperatureGauge } from '../../src/components/circle/TemperatureGauge';
import { sendMessageWithSystemPrompt, hasOpenAIKey, type Message } from '../../src/services/ai';
import * as Voice from '../../src/services/voice';
import { useUsageStore } from '../../src/stores/usageStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { scheduleCheckInReminder } from '../../src/services/notifications';

const RELATIONSHIP_OPTIONS = [
  'Partner',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Coworker',
  'Other',
];

const CONCERN_CHIPS = [
  'They seem depressed',
  "They're angry and lashing out",
  "They're withdrawing from everyone",
  'They mentioned hurting themselves',
  "They're going through a breakup",
  "They're grieving a loss",
  "They're using substances more",
  "They're not eating/sleeping",
  "I don't know what's wrong but something is off",
  'They came out to me and I want to support them',
];

function buildCoachingSystemPrompt(
  personName: string,
  relationship: string,
  situation: string,
  concerns: string[]
): string {
  const concernsList = concerns.length ? concerns.join('\n- ') : 'None specified';
  return `You are Psych in Help Someone mode. The user is trying to help someone else who is struggling.

PERSON IN NEED: ${personName} (${relationship})
SITUATION: ${situation}
SPECIFIC CONCERNS:
- ${concernsList}

Your job:
1. First, validate the user for caring enough to seek help. "The fact that you're here says a lot about you."
2. Assess urgency: Is this person in immediate danger? If yes, skip to crisis protocol.
3. Give specific, actionable advice:
   - What to SAY (exact phrases they can use)
   - What NOT to say (common mistakes)
   - What to DO (specific actions)
   - What to WATCH FOR (warning signs)
4. If the user says "they said [X]" or "they did [X]", respond with exactly what to say or do next.
5. Be honest about limits: "If they're in immediate danger, you need to call 911. That's not overreacting — that's love."

COMMUNICATION RULES:
- Give 1-2 specific things at a time, not a wall of advice
- Use their actual name: "When you talk to ${personName}..."
- Offer exact scripts: "You could say: 'I've noticed you've been quiet lately. I'm not going anywhere. Whenever you're ready to talk, I'm here.'"
- Acknowledge how hard this is for the USER: "Watching someone you love struggle is its own kind of pain."
- If the situation involves potential self-harm or suicide, be very clear: "This is beyond what you should handle alone. Here's what to do right now."

CRISIS PROTOCOL (if person may be suicidal or in danger):
- Tell the user clearly: "This sounds like it could be a crisis situation."
- Give them options:
  1. "Ask ${personName} directly: 'Are you thinking about hurting yourself?' — research shows asking does NOT plant the idea."
  2. "If they say yes: stay with them, remove access to means if you can, and call 988 together."
  3. "If you believe they're in immediate danger and won't get help: call 911. That's not betrayal — that's saving their life."
  4. "You can also call 988 yourself to get advice on how to help them."`;
}

const CRISIS_RESOURCES_TEXT = `Crisis resources to share:

988 Suicide & Crisis Lifeline — Call or text 988 (24/7)
Crisis Text Line — Text HOME to 741741 (24/7)

You're not alone. Reach out anytime.`;

export default function HelpSomeoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; relationship?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const { members } = useCircleStore();
  const {
    sessions,
    currentSession,
    startNewSession,
    addSession,
    setCurrentSession,
    addMessageToCurrent,
    setActionPlan,
    setReminderSet,
    updateCurrentSession,
  } = useHelpSomeoneStore();
  const addJournalEntry = useJournalStore((s) => s.addEntry);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [personName, setPersonName] = useState(params.name ?? '');
  const [relationship, setRelationship] = useState(params.relationship ?? '');
  const [useCircleMember, setUseCircleMember] = useState<string | null>(params.name ? null : '');
  const [situation, setSituation] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);
  const lastOnDeviceResultRef = useRef('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [reminderDays, setReminderDays] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    hasOpenAIKey().then(setHasApiKey);
  }, []);

  useEffect(() => {
    if (params.name) setPersonName(params.name);
    if (params.relationship) setRelationship(params.relationship);
  }, [params.name, params.relationship]);

  const selectedMember = useCircleMember ? members.find((m) => m.id === useCircleMember) : null;
  const displayName = selectedMember ? selectedMember.name : personName.trim();
  const displayRelationship = selectedMember
    ? selectedMember.relationship.charAt(0).toUpperCase() + selectedMember.relationship.slice(1)
    : relationship;

  const toggleConcern = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConcerns((prev) => (prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));
  };

  const canProceedStep1 = displayName.length > 0 && displayRelationship.length > 0;
  const canProceedStep2 = situation.trim().length >= 10;

  const startCoaching = () => {
    if (!canProceedStep2 || !displayName) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const added = startNewSession({
      personName: displayName,
      relationship: displayRelationship,
      situation: situation.trim(),
      concerns: [...concerns],
      messages: [],
    });
    setStep(3);
    setTextInput('');
    // Seed first AI message
    const systemPrompt = buildCoachingSystemPrompt(
      displayName,
      displayRelationship,
      added.situation,
      added.concerns
    );
    const seedContent = `I'm worried about ${displayName} (${displayRelationship}). Here's what's going on: ${added.situation}.${added.concerns.length ? ' Concerns: ' + added.concerns.join(', ') : ''}`;
    if (!hasApiKey) {
      addMessageToCurrent('user', seedContent);
      addMessageToCurrent('assistant', "Add your OpenAI API key in Settings to get coaching. I'm here when you're ready.");
      return;
    }
    setIsAiTyping(true);
    const seedMessages: Message[] = [{ role: 'user', content: seedContent }];
    sendMessageWithSystemPrompt(seedMessages, systemPrompt)
      .then((reply) => {
        addMessageToCurrent('user', seedContent);
        addMessageToCurrent('assistant', reply);
      })
      .catch(() => {
        addMessageToCurrent('user', seedMessages[0].content);
        addMessageToCurrent('assistant', "Something went wrong. Check your API key in Settings and try again.");
      })
      .finally(() => setIsAiTyping(false));
  };

  const sendUserMessage = async (content: string) => {
    if (!content.trim() || !currentSession) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userContent = content.trim();
    setTextInput('');
    addMessageToCurrent('user', userContent);
    if (!hasApiKey) return;
    setIsAiTyping(true);
    const systemPrompt = buildCoachingSystemPrompt(
      currentSession.personName,
      currentSession.relationship,
      currentSession.situation,
      currentSession.concerns
    );
    const apiMessages: Message[] = currentSession.messages
      .concat([{ role: 'user', content: userContent }])
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    try {
      const reply = await sendMessageWithSystemPrompt(apiMessages, systemPrompt);
      addMessageToCurrent('assistant', reply);
    } catch {
      addMessageToCurrent('assistant', "I couldn't respond right now. Try again in a moment.");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleMicPress = async () => {
    if (!hasApiKey) return;
    if (!Voice.hasVoiceSupport()) return;
    if (isRecording) {
      if (useWhisperFallback) {
        try {
          const uri = await Voice.stopRecording();
          setIsRecording(false);
          setUseWhisperFallback(false);
          setIsProcessingVoice(true);
          const text = await Voice.transcribeWithWhisper(uri);
          useUsageStore.getState().incrementWhisperFallback();
          setIsProcessingVoice(false);
          if (text.trim()) sendUserMessage(text);
        } catch {
          setIsRecording(false);
          setIsProcessingVoice(false);
          setUseWhisperFallback(false);
        }
        return;
      }
      try {
        await Voice.stopOnDeviceListening();
      } catch (_) {}
      setIsRecording(false);
      setLiveTranscript('');
      const resultRef = lastOnDeviceResultRef;
      const fallbackText = liveTranscript;
      setTimeout(() => {
        const text = (resultRef.current || fallbackText).trim();
        resultRef.current = '';
        if (text.trim()) sendUserMessage(text);
      }, 100);
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone needed', 'Enable mic in Settings to use voice.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiveTranscript('');
    lastOnDeviceResultRef.current = '';
    setUseWhisperFallback(false);
    setIsRecording(true);
    try {
      await Voice.startOnDeviceListening({
        onPartial: (t) => setLiveTranscript(t),
        onResult: (t) => { lastOnDeviceResultRef.current = t; },
        onError: () => {
          Voice.cancelOnDeviceListening();
          setLiveTranscript('');
          setUseWhisperFallback(true);
          Voice.startRecording().catch(() => setIsRecording(false));
        },
      });
    } catch (_) {
      setUseWhisperFallback(true);
      try {
        await Voice.startRecording();
      } catch {
        setIsRecording(false);
      }
    }
  };

  const exchangeCount = currentSession?.messages.filter((m) => m.role === 'user').length ?? 0;
  const canEndSession = exchangeCount >= 3;

  const endSessionAndSummarize = async () => {
    if (!currentSession || !canEndSession) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSummaryLoading(true);
    const systemPrompt = `You are Psych. The user just had a coaching session about helping someone named ${currentSession.personName}. Generate a concise action plan summary.

Format your response as:
1. "Here's your action plan for helping [name]:"
2. 3-5 specific next steps (short bullets or numbered)
3. "Warning signs to watch for:" and 2-3 signs
4. "Resources to share with them:" — include 988 and Crisis Text Line (741741)
5. "Check in with [name] again in [suggested timeframe]"

Keep it practical and warm. No extra preamble.`;
    const apiMessages: Message[] = currentSession.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    apiMessages.push({
      role: 'user',
      content: 'Please summarize our coaching into an action plan I can save.',
    });
    try {
      const plan = await sendMessageWithSystemPrompt(apiMessages, systemPrompt);
      setActionPlan(plan);
      updateCurrentSession({ actionPlan: plan });
    } catch {
      updateCurrentSession({ actionPlan: 'Unable to generate summary. You can still save your notes from the conversation.' });
    } finally {
      setSummaryLoading(false);
      setStep(4);
    }
  };

  const saveActionPlanToJournal = () => {
    if (!currentSession?.actionPlan) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJournalEntry(
      `Help Someone – ${currentSession.personName}\n\n${currentSession.actionPlan}`,
      { source: 'manual' }
    );
    Alert.alert('Saved', 'Action plan saved to your journal.');
  };

  const setReminder = async (days: 1 | 2 | 3) => {
    if (!currentSession) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await scheduleCheckInReminder(currentSession.personName, days);
    setReminderSet(true);
    setReminderDays(days);
    Alert.alert('Reminder set', `We'll remind you to check in with ${currentSession.personName} in ${days} day${days > 1 ? 's' : ''}.`);
  };

  const shareCrisisResources = async () => {
    try {
      await Share.share({
        message: CRISIS_RESOURCES_TEXT,
        title: 'Crisis resources',
      });
    } catch {}
  };

  const closeAndSaveSession = () => {
    const session = useHelpSomeoneStore.getState().currentSession;
    if (session) {
      useHelpSomeoneStore.getState().addSession({
        personName: session.personName,
        relationship: session.relationship,
        situation: session.situation,
        concerns: session.concerns,
        messages: session.messages,
        actionPlan: session.actionPlan,
        reminderSet: session.reminderSet ?? false,
      });
    }
    useHelpSomeoneStore.getState().clearCurrentSession();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={closeAndSaveSession}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 1 && 'Who needs help?'}
          {step === 2 && "What's happening?"}
          {step === 3 && 'Coaching'}
          {step === 4 && 'Action plan'}
        </Text>
      </View>

      {step === 1 && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.question}>Who are you worried about?</Text>
          {members.length > 0 && (
            <View style={styles.chipRow}>
              {members.map((m) => (
                <Pressable
                  key={m.id}
                  style={[
                    styles.card,
                    useCircleMember === m.id && styles.cardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setUseCircleMember(useCircleMember === m.id ? null : m.id);
                    if (useCircleMember !== m.id) {
                      setPersonName('');
                    }
                  }}
                >
                  <Text style={styles.cardName}>{m.name}</Text>
                  <TemperatureGauge temperature={m.temperature} size="sm" />
                </Pressable>
              ))}
            </View>
          )}
          <Text style={styles.label}>Or someone not in your circle</Text>
          <TextInput
            style={styles.input}
            placeholder="Their name"
            placeholderTextColor={COLORS.textMuted}
            value={personName}
            onChangeText={(t) => {
              setPersonName(t);
              setUseCircleMember(null);
            }}
            editable={!useCircleMember}
          />
          <Text style={styles.label}>What's their relationship to you?</Text>
          <View style={styles.chipWrap}>
            {RELATIONSHIP_OPTIONS.map((rel) => (
              <Pressable
                key={rel}
                style={[styles.chip, relationship === rel && styles.chipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRelationship(relationship === rel ? '' : rel);
                }}
              >
                <Text style={[styles.chipText, relationship === rel && styles.chipTextSelected]}>{rel}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.primaryButton, !canProceedStep1 && styles.primaryButtonDisabled]}
            onPress={() => canProceedStep1 && (Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), setStep(2))}
            disabled={!canProceedStep1}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.question}>What's going on with them?</Text>
          <Text style={styles.hint}>Tell me as much or as little as you know.</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. They've been quiet for weeks, stopped answering calls..."
            placeholderTextColor={COLORS.textMuted}
            value={situation}
            onChangeText={setSituation}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>Quick-select (optional)</Text>
          <View style={styles.chipWrap}>
            {CONCERN_CHIPS.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, concerns.includes(c) && styles.chipSelected]}
                onPress={() => toggleConcern(c)}
              >
                <Text style={[styles.chipText, concerns.includes(c) && styles.chipTextSelected]} numberOfLines={1}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.primaryButton, (!canProceedStep2 || !displayName) && styles.primaryButtonDisabled]}
            onPress={startCoaching}
            disabled={!canProceedStep2 || !displayName}
          >
            <Text style={styles.primaryButtonText}>Help me help them</Text>
          </Pressable>
        </ScrollView>
      )}

      {step === 3 && currentSession && (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {currentSession.messages.map((msg, i) => (
              <View
                key={i}
                style={[styles.bubbleWrap, msg.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.psychLabel}>
                    <View style={styles.psychDot} />
                    <Text style={styles.psychLabelText}>Psych</Text>
                  </View>
                )}
                <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={styles.bubbleText}>{msg.content}</Text>
                </View>
              </View>
            ))}
            {isAiTyping && (
              <View style={[styles.bubbleWrap, styles.bubbleWrapAi]}>
                <View style={styles.psychLabel}>
                  <View style={styles.psychDot} />
                  <Text style={styles.psychLabelText}>Psych</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAi]}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.bottomBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask a follow-up..."
              placeholderTextColor={COLORS.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={() => sendUserMessage(textInput)}
              returnKeyType="send"
              multiline
              maxLength={2000}
            />
            <Pressable
              style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
              onPress={() => sendUserMessage(textInput)}
            >
              <Ionicons name="arrow-up" size={24} color={COLORS.text} />
            </Pressable>
            <Pressable
              style={[
                styles.micBtn,
                (isRecording || isProcessingVoice) && styles.micBtnActive,
              ]}
              onPress={handleMicPress}
            >
              {isRecording || isProcessingVoice ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Ionicons name="mic-outline" size={24} color={COLORS.text} />
              )}
            </Pressable>
          </View>
          {(isRecording || isProcessingVoice) && (
            <Text style={styles.voiceHint}>
              {isRecording
                ? useWhisperFallback
                  ? 'Recording... Tap mic to stop.'
                  : 'Listening... Tap mic when done.'
                : 'Processing...'}
            </Text>
          )}
          {isRecording && !useWhisperFallback && (
            <View style={styles.liveTranscriptContainer}>
              <Text style={styles.liveTranscriptText} numberOfLines={2}>
                {liveTranscript || 'Listening...'}
              </Text>
            </View>
          )}
          <View style={styles.endRow}>
            {canEndSession ? (
              <Pressable style={styles.endButton} onPress={endSessionAndSummarize}>
                {summaryLoading ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Text style={styles.endButtonText}>End session & get action plan</Text>
                )}
              </Pressable>
            ) : (
              <Text style={styles.endHint}>Have 3+ exchanges to get an action plan</Text>
            )}
          </View>
        </>
      )}

      {step === 4 && currentSession && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.planTitle}>Here's your action plan for helping {currentSession.personName}</Text>
          <View style={styles.planCard}>
            <Text style={styles.planBody}>{currentSession.actionPlan || 'No summary generated.'}</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={saveActionPlanToJournal}>
            <Ionicons name="journal-outline" size={22} color={COLORS.accent} />
            <Text style={styles.secondaryButtonText}>Save action plan to journal</Text>
          </Pressable>
          <Text style={styles.label}>Set a reminder to check in</Text>
          <View style={styles.chipRow}>
            {([1, 2, 3] as const).map((d) => (
              <Pressable
                key={d}
                style={[styles.chip, reminderDays === d && styles.chipSelected]}
                onPress={() => setReminder(d)}
              >
                <Text style={[styles.chipText, reminderDays === d && styles.chipTextSelected]}>{d} day{d > 1 ? 's' : ''}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.secondaryButton} onPress={shareCrisisResources}>
            <Ionicons name="share-outline" size={22} color={COLORS.accent} />
            <Text style={styles.secondaryButtonText}>Share crisis resources with {currentSession.personName}</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={closeAndSaveSession}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surface,
  },
  closeBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  question: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 15, color: COLORS.textMuted, marginBottom: 16 },
  label: { fontSize: 15, color: COLORS.textMuted, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.inputSurface,
  },
  chipSelected: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 15, color: COLORS.text },
  chipTextSelected: { color: COLORS.text, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: { borderWidth: 2, borderColor: COLORS.accent },
  cardName: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    marginTop: 12,
  },
  secondaryButtonText: { fontSize: 16, color: COLORS.accent, fontWeight: '500' },
  bubbleWrap: { marginBottom: 16 },
  bubbleWrapUser: { alignItems: 'flex-end' },
  bubbleWrapAi: { alignItems: 'flex-start' },
  psychLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  psychDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginRight: 6 },
  psychLabelText: { fontSize: 12, color: COLORS.textMuted },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: BORDER_RADIUS.card,
  },
  bubbleUser: { backgroundColor: COLORS.accent },
  bubbleAi: { backgroundColor: COLORS.inputSurface },
  bubbleText: { fontSize: 16, color: COLORS.text, lineHeight: 22 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: { padding: 10 },
  sendBtnPressed: { opacity: 0.8 },
  micBtn: { padding: 10 },
  micBtnActive: { opacity: 0.8 },
  voiceHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  liveTranscriptContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    minHeight: 40,
    justifyContent: 'center',
  },
  liveTranscriptText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  endRow: { paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center' },
  endButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
  },
  endButtonText: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  endHint: { fontSize: 13, color: COLORS.textMuted },
  planTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  planCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 16,
  },
  planBody: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
});
