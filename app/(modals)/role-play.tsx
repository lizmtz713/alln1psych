import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useRolePlayStore, type RolePlayDifficulty } from '../../src/stores/rolePlayStore';
import { sendRolePlayMessage, getDebrief } from '../../src/services/roleplay';
import { hasOpenAIKey } from '../../src/services/ai';
import * as Voice from '../../src/services/voice';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useUsageStore } from '../../src/stores/usageStore';
import { StepProgressIndicator } from '../../src/components/ui/StepProgressIndicator';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { ToolCautionModal, StabilizationFooter } from '../../src/components/StabilizationBanner';
import { PreConversationButton } from '../../src/components/PreConversationButton';
import { ToolIntro } from '../../src/components/tools/ToolIntro';
import { getToolIntroContent } from '../../src/data/toolIntroContent';

const ROLE_PLAY_ACCENT = COLORS.rolePlayAccent;

const DIFFICULTY_OPTIONS: { value: RolePlayDifficulty; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'challenging', label: 'Challenging' },
];

const QUICK_STARTS = [
  { scenario: 'Asking my boss for a raise', character: 'My boss', emoji: '💼' },
  { scenario: 'Set a boundary with someone', character: 'The person', emoji: '🚧' },
  { scenario: 'Have a hard talk with family', character: 'Family member', emoji: '👨\u200d👩\u200d👧' },
  { scenario: 'Practice saying no', character: 'The person asking', emoji: '✋' },
  { scenario: 'Come out to someone', character: 'Family member or friend', emoji: '🏳️‍🌈' },
  { scenario: 'Correct someone about my pronouns', character: 'Coworker or acquaintance', emoji: '✊' },
  { scenario: "I want to tell my family I'm seeing a therapist/using a mental health app", character: 'Traditional family member', emoji: '🏠' },
  { scenario: "I need to set a boundary but I don't want to disrespect my family", character: 'Parent or elder', emoji: '🛡️' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function RolePlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessionId, scenario: scenarioParam, character: characterParam, difficulty: difficultyParam } = useLocalSearchParams<{
    sessionId?: string;
    scenario?: string;
    character?: string;
    difficulty?: string;
  }>();
  const scrollRef = useRef<ScrollView>(null);

  const {
    currentSession,
    pastSessions,
    startSession,
    addMessage,
    setDebrief,
    setPhase,
    endSession,
    clearCurrentSession,
    getSessionById,
  } = useRolePlayStore();

  const [scenario, setScenario] = useState('');
  const [character, setCharacter] = useState('');
  const [difficulty, setDifficulty] = useState<RolePlayDifficulty>('neutral');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [viewingPastId, setViewingPastId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);
  const lastOnDeviceResultRef = useRef('');
  const [showIntro, setShowIntro] = useState(true);

  // Stabilization mode
  const systemMode = useCockpitStore((s) => s.systemMode);
  const stabilizationTriggers = useCockpitStore((s) => s.stabilizationTriggers);
  const [showCaution, setShowCaution] = useState(systemMode === 'stabilization');
  const isStabilization = systemMode === 'stabilization';

  useEffect(() => {
    hasOpenAIKey().then(setHasApiKey);
  }, []);

  useEffect(() => {
    if (sessionId) setViewingPastId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (scenarioParam) setScenario(scenarioParam);
  }, [scenarioParam]);
  useEffect(() => {
    if (characterParam) setCharacter(characterParam);
  }, [characterParam]);
  useEffect(() => {
    if (difficultyParam && (difficultyParam === 'supportive' || difficultyParam === 'neutral' || difficultyParam === 'challenging')) {
      setDifficulty(difficultyParam);
    }
  }, [difficultyParam]);

  const openingRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentSession?.messages.length) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [currentSession?.messages.length]);

  // When practice starts with empty messages, get opening line from character
  useEffect(() => {
    const session = currentSession;
    if (!session || session.phase !== 'practice' || session.messages.length > 0 || !hasApiKey) return;
    if (openingRequestedRef.current === session.id) return;
    openingRequestedRef.current = session.id;
    (async () => {
      setIsLoading(true);
      try {
        const opener = await sendRolePlayMessage(
          [{ role: 'user', content: `[The user is about to start practicing. As ${session.character}, say a brief opening line to start the conversation — 1-2 sentences. Stay in character.]` }],
          session.scenario,
          session.character,
          session.difficulty
        );
        addMessage('assistant', opener);
      } catch {
        // ignore — user can still type first
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentSession?.id, currentSession?.phase, currentSession?.messages.length, hasApiKey]);

  const applyQuickStart = (s: string, c: string) => {
    setScenario(s);
    setCharacter(c);
  };

  const handleStartPractice = () => {
    if (!scenario.trim()) {
      setError('Describe what you want to practice.');
      return;
    }
    setError(null);
    startSession(scenario.trim(), character.trim(), difficulty);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !currentSession || currentSession.phase !== 'practice') return;
    if (!hasApiKey) {
      setError('Add your OpenAI API key in Settings to use role play.');
      return;
    }
    setInput('');
    addMessage('user', text);
    setIsLoading(true);
    setError(null);
    try {
      const nextMessages = [
        ...currentSession.messages,
        { role: 'user' as const, content: text, timestamp: new Date() },
      ].map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendRolePlayMessage(
        nextMessages,
        currentSession.scenario,
        currentSession.character,
        currentSession.difficulty
      );
      addMessage('assistant', reply);
      if (useSettingsStore.getState().aiVoiceEnabled && reply?.trim()) {
        Voice.speakWithOpenAI(reply).catch(() => {});
        useUsageStore.getState().incrementTTS();
      }

      const exchangeCount = nextMessages.length + 1;
      if (exchangeCount >= 10 && reply.toLowerCase().includes('debrief')) {
        // AI offered debrief — could auto-transition; for now user can End Session
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTranscribedMessage = async (text: string) => {
    if (!currentSession || !text.trim()) return;
    addMessage('user', text);
    setIsLoading(true);
    setError(null);
    try {
      const nextMessages = [
        ...currentSession.messages,
        { role: 'user' as const, content: text, timestamp: new Date() },
      ].map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendRolePlayMessage(
        nextMessages,
        currentSession.scenario,
        currentSession.character,
        currentSession.difficulty
      );
      addMessage('assistant', reply);
      if (useSettingsStore.getState().aiVoiceEnabled && reply?.trim()) {
        Voice.speakWithOpenAI(reply).catch(() => {});
        useUsageStore.getState().incrementTTS();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicPress = async () => {
    if (!currentSession || currentSession.phase !== 'practice' || !hasApiKey || !Voice.hasVoiceSupport()) return;
    if (isRecording) {
      if (useWhisperFallback) {
        try {
          const uri = await Voice.stopRecording();
          setIsRecording(false);
          setUseWhisperFallback(false);
          setIsProcessingVoice(true);
          setError(null);
          const text = await Voice.transcribeWithWhisper(uri);
          useUsageStore.getState().incrementWhisperFallback();
          setIsProcessingVoice(false);
          if (!text.trim()) {
            setError("I didn't catch that. Try again or type.");
            return;
          }
          await sendTranscribedMessage(text);
        } catch (e) {
          setIsRecording(false);
          setIsProcessingVoice(false);
          setUseWhisperFallback(false);
          setError(e instanceof Error ? e.message : 'Voice failed. Try typing.');
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
        if (text) sendTranscribedMessage(text);
        else setError("I didn't catch that. Try again or type.");
      }, 100);
      return;
    }
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone access needed', 'Go to Settings to enable it.', [{ text: 'OK' }]);
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
      } catch (e) {
        setIsRecording(false);
        if (e instanceof Error && e.message === 'Microphone permission not granted') {
          Alert.alert('Microphone access needed', 'Go to Settings to enable it.', [{ text: 'OK' }]);
        }
      }
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    const userMessageCount = currentSession.messages.filter((m) => m.role === 'user').length;
    if (userMessageCount < 2) {
      setError("You haven't said anything yet. Start typing or tap the mic to practice.");
      return;
    }
    if (!hasApiKey) {
      setDebrief("Add your API key in Settings to get personalized debriefs. You did great practicing — that's what matters.");
      setPhase('debrief');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const transcriptText = await getDebrief(
        currentSession.messages,
        currentSession.scenario,
        currentSession.character,
        currentSession.difficulty
      );
      setDebrief(transcriptText);
      setPhase('debrief');
    } catch (e) {
      setDebrief(
        "I couldn't generate a debrief right now, but practicing was still valuable. You showed up — that's what counts."
      );
      setPhase('debrief');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeAgain = () => {
    if (!currentSession) return;
    startSession(currentSession.scenario, currentSession.character, currentSession.difficulty);
  };

  const handleNewScenario = () => {
    endSession();
    clearCurrentSession();
    setScenario('');
    setCharacter('');
    setDifficulty('neutral');
    setViewingPastId(null);
  };

  const handleStartOver = () => {
    if (!currentSession) return;
    startSession(currentSession.scenario, currentSession.character, currentSession.difficulty);
  };

  const handleDone = () => {
    endSession();
    clearCurrentSession();
    setScenario('');
    setCharacter('');
    setViewingPastId(null);
    router.back();
  };

  const viewingPast = viewingPastId ? getSessionById(viewingPastId) : null;

  if (viewingPast) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{viewingPast.scenario}</Text>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.viewDate}>
            {new Date(viewingPast.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
          </Text>
          {viewingPast.messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubbleWrap, m.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}
            >
              <Text style={styles.bubbleLabel}>
                {m.role === 'user' ? 'You' : viewingPast.character}
              </Text>
              <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={styles.bubbleText}>{m.content}</Text>
              </View>
            </View>
          ))}
          {viewingPast.debrief && (
            <View style={styles.debriefBlock}>
              <Text style={styles.debriefLabel}>Debrief</Text>
              <Text style={styles.debriefText}>{viewingPast.debrief}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (currentSession?.phase === 'debrief') {
    const session = currentSession;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <View style={styles.progressContainer}>
            <StepProgressIndicator currentStep={3} totalSteps={3} accentColor={ROLE_PLAY_ACCENT} />
          </View>
          <Pressable style={styles.headerClose} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {session.debrief && (
            <View style={styles.debriefBlock}>
              <Text style={styles.debriefText}>{session.debrief}</Text>
            </View>
          )}
          <Text style={styles.transcriptLabel}>Conversation</Text>
          {session.messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubbleWrap, m.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}
            >
              <Text style={styles.bubbleLabel}>{m.role === 'user' ? 'You' : session.character}</Text>
              <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={styles.bubbleText}>{m.content}</Text>
              </View>
            </View>
          ))}
          <View style={styles.debriefActions}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handlePracticeAgain}>
              <Text style={styles.btnTextSecondary}>Practice Again</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleNewScenario}>
              <Text style={styles.btnTextSecondary}>New Scenario</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleDone}>
              <Text style={styles.btnTextPrimary}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (currentSession?.phase === 'practice') {
    const session = currentSession;
    const userMessageCount = session.messages.filter((m) => m.role === 'user').length;
    const canEndSession = userMessageCount >= 2;
    const summary = session.scenario.length > 40 ? session.scenario.slice(0, 37) + '...' : session.scenario;
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerBack} onPress={handleNewScenario}>
            <Ionicons name="arrow-back" size={24} color={ROLE_PLAY_ACCENT} />
          </Pressable>
          <View style={styles.progressContainer}>
            <StepProgressIndicator currentStep={2} totalSteps={3} accentColor={ROLE_PLAY_ACCENT} />
          </View>
          <Pressable style={styles.headerClose} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </Pressable>
        </View>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {session.messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubbleWrap, m.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}
            >
              <Text style={styles.bubbleLabel}>
                {m.role === 'user' ? 'You' : session.character}
              </Text>
              <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={styles.bubbleText}>{m.content}</Text>
                <Text style={styles.timestamp}>{formatTime(m.timestamp)}</Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.bubbleWrap, styles.bubbleWrapAi]}>
              <Text style={styles.bubbleLabel}>{session.character}</Text>
              <View style={[styles.bubble, styles.bubbleAi]}>
                <ActivityIndicator size="small" color={ROLE_PLAY_ACCENT} />
              </View>
            </View>
          )}
        </ScrollView>
        {error ? <Text style={styles.errorLine}>{error}</Text> : null}
        {(isRecording || isProcessingVoice) && (
          <Text style={styles.recordingHint}>
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
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputInRow]}
            placeholder="Type or tap the mic..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={1000}
            editable={!isLoading && !isRecording && !isProcessingVoice}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={22} color={COLORS.text} />
          </Pressable>
          {hasApiKey && Voice.hasVoiceSupport() && (
            <Pressable
              style={[styles.micBtn, isRecording && styles.micBtnRecording]}
              onPress={handleMicPress}
              disabled={isLoading || isProcessingVoice}
            >
              <Ionicons name="mic" size={24} color={COLORS.text} />
            </Pressable>
          )}
        </View>
        <View style={styles.sessionActions}>
          <Pressable
            style={[styles.sessionActionBtn, !canEndSession && styles.sessionActionBtnDisabled]}
            onPress={() => {
              if (!canEndSession) {
                Alert.alert('Start the conversation first', 'Type or tap the mic to practice.');
                return;
              }
              handleEndSession();
            }}
          >
            <Text style={[styles.sessionActionText, !canEndSession && styles.sessionActionTextDisabled]}>End & Review</Text>
          </Pressable>
          <Pressable style={styles.sessionActionBtn} onPress={handleStartOver}>
            <Text style={styles.sessionActionText}>Start Over</Text>
          </Pressable>
          <Pressable style={styles.sessionActionBtn} onPress={handleNewScenario}>
            <Text style={styles.sessionActionText}>New Scenario</Text>
          </Pressable>
          <Pressable style={styles.sessionActionBtn} onPress={handleDone}>
            <Text style={styles.sessionActionText}>Done</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const rolePlayIntroContent = getToolIntroContent('role-play');
  if (showIntro && rolePlayIntroContent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ToolIntro
          content={rolePlayIntroContent}
          onStart={() => setShowIntro(false)}
          onBack={() => router.back()}
        />
      </View>
    );
  }

  return (
    <>
      {/* Stabilization Mode Caution */}
      <ToolCautionModal
        visible={showCaution && isStabilization}
        toolName="Role Play"
        triggers={stabilizationTriggers}
        onContinue={() => setShowCaution(false)}
        onQuickReset={() => {
          setShowCaution(false);
          router.replace('/(modals)/quick-reset');
        }}
      />
      
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
        <View style={{ width: 40 }} />
        <View style={styles.progressContainer}>
          <StepProgressIndicator currentStep={1} totalSteps={3} accentColor={ROLE_PLAY_ACCENT} />
        </View>
        <Pressable style={styles.headerClose} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.textMuted} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.setupContent}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.setupTitle}>Practice a conversation</Text>
      <Text style={styles.setupSubtitle}>Pick a scenario or create your own</Text>

      {/* Pre-Conversation Check — optional, not blocking */}
      <PreConversationButton 
        returnTo="/(modals)/role-play" 
        label="About to practice a hard conversation?"
      />

      {/* Quick starts FIRST — immediately visible */}
      <View style={{ marginBottom: 24, marginHorizontal: -24 }}>
        {(() => {
          const scenarios = QUICK_STARTS.map((q, i) => ({ id: String(i), ...q, title: q.scenario, subtitle: q.character }));
          const row1 = scenarios.slice(0, Math.ceil(scenarios.length / 2));
          const row2 = scenarios.slice(Math.ceil(scenarios.length / 2));
          const selectScenario = (s: typeof scenarios[0]) => applyQuickStart(s.scenario, s.character);
          return (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24 }}>
                  {row1.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => selectScenario(s)}
                      style={({ pressed }) => [
                        { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, width: 170, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                      ]}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 8 }}>{s.emoji}</Text>
                      <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600', lineHeight: 18 }} numberOfLines={2}>{s.title}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 6 }} numberOfLines={1}>as {s.subtitle}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24 }}>
                  {row2.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => selectScenario(s)}
                      style={({ pressed }) => [
                        { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, width: 170, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                      ]}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 8 }}>{s.emoji}</Text>
                      <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600', lineHeight: 18 }} numberOfLines={2}>{s.title}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 6 }} numberOfLines={1}>as {s.subtitle}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </>
          );
        })()}
      </View>

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
        <Text style={{ color: COLORS.textMuted, fontSize: 13, marginHorizontal: 12 }}>or create your own</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
      </View>

      <Text style={styles.setupLabel}>What do you want to practice?</Text>
      <TextInput
        style={[styles.input, styles.inputLarge]}
        placeholder="Describe the conversation..."
        placeholderTextColor={COLORS.textMuted}
        value={scenario}
        onChangeText={(t) => { setScenario(t); setError(null); }}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.setupLabel}>Who should I play?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., My boss, my mom, my friend..."
        placeholderTextColor={COLORS.textMuted}
        value={character}
        onChangeText={setCharacter}
      />

      <Text style={styles.setupLabel}>How should they respond?</Text>
      <View style={styles.chipRow}>
        {DIFFICULTY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.chip, difficulty === opt.value && styles.chipSelected]}
            onPress={() => setDifficulty(opt.value)}
          >
            <Text style={[styles.chipText, difficulty === opt.value && styles.chipTextSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.errorLine}>{error}</Text> : null}
      {!hasApiKey && (
        <Text style={styles.apiHint}>Add your OpenAI API key in Settings to use role play.</Text>
      )}

      <Pressable
        style={[styles.startButton, (!scenario.trim() || !hasApiKey) && styles.startButtonDisabled]}
        onPress={handleStartPractice}
        disabled={!scenario.trim() || !hasApiKey}
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
      </Pressable>
      
      {/* Stabilization footer hint */}
      {isStabilization && <StabilizationFooter />}

      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surface,
  },
  headerBack: { width: 40, padding: 8 },
  headerClose: { width: 40, alignItems: 'flex-end', padding: 8 },
  progressContainer: { flex: 1, alignItems: 'center' },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  endButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  endButtonDisabled: {
    opacity: 0.5,
  },
  endButtonText: {
    fontSize: 15,
    color: ROLE_PLAY_ACCENT,
    fontWeight: '600',
  },
  endButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  sessionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
  sessionActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  sessionActionBtnDisabled: { opacity: 0.5 },
  sessionActionText: { fontSize: 13, color: COLORS.text },
  sessionActionTextDisabled: { color: COLORS.textMuted },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24 },
  setupContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 40 },
  setupTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  setupLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
  },
  inputInRow: {
    flex: 1,
    minHeight: 44,
    marginBottom: 0,
  },
  inputLarge: {
    minHeight: 100,
    paddingTop: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: ROLE_PLAY_ACCENT,
  },
  chipText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.background,
    fontWeight: '600',
  },
  quickLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  quickCard: {
    width: '48%',
    minWidth: 140,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
  },
  quickEmoji: { fontSize: 24, marginBottom: 6 },
  quickText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  apiHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: ROLE_PLAY_ACCENT,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonDisabled: { opacity: 0.5 },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.background,
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cancelText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  cancelLink: {
    alignSelf: 'center',
  },
  cancelLinkText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  bubbleWrap: { marginBottom: 14 },
  bubbleWrapUser: { alignItems: 'flex-end' },
  bubbleWrapAi: { alignItems: 'flex-start' },
  bubbleLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: BORDER_RADIUS.card,
  },
  bubbleUser: {
    backgroundColor: ROLE_PLAY_ACCENT,
    alignSelf: 'flex-end',
  },
  bubbleAi: {
    backgroundColor: COLORS.inputSurface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  bubbleText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
    backgroundColor: COLORS.inputSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ROLE_PLAY_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  recordingHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 4,
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
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: {
    backgroundColor: COLORS.recording,
  },
  errorLine: {
    fontSize: 14,
    color: COLORS.recording,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  debriefBlock: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: ROLE_PLAY_ACCENT,
  },
  debriefLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ROLE_PLAY_ACCENT,
    marginBottom: 8,
  },
  debriefText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  transcriptLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  debriefActions: {
    marginTop: 28,
    gap: 12,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimary: {
    backgroundColor: ROLE_PLAY_ACCENT,
  },
  btnSecondary: {
    backgroundColor: COLORS.inputSurface,
  },
  btnTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  btnTextSecondary: {
    fontSize: 16,
    color: COLORS.text,
  },
  viewDate: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
});
