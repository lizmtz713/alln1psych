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
import { hasOpenAIKey, sendMessage, type UserContext } from '../../src/services/ai';
import * as Voice from '../../src/services/voice';
import type { CommunicationPreference } from '../../src/stores/userStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CrisisOverlay } from '../../src/components/CrisisOverlay';

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
      style={[style, { opacity, transform: [{ translateY }] }]}
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
  } = useUserStore.getState();
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
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    hasOpenAIKey().then(setHasApiKey);
  }, [apiKeySavedAt]);

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
      addMessage({ role: 'assistant', content: response, isVoice: false });
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
      // Tap to stop: stop recording, then transcribe and send
      if (__DEV__) console.log('[Talk] before stopRecording');
      try {
        const uri = await Voice.stopRecording();
        if (__DEV__) console.log('[Talk] after stopRecording, uri:', uri);
        setRecording(false);
        setProcessing(true);
        if (__DEV__) console.log('[Talk] before transcribeAudio');
        const text = await Voice.transcribeAudio(uri);
        if (__DEV__) console.log('[Talk] after transcribeAudio');
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
        addMessage({ role: 'assistant', content: response, isVoice: false });
      } catch (e) {
        if (__DEV__) console.log('[Talk] voice error (stop/transcribe/send):', e);
        setRecording(false);
        setProcessing(false);
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

    // Tap to start: request permission first, then start recording
    if (__DEV__) console.log('[Talk] before requestPermissionsAsync');
    const { status } = await Audio.requestPermissionsAsync();
    if (__DEV__) console.log('[Talk] requestPermissionsAsync result:', status);
    if (status !== 'granted') {
      Alert.alert(
        'Microphone access needed',
        'Go to Settings > AllN1 Psych to enable it.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (__DEV__) console.log('[Talk] before startRecording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setRecording(true);
      await Voice.startRecording();
      if (__DEV__) console.log('[Talk] after startRecording');
    } catch (e) {
      if (__DEV__) console.log('[Talk] startRecording error:', e);
      setRecording(false);
      if (e instanceof Error && e.message === 'Microphone permission not granted') {
        Alert.alert(
          'Microphone access needed',
          'Go to Settings > AllN1 Psych to enable it.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const displayMessages: ConversationMessage[] = messages;
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
  const showPracticeSuggestion =
    lastUserMessage &&
    ANXIETY_PATTERN.test(lastUserMessage.content) &&
    messages.length >= 2 &&
    !isAiTyping;

  return (
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
      {/* Status area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Space</Text>
      </View>

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
        style={styles.scroll}
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
                <Text style={styles.psychLabelText}>Psych</Text>
              </View>
            )}
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                {msg.content}
              </Text>
              <Text style={styles.timestamp}>{formatTime(msg.timestamp)}</Text>
            </View>
          </AnimatedMessageRow>
        ))}
        {isAiTyping && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.psychLabel}>
              <View style={styles.psychDot} />
              <Text style={styles.psychLabelText}>Psych</Text>
            </View>
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
            {isRecording && <Text style={styles.listeningText}>Recording... Tap again to stop.</Text>}
            {isProcessing && !isRecording && <Text style={styles.listeningText}>Processing...</Text>}
            {!isRecording && !isProcessing && (
              <Text style={styles.hint}>Tap to start, tap again to stop.</Text>
            )}
            {!hasApiKey && (
              <Text style={styles.voiceFallback}>Voice requires an API key. Type instead for now.</Text>
            )}
            <Pressable style={styles.keyboardToggle} onPress={() => { setInputMode('text'); textInputRef.current?.focus(); }}>
              <Ionicons name="keyboard-outline" size={22} color={COLORS.textMuted} />
              <Text style={styles.keyboardToggleText}>Type instead</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    color: COLORS.textMuted,
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
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
  bubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: BORDER_RADIUS.card,
  },
  bubbleAi: {
    backgroundColor: COLORS.inputSurface,
    alignSelf: 'flex-start',
  },
  bubbleUser: {
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: COLORS.text,
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
});
