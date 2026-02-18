/**
 * Love — Understand love, intimacy, and connection through science.
 * Love languages + sex ed + relationship science, delivered like a human friend.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { sendMessageWithSystemPrompt, type Message } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const TEXT_DIM = '#55556A';
const ACCENT = '#E91E63'; // Pink/love themed
const ACCENT_BG = 'rgba(233, 30, 99, 0.15)';

type Mode = 'menu' | 'languages' | 'learn' | 'ask';

const LOVE_LANGUAGES = [
  { id: 'words', emoji: '💬', name: 'Words of Affirmation', desc: 'Verbal compliments, encouragement, appreciation' },
  { id: 'time', emoji: '⏰', name: 'Quality Time', desc: 'Undivided attention, being fully present' },
  { id: 'gifts', emoji: '🎁', name: 'Receiving Gifts', desc: 'Thoughtful symbols of love and care' },
  { id: 'acts', emoji: '🤝', name: 'Acts of Service', desc: 'Actions that show love through doing' },
  { id: 'touch', emoji: '🤗', name: 'Physical Touch', desc: 'Physical connection and affection' },
];

const TOPICS = [
  { id: 'attachment', emoji: '🔗', title: 'Attachment Styles', desc: 'Why you love the way you love' },
  { id: 'chemistry', emoji: '🧪', title: 'Love Chemistry', desc: 'Oxytocin, dopamine, and bonding' },
  { id: 'attraction', emoji: '✨', title: 'Attraction Science', desc: 'What draws us to people' },
  { id: 'intimacy', emoji: '💕', title: 'Building Intimacy', desc: 'Emotional and physical closeness' },
  { id: 'communication', emoji: '🗣️', title: 'Love Languages IRL', desc: 'Speaking your partner\'s language' },
  { id: 'boundaries', emoji: '🛡️', title: 'Healthy Boundaries', desc: 'Where you end and they begin' },
  { id: 'consent', emoji: '✅', title: 'Consent & Communication', desc: 'The foundation of intimacy' },
  { id: 'desire', emoji: '🔥', title: 'Desire & Arousal', desc: 'Understanding your body\'s responses' },
  { id: 'pleasure', emoji: '🌊', title: 'Pleasure & Connection', desc: 'Beyond the myths' },
  { id: 'recovery', emoji: '💔', title: 'Healing from Heartbreak', desc: 'The science of moving on' },
];

const SYSTEM_PROMPT = `You are Psych in "Love" mode — a warm, knowledgeable friend who talks about love, intimacy, sex, and connection openly and without shame.

Your foundation is REAL SCIENCE:
- Biological Psychology by James W. Kalat
- Foundations of Physiological Psychology by Neil R. Carlson
- Attachment theory (Bowlby, Ainsworth)
- Love languages research (Chapman)
- Neuroscience of bonding and intimacy

Your delivery is HUMAN:
- Talk like a knowledgeable friend, not a textbook
- No clinical coldness, no awkward hedging
- Be direct about bodies, sex, desire — it's all normal
- Address shame and misinformation head-on
- Use real language people actually use

Your role:
- Answer questions about love, sex, intimacy, attraction, relationships
- Explain the science in accessible ways
- Normalize what society makes shameful
- Be the friend everyone deserves but few have

Never be preachy. Never be judgmental. Be warm, real, and helpful.`;

const LANGUAGES_QUIZ_PROMPT = `You are Psych helping someone discover their love language. Ask them 5 quick questions (one at a time) to understand how they prefer to give and receive love. After their answers, tell them:
1. Their primary love language (with confidence %)
2. Their secondary love language
3. How this shows up in relationships
4. One tip for communicating this to a partner

Keep it conversational and warm. Not a formal quiz — more like a friend figuring it out together.`;

export default function LoveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleBack = () => {
    if (mode === 'menu') {
      router.back();
    } else {
      setMode('menu');
      setMessages([]);
      setSelectedTopic(null);
    }
  };

  const startLanguagesQuiz = async () => {
    setMode('languages');
    setLoading(true);
    try {
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: 'Help me discover my love language.' }],
        LANGUAGES_QUIZ_PROMPT
      );
      setMessages([
        { role: 'user', content: 'Help me discover my love language.' },
        { role: 'assistant', content: response ?? 'Let\'s figure out your love language together. How do you most like to show someone you care about them?' }
      ]);
    } catch (e) {
      console.warn('[Love] Quiz start failed:', e);
    }
    setLoading(false);
  };

  const startTopic = async (topicId: string) => {
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    setSelectedTopic(topicId);
    setMode('learn');
    setLoading(true);
    try {
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: `Tell me about: ${topic.title} — ${topic.desc}` }],
        SYSTEM_PROMPT
      );
      setMessages([
        { role: 'user', content: `Tell me about: ${topic.title}` },
        { role: 'assistant', content: response ?? 'Let me share what we know about this...' }
      ]);
    } catch (e) {
      console.warn('[Love] Topic start failed:', e);
    }
    setLoading(false);
  };

  const startAsk = () => {
    setMode('ask');
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const systemPrompt = mode === 'languages' ? LANGUAGES_QUIZ_PROMPT : SYSTEM_PROMPT;
      const response = await sendMessageWithSystemPrompt(newMessages, systemPrompt);
      setMessages([...newMessages, { role: 'assistant', content: response ?? 'I\'m here to help. What would you like to know?' }]);
    } catch (e) {
      console.warn('[Love] Send failed:', e);
    }
    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name={mode === 'menu' ? 'close' : 'arrow-back'} size={28} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {mode === 'menu' && 'Love'}
            {mode === 'languages' && 'Your Love Language'}
            {mode === 'learn' && (TOPICS.find(t => t.id === selectedTopic)?.title ?? 'Learn')}
            {mode === 'ask' && 'Ask Anything'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {mode === 'menu' && (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.intro}>
              Love, intimacy, and connection — the stuff nobody teaches but everyone needs to know.
              Real science, no shame, human delivery.
            </Text>

            {/* Love Languages Quick Access */}
            <Pressable style={styles.featuredCard} onPress={startLanguagesQuiz}>
              <Text style={styles.featuredEmoji}>💕</Text>
              <View style={styles.featuredText}>
                <Text style={styles.featuredTitle}>Discover Your Love Language</Text>
                <Text style={styles.featuredDesc}>Quick chat to understand how you give and receive love</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
            </Pressable>

            {/* Ask Anything */}
            <Pressable style={styles.featuredCard} onPress={startAsk}>
              <Text style={styles.featuredEmoji}>🔒</Text>
              <View style={styles.featuredText}>
                <Text style={styles.featuredTitle}>Ask Anything</Text>
                <Text style={styles.featuredDesc}>Safe space. No judgment. Real answers.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
            </Pressable>

            {/* Topics Grid */}
            <Text style={styles.sectionTitle}>Learn</Text>
            <View style={styles.topicsGrid}>
              {TOPICS.map(topic => (
                <Pressable
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => startTopic(topic.id)}
                >
                  <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDesc}>{topic.desc}</Text>
                </Pressable>
              ))}
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Science-backed information for education. Not a substitute for professional medical or therapeutic advice.
            </Text>
          </ScrollView>
        )}

        {(mode === 'languages' || mode === 'learn' || mode === 'ask') && (
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
              {messages.map((msg, i) => (
                <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, msg.role === 'user' ? styles.userText : styles.aiText]}>
                    {msg.content}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={ACCENT} />
                </View>
              )}
            </ScrollView>
            <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                style={styles.input}
                placeholder={mode === 'ask' ? 'Ask anything...' : 'Type your response...'}
                placeholderTextColor={TEXT_DIM}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={1000}
              />
              <Pressable
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={20} color={input.trim() && !loading ? TEXT_PRIMARY : TEXT_DIM} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ErrorBoundary>
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
    borderBottomColor: CARD_BORDER,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  intro: { color: TEXT_SECONDARY, fontSize: 15, lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  featuredCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  featuredEmoji: { fontSize: 28, marginRight: 14 },
  featuredText: { flex: 1 },
  featuredTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  featuredDesc: { color: TEXT_SECONDARY, fontSize: 13 },
  sectionTitle: { color: TEXT_PRIMARY, fontSize: 17, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  topicEmoji: { fontSize: 24, marginBottom: 8 },
  topicTitle: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  topicDesc: { color: TEXT_SECONDARY, fontSize: 12, lineHeight: 16 },
  disclaimer: { color: TEXT_DIM, fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 16 },
  chatContainer: { flex: 1 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 100 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: ACCENT_BG, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: CARD_BG, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: CARD_BORDER },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  userText: { color: TEXT_PRIMARY },
  aiText: { color: TEXT_PRIMARY },
  loadingContainer: { padding: 20, alignItems: 'flex-start' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },
  input: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT_PRIMARY,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: CARD_BG },
});
