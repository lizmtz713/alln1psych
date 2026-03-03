/**
 * Create Report — config (range, sections), expiry, max views; then show/copy link.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useTherapistShareStore } from '../../src/stores/therapistShareStore';
import { useAuth } from '../../src/providers/AuthProvider';
import type { SharedReportConfig, ExportRange } from '../../src/types/therapist-share';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const RANGE_OPTIONS: { value: ExportRange; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

const EXPIRY_OPTIONS = [7, 14, 30, 90];

export default function TherapistShareCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { createReport, getShareUrl } = useTherapistShareStore();
  const [range, setRange] = useState<ExportRange>('30');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [maxViews, setMaxViews] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ short_code: string; token: string } | null>(null);

  const config: SharedReportConfig = {
    range,
    includeConversations: true,
    includeJournal: true,
    includeMood: true,
    includeEducation: true,
    includeGratitude: true,
    includeTriggers: true,
  };

  const handleCreate = async () => {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to create a report link.');
      return;
    }
    setCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const max = maxViews.trim() ? parseInt(maxViews, 10) : null;
    const safeMax = max ?? 7;
    if (maxViews.trim() && (isNaN(safeMax) || safeMax < 1)) {
      Alert.alert('Invalid value', 'Max views must be a positive number or leave empty for unlimited.');
      setCreating(false);
      return;
    }
    const report = await createReport(user.id, {
      config,
      expiresInDays,
      maxViews: max ?? null,
    });
    setCreating(false);
    if (report) {
      setCreated({ short_code: report.short_code, token: report.token });
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = getShareUrl(created.short_code, created.token);
    await Clipboard.setStringAsync(url);
    Alert.alert('Copied', 'Link copied to clipboard.');
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('therapist-share');
  };

  if (created) {
    const url = getShareUrl(created.short_code, created.token);
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.title}>Create Report</Text>
          <Pressable onPress={handleDone} style={styles.backButton}>
            <Ionicons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Report link created</Text>
            <Text style={styles.successHint}>Share this link with your provider. They can open it in a browser.</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} numberOfLines={3} selectable>
                {url}
              </Text>
            </View>
            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Copy link</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleDone}>
              <Text style={styles.secondaryBtnText}>Back to my links</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Create Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Date range</Text>
        <View style={styles.chipRow}>
          {RANGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                range === opt.value && styles.chipSelected,
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRange(opt.value); }}
            >
              <Text style={[styles.chipText, range === opt.value && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Link expires in</Text>
        <View style={styles.chipRow}>
          {EXPIRY_OPTIONS.map((days) => (
            <Pressable
              key={days}
              style={[styles.chip, expiresInDays === days && styles.chipSelected]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpiresInDays(days); }}
            >
              <Text style={[styles.chipText, expiresInDays === days && styles.chipTextSelected]}>
                {days} days
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Max views (optional)</Text>
        <TextInput
          style={styles.input}
          value={maxViews}
          onChangeText={setMaxViews}
          placeholder="Unlimited if empty"
          placeholderTextColor={TEXT_MUTED}
          keyboardType="number-pad"
        />

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            creating && { opacity: 0.6 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="link" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Create link</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '600', color: TEXT },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: { backgroundColor: COLORS.accentBg, borderColor: ACCENT },
  chipText: { ...TYPOGRAPHY.labelMd, color: TEXT },
  chipTextSelected: { color: ACCENT, fontWeight: '600' },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: TEXT,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  primaryBtnText: { ...TYPOGRAPHY.labelLg, color: '#fff' },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
  },
  secondaryBtnText: { ...TYPOGRAPHY.labelMd, color: TEXT_MUTED },
  successCard: {
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  successTitle: { ...TYPOGRAPHY.headlineMd, color: TEXT, marginTop: SPACING.md },
  successHint: { ...TYPOGRAPHY.bodySm, color: TEXT_MUTED, marginTop: SPACING.sm, textAlign: 'center' },
  urlBox: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    width: '100%',
  },
  urlText: { ...TYPOGRAPHY.bodySm, color: TEXT },
});
