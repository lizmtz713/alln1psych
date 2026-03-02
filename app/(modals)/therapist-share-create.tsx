/**
 * Create Report — choose range, expiry, max views; create share link and copy.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useTherapistShareStore } from '../../src/stores/therapistShareStore';
import { useAuthStore } from '../../src/stores/authStore';
import type { SharedReportConfig } from '../../src/types/therapist-share';
import type { ExportRange } from '../../src/services/exportData';

const BG = COLORS.background;
const CARD = COLORS.surface;
const TEXT = COLORS.text;
const MUTED = COLORS.textMuted;
const SECONDARY = COLORS.textSecondary;
const ACCENT = COLORS.accent;
const BORDER = 'rgba(255,255,255,0.08)';

const RANGE_OPTIONS: { value: ExportRange; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

const EXPIRY_OPTIONS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function TherapistShareCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { createReport, error } = useTherapistShareStore();

  const [range, setRange] = useState<ExportRange>('30');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [maxViews, setMaxViews] = useState<number | null>(10);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ short_code: string; token: string } | null>(null);

  const handleCreate = async () => {
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to create a shared report.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCreating(true);
    const config: SharedReportConfig = {
      range,
      includeJournal: true,
      includeConversations: true,
      includeMoodCheckins: true,
      includeEducation: true,
      includeGratitude: true,
      includeTriggerMaps: true,
    };
    const report = await createReport(userId, config, expiresInDays, maxViews);
    setCreating(false);
    if (report) {
      setCreated({ short_code: report.short_code, token: report.token });
    }
  };

  const handleCopyLink = () => {
    if (!created) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const link = `alln1psych://share/${created.short_code}?t=${created.token}`;
    Clipboard.setStringAsync(link);
    Alert.alert('Copied', 'Share link copied to clipboard.');
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
    router.back(); // pop create and list
  };

  if (created) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleDone}>
            <Ionicons name="close" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.title}>Report created</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.temperature.green} />
            <Text style={styles.successTitle}>Share link ready</Text>
            <Text style={styles.successSub}>
              Send this link to your provider. They can open it to view the report.
            </Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText} selectable>
                {created.short_code}
              </Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Copy share link</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleDone}>
              <Text style={styles.secondaryBtnText}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Create Report</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Date range</Text>
        <View style={styles.optionsRow}>
          {RANGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.optionChip, range === opt.value && styles.optionChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRange(opt.value);
              }}
            >
              <Text style={[styles.optionChipText, range === opt.value && styles.optionChipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Link expires</Text>
        <View style={styles.optionsRow}>
          {EXPIRY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.days}
              style={[styles.optionChip, expiresInDays === opt.days && styles.optionChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpiresInDays(opt.days);
              }}
            >
              <Text
                style={[
                  styles.optionChipText,
                  expiresInDays === opt.days && styles.optionChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Max views (optional)</Text>
        <View style={styles.optionsRow}>
          <Pressable
            style={[styles.optionChip, maxViews === null && styles.optionChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMaxViews(null);
            }}
          >
            <Text style={[styles.optionChipText, maxViews === null && styles.optionChipTextActive]}>
              Unlimited
            </Text>
          </Pressable>
          {[5, 10, 25].map((n) => (
            <Pressable
              key={n}
              style={[styles.optionChip, maxViews === n && styles.optionChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMaxViews(n);
              }}
            >
              <Text
                style={[styles.optionChipText, maxViews === n && styles.optionChipTextActive]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.hint}>
          The report will include mood trends, conversation summaries, and themes based on your
          selected range.
        </Text>

        <Pressable
          style={[styles.primaryBtn, creating && styles.primaryBtnDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="link" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Create share link</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  headerRight: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    padding: 12,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.recording,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SECONDARY,
    marginBottom: 10,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  optionChipActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
  },
  optionChipText: {
    fontSize: 15,
    color: TEXT,
  },
  optionChipTextActive: {
    color: ACCENT,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: MUTED,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
    color: MUTED,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    padding: 24,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT,
    marginTop: 16,
  },
  successSub: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 22,
  },
  codeBox: {
    padding: 12,
    backgroundColor: BG,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: TEXT,
    letterSpacing: 2,
  },
});
