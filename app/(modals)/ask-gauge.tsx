/**
 * Universal AI Guide — Ask Gauge from anywhere.
 * Context-aware: explain, guide, coach, ask deeper questions, suggest.
 * Invoked via FAB or "Ask Gauge" with optional context (screen, hint).
 */

import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { hasOpenAIKey } from '../../src/services/ai';
import { usePremiumStore } from '../../src/stores/premiumStore';
import { VoiceTextInput } from '../../src/components/VoiceTextInput';
import { AiDisclaimerGate } from '../../src/components/AiDisclaimerGate';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

function buildGuideSystemPrompt(contextScreen?: string, contextHint?: string): string {
  let context = 'The user opened Ask Gauge for help.';
  if (contextScreen) context = `The user is on: ${contextScreen}. ${contextHint || 'They need in-context help.'}`;
  return `You are Gauge, the InGauge AI guide — a wise, calm, thoughtful companion.

CONTEXT: ${context}

Your job here is to: explain, guide, coach, ask a deeper question, or suggest — so they can use your answer right where they are. Keep responses concise (2–5 sentences). Be warm and direct. If they're stuck on a prompt or question, help them think it through or offer a simpler way in. Don't diagnose or therapize; guide.`;
}

export default function AskGaugeModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ contextScreen?: string; contextHint?: string; initialMessage?: string }>();
  const contextScreen = params.contextScreen ?? '';
  const contextHint = params.contextHint ?? '';
  const initialMessage = params.initialMessage ?? '';

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const canUseAI = usePremiumStore((s) => s.canUseAI());

  const guidePrompt = buildGuideSystemPrompt(contextScreen || undefined, contextHint || undefined);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSend = async () => {
    const text = input?.trim();
    if (!text || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setApiError(null);
    setInput('');
    const userMsg = { role: 'user' as const, content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const hasKey = await hasOpenAIKey();
      if (!hasKey || !canUseAI) {
        setMessages((prev) => [...prev, { role: 'assistant', content: "I can't connect right now. Check your API key in Settings or try again later." }]);
        setLoading(false);
        return;
      }
      const nextMessages = [...messages, userMsg];
      const reply = await sendMessageWithSystemPrompt(
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        guidePrompt
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setApiError(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: `I couldn't respond: ${msg}. Try again or type your question.` }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <AiDisclaimerGate>
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>Ask Gauge</Text>
        <View style={styles.closeBtn} />
      </View>
      {(contextScreen || contextHint) && (
        <View style={styles.contextBar}>
          <Text style={styles.contextText} numberOfLines={2}>
            {contextScreen && `${contextScreen}`}
            {contextHint ? ` · ${contextHint}` : ''}
          </Text>
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Ask anything. I can explain, guide, or help you think it through.</Text>
            <Text style={styles.placeholderSub}>e.g. "I don't know what to write here" or "Explain this to me"</Text>
          </View>
        )}
        {messages.map((m, i) => (
          <View key={i} style={m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}>
            <Text style={m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>{m.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.bubbleAssistant}>
            <ActivityIndicator size="small" color={ACCENT} />
          </View>
        )}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={styles.inputRow}>
          <VoiceTextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Gauge..."
            placeholderTextColor={TEXT_MUTED}
            style={styles.input}
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendBtn, (!input?.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input?.trim() || loading}
          >
            <Ionicons name="arrow-up" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
    </AiDisclaimerGate>
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
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  closeBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  contextBar: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: CARD_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  contextText: { fontSize: 13, color: TEXT_MUTED },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 16 },
  placeholder: { marginBottom: 24 },
  placeholderText: { fontSize: 16, color: TEXT_MUTED, lineHeight: 24 },
  placeholderSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 8, fontStyle: 'italic' },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: ACCENT,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: '85%',
  },
  bubbleTextUser: { fontSize: 15, color: '#fff' },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
    maxWidth: '85%',
  },
  bubbleTextAssistant: { fontSize: 15, color: TEXT, lineHeight: 22 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: BG },
  input: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT,
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.5 },
});
