/**
 * Relate — Enter two birthdays. Understand the dynamic.
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getRelationshipDynamic } from '../../src/services/personology';
import { useUserStore } from '../../src/stores/userStore';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

export default function Relate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userBirthday = useUserStore((s) => s.birthday);

  const [myBirthday, setMyBirthday] = useState(userBirthday ?? '');
  const [theirBirthday, setTheirBirthday] = useState('');
  const [result, setResult] = useState<ReturnType<typeof getRelationshipDynamic>>(null);

  const canSubmit =
    myBirthday.trim().length >= 7 && theirBirthday.trim().length >= 7;

  const onSubmit = () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dynamic = getRelationshipDynamic(myBirthday.trim(), theirBirthday.trim());
    setResult(dynamic ?? null);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Relate</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.prompt}>Understand anyone. Just enter two birthdays.</Text>

        <Text style={styles.label}>Your birthday</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1990-03-15"
          placeholderTextColor={COLORS.textMuted}
          value={myBirthday}
          onChangeText={setMyBirthday}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Their birthday</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1988-11-22"
          placeholderTextColor={COLORS.textMuted}
          value={theirBirthday}
          onChangeText={setTheirBirthday}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.primaryBtnText}>See the dynamic</Text>
        </Pressable>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Strengths</Text>
            {result.strengths.map((s, i) => (
              <Text key={i} style={styles.resultText}>• {s}</Text>
            ))}
            <Text style={styles.resultTitle}>Friction points</Text>
            {result.frictionPoints.map((f, i) => (
              <Text key={i} style={styles.resultText}>• {f}</Text>
            ))}
            <Text style={styles.resultTitle}>Communication tip</Text>
            <Text style={styles.resultText}>{result.communicationTip}</Text>
            <Text style={styles.resultTitle}>Conflict pattern</Text>
            <Text style={styles.resultText}>{result.conflictPattern}</Text>
            <Text style={styles.resultTitle}>What they need</Text>
            <Text style={styles.resultText}>{result.whatTheyNeed}</Text>
            <Text style={styles.resultTitle}>What you need</Text>
            <Text style={styles.resultText}>{result.whatYouNeed}</Text>
          </View>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  prompt: { fontSize: 18, fontWeight: '500', color: COLORS.text, marginBottom: 16 },
  label: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginBottom: 8 },
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
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginTop: 20,
  },
  resultTitle: { fontWeight: '700', color: COLORS.accent, fontSize: 15, marginTop: 12, marginBottom: 4 },
  resultText: { color: COLORS.text, fontSize: 15, lineHeight: 22, marginBottom: 4 },
});
