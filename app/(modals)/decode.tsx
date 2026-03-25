/**
 * Decode — Analyze messages and get response suggestions.
 * Supports text paste OR screenshot attachment.
 * Includes Social Physics trajectory predictions.
 * Includes Bias Filter for cognitive bias detection when activated.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageWithSystemPrompt, analyzeImageWithVision } from '../../src/services/ai';
import {
  scoreInteraction,
  toResponseIntent,
  getTrajectoryExplanation,
  type ResponseIntent,
  type InteractionContext,
} from '../../src/services/socialPhysics';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { ToolCautionModal, StabilizationFooter } from '../../src/components/StabilizationBanner';
import { PreConversationButton } from '../../src/components/PreConversationButton';
import { detectBiases, type BiasFilterResult } from '../../src/services/biasFilter';
import BiasFilterCard, { BiasFilterBanner } from '../../src/components/BiasFilterCard';
import { ToolIntro } from '../../src/components/tools/ToolIntro';
import { getToolIntroContent } from '../../src/data/toolIntroContent';
import { useHumanSkillsStore, DECODE_SKILL_IDS, SKILL_POINTS } from '../../src/stores/humanSkillsStore';

// Lazy load ImagePicker to prevent crash on component mount
let ImagePickerModule: typeof import('expo-image-picker') | null = null;
const getImagePicker = async () => {
  if (!ImagePickerModule) {
    try {
      ImagePickerModule = await import('expo-image-picker');
    } catch (e) {
      console.warn('ImagePicker not available:', e);
      return null;
    }
  }
  return ImagePickerModule;
};

const DECODE_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user pasted a message someone sent them.

Analyze it with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask (1-2 sentences)

WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them. Apply Attribution Theory: are they making internal attributions ("you don't care") or external ones ("things have been crazy")? (2-3 sentences)

WHAT THEY WANT FROM YOU — What they're asking for: time, reassurance, space, validation, a response, repair? (1-2 sentences)

RED FLAGS — Anything manipulative, guilt-trippy, passive-aggressive, or boundary-crossing? If not, say "Nothing obvious." (1-2 sentences)

SENDER STATE — Based on their message, assess: Are they ACTIVATED (anxious, defensive, urgent), SHUTDOWN (withdrawn, brief, avoidant), or REGULATED (calm, open)? One word + brief reason.

SUGGESTED_INTENT — Exactly one token from this list, lowercase, underscores: set_boundary, reconnect, apologize, confront, validate, withdraw, clarify, defer. Pick the best fit for what the user might do next. If unclear, write: none

RESPONSE OPTIONS — Give 3 brief response options with different tones:
• Option A (Warm/Open): [response that prioritizes connection]
• Option B (Boundaried): [response that protects their needs while staying respectful]  
• Option C (Minimal): [brief acknowledgment if they need time]

Be direct, warm, concise.`;

const DECODE_VISION_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user attached a screenshot of a message/conversation they received.

First, briefly transcribe the key message(s) in the screenshot.

Then analyze with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask (1-2 sentences)

WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them. Apply Attribution Theory. (2-3 sentences)

WHAT THEY WANT FROM YOU — What they're asking for. (1-2 sentences)

RED FLAGS — Anything manipulative or boundary-crossing? If not, say "Nothing obvious." (1-2 sentences)

SENDER STATE — Based on their message: ACTIVATED, SHUTDOWN, or REGULATED? One word + brief reason.

SUGGESTED_INTENT — Exactly one token: set_boundary, reconnect, apologize, confront, validate, withdraw, clarify, defer, or none

RESPONSE OPTIONS — Give 3 brief response options:
• Option A (Warm/Open): [prioritizes connection]
• Option B (Boundaried): [protects your needs]  
• Option C (Minimal): [brief acknowledgment]

Be direct, warm, concise.`;

/** Non-AI fallback when API is unavailable — research-based prompts so the app still helps. */
function getDecodeFallback(message: string, sender: string): string {
  const from = sender || 'them';
  return `WHAT THEY'RE SAYING — The message you shared.

WHAT THEY MIGHT MEAN — Without AI we can't read subtext. Consider: Are they asking for connection, space, clarity, or action? Notice your own reaction — sometimes our gut picks up tone (anxious, hurt, defensive) even when words seem neutral.

WHAT THEY WANT FROM YOU — Common needs in messages: reassurance, time to respond, a clear answer, repair after conflict, or simply to be heard. Reflect on what would feel true to you to offer.

RED FLAGS — If something felt off (guilt-tripping, pressure, dismissal), trust that. You're not required to respond in a way that ignores your boundaries.

SENDER STATE — Hard to say without AI. They might be REGULATED (calm), ACTIVATED (anxious/urgent), or SHUTDOWN (brief/withdrawn). Your reply can stay warm and clear either way.

SUGGESTED_INTENT — none

RESPONSE OPTIONS — You can: (A) Respond with warmth and connection, (B) Respond with a gentle boundary, or (C) Take time: "I need a moment to think — I'll get back to you."`;
}

