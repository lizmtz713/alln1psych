/**
 * Decode — Analyze messages and get response suggestions.
 * Minimal version to fix crash.
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';

const DECODE_SYSTEM = `You are Gauge in InGauge "Decode" mode. The user pasted a message someone sent them.

Analyze it with these sections (ALL CAPS headers):

WHAT THEY'RE SAYING — The surface words and ask
WHAT THEY MIGHT MEAN — Subtext, tone, what's going on for them
WHAT THEY WANT FROM YOU — What they're asking for
RED FLAGS — Anything manipulative or off? If not, say "Nothing obvious."
SUGGESTED RESPONSE — A concrete reply they could send

Be direct, warm, concise. 2-3 sentences per section.`;

export default function DecodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const onDecode = async () => {
    if (message.trim().length < 3 || loading) return;
    setLoading(true);
    try {
      const result = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: `Message: "${message}"\n\nFrom: ${sender || 'someone'}` }],
        DECODE_SYSTEM
      );
      setResponse(result?.trim() ?? 'Could not analyze. Try again.');
    } catch {
      setResponse('Something went wrong. Try again in a moment.');
    }
    setLoading(false);
  };

  const onReset = () => {
    setMessage('');
    setSender('');
    setResponse('');
  };

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
            <Text style={styles.prompt}>Paste what they sent you.</Text>
            <TextInput
              style={styles.largeInput}
              placeholder="Paste their message here..."
              placeholderTextColor="#8888A0"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
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
                style={[styles.primaryBtn, message.trim().length < 3 && styles.primaryBtnDisabled]}
                onPress={onDecode}
                disabled={message.trim().length < 3}
              >
                <Text style={styles.primaryBtnText}>Decode</Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={onReset}>
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
  primaryBtn: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
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
