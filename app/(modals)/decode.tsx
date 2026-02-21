/**
 * Decode — Analyze messages and get response suggestions.
 * Supports text paste OR screenshot attachment.
 * Includes Social Physics trajectory predictions.
 */
import { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { sendMessageWithSystemPrompt, analyzeImageWithVision } from '../../src/services/ai';
import { 
  calculateTrajectory, 
  formatImpact, 
  type ResponseIntent,
  type PartnerState 
} from '../../src/services/socialPhysics';

const DECODE_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user pasted a message someone sent them.

Analyze it with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask (1-2 sentences)

WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them. Apply Attribution Theory: are they making internal attributions ("you don't care") or external ones ("things have been crazy")? (2-3 sentences)

WHAT THEY WANT FROM YOU — What they're asking for: time, reassurance, space, validation, a response, repair? (1-2 sentences)

RED FLAGS — Anything manipulative, guilt-trippy, passive-aggressive, or boundary-crossing? If not, say "Nothing obvious." (1-2 sentences)

SENDER STATE — Based on their message, assess: Are they ACTIVATED (anxious, defensive, urgent), SHUTDOWN (withdrawn, brief, avoidant), or REGULATED (calm, open)? One word + brief reason.

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

RESPONSE OPTIONS — Give 3 brief response options:
• Option A (Warm/Open): [prioritizes connection]
• Option B (Boundaried): [protects your needs]  
• Option C (Minimal): [brief acknowledgment]

Be direct, warm, concise.`;

// Intent options for trajectory calculator
const INTENT_OPTIONS: Array<{ intent: ResponseIntent; label: string; emoji: string }> = [
  { intent: 'reconnect', label: 'Reconnect', emoji: '💚' },
  { intent: 'set_boundary', label: 'Set Boundary', emoji: '🛡️' },
  { intent: 'validate', label: 'Validate', emoji: '💜' },
  { intent: 'clarify', label: 'Clarify', emoji: '🔍' },
  { intent: 'defer', label: 'Buy Time', emoji: '⏰' },
  { intent: 'confront', label: 'Confront', emoji: '⚡' },
];

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<ResponseIntent | null>(null);
  const [partnerState, setPartnerState] = useState<PartnerState>({});

  const pickImage = async () => {
    try {
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
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ?? null);
        setMessage('');
      }
    } catch (error) {
      console.warn('Image picker error:', error);
      Alert.alert('Error', 'Could not access photos. Try pasting the text instead.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const onDecode = async () => {
    if (loading) return;
    if (!imageBase64 && message.trim().length < 3) return;

    setLoading(true);
    try {
      let result: string | null = null;

      if (imageBase64) {
        const prompt = `Analyze this screenshot of a message I received.${sender ? ` It's from: ${sender}` : ''}`;
        result = await analyzeImageWithVision(imageBase64, prompt, DECODE_VISION_SYSTEM);
      } else {
        result = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `Message: "${message}"\n\nFrom: ${sender || 'someone'}` }],
          DECODE_SYSTEM
        );
      }

      const fullResponse = result?.trim() ?? 'Could not analyze. Try again.';
      setResponse(fullResponse);

      // Detect sender state from response
      const activatedMatch = fullResponse.match(/SENDER STATE[:\s]*ACTIVATED/i);
      const shutdownMatch = fullResponse.match(/SENDER STATE[:\s]*SHUTDOWN/i);
      setPartnerState({
        isActivated: !!activatedMatch,
        isShutdown: !!shutdownMatch,
      });

    } catch (error) {
      console.warn('Decode error:', error);
      setResponse('Something went wrong. Try again in a moment.');
    }
    setLoading(false);
  };

  const onReset = () => {
    setMessage('');
    setSender('');
    setImageUri(null);
    setImageBase64(null);
    setResponse('');
    setSelectedIntent(null);
    setPartnerState({});
  };

  const canDecode = imageBase64 || message.trim().length >= 3;

  // Calculate trajectory for selected intent
  const trajectory = selectedIntent ? calculateTrajectory(selectedIntent, partnerState) : null;

  return (
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

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#7C4DFF" />
                <Text style={styles.loadingText}>Analyzing...</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.primaryBtn, !canDecode && styles.primaryBtnDisabled]}
                onPress={onDecode}
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
                Tap an intent to see predicted gauge impact
              </Text>

              {/* Partner state indicator */}
              {(partnerState.isActivated || partnerState.isShutdown) && (
                <View style={styles.partnerStateTag}>
                  <Text style={styles.partnerStateText}>
                    {partnerState.isActivated ? '⚡ Sender is ACTIVATED' : '🔇 Sender is SHUTDOWN'}
                  </Text>
                </View>
              )}

              {/* Intent buttons */}
              <View style={styles.intentGrid}>
                {INTENT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.intent}
                    style={[
                      styles.intentBtn,
                      selectedIntent === opt.intent && styles.intentBtnSelected,
                    ]}
                    onPress={() => setSelectedIntent(
                      selectedIntent === opt.intent ? null : opt.intent
                    )}
                  >
                    <Text style={styles.intentEmoji}>{opt.emoji}</Text>
                    <Text style={[
                      styles.intentLabel,
                      selectedIntent === opt.intent && styles.intentLabelSelected,
                    ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Trajectory result */}
              {trajectory && (
                <View style={styles.trajectoryResult}>
                  <View style={styles.trajectoryGauges}>
                    <View style={styles.trajectoryGauge}>
                      <Text style={styles.trajectoryGaugeLabel}>Alignment</Text>
                      <Text style={[
                        styles.trajectoryGaugeValue,
                        trajectory.alignment >= 0 ? styles.gaugePositive : styles.gaugeNegative,
                      ]}>
                        {trajectory.alignment >= 0 ? '+' : ''}{trajectory.alignment}
                      </Text>
                    </View>
                    <View style={styles.trajectoryGauge}>
                      <Text style={styles.trajectoryGaugeLabel}>Connection</Text>
                      <Text style={[
                        styles.trajectoryGaugeValue,
                        trajectory.connection >= 0 ? styles.gaugePositive : styles.gaugeNegative,
                      ]}>
                        {trajectory.connection >= 0 ? '+' : ''}{trajectory.connection}
                      </Text>
                    </View>
                    <View style={styles.trajectoryGauge}>
                      <Text style={styles.trajectoryGaugeLabel}>State</Text>
                      <Text style={[
                        styles.trajectoryGaugeValue,
                        trajectory.state >= 0 ? styles.gaugePositive : styles.gaugeNegative,
                      ]}>
                        {trajectory.state >= 0 ? '+' : ''}{trajectory.state}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.trajectoryExplanation}>{trajectory.explanation}</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
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
  trajectoryResult: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  trajectoryGauges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  trajectoryGauge: {
    alignItems: 'center',
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
});
