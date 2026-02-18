/**
 * Decode — Paste their message OR add a screenshot → Analysis → Intent → Suggested response with Copy.
 * Now with screenshot support using GPT-4o Vision!
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
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
// NOTE: Run `npx expo install expo-image-picker` if not already installed
import * as ImagePicker from 'expo-image-picker';
import { sendMessageWithSystemPrompt, analyzeImageWithVision } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { buildRelationshipContext } from '../../src/services/personology';

const BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const ACCENT = '#7C4DFF';
const AI_HEADER = '#7C4DFF';
const AI_BODY = '#E0E0E0';
const LOADING_TEXT = '#8888A0';

const DECODE_ANALYSIS_SYSTEM = `You are Psych in AllN1 Psych "Decode" mode. The user pasted a message someone sent them. Analyze it.

Respond with these sections (use ALL CAPS for section headers):

WHAT THEY'RE SAYING — Literally: what are the surface words and ask?
WHAT THEY MIGHT MEAN — Subtext, tone, what might be going on for them.
WHAT THEY WANT FROM YOU — What are they asking for (time, reassurance, a response, space)?
RED FLAGS — If anything feels manipulative, guilt-trippy, or off; otherwise say "Nothing obvious."

Be direct, warm, and concise. 2-4 sentences per section.`;

const DECODE_SCREENSHOT_SYSTEM = `You are Psych in AllN1 Psych "Decode" mode. The user shared a screenshot of a message conversation. 

First, read and transcribe the key messages from the screenshot. Then analyze them.

Respond with these sections (use ALL CAPS for section headers):

WHAT I SEE — Briefly describe the messages visible in the screenshot.
WHAT THEY'RE SAYING — Literally: what are the surface words and ask?
WHAT THEY MIGHT MEAN — Subtext, tone, what might be going on for them.
WHAT THEY WANT FROM YOU — What are they asking for (time, reassurance, a response, space)?
RED FLAGS — If anything feels manipulative, guilt-trippy, or off; otherwise say "Nothing obvious."

Be direct, warm, and concise. 2-4 sentences per section.`;

const DECODE_RESPOND_SYSTEM = `You are Psych. The user received a message, saw your analysis, and chose an intent. Now give them a response guide.

Include these sections (ALL CAPS headers):

SUGGESTED RESPONSE — One concrete reply they could send (or adapt). Put the exact text in a clear block.
WHY THIS WORKS — One short sentence on why this response fits their intent and the situation.
AN ALTERNATIVE — One other option (e.g. shorter, or more boundary-setting) if they want something different.
THE WAIT OPTION — When it might be better to not reply yet, and what to do instead.

Be specific to their message and chosen intent. Keep suggested response copy-paste ready.`;

type Phase = 'paste' | 'analysis' | 'intent' | 'respond';

const ANALYSIS_HEADERS = ['WHAT I SEE', "WHAT THEY'RE SAYING", 'WHAT THEY MIGHT MEAN', 'WHAT THEY WANT FROM YOU', 'RED FLAGS'];
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

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('paste');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [context, setContext] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('');
  const [respondResponse, setRespondResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(text);
      } else {
        (Clipboard as { setString?: (t: string) => void }).setString?.(text);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopiedId(id);
      setToast('Copied!');
      setTimeout(() => { setCopiedId(null); setToast(''); }, 2000);
    } catch (_) {
      setToast('Could not copy');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const buildDecodeRelationshipContext = () => {
    const userText = (message + ' ' + (sender || '')).toLowerCase();
    const circleMembers = useCircleStore.getState().members;
    const myBirthday = useUserStore.getState().birthday;
    let relationshipContext = '';
    circleMembers.forEach((member) => {
      if (member.birthday && myBirthday && userText.includes(member.name.toLowerCase())) {
        relationshipContext += buildRelationshipContext(myBirthday, member.birthday, member.name);
      }
    });
    return relationshipContext;
  };

  const pickScreenshot = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to add a screenshot.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setScreenshotUri(result.assets[0].uri);
      }
    } catch (e) {
      if (__DEV__) console.warn('Image picker error:', e);
      Alert.alert('Error', 'Could not open photo library');
    }
  };

  const removeScreenshot = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScreenshotUri(null);
  };

  const onDecode = async () => {
    const hasText = message.trim().length >= 3;
    const hasImage = !!screenshotUri;
    
    if (!hasText && !hasImage) return;
    if (loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    
    try {
      let response: string | undefined;

      if (hasImage) {
        // Use vision API for screenshot
        const base64 = await FileSystem.readAsStringAsync(screenshotUri!, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const contextText = [
          sender ? `Who sent this: ${sender}` : '',
          context ? `Context: ${context}` : '',
          message.trim() ? `Additional info: ${message}` : '',
        ].filter(Boolean).join('\n');
        
        const prompt = `Analyze this message screenshot.\n\n${contextText || 'No additional context provided.'}`;
        
        response = await analyzeImageWithVision(
          base64,
          prompt,
          DECODE_SCREENSHOT_SYSTEM + buildDecodeRelationshipContext()
        );
      } else {
        // Text-only analysis
        const userContent = `Message:\n${message}\n\nWho sent this: ${sender || 'not specified'}\nContext: ${context || 'none'}`;
        const fullPrompt = DECODE_ANALYSIS_SYSTEM + buildDecodeRelationshipContext();
        response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: userContent }],
          fullPrompt
        );
      }
      
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

  const onSelectIntent = async (intent: typeof INTENT_OPTIONS[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIntent(intent.id);
    setLoading(true);
    try {
      const msgSource = screenshotUri ? '[Screenshot attached]' : message;
      const userContent = `Message:\n${msgSource}\n\nSender: ${sender}\nContext: ${context}\n\nAnalysis:\n${analysisResponse}\n\nUser's intent: ${intent.title} — ${intent.desc}`;
      const fullPrompt = DECODE_RESPOND_SYSTEM + buildDecodeRelationshipContext();
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        fullPrompt
      );
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
        {screenshotUri && (
          <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} resizeMode="contain" />
        )}
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
    const suggestedBlock: string[] = [];
    let inBlock = false;
    respondResponse.split('\n').forEach((line) => {
      if (line.toUpperCase().startsWith('SUGGESTED RESPONSE') || line.toUpperCase().startsWith('WHY THIS')) inBlock = !inBlock;
      if (inBlock && line.trim() && !line.toUpperCase().startsWith('SUGGESTED RESPONSE')) suggestedBlock.push(line);
    });
    const suggestedText = suggestedBlock.length ? suggestedBlock.join('\n').trim() : (respondResponse.match(/SUGGESTED RESPONSE[:\s]*([\s\S]*?)(?=WHY THIS|$)/i)?.[1] ?? '').trim();

    return (
      <View style={styles.responseCard}>
        {parts.map((p, i) => (
          <View key={i}>
            <Text style={p.bold ? styles.sectionHeader : styles.aiBody}>
              {p.content}
              {p.bold && '\n'}
            </Text>
            {p.bold && p.content.toUpperCase().includes('SUGGESTED RESPONSE') && suggestedText ? (
              <Pressable
                style={styles.copyBtn}
                onPress={() => copyToClipboard(suggestedText, 'suggested')}
              >
                <Text style={styles.copyBtnText}>{copiedId === 'suggested' ? 'Copied!' : 'Copy response'}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {toast ? <Text style={styles.toast}>{toast}</Text> : null}
      </View>
    );
  };

  const canDecode = message.trim().length >= 3 || !!screenshotUri;

  return (
    <ErrorBoundary>
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
              <Text style={styles.prompt}>Paste what they sent you — or add a screenshot.</Text>
              
              {/* Screenshot section */}
              {screenshotUri ? (
                <View style={styles.screenshotContainer}>
                  <Image source={{ uri: screenshotUri }} style={styles.screenshotImage} resizeMode="contain" />
                  <Pressable style={styles.removeScreenshotBtn} onPress={removeScreenshot}>
                    <Ionicons name="close-circle" size={28} color={TEXT_PRIMARY} />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.screenshotBtn} onPress={pickScreenshot}>
                  <Ionicons name="image-outline" size={24} color={ACCENT} />
                  <Text style={styles.screenshotBtnText}>Add Screenshot</Text>
                </Pressable>
              )}

              <Text style={styles.orText}>— or paste the text —</Text>

              <TextInput
                style={styles.largeInput}
                placeholder="Paste their message here..."
                placeholderTextColor={TEXT_SECONDARY}
                value={message}
                onChangeText={setMessage}
                multiline
                minHeight={100}
                textAlignVertical="top"
              />
              <TextInput
                style={styles.smallInput}
                placeholder="Who sent this? (my friend, my boss, my ex...)"
                placeholderTextColor={TEXT_SECONDARY}
                value={sender}
                onChangeText={setSender}
              />
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
                  <Text style={styles.loadingText}>Psych is analyzing{screenshotUri ? ' the screenshot' : ''}...</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.primaryBtn, !canDecode && styles.primaryBtnDisabled]}
                  onPress={onDecode}
                  disabled={!canDecode || loading}
                >
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
                <Pressable style={styles.primaryBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
                  <Text style={styles.primaryBtnText}>Done</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </ScrollView>
        {toast ? <View style={styles.toastWrap}><Text style={styles.toastText}>{toast}</Text></View> : null}
      </KeyboardAvoidingView>
    </ErrorBoundary>
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
  prompt: { fontSize: 18, fontWeight: '500', color: TEXT_PRIMARY, marginBottom: 16 },
  orText: { color: TEXT_SECONDARY, fontSize: 13, textAlign: 'center', marginVertical: 12 },
  screenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: ACCENT,
    borderStyle: 'dashed',
    gap: 8,
  },
  screenshotBtnText: { color: ACCENT, fontSize: 16, fontWeight: '500' },
  screenshotContainer: {
    position: 'relative',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  screenshotImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeScreenshotBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
  screenshotPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  largeInput: { backgroundColor: CARD_BG, color: TEXT_PRIMARY, fontSize: 16, minHeight: 100, padding: 14, borderRadius: 12, marginBottom: 12, textAlignVertical: 'top', borderWidth: 1, borderColor: CARD_BORDER },
  smallInput: { backgroundColor: CARD_BG, color: TEXT_PRIMARY, fontSize: 16, padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER },
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
