/**
 * Decode — Analyze messages and get response suggestions.
 * Supports text paste OR screenshot attachment.
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

const DECODE_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user pasted a message someone sent them.

Analyze it with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask (1-2 sentences)

WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them. Apply Attribution Theory: are they making internal attributions ("you don't care") or external ones ("things have been crazy")? (2-3 sentences)

WHAT THEY WANT FROM YOU — What they're asking for: time, reassurance, space, validation, a response, repair? (1-2 sentences)

RED FLAGS — Anything manipulative, guilt-trippy, passive-aggressive, or boundary-crossing? If not, say "Nothing obvious." (1-2 sentences)

RESPONSE OPTIONS — Give 3 brief response options with different tones:
• Option A (Warm/Open): [response that prioritizes connection]
• Option B (Boundaried): [response that protects their needs while staying respectful]  
• Option C (Minimal): [brief acknowledgment if they need time]

TRAJECTORY FORECAST — For each option above, predict how it's likely to land:
• Option A likely leads to: [e.g., "Opens dialogue but may require emotional labor"]
• Option B likely leads to: [e.g., "May feel cold initially but establishes clarity"]
• Option C likely leads to: [e.g., "Buys time but doesn't resolve tension"]

Base trajectory on: the sender's apparent emotional state, the relationship dynamic, and whether the sender seems to need validation vs. space.

Be direct, warm, concise.`;

const DECODE_VISION_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user attached a screenshot of a message/conversation they received.

First, briefly transcribe the key message(s) in the screenshot.

Then analyze with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask (1-2 sentences)

WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them. Apply Attribution Theory: are they making internal attributions ("you don't care") or external ones ("things have been crazy")? (2-3 sentences)

WHAT THEY WANT FROM YOU — What they're asking for: time, reassurance, space, validation, a response, repair? (1-2 sentences)

RED FLAGS — Anything manipulative, guilt-trippy, passive-aggressive, or boundary-crossing? If not, say "Nothing obvious." (1-2 sentences)

RESPONSE OPTIONS — Give 3 brief response options with different tones:
• Option A (Warm/Open): [response that prioritizes connection]
• Option B (Boundaried): [response that protects their needs while staying respectful]
• Option C (Minimal): [brief acknowledgment if they need time]

TRAJECTORY FORECAST — For each option above, predict how it's likely to land:
• Option A likely leads to: [predicted outcome]
• Option B likely leads to: [predicted outcome]
• Option C likely leads to: [predicted outcome]

Base trajectory on: the sender's apparent emotional state, the relationship dynamic, and whether the sender seems to need validation vs. space.

Be direct, warm, concise.`;

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permission first
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
        setMessage(''); // Clear text if they pick an image
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
        // Vision API call with image
        const prompt = `Analyze this screenshot of a message I received.${sender ? ` It's from: ${sender}` : ''}`;
        result = await analyzeImageWithVision(imageBase64, prompt, DECODE_VISION_SYSTEM);
      } else {
        // Text-only call
        result = await sendMessageWithSystemPrompt(
          [{ role: 'user', content: `Message: "${message}"\n\nFrom: ${sender || 'someone'}` }],
          DECODE_SYSTEM
        );
      }

      setResponse(result?.trim() ?? 'Could not analyze. Try again.');
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
  };

  const canDecode = imageBase64 || message.trim().length >= 3;

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
            
            {/* Image preview */}
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
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>{response}</Text>
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
});
