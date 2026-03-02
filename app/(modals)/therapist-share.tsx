/**
 * Share with Provider — list shared reports, create new, copy link, revoke.
 */
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
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
import type { SharedReport } from '../../src/types/therapist-share';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const TEXT_DIM = COLORS.textMuted;
const ACCENT = COLORS.accent;

export default function TherapistShareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { reports, loading, error, fetchReports, revokeReport, clearError, getShareUrl } = useTherapistShareStore();

  useEffect(() => {
    if (user?.id) fetchReports(user.id);
  }, [user?.id]);

  const handleCopy = async (report: SharedReport) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = getShareUrl(report.short_code, report.token);
    await Clipboard.setStringAsync(url);
    // Could show a toast; for now user knows they copied
  };

  const handleRevoke = (report: SharedReport) => {
    Alert.alert(
      'Revoke link?',
      'The provider will no longer be able to open this report.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await revokeReport(report.id);
          },
        },
      ]
    );
  };

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('therapist-share-create');
  };

  const activeReports = reports.filter((r) => r.status === 'active');
  const revokedReports = reports.filter((r) => r.status === 'revoked');

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
        <Text style={styles.title}>Share with Provider</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError}>
              <Text style={styles.dismissError}>Dismiss</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.createCard, pressed && { opacity: 0.9 }]}
          onPress={handleCreate}
        >
          <Ionicons name="add-circle-outline" size={28} color={ACCENT} />
          <Text style={styles.createLabel}>Create new report link</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="small" color={ACCENT} style={{ marginTop: SPACING.xl }} />
        ) : (
          <>
            {activeReports.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Active links</Text>
                {activeReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onCopy={handleCopy}
                    onRevoke={handleRevoke}
                  />
                ))}
              </>
            ) : null}
            {revokedReports.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Revoked</Text>
                {revokedReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onCopy={handleCopy}
                    onRevoke={handleRevoke}
                    revoked
                  />
                ))}
              </>
            ) : null}
            {!loading && reports.length === 0 && (
              <Text style={styles.empty}>No report links yet. Create one to share with a provider.</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ReportCard({
  report,
  onCopy,
  onRevoke,
  revoked,
}: {
  report: SharedReport;
  onCopy: (r: SharedReport) => void;
  onRevoke: (r: SharedReport) => void;
  revoked?: boolean;
}) {
  const expiresAt = new Date(report.expires_at);
  const isExpired = expiresAt.getTime() < Date.now();
  const displayStatus = revoked ? 'Revoked' : isExpired ? 'Expired' : 'Active';

  return (
    <View style={[styles.card, revoked && styles.cardRevoked]}>
      <View style={styles.cardRow}>
        <Text style={styles.cardCode}>{report.short_code}</Text>
        <Text style={[styles.cardStatus, revoked && styles.cardStatusRevoked]}>{displayStatus}</Text>
      </View>
      <Text style={styles.cardMeta}>
        Expires {expiresAt.toLocaleDateString()}
        {report.max_views != null ? ` · ${report.max_views} max views` : ''}
        {report.view_count > 0 ? ` · ${report.view_count} view(s)` : ''}
      </Text>
      {!revoked && !isExpired && (
        <View style={styles.cardActions}>
          <Pressable style={styles.copyBtn} onPress={() => onCopy(report)}>
            <Ionicons name="copy-outline" size={18} color={ACCENT} />
            <Text style={styles.copyBtnText}>Copy link</Text>
          </Pressable>
          <Pressable style={styles.revokeBtn} onPress={() => onRevoke(report)}>
            <Text style={styles.revokeBtnText}>Revoke</Text>
          </Pressable>
        </View>
      )}
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
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: { fontSize: 14, color: COLORS.error, flex: 1 },
  dismissError: { fontSize: 14, color: ACCENT, fontWeight: '600' },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  createLabel: { ...TYPOGRAPHY.bodyMd, fontWeight: '600', color: ACCENT },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardRevoked: { opacity: 0.6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCode: { ...TYPOGRAPHY.labelLg, color: TEXT },
  cardStatus: { ...TYPOGRAPHY.labelSm, color: COLORS.success },
  cardStatusRevoked: { color: TEXT_DIM },
  cardMeta: { ...TYPOGRAPHY.secondary, color: TEXT_MUTED, marginTop: SPACING.xs },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  copyBtnText: { ...TYPOGRAPHY.labelMd, color: ACCENT },
  revokeBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  revokeBtnText: { ...TYPOGRAPHY.labelMd, color: COLORS.error },
  empty: { ...TYPOGRAPHY.bodyMd, color: TEXT_MUTED, marginTop: SPACING.lg, textAlign: 'center' },
});
