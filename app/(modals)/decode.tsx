/**
 * Decode — Paste or screenshot a conversation → Analysis → Intent → Suggested response with Copy.
 * Supports Circle "Who is this with?" and personalized prompts; uses GPT-4o vision for screenshots.
 */
import { useState, useEffect } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { sendMessageWithSystemPrompt, sendDecodeWithOptionalImage } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { getPersonality } from '../../src/services/personology';
import type { CircleMember } from '../../src/stores/circleStore';

const BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const ACCENT = '#7C4DFF';
const AI_HEADER = '#7C4DFF';
const AI_BODY = '#E0E0E0';
const LOADING_TEXT = '#8888A0';

const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  friend: 'Friend',
  partner: 'Partner',
  mentor: 'Mentor',
  other: 'Other',
};

function buildDecodeAnalysisSystem(opts: {
  hasScreenshot: boolean;
  personName: string | null;
  relationshipContext: string;
}): string {
  const { hasScreenshot, personName, relationshipContext } = opts;
  const nameInstruction = personName
    ? `Refer to this person by name (e.g. "Based on what you've shared about ${personName}…", "Given ${personName}'s personality…").`
    : '';

  const screenshotBlock = hasScreenshot
    ? `This is an iPhone text conversation screenshot. Blue bubbles on the right = the user (your user) sent those messages. Gray bubbles on the left = the other person sent those. Analyze the screenshot accordingly.`
    : '';

  return `You are Psych in AllN1 Psych "Decode" mode. The user shared ${hasScreenshot ? 'a screenshot of a text conversation' : 'a message someone sent them'}. Analyze it.

${screenshotBlock}

${relationshipContext ? `RELATIONSHIP CONTEXT (use this to personalize your analysis):\n${relationshipContext}` : ''}

${nameInstruction}

Respond with these sections (use ALL CAPS for section headers):

WHAT THEY'RE SAYING — Literally: what are the surface words and ask?
WHAT THEY MIGHT MEAN — Subtext, tone, what might be going on for them.
WHAT THEY WANT FROM YOU — What are they asking for (time, reassurance, a response, space)?
RED FLAGS — If anything feels manipulative, guilt-trippy, or off; otherwise say "Nothing obvious."

Be direct, warm, and concise. 2-4 sentences per section.`;
}

function buildDecodeRespondSystem(personName: string | null, personalityLine: string): string {
  const nameBlock = personName
    ? `Refer to the other person by name in your response (e.g. "Given ${personName}'s personality…", "This works well with ${personName} because…", "Based on what you've shared about ${personName}…").`
    : '';
  return `You are Psych. The user received a message, saw your analysis, and chose an intent. Now give them a response guide.
${personalityLine ? `\nPERSON CONTEXT: ${personalityLine}\n` : ''}
${nameBlock}

Include these sections (ALL CAPS headers):

SUGGESTED RESPONSE — One concrete reply they could send (or adapt). Put the exact text in a clear block.
WHY THIS WORKS — One short sentence on why this response fits their intent and the situation.
AN ALTERNATIVE — One other option (e.g. shorter, or more boundary-setting) if they want something different.
THE WAIT OPTION — When it might be better to not reply yet, and what to do instead.

Be specific to their message and chosen intent. Keep suggested response copy-paste ready.`;
}

type Phase = 'paste' | 'analysis' | 'intent' | 'respond';
type InputTab = 'paste' | 'screenshot';

const ANALYSIS_HEADERS = ["WHAT THEY'RE SAYING", 'WHAT THEY MIGHT MEAN', 'WHAT THEY WANT FROM YOU', 'RED FLAGS'];
const RESPOND_HEADERS = ['SUGGESTED RESPONSE', 'WHY THIS WORKS', 'AN ALTERNATIVE', 'THE WAIT OPTION'];

const INTENT_OPTIONS = [
  { id: 'reconnect', title: 'Reconnect', desc: 'I want to open the door and rebuild' },
  { id: 'address', title: 'Address it', desc: 'I need to acknowledge what happened first' },
  { id: 'not_ready', title: 'Not ready', desc: 'I need more time before responding' },
] as const;

