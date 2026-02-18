/**
 * Love — Understand love, intimacy, and connection through science.
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
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { sendMessageWithSystemPrompt, type Message } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Mode = 'menu' | 'languages' | 'learn' | 'ask';

const LOVE_ACCENT = '#EC4899';
const LOVE_ACCENT_BG = 'rgba(236, 72, 153, 0.12)';
const LOVE_ACCENT_BORDER = 'rgba(236, 72, 153, 0.25)';

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

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default function LoveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<Mode>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleBack = () => {
    if (mode === 'menu') {
      router.back();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode('menu');
      setMessages([]);
      setSelectedTopic(null);
    }
  };

  const startLanguagesQuiz = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    
    try {
      const systemPrompt = mode === 'languages' ? LANGUAGES_QUIZ_PROMPT : SYSTEM_PROMPT;
      const response = await sendMessageWithSystemPrompt(newMessages, systemPrompt);
      setMessages([...newMessages, { role: 'assistant', content: response ?? 'I\'m here to help. What would you like to know?' }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.warn('[Love] Send failed:', e);
    }
    setLoading(false);
  };

  const getHeaderTitle = () => {
    switch (mode) {
      case 'languages': return 'Your Love Language';
      case 'learn': return TOPICS.find(t => t.id === selectedTopic)?.title ?? 'Learn';
      case 'ask': return 'Ask Anything';
      default: return 'Love';
    }
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={8}>
            <Ionicons name={mode === 'menu' ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <View style={styles.headerRight} />
        </View>

        {mode === 'menu' && (
          <ScrollView 
            style={styles.scroll} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <AnimatedCard delay={0}>
              <View style={styles.heroSection}>
                <Text style={styles.heroEmoji}>💕</Text>
                <Text style={styles.heroTitle}>Love & Connection</Text>
                <Text style={styles.heroSubtitle}>
                  The stuff nobody teaches but everyone needs to know.{'\n'}
                  Real science, no shame, human delivery.
                </Text>
              </View>
            </AnimatedCard>

            {/* Featured Cards */}
            <AnimatedCard delay={100}>
              <Pressable style={styles.featuredCard} onPress={startLanguagesQuiz}>
                <LinearGradient
                  colors={[LOVE_ACCENT_BG, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredIcon}>
                  <Text style={styles.featuredEmoji}>💕</Text>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>Discover Your Love Language</Text>
                  <Text style={styles.featuredDesc}>Quick chat to understand how you give and receive love</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </Pressable>
            </AnimatedCard>

            <AnimatedCard delay={150}>
              <Pressable style={styles.featuredCard} onPress={startAsk}>
                <LinearGradient
                  colors={[LOVE_ACCENT_BG, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredIcon}>
                  <Ionicons name="lock-closed" size={24} color={LOVE_ACCENT} />
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>Ask Anything</Text>
                  <Text style={styles.featuredDesc}>Safe space. No judgment. Real answers.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </Pressable>
            </AnimatedCard>

            {/* Topics Section */}
            <AnimatedCard delay={200}>
              <Text style={styles.sectionTitle}>Learn</Text>
            </AnimatedCard>
            
            <View style={styles.topicsGrid}>
              {TOPICS.map((topic, index) => (
                <AnimatedCard key={topic.id} delay={250 + index * 30} style={styles.topicWrapper}>
                  <Pressable
                    style={({ pressed }) => [styles.topicCard, pressed && styles.topicCardPressed]}
                    onPress={() => startTopic(topic.id)}
                  >
                    <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicDesc}>{topic.desc}</Text>
                  </Pressable>
                </AnimatedCard>
              ))}
            </View>

            {/* Love Languages Reference */}
            <AnimatedCard delay={600}>
              <Text style={styles.sectionTitle}>The 5 Love Languages</Text>
              <View style={styles.languagesGrid}>
                {LOVE_LANGUAGES.map((lang) => (
                  <View key={lang.id} style={styles.languageChip}>
                    <Text style={styles.languageEmoji}>{lang.emoji}</Text>
                    <Text style={styles.languageName}>{lang.name}</Text>
                  </View>
                ))}
              </View>
            </AnimatedCard>

            {/* Disclaimer */}
            <AnimatedCard delay={700}>
              <Text style={styles.disclaimer}>
                Science-backed information for education.{'\n'}
                Not a substitute for professional medical or therapeutic advice.
              </Text>
            </AnimatedCard>
          </ScrollView>
        )}

        {(mode === 'languages' || mode === 'learn' || mode === 'ask') && (
          <View style={styles.chatContainer}>
            <ScrollView 
              ref={scrollRef}
              style={styles.chatScroll} 
              contentContainerStyle={[styles.chatContent, { paddingBottom: insets.bottom + 80 }]}
              showsVerticalScrollIndicator={false}
            >
              {mode === 'ask' && messages.length === 0 && (
                <View style={styles.askEmpty}>
                  <View style={styles.askEmptyIcon}>
                    <Ionicons name="lock-closed" size={32} color={LOVE_ACCENT} />
                  </View>
                  <Text style={styles.askEmptyTitle}>This is a safe space</Text>
                  <Text style={styles.askEmptyDesc}>
                    Ask anything about love, sex, intimacy, attraction, or relationships.
                    No question is too awkward. Real answers, zero judgment.
                  </Text>
                </View>
              )}
              
              {messages.map((msg, i) => (
                <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={styles.bubbleText}>{msg.content}</Text>
                </View>
              ))}
              
              {loading && (
                <View style={styles.loadingBubble}>
                  <ActivityIndicator color={LOVE_ACCENT} size="small" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
              <TextInput
                style={styles.input}
                placeholder={mode === 'ask' ? 'Ask anything...' : 'Type your response...'}
                placeholderTextColor={COLORS.textMuted}
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
                <Ionicons name="send" size={18} color={input.trim() && !loading ? '#FFF' : COLORS.textMuted} />
              </Pressable>
            </View>
          </View>
        )}
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
    paddingBottom: SPACING.xxxl,
  },
  
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
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
  
  // Featured Cards
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: LOVE_ACCENT_BORDER,
    overflow: 'hidden',
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: LOVE_ACCENT_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featuredEmoji: {
    fontSize: 24,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: 2,
  },
  featuredDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
  },
  
  // Section
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  
  // Topics Grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  topicWrapper: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
  },
  topicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicCardPressed: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderLight,
  },
  topicEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  topicTitle: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    marginBottom: 4,
  },
  topicDesc: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  
  // Languages Reference
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  languageEmoji: {
    fontSize: 14,
  },
  languageName: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
  },
  
  // Disclaimer
  disclaimer: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: 18,
  },
  
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.lg,
  },
  askEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  askEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LOVE_ACCENT_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  askEmptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  askEmptyDesc: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    backgroundColor: LOVE_ACCENT_BG,
    alignSelf: 'flex-end',
    borderBottomRightRadius: SPACING.xs,
    borderWidth: 1,
    borderColor: LOVE_ACCENT_BORDER,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LOVE_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
