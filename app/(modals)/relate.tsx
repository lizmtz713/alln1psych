/**
 * Relate — Understand anyone through personality dynamics.
 * Demo-ready with animations, polish, and expandable learning.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getPersonality, getRelationshipDynamic } from '../../src/services/personology';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RelType = 'romantic' | 'family' | 'friendship' | 'work';

const RELATE_ACCENT = '#7C4DFF';
const RELATE_GRADIENT = ['#7C4DFF', '#9C6AFF'];
const LEARN_BG = 'rgba(124,77,255,0.06)';
const LEARN_BORDER = 'rgba(124,77,255,0.15)';
const CARD_GLOW = 'rgba(124,77,255,0.08)';

// Animated card component with staggered entrance
function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }, { scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Educational content for each concept
const LEARN_CONTENT: Record<string, { quick: string; deep: string; source: string; lessonId?: string }> = {
  communicationStyle: {
    quick: "How someone processes and shares information shapes every interaction.",
    deep: "Communication style isn't about introversion or extroversion — it's about how someone's brain naturally processes information. Some people think out loud (external processors), others need silence to form thoughts (internal processors). Neither is better. Mismatches cause most relationship friction.",
    source: "Goldschneider, The Secret Language of Relationships",
  },
  strengths: {
    quick: "Knowing someone's natural gifts helps you see them clearly — not who you want them to be.",
    deep: "We often fall in love with someone's strengths, then spend years trying to fix their challenges. Understanding that strengths and challenges are two sides of the same trait changes everything. Their 'stubbornness' is also their 'loyalty.' Their 'overthinking' is also their 'thoroughness.'",
    source: "Personality Psychology (Feist & Feist)",
  },
  challenges: {
    quick: "Challenges aren't flaws — they're the shadow side of strengths.",
    deep: "Every strength has a shadow. The same trait that makes someone 'spontaneous' also makes them 'unreliable' under stress. When you understand this, you stop trying to eliminate their challenges and start managing the conditions that trigger them.",
    source: "Clinical Psychology (Compas & Gotlib)",
  },
  stressResponse: {
    quick: "Under stress, we all regress to our default wiring. Knowing theirs prevents misreading.",
    deep: "Stress shrinks the 'window of tolerance' — the range where we can think clearly and respond thoughtfully. Outside that window, we go into fight, flight, freeze, or fawn. Their stress response isn't a choice; it's their nervous system's learned survival pattern. It can be rewired, but not in the moment.",
    source: "Polyvagal Theory (Stephen Porges); Biopsychology (Pinel)",
  },
  needs: {
    quick: "Unmet needs drive 90% of relationship conflict. Most people can't articulate theirs.",
    deep: "Behind every complaint is an unmet need. 'You never listen' = need for validation. 'You're always working' = need for presence. When you know someone's core needs, you can meet them directly instead of guessing. And when you know your own, you can ask clearly.",
    source: "Nonviolent Communication (Rosenberg); Attachment Theory",
  },
  dynamicStrengths: {
    quick: "What works between you isn't luck — it's the fit between your patterns.",
    deep: "Relationship strengths emerge from complementary patterns. One person's calm balances another's intensity. One's optimism lifts another's realism. These aren't coincidences — they're why you were drawn together. Knowing them helps you lean into what works.",
    source: "Social Psychology (Aronson)",
  },
  frictionPoints: {
    quick: "Friction isn't failure. It's information about where you need translation.",
    deep: "Every relationship has predictable friction points based on personality combinations. The goal isn't to eliminate friction — it's to understand it. When you see friction as 'different operating systems' instead of 'they're wrong,' you can build bridges instead of walls.",
    source: "Gottman Institute Research",
  },
  communicationTip: {
    quick: "Small adjustments in how you say things can completely change how they land.",
    deep: "Communication isn't just about what you say — it's about matching their processing style. Some people need the headline first ('I need help'), then context. Others need context first, then the ask. Getting the order wrong makes them feel manipulated or confused, even when your intentions are good.",
    source: "Cognitive Psychology (Matlin)",
  },
  conflictPattern: {
    quick: "Every couple has a conflict pattern. Yours is predictable. That means it's changeable.",
    deep: "Dr. John Gottman identified four patterns that predict relationship failure: criticism, contempt, defensiveness, stonewalling. But before those, there's a dance — pursue/withdraw, escalate/escalate, avoid/avoid. Knowing your dance lets you change the music.",
    source: "Gottman Institute; Clinical Psychology",
    lessonId: "conflict-patterns",
  },
  whatTheyNeed: {
    quick: "Meeting someone's needs isn't about mind-reading — it's about learning their language.",
    deep: "The 5 Love Languages framework is backed by research: people feel loved differently. Words of affirmation, acts of service, gifts, quality time, physical touch. If you're speaking a different language than they hear, you're both trying hard and both feeling unloved.",
    source: "Social Psychology (Aronson); Chapman's research",
    lessonId: "love-languages",
  },
  whatYouNeed: {
    quick: "You can't pour from an empty cup. Knowing your needs lets you ask for them.",
    deep: "Most people are better at identifying what's wrong than what they need. 'I feel disconnected' is a complaint. 'I need 20 minutes of undivided attention' is a request. Translating feelings into needs is a skill. This section helps you practice.",
    source: "Clinical Psychology; Emotion-Focused Therapy",
  },
};

// Expandable learning component
function LearnMore({ 
  id, 
  expanded, 
  onToggle,
  onLesson,
}: { 
  id: string;
  expanded: boolean;
  onToggle: () => void;
  onLesson?: (lessonId: string) => void;
}) {
  const content = LEARN_CONTENT[id];
  if (!content) return null;

  return (
    <View style={styles.learnContainer}>
      <Pressable onPress={onToggle} style={styles.learnQuickRow}>
        <Ionicons name="bulb-outline" size={14} color={RELATE_ACCENT} style={{ marginRight: 6 }} />
        <Text style={styles.learnQuick}>{content.quick}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={14} 
          color={RELATE_ACCENT} 
          style={{ marginLeft: 4 }}
        />
      </Pressable>
      {expanded && (
        <View style={styles.learnExpanded}>
          <Text style={styles.learnDeep}>{content.deep}</Text>
          <Text style={styles.learnSource}>— {content.source}</Text>
          {content.lessonId && onLesson && (
            <Pressable 
              style={styles.lessonLink}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onLesson(content.lessonId!);
              }}
            >
              <Ionicons name="book-outline" size={14} color={RELATE_ACCENT} />
              <Text style={styles.lessonLinkText}>Learn more in Human Manual</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function isoToMMDDYYYY(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function Relate() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string; birthday?: string }>();
  const userBirthday = useUserStore((s) => s.birthday);
  const userName = useUserStore((s) => s.name);

  // Mode: 'solo' = just viewing your own profile, 'compare' = comparing two people
  const [mode, setMode] = useState<'solo' | 'compare'>('compare'); // Default to compare
  const [person1Name, setPerson1Name] = useState('');
  const [person1Birthday, setPerson1Birthday] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2Birthday, setPerson2Birthday] = useState('');
  // Legacy aliases for results compatibility
  const myBirthday = person1Birthday;
  const theirBirthday = person2Birthday;
  const theirName = person2Name;
  const [relType, setRelType] = useState<RelType | null>(null);
  const [result, setResult] = useState<{ me: any; them: any; dynamic: any; myIso: string; theirIso: string } | null>(null);
  const [soloResult, setSoloResult] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedLearn, setExpandedLearn] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [fullBio, setFullBio] = useState<string | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Function to pre-fill Person 1 with user data and switch to compare
  const startCompareWithMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (userName) setPerson1Name(userName);
    if (userBirthday) {
      const d = new Date(userBirthday);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        setPerson1Birthday(`${mm}/${dd}/${yyyy}`);
      }
    }
    setMode('compare');
  };

  // Generate full personality bio via AI
  const generateFullBio = async () => {
    if (!soloResult || bioLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBioLoading(true);
    try {
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: `Generate a full personality profile bio for someone who is "${soloResult.name}" (${soloResult.range}).

Their traits:
- Strengths: ${soloResult.strengths?.join(', ')}
- Challenges: ${soloResult.challenges?.join(', ')}
- Communication style: ${soloResult.communicationStyle}
- Needs in relationships: ${soloResult.needsInRelationships}
- Stress response: ${soloResult.stressResponse}

Name: ${userName || 'This person'}` }],
        `You are a personality psychologist writing a warm, insightful personality bio. Write in second person ("You are..."). 

Structure the bio with these sections:
1. **Who You Are** (2-3 sentences capturing their essence)
2. **Your Superpowers** (what they naturally excel at)
3. **Your Shadow Side** (challenges, written compassionately)
4. **In Relationships** (how they show up, what they need)
5. **When Life Gets Hard** (their stress patterns)
6. **Your Growth Edge** (one key area for development)

Keep it warm, specific, and validating — not generic horoscope fluff. About 250-300 words total. Use their name if provided.`
      );
      setFullBio(response ?? null);
    } catch (e) {
      setFullBio(null);
    }
    setBioLoading(false);
  };

  // Auto-show solo profile if user has birthday
  useEffect(() => {
    if (userBirthday && mode === 'solo' && !soloResult) {
      const d = new Date(userBirthday);
      if (!isNaN(d.getTime())) {
        const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const personality = getPersonality(isoDate);
        if (personality) {
          setSoloResult(personality);
        }
      }
    }
  }, [userBirthday, mode, soloResult]);

  const toggleLearn = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedLearn(expandedLearn === id ? null : id);
  };

  const goToLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lessonId}`);
  };

  // Handle deep link params for Person 2
  useEffect(() => {
    if (params.name && params.name !== person2Name) setPerson2Name(params.name);
    if (params.birthday) {
      const display = isoToMMDDYYYY(params.birthday);
      if (display && display !== person2Birthday) setPerson2Birthday(display);
    }
  }, [params.name, params.birthday]);

  function formatBirthday(text: string, setter: (v: string) => void) {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) setter(cleaned);
    else if (cleaned.length <= 4) setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
    else setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
  }

  function parseBirthday(mmddyyyy: string): string {
    const parts = mmddyyyy.split('/');
    if (parts.length !== 3 || parts[2].length !== 4) return '';
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return '';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  async function handleCheck() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const person1Iso = parseBirthday(person1Birthday);
      const person2Iso = parseBirthday(person2Birthday);
      if (!person1Iso || !person2Iso) return;

      const me = getPersonality(person1Iso);
      const them = getPersonality(person2Iso);
      const dynamic = getRelationshipDynamic(person1Iso, person2Iso);
      if (!me || !them) return;

      setResult({ me, them, dynamic, myIso: person1Iso, theirIso: person2Iso });
      setExpandedLearn(null);
      setShowResults(true);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);

      setLoading(true);
      try {
        const name1 = person1Name.trim() || 'Person 1';
        const name2 = person2Name.trim() || 'Person 2';
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `${name1}'s personality: ${me.name} (${me.communicationStyle}). ${name2}'s personality: ${them.name} (${them.communicationStyle}). Relationship: ${relType}. Give a relationship insight.` }],
          `You are Gauge, a relationship intelligence companion. Based on two personality profiles and their relationship type, give a warm, specific, insightful reading.

For ROMANTIC: Chemistry, communication differences, what makes them click, what could pull them apart, one tip for long-term success.
For FAMILY: Generational dynamics, communication gaps, unspoken expectations, how to bridge differences.
For FRIENDSHIP: What drew them together, what keeps it strong, what could cause drift, how to maintain it.
For WORK: Professional communication styles, collaboration strengths, potential friction, how to get the best from each other.

Be specific to THEIR combination. Use "${name1}" and "${name2}" by name. Keep it 4-6 sentences. End with one surprising insight they probably have not considered. Be warm and real, not clinical.`
        );
        setAiInsight(response ?? '');
      } catch (e) {
        setAiInsight('');
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  function handleAddToCircle() {
    if (!result || !theirName.trim()) return;
    useCircleStore.getState().addMember({
      name: theirName.trim(),
      relationship: 'friend',
      contactMethod: '',
      sharingLevel: 'full',
      birthday: result.theirIso,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleTryAnother() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowResults(false);
    setPerson1Name('');
    setPerson1Birthday('');
    setPerson2Name('');
    setPerson2Birthday('');
    setRelType(null);
    setResult(null);
    setAiInsight('');
    setExpandedLearn(null);
  }

  const canCheck = person1Birthday.length === 10 && person2Birthday.length === 10 && relType !== null;

  const relTypes: { type: RelType; icon: string; label: string; color: string }[] = [
    { type: 'romantic', icon: '💕', label: 'Romantic', color: '#EC4899' },
    { type: 'family', icon: '👨‍👩‍👧', label: 'Family', color: '#14B8A6' },
    { type: 'friendship', icon: '🤝', label: 'Friendship', color: '#F59E0B' },
    { type: 'work', icon: '💼', label: 'Work', color: '#3B82F6' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header with gradient accent line */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Relate</Text>
        <View style={styles.headerRight} />
      </View>
      <LinearGradient
        colors={RELATE_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerAccent}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!showResults ? (
          <>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('solo'); }}
                style={[styles.modeBtn, mode === 'solo' && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === 'solo' && styles.modeBtnTextActive]}>
                  👤 My Profile
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('compare'); }}
                style={[styles.modeBtn, mode === 'compare' && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, mode === 'compare' && styles.modeBtnTextActive]}>
                  👥 Compare
                </Text>
              </Pressable>
            </View>

            {mode === 'solo' && soloResult ? (
              <>
                {/* Premium Profile Header - Fortune 500 style */}
                <AnimatedCard delay={0}>
                  <View style={styles.profileHeroCard}>
                    <LinearGradient
                      colors={['rgba(124,77,255,0.15)', 'transparent']}
                      style={styles.profileHeroGlow}
                    />
                    <View style={styles.profileHeroAvatar}>
                      <Text style={styles.profileHeroInitial}>
                        {(userName || 'Y').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.profileHeroName}>{userName || 'You'}</Text>
                    <Text style={styles.profileHeroType}>{soloResult.name}</Text>
                    <Text style={styles.profileHeroDate}>{soloResult.dateRange}</Text>
                  </View>
                </AnimatedCard>

                {/* Quick Stats Row */}
                <AnimatedCard delay={50}>
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statEmoji}>🎯</Text>
                      <Text style={styles.statLabel}>Style</Text>
                      <Text style={styles.statValue} numberOfLines={2}>{soloResult.communicationStyle?.split('.')[0]}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statEmoji}>💪</Text>
                      <Text style={styles.statLabel}>Top Strength</Text>
                      <Text style={styles.statValue} numberOfLines={2}>{soloResult.strengths?.[0]}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statEmoji}>💙</Text>
                      <Text style={styles.statLabel}>Core Need</Text>
                      <Text style={styles.statValue} numberOfLines={2}>{soloResult.needs?.[0]}</Text>
                    </View>
                  </View>
                </AnimatedCard>

                {/* Full Bio Section */}
                <AnimatedCard delay={100}>
                  {!fullBio && !bioLoading ? (
                    <Pressable onPress={generateFullBio} style={styles.generateBioBtn}>
                      <LinearGradient
                        colors={['rgba(124,77,255,0.15)', 'rgba(124,77,255,0.05)']}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.generateBioBtnContent}>
                        <View style={styles.generateBioIcon}>
                          <Ionicons name="sparkles" size={24} color={RELATE_ACCENT} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.generateBioTitle}>Generate Full Bio</Text>
                          <Text style={styles.generateBioSub}>Get an AI-written personality profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={RELATE_ACCENT} />
                      </View>
                    </Pressable>
                  ) : bioLoading ? (
                    <View style={styles.bioLoadingCard}>
                      <ActivityIndicator color={RELATE_ACCENT} size="small" />
                      <Text style={styles.bioLoadingText}>Writing your personality bio...</Text>
                    </View>
                  ) : fullBio ? (
                    <View style={styles.fullBioCard}>
                      <View style={styles.fullBioHeader}>
                        <Ionicons name="document-text" size={20} color={RELATE_ACCENT} />
                        <Text style={styles.fullBioTitle}>Your Full Profile</Text>
                      </View>
                      <Text style={styles.fullBioText}>{fullBio}</Text>
                      <Pressable 
                        onPress={generateFullBio} 
                        style={styles.regenerateBtn}
                      >
                        <Ionicons name="refresh" size={16} color={COLORS.textMuted} />
                        <Text style={styles.regenerateBtnText}>Regenerate</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </AnimatedCard>

                {/* See Dynamic CTA - Pre-fills your info */}
                <AnimatedCard delay={150}>
                  <Pressable onPress={startCompareWithMe} style={styles.seeDynamicBtn}>
                    <LinearGradient
                      colors={RELATE_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.seeDynamicBtnInner}
                    >
                      <Ionicons name="git-compare-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
                      <View>
                        <Text style={styles.seeDynamicBtnText}>See Dynamic</Text>
                        <Text style={styles.seeDynamicBtnSub}>Compare yourself with someone</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                </AnimatedCard>

                {/* Detailed Sections */}
                <AnimatedCard delay={200}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>🎯 Communication Style</Text>
                    <Text style={styles.detailCardText}>{soloResult.communicationStyle}</Text>
                    <LearnMore id="communicationStyle" expanded={expandedLearn === 'communicationStyle'} onToggle={() => toggleLearn('communicationStyle')} />
                  </View>
                </AnimatedCard>

                <AnimatedCard delay={250}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>💪 Your Strengths</Text>
                    {soloResult.strengths?.map((s: string, i: number) => (
                      <Text key={i} style={styles.detailBullet}>• {s}</Text>
                    ))}
                    <LearnMore id="strengths" expanded={expandedLearn === 'strengths'} onToggle={() => toggleLearn('strengths')} />
                  </View>
                </AnimatedCard>

                <AnimatedCard delay={300}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>⚡ Growth Areas</Text>
                    {soloResult.challenges?.map((c: string, i: number) => (
                      <Text key={i} style={styles.detailBullet}>• {c}</Text>
                    ))}
                    <LearnMore id="challenges" expanded={expandedLearn === 'challenges'} onToggle={() => toggleLearn('challenges')} />
                  </View>
                </AnimatedCard>

                <AnimatedCard delay={350}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>😰 Under Stress</Text>
                    <Text style={styles.detailCardText}>{soloResult.stressResponse}</Text>
                    <LearnMore id="stressResponse" expanded={expandedLearn === 'stressResponse'} onToggle={() => toggleLearn('stressResponse')} />
                  </View>
                </AnimatedCard>

                <AnimatedCard delay={400}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>💙 What You Need in Relationships</Text>
                    <Text style={styles.detailCardText}>{soloResult.needsInRelationships}</Text>
                    <LearnMore id="needs" expanded={expandedLearn === 'needs'} onToggle={() => toggleLearn('needs')} />
                  </View>
                </AnimatedCard>
              </>
            ) : mode === 'solo' && !soloResult ? (
              <>
                {/* No birthday - prompt to enter */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroEmoji}>🔮</Text>
                  <Text style={styles.heroTitle}>Discover Yourself</Text>
                  <Text style={styles.heroSub}>Enter your birthday to see your personality profile</Text>
                </View>

                <Text style={styles.label}>Your name</Text>
                <TextInput
                  style={styles.input}
                  placeholder={userName || "Your name"}
                  placeholderTextColor={COLORS.textMuted}
                  value={myName}
                  onChangeText={setMyName}
                />

                <Text style={styles.label}>Your birthday</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  value={myBirthday}
                  onChangeText={(t) => formatBirthday(t, setMyBirthday)}
                  keyboardType="number-pad"
                  maxLength={10}
                />

                <Pressable
                  onPress={() => {
                    const isoDate = parseBirthday(myBirthday);
                    if (isoDate) {
                      const personality = getPersonality(isoDate);
                      if (personality) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setSoloResult(personality);
                      }
                    }
                  }}
                  disabled={myBirthday.length !== 10}
                  style={[styles.primaryBtnWrap, myBirthday.length !== 10 && styles.primaryBtnDisabled]}
                >
                  <LinearGradient
                    colors={myBirthday.length === 10 ? RELATE_GRADIENT : ['#3A3A4A', '#3A3A4A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>See My Profile</Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                {/* Compare Mode - Two people side by side */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroEmoji}>💫</Text>
                  <Text style={styles.heroTitle}>Understand Anyone</Text>
                  <Text style={styles.heroSub}>Compare two personalities to discover the dynamic</Text>
                </View>

                {/* Person 1 */}
                <View style={styles.personSection}>
                  <Text style={styles.personLabel}>👤 Person 1</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name (optional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={person1Name}
                    onChangeText={setPerson1Name}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Birthday (MM/DD/YYYY)"
                    placeholderTextColor={COLORS.textMuted}
                    value={person1Birthday}
                    onChangeText={(t) => formatBirthday(t, setPerson1Birthday)}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                {/* Person 2 */}
                <View style={styles.personSection}>
                  <Text style={styles.personLabel}>👤 Person 2</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name (optional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={person2Name}
                    onChangeText={setPerson2Name}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Birthday (MM/DD/YYYY)"
                    placeholderTextColor={COLORS.textMuted}
                    value={person2Birthday}
                    onChangeText={(t) => formatBirthday(t, setPerson2Birthday)}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </>
            )}

            <Text style={styles.label}>What's the relationship?</Text>
            <View style={styles.relTypeRow}>
              {relTypes.map((r) => (
                <Pressable
                  key={r.type}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRelType(r.type); }}
                  style={[
                    styles.relTypeBtn,
                    relType === r.type && styles.relTypeBtnActive,
                    relType === r.type && { borderColor: r.color + '60' },
                  ]}
                >
                  <Text style={[
                    styles.relTypeText,
                    relType === r.type && { color: r.color },
                  ]}>
                    {r.icon} {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Gradient CTA button */}
            <Pressable
              onPress={handleCheck}
              disabled={!canCheck}
              style={[styles.primaryBtnWrap, !canCheck && styles.primaryBtnDisabled]}
            >
              <LinearGradient
                colors={canCheck ? RELATE_GRADIENT : ['#3A3A4A', '#3A3A4A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>See the Dynamic</Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.disclaimer}>
              Based on Goldschneider's personality research. Increases self-awareness — not deterministic.
            </Text>
          </>
        ) : result && (
          <>
            {/* Results Header */}
            <AnimatedCard delay={0}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultEmoji}>✨</Text>
                <Text style={styles.resultHeaderTitle}>{person1Name.trim() || 'Person 1'} & {person2Name.trim() || 'Person 2'}</Text>
                <View style={styles.resultBadgeRow}>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{result.me.name}</Text>
                  </View>
                  <Text style={styles.resultPlus}>+</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>{result.them.name}</Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>

            {/* PERSON 1 PROFILE */}
            <AnimatedCard delay={100}>
              <View style={[styles.profileCard, { borderColor: 'rgba(124,77,255,0.2)' }]}>
                <LinearGradient
                  colors={['rgba(124,77,255,0.1)', 'transparent']}
                  style={styles.cardGlow}
                />
                <View style={styles.profileHeaderRow}>
                  <View style={styles.profileEmojiWrap}>
                    <Text style={styles.profileEmoji}>🪞</Text>
                  </View>
                  <View>
                    <Text style={styles.profileName}>{person1Name.trim() || 'Person 1'}</Text>
                    <Text style={styles.profileType}>{result.me.name}</Text>
                  </View>
                </View>
                
                <Text style={styles.sectionLabel}>Communication Style</Text>
                <Text style={styles.sectionText}>{result.me.communicationStyle}</Text>
                <LearnMore id="communicationStyle" expanded={expandedLearn === 'me-comm'} onToggle={() => toggleLearn('me-comm')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Strengths</Text>
                <Text style={styles.sectionText}>{result.me.strengths.join(', ')}</Text>
                <LearnMore id="strengths" expanded={expandedLearn === 'me-str'} onToggle={() => toggleLearn('me-str')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Challenges</Text>
                <Text style={styles.sectionText}>{result.me.challenges.join(', ')}</Text>
                <LearnMore id="challenges" expanded={expandedLearn === 'me-chal'} onToggle={() => toggleLearn('me-chal')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Under Stress</Text>
                <Text style={styles.sectionText}>{result.me.stressResponse}</Text>
                <LearnMore id="stressResponse" expanded={expandedLearn === 'me-stress'} onToggle={() => toggleLearn('me-stress')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Needs</Text>
                <Text style={styles.sectionText}>{result.me.needsInRelationships}</Text>
                <LearnMore id="needs" expanded={expandedLearn === 'me-needs'} onToggle={() => toggleLearn('me-needs')} onLesson={goToLesson} />
              </View>
            </AnimatedCard>

            {/* PERSON 2 PROFILE */}
            <AnimatedCard delay={200}>
              <View style={[styles.profileCard, { borderColor: 'rgba(20,184,166,0.2)' }]}>
                <LinearGradient
                  colors={['rgba(20,184,166,0.1)', 'transparent']}
                  style={styles.cardGlow}
                />
                <View style={styles.profileHeaderRow}>
                  <View style={[styles.profileEmojiWrap, { backgroundColor: 'rgba(20,184,166,0.1)' }]}>
                    <Text style={styles.profileEmoji}>✨</Text>
                  </View>
                  <View>
                    <Text style={styles.profileName}>{person2Name.trim() || 'Person 2'}</Text>
                    <Text style={[styles.profileType, { color: '#14B8A6' }]}>{result.them.name}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Communication Style</Text>
                <Text style={styles.sectionText}>{result.them.communicationStyle}</Text>
                <LearnMore id="communicationStyle" expanded={expandedLearn === 'them-comm'} onToggle={() => toggleLearn('them-comm')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Strengths</Text>
                <Text style={styles.sectionText}>{result.them.strengths.join(', ')}</Text>
                <LearnMore id="strengths" expanded={expandedLearn === 'them-str'} onToggle={() => toggleLearn('them-str')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Challenges</Text>
                <Text style={styles.sectionText}>{result.them.challenges.join(', ')}</Text>
                <LearnMore id="challenges" expanded={expandedLearn === 'them-chal'} onToggle={() => toggleLearn('them-chal')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Under Stress</Text>
                <Text style={styles.sectionText}>{result.them.stressResponse}</Text>
                <LearnMore id="stressResponse" expanded={expandedLearn === 'them-stress'} onToggle={() => toggleLearn('them-stress')} onLesson={goToLesson} />

                <Text style={styles.sectionLabel}>Needs</Text>
                <Text style={styles.sectionText}>{result.them.needsInRelationships}</Text>
                <LearnMore id="needs" expanded={expandedLearn === 'them-needs'} onToggle={() => toggleLearn('them-needs')} onLesson={goToLesson} />
              </View>
            </AnimatedCard>

            {/* DYNAMIC */}
            {result.dynamic && (
              <AnimatedCard delay={300}>
                <View style={styles.dynamicCard}>
                  <LinearGradient
                    colors={['rgba(124,77,255,0.08)', 'transparent']}
                    style={styles.cardGlow}
                  />
                  <View style={styles.dynamicTitleRow}>
                    <Ionicons name="git-compare-outline" size={22} color={RELATE_ACCENT} />
                    <Text style={styles.dynamicTitle}>Your Dynamic</Text>
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#10B981' }]}>Strengths</Text>
                    </View>
                    {result.dynamic.strengths.map((s: string, i: number) => (
                      <Text key={i} style={styles.dynamicItem}>• {s}</Text>
                    ))}
                    <LearnMore id="dynamicStrengths" expanded={expandedLearn === 'dyn-str'} onToggle={() => toggleLearn('dyn-str')} onLesson={goToLesson} />
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>Watch For</Text>
                    </View>
                    {result.dynamic.frictionPoints.map((f: string, i: number) => (
                      <Text key={i} style={styles.dynamicItem}>• {f}</Text>
                    ))}
                    <LearnMore id="frictionPoints" expanded={expandedLearn === 'dyn-fric'} onToggle={() => toggleLearn('dyn-fric')} onLesson={goToLesson} />
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#3B82F6' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#3B82F6' }]}>Communication Tip</Text>
                    </View>
                    <Text style={styles.dynamicText}>{result.dynamic.communicationTip}</Text>
                    <LearnMore id="communicationTip" expanded={expandedLearn === 'dyn-comm'} onToggle={() => toggleLearn('dyn-comm')} onLesson={goToLesson} />
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#EC4899' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#EC4899' }]}>Conflict Pattern</Text>
                    </View>
                    <Text style={styles.dynamicText}>{result.dynamic.conflictPattern}</Text>
                    <LearnMore id="conflictPattern" expanded={expandedLearn === 'dyn-conf'} onToggle={() => toggleLearn('dyn-conf')} onLesson={goToLesson} />
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#14B8A6' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#14B8A6' }]}>What {person2Name.trim() || 'Person 2'} Needs</Text>
                    </View>
                    <Text style={styles.dynamicText}>{result.dynamic.whatTheyNeed}</Text>
                    <LearnMore id="whatTheyNeed" expanded={expandedLearn === 'dyn-theyneed'} onToggle={() => toggleLearn('dyn-theyneed')} onLesson={goToLesson} />
                  </View>

                  <View style={styles.dynamicSection}>
                    <View style={styles.dynamicLabelRow}>
                      <View style={[styles.dynamicDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>What {person1Name.trim() || 'Person 1'} Needs</Text>
                    </View>
                    <Text style={styles.dynamicText}>{result.dynamic.whatYouNeed}</Text>
                    <LearnMore id="whatYouNeed" expanded={expandedLearn === 'dyn-youneed'} onToggle={() => toggleLearn('dyn-youneed')} onLesson={goToLesson} />
                  </View>
                </View>
              </AnimatedCard>
            )}

            {/* AI INSIGHT */}
            {loading && (
              <AnimatedCard delay={400}>
                <View style={styles.loadingCard}>
                  <ActivityIndicator color={RELATE_ACCENT} size="small" />
                  <Text style={styles.loadingText}>Gauge is analyzing your dynamic...</Text>
                </View>
              </AnimatedCard>
            )}

            {aiInsight ? (
              <AnimatedCard delay={450}>
                <View style={styles.insightCard}>
                  <LinearGradient
                    colors={['rgba(124,77,255,0.15)', 'rgba(124,77,255,0.05)']}
                    style={styles.cardGlow}
                  />
                  <View style={styles.insightHeader}>
                    <View style={styles.insightIconWrap}>
                      <Ionicons name="sparkles" size={18} color="#fff" />
                    </View>
                    <Text style={styles.insightTitle}>Gauge says</Text>
                  </View>
                  <Text style={styles.insightText}>{aiInsight}</Text>
                </View>
              </AnimatedCard>
            ) : null}

            {/* ACTIONS */}
            <AnimatedCard delay={500}>
              <View style={styles.actions}>
                {person2Name.trim().length > 0 && (
                  <Pressable onPress={handleAddToCircle} style={styles.addCircleBtn}>
                    <LinearGradient
                      colors={['#14B8A6', '#0D9488']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addCircleBtnInner}
                    >
                      <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.addCircleBtnText}>Add {person2Name.trim()} to Circle</Text>
                    </LinearGradient>
                  </Pressable>
                )}
                <Pressable onPress={handleTryAnother} style={styles.secondaryBtn}>
                  <Ionicons name="refresh" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryBtnText}>Try Another</Text>
                </Pressable>
                <Pressable onPress={() => router.back()} style={styles.ghostBtn}>
                  <Text style={styles.ghostBtnText}>Done</Text>
                </Pressable>
              </View>
            </AnimatedCard>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CARD_BORDER = 'rgba(255,255,255,0.06)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerAccent: {
    height: 2,
    width: '100%',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: RELATE_ACCENT + '20',
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modeBtnTextActive: {
    color: RELATE_ACCENT,
  },

  // Secondary button
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RELATE_ACCENT + '40',
    marginTop: 16,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: RELATE_ACCENT,
  },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },

  // Input form
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, fontWeight: '500' },
  optional: { color: COLORS.textMuted, fontWeight: '400' },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  // Relationship type buttons
  relTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  relTypeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
  },
  relTypeBtnActive: {
    backgroundColor: 'rgba(124,77,255,0.1)',
    borderColor: RELATE_ACCENT,
  },
  relTypeText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '500' },

  // Primary button with gradient
  primaryBtnWrap: { borderRadius: 14, overflow: 'hidden' },
  primaryBtn: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  disclaimer: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 18 },

  // Results header
  resultHeader: { alignItems: 'center', marginBottom: 24, paddingVertical: 8 },
  resultEmoji: { fontSize: 40, marginBottom: 8 },
  resultHeaderTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  resultBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultBadge: {
    backgroundColor: 'rgba(124,77,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.3)',
  },
  resultBadgeText: { color: RELATE_ACCENT, fontSize: 13, fontWeight: '600' },
  resultPlus: { color: COLORS.textMuted, fontSize: 18, fontWeight: '300' },

  // Profile cards
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18, zIndex: 1 },
  profileEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124,77,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: { fontSize: 26 },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  profileType: { fontSize: 14, color: RELATE_ACCENT, fontWeight: '600', marginTop: 2 },
  sectionLabel: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginTop: 14, 
    marginBottom: 6,
    fontWeight: '600',
  },
  sectionText: { fontSize: 14, color: COLORS.text, lineHeight: 21 },

  // Dynamic card
  dynamicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(124,77,255,0.15)',
    overflow: 'hidden',
  },
  dynamicTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  dynamicTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  dynamicSection: { marginBottom: 18 },
  dynamicLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dynamicDot: { width: 8, height: 8, borderRadius: 4 },
  dynamicLabel: { fontSize: 14, fontWeight: '700' },
  dynamicItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginLeft: 16, marginBottom: 3 },
  dynamicText: { fontSize: 14, color: COLORS.text, lineHeight: 21, marginLeft: 16 },

  // Learn more expandable
  learnContainer: { marginTop: 10, marginBottom: 4 },
  learnQuickRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: LEARN_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LEARN_BORDER,
  },
  learnQuick: {
    flex: 1,
    fontSize: 12,
    color: RELATE_ACCENT,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  learnExpanded: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(124,77,255,0.04)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: LEARN_BORDER,
  },
  learnDeep: { fontSize: 13, color: COLORS.text, lineHeight: 21, marginBottom: 10 },
  learnSource: { fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic' },
  lessonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(124,77,255,0.12)',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  lessonLinkText: { fontSize: 13, color: RELATE_ACCENT, fontWeight: '600' },

  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  // AI insight
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(124,77,255,0.25)',
    overflow: 'hidden',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, zIndex: 1 },
  insightIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RELATE_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { fontSize: 15, fontWeight: '700', color: RELATE_ACCENT },
  insightText: { fontSize: 15, color: COLORS.text, lineHeight: 24, zIndex: 1 },

  // Actions
  actions: { marginTop: 8 },
  addCircleBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  addCircleBtnInner: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircleBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 8,
  },
  secondaryBtnText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '500' },
  ghostBtn: { padding: 14, alignItems: 'center' },
  ghostBtnText: { fontSize: 15, color: COLORS.textMuted },

  // Person Section (Compare mode)
  personSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  personLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },

  // Premium Profile Hero (My Profile tab)
  profileHeroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
  },
  profileHeroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  profileHeroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RELATE_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  profileHeroInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  profileHeroName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    zIndex: 1,
  },
  profileHeroType: {
    fontSize: 16,
    fontWeight: '600',
    color: RELATE_ACCENT,
    marginBottom: 4,
    zIndex: 1,
  },
  profileHeroDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    zIndex: 1,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },

  // See Dynamic CTA
  seeDynamicBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  seeDynamicBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  seeDynamicBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  seeDynamicBtnSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Detail Cards
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  detailCardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  detailBullet: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 2,
  },

  // Full Bio Section
  generateBioBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(124,77,255,0.2)',
    overflow: 'hidden',
  },
  generateBioBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  generateBioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(124,77,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  generateBioSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bioLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  bioLoadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  fullBioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(124,77,255,0.2)',
  },
  fullBioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  fullBioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: RELATE_ACCENT,
  },
  fullBioText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
  },
  regenerateBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
