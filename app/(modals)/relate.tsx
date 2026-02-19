/**
 * Relate — Understand anyone through personality dynamics.
 * Info-dense with expandable learning. All the knowledge, 24/7/365.
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

type RelType = 'romantic' | 'family' | 'friendship' | 'work';

const RELATE_ACCENT = '#7C4DFF';
const LEARN_BG = 'rgba(124,77,255,0.06)';
const LEARN_BORDER = 'rgba(124,77,255,0.15)';

// Educational content for each concept
const LEARN_CONTENT = {
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
  id: keyof typeof LEARN_CONTENT;
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
              onPress={() => onLesson(content.lessonId!)}
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

  const [myBirthday, setMyBirthday] = useState('');
  const [theirBirthday, setTheirBirthday] = useState('');
  const [theirName, setTheirName] = useState('');
  const [relType, setRelType] = useState<RelType | null>(null);
  const [result, setResult] = useState<{ me: any; them: any; dynamic: any; myIso: string; theirIso: string } | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedLearn, setExpandedLearn] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const toggleLearn = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLearn(expandedLearn === id ? null : id);
  };

  const goToLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lessonId}`);
  };

  useEffect(() => {
    if (userBirthday && !myBirthday) {
      const d = new Date(userBirthday);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        setMyBirthday(`${mm}/${dd}/${yyyy}`);
      }
    }
  }, [userBirthday, myBirthday]);

  useEffect(() => {
    if (params.name && params.name !== theirName) setTheirName(params.name);
    if (params.birthday) {
      const display = isoToMMDDYYYY(params.birthday);
      if (display && display !== theirBirthday) setTheirBirthday(display);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const myIso = parseBirthday(myBirthday);
      const theirIso = parseBirthday(theirBirthday);
      if (!myIso || !theirIso) return;

      const me = getPersonality(myIso);
      const them = getPersonality(theirIso);
      const dynamic = getRelationshipDynamic(myIso, theirIso);
      if (!me || !them) return;

      setResult({ me, them, dynamic, myIso, theirIso });
      setExpandedLearn(null);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);

      setLoading(true);
      try {
        const name = theirName.trim() || 'them';
        const response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `My personality: ${me.name} (${me.communicationStyle}). Their personality: ${them.name} (${them.communicationStyle}). Relationship: ${relType}. Their name: ${name}. Give me a relationship insight.` }],
          `You are Psych, a relationship intelligence companion. Based on two personality profiles and their relationship type, give a warm, specific, insightful reading.

For ROMANTIC: Chemistry, communication differences, what makes them click, what could pull them apart, one tip for long-term success.
For FAMILY: Generational dynamics, communication gaps, unspoken expectations, how to bridge differences.
For FRIENDSHIP: What drew them together, what keeps it strong, what could cause drift, how to maintain it.
For WORK: Professional communication styles, collaboration strengths, potential friction, how to get the best from each other.

Be specific to THEIR combination. Use "you" and "${name}". Keep it 4-6 sentences. End with one surprising insight they probably have not considered. Be warm and real, not clinical.`
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
    setMyBirthday(userBirthday ? (() => { const d = new Date(userBirthday); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`; })() : '');
    setTheirBirthday('');
    setTheirName('');
    setRelType(null);
    setResult(null);
    setAiInsight('');
    setExpandedLearn(null);
  }

  const canCheck = myBirthday.length === 10 && theirBirthday.length === 10 && relType !== null;

  const relTypes: { type: RelType; icon: string; label: string }[] = [
    { type: 'romantic', icon: '💕', label: 'Romantic' },
    { type: 'family', icon: '👨‍👩‍👧', label: 'Family' },
    { type: 'friendship', icon: '🤝', label: 'Friendship' },
    { type: 'work', icon: '💼', label: 'Work' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Relate</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <>
            <Text style={styles.prompt}>Understand anyone. Just enter two birthdays.</Text>

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

            <Text style={styles.label}>Their name <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex, Mom, my boss"
              placeholderTextColor={COLORS.textMuted}
              value={theirName}
              onChangeText={setTheirName}
            />

            <Text style={styles.label}>Their birthday</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.textMuted}
              value={theirBirthday}
              onChangeText={(t) => formatBirthday(t, setTheirBirthday)}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>What's the relationship?</Text>
            <View style={styles.relTypeRow}>
              {relTypes.map((r) => (
                <Pressable
                  key={r.type}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRelType(r.type); }}
                  style={[styles.relTypeBtn, relType === r.type && styles.relTypeBtnActive]}
                >
                  <Text style={[styles.relTypeText, relType === r.type && styles.relTypeTextActive]}>
                    {r.icon} {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleCheck}
              disabled={!canCheck}
              style={[styles.primaryBtn, !canCheck && styles.primaryBtnDisabled]}
            >
              <Text style={styles.primaryBtnText}>See the Dynamic</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Based on Goldschneider's personality research. Increases self-awareness — not deterministic.
            </Text>
          </>
        ) : (
          <>
            {/* Header */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderTitle}>You & {theirName.trim() || 'Them'}</Text>
              <Text style={styles.resultHeaderSub}>{result.me.name} + {result.them.name}</Text>
            </View>

            {/* YOUR PROFILE */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Text style={styles.profileEmoji}>🪞</Text>
                <View>
                  <Text style={styles.profileName}>You</Text>
                  <Text style={styles.profileType}>{result.me.name}</Text>
                </View>
              </View>
              
              <Text style={styles.sectionLabel}>Communication Style</Text>
              <Text style={styles.sectionText}>{result.me.communicationStyle}</Text>
              <LearnMore 
                id="communicationStyle" 
                expanded={expandedLearn === 'me-comm'} 
                onToggle={() => toggleLearn('me-comm')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Strengths</Text>
              <Text style={styles.sectionText}>{result.me.strengths.join(', ')}</Text>
              <LearnMore 
                id="strengths" 
                expanded={expandedLearn === 'me-str'} 
                onToggle={() => toggleLearn('me-str')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Challenges</Text>
              <Text style={styles.sectionText}>{result.me.challenges.join(', ')}</Text>
              <LearnMore 
                id="challenges" 
                expanded={expandedLearn === 'me-chal'} 
                onToggle={() => toggleLearn('me-chal')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Under Stress</Text>
              <Text style={styles.sectionText}>{result.me.stressResponse}</Text>
              <LearnMore 
                id="stressResponse" 
                expanded={expandedLearn === 'me-stress'} 
                onToggle={() => toggleLearn('me-stress')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Needs</Text>
              <Text style={styles.sectionText}>{result.me.needsInRelationships}</Text>
              <LearnMore 
                id="needs" 
                expanded={expandedLearn === 'me-needs'} 
                onToggle={() => toggleLearn('me-needs')}
                onLesson={goToLesson}
              />
            </View>

            {/* THEIR PROFILE */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Text style={styles.profileEmoji}>✨</Text>
                <View>
                  <Text style={styles.profileName}>{theirName.trim() || 'Them'}</Text>
                  <Text style={styles.profileType}>{result.them.name}</Text>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Communication Style</Text>
              <Text style={styles.sectionText}>{result.them.communicationStyle}</Text>
              <LearnMore 
                id="communicationStyle" 
                expanded={expandedLearn === 'them-comm'} 
                onToggle={() => toggleLearn('them-comm')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Strengths</Text>
              <Text style={styles.sectionText}>{result.them.strengths.join(', ')}</Text>
              <LearnMore 
                id="strengths" 
                expanded={expandedLearn === 'them-str'} 
                onToggle={() => toggleLearn('them-str')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Challenges</Text>
              <Text style={styles.sectionText}>{result.them.challenges.join(', ')}</Text>
              <LearnMore 
                id="challenges" 
                expanded={expandedLearn === 'them-chal'} 
                onToggle={() => toggleLearn('them-chal')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Under Stress</Text>
              <Text style={styles.sectionText}>{result.them.stressResponse}</Text>
              <LearnMore 
                id="stressResponse" 
                expanded={expandedLearn === 'them-stress'} 
                onToggle={() => toggleLearn('them-stress')}
                onLesson={goToLesson}
              />

              <Text style={styles.sectionLabel}>Needs</Text>
              <Text style={styles.sectionText}>{result.them.needsInRelationships}</Text>
              <LearnMore 
                id="needs" 
                expanded={expandedLearn === 'them-needs'} 
                onToggle={() => toggleLearn('them-needs')}
                onLesson={goToLesson}
              />
            </View>

            {/* DYNAMIC */}
            {result.dynamic && (
              <View style={styles.dynamicCard}>
                <Text style={styles.dynamicTitle}>Your Dynamic</Text>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={[styles.dynamicLabel, { color: '#10B981' }]}>Strengths</Text>
                  </View>
                  {result.dynamic.strengths.map((s: string, i: number) => (
                    <Text key={i} style={styles.dynamicItem}>• {s}</Text>
                  ))}
                  <LearnMore 
                    id="dynamicStrengths" 
                    expanded={expandedLearn === 'dyn-str'} 
                    onToggle={() => toggleLearn('dyn-str')}
                    onLesson={goToLesson}
                  />
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                    <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>Watch For</Text>
                  </View>
                  {result.dynamic.frictionPoints.map((f: string, i: number) => (
                    <Text key={i} style={styles.dynamicItem}>• {f}</Text>
                  ))}
                  <LearnMore 
                    id="frictionPoints" 
                    expanded={expandedLearn === 'dyn-fric'} 
                    onToggle={() => toggleLearn('dyn-fric')}
                    onLesson={goToLesson}
                  />
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="chatbubble" size={16} color="#3B82F6" />
                    <Text style={[styles.dynamicLabel, { color: '#3B82F6' }]}>Communication Tip</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.communicationTip}</Text>
                  <LearnMore 
                    id="communicationTip" 
                    expanded={expandedLearn === 'dyn-comm'} 
                    onToggle={() => toggleLearn('dyn-comm')}
                    onLesson={goToLesson}
                  />
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="flash" size={16} color="#EC4899" />
                    <Text style={[styles.dynamicLabel, { color: '#EC4899' }]}>Conflict Pattern</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.conflictPattern}</Text>
                  <LearnMore 
                    id="conflictPattern" 
                    expanded={expandedLearn === 'dyn-conf'} 
                    onToggle={() => toggleLearn('dyn-conf')}
                    onLesson={goToLesson}
                  />
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="heart" size={16} color="#14B8A6" />
                    <Text style={[styles.dynamicLabel, { color: '#14B8A6' }]}>What {theirName.trim() || 'They'} Need{theirName.trim() ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.whatTheyNeed}</Text>
                  <LearnMore 
                    id="whatTheyNeed" 
                    expanded={expandedLearn === 'dyn-theyneed'} 
                    onToggle={() => toggleLearn('dyn-theyneed')}
                    onLesson={goToLesson}
                  />
                </View>

                <View style={styles.dynamicSection}>
                  <View style={styles.dynamicLabelRow}>
                    <Ionicons name="heart-outline" size={16} color="#F59E0B" />
                    <Text style={[styles.dynamicLabel, { color: '#F59E0B' }]}>What You Need</Text>
                  </View>
                  <Text style={styles.dynamicText}>{result.dynamic.whatYouNeed}</Text>
                  <LearnMore 
                    id="whatYouNeed" 
                    expanded={expandedLearn === 'dyn-youneed'} 
                    onToggle={() => toggleLearn('dyn-youneed')}
                    onLesson={goToLesson}
                  />
                </View>
              </View>
            )}

            {/* AI INSIGHT */}
            {loading && (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={RELATE_ACCENT} />
                <Text style={styles.loadingText}>Psych is thinking...</Text>
              </View>
            )}

            {aiInsight ? (
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="sparkles" size={18} color={RELATE_ACCENT} />
                  <Text style={styles.insightTitle}>Psych says</Text>
                </View>
                <Text style={styles.insightText}>{aiInsight}</Text>
              </View>
            ) : null}

            {/* ACTIONS */}
            <View style={styles.actions}>
              {theirName.trim().length > 0 && (
                <Pressable onPress={handleAddToCircle} style={styles.primaryBtn}>
                  <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Add {theirName.trim()} to Circle</Text>
                </Pressable>
              )}
              <Pressable onPress={handleTryAnother} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Try Another</Text>
              </Pressable>
              <Pressable onPress={() => router.back()} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Done</Text>
              </Pressable>
            </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  backBtn: { padding: 8 },
  headerTitle: { ...TYPOGRAPHY.cardTitle, color: COLORS.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Input form
  prompt: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  optional: { color: COLORS.textMuted },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 16,
    padding: 14,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  // Relationship type buttons
  relTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  relTypeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  relTypeBtnActive: {
    backgroundColor: 'rgba(124,77,255,0.15)',
    borderColor: RELATE_ACCENT,
  },
  relTypeText: { color: COLORS.textMuted, fontSize: 14 },
  relTypeTextActive: { color: RELATE_ACCENT },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: RELATE_ACCENT,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginTop: 10,
  },
  secondaryBtnText: { fontSize: 16, color: COLORS.textMuted },
  ghostBtn: { padding: 12, alignItems: 'center', marginTop: 4 },
  ghostBtnText: { fontSize: 14, color: COLORS.textMuted },

  disclaimer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 16 },

  // Results header
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultHeaderTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  resultHeaderSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  // Profile cards
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  profileEmoji: { fontSize: 32 },
  profileName: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  profileType: { fontSize: 14, color: RELATE_ACCENT, fontWeight: '500' },
  sectionLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  sectionText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },

  // Dynamic card
  dynamicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  dynamicTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  dynamicSection: { marginBottom: 16 },
  dynamicLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dynamicLabel: { fontSize: 13, fontWeight: '600' },
  dynamicItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginLeft: 22, marginBottom: 2 },
  dynamicText: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginLeft: 22 },

  // Learn more expandable
  learnContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  learnQuickRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: LEARN_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LEARN_BORDER,
  },
  learnQuick: {
    flex: 1,
    fontSize: 12,
    color: RELATE_ACCENT,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  learnExpanded: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: LEARN_BG,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: LEARN_BORDER,
  },
  learnDeep: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  learnSource: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  lessonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(124,77,255,0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lessonLinkText: {
    fontSize: 12,
    color: RELATE_ACCENT,
    fontWeight: '500',
  },

  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },

  // AI insight
  insightCard: {
    backgroundColor: 'rgba(124,77,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.2)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: RELATE_ACCENT },
  insightText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },

  // Actions
  actions: { marginTop: 8 },
});