function sectionedText(text: string, headers: string[]) {
  const parts: { bold: boolean; content: string }[] = [];
  let remaining = text;
  for (const h of headers) {
    const i = remaining.search(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    if (i === -1) continue;
    if (i > 0) parts.push({ bold: false, content: remaining.slice(0, i).trim() });
    const end = remaining.indexOf('\n\n', i) !== -1 ? remaining.indexOf('\n\n', i) : remaining.indexOf('\n', i) !== -1 ? remaining.indexOf('\n', i) : remaining.length;
    parts.push({ bold: true, content: remaining.slice(i, end).trim() });
    remaining = remaining.slice(end).trimStart();
  }
  if (remaining.trim()) parts.push({ bold: false, content: remaining.trim() });
  if (parts.length === 0) parts.push({ bold: false, content: text });
  return parts;
}

type WhoWith = { type: 'circle'; member: CircleMember } | { type: 'someone_new'; name: string; birthday: string };

function buildRelationshipContext(who: WhoWith | null): string {
  if (!who) return '';
  if (who.type === 'someone_new') {
    const parts = [`Name: ${who.name}`];
    if (who.birthday.trim()) {
      const p = getPersonality(who.birthday.trim());
      if (p) parts.push(`Personality type (from birthday): ${p.name}. Communication: ${p.communicationStyle}. Needs in relationships: ${p.needsInRelationships}.`);
    }
    return parts.join('\n');
  }
  const m = who.member;
  const parts = [
    `Name: ${m.name}`,
    `Relationship: ${RELATIONSHIP_LABELS[m.relationship] ?? m.relationship}`,
    `Temperature: ${m.temperatureLabel}`,
  ];
  const bday = m.birthday;
  if (bday) {
    const p = getPersonality(bday);
    if (p) parts.push(`Personality type: ${p.name}. Communication: ${p.communicationStyle}. Needs: ${p.needsInRelationships}.`);
  }
  return parts.join('\n');
}

function getPersonDisplayName(who: WhoWith | null): string | null {
  if (!who) return null;
  return who.type === 'circle' ? who.member.name : who.name;
}

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const members = useCircleStore((s) => s.members);

  const [phase, setPhase] = useState<Phase>('paste');
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [message, setMessage] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [whoWith, setWhoWith] = useState<WhoWith | null>(null);
  const [whoDropdownOpen, setWhoDropdownOpen] = useState(false);
  const [someoneNewName, setSomeoneNewName] = useState('');
  const [someoneNewBirthday, setSomeoneNewBirthday] = useState('');
  const [context, setContext] = useState('');
  const [analysisResponse, setAnalysisResponse] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('');
  const [respondResponse, setRespondResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setToast('Photo library access is needed to pick a screenshot.');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setScreenshotUri(asset.uri);
    setScreenshotBase64(asset.base64 ?? null);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopiedId(id);
      setToast('Copied!');
      setTimeout(() => {
        setCopiedId(null);
        setToast('');
      }, 2000);
    } catch {
      setToast('Could not copy');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const canDecode = inputTab === 'paste' ? message.trim().length >= 3 : Boolean(screenshotUri);

  const onDecode = async () => {
    if (!canDecode || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      const personName = getPersonDisplayName(whoWith);
      const relationshipContext = buildRelationshipContext(whoWith);
      const hasScreenshot = inputTab === 'screenshot' && screenshotBase64;
      const systemPrompt = buildDecodeAnalysisSystem({
        hasScreenshot: Boolean(hasScreenshot),
        personName,
        relationshipContext,
      });
      const userText = [
        inputTab === 'screenshot' ? 'Screenshot of the conversation (see image).' : `Message:\n${message}`,
        `Who this is with: ${personName ?? 'not specified'}`,
        context.trim() ? `Context: ${context}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await sendDecodeWithOptionalImage(
        systemPrompt,
        userText,
        hasScreenshot ? screenshotBase64 ?? undefined : undefined
      );
      setAnalysisResponse(response?.trim() ?? '');
      setPhase('analysis');
    } catch (e) {
      if (__DEV__) console.warn('Decode analysis error:', e);
      setAnalysisResponse("I couldn't analyze that right now. Try again in a moment.");
      setPhase('analysis');
    } finally {
      setLoading(false);
    }
  };

  const onHowToRespond = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('intent');
  };

  const onSelectIntent = async (intent: (typeof INTENT_OPTIONS)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIntent(intent.id);
    setLoading(true);
    try {
      const personName = getPersonDisplayName(whoWith);
      const relationshipContext = buildRelationshipContext(whoWith);
      const personalityLine = relationshipContext ? relationshipContext.split('\n').slice(0, 4).join('; ') : '';
      const respondSystem = buildDecodeRespondSystem(personName, personalityLine);
      const userContent = `Message:\n${message}\n\nWho this is with: ${personName ?? 'unknown'}\nContext: ${context}\n\nAnalysis:\n${analysisResponse}\n\nUser's intent: ${intent.title} — ${intent.desc}`;
      const response = await sendMessageWithSystemPrompt([{ role: 'user', content: userContent }], respondSystem);
      setRespondResponse(response?.trim() ?? '');
      setPhase('respond');
    } catch (e) {
      if (__DEV__) console.warn('Decode respond error:', e);
      setRespondResponse("I couldn't generate a response right now. Try again in a moment.");
      setPhase('respond');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 'paste') {
      router.back();
      return;
    }
    const order: Phase[] = ['paste', 'analysis', 'intent', 'respond'];
    const idx = order.indexOf(phase);
    if (idx > 0) setPhase(order[idx - 1]);
    else router.back();
  };

  const renderAnalysisContent = () => {
    const parts = sectionedText(analysisResponse, ANALYSIS_HEADERS);
    return (
      <View style={styles.responseCard}>
        {parts.map((p, i) => (
          <Text key={i} style={p.bold ? styles.sectionHeader : styles.aiBody}>
            {p.content}
            {p.bold && '\n'}
          </Text>
        ))}
      </View>
    );
  };

  const renderRespondContent = () => {
    const parts = sectionedText(respondResponse, RESPOND_HEADERS);
    let suggestedText = '';
    const block = respondResponse.match(/SUGGESTED RESPONSE[:\s]*([\s\S]*?)(?=WHY THIS|$)/i);
    if (block?.[1]) suggestedText = block[1].trim();

    return (
      <View style={styles.responseCard}>
        {parts.map((p, i) => (
          <View key={i}>
            <Text style={p.bold ? styles.sectionHeader : styles.aiBody}>
              {p.content}
              {p.bold && '\n'}
            </Text>
            {p.bold && p.content.toUpperCase().includes('SUGGESTED RESPONSE') && suggestedText ? (
              <Pressable style={styles.copyBtn} onPress={() => copyToClipboard(suggestedText, 'suggested')}>
                <Text style={styles.copyBtnText}>{copiedId === 'suggested' ? 'Copied!' : 'Copy response'}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {toast ? <Text style={styles.toast}>{toast}</Text> : null}
      </View>
    );
  };

  const whoLabel = whoWith
    ? whoWith.type === 'circle'
      ? `${whoWith.member.name} (${RELATIONSHIP_LABELS[whoWith.member.relationship] ?? whoWith.member.relationship})`
      : whoWith.name || 'Someone new'
    : 'Select…';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Decode</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {phase === 'paste' && (
          <>
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, inputTab === 'paste' && styles.tabActive]}
                onPress={() => { setInputTab('paste'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={[styles.tabText, inputTab === 'paste' && styles.tabTextActive]}>Paste Text</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, inputTab === 'screenshot' && styles.tabActive]}
                onPress={() => { setInputTab('screenshot'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Ionicons name="camera" size={18} color={inputTab === 'screenshot' ? BG : TEXT_SECONDARY} />
                <Text style={[styles.tabText, inputTab === 'screenshot' && styles.tabTextActive]}>Screenshot</Text>
              </Pressable>
            </View>

            {inputTab === 'paste' && (
              <>
                <Text style={styles.prompt}>Paste what they sent you.</Text>
                <TextInput
                  style={[styles.largeInput, { minHeight: 120 }]}
                  placeholder="Paste their message here..."
                  placeholderTextColor={TEXT_SECONDARY}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                />
              </>
            )}

            {inputTab === 'screenshot' && (
              <>
                <Text style={styles.prompt}>Upload a screenshot of the conversation.</Text>
                <Pressable style={styles.uploadBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={28} color={ACCENT} />
                  <Text style={styles.uploadBtnText}>Upload Screenshot</Text>
                </Pressable>
                {screenshotUri ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: screenshotUri }} style={styles.previewImg} resizeMode="contain" />
                    <Pressable style={styles.removePreview} onPress={() => { setScreenshotUri(null); setScreenshotBase64(null); }}>
                      <Text style={styles.removePreviewText}>Remove</Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            )}

            <Text style={styles.label}>Who is this conversation with?</Text>
            <Pressable style={styles.dropdown} onPress={() => setWhoDropdownOpen(true)}>
              <Text style={styles.dropdownText}>{whoLabel}</Text>
              <Ionicons name="chevron-down" size={20} color={TEXT_SECONDARY} />
            </Pressable>

            <Modal visible={whoDropdownOpen} transparent animationType="fade">
              <Pressable style={styles.modalOverlay} onPress={() => setWhoDropdownOpen(false)}>
                <View style={styles.modalContent}>
                  <ScrollView style={styles.modalScroll}>
                    {members.map((m) => (
                      <Pressable
                        key={m.id}
                        style={styles.modalOption}
                        onPress={() => {
                          setWhoWith({ type: 'circle', member: m });
                          setWhoDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{m.name}</Text>
                        <Text style={styles.modalOptionSub}>{RELATIONSHIP_LABELS[m.relationship] ?? m.relationship}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      style={styles.modalOption}
                      onPress={() => {
                        setWhoWith({ type: 'someone_new', name: '', birthday: '' });
                        setSomeoneNewName('');
                        setSomeoneNewBirthday('');
                        setWhoDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>Someone new</Text>
                      <Text style={styles.modalOptionSub}>Add name & optional birthday</Text>
                    </Pressable>
                  </ScrollView>
                  <Pressable style={styles.modalDone} onPress={() => setWhoDropdownOpen(false)}>
                    <Text style={styles.modalDoneText}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>

            {whoWith?.type === 'someone_new' && (
              <View style={styles.someoneNewRow}>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Name"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={someoneNewName}
                  onChangeText={(t) => {
                    setSomeoneNewName(t);
                    setWhoWith({ type: 'someone_new', name: t, birthday: someoneNewBirthday });
                  }}
                />
                <TextInput
                  style={styles.smallInput}
                  placeholder="Birthday (optional) e.g. 1990-03-15"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={someoneNewBirthday}
                  onChangeText={(t) => {
                    setSomeoneNewBirthday(t);
                    setWhoWith({ type: 'someone_new', name: someoneNewName, birthday: t });
                  }}
                />
              </View>
            )}

            <TextInput
              style={styles.smallInput}
              placeholder="Quick context (e.g. we haven't talked in 3 months...)"
              placeholderTextColor={TEXT_SECONDARY}
              value={context}
              onChangeText={setContext}
            />

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text style={styles.loadingText}>Psych is thinking...</Text>
              </View>
            ) : (
              <Pressable style={[styles.primaryBtn, (!canDecode || loading) && styles.primaryBtnDisabled]} onPress={onDecode} disabled={!canDecode || loading}>
                <Text style={styles.primaryBtnText}>Decode</Text>
              </Pressable>
            )}
          </>
        )}

        {phase === 'analysis' && (
          <>
            {analysisResponse ? renderAnalysisContent() : null}
            {analysisResponse && !loading ? (
              <Pressable style={styles.primaryBtn} onPress={onHowToRespond}>
                <Text style={styles.primaryBtnText}>How should I respond?</Text>
              </Pressable>
            ) : null}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text style={styles.loadingText}>Psych is thinking...</Text>
              </View>
            ) : null}
          </>
        )}

        {phase === 'intent' && (
          <>
            <Text style={styles.prompt}>What do you want from this?</Text>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text style={styles.loadingText}>Psych is thinking...</Text>
              </View>
            ) : (
              <>
                {INTENT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[styles.intentCard, selectedIntent === opt.id && styles.intentCardSelected]}
                    onPress={() => onSelectIntent(opt)}
                  >
                    <Text style={styles.intentTitle}>{opt.title}</Text>
                    <Text style={styles.intentDesc}>{opt.desc}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </>
        )}

        {phase === 'respond' && (
          <>
            {respondResponse ? renderRespondContent() : null}
            {respondResponse ? (
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
              >
                <Text style={styles.primaryBtnText}>Done</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
      {toast ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  tabRow: { flexDirection: 'row', marginBottom: 16, backgroundColor: CARD_BG, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: CARD_BORDER },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: ACCENT },
  tabText: { fontSize: 15, color: TEXT_SECONDARY },
  tabTextActive: { color: BG, fontWeight: '600' },
  prompt: { fontSize: 18, fontWeight: '500', color: TEXT_PRIMARY, marginBottom: 16 },
  label: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 8 },
  largeInput: { backgroundColor: CARD_BG, color: TEXT_PRIMARY, fontSize: 16, minHeight: 120, padding: 14, borderRadius: 12, marginBottom: 12, textAlignVertical: 'top', borderWidth: 1, borderColor: CARD_BORDER },
  smallInput: { backgroundColor: CARD_BG, color: TEXT_PRIMARY, fontSize: 16, padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER },
  someoneNewRow: { marginBottom: 0 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: CARD_BG, paddingVertical: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER, borderStyle: 'dashed' },
  uploadBtnText: { fontSize: 16, color: ACCENT, fontWeight: '600' },
  previewWrap: { marginBottom: 16 },
  previewImg: { width: '100%', height: 220, borderRadius: 12, backgroundColor: CARD_BG },
  removePreview: { marginTop: 8, alignSelf: 'flex-start' },
  removePreviewText: { fontSize: 15, color: TEXT_SECONDARY },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD_BG, padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER },
  dropdownText: { fontSize: 16, color: TEXT_PRIMARY },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: CARD_BG, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  modalScroll: { maxHeight: 320 },
  modalOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: CARD_BORDER },
  modalOptionText: { fontSize: 16, color: TEXT_PRIMARY, fontWeight: '500' },
  modalOptionSub: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 2 },
  modalDone: { padding: 16, alignItems: 'center' },
  modalDoneText: { fontSize: 17, fontWeight: '600', color: ACCENT },
  primaryBtn: { backgroundColor: ACCENT, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  responseCard: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 14, padding: 16, marginBottom: 20 },
  sectionHeader: { fontWeight: '700', color: AI_HEADER, fontSize: 15, marginBottom: 4 },
  aiBody: { color: AI_BODY, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  loadingText: { fontSize: 15, color: LOADING_TEXT, marginTop: 8 },
  intentCard: { backgroundColor: CARD_BG, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: 12 },
  intentCardSelected: { borderColor: ACCENT, backgroundColor: 'rgba(124,77,255,0.1)' },
  intentTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 4 },
  intentDesc: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22 },
  copyBtn: { marginTop: 8, marginBottom: 12 },
  copyBtnText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  toast: { fontSize: 13, color: ACCENT, marginTop: 4 },
  toastWrap: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: CARD_BG, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  toastText: { color: ACCENT, fontSize: 14 },
});
