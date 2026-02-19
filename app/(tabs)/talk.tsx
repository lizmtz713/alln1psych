import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  AppState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useUserStore } from '../../src/stores/userStore';
import {
  useConversationStore,
  type ConversationMessage,
} from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { hasOpenAIKey, sendMessage, generateConversationSummary, type UserContext } from '../../src/services/ai';
import * as Voice from '../../src/services/voice';
import type { CommunicationPreference } from '../../src/stores/userStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useUsageStore } from '../../src/stores/usageStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CrisisOverlay } from '../../src/components/CrisisOverlay';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { PremiumGate, AIUsageIndicator } from '../../src/components/PremiumGate';
import { usePremiumStore } from '../../src/stores/premiumStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useCockpitStore } from '../../src/stores/cockpitStore';

const MIC_BUTTON_SIZE = 80;
const MIC_BUTTON_SIZE_SMALL = 48;

function getFirstGreeting(name: string, communicationPreference: CommunicationPreference | null): string {
  const firstName = name?.trim() || 'there';
  const greeting = `Hi ${firstName} 👋`;
  const prefLine =
    communicationPreference === 'voice'
      ? "I'm here to listen whenever you want to talk. Just tap the mic."
      : "I'm here whenever you want to talk. Type anything — no judgment.";
  return `${greeting}\n\n${prefLine}\n\nHow are you feeling right now?`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function AnimatedMessageRow({
  children,
  style,
}: {
  children: React.ReactNode;
  style: (string | object)[];
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={([style, { opacity, transform: [{ translateY }] }] as StyleProp<ViewStyle>)}
    >
      {children}
    </Animated.View>
  );
}

function buildUserContext(): UserContext {
  const {
    name,
    ageGroup,
    loveLanguage,
    communicationPreference,
    sensitiveTopics,
    pronouns,
    customPronouns,
    culturalBackground,
    environmentUpbringing,
    culturalValues,
    culturalBackgroundOther,
    athleteMode,
    spectrumMode,
    athleteModeSettings,
    spectrumModeSettings,
  } = useUserStore.getState();
  
  // Get health data if connected
  const healthState = useHealthStore.getState();
  const healthSnapshot = healthState.snapshot;
  
  // Get current gauge values
  const cockpitState = useCockpitStore.getState();
  
  const pronounsDisplay =
    pronouns === 'other'
      ? (customPronouns?.trim() || 'not specified')
      : (pronouns ?? 'not specified');
  
  return {
    name: name || 'there',
    ageGroup: ageGroup ?? 'unknown',
    loveLanguage: loveLanguage ?? 'unknown',
    communicationPreference: communicationPreference ?? 'voice',
    pronouns: pronounsDisplay,
    sensitiveTopics: sensitiveTopics?.length ? sensitiveTopics : undefined,
    culturalBackground: culturalBackground?.length ? culturalBackground : undefined,
    environmentUpbringing: environmentUpbringing?.length ? environmentUpbringing : undefined,
    culturalValues: culturalValues?.length ? culturalValues : undefined,
    culturalBackgroundOther: culturalBackgroundOther?.trim() || undefined,
    athleteMode,
    spectrumMode,
    athleteModeSettings: athleteMode ? athleteModeSettings : undefined,
    spectrumModeSettings: spectrumMode ? spectrumModeSettings : undefined,
    // Health data for systems-aware AI
    healthData: healthSnapshot ? {
      sleepHours: healthSnapshot.sleep.lastNight.duration,
      sleepQuality: healthSnapshot.sleep.lastNight.quality,
      steps: healthSnapshot.activity.steps,
      exerciseMinutes: healthSnapshot.activity.exerciseMinutes,
      waterOz: healthSnapshot.nutrition.waterOz,
      restingHR: healthSnapshot.heart.restingHR ?? undefined,
      hrv: healthSnapshot.heart.hrv ?? undefined,
      cyclePhase: healthSnapshot.menstruation?.currentPhase ?? undefined,
      cycleDay: healthSnapshot.menstruation?.dayOfCycle ?? undefined,
      bodyScore: healthState.bodyScoreFromHealth ?? undefined,
    } : undefined,
    // Gauge values for cross-system insights
    gaugeValues: {
      body: cockpitState.body.value >= 0 ? cockpitState.body.value : undefined,
      state: cockpitState.state.value >= 0 ? cockpitState.state.value : undefined,
      emotion: cockpitState.emotion.value >= 0 ? cockpitState.emotion.value : undefined,
      connection: cockpitState.connection.value >= 0 ? cockpitState.connection.value : undefined,
      direction: cockpitState.direction.value >= 0 ? cockpitState.direction.value : undefined,
      alignment: cockpitState.alignment.value >= 0 ? cockpitState.alignment.value : undefined,
    },
  };
}

const ANXIETY_PATTERN = /I need to tell|I'm scared to ask|I don't know how to say|scared to tell|nervous to ask|practice (how|what) to say|want to practice/i;

const CRISIS_PATTERN = /want to die|kill myself|end (my )?life|hurt myself|suicide|can't do this anymore|what'?s the point|nobody would care|end it all|don'?t want to (be here|live)/i;

export default function TalkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const dot0 = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;

  const user = useUserStore();
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const canUseAI = usePremiumStore((s) => s.canUseAI());
  const incrementAIUsage = usePremiumStore((s) => s.incrementAIUsage);
  const {
    messages,
    isRecording,
    isProcessing,
    isAiTyping,
    inputMode,
    initialGreetingAdded,
    addMessage,
    setRecording,
    setProcessing,
    setAiTyping,
    setInputMode,
    setInitialGreetingAdded,
  } = useConversationStore();
  const apiKeySavedAt = useSettingsStore((s) => s.apiKeySavedAt);

  const [textInput, setTextInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);
  const lastOnDeviceResultRef = useRef('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [convToast, setConvToast] = useState(false);
  const [showFollowUpBanner, setShowFollowUpBanner] = useState(false);
  const [followUpDismissed, setFollowUpDismissed] = useState(false);
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addSummary = useConversationSummaryStore((s) => s.addSummary);
  const getLastSummary = useConversationSummaryStore((s) => s.getLastSummary);
  const clearMessages = useConversationStore((s) => s.clearMessages);
  const [conversationId, setConversationId] = useState(Date.now());

  function handleNewTopic() {
    clearMessages();
    addMessage({ role: 'assistant', content: "Fresh start. What's on your mind?", isVoice: false });
    setInitialGreetingAdded(true);
    setConversationId(Date.now());
  }

  function handleSaveAndClose() {
    router.push('/(tabs)');
  }

  const runSaveConversation = (showToast: boolean) => {
    const state = useConversationStore.getState();
    if (state.messages.length < 3) return;
    const snapshot = state.messages.map((m) => ({ role: m.role, content: m.content }));
    clearMessages();
    generateConversationSummary(snapshot)
      .then((payload) => {
        addSummary({
          title: payload.title,
          summary: payload.summary,
          emotions: payload.emotions,
          triggers: payload.triggers,
          insights: payload.insights,
          followUp: payload.followUp,
          messageCount: snapshot.length,
        });
        if (showToast) {
          setConvToast(true);
          setTimeout(() => setConvToast(false), 2500);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    hasOpenAIKey().then(setHasApiKey);
  }, [apiKeySavedAt]);

  // Show follow-up banner when opening Talk if last summary had a followUp
  useEffect(() => {
    if (messages.length > 1 || followUpDismissed) return;
    const last = getLastSummary();
    if (last?.followUp?.trim()) setShowFollowUpBanner(true);
  }, [messages.length, followUpDismissed, getLastSummary]);

  // 2 min inactivity: save and show toast
  useEffect(() => {
    if (messages.length < 3) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      runSaveConversation(true);
    }, 2 * 60 * 1000);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [messages.length, messages.map((m) => m.id).join(',')]);

  // App background: save (no toast)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') runSaveConversation(false);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (params.prompt) {
      setTextInput(params.prompt);
      setInputMode('text');
      setTimeout(() => textInputRef.current?.focus(), 300);
    }
  }, [params.prompt]);

  // Seed first greeting once
  useEffect(() => {
    if (!initialGreetingAdded && messages.length === 0) {
      const content = getFirstGreeting(user.name, user.communicationPreference);
      addMessage({ role: 'assistant', content, isVoice: false });
      setInitialGreetingAdded(true);
    }
  }, [initialGreetingAdded, messages.length, user.name, user.communicationPreference, addMessage, setInitialGreetingAdded]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(t);
  }, [messages.length, isAiTyping]);

  // Idle mic breathing: 1.0 → 1.05 → 1.0, 3s loop
  useEffect(() => {
    if (isRecording || isProcessing) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isRecording, isProcessing]);

  // Recording pulse + expanding ring
  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(1);
      ringScale.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    ring.start();
    return () => {
      pulse.stop();
      ring.stop();
    };
  }, [isRecording]);

  // Processing: spin
  useEffect(() => {
    if (!isProcessing) {
      spinAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [isProcessing]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Typing dots: staggered bounce (iMessage-like)
  useEffect(() => {
    if (!isAiTyping) {
      dot0.setValue(0);
      dot1.setValue(0);
      dot2.setValue(0);
      return;
    }
    const bounce = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        { iterations: -1 }
      );
    const a0 = bounce(dot0, 0);
    const a1 = bounce(dot1, 120);
    const a2 = bounce(dot2, 240);
    a0.start();
    a1.start();
    a2.start();
    return () => {
      a0.stop();
      a1.stop();
      a2.stop();
    };
  }, [isAiTyping]);

  const handleSendText = async () => {
    const content = textInput.trim();
    if (!content) return;
    
    // Check premium limits before sending
    if (!canUseAI) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowPremiumGate(true);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTextInput('');
    addMessage({ role: 'user', content, isVoice: false });
    if (CRISIS_PATTERN.test(content)) setShowCrisisOverlay(true);

    if (!hasApiKey) {
      addMessage({
        role: 'assistant',
        content: "I've saved what you wrote. Add your OpenAI API key in settings when you're ready to chat.",
        isVoice: false,
      });
      return;
    }

    setAiTyping(true);
    try {
      const apiMessages = messages
        .concat([{ id: '', role: 'user' as const, content, timestamp: new Date(), isVoice: false }])
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const response = await sendMessage(apiMessages, buildUserContext());
      // Check for error responses
      if (response?.startsWith('[AI Error') || response?.includes('"error"')) {
        addMessage({ role: 'assistant', content: "I'm having trouble connecting right now. Try again in a moment.", isVoice: false });
        return;
      }
      addMessage({ role: 'assistant', content: response, isVoice: false });
      incrementAIUsage(); // Track for free tier limits
      if (useSettingsStore.getState().aiVoiceEnabled && response?.trim()) {
        setTtsState('loading');
        Voice.speakWithOpenAI(response)
          .then(() => {
            setTtsState('playing');
            setTimeout(() => setTtsState('idle'), 2000);
          })
          .catch(() => setTtsState('idle'));
        useUsageStore.getState().incrementTTS();
      }
    } catch (e) {
      addMessage({
        role: 'assistant',
        content: "Something went wrong. Try again in a moment — I'm still here.",
        isVoice: false,
      });
    } finally {
      setAiTyping(false);
    }
  };

  const handleMicPress = async () => {
    if (!hasApiKey) return;
    if (!Voice.hasVoiceSupport()) return;

    if (isRecording) {
      // Tap to stop
      if (useWhisperFallback) {
        // Stop recording and transcribe with Whisper
        if (__DEV__) console.log('[Talk] stopRecording (Whisper fallback)');
        try {
          const uri = await Voice.stopRecording();
          setRecording(false);
          setUseWhisperFallback(false);
          setProcessing(true);
          const text = await Voice.transcribeWithWhisper(uri);
          useUsageStore.getState().incrementWhisperFallback();
          setProcessing(false);
          if (!text.trim()) {
            addMessage({
              role: 'assistant',
              content: "I didn't catch that. Want to try again or type it out?",
              isVoice: false,
            });
            return;
          }
          addMessage({ role: 'user', content: text, isVoice: true });
          if (CRISIS_PATTERN.test(text)) setShowCrisisOverlay(true);
        setAiTyping(true);
        const apiMessages = messages
          .concat([{ id: '', role: 'user' as const, content: text, timestamp: new Date(), isVoice: true }])
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        const response = await sendMessage(apiMessages, buildUserContext());
        // Check for error responses
        if (response?.startsWith('[AI Error') || response?.includes('"error"')) {
          addMessage({ role: 'assistant', content: "I'm having trouble connecting right now. Try again in a moment.", isVoice: false });
        } else {
          addMessage({ role: 'assistant', content: response, isVoice: false });
        }
        if (useSettingsStore.getState().aiVoiceEnabled && response?.trim() && !response?.startsWith('[AI Error')) {
          setTtsState('loading');
          Voice.speakWithOpenAI(response)
            .then(() => {
              setTtsState('playing');
              setTimeout(() => setTtsState('idle'), 2000);
            })
            .catch(() => setTtsState('idle'));
          useUsageStore.getState().incrementTTS();
        }
      } catch (e) {
        if (__DEV__) console.log('[Talk] Whisper fallback error:', e);
          setRecording(false);
          setProcessing(false);
          setUseWhisperFallback(false);
          addMessage({
            role: 'assistant',
            content: "Voice didn't work this time. Try typing, or check that your API key is set.",
            isVoice: false,
          });
        } finally {
          setAiTyping(false);
        }
        return;
      }

      // Stop on-device listening; final result may arrive in onSpeechResults after stop
      try {
        await Voice.stopOnDeviceListening();
      } catch (_) {}
      setRecording(false);
      setLiveTranscript('');
      const resultRef = lastOnDeviceResultRef;
      const fallbackText = liveTranscript;
      setTimeout(() => {
        const text = (resultRef.current || fallbackText).trim();
        resultRef.current = '';
        if (text) {
          setTextInput(text);
          setInputMode('text');
          setTimeout(() => textInputRef.current?.focus(), 200);
        } else {
          addMessage({
            role: 'assistant',
            content: "I didn't catch that. Want to try again or type it out?",
            isVoice: false,
          });
        }
      }, 100);
      return;
    }

    // Tap to start: on-device first, fallback to record + Whisper on error
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Microphone access needed',
        'Go to Settings > InGauge to enable it.',
        [{ text: 'OK' }]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiveTranscript('');
    lastOnDeviceResultRef.current = '';
    setUseWhisperFallback(false);
    setRecording(true);

    try {
      await Voice.startOnDeviceListening({
        onPartial: (t) => setLiveTranscript(t),
        onResult: (t) => { lastOnDeviceResultRef.current = t; },
        onError: () => {
          if (__DEV__) console.log('[Talk] On-device failed, falling back to Whisper');
          Voice.cancelOnDeviceListening();
          setLiveTranscript('');
          setUseWhisperFallback(true);
          Voice.startRecording().catch(() => setRecording(false));
        },
      });
    } catch (_) {
      if (__DEV__) console.log('[Talk] startOnDeviceListening failed, falling back to Whisper');
      setUseWhisperFallback(true);
      try {
        await Voice.startRecording();
      } catch (e) {
        setRecording(false);
        if (e instanceof Error && e.message === 'Microphone permission not granted') {
          Alert.alert(
            'Microphone access needed',
            'Go to Settings > InGauge to enable it.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const displayMessages: ConversationMessage[] = messages;
  const lastAiMessageId = displayMessages.filter((m) => m.role === 'assistant').pop()?.id;
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
  const showPracticeSuggestion =
    lastUserMessage &&
    ANXIETY_PATTERN.test(lastUserMessage.content) &&
    messages.length >= 2 &&
    !isAiTyping;

  return (
    <ErrorBoundary>
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {showCrisisOverlay && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CrisisOverlay onDismiss={() => setShowCrisisOverlay(false)} />
        </View>
      )}
      
      {/* Premium gate when hitting free tier limits */}
      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        feature="ai"
      />
      {/* Header with session controls */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: '#F0F0F5', fontSize: 18, fontWeight: '600' }}>Talk to Gauge</Text>
          <AIUsageIndicator />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleNewTopic(); }} style={{ backgroundColor: '#111118', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: '#8888A0', fontSize: 13 }}>New Topic</Text>
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleSaveAndClose(); }} style={{ backgroundColor: '#111118', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: '#8888A0', fontSize: 13 }}>Save & Close</Text>
          </Pressable>
        </View>
      </View>

      {/* Follow-up from last time */}
      {showFollowUpBanner && getLastSummary()?.followUp && (
        <View style={styles.followUpBanner}>
          <Text style={styles.followUpText}>
            Last time we talked about «{getLastSummary()?.title}». Want to continue?
          </Text>
          <View style={styles.followUpRow}>
            <Pressable
              style={styles.followUpButton}
              onPress={async () => {
                const followUp = getLastSummary()?.followUp ?? '';
                const content = `I'd like to pick up where we left off. Last time we talked about: ${followUp}. Can we continue?`;
                setShowFollowUpBanner(false);
                setFollowUpDismissed(true);
                addMessage({ role: 'user', content, isVoice: false });
                if (!hasApiKey) return;
                setAiTyping(true);
                try {
                  const apiMessages = messages
                    .concat([{ id: '', role: 'user' as const, content, timestamp: new Date(), isVoice: false }])
                    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
                  const response = await sendMessage(apiMessages, buildUserContext());
                  // Check for error responses
                  if (response?.startsWith('[AI Error') || response?.includes('"error"')) {
                    addMessage({ role: 'assistant', content: "I'm having trouble connecting right now. Try again in a moment.", isVoice: false });
                  } else {
                    addMessage({ role: 'assistant', content: response, isVoice: false });
                  }
                  if (useSettingsStore.getState().aiVoiceEnabled && response?.trim() && !response?.startsWith('[AI Error')) {
                    setTtsState('loading');
                    Voice.speakWithOpenAI(response)
                      .then(() => {
                        setTtsState('playing');
                        setTimeout(() => setTtsState('idle'), 2000);
                      })
                      .catch(() => setTtsState('idle'));
                    useUsageStore.getState().incrementTTS();
                  }
                } catch {
                  addMessage({
                    role: 'assistant',
                    content: "Something went wrong. I'm still here — try again in a moment.",
                    isVoice: false,
                  });
                } finally {
                  setAiTyping(false);
                }
              }}
            >
              <Text style={styles.followUpButtonText}>Yes, let's continue</Text>
            </Pressable>
            <Pressable
              style={styles.followUpDismiss}
              onPress={() => { setShowFollowUpBanner(false); setFollowUpDismissed(true); }}
            >
              <Text style={styles.followUpDismissText}>Start fresh</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Conversation saved toast */}
      {convToast && (
        <View style={[styles.convToast, { top: insets.top + 12 }]} pointerEvents="none">
          <Text style={styles.convToastText}>Conversation saved ✨</Text>
        </View>
      )}

      {/* No API key banner */}
      {!hasApiKey && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            To start talking, add your OpenAI API key in settings. For now, you can journal here — I'll save everything you write.
          </Text>
        </View>
      )}

      {/* Conversation */}
      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, { flex: 1, width: '100%' }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {displayMessages.map((msg) => (
          <AnimatedMessageRow
            key={msg.id}
            style={[styles.messageRow, msg.role === 'user' ? styles.messageRowUser : styles.messageRowAi]}
          >
            {msg.role === 'assistant' && (
              <View style={styles.psychLabel}>
                <View style={styles.psychDot} />
                <Text style={styles.psychLabelText}>Gauge</Text>
              </View>
            )}
            <View style={[styles.bubbleWrap, msg.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAi]}>
              <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <View style={styles.bubbleContentRow}>
                  <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                    {msg.content}
                  </Text>
                  {msg.role === 'assistant' && msg.id === lastAiMessageId && ttsState !== 'idle' && (
                    <Text style={styles.ttsIcon} accessibilityLabel={ttsState === 'loading' ? 'Voice loading' : 'Voice playing'}>
                      🔊
                    </Text>
                  )}
                </View>
                <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
              </View>
            </View>
          </AnimatedMessageRow>
        ))}
        {isAiTyping && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.psychLabel}>
              <View style={styles.psychDot} />
              <Text style={styles.psychLabelText}>Gauge</Text>
            </View>
            <View style={[styles.bubbleWrap, styles.bubbleWrapAi]}>
            <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
              <View style={styles.typingDots}>
                {[dot0, dot1, dot2].map((d, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.typingDot,
                      {
                        transform: [
                          {
                            translateY: d.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -5],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            </View>
          </View>
        )}
        {showPracticeSuggestion && (
          <Pressable
            style={styles.practiceSuggestion}
            onPress={() =>
              router.push(
                `/(modals)/role-play?scenario=${encodeURIComponent(lastUserMessage!.content.slice(0, 300))}`
              )
            }
          >
            <Text style={styles.practiceSuggestionText}>
              Would you like to practice that conversation first? I can play the other person so you can try different approaches.
            </Text>
            <Text style={styles.practiceSuggestionLink}>Practice this conversation →</Text>
          </Pressable>
        )}

        {/* Topic Starters - show when conversation is fresh */}
        {messages.length <= 1 && !isAiTyping && (
          <View style={styles.topicStartersSection}>
            <Text style={styles.topicStartersTitle}>Not sure where to start?</Text>
            <View style={styles.topicStartersGrid}>
              {[
                { emoji: '💔', label: 'Betrayal / Trust', prompt: "I'm dealing with betrayal in my relationship. I need to talk through what happened." },
                { emoji: '😰', label: 'Anxiety', prompt: "I've been feeling really anxious lately and I don't know why." },
                { emoji: '😢', label: 'Grief / Loss', prompt: "I'm grieving and I need someone to talk to about it." },
                { emoji: '😤', label: 'Anger', prompt: "I'm really angry about something and I need to process it." },
                { emoji: '💭', label: 'Relationship Issues', prompt: "I'm having relationship problems and need to talk through them." },
                { emoji: '😞', label: 'Feeling Low', prompt: "I've been feeling really down lately. Can we talk about it?" },
                { emoji: '🤯', label: 'Overwhelmed', prompt: "I'm completely overwhelmed right now and don't know where to start." },
                { emoji: '💬', label: 'Just Vent', prompt: "I just need to vent about something. Can you listen?" },
              ].map((topic) => (
                <Pressable
                  key={topic.label}
                  style={styles.topicStarterChip}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTextInput(topic.prompt);
                    setInputMode('text');
                    setTimeout(() => textInputRef.current?.focus(), 100);
                  }}
                >
                  <Text style={styles.topicStarterEmoji}>{topic.emoji}</Text>
                  <Text style={styles.topicStarterLabel}>{topic.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom input */}
      <View style={styles.bottom}>
        {inputMode === 'text' ? (
          <View style={styles.textRow}>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Type something..."
              placeholderTextColor={COLORS.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
              multiline
              maxLength={2000}
            />
            <Pressable
              style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
              onPress={handleSendText}
            >
              <Ionicons name="arrow-up" size={24} color={COLORS.text} />
            </Pressable>
            <Pressable
              style={[styles.micButtonSmall, hasApiKey && styles.micButtonSmallActive]}
              onPress={() => setInputMode('voice')}
            >
              <Ionicons name="mic-outline" size={24} color={COLORS.text} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.micRow}>
              <Animated.View
                style={[
                  styles.micWrap,
                  {
                    transform: [
                      { scale: isRecording ? pulseAnim : breatheAnim },
                      isProcessing ? { rotate: spinInterpolate } : { rotate: '0deg' },
                    ],
                  },
                ]}
              >
                {isRecording && (
                  <Animated.View
                    style={[
                      styles.micRing,
                      {
                        transform: [{ scale: ringScale }],
                        opacity: ringScale.interpolate({
                          inputRange: [1, 1.4],
                          outputRange: [0.5, 0],
                        }),
                      },
                    ]}
                  />
                )}
                <Pressable
                  onPress={handleMicPress}
                  style={[
                    styles.micButton,
                    isRecording && styles.micButtonRecording,
                    isProcessing && styles.micButtonProcessing,
                  ]}
                >
                  <Ionicons
                    name="mic"
                    size={36}
                    color={isRecording ? COLORS.text : COLORS.text}
                  />
                </Pressable>
              </Animated.View>
            </View>
            {isRecording && (
              <Text style={styles.listeningText}>
                {useWhisperFallback ? 'Recording... Tap again to stop.' : 'Listening... Tap again when done.'}
              </Text>
            )}
            {isRecording && !useWhisperFallback && (
              <View style={styles.liveTranscriptContainer}>
                <Text style={styles.liveTranscriptText} numberOfLines={3}>
                  {liveTranscript || 'Listening...'}
                </Text>
              </View>
            )}
            {isProcessing && !isRecording && <Text style={styles.listeningText}>Processing...</Text>}
            {!isRecording && !isProcessing && (
              <Text style={styles.hint}>Tap to start, tap again to stop.</Text>
            )}
            {!hasApiKey && (
              <Text style={styles.voiceFallback}>Voice requires an API key. Type instead for now.</Text>
            )}
            <Pressable style={styles.keyboardToggle} onPress={() => { setInputMode('text'); textInputRef.current?.focus(); }}>
              <Ionicons name="keypad-outline" size={22} color={COLORS.textMuted} />
              <Text style={styles.keyboardToggleText}>Type instead</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  endConvButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
  },
  endConvButtonText: {
    fontSize: 13,
    color: COLORS.accent,
  },
  followUpBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  followUpText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followUpButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.input,
  },
  followUpButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  followUpDismiss: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  followUpDismissText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  convToast: {
    position: 'absolute',
    left: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    alignItems: 'center',
    zIndex: 10,
  },
  convToastText: {
    fontSize: 15,
    color: COLORS.text,
  },
  banner: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: BORDER_RADIUS.input,
  },
  bannerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  scroll: { flex: 1, width: '100%' },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  psychLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 6,
  },
  psychDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  psychLabelText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bubbleWrap: {
    flex: 1,
    maxWidth: '88%',
    minWidth: 200,
    marginRight: 40,
    marginBottom: 8,
  },
  bubbleWrapUser: {
    alignSelf: 'flex-end',
    marginRight: 8,
    marginLeft: 40,
    maxWidth: '80%',
  },
  bubbleWrapAi: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 14,
    borderRadius: BORDER_RADIUS.card,
  },
  bubbleAi: {
    backgroundColor: COLORS.inputSurface,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.accent,
    borderTopRightRadius: 4,
  },
  bubbleContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  bubbleTextUser: {
    color: COLORS.text,
  },
  ttsIcon: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
    opacity: 0.8,
  },
  practiceSuggestion: {
    marginTop: 16,
    marginHorizontal: 4,
    padding: 14,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rolePlayAccent,
  },
  practiceSuggestionText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  practiceSuggestionLink: {
    fontSize: 15,
    color: COLORS.rolePlayAccent,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surface,
  },
  micRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  micWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  micRing: {
    position: 'absolute',
    width: MIC_BUTTON_SIZE,
    height: MIC_BUTTON_SIZE,
    borderRadius: MIC_BUTTON_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.recording,
    backgroundColor: 'transparent',
  },
  micButton: {
    width: MIC_BUTTON_SIZE,
    height: MIC_BUTTON_SIZE,
    borderRadius: MIC_BUTTON_SIZE / 2,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: COLORS.recording,
  },
  micButtonProcessing: {
    backgroundColor: COLORS.accentMuted,
  },
  listeningText: {
    fontSize: 14,
    color: COLORS.recording,
    textAlign: 'center',
    marginBottom: 4,
  },
  liveTranscriptContainer: {
    marginHorizontal: 24,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    minHeight: 44,
    justifyContent: 'center',
  },
  liveTranscriptText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  hint: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  voiceFallback: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  keyboardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  keyboardToggleText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.button,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  micButtonSmall: {
    width: MIC_BUTTON_SIZE_SMALL,
    height: MIC_BUTTON_SIZE_SMALL,
    borderRadius: MIC_BUTTON_SIZE_SMALL / 2,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonSmallActive: {
    backgroundColor: COLORS.inputSurface,
  },
  // Topic Starters
  topicStartersSection: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  topicStartersTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  topicStartersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  topicStarterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topicStarterEmoji: {
    fontSize: 16,
  },
  topicStarterLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
});
