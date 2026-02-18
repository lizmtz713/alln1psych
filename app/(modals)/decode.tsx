/**
 * Decode — Analyze messages with AI, now with screenshot support.
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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { sendMessageWithSystemPrompt, analyzeImageWithVision } from '../../src/services/ai';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import { buildRelationshipContext } from '../../src/services/personology';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Phase = 'paste' | 'analysis' | 'intent' | 'respond';

const DECODE_ACCENT = '#7C4DFF';
const DECODE_ACCENT_BG = 'rgba(124, 77, 255, 0.12)';
const DECODE_ACCENT_BORDER = 'rgba(124, 77, 255, 0.25)';

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

const ANALYSIS_HEADERS = ['WHAT I SEE', "WHAT THEY'RE SAYING", 'WHAT THEY MIGHT MEAN', 'WHAT THEY WANT FROM YOU', 'RED FLAGS'];
const RESPOND_HEADERS = ['SUGGESTED RESPONSE', 'WHY THIS WORKS', 'AN ALTERNATIVE', 'THE WAIT OPTION'];

const INTENT_OPTIONS = [
  { id: 'reconnect', title: 'Reconnect', desc: 'I want to open the door and rebuild', icon: '🤝', color: '#4ADE80' },
  { id: 'address', title: 'Address it', desc: 'I need to acknowledge what happened first', icon: '💬', color: '#60A5FA' },
  { id: 'not_ready', title: 'Not ready', desc: 'I need more time before responding', icon: '⏸️', color: '#F59E0B' },
] as const;

function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

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
  const scrollRef = useRef<ScrollView>(null);

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
      await Clipboard.setStringAsync(text);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setScreenshotUri(result.assets[0].uri);
      }
    } catch (e) {
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      let response: string | undefined;

      if (hasImage) {
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
        const userContent = `Message:\n${message}\n\nWho sent this: ${sender || 'not specified'}\nContext: ${context || 'none'}`;
        const fullPrompt = DECODE_ANALYSIS_SYSTEM + buildDecodeRelationshipContext();
        response = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: userContent }],
          fullPrompt
        );
      }
      
      setAnalysisResponse(response?.trim() ?? '');
      setPhase('analysis');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (e) {
      setAnalysisResponse("I couldn't analyze that right now. Try again in a moment.");
      setPhase('analysis');
    } finally {
      setLoading(false);
    }
  };

  const onSelectIntent = async (intent: typeof INTENT_OPTIONS[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedIntent(intent.id);
    setLoading(true);
    setPhase('respond');
    
    try {
      const msgSource = screenshotUri ? '[Screenshot attached]' : message;
      const userContent = `Message:\n${msgSource}\n\nSender: ${sender}\nContext: ${context}\n\nAnalysis:\n${analysisResponse}\n\nUser's intent: ${intent.title} — ${intent.desc}`;
      const fullPrompt = DECODE_RESPOND_SYSTEM + buildDecodeRelationshipContext();
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: userContent }],
        fullPrompt
      );
      setRespondResponse(response?.trim() ?? '');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (e) {
      setRespondResponse("I couldn't generate a response right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === 'paste') {
      router.back();
    } else if (phase === 'respond') {
      setPhase('intent');
    } else {
      setPhase('paste');
    }
  };

  const startOver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('paste');
    setMessage('');
    setSender('');
    setContext('');
    setScreenshotUri(null);
    setAnalysisResponse('');
    setSelectedIntent('');
    setRespondResponse('');
  };

  const canDecode = message.trim().length >= 3 || !!screenshotUri;

  const getHeaderTitle = () => {
    switch (phase) {
      case 'analysis': return 'Analysis';
      case 'intent': return 'Your Intent';
      case 'respond': return 'Response Guide';
      default: return 'Decode';
    }
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <View style={styles.headerRight}>
            {phase !== 'paste' && (
              <Pressable onPress={startOver} hitSlop={8}>
                <Ionicons name="refresh" size={22} color={COLORS.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {phase === 'paste' && (
            <>
              {/* Hero */}
              <AnimatedSection delay={0}>
                <View style={styles.heroSection}>
                  <Text style={styles.heroEmoji}>🔍</Text>
                  <Text style={styles.heroTitle}>Decode Messages</Text>
                  <Text style={styles.heroSubtitle}>
                    Paste what they sent — or add a screenshot.{'\n'}
                    Understand what's really being said.
                  </Text>
                </View>
              </AnimatedSection>

              {/* Screenshot Option */}
              <AnimatedSection delay={100}>
                {screenshotUri ? (
                  <View style={styles.screenshotContainer}>
                    <Image source={{ uri: screenshotUri }} style={styles.screenshotImage} resizeMode="contain" />
                    <Pressable style={styles.removeScreenshotBtn} onPress={removeScreenshot}>
                      <Ionicons name="close-circle" size={28} color={COLORS.text} />
                    </Pressable>
                    <View style={styles.screenshotBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.screenshotBadgeText}>Screenshot added</Text>
                    </View>
                  </View>
                ) : (
                  <Pressable style={styles.screenshotBtn} onPress={pickScreenshot}>
                    <View style={styles.screenshotBtnIcon}>
                      <Ionicons name="image" size={24} color={DECODE_ACCENT} />
                    </View>
                    <View style={styles.screenshotBtnContent}>
                      <Text style={styles.screenshotBtnTitle}>Add Screenshot</Text>
                      <Text style={styles.screenshotBtnDesc}>Let AI read the message for you</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color={DECODE_ACCENT} />
                  </Pressable>
                )}
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or type it</Text>
                  <View style={styles.dividerLine} />
                </View>
              </AnimatedSection>

              {/* Message Input */}
              <AnimatedSection delay={200}>
                <TextInput
                  style={styles.largeInput}
                  placeholder="Paste their message here..."
                  placeholderTextColor={COLORS.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                />
              </AnimatedSection>

              {/* Context Fields */}
              <AnimatedSection delay={250}>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Who sent this? (my friend, my boss, my ex...)"
                  placeholderTextColor={COLORS.textMuted}
                  value={sender}
                  onChangeText={setSender}
                />
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Quick context (e.g. we haven't talked in 3 months...)"
                  placeholderTextColor={COLORS.textMuted}
                  value={context}
                  onChangeText={setContext}
                />
              </AnimatedSection>

              {/* Decode Button */}
              <AnimatedSection delay={350}>
                {loading ? (
                  <View style={styles.loadingCard}>
                    <ActivityIndicator color={DECODE_ACCENT} />
                    <Text style={styles.loadingText}>
                      Psych is {screenshotUri ? 'reading the screenshot' : 'analyzing'}...
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.primaryBtn, !canDecode && styles.primaryBtnDisabled]}
                    onPress={onDecode}
                    disabled={!canDecode}
                  >
                    <Ionicons name="search" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryBtnText}>Decode</Text>
                  </Pressable>
                )}
              </AnimatedSection>
            </>
          )}

          {phase === 'analysis' && (
            <>
              {screenshotUri && (
                <AnimatedSection delay={0}>
                  <Image source={{ uri: screenshotUri }} style={styles.analysisScreenshot} resizeMode="contain" />
                </AnimatedSection>
              )}
              
              <AnimatedSection delay={100}>
                <View style={styles.analysisCard}>
                  {sectionedText(analysisResponse, ANALYSIS_HEADERS).map((p, i) => (
                    <View key={i} style={p.bold ? styles.analysisSectionHeader : styles.analysisSection}>
                      <Text style={p.bold ? styles.analysisSectionTitle : styles.analysisSectionText}>
                        {p.content}
                      </Text>
                    </View>
                  ))}
                </View>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <Pressable style={styles.primaryBtn} onPress={() => setPhase('intent')}>
                  <Text style={styles.primaryBtnText}>How should I respond?</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </Pressable>
              </AnimatedSection>
            </>
          )}

          {phase === 'intent' && (
            <>
              <AnimatedSection delay={0}>
                <Text style={styles.intentTitle}>What do you want from this?</Text>
                <Text style={styles.intentSubtitle}>Choose your intent and I'll help you respond.</Text>
              </AnimatedSection>

              {INTENT_OPTIONS.map((opt, index) => (
                <AnimatedSection key={opt.id} delay={100 + index * 50}>
                  <Pressable
                    style={[styles.intentCard, selectedIntent === opt.id && styles.intentCardSelected]}
                    onPress={() => onSelectIntent(opt)}
                  >
                    <View style={[styles.intentIcon, { backgroundColor: opt.color + '20' }]}>
                      <Text style={styles.intentEmoji}>{opt.icon}</Text>
                    </View>
                    <View style={styles.intentContent}>
                      <Text style={styles.intentCardTitle}>{opt.title}</Text>
                      <Text style={styles.intentCardDesc}>{opt.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                  </Pressable>
                </AnimatedSection>
              ))}

              {loading && (
                <AnimatedSection delay={0}>
                  <View style={styles.loadingCard}>
                    <ActivityIndicator color={DECODE_ACCENT} />
                    <Text style={styles.loadingText}>Crafting your response guide...</Text>
                  </View>
                </AnimatedSection>
              )}
            </>
          )}

          {phase === 'respond' && (
            <>
              <AnimatedSection delay={0}>
                <View style={styles.responseCard}>
                  {sectionedText(respondResponse, RESPOND_HEADERS).map((p, i) => (
                    <View key={i}>
                      {p.bold ? (
                        <View style={styles.responseSectionHeader}>
                          <Text style={styles.responseSectionTitle}>{p.content}</Text>
                          {p.content.toUpperCase().includes('SUGGESTED RESPONSE') && (
                            <Pressable
                              style={styles.copyBtn}
                              onPress={() => {
                                const suggestedText = respondResponse.match(/SUGGESTED RESPONSE[:\s]*([\s\S]*?)(?=WHY THIS|$)/i)?.[1]?.trim() ?? '';
                                copyToClipboard(suggestedText, 'suggested');
                              }}
                            >
                              <Ionicons 
                                name={copiedId === 'suggested' ? 'checkmark' : 'copy-outline'} 
                                size={18} 
                                color={DECODE_ACCENT} 
                              />
                              <Text style={styles.copyBtnText}>
                                {copiedId === 'suggested' ? 'Copied!' : 'Copy'}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      ) : (
                        <Text style={styles.responseSectionText}>{p.content}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Done</Text>
                </Pressable>
              </AnimatedSection>
            </>
          )}
        </ScrollView>

        {/* Toast */}
        {toast ? (
          <View style={[styles.toast, { bottom: insets.bottom + SPACING.xxl }]}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
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
    alignItems: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
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
  
  // Screenshot
  screenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: DECODE_ACCENT_BORDER,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
  },
  screenshotBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: DECODE_ACCENT_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  screenshotBtnContent: {
    flex: 1,
  },
  screenshotBtnTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
  },
  screenshotBtnDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
  },
  screenshotContainer: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  screenshotImage: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.md,
  },
  removeScreenshotBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
  screenshotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  screenshotBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.success,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
  },
  
  // Inputs
  largeInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    textAlignVertical: 'top',
  },
  smallInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  
  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: DECODE_ACCENT,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.labelLg,
    color: '#FFF',
    fontWeight: '600',
  },
  
  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
  },
  
  // Analysis
  analysisScreenshot: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  analysisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analysisSectionHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  analysisSection: {
    marginBottom: SPACING.sm,
  },
  analysisSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: DECODE_ACCENT,
    fontWeight: '700',
  },
  analysisSectionText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineHeight: 22,
  },
  
  // Intent
  intentTitle: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  intentSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intentCardSelected: {
    borderColor: DECODE_ACCENT,
    backgroundColor: DECODE_ACCENT_BG,
  },
  intentIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  intentEmoji: {
    fontSize: 24,
  },
  intentContent: {
    flex: 1,
  },
  intentCardTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: 2,
  },
  intentCardDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
  },
  
  // Response
  responseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  responseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  responseSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: DECODE_ACCENT,
    fontWeight: '700',
    flex: 1,
  },
  responseSectionText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  copyBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: DECODE_ACCENT,
  },
  
  // Toast
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  toastText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
});