/** Pulls the model's single-token intent line for social physics scoring. */
function extractSuggestedIntentFromDecode(text: string): string | null {
  const m = text.match(/SUGGESTED_INTENT\s*[—\-:]\s*([^\n]+)/i);
  if (!m?.[1]) return null;
  return m[1].trim();
}

/** Local sender read from Decode AI output (maps into InteractionContext). */
type SenderSignals = { isActivated?: boolean; isShutdown?: boolean };

// Intent options for trajectory calculator
const INTENT_OPTIONS: Array<{ intent: ResponseIntent; label: string; emoji: string }> = [
  { intent: 'reconnect', label: 'Reconnect', emoji: '💚' },
  { intent: 'set_boundary', label: 'Set Boundary', emoji: '🛡️' },
  { intent: 'validate', label: 'Validate', emoji: '💜' },
  { intent: 'apologize', label: 'Apologize', emoji: '🙏' },
  { intent: 'clarify', label: 'Clarify', emoji: '🔍' },
  { intent: 'defer', label: 'Buy Time', emoji: '⏰' },
  { intent: 'withdraw', label: 'Withdraw', emoji: '🚪' },
  { intent: 'confront', label: 'Confront', emoji: '⚡' },
];

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<ResponseIntent | null>(null);
  const [senderSignals, setSenderSignals] = useState<SenderSignals>({});
  const [error, setError] = useState<string | null>(null);
  const [imagePickerAvailable, setImagePickerAvailable] = useState(true);
  
  // Bias filter state
  const [showBiasFilter, setShowBiasFilter] = useState(false);
  const [biasFilterDismissed, setBiasFilterDismissed] = useState(false);
  
  // Stabilization mode - hooks must be called unconditionally (Rules of Hooks)
  const systemMode = useCockpitStore((s) => s.systemMode) ?? 'capacity';
  const stabilizationTriggers = useCockpitStore((s) => s.stabilizationTriggers) ?? [];
  const currentState = useCockpitStore((s) => s.state.value);
  
  const [showCaution, setShowCaution] = useState(systemMode === 'stabilization');
  const isStabilization = systemMode === 'stabilization';
  
  // Detect biases in message text when activated (State < 50)
  const biasResult: BiasFilterResult = useMemo(() => {
    if (!message || message.trim().length < 10) {
      return { detected: false, biases: [], primaryBias: null, system1Alert: null };
    }
    // Only run detection if state is activated (< 50) or unknown
    if (currentState >= 50) {
      return { detected: false, biases: [], primaryBias: null, system1Alert: null };
    }
    return detectBiases(message, currentState);
  }, [message, currentState]);
  
  // Show bias banner when bias detected and user is activated
  const shouldShowBiasBanner = biasResult.detected && 
    !biasFilterDismissed && 
    !showBiasFilter &&
    (currentState < 0 || currentState < 50);

  const interactionContext = useMemo((): InteractionContext | undefined => {
    const ctx: InteractionContext = {};
    if (senderSignals.isActivated) ctx.urgency = 'high';
    if (isStabilization || (typeof currentState === 'number' && currentState < 50)) {
      ctx.userCapacity = 'low';
    }
    if (
      response &&
      /recent conflict|since we fought|after (our|the) (fight|argument)/i.test(response)
    ) {
      ctx.recentConflict = true;
    }
    return Object.keys(ctx).length ? ctx : undefined;
  }, [senderSignals.isActivated, isStabilization, currentState, response]);

  const parsedIntent = useMemo(() => {
    const raw = extractSuggestedIntentFromDecode(response);
    if (!raw) return null;
    return toResponseIntent(raw);
  }, [response]);

  const effectiveIntent: ResponseIntent | null = selectedIntent ?? parsedIntent;

  const scored = useMemo(() => {
    if (!effectiveIntent) return null;
    try {
      return scoreInteraction(effectiveIntent, interactionContext);
    } catch (e) {
      console.warn('Trajectory calculation error:', e);
      return null;
    }
  }, [effectiveIntent, interactionContext]);

  const explanation = useMemo(() => {
    if (!effectiveIntent) return null;
    return getTrajectoryExplanation(effectiveIntent, interactionContext);
  }, [effectiveIntent, interactionContext]);

  // Check if ImagePicker is available on mount
  useEffect(() => {
    getImagePicker().then((picker) => {
      setImagePickerAvailable(picker !== null);
    }).catch(() => {
      setImagePickerAvailable(false);
    });
  }, []);

  const pickImage = useCallback(async () => {
    setError(null);
    try {
      const ImagePicker = await getImagePicker();
      if (!ImagePicker) {
        Alert.alert('Not available', 'Photo library is not available. Please paste the text instead.');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photos to attach a screenshot.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri ?? null);
        setImageBase64(asset.base64 ?? null);
        setMessage('');
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Error', 'Could not access photos. Try pasting the text instead.');
    }
  }, []);

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const onDecode = useCallback(async () => {
    if (loading) return;
    if (!imageBase64 && message.trim().length < 3) return;

    setLoading(true);
    setError(null);
    
    try {
      let result: string | null = null;

      if (imageBase64) {
        const prompt = `Analyze this screenshot of a message I received.${sender ? ` It's from: ${sender}` : ''}`;
        try {
          result = await analyzeImageWithVision(imageBase64, prompt, DECODE_VISION_SYSTEM);
        } catch (visionErr) {
          console.warn('Vision API error:', visionErr);
          // Fall back to text-only if vision fails
          setError('Could not analyze image. Please paste the text instead.');
          setLoading(false);
          return;
        }
      } else {
        result = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `Message: "${message}"\n\nFrom: ${sender || 'someone'}` }],
          DECODE_SYSTEM
        );
        if (!result || result.startsWith('[AI Error') || result.includes('API key')) {
          result = getDecodeFallback(message, sender);
        }
      }

      const fullResponse = result?.trim() ?? getDecodeFallback(message, sender);
      setResponse(fullResponse);
      useHumanSkillsStore.getState().addPoints(DECODE_SKILL_IDS, SKILL_POINTS.toolUse, 'tool');

      // Detect sender state from response (safely)
      try {
        const activatedMatch = fullResponse.match(/SENDER STATE[:\s]*ACTIVATED/i);
        const shutdownMatch = fullResponse.match(/SENDER STATE[:\s]*SHUTDOWN/i);
        setSenderSignals({
          isActivated: !!activatedMatch,
          isShutdown: !!shutdownMatch,
        });
      } catch (parseErr) {
        // Non-critical - just skip state detection
        console.warn('State detection failed:', parseErr);
      }

    } catch (err) {
      console.warn('Decode error:', err);
      if (message.trim().length >= 3) {
        setResponse(getDecodeFallback(message, sender));
        useHumanSkillsStore.getState().addPoints(DECODE_SKILL_IDS, SKILL_POINTS.toolUse, 'tool');
        setError('AI unavailable — here\'s a reflection guide you can use instead.');
      } else {
        setError(`Something went wrong. Try pasting the message text for a reflection guide.`);
        setResponse('');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, imageBase64, message, sender]);

  const onReset = useCallback(() => {
    setMessage('');
    setSender('');
    setImageUri(null);
    setImageBase64(null);
    setResponse('');
    setSelectedIntent(null);
    setSenderSignals({});
    setError(null);
    setShowBiasFilter(false);
    setBiasFilterDismissed(false);
  }, []);

  const canDecode = imageBase64 || message.trim().length >= 3;

  // Safe navigation to quick-reset
  const handleQuickReset = useCallback(() => {
    setShowCaution(false);
    try {
      router.replace('/(modals)/quick-reset');
    } catch (navErr) {
      console.warn('Navigation error:', navErr);
      router.back();
    }
  }, [router]);

  const introContent = getToolIntroContent('decode');
  if (showIntro && introContent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ToolIntro
          content={introContent}
          onStart={() => setShowIntro(false)}
          onBack={() => router.back()}
        />
      </View>
    );
  }

  return (
    <>
      {/* Stabilization Mode Caution */}
      <ToolCautionModal
        visible={showCaution && isStabilization}
        toolName="Decode"
        triggers={stabilizationTriggers}
        onContinue={() => setShowCaution(false)}
        onQuickReset={handleQuickReset}
      />
      
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F0F0F5" />
        </Pressable>
        <Text style={styles.headerTitle}>Decode</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!response ? (
          <>
            {/* Bias Filter Full Card Modal */}
            {showBiasFilter && biasResult.detected && (
              <BiasFilterCard
                result={biasResult}
                currentState={currentState}
                onRevise={() => {
                  setShowBiasFilter(false);
                  // Focus stays on text input for revision
                }}
                onSendAnyway={() => {
                  setShowBiasFilter(false);
                  setBiasFilterDismissed(true);
                  // Continue with decode
                  onDecode();
                }}
                onDismiss={() => {
                  setShowBiasFilter(false);
                  setBiasFilterDismissed(true);
                }}
              />
            )}
            
            {/* Pre-Conversation Check — optional, not blocking */}
            <PreConversationButton 
              returnTo="/(modals)/decode" 
              label="About to decode a tough message?"
            />
            
            <Text style={styles.prompt}>Paste what they sent you, or attach a screenshot.</Text>
            
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
                <Pressable style={styles.removeImageBtn} onPress={removeImage}>
                  <Ionicons name="close-circle" size={28} color="#EF4444" />
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.largeInput}
                  placeholder="Paste their message here..."
                  placeholderTextColor="#8888A0"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                />
                
                <Pressable style={styles.attachBtn} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color="#7C4DFF" />
                  <Text style={styles.attachBtnText}>Attach screenshot</Text>
                </Pressable>
              </>
            )}

            <TextInput
              style={styles.smallInput}
              placeholder="Who sent this? (optional)"
              placeholderTextColor="#8888A0"
              value={sender}
              onChangeText={setSender}
            />

            {/* Bias Filter Banner - shows when bias detected */}
            {shouldShowBiasBanner && !showBiasFilter && (
              <BiasFilterBanner
                result={biasResult}
                currentState={currentState}
                onTap={() => setShowBiasFilter(true)}
              />
            )}

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#7C4DFF" />
                <Text style={styles.loadingText}>Analyzing...</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.primaryBtn, !canDecode && styles.primaryBtnDisabled]}
                onPress={() => {
                  // If bias detected and not dismissed, show filter card first
                  if (biasResult.detected && !biasFilterDismissed && (currentState < 0 || currentState < 50)) {
                    setShowBiasFilter(true);
                    return;
                  }
                  onDecode();
                }}
                disabled={!canDecode}
              >
                <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Decode</Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreviewSmall} resizeMode="contain" />
            )}
            
            {/* AI Analysis */}
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>{response}</Text>
            </View>

            {/* Social Physics Trajectory Calculator */}
            <View style={styles.trajectorySection}>
              <Text style={styles.trajectorySectionTitle}>
                📊 Response Trajectory Calculator
              </Text>
              <Text style={styles.trajectorySectionSub}>
                {parsedIntent && !selectedIntent
                  ? 'Suggested intent below — tap any chip to override'
                  : 'Tap an intent to see predicted gauge impact'}
              </Text>

              {/* Partner state indicator */}
              {(senderSignals.isActivated || senderSignals.isShutdown) && (
                <View style={styles.partnerStateTag}>
                  <Text style={styles.partnerStateText}>
                    {senderSignals.isActivated ? '⚡ Sender is ACTIVATED' : '🔇 Sender is SHUTDOWN'}
                  </Text>
                </View>
              )}

              {/* Intent buttons */}
              <View style={styles.intentGrid}>
                {INTENT_OPTIONS.map((opt) => {
                  const isSelected = selectedIntent === opt.intent;
                  const isSuggestedChip =
                    !selectedIntent && parsedIntent === opt.intent;
                  return (
                    <Pressable
                      key={opt.intent}
                      style={[
                        styles.intentBtn,
                        isSuggestedChip && styles.intentBtnSuggested,
                        isSelected && styles.intentBtnSelected,
                      ]}
                      onPress={() =>
                        setSelectedIntent(selectedIntent === opt.intent ? null : opt.intent)
                      }
                    >
                      <Text style={styles.intentEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.intentLabel,
                          (isSelected || isSuggestedChip) && styles.intentLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Trajectory result — AI suggestion or user-selected intent */}
              {!effectiveIntent && (
                <Text style={styles.trajectoryFallbackHint}>
                  When the analysis includes a suggested intent, or after you tap a chip, you will
                  see predicted gauge impact here.
                </Text>
              )}
              {scored && (
                <View style={styles.trajectoryResult}>
                  {parsedIntent && !selectedIntent && (
                    <Text style={styles.suggestedIntentLabel}>Suggested trajectory</Text>
                  )}
                  <Text style={styles.riskBadge}>Risk: {scored.risk}</Text>
                  <View style={styles.trajectoryGauges}>
                    {(
                      [
                        ['Connection', scored.impact.connection] as const,
                        ['State', scored.impact.state ?? 0] as const,
                        ['Emotion', scored.impact.emotion ?? 0] as const,
                        ['Alignment', scored.impact.alignment ?? 0] as const,
                        ['Direction', scored.impact.direction ?? 0] as const,
                      ] as const
                    ).map(([label, value]) => (
                      <View key={label} style={styles.trajectoryGauge}>
                        <Text style={styles.trajectoryGaugeLabel}>{label}</Text>
                        <Text
                          style={[
                            styles.trajectoryGaugeValue,
                            value >= 0 ? styles.gaugePositive : styles.gaugeNegative,
                          ]}
                        >
                          {value >= 0 ? '+' : ''}
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.trajectoryExplanation}>{scored.recommendedFollowUp}</Text>

                  {explanation ? (
                    <View style={styles.trajectoryExplainCard}>
                      <Text style={styles.trajectoryExplainTitle}>Why this trajectory</Text>

                      <Text style={styles.trajectoryExplainBody}>{explanation.why}</Text>

                      <Text style={styles.trajectoryExplainLabel}>When to use</Text>
                      <Text style={styles.trajectoryExplainBody}>{explanation.whenToUse}</Text>

                      <Text style={styles.trajectoryExplainLabel}>Watch out</Text>
                      <Text style={styles.trajectoryExplainBody}>{explanation.watchOut}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            <Pressable style={styles.primaryBtn} onPress={onReset}>
              <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Decode Another</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryBtnText}>Done</Text>
            </Pressable>
          </>
        )}
        
        {/* Stabilization footer hint */}
        {isStabilization && <StabilizationFooter />}
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#F0F0F5' },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  prompt: { fontSize: 18, fontWeight: '500', color: '#F0F0F5', marginBottom: 16 },
  largeInput: {
    backgroundColor: '#111118',
    color: '#F0F0F5',
    fontSize: 16,
    minHeight: 120,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  smallInput: {
    backgroundColor: '#111118',
    color: '#F0F0F5',
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
  },
  attachBtnText: {
    color: '#7C4DFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111118',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePreviewSmall: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#111118',
    borderRadius: 14,
  },
  primaryBtn: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  secondaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: { fontSize: 16, color: '#8888A0' },
  loadingWrap: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { fontSize: 15, color: '#8888A0', marginTop: 8 },
  responseCard: {
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  responseText: { color: '#E0E0E0', fontSize: 15, lineHeight: 24 },
  
  // Trajectory Calculator
  trajectorySection: {
    backgroundColor: '#111118',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.2)',
  },
  trajectorySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0F0F5',
    marginBottom: 4,
  },
  trajectorySectionSub: {
    fontSize: 13,
    color: '#8888A0',
    marginBottom: 12,
  },
  trajectoryFallbackHint: {
    fontSize: 12,
    color: '#6B6B80',
    marginBottom: 12,
    lineHeight: 18,
  },
  partnerStateTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  partnerStateText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500',
  },
  intentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  intentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  intentBtnSuggested: {
    borderColor: 'rgba(124, 77, 255, 0.45)',
    borderWidth: 1,
  },
  intentBtnSelected: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderColor: '#7C4DFF',
  },
  intentEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  intentLabel: {
    fontSize: 14,
    color: '#8888A0',
    fontWeight: '500',
  },
  intentLabelSelected: {
    color: '#F0F0F5',
  },
  suggestedIntentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A78BFA',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trajectoryResult: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  riskBadge: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  trajectoryGauges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 10,
  },
  trajectoryGauge: {
    alignItems: 'center',
    width: '31%',
    minWidth: 72,
  },
  trajectoryGaugeLabel: {
    fontSize: 11,
    color: '#8888A0',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trajectoryGaugeValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  gaugePositive: {
    color: '#10B981',
  },
  gaugeNegative: {
    color: '#EF4444',
  },
  trajectoryExplanation: {
    fontSize: 13,
    color: '#E0E0E0',
    lineHeight: 18,
    textAlign: 'center',
  },
  trajectoryExplainCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  trajectoryExplainTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  trajectoryExplainLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 10,
    marginBottom: 4,
  },
  trajectoryExplainBody: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    lineHeight: 20,
  },
});
