/**
 * Guest web flow — no app download. Route: /show-up/:token
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShowUpGuestQuestionnaire } from '../../src/components/show-up/ShowUpGuestQuestionnaire';
import { rpcGetShowUpInvitePreview } from '../../src/services/showUpService';
import { COLORS, SPACING } from '../../src/lib/constants';

export default function ShowUpGuestScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token: string | string[] }>();
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const p = await rpcGetShowUpInvitePreview(String(token));
      if (!cancelled) {
        setPreview(p);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.err}>Missing link.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!preview || preview.ok === false) {
    const err = String(preview?.error ?? 'invalid');
    const inviter = preview?.inviter_display_name ? String(preview.inviter_display_name) : null;
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingHorizontal: SPACING.lg }]}>
        <Text style={styles.title}>
          {err === 'expired' ? 'This link has expired' : 'This link isn’t valid'}
        </Text>
        {inviter ? <Text style={styles.sub}>You can ask {inviter} for a new link.</Text> : null}
      </View>
    );
  }

  const inviterName = String(preview.inviter_display_name ?? 'Someone');
  const completed = preview.completed === true;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ShowUpGuestQuestionnaire token={String(token)} inviterName={inviterName} alreadyCompleted={completed} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  sub: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12, textAlign: 'center' },
  err: { color: COLORS.error, fontSize: 16 },
});
