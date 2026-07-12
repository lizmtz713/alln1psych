/**
 * Activity modal — breathing, emotion wheel, body scan, thought challenger.
 * Route: /(modals)/activity?id=breathing|emotion-wheel|body-scan|thought-challenger
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { getActivityById } from '../../src/lib/activities';
import { EMOTION_WHEEL_PRIMARY } from '../../src/data/emotionWheel';
import { BODY_ZONES } from '../../src/data/bodyScan';
import { useJournalStore } from '../../src/stores/journalStore';
import { useGratitudeStore } from '../../src/stores/gratitudeStore';
import { useUserStore } from '../../src/stores/userStore';
import { sendMessageWithSystemPromptOnly } from '../../src/services/ai';
import { useCircleStore, TEMPERATURE_LABELS, type Temperature } from '../../src/stores/circleStore';
import { trackCheckIn } from '../../src/hooks/useWrappedTracking';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { useCreateCheckin } from '../../src/hooks/useCreateCheckin';
import { useAuth } from '../../src/providers/AuthProvider';

type BreathPhase = 'inhale' | 'hold' | 'exhale';
const BOX_BREATH = { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 };

const THOUGHT_CHALLENGER_SYSTEM = `You are a cognitive behavioral thought challenger inside InGauge. The user will share a negative or distressing thought. Your job:

1. First, identify the cognitive distortion (all-or-nothing, catastrophizing, mind reading, emotional reasoning, should statements, personalization, filtering, overgeneralization, jumping to conclusions, labeling). Name it in simple, non-clinical language.

2. Ask ONE examination question to help them see the thought differently.

3. After their response (or if they say "I'm not sure"), offer a specific reframed version of their original thought.

4. Suggest ONE small, concrete action they can take.

Be warm, not clinical. Don't lecture. Make it feel like a friend helping them think clearly.
Respond in JSON format only, no markdown:
{"step": 1 or 2 or 3 or 4, "distortion": "name (step 1 only)", "message": "your response", "reframe": "reframed thought (step 3 only)", "action": "suggested action (step 4 only)"}`;

async function fetchThoughtChallengerStep(
  messages: { role: string; content: string }[]
): Promise<{ step: number; distortion?: string; message: string; reframe?: string; action?: string }> {
  const msgList = messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  const text = await sendMessageWithSystemPromptOnly(msgList, THOUGHT_CHALLENGER_SYSTEM, 400);
  const cleaned = text.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
  const parsed = JSON.parse(cleaned) as { step: number; distortion?: string; message: string; reframe?: string; action?: string };
  return parsed;
}

/** Non-AI fallback so thought challenger still helps when API is unavailable (CBT-based). */
function thoughtChallengerFallback(
  step: number,
  thought: string,
  _messages: { role: string; content: string }[]
): { step: number; distortion?: string; message: string; reframe?: string; action?: string } {
  if (step <= 1) {
    return {
      step: 1,
      distortion: 'Possible unhelpful thinking pattern',
      message: "Thoughts aren't facts. One question that helps: 'What would I tell a friend who had this thought?' Or: 'What's the evidence for and against this thought?' Take a breath, then try answering one of those.",
    };
  }
  if (step === 2) {
    return { step: 2, message: "No pressure to get it 'right.' What came up when you considered the evidence or what you'd tell a friend?" };
  }
  if (step === 3) {
    return {
      step: 3,
      message: "Here's a gentler way to hold the same situation.",
      reframe: thought.replace(/^I (am|can't|will never|always)/i, 'Right now it feels like I $1').replace(/\b(never|always|everyone|no one)\b/gi, 'sometimes') || thought,
    };
  }
  return {
    step: 4,
    message: "One small step that often helps.",
    action: "Do one thing that grounds you (e.g. 4-7-8 breath, or text one person you trust), or write the reframed thought down.",
  };
}

// ----- Emotion Match scenarios (20 total, show 10 per session) -----
const EMOTION_MATCH_SCENARIOS: { situation: string; options: string[]; common: string }[] = [
  { situation: 'Your best friend cancels plans last minute — again.', options: ['Disappointed', 'Angry', 'Relieved', 'Hurt'], common: 'Disappointed' },
  { situation: 'You get unexpected praise from your boss in front of the team.', options: ['Proud', 'Embarrassed', 'Anxious', 'Happy'], common: 'Proud' },
  { situation: 'Someone cuts you off in traffic and honks.', options: ['Angry', 'Startled', 'Anxious', 'Indifferent'], common: 'Angry' },
  { situation: 'You see old photos of yourself from a happier time.', options: ['Nostalgic', 'Sad', 'Grateful', 'Hopeful'], common: 'Nostalgic' },
  { situation: 'A family member gives you unsolicited advice about your life.', options: ['Frustrated', 'Grateful', 'Defensive', 'Annoyed'], common: 'Annoyed' },
  { situation: 'You overhear someone talking about you.', options: ['Anxious', 'Angry', 'Curious', 'Hurt'], common: 'Anxious' },
  { situation: "Your partner says 'we need to talk.'", options: ['Anxious', 'Curious', 'Defensive', 'Calm'], common: 'Anxious' },
  { situation: "You accomplish something you've been working on for months.", options: ['Proud', 'Relieved', 'Excited', 'Emotional'], common: 'Proud' },
  { situation: 'A stranger is rude to you for no reason.', options: ['Confused', 'Angry', 'Hurt', 'Amused'], common: 'Confused' },
  { situation: "You wake up and realize it's a day with no obligations.", options: ['Relieved', 'Happy', 'Anxious', 'Bored'], common: 'Relieved' },
  { situation: "Someone you admire says they're proud of you.", options: ['Happy', 'Emotional', 'Uncomfortable', 'Motivated'], common: 'Happy' },
  { situation: 'You make a mistake at work that others notice.', options: ['Embarrassed', 'Anxious', 'Angry at yourself', 'Afraid'], common: 'Embarrassed' },
  { situation: 'Your child or younger sibling says they want to be like you.', options: ['Proud', 'Emotional', 'Pressured', 'Happy'], common: 'Emotional' },
  { situation: "You're alone on a Friday night while everyone else seems busy.", options: ['Lonely', 'Peaceful', 'Left out', 'Content'], common: 'Lonely' },
  { situation: 'Someone apologizes to you after a long time.', options: ['Relieved', 'Angry', 'Emotional', 'Indifferent'], common: 'Relieved' },
  { situation: 'You have to say no to something you actually want to do.', options: ['Frustrated', 'Proud', 'Guilty', 'Sad'], common: 'Guilty' },
  { situation: "You're asked to speak in front of a group.", options: ['Anxious', 'Excited', 'Terrified', 'Confident'], common: 'Anxious' },
  { situation: "Your phone dies and you can't contact anyone.", options: ['Anxious', 'Panicked', 'Relieved', 'Frustrated'], common: 'Anxious' },
  { situation: 'You find out a friend has been going through something hard alone.', options: ['Guilty', 'Sad', 'Worried', 'Helpless'], common: 'Sad' },
  { situation: 'Someone remembers a small detail about you that you mentioned once.', options: ['Touched', 'Surprised', 'Happy', 'Suspicious'], common: 'Touched' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const EMOTION_EMOJIS: Record<string, string> = {
  Disappointed: '😔', Angry: '😤', Relieved: '😌', Hurt: '💔', Proud: '😊', Embarrassed: '😳',
  Anxious: '😰', Happy: '😄', Startled: '😲', Indifferent: '😐', Nostalgic: '🥹', Sad: '😢',
  Grateful: '🙏', Hopeful: '🌟', Frustrated: '😣', Defensive: '🛡️', Annoyed: '😒',
  Curious: '🤔', Calm: '😌', Excited: '🤩', Emotional: '🥲', Confused: '😕', Amused: '😏',
  Bored: '😑', Uncomfortable: '😬', Motivated: '💪', 'Angry at yourself': '😞', Afraid: '😨',
  Pressured: '😓', Lonely: '😔', Peaceful: '☮️', 'Left out': '👤', Content: '😊', Guilty: '😣',
  Panicked: '😱', Terrified: '😨', Confident: '😎', Worried: '😟', Helpless: '🆘', Touched: '💜',
  Surprised: '😮', Suspicious: '🤨',
};

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const activity = id ? getActivityById(id) : null;
  const addJournalEntry = useJournalStore((s) => s.addEntry);

  // Breathing
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const { width } = useWindowDimensions();
  const circleSize = Math.min(width * 0.5, 200);

  // Emotion wheel: 'primary' | 'secondary' | 'detail'
  const [wheelLevel, setWheelLevel] = useState<'primary' | 'secondary' | 'detail'>('primary');
  const [selectedPrimary, setSelectedPrimary] = useState<typeof EMOTION_WHEEL_PRIMARY[0] | null>(null);
  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string | null>(null);

  // Body scan
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [cardZoneId, setCardZoneId] = useState<string | null>(null);

  // Thought challenger
  const [thought, setThought] = useState('');
  const [tcStep, setTcStep] = useState(0);
  const [tcMessages, setTcMessages] = useState<{ role: string; content: string }[]>([]);
  const [tcResponse, setTcResponse] = useState<{ step: number; distortion?: string; message: string; reframe?: string; action?: string } | null>(null);
  const [tcLoading, setTcLoading] = useState(false);
  const [originalThought, setOriginalThought] = useState('');
  const [tcReply, setTcReply] = useState('');

  // Emotion Match
  const [emSessionScenarios, setEmSessionScenarios] = useState<typeof EMOTION_MATCH_SCENARIOS>([]);
  const [emIndex, setEmIndex] = useState(0);
  const [emSelected, setEmSelected] = useState<string | null>(null);
  const [emShowFeedback, setEmShowFeedback] = useState(false);
  const [emCompleted, setEmCompleted] = useState(false);
  const emScaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  // Trigger Map
  const [tmStep, setTmStep] = useState(1);
  const [tmSituation, setTmSituation] = useState('');
  const [tmEmotions, setTmEmotions] = useState<string[]>([]);
  const [tmBodyZones, setTmBodyZones] = useState<string[]>([]);
  const [tmReaction, setTmReaction] = useState('');
  const [tmOtherReaction, setTmOtherReaction] = useState('');
  const [tmAiResult, setTmAiResult] = useState<{ validation: string; pattern: string; alternative: string; encouragement: string } | null>(null);
  const [tmLoading, setTmLoading] = useState(false);
  const addTriggerMap = useUserStore((s) => s.addTriggerMap);

  // Gratitude Jar
  const { entries: gratitudeEntries, addEntry: addGratitudeEntry, removeEntry: removeGratitudeEntry } = useGratitudeStore();
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [gratitudeWhy, setGratitudeWhy] = useState('');
  const [showGratitudeAdd, setShowGratitudeAdd] = useState(false);
  const [shakeEntry, setShakeEntry] = useState<typeof gratitudeEntries[0] | null>(null);
  const jarDotsAnim = useRef(new Animated.Value(0)).current;

  // Stress Thermometer
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [stressNote, setStressNote] = useState('');
  const [stressSubmitted, setStressSubmitted] = useState(false);
  const { user } = useAuth();
  const createCheckin = useCreateCheckin(user?.id);
  const addMoodCheckin = useCircleStore((s) => s.addMoodCheckin);
  const emergencyContacts = useUserStore((s) => s.emergencyContacts);

  // Communication Builder
  const [cbStep, setCbStep] = useState(1);
  const [cbWhen, setCbWhen] = useState('');
  const [cbEmotion, setCbEmotion] = useState('');
  const [cbCustomEmotion, setCbCustomEmotion] = useState('');
  const [cbBecause, setCbBecause] = useState('');
  const [cbNeed, setCbNeed] = useState('');
  const [cbBuilt, setCbBuilt] = useState(false);
  const [cbPolish, setCbPolish] = useState<{ polished: string; deliveryTip: string; ifDefensive: string } | null>(null);
  const [cbPolishLoading, setCbPolishLoading] = useState(false);

  // Mood Patterns
  const [mpMonth, setMpMonth] = useState(() => new Date());
  const [mpSelectedDay, setMpSelectedDay] = useState<Date | null>(null);
  const [mpInsights, setMpInsights] = useState<{ pattern: string; positive: string; suggestion: string } | null>(null);
  const [mpInsightsLoading, setMpInsightsLoading] = useState(false);
  const moodHistory = useCircleStore((s) => s.moodHistory);
  const convMessages = useConversationStore((s) => s.messages);
  const completedLessons = useEducationStore((s) => s.completedLessons);

  // Fetch mood-patterns AI insights when viewing that activity (uses central AI service)
  useEffect(() => {
    if (activity?.id !== 'mood-patterns') return;
    let cancelled = false;
    const run = async () => {
      setMpInsightsLoading(true);
      try {
        const last30 = useCircleStore.getState().moodHistory.filter((e) => {
          const t = new Date(e.timestamp).getTime();
          return t >= Date.now() - 30 * 86400000;
        }).map((e) => ({ date: new Date(e.timestamp).toLocaleDateString(), mood: e.mood, note: e.note }));
        if (cancelled || last30.length === 0) {
          if (!cancelled) setMpInsights(null);
          return;
        }
        const systemPrompt = `Analyze this user's mood data for the last 30 days. Data: ${JSON.stringify(last30)}. Provide 3 insights as JSON: { "pattern": "...", "positive": "...", "suggestion": "..." }. Be encouraging.`;
        const text = await sendMessageWithSystemPromptOnly([{ role: 'user', content: 'Analyze.' }], systemPrompt, 350);
        if (cancelled) return;
        const cleaned = text.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
        const parsed = JSON.parse(cleaned) as { pattern: string; positive: string; suggestion: string };
        if (!cancelled) setMpInsights(parsed);
      } catch {
        if (!cancelled) setMpInsights(null);
      } finally {
        if (!cancelled) setMpInsightsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activity?.id, mpMonth.getFullYear(), mpMonth.getMonth()]);

  useEffect(() => {
    if (!running || activity?.id !== 'breathing') return;
    const phases: BreathPhase[] = ['inhale', 'hold', 'exhale', 'hold'];
    const durations = [BOX_BREATH.inhale, BOX_BREATH.hold, BOX_BREATH.exhale, BOX_BREATH.holdAfter];
    let phaseIndex = 0;
    let sec = 0;
    const t = setInterval(() => {
      sec++;
      setCount(sec);
      if (sec >= durations[phaseIndex]) {
        sec = 0;
        phaseIndex = (phaseIndex + 1) % 4;
        setPhase(phases[phaseIndex]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [running, activity?.id]);

  if (!activity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.error}>Activity not found.</Text>
      </View>
    );
  }

  // ----- BREATHING -----
  if (activity.id === 'breathing') {
    const phaseLabel = phase === 'inhale' ? 'Breathe in' : phase === 'exhale' ? 'Breathe out' : 'Hold';
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        <Text style={styles.sub}>Box breathing — 4 in, 4 hold, 4 out, 4 hold.</Text>
        {!running ? (
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setRunning(true);
              setPhase('inhale');
              setCount(0);
            }}
          >
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        ) : (
          <>
            <View style={[styles.circleWrap, { width: circleSize, height: circleSize }]}>
              <View
                style={[
                  styles.circle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    transform: [{ scale: phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.75 : 1.1 }],
                  },
                ]}
              />
            </View>
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
            <Pressable style={styles.stopBtn} onPress={() => setRunning(false)}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </Pressable>
          </>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  // ----- EMOTION WHEEL -----
  if (activity.id === 'emotion-wheel') {
    const primary = selectedPrimary;
    const detail = primary && selectedSecondaryId ? primary.details[selectedSecondaryId] : null;

    if (wheelLevel === 'detail' && detail) {
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWheelLevel('secondary'); setSelectedSecondaryId(null); }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: primary!.color }]}>
            <Text style={styles.detailEmotionName}>{detail.name}</Text>
            <Text style={styles.detailLabel}>This might feel like...</Text>
            <Text style={styles.detailText}>{detail.feelsLike}</Text>
            <Text style={styles.detailLabel}>This often shows up when...</Text>
            <Text style={styles.detailText}>{detail.showsUpWhen}</Text>
            <Text style={styles.detailLabel}>Try this:</Text>
            <Text style={styles.detailText}>{detail.tryThis}</Text>
            <Pressable
              style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                addJournalEntry(`I'm feeling ${detail.name}.`);
                Alert.alert('Saved', 'Added to your journal.');
              }}
            >
              <Text style={styles.startBtnText}>Save to journal</Text>
            </Pressable>
          </View>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (wheelLevel === 'secondary' && primary) {
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWheelLevel('primary'); setSelectedPrimary(null); }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>What kind of {primary.label.toLowerCase()}?</Text>
          <View style={styles.chipRow}>
            {primary.secondary.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.emotionChip, { backgroundColor: primary.color + '30', borderColor: primary.color }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSecondaryId(s.id);
                  setWheelLevel('detail');
                }}
              >
                <Text style={[styles.emotionChipText, { color: primary.color }]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        <Text style={styles.sub}>Tap a primary emotion to explore.</Text>
        <View style={styles.wheelGrid}>
          {EMOTION_WHEEL_PRIMARY.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.wheelSegment, { backgroundColor: p.color + 'CC' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPrimary(p);
                setWheelLevel('secondary');
                setSelectedSecondaryId(null);
              }}
            >
              <Text style={styles.wheelEmoji}>{p.emoji}</Text>
              <Text style={styles.wheelLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- BODY SCAN -----
  if (activity.id === 'body-scan') {
    const cardZone = cardZoneId ? BODY_ZONES.find((z) => z.id === cardZoneId) : null;
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        <Text style={styles.sub}>Tap where you feel tension or emotion.</Text>
        <ScrollView style={styles.bodyScanList} contentContainerStyle={styles.bodyScanListContent}>
          {BODY_ZONES.map((z) => {
            const isSelected = selectedZones.includes(z.id);
            return (
              <Pressable
                key={z.id}
                style={[styles.bodyZoneBtn, isSelected && styles.bodyZoneBtnSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!selectedZones.includes(z.id)) setSelectedZones([...selectedZones, z.id]);
                  setCardZoneId(z.id);
                }}
              >
                <Text style={styles.bodyZoneLabel}>{z.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {cardZone && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{cardZone.label}</Text>
            <Text style={styles.detailText}>{cardZone.meaning}</Text>
            <Text style={styles.detailLabel}>What might help:</Text>
            <Text style={styles.detailText}>{cardZone.suggestion}</Text>
            <Pressable
              style={styles.talkAboutItBtn}
              onPress={() => {
                router.push({ pathname: '/(tabs)/talk', params: { prompt: `I'm noticing tension in my ${cardZone.label.toLowerCase()}.` } });
              }}
            >
              <Text style={styles.talkAboutItText}>Talk about it</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.bodyScanActions}>
          <Pressable style={styles.clearBtn} onPress={() => { setSelectedZones([]); setCardZoneId(null); }}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
          <Pressable
            style={styles.startBtn}
            onPress={() => {
              if (selectedZones.length === 0) return;
              const labels = BODY_ZONES.filter((z) => selectedZones.includes(z.id)).map((z) => z.label).join(', ');
              addJournalEntry(`Body scan: I noticed tension in my ${labels}.`);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Saved', 'Added to your journal.');
            }}
          >
            <Text style={styles.startBtnText}>Save scan</Text>
          </Pressable>
        </View>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  // ----- THOUGHT CHALLENGER -----
  if (activity.id === 'thought-challenger') {
    const startChallenge = async () => {
      const t = thought.trim();
      if (!t) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setOriginalThought(t);
      const initial = [{ role: 'user', content: t }];
      setTcMessages(initial);
      setTcStep(1);
      setTcResponse(null);
      setTcLoading(true);
      try {
        const next = await fetchThoughtChallengerStep(initial);
        setTcResponse(next);
        setTcMessages([...initial, { role: 'assistant', content: JSON.stringify(next) }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        const fallback = thoughtChallengerFallback(1, t, initial);
        setTcResponse(fallback);
        setTcMessages([...initial, { role: 'assistant', content: JSON.stringify(fallback) }]);
      } finally {
        setTcLoading(false);
      }
    };

    const sendFollowUp = async (userReply: string) => {
      const nextMessages = [...tcMessages, { role: 'user', content: userReply }];
      setTcMessages(nextMessages);
      setTcLoading(true);
      setTcResponse(null);
      try {
        const next = await fetchThoughtChallengerStep(nextMessages);
        setTcResponse(next);
        setTcStep(next.step);
        setTcMessages((prev) => [...prev, { role: 'assistant', content: JSON.stringify(next) }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        const fallback = thoughtChallengerFallback(Math.min((tcResponse?.step ?? 1) + 1, 4), originalThought, nextMessages);
        setTcResponse(fallback);
        setTcStep(fallback.step);
        setTcMessages((prev) => [...prev, { role: 'assistant', content: JSON.stringify(fallback) }]);
      } finally {
        setTcLoading(false);
      }
    };

    const saveReframe = () => {
      if (tcResponse?.reframe && originalThought) {
        addJournalEntry(`Original thought: ${originalThought} → Reframed: ${tcResponse.reframe}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Saved', 'Added to your journal.');
      }
    };

    const resetThought = () => {
      setThought('');
      setTcStep(0);
      setTcMessages([]);
      setTcResponse(null);
      setOriginalThought('');
      setTcReply('');
    };

    if (tcStep === 0) {
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
          <Text style={styles.sub}>What thought is bothering you?</Text>
          <TextInput
            style={styles.thoughtInput}
            placeholder="e.g., 'Nobody actually cares about me' or 'I'm going to fail'"
            placeholderTextColor={COLORS.textMuted}
            value={thought}
            onChangeText={setThought}
            multiline
          />
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed, !thought.trim() && styles.disabled]}
            onPress={startChallenge}
            disabled={!thought.trim()}
          >
            <Text style={styles.startBtnText}>Challenge this thought</Text>
          </Pressable>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }

    const r = tcResponse;
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        {tcLoading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginVertical: 24 }} />
        ) : r && (
          <View style={styles.card}>
            {r.distortion && (
              <>
                <Text style={styles.detailLabel}>That sounds like...</Text>
                <Text style={styles.detailText}>{r.distortion}</Text>
              </>
            )}
            <Text style={styles.tcMessage}>{r.message}</Text>
            {r.step === 1 && (
              <Pressable style={styles.tcSmallBtn} onPress={() => sendFollowUp('Continue')}>
                <Text style={styles.tcSmallBtnText}>Continue</Text>
              </Pressable>
            )}
            {r.step === 2 && (
              <View style={styles.tcActions}>
                <TextInput
                  style={styles.thoughtInput}
                  placeholder="Type your response, or tap below..."
                  placeholderTextColor={COLORS.textMuted}
                  value={tcReply}
                  onChangeText={setTcReply}
                  multiline
                />
                <Pressable style={styles.tcSmallBtn} onPress={() => sendFollowUp(tcReply.trim() || "I'm not sure")}>
                  <Text style={styles.tcSmallBtnText}>{tcReply.trim() ? 'Send' : "I'm not sure"}</Text>
                </Pressable>
              </View>
            )}
            {r.step === 3 && r.reframe && (
              <>
                <Text style={styles.detailLabel}>Another way to look at it:</Text>
                <Text style={[styles.detailText, styles.strikethrough]}>{originalThought}</Text>
                <Text style={[styles.detailText, styles.reframeText]}>{r.reframe}</Text>
                <Pressable style={styles.tcSmallBtn} onPress={() => { setTcReply(''); sendFollowUp('Thanks, that helps'); }}>
                  <Text style={styles.tcSmallBtnText}>Continue</Text>
                </Pressable>
              </>
            )}
            {r.step === 4 && r.action && (
              <>
                <Text style={styles.detailLabel}>One thing you could try:</Text>
                <Text style={styles.detailText}>{r.action}</Text>
                <Pressable style={[styles.startBtn, { marginTop: 12 }]} onPress={saveReframe}>
                  <Text style={styles.startBtnText}>Save reframe</Text>
                </Pressable>
                <Pressable style={styles.tcSmallBtn} onPress={resetThought}>
                  <Text style={styles.tcSmallBtnText}>Try another thought</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- EMOTION MATCH -----
  if (activity.id === 'emotion-match') {
    const startSession = () => {
      const ten = shuffle(EMOTION_MATCH_SCENARIOS).slice(0, 10);
      setEmSessionScenarios(ten);
      setEmIndex(0);
      setEmSelected(null);
      setEmShowFeedback(false);
      setEmCompleted(false);
    };
    const scenario = emSessionScenarios[emIndex];
    const emotionsChosen = emSessionScenarios.slice(0, emIndex).length + (emShowFeedback ? 1 : 0);

    if (emSessionScenarios.length === 0) {
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>What Would You Feel?</Text>
          <Text style={styles.sub}>Tap an emotion for each scenario. No wrong answers — just you.</Text>
          <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={startSession}>
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (emCompleted) {
      const uniqueEmotions = new Set<string>();
      emSessionScenarios.forEach((s) => s.options.forEach((o) => uniqueEmotions.add(o)));
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>What Would You Feel?</Text>
          <Text style={[styles.detailText, { textAlign: 'center', marginBottom: 24 }]}>
            You explored 10 scenarios and identified many different emotions. Nice emotional range! ✨
          </Text>
          <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={startSession}>
            <Text style={styles.startBtnText}>Play again</Text>
          </Pressable>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }

    const alternative = scenario?.options.find((o) => o !== scenario.common && o !== emSelected) ?? scenario?.options[1];

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>What Would You Feel?</Text>
        <Text style={styles.emProgress}>{emIndex + 1} of 10</Text>
        <View style={[styles.card, styles.emScenarioCard]}>
          <Text style={styles.emScenarioText}>{scenario?.situation}</Text>
        </View>
        {!emShowFeedback ? (
          <View style={styles.emGrid}>
            {scenario?.options.map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.emEmotionCard,
                  emSelected === opt && styles.emEmotionCardSelected,
                ]}
                onPress={() => {
                  if (emSelected) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEmSelected(opt);
                  setEmShowFeedback(true);
                }}
              >
                <Text style={styles.emEmotionEmoji}>{EMOTION_EMOJIS[opt] ?? '💭'}</Text>
                <Text style={styles.emEmotionLabel}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.detailText}>
                You chose {emSelected}. That's completely valid.
              </Text>
              <Text style={[styles.detailText, { marginTop: 12 }]}>
                Many people feel {scenario?.common} in this situation. Others feel {alternative}. There's no wrong answer — emotions are personal.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (emIndex >= 9) setEmCompleted(true);
                else {
                  setEmIndex(emIndex + 1);
                  setEmSelected(null);
                  setEmShowFeedback(false);
                }
              }}
            >
              <Text style={styles.startBtnText}>{emIndex >= 9 ? 'See summary' : 'Next scenario'}</Text>
            </Pressable>
          </>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- TRIGGER MAP -----
  const TRIGGER_EMOTIONS = ['Angry', 'Sad', 'Scared', 'Overwhelmed', 'Hurt', 'Frustrated', 'Anxious', 'Ashamed', 'Jealous', 'Panicked'];
  const TRIGGER_BODY_ZONES = ['Head', 'Chest', 'Stomach', 'Shoulders', 'Jaw', 'Hands', 'Whole body'];
  const TRIGGER_REACTIONS = ['Shut down', 'Lashed out', 'Cried', 'Froze', 'Left the situation', 'Pretended I was fine', 'Talked to someone', 'Other'];

  if (activity.id === 'trigger-map') {
    const sendForAnalysis = async () => {
      setTmLoading(true);
      try {
        const body = `Situation: ${tmSituation}\nEmotions: ${tmEmotions.join(', ')}\nBody: ${tmBodyZones.join(', ')}\nReaction: ${tmReaction}${tmOtherReaction ? ` (${tmOtherReaction})` : ''}`;
        const tmSystem = `The user just completed a trigger mapping exercise. Based on their responses, provide:
1. A gentle validation of their experience (1 sentence)
2. What pattern you notice (1-2 sentences)
3. One alternative response they could try next time (2 sentences)
4. An encouraging close (1 sentence)
Be warm and specific. Reference their actual words.
Respond as JSON only, no markdown: { "validation": "...", "pattern": "...", "alternative": "...", "encouragement": "..." }`;
        const text = await sendMessageWithSystemPromptOnly([{ role: 'user', content: body }], tmSystem, 400);
        const cleaned = text.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
        const parsed = JSON.parse(cleaned) as { validation: string; pattern: string; alternative: string; encouragement: string };
        setTmAiResult(parsed);
        setTmStep(5);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        Alert.alert('Error', 'Could not connect. Check your API key in Settings.');
      } finally {
        setTmLoading(false);
      }
    };

    const resetTriggerMap = () => {
      setTmStep(1);
      setTmSituation('');
      setTmEmotions([]);
      setTmBodyZones([]);
      setTmReaction('');
      setTmOtherReaction('');
      setTmAiResult(null);
    };

    const saveTrigger = () => {
      addTriggerMap({
        situation: tmSituation,
        emotions: tmEmotions,
        bodyZones: tmBodyZones,
        reaction: tmReaction,
        otherReaction: tmOtherReaction || undefined,
        validation: tmAiResult?.validation,
        pattern: tmAiResult?.pattern,
        alternative: tmAiResult?.alternative,
        encouragement: tmAiResult?.encouragement,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Trigger saved. Gauge can reference it in conversation.');
      resetTriggerMap();
    };

    const canNext = () => {
      if (tmStep === 1) return tmSituation.trim().length > 0;
      if (tmStep === 2) return tmEmotions.length > 0;
      if (tmStep === 3) return tmBodyZones.length > 0;
      if (tmStep === 4) return tmReaction.length > 0 && (tmReaction !== 'Other' || tmOtherReaction.trim().length > 0);
      return true;
    };

    const toggle = (arr: string[], item: string, setter: (a: string[]) => void) => {
      if (arr.includes(item)) setter(arr.filter((x) => x !== item));
      else setter([...arr, item]);
    };

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
        {tmStep === 1 && (
          <Text style={[styles.detailText, { marginBottom: 16 }]}>
            A trigger is something that sets off a strong emotional reaction. Let's figure out yours so you can spot them coming.
          </Text>
        )}
        <Text style={styles.emProgress}>{tmStep} of 5</Text>
        {tmStep === 1 && (
          <>
            <Text style={styles.sub}>What was the situation?</Text>
            <TextInput
              style={[styles.thoughtInput, { minHeight: 100 }]}
              placeholder="Describe what happened..."
              placeholderTextColor={COLORS.textMuted}
              value={tmSituation}
              onChangeText={setTmSituation}
              multiline
            />
          </>
        )}
        {tmStep === 2 && (
          <>
            <Text style={styles.sub}>What emotion(s) came up?</Text>
            <View style={styles.chipRow}>
              {TRIGGER_EMOTIONS.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.bodyZoneBtn, tmEmotions.includes(e) && styles.bodyZoneBtnSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggle(tmEmotions, e, setTmEmotions); }}
                >
                  <Text style={styles.bodyZoneLabel}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {tmStep === 3 && (
          <>
            <Text style={styles.sub}>Where did it show up in your body?</Text>
            <View style={styles.chipRow}>
              {TRIGGER_BODY_ZONES.map((z) => (
                <Pressable
                  key={z}
                  style={[styles.bodyZoneBtn, tmBodyZones.includes(z) && styles.bodyZoneBtnSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggle(tmBodyZones, z, setTmBodyZones); }}
                >
                  <Text style={styles.bodyZoneLabel}>{z}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {tmStep === 4 && (
          <>
            <Text style={styles.sub}>How did you react? No judgment — just awareness.</Text>
            <View style={styles.chipRow}>
              {TRIGGER_REACTIONS.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.bodyZoneBtn, tmReaction === r && styles.bodyZoneBtnSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTmReaction(r); }}
                >
                  <Text style={styles.bodyZoneLabel}>{r}</Text>
                </Pressable>
              ))}
            </View>
            {tmReaction === 'Other' && (
              <TextInput
                style={styles.thoughtInput}
                placeholder="Describe..."
                placeholderTextColor={COLORS.textMuted}
                value={tmOtherReaction}
                onChangeText={setTmOtherReaction}
              />
            )}
          </>
        )}
        {tmStep === 5 && (
          <>
            {tmLoading ? (
              <ActivityIndicator size="large" color={COLORS.accent} style={{ marginVertical: 24 }} />
            ) : tmAiResult && (
              <View style={styles.card}>
                <Text style={styles.detailLabel}>Validation</Text>
                <Text style={styles.detailText}>{tmAiResult.validation}</Text>
                <Text style={styles.detailLabel}>Pattern</Text>
                <Text style={styles.detailText}>{tmAiResult.pattern}</Text>
                <Text style={styles.detailLabel}>Alternative</Text>
                <Text style={styles.detailText}>{tmAiResult.alternative}</Text>
                <Text style={styles.detailLabel}>Encouragement</Text>
                <Text style={styles.detailText}>{tmAiResult.encouragement}</Text>
                <Pressable style={[styles.startBtn, { marginTop: 16 }]} onPress={saveTrigger}>
                  <Text style={styles.startBtnText}>Save to my triggers</Text>
                </Pressable>
                <Pressable style={styles.tcSmallBtn} onPress={resetTriggerMap}>
                  <Text style={styles.tcSmallBtnText}>Map another trigger</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
        {tmStep < 5 && (
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed, !canNext() && styles.disabled]}
            onPress={() => {
              if (!canNext()) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (tmStep === 4) sendForAnalysis();
              else setTmStep(tmStep + 1);
            }}
            disabled={!canNext()}
          >
            <Text style={styles.startBtnText}>{tmStep === 4 ? 'Get my analysis' : 'Next'}</Text>
          </Pressable>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- GRATITUDE JAR -----
  const GRATITUDE_COLORS = ['#9D7AFF', '#FFD700', '#FF9B54', '#98D8AA', '#87CEEB'];
  if (activity.id === 'gratitude-jar') {
    const handleAddGratitude = () => {
      const t = gratitudeInput.trim();
      if (!t) return;
      addGratitudeEntry(t, gratitudeWhy.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGratitudeInput('');
      setGratitudeWhy('');
      setShowGratitudeAdd(false);
    };
    const handleShake = () => {
      if (gratitudeEntries.length === 0) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const random = gratitudeEntries[Math.floor(Math.random() * gratitudeEntries.length)];
      setShakeEntry(random);
      Animated.sequence([
        Animated.timing(jarDotsAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(jarDotsAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    };
    const jarHeight = 160;
    const dotCount = Math.min(gratitudeEntries.length * 2, 60);
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>{activity.emoji} Your Gratitude Jar</Text>
        <View style={[styles.gratitudeJar, { height: jarHeight }]}>
          {Array.from({ length: dotCount }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.gratitudeDot,
                {
                  backgroundColor: GRATITUDE_COLORS[i % GRATITUDE_COLORS.length],
                  left: `${(i * 17) % 85}%`,
                  top: `${(i * 23) % 75}%`,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.gratitudeJarCount}>{gratitudeEntries.length} moments of gratitude</Text>
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={() => setShowGratitudeAdd(true)}>
          <Text style={styles.startBtnText}>Add to jar ✨</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          onPress={handleShake}
          disabled={gratitudeEntries.length === 0}
        >
          <Text style={styles.clearBtnText}>Shake jar</Text>
        </Pressable>
        {showGratitudeAdd && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>What's one thing you're grateful for right now?</Text>
            <TextInput
              style={styles.thoughtInput}
              placeholder="e.g. A warm coffee this morning"
              placeholderTextColor={COLORS.textMuted}
              value={gratitudeInput}
              onChangeText={setGratitudeInput}
            />
            <Text style={[styles.detailLabel, { marginTop: 8 }]}>Why does this matter to you? (optional)</Text>
            <TextInput
              style={[styles.thoughtInput, { minHeight: 60 }]}
              placeholder="Optional..."
              placeholderTextColor={COLORS.textMuted}
              value={gratitudeWhy}
              onChangeText={setGratitudeWhy}
            />
            <Pressable style={[styles.startBtn, { marginTop: 12 }]} onPress={handleAddGratitude} disabled={!gratitudeInput.trim()}>
              <Text style={styles.startBtnText}>Add ✨</Text>
            </Pressable>
            <Pressable style={styles.tcSmallBtn} onPress={() => { setShowGratitudeAdd(false); setGratitudeInput(''); setGratitudeWhy(''); }}>
              <Text style={styles.tcSmallBtnText}>Cancel</Text>
            </Pressable>
          </View>
        )}
        {shakeEntry && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.detailLabel}>On {new Date(shakeEntry.createdAt).toLocaleDateString()}, you were grateful for:</Text>
            <Text style={styles.detailText}>{shakeEntry.text}</Text>
            {shakeEntry.why && <Text style={[styles.detailText, { marginTop: 8 }]}>{shakeEntry.why}</Text>}
            <Pressable style={styles.tcSmallBtn} onPress={handleShake}>
              <Text style={styles.tcSmallBtnText}>Shake again</Text>
            </Pressable>
            <Pressable style={styles.tcSmallBtn} onPress={() => setShakeEntry(null)}>
              <Text style={styles.tcSmallBtnText}>Close</Text>
            </Pressable>
          </View>
        )}
        <Text style={[styles.detailLabel, { marginTop: 16 }]}>Recent entries</Text>
        {gratitudeEntries.slice(0, 15).map((e) => (
          <View key={e.id} style={[styles.card, styles.gratitudeEntryRow]}>
            <Text style={styles.detailText}>{e.text}</Text>
            <Text style={styles.secondaryText}>{new Date(e.createdAt).toLocaleDateString()}</Text>
            <Pressable style={styles.tcSmallBtn} onPress={() => { removeGratitudeEntry(e.id); }}>
              <Text style={[styles.tcSmallBtnText, { color: COLORS.temperature.red }]}>Delete</Text>
            </Pressable>
          </View>
        ))}
        {gratitudeEntries.length === 0 && <Text style={styles.sub}>Add something you're grateful for to start filling your jar.</Text>}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- STRESS THERMOMETER -----
  if (activity.id === 'stress-thermo') {
    const thermoHeight = 280;
    const stressToTemp = (n: number): Temperature => (n <= 3 ? 'green' : n <= 6 ? 'yellow' : n <= 8 ? 'orange' : 'red');
    const fillPct = stressLevel / 10;
    const onLevelSelect = (n: number) => {
      setStressLevel(n);
      if (n <= 3) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (n <= 6) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (n <= 8) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };
    const onSaveCheckin = () => {
      const mood = stressToTemp(stressLevel);
      addMoodCheckin(mood, stressNote.trim() || undefined);
      createCheckin.mutate({
        mood,
        moodLabel: TEMPERATURE_LABELS[mood],
        note: stressNote.trim() || null,
      });
      trackCheckIn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Check-in saved to your mood history.');
      setStressSubmitted(true);
    };
    const zone = stressLevel <= 3 ? 'cool' : stressLevel <= 6 ? 'warm' : stressLevel <= 8 ? 'hot' : 'boiling';
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>How stressed are you?</Text>
        <View style={[styles.thermoWrap, { height: thermoHeight }]}>
          <View style={styles.thermoTrack} />
          <Animated.View
            style={[
              styles.thermoFill,
              {
                height: `${fillPct * 100}%`,
                backgroundColor: stressLevel <= 3 ? COLORS.temperature.green : stressLevel <= 6 ? COLORS.temperature.yellow : stressLevel <= 8 ? COLORS.temperature.orange : COLORS.temperature.red,
              },
            ]}
          />
          <View style={styles.thermoNumbers}>
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
              <Pressable key={n} style={styles.thermoNumBtn} onPress={() => onLevelSelect(n)}>
                <Text style={[styles.thermoNumText, stressLevel === n && styles.thermoNumTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {zone === 'cool' && (
          <>
            <View style={styles.card}>
              <Text style={styles.detailText}>You're in a good place right now. 💚</Text>
              <Text style={styles.detailLabel}>What's helping you stay balanced?</Text>
              <TextInput style={styles.thoughtInput} placeholder="Optional..." placeholderTextColor={COLORS.textMuted} value={stressNote} onChangeText={setStressNote} />
            </View>
            <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={onSaveCheckin}>
              <Text style={styles.startBtnText}>Save check-in</Text>
            </Pressable>
          </>
        )}
        {zone === 'warm' && (
          <>
            <View style={styles.card}>
              <Text style={styles.detailText}>Things are getting warm. Let's cool down a bit. 💛</Text>
              <Text style={styles.detailLabel}>Try this:</Text>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(modals)/activity?id=breathing'); }}>
                <Text style={styles.thermoActionText}>🌬️ Breathe</Text>
              </Pressable>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(modals)/new-journal'); }}>
                <Text style={styles.thermoActionText}>✍️ Write it out</Text>
              </Pressable>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(tabs)/talk'); }}>
                <Text style={styles.thermoActionText}>💬 Talk to Gauge</Text>
              </Pressable>
              <Text style={[styles.detailLabel, { marginTop: 12 }]}>What's raising your temperature?</Text>
              <TextInput style={styles.thoughtInput} placeholder="Optional..." placeholderTextColor={COLORS.textMuted} value={stressNote} onChangeText={setStressNote} />
            </View>
            <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={onSaveCheckin}>
              <Text style={styles.startBtnText}>Save check-in</Text>
            </Pressable>
          </>
        )}
        {zone === 'hot' && (
          <>
            <View style={styles.card}>
              <Text style={styles.detailText}>Running hot. You don't have to handle this alone. 🧡</Text>
              <Text style={styles.detailLabel}>Let's try something right now:</Text>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(modals)/activity?id=breathing'); }}>
                <Text style={styles.thermoActionText}>🌬️ Emergency breathe</Text>
              </Pressable>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(tabs)/talk'); }}>
                <Text style={styles.thermoActionText}>💬 Talk to Gauge now</Text>
              </Pressable>
              <Pressable style={styles.thermoActionBtn} onPress={() => emergencyContacts[0] && Linking.openURL(`tel:${emergencyContacts[0].phone.replace(/\D/g, '')}`)}>
                <Text style={styles.thermoActionText}>👤 Call someone</Text>
              </Pressable>
              <Text style={[styles.detailLabel, { marginTop: 12 }]}>What's going on?</Text>
              <TextInput style={styles.thoughtInput} placeholder="Optional..." placeholderTextColor={COLORS.textMuted} value={stressNote} onChangeText={setStressNote} />
            </View>
            <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={onSaveCheckin}>
              <Text style={styles.startBtnText}>Save check-in</Text>
            </Pressable>
          </>
        )}
        {zone === 'boiling' && (
          <>
            <View style={styles.card}>
              <Text style={styles.detailText}>This feels overwhelming. I'm here. ❤️</Text>
              <Text style={styles.detailText}>You are safe. Let's get you support.</Text>
              <Pressable style={[styles.thermoActionBtn, { backgroundColor: COLORS.temperature.red }]} onPress={() => Linking.openURL('tel:988')}>
                <Text style={styles.thermoActionText}>📞 Call 988 (Crisis Lifeline)</Text>
              </Pressable>
              <Pressable style={[styles.thermoActionBtn, { backgroundColor: COLORS.temperature.orange }]} onPress={() => Linking.openURL('sms:741741')}>
                <Text style={styles.thermoActionText}>💬 Text HOME to 741741</Text>
              </Pressable>
              {emergencyContacts.slice(0, 3).map((c, i) => (
                <Pressable key={i} style={styles.thermoActionBtn} onPress={() => Linking.openURL(`tel:${c.phone.replace(/\D/g, '')}`)}>
                  <Text style={styles.thermoActionText}>👤 Call {c.name}</Text>
                </Pressable>
              ))}
              <Pressable style={[styles.thermoActionBtn, { borderColor: COLORS.temperature.red, borderWidth: 2 }]} onPress={() => Linking.openURL('tel:911')}>
                <Text style={styles.thermoActionText}>🚨 Call 911</Text>
              </Pressable>
              <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push('/(tabs)/talk'); }}>
                <Text style={styles.thermoActionText}>I want to talk to Gauge</Text>
              </Pressable>
              <Text style={[styles.detailLabel, { marginTop: 12 }]}>What's going on?</Text>
              <TextInput style={styles.thoughtInput} placeholder="Optional..." placeholderTextColor={COLORS.textMuted} value={stressNote} onChangeText={setStressNote} />
            </View>
            <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={onSaveCheckin}>
              <Text style={styles.startBtnText}>Save check-in</Text>
            </Pressable>
          </>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- COMMUNICATION BUILDER -----
  const COMM_EMOTIONS = ['Hurt', 'Frustrated', 'Disrespected', 'Anxious', 'Lonely', 'Angry', 'Unappreciated', 'Overwhelmed', 'Sad', 'Invisible'];
  if (activity.id === 'comm-builder') {
    const buildStatement = () => {
      const when = cbWhen.trim();
      const emotion = cbEmotion || cbCustomEmotion.trim() || 'upset';
      const because = cbBecause.trim();
      const need = cbNeed.trim();
      setCbBuilt(true);
      setCbPolish(null);
    };
    const fullStatement = `When ${cbWhen.trim() || '...'}, I feel ${cbEmotion || cbCustomEmotion.trim() || '...'}, because ${cbBecause.trim() || '...'}. What I need is ${cbNeed.trim() || '...'}.`;
    const polishStatement = async () => {
      setCbPolishLoading(true);
      try {
        const cbSystem = `The user built this "I feel" statement: ${fullStatement}\nHelp them refine it. Offer:\n1. A polished version that sounds natural (not clinical)\n2. One tip for delivering it well\n3. What to do if the other person gets defensive\nRespond as JSON only, no markdown: { "polished": "...", "deliveryTip": "...", "ifDefensive": "..." }`;
        const text = await sendMessageWithSystemPromptOnly([{ role: 'user', content: 'Polish my statement.' }], cbSystem, 350);
        const cleaned = text.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
        const parsed = JSON.parse(cleaned) as { polished: string; deliveryTip: string; ifDefensive: string };
        setCbPolish(parsed);
      } catch (e) {
        Alert.alert('Error', 'Could not connect. Check API key in Settings.');
      } finally {
        setCbPolishLoading(false);
      }
    };
    const shareStatement = () => {
      Share.share({ message: fullStatement, title: 'I feel statement' });
    };
    const resetBuilder = () => {
      setCbStep(1);
      setCbWhen('');
      setCbEmotion('');
      setCbCustomEmotion('');
      setCbBecause('');
      setCbNeed('');
      setCbBuilt(false);
      setCbPolish(null);
    };
    if (!cbBuilt) {
      return (
        <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.title}>Say What You Feel</Text>
          <Text style={styles.sub}>Let's build a sentence you can use in a real conversation. We'll do it step by step.</Text>
          <View style={styles.cbDots}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.cbDot, i === cbStep && styles.cbDotActive]} />
            ))}
          </View>
          {cbStep === 1 && (
            <>
              <Text style={styles.detailLabel}>When...</Text>
              <Text style={styles.sub}>Describe the situation. What happened?</Text>
              <TextInput style={styles.thoughtInput} placeholder="e.g., 'When you cancel our plans last minute...'" placeholderTextColor={COLORS.textMuted} value={cbWhen} onChangeText={setCbWhen} />
            </>
          )}
          {cbStep === 2 && (
            <>
              <Text style={styles.detailLabel}>I feel...</Text>
              <Text style={styles.sub}>What emotion comes up?</Text>
              <View style={styles.chipRow}>
                {COMM_EMOTIONS.map((e) => (
                  <Pressable key={e} style={[styles.bodyZoneBtn, cbEmotion === e && styles.bodyZoneBtnSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCbEmotion(e); }}>
                    <Text style={styles.bodyZoneLabel}>{e}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput style={styles.thoughtInput} placeholder="Or type your own emotion" placeholderTextColor={COLORS.textMuted} value={cbCustomEmotion} onChangeText={setCbCustomEmotion} />
            </>
          )}
          {cbStep === 3 && (
            <>
              <Text style={styles.detailLabel}>Because...</Text>
              <Text style={styles.sub}>Why does it affect you? What does it mean to you?</Text>
              <TextInput style={styles.thoughtInput} placeholder="e.g., '...because it makes me feel like I'm not a priority'" placeholderTextColor={COLORS.textMuted} value={cbBecause} onChangeText={setCbBecause} />
            </>
          )}
          {cbStep === 4 && (
            <>
              <Text style={styles.detailLabel}>What I need is...</Text>
              <Text style={styles.sub}>What would help? What are you asking for?</Text>
              <TextInput style={styles.thoughtInput} placeholder="e.g., '...for you to let me know earlier so I can make other plans'" placeholderTextColor={COLORS.textMuted} value={cbNeed} onChangeText={setCbNeed} />
            </>
          )}
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed, cbStep === 1 && !cbWhen.trim() && styles.disabled]}
            onPress={() => {
              if (cbStep < 4) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCbStep(cbStep + 1);
              } else buildStatement();
            }}
            disabled={cbStep === 1 && !cbWhen.trim()}
          >
            <Text style={styles.startBtnText}>{cbStep === 4 ? 'Build my statement' : 'Next'}</Text>
          </Pressable>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Say What You Feel</Text>
        <View style={[styles.card, styles.cbStatementCard]}>
          <Text style={styles.cbStatementText}>{fullStatement}</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]} onPress={polishStatement} disabled={cbPolishLoading}>
          <Text style={styles.startBtnText}>{cbPolishLoading ? 'Polishing...' : '✨ Help me polish this'}</Text>
        </Pressable>
        {cbPolish && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>Polished</Text>
            <Text style={styles.detailText}>{cbPolish.polished}</Text>
            <Text style={styles.detailLabel}>Delivery tip</Text>
            <Text style={styles.detailText}>{cbPolish.deliveryTip}</Text>
            <Text style={styles.detailLabel}>If they get defensive</Text>
            <Text style={styles.detailText}>{cbPolish.ifDefensive}</Text>
          </View>
        )}
        <Pressable style={styles.thermoActionBtn} onPress={shareStatement}>
          <Text style={styles.thermoActionText}>📋 Share statement</Text>
        </Pressable>
        <Pressable style={styles.thermoActionBtn} onPress={() => { router.back(); router.push({ pathname: '/(modals)/role-play', params: { scenario: fullStatement, character: 'The person' } }); }}>
          <Text style={styles.thermoActionText}>🎭 Practice saying it</Text>
        </Pressable>
        <Pressable style={styles.thermoActionBtn} onPress={() => { addJournalEntry(fullStatement); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Saved', 'Added to journal.'); }}>
          <Text style={styles.thermoActionText}>📓 Save to journal</Text>
        </Pressable>
        <Pressable style={styles.tcSmallBtn} onPress={resetBuilder}>
          <Text style={styles.tcSmallBtnText}>Build another</Text>
        </Pressable>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- MOOD PATTERNS -----
  if (activity.id === 'mood-patterns') {
    const getMoodForDate = (d: Date) => {
      const key = d.toDateString();
      const entry = moodHistory.find((e) => new Date(e.timestamp).toDateString() === key);
      return entry?.mood ?? null;
    };
    const getConversationsForDate = (d: Date) => {
      const key = d.toDateString();
      return convMessages.filter((m) => m.role === 'user' && new Date(m.timestamp).toDateString() === key).length;
    };
    const monthStart = new Date(mpMonth.getFullYear(), mpMonth.getMonth(), 1);
    const monthEnd = new Date(mpMonth.getFullYear(), mpMonth.getMonth() + 1, 0);
    const startPad = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const totalCells = startPad + daysInMonth;
    const rows = Math.ceil(totalCells / 7);
    const dayCells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) dayCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) dayCells.push(d);
    while (dayCells.length < rows * 7) dayCells.push(null);
    const thisMonthMoods = moodHistory.filter((e) => {
      const t = new Date(e.timestamp);
      return t.getMonth() === mpMonth.getMonth() && t.getFullYear() === mpMonth.getFullYear();
    });
    const mostCommon = (() => {
      const counts: Record<string, number> = {};
      thisMonthMoods.forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
      let max = 0, mood: string | null = null;
      Object.entries(counts).forEach(([m, c]) => { if (c > max) { max = c; mood = m; } });
      return mood;
    })();
    const streakThisMonth = (() => {
      let s = 0;
      const today = new Date().toDateString();
      const sorted = [...thisMonthMoods].map((e) => new Date(e.timestamp).toDateString()).filter((d, i, arr) => arr.indexOf(d) === i).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (sorted[0] !== today) return 0;
      let prev = today;
      for (const d of sorted) {
        if (prev === d) { s++; prev = new Date(new Date(d).getTime() - 86400000).toDateString(); }
        else break;
      }
      return s;
    })();
    const selectedEntry = mpSelectedDay ? moodHistory.find((e) => new Date(e.timestamp).toDateString() === mpSelectedDay.toDateString()) : null;
    const convCount = mpSelectedDay ? getConversationsForDate(mpSelectedDay) : 0;
    const moodColors: Record<string, string> = { green: COLORS.temperature.green, yellow: COLORS.temperature.yellow, orange: COLORS.temperature.orange, red: COLORS.temperature.red };
    const todayStr = new Date().toDateString();
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Your Patterns</Text>
        <Text style={styles.sub}>This month: {thisMonthMoods.length} check-ins{mostCommon ? `, most common mood: ${mostCommon}` : ''}{streakThisMonth > 0 ? `, longest streak: ${streakThisMonth} days` : ''}</Text>
        <View style={styles.mpMonthNav}>
          <Pressable onPress={() => setMpMonth(new Date(mpMonth.getFullYear(), mpMonth.getMonth() - 1))}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.mpMonthTitle}>{mpMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <Pressable onPress={() => setMpMonth(new Date(mpMonth.getFullYear(), mpMonth.getMonth() + 1))}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.mpWeekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.mpWeekLabel}>{d}</Text>
          ))}
        </View>
        <View style={styles.mpGrid}>
          {dayCells.map((d, i) => {
            if (d === null) return <View key={i} style={styles.mpCellEmpty} />;
            const date = new Date(mpMonth.getFullYear(), mpMonth.getMonth(), d);
            const mood = getMoodForDate(date);
            const isToday = date.toDateString() === todayStr;
            return (
              <Pressable
                key={i}
                style={[styles.mpCell, mood && { backgroundColor: moodColors[mood] }, isToday && styles.mpCellToday]}
                onPress={() => setMpSelectedDay(mpSelectedDay?.getTime() === date.getTime() ? null : date)}
              >
                <Text style={[styles.mpCellText, mood && { color: '#fff' }]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
        {mpSelectedDay && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>{mpSelectedDay.toLocaleDateString()}</Text>
            {selectedEntry ? (
              <>
                <Text style={styles.detailText}>Mood: {selectedEntry.label}</Text>
                {selectedEntry.note && <Text style={styles.detailText}>{selectedEntry.note}</Text>}
                <Text style={styles.detailText}>Conversations that day: {convCount}</Text>
                <Text style={styles.detailText}>This was a {selectedEntry.mood} day.</Text>
              </>
            ) : (
              <Text style={styles.detailText}>No check-in this day.</Text>
            )}
          </View>
        )}
        <Text style={[styles.detailLabel, { marginTop: 16 }]}>Insights</Text>
        {mpInsightsLoading ? (
          <ActivityIndicator size="small" color={COLORS.accent} style={{ marginVertical: 12 }} />
        ) : mpInsights ? (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>📊 Pattern</Text>
            <Text style={styles.detailText}>{mpInsights.pattern}</Text>
            <Text style={styles.detailLabel}>⭐ Bright Spot</Text>
            <Text style={styles.detailText}>{mpInsights.positive}</Text>
            <Text style={styles.detailLabel}>💡 Suggestion</Text>
            <Text style={styles.detailText}>{mpInsights.suggestion}</Text>
          </View>
        ) : (
          <Text style={styles.sub}>Start checking in daily to see your patterns here.</Text>
        )}
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ============================================
  // ATHLETE MODE ACTIVITIES
  // ============================================

  // ----- RECOVERY CHECK (Athlete Mode) -----
  const [rcSleep, setRcSleep] = useState<number>(3);
  const [rcSoreness, setRcSoreness] = useState<number>(3);
  const [rcEnergy, setRcEnergy] = useState<number>(3);
  const [rcMood, setRcMood] = useState<number>(3);
  const [rcSubmitted, setRcSubmitted] = useState(false);

  if (activity.id === 'recovery-check') {
    const overallRecovery = Math.round((rcSleep + rcSoreness + rcEnergy + rcMood) / 4 * 20);
    const recoveryLabel = overallRecovery >= 80 ? 'Ready to train hard' : overallRecovery >= 60 ? 'Light training recommended' : overallRecovery >= 40 ? 'Active recovery day' : 'Rest day — prioritize recovery';
    const recoveryColor = overallRecovery >= 80 ? COLORS.temperature.green : overallRecovery >= 60 ? COLORS.temperature.yellow : overallRecovery >= 40 ? COLORS.temperature.orange : COLORS.temperature.red;

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>🔋 Recovery Check</Text>
        <Text style={styles.sub}>Rate each area from 1 (poor) to 5 (excellent)</Text>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>😴 Sleep Quality</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, rcSleep === n && styles.ratingBtnSelected]} onPress={() => setRcSleep(n)}>
                <Text style={[styles.ratingBtnText, rcSleep === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>💪 Muscle Soreness (5 = not sore)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, rcSoreness === n && styles.ratingBtnSelected]} onPress={() => setRcSoreness(n)}>
                <Text style={[styles.ratingBtnText, rcSoreness === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>⚡ Energy Level</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, rcEnergy === n && styles.ratingBtnSelected]} onPress={() => setRcEnergy(n)}>
                <Text style={[styles.ratingBtnText, rcEnergy === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>🧠 Mental Readiness</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, rcMood === n && styles.ratingBtnSelected]} onPress={() => setRcMood(n)}>
                <Text style={[styles.ratingBtnText, rcMood === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: recoveryColor }]}>
          <Text style={[styles.detailLabel, { color: recoveryColor }]}>Recovery Score: {overallRecovery}%</Text>
          <Text style={styles.detailText}>{recoveryLabel}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.pressed, { backgroundColor: '#00BFA5' }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setRcSubmitted(true); }}>
          <Text style={styles.startBtnText}>Save Recovery Check</Text>
        </Pressable>

        {rcSubmitted && (
          <View style={styles.card}>
            <Text style={styles.detailText}>✅ Recovery logged. Use this to guide today's training intensity.</Text>
          </View>
        )}

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- PRE-COMPETITION PREP (Athlete Mode) -----
  const [pcStep, setPcStep] = useState(1);
  const [pcArousal, setPcArousal] = useState<'too-low' | 'optimal' | 'too-high' | null>(null);

  if (activity.id === 'pre-competition') {
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>🏆 Pre-Competition Prep</Text>

        {pcStep === 1 && (
          <>
            <Text style={styles.sub}>How are you feeling right now?</Text>
            <Pressable style={[styles.card, pcArousal === 'too-low' && { borderColor: COLORS.temperature.yellow, borderWidth: 2 }]} onPress={() => setPcArousal('too-low')}>
              <Text style={styles.detailText}>😐 Too flat / low energy</Text>
              <Text style={styles.secondaryText}>Need to get more activated</Text>
            </Pressable>
            <Pressable style={[styles.card, pcArousal === 'optimal' && { borderColor: COLORS.temperature.green, borderWidth: 2 }]} onPress={() => setPcArousal('optimal')}>
              <Text style={styles.detailText}>😊 Just right / in the zone</Text>
              <Text style={styles.secondaryText}>Ready to compete</Text>
            </Pressable>
            <Pressable style={[styles.card, pcArousal === 'too-high' && { borderColor: COLORS.temperature.red, borderWidth: 2 }]} onPress={() => setPcArousal('too-high')}>
              <Text style={styles.detailText}>😰 Too amped / anxious</Text>
              <Text style={styles.secondaryText}>Need to calm down</Text>
            </Pressable>
            {pcArousal && (
              <Pressable style={[styles.startBtn, { backgroundColor: '#00BFA5' }]} onPress={() => setPcStep(2)}>
                <Text style={styles.startBtnText}>Get my routine</Text>
              </Pressable>
            )}
          </>
        )}

        {pcStep === 2 && pcArousal === 'too-low' && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>⬆️ Activation Routine</Text>
            <Text style={styles.detailText}>1. Put on high-energy music</Text>
            <Text style={styles.detailText}>2. Dynamic stretching / movement drills</Text>
            <Text style={styles.detailText}>3. Power poses — stand tall, hands on hips</Text>
            <Text style={styles.detailText}>4. Visualization: See yourself performing at your best</Text>
            <Text style={styles.detailText}>5. Positive self-talk: "I'm ready. I've trained for this."</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: '#00BFA5', marginTop: 16 }]} onPress={() => { router.back(); router.push('/(modals)/activity?id=breathing'); }}>
              <Text style={styles.startBtnText}>🌬️ Energy Breathing</Text>
            </Pressable>
          </View>
        )}

        {pcStep === 2 && pcArousal === 'optimal' && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>✅ Stay in Your Zone</Text>
            <Text style={styles.detailText}>You're in a good place. Maintain it:</Text>
            <Text style={styles.detailText}>• Stick to your pre-game routine</Text>
            <Text style={styles.detailText}>• Stay present — focus on process, not outcome</Text>
            <Text style={styles.detailText}>• Trust your preparation</Text>
            <Text style={styles.detailText}>• One play at a time</Text>
            <Text style={[styles.detailText, { marginTop: 12, fontWeight: '600' }]}>"I've done the work. Now I execute."</Text>
          </View>
        )}

        {pcStep === 2 && pcArousal === 'too-high' && (
          <View style={styles.card}>
            <Text style={styles.detailLabel}>⬇️ Calming Routine</Text>
            <Text style={styles.detailText}>1. Slow, deep breathing (4 in, 6 out)</Text>
            <Text style={styles.detailText}>2. Progressive muscle relaxation</Text>
            <Text style={styles.detailText}>3. Grounding: 5 things you can see, 4 you can hear...</Text>
            <Text style={styles.detailText}>4. Reframe: "These nerves mean I care. I'm ready."</Text>
            <Text style={styles.detailText}>5. Focus on controllables only</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: '#00BFA5', marginTop: 16 }]} onPress={() => { router.back(); router.push('/(modals)/activity?id=breathing'); }}>
              <Text style={styles.startBtnText}>🌬️ Calming Breath</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ============================================
  // SPECTRUM MODE ACTIVITIES
  // ============================================

  // ----- SENSORY CHECK (Spectrum Mode) -----
  const [scVisual, setScVisual] = useState<number>(3);
  const [scAuditory, setScAuditory] = useState<number>(3);
  const [scTactile, setScTactile] = useState<number>(3);
  const [scOlfactory, setScOlfactory] = useState<number>(3);
  const [scProprioceptive, setScProprioceptive] = useState<number>(3);

  if (activity.id === 'sensory-check') {
    const sensorySuggestions = () => {
      const suggestions: string[] = [];
      if (scVisual <= 2) suggestions.push('🕶️ Dim lights or wear sunglasses');
      if (scVisual >= 4) suggestions.push('💡 Add more light or visual interest');
      if (scAuditory <= 2) suggestions.push('🎧 Use noise-canceling headphones or earplugs');
      if (scAuditory >= 4) suggestions.push('🎵 Add background music or white noise');
      if (scTactile <= 2) suggestions.push('👕 Change to softer clothes or remove tags');
      if (scTactile >= 4) suggestions.push('🤗 Try deep pressure (weighted blanket, tight hug)');
      if (scOlfactory <= 2) suggestions.push('🌿 Move to a neutral-smelling space');
      if (scOlfactory >= 4) suggestions.push('🕯️ Add a calming scent you like');
      if (scProprioceptive <= 2) suggestions.push('🧘 Do some stretching or heavy work (push-ups, carrying something)');
      return suggestions.length > 0 ? suggestions : ['✅ Your sensory environment looks balanced!'];
    };

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>👁️ Sensory Check</Text>
        <Text style={styles.sub}>Rate each sense: 1 = overwhelmed, 3 = okay, 5 = understimulated</Text>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>👁️ Visual (light, screens, movement)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, scVisual === n && styles.ratingBtnSelected]} onPress={() => setScVisual(n)}>
                <Text style={[styles.ratingBtnText, scVisual === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>👂 Sound (noise level, types of sounds)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, scAuditory === n && styles.ratingBtnSelected]} onPress={() => setScAuditory(n)}>
                <Text style={[styles.ratingBtnText, scAuditory === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>✋ Touch (clothes, textures, temperature)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, scTactile === n && styles.ratingBtnSelected]} onPress={() => setScTactile(n)}>
                <Text style={[styles.ratingBtnText, scTactile === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>👃 Smell (scents in the environment)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, scOlfactory === n && styles.ratingBtnSelected]} onPress={() => setScOlfactory(n)}>
                <Text style={[styles.ratingBtnText, scOlfactory === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.detailLabel}>🏃 Body Awareness (need to move/be still)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} style={[styles.ratingBtn, scProprioceptive === n && styles.ratingBtnSelected]} onPress={() => setScProprioceptive(n)}>
                <Text style={[styles.ratingBtnText, scProprioceptive === n && styles.ratingBtnTextSelected]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#64B5F6' }]}>
          <Text style={[styles.detailLabel, { color: '#64B5F6' }]}>Suggestions</Text>
          {sensorySuggestions().map((s, i) => (
            <Text key={i} style={styles.detailText}>{s}</Text>
          ))}
        </View>

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- STIM TOOLKIT (Spectrum Mode) -----
  if (activity.id === 'stim-toolkit') {
    const stimCategories = [
      {
        name: 'Calming',
        emoji: '😌',
        stims: [
          { name: 'Deep pressure (weighted blanket)', icon: '🛏️' },
          { name: 'Slow rocking', icon: '🪑' },
          { name: 'Soft humming', icon: '🎵' },
          { name: 'Hand over heart', icon: '💚' },
          { name: 'Gentle self-hug', icon: '🤗' },
        ],
      },
      {
        name: 'Alerting',
        emoji: '⚡',
        stims: [
          { name: 'Cold water on face', icon: '💧' },
          { name: 'Crunchy snacks', icon: '🥨' },
          { name: 'Fast pacing', icon: '🚶' },
          { name: 'Jumping jacks', icon: '🏃' },
          { name: 'Sour candy', icon: '🍬' },
        ],
      },
      {
        name: 'Fidgeting',
        emoji: '🌀',
        stims: [
          { name: 'Fidget cube/spinner', icon: '🎲' },
          { name: 'Hair twirling', icon: '💇' },
          { name: 'Pen clicking', icon: '🖊️' },
          { name: 'Rubber band snapping', icon: '🎯' },
          { name: 'Tapping fingers', icon: '👆' },
        ],
      },
      {
        name: 'Proprioceptive',
        emoji: '💪',
        stims: [
          { name: 'Wall pushups', icon: '🧱' },
          { name: 'Carry heavy items', icon: '📦' },
          { name: 'Tight squeeze', icon: '🤝' },
          { name: 'Stomping feet', icon: '🦶' },
          { name: 'Chewing gum', icon: '🍬' },
        ],
      },
    ];

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>🌀 Stim Toolkit</Text>
        <Text style={styles.sub}>Stimming helps regulate your nervous system. Pick what you need right now.</Text>

        {stimCategories.map((cat) => (
          <View key={cat.name} style={styles.card}>
            <Text style={styles.detailLabel}>{cat.emoji} {cat.name}</Text>
            {cat.stims.map((stim) => (
              <View key={stim.name} style={styles.stimItem}>
                <Text style={styles.stimItemText}>{stim.icon} {stim.name}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: '#64B5F620' }]}>
          <Text style={styles.detailText}>💡 Remember: Stimming is self-regulation, not a problem. If a stim helps you, use it.</Text>
        </View>

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- EMOTION CARDS (Spectrum Mode) -----
  const EMOTION_CARDS = [
    { emoji: '😊', name: 'Happy', color: '#66BB6A', body: 'Light, energetic, smiling' },
    { emoji: '😢', name: 'Sad', color: '#64B5F6', body: 'Heavy, slow, want to cry' },
    { emoji: '😤', name: 'Angry', color: '#EF5350', body: 'Hot, tense, clenched' },
    { emoji: '😰', name: 'Anxious', color: '#FFA726', body: 'Tight chest, racing thoughts, restless' },
    { emoji: '😴', name: 'Tired', color: '#9E9E9E', body: 'Heavy, slow, hard to focus' },
    { emoji: '😐', name: 'Numb', color: '#78909C', body: 'Nothing, disconnected, blank' },
    { emoji: '🤯', name: 'Overwhelmed', color: '#AB47BC', body: 'Too much, can\'t think, frozen' },
    { emoji: '😌', name: 'Calm', color: '#26A69A', body: 'Relaxed, breathing easy, peaceful' },
    { emoji: '🤔', name: 'Confused', color: '#FFCA28', body: 'Uncertain, foggy, questioning' },
    { emoji: '😤', name: 'Frustrated', color: '#FF7043', body: 'Stuck, tense, want to give up' },
    { emoji: '🥰', name: 'Loved', color: '#EC407A', body: 'Warm, connected, safe' },
    { emoji: '😔', name: 'Lonely', color: '#5C6BC0', body: 'Empty, disconnected, longing' },
  ];

  if (activity.id === 'emotion-cards') {
    const [selectedCard, setSelectedCard] = useState<typeof EMOTION_CARDS[0] | null>(null);

    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>🎴 Emotion Cards</Text>
        <Text style={styles.sub}>Tap the picture that matches how you feel right now.</Text>

        <View style={styles.emotionCardsGrid}>
          {EMOTION_CARDS.map((card) => (
            <Pressable
              key={card.name}
              style={[
                styles.emotionCardItem,
                { backgroundColor: card.color + '30', borderColor: selectedCard?.name === card.name ? card.color : 'transparent' },
              ]}
              onPress={() => setSelectedCard(selectedCard?.name === card.name ? null : card)}
            >
              <Text style={styles.emotionCardEmoji}>{card.emoji}</Text>
              <Text style={styles.emotionCardName}>{card.name}</Text>
            </Pressable>
          ))}
        </View>

        {selectedCard && (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: selectedCard.color }]}>
            <Text style={styles.detailLabel}>You selected: {selectedCard.name}</Text>
            <Text style={styles.detailText}>This might feel like: {selectedCard.body}</Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: '#64B5F6', marginTop: 12 }]}
              onPress={() => { addJournalEntry(`I'm feeling ${selectedCard.name}. ${selectedCard.body}`); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Saved', 'Added to journal.'); }}
            >
              <Text style={styles.startBtnText}>Save to journal</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ----- PLACEHOLDER -----
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>
      <Text style={styles.title}>{activity.emoji} {activity.title}</Text>
      <Text style={styles.placeholder}>Coming soon.</Text>
      <Pressable style={styles.doneBtn} onPress={() => router.back()}>
        <Text style={styles.doneBtnText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24 },
  scrollContent: { paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  sub: { fontSize: 16, color: COLORS.textMuted, marginBottom: 24 },
  error: { fontSize: 16, color: COLORS.textMuted },
  placeholder: { fontSize: 16, color: COLORS.textMuted },
  startBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 16,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9 },
  startBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  doneBtn: { alignSelf: 'center', marginTop: 24, paddingVertical: 12 },
  doneBtnText: { fontSize: 16, color: COLORS.accent, fontWeight: '600' },
  circleWrap: { alignSelf: 'center', marginTop: 40, alignItems: 'center', justifyContent: 'center' },
  circle: { backgroundColor: COLORS.accent, opacity: 0.6 },
  phaseLabel: { fontSize: 22, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginTop: 32 },
  stopBtn: { alignSelf: 'center', marginTop: 24, paddingVertical: 12, paddingHorizontal: 24 },
  stopBtnText: { fontSize: 16, color: COLORS.textMuted },
  wheelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  wheelSegment: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelEmoji: { fontSize: 32, marginBottom: 4 },
  wheelLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  emotionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
  },
  emotionChipText: { fontSize: 15, fontWeight: '500' },
  card: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  detailEmotionName: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginTop: 12, marginBottom: 4 },
  detailText: { fontSize: 16, color: COLORS.text, lineHeight: 22 },
  strikethrough: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  reframeText: { textDecorationLine: 'none', color: COLORS.accent, fontWeight: '500' },
  thoughtInput: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  tcMessage: { fontSize: 16, color: COLORS.text, lineHeight: 24, marginBottom: 12 },
  tcActions: { marginTop: 12 },
  tcSmallBtn: { paddingVertical: 12, alignItems: 'center' },
  tcSmallBtnText: { fontSize: 16, color: COLORS.accent, fontWeight: '500' },
  bodyScanList: { flex: 1, maxHeight: 220 },
  bodyScanListContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 8 },
  bodyZoneBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    backgroundColor: COLORS.inputSurface,
  },
  bodyZoneBtnSelected: { backgroundColor: COLORS.accent + '4D', borderWidth: 2, borderColor: COLORS.accent },
  bodyZoneLabel: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  talkAboutItBtn: { marginTop: 16, paddingVertical: 12, alignItems: 'center' },
  talkAboutItText: { fontSize: 16, color: COLORS.accent, fontWeight: '600' },
  bodyScanActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: BORDER_RADIUS.input, alignItems: 'center', backgroundColor: COLORS.surface },
  clearBtnText: { fontSize: 16, color: COLORS.textMuted },
  emProgress: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  emScenarioCard: { alignItems: 'center', justifyContent: 'center', minHeight: 80 },
  emScenarioText: { fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 26 },
  emGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  emEmotionCard: {
    width: '47%',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emEmotionCardSelected: { borderColor: COLORS.accent },
  emEmotionEmoji: { fontSize: 28, marginBottom: 6 },
  emEmotionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  gratitudeJar: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gratitudeDot: { position: 'absolute' },
  gratitudeJarCount: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16, textAlign: 'center' },
  gratitudeEntryRow: { flexDirection: 'column', gap: 4 },
  secondaryText: { fontSize: 13, color: COLORS.textSecondary },
  thermoWrap: { width: 56, alignSelf: 'center', marginVertical: 16, position: 'relative' },
  thermoTrack: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: COLORS.surface, borderRadius: 28 },
  thermoFill: { position: 'absolute', left: 4, right: 4, bottom: 0, borderRadius: 24 },
  thermoNumbers: { position: 'absolute', right: -32, top: 0, bottom: 0, justifyContent: 'space-between' },
  thermoNumBtn: { padding: 4 },
  thermoNumText: { fontSize: 14, color: COLORS.textMuted },
  thermoNumTextSelected: { color: COLORS.text, fontWeight: '700' },
  thermoActionBtn: { paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.inputSurface, borderRadius: BORDER_RADIUS.input, marginBottom: 8 },
  thermoActionText: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  cbDots: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  cbDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.surface },
  cbDotActive: { backgroundColor: COLORS.accent },
  cbStatementCard: { borderWidth: 2, borderColor: COLORS.accent },
  cbStatementText: { fontSize: 17, color: COLORS.text, lineHeight: 26, fontWeight: '500' },
  mpMonthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  mpMonthTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  mpWeekRow: { flexDirection: 'row', marginBottom: 6 },
  mpWeekLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: COLORS.textMuted },
  mpGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  mpCellEmpty: { width: '14.28%', aspectRatio: 1, padding: 2 },
  mpCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  mpCellToday: { borderWidth: 2, borderColor: COLORS.accent, borderRadius: 6 },
  mpCellText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  // Athlete & Spectrum mode activity styles
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  ratingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnSelected: { backgroundColor: COLORS.accent },
  ratingBtnText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
  ratingBtnTextSelected: { color: COLORS.text },
  stimItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surface,
  },
  stimItemText: { fontSize: 16, color: COLORS.text },
  emotionCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  emotionCardItem: {
    width: '30%',
    minWidth: 90,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  emotionCardEmoji: { fontSize: 36, marginBottom: 4 },
  emotionCardName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
});
