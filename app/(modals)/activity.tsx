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
import { getOpenAIKey } from '../../src/services/ai';

type BreathPhase = 'inhale' | 'hold' | 'exhale';
const BOX_BREATH = { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 };

const THOUGHT_CHALLENGER_SYSTEM = `You are a cognitive behavioral thought challenger inside AllN1 Psych. The user will share a negative or distressing thought. Your job:

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
  const apiKey = await getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: THOUGHT_CHALLENGER_SYSTEM }, ...messages],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';
  const parsed = JSON.parse(text) as { step: number; distortion?: string; message: string; reframe?: string; action?: string };
  return parsed;
}

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
        Alert.alert('Error', 'Could not connect. Check your API key in Settings.');
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
        Alert.alert('Error', 'Something went wrong.');
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
              <Text style={styles.detailLabel}>That sounds like...</Text>
              <Text style={styles.detailText}>{r.distortion}</Text>
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
});
