/**
 * Love — Understand love, intimacy, and connection through science.
 * Premium UI with expandable learning on 5 Love Languages.
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
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { sendMessageWithSystemPrompt, type Message } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Mode = 'menu' | 'languages' | 'learn' | 'ask';

const LOVE_ACCENT = '#EC4899';
const LOVE_ACCENT_BG = 'rgba(236, 72, 153, 0.12)';
const LOVE_ACCENT_BORDER = 'rgba(236, 72, 153, 0.25)';
const LEARN_BG = 'rgba(236, 72, 153, 0.06)';
const LEARN_BORDER = 'rgba(236, 72, 153, 0.15)';

// Educational content for each love language
const LOVE_LANGUAGES_CONTENT = {
  words: {
    id: 'words',
    emoji: '💬',
    name: 'Words of Affirmation',
    color: '#3B82F6',
    quick: "For this person, words ARE love. A sincere compliment means more than any gift.",
    signs: [
      "They light up when you compliment them",
      "They remember specific things you've said — even years later",
      "Criticism hits them harder than others",
      "They give lots of verbal encouragement to people they love",
      "They save texts, cards, and notes that meant something",
    ],
    howToSpeak: [
      "Be specific: 'I love how you always check on your mom' > 'You're great'",
      "Say it out loud — thinking it doesn't count for them",
      "Leave notes, send texts just because",
      "Verbal appreciation for things they do (even small things)",
      "Words of encouragement when they're struggling",
    ],
    deep: "Words of Affirmation isn't about flattery — it's about being seen. People with this language often grew up either hearing affirming words (and learned that's how love sounds) or NOT hearing them (and craved what was missing). For them, silence isn't neutral; it can feel like rejection. The key insight: your words have disproportionate power with this person. One careless criticism can undo ten compliments.",
    avoid: "Don't use words as weapons. If you fight dirty with insults, this person will remember them for years. Also avoid empty praise — they can tell when you don't mean it.",
    source: "Chapman's research (validated by Egbert & Polk, 2006); Attachment Theory",
  },
  time: {
    id: 'time',
    emoji: '⏰',
    name: 'Quality Time',
    color: '#14B8A6',
    quick: "Presence is love. They don't want your phone — they want your eyes and your attention.",
    signs: [
      "They get upset when you're distracted during conversations",
      "They suggest activities to do together (even mundane ones)",
      "They feel hurt when plans get canceled",
      "They remember shared experiences in detail",
      "They'd rather do something boring with you than something exciting alone",
    ],
    howToSpeak: [
      "Put the phone away — fully away",
      "Make eye contact when they're talking",
      "Plan activities, even small ones (coffee, walks, cooking together)",
      "Don't multitask when you're with them",
      "Remember: quality > quantity. 20 focused minutes beats 2 distracted hours",
    ],
    deep: "Quality Time people are measuring your love by where you put your attention. In a world of infinite distractions, attention is the most valuable currency — and they know it. This language often develops in people who felt overlooked or who had a parent who was physically present but emotionally absent. The insight: when you give them undivided attention, you're saying 'you matter more than everything else right now.' That's what love feels like to them.",
    avoid: "Phubbing (phone snubbing) is devastating to this person. Being in the same room doesn't count if you're elsewhere mentally. Canceled plans feel like canceled love.",
    source: "Chapman; Social Psychology research on attention as a social resource (Aronson)",
  },
  gifts: {
    id: 'gifts',
    emoji: '🎁',
    name: 'Receiving Gifts',
    color: '#F59E0B',
    quick: "It's NOT materialism. The gift is proof you were thinking of them when they weren't there.",
    signs: [
      "They keep gifts for years, even small ones",
      "They notice when you bring them something, even tiny",
      "They give thoughtful gifts and put effort into choosing them",
      "They feel hurt when occasions pass without acknowledgment",
      "The thought behind the gift matters more than the price",
    ],
    howToSpeak: [
      "Bring small things that show you thought of them (their favorite snack, a flower)",
      "Remember occasions — not just birthdays, but 'I saw this and thought of you' moments",
      "The gift can be free: a found rock, a photo, a handwritten note",
      "Be present for important moments (your presence is a gift)",
      "Put thought into the choosing — they can tell",
    ],
    deep: "This is the most misunderstood love language. It's not about materialism or expense — it's about symbolism. The gift is EVIDENCE that you were somewhere, without them, and you thought of them anyway. That's the emotional logic: 'I exist in your mind even when I'm not in front of you.' For this person, a $2 coffee you grabbed because you knew they'd like it can mean more than an expensive but thoughtless gift.",
    avoid: "Forgetting occasions is forgetting them. Last-minute, no-thought gifts actually hurt. And don't dismiss this language as shallow — that's missing the point entirely.",
    source: "Chapman; research on symbolic communication in relationships",
  },
  acts: {
    id: 'acts',
    emoji: '🤝',
    name: 'Acts of Service',
    color: '#10B981',
    quick: "Actions speak louder than words — literally. They feel loved when you DO things for them.",
    signs: [
      "They notice when you do tasks without being asked",
      "They show love by doing things for others (cooking, fixing, helping)",
      "Broken promises hit hard — you said you'd do it and didn't",
      "They feel overwhelmed when tasks pile up",
      "They might struggle to ask for help directly",
    ],
    howToSpeak: [
      "Do things without being asked — notice what needs doing",
      "Follow through on what you say you'll do",
      "Offer to take something off their plate when they're stressed",
      "Help with tasks they find draining",
      "The effort matters: doing something difficult for them = more love",
    ],
    deep: "For Acts of Service people, love is a verb. They learned (often from family modeling) that you SHOW care through what you DO, not what you say. When you do something for them — especially something inconvenient or difficult — you're proving that their wellbeing matters enough to cost you something. The insight: they're often the people doing things for everyone else, and they're quietly keeping track of who reciprocates.",
    avoid: "Saying you'll do something and not doing it is a betrayal. Making more work for them (messes, broken promises) feels like the opposite of love. And don't keep score out loud — that weaponizes their language.",
    source: "Chapman; Behavioral expressions of love (Swenson, 1972)",
  },
  touch: {
    id: 'touch',
    emoji: '🤗',
    name: 'Physical Touch',
    color: '#EC4899',
    quick: "Touch IS communication. A hug says what words can't. Physical presence is irreplaceable.",
    signs: [
      "They reach out to touch you naturally (hand on arm, shoulder tap)",
      "They feel disconnected without physical contact",
      "They calm down noticeably when held",
      "Physical rejection (pulling away) hurts disproportionately",
      "They might not have words for feelings but want to be held",
    ],
    howToSpeak: [
      "Casual touch throughout the day (not just in bed)",
      "Sit close, hold hands, put your arm around them",
      "Hug them when they're stressed — sometimes before talking",
      "Be physically present during hard conversations",
      "Learn what kinds of touch they find comforting vs. overwhelming",
    ],
    deep: "Physical Touch is the most primal love language — it's rooted in our earliest experiences. Babies literally need touch to survive; the brain develops differently without it. For adults with this language, touch is a direct line to the nervous system. A hand on their back can calm them faster than any words. The insight: for this person, physical distance often FEELS like emotional distance, even if that's not your intention.",
    avoid: "Withholding touch as punishment is devastating. Pulling away during conflict (even if you need space) feels like rejection. Also: learn their touch preferences — not all touch is welcome, and overwhelming them isn't love.",
    source: "Chapman; Neuroscience of touch (Field, 2010); Polyvagal Theory (Porges)",
  },
};

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

// Expandable Love Language Card
function LoveLanguageCard({ 
  language, 
  expanded, 
  onToggle 
}: { 
  language: typeof LOVE_LANGUAGES_CONTENT['words']; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <Pressable 
      style={[
        styles.languageCard, 
        expanded && styles.languageCardExpanded,
        { borderColor: language.color + '30' }
      ]} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <LinearGradient
        colors={[language.color + '10', 'transparent']}
        style={styles.languageCardGlow}
      />
      
      {/* Header */}
      <View style={styles.languageHeader}>
        <View style={[styles.languageIcon, { backgroundColor: language.color + '20' }]}>
          <Text style={styles.languageEmoji}>{language.emoji}</Text>
        </View>
        <View style={styles.languageHeaderText}>
          <Text style={[styles.languageName, { color: language.color }]}>{language.name}</Text>
          <Text style={styles.languageQuick}>{language.quick}</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={COLORS.textMuted} 
        />
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.languageExpanded}>
          {/* Signs */}
          <View style={styles.languageSection}>
            <View style={styles.languageSectionHeader}>
              <Ionicons name="eye" size={16} color={language.color} />
              <Text style={[styles.languageSectionTitle, { color: language.color }]}>
                Signs Someone Has This Language
              </Text>
            </View>
            {language.signs.map((sign, i) => (
              <Text key={i} style={styles.languageBullet}>• {sign}</Text>
            ))}
          </View>

          {/* How to Speak It */}
          <View style={styles.languageSection}>
            <View style={styles.languageSectionHeader}>
              <Ionicons name="heart" size={16} color={language.color} />
              <Text style={[styles.languageSectionTitle, { color: language.color }]}>
                How to Speak This Language
              </Text>
            </View>
            {language.howToSpeak.map((tip, i) => (
              <Text key={i} style={styles.languageBullet}>• {tip}</Text>
            ))}
          </View>

          {/* Deep Dive */}
          <View style={styles.languageSection}>
            <View style={styles.languageSectionHeader}>
              <Ionicons name="bulb" size={16} color={language.color} />
              <Text style={[styles.languageSectionTitle, { color: language.color }]}>
                The Psychology Behind It
              </Text>
            </View>
            <Text style={styles.languageDeep}>{language.deep}</Text>
          </View>

          {/* What to Avoid */}
          <View style={styles.languageSection}>
            <View style={styles.languageSectionHeader}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={[styles.languageSectionTitle, { color: '#F59E0B' }]}>
                What to Avoid
              </Text>
            </View>
            <Text style={styles.languageAvoid}>{language.avoid}</Text>
          </View>

          {/* Source */}
          <Text style={styles.languageSource}>— {language.source}</Text>
        </View>
      )}
    </Pressable>
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
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  const toggleLanguage = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLanguage(expandedLanguage === id ? null : id);
  };

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
        <LinearGradient
          colors={[LOVE_ACCENT, '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerAccent}
        />

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

            {/* 5 Love Languages Section */}
            <AnimatedCard delay={200}>
              <View style={styles.languagesSectionHeader}>
                <Text style={styles.sectionTitle}>The 5 Love Languages</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap any language to learn how it works, how to spot it, and how to speak it.
                </Text>
              </View>
            </AnimatedCard>

            {Object.values(LOVE_LANGUAGES_CONTENT).map((language, index) => (
              <AnimatedCard key={language.id} delay={250 + index * 50}>
                <LoveLanguageCard
                  language={language}
                  expanded={expandedLanguage === language.id}
                  onToggle={() => toggleLanguage(language.id)}
                />
              </AnimatedCard>
            ))}

            {/* Topics Section */}
            <AnimatedCard delay={550}>
              <Text style={styles.sectionTitle}>Go Deeper</Text>
            </AnimatedCard>
            
            <View style={styles.topicsGrid}>
              {TOPICS.map((topic, index) => (
                <AnimatedCard key={topic.id} delay={600 + index * 30} style={styles.topicWrapper}>
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

            {/* Disclaimer */}
            <AnimatedCard delay={900}>
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
  },
  headerAccent: {
    height: 2,
    width: '100%',
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
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  languagesSectionHeader: {
    marginTop: SPACING.lg,
  },
  
  // Love Language Cards
  languageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  languageCardExpanded: {
    borderColor: LOVE_ACCENT + '40',
  },
  languageCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  languageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageEmoji: {
    fontSize: 22,
  },
  languageHeaderText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  languageQuick: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  languageExpanded: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  languageSection: {
    marginBottom: SPACING.lg,
  },
  languageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  languageSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  languageBullet: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginLeft: 24,
    marginBottom: 4,
  },
  languageDeep: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginLeft: 24,
  },
  languageAvoid: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginLeft: 24,
  },
  languageSource: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    marginLeft: 24,
  },
  
  // Topics Grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
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
