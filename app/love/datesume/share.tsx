/**
 * Datésumé — Privacy toggles + share options (copy text, share sheet).
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { RELATIONSHIP_STATUS_LABELS } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';

function buildPlainText(d: NonNullable<ReturnType<typeof useDatesumeStore.getState>['datesume']>): string {
  const lines: string[] = [];
  lines.push(d.displayName || 'Datésumé');
  if (d.age != null) lines.push(`Age: ${d.age}`);
  if (d.location) lines.push(`Location: ${d.location}`);
  lines.push(RELATIONSHIP_STATUS_LABELS[d.relationshipStatus]);
  if (d.tagline) lines.push(d.tagline);
  lines.push('');
  if (d.summary) {
    lines.push('Summary');
    lines.push(d.summary);
    lines.push('');
  }
  if ((d.lookingFor?.length ?? 0) > 0) {
    lines.push('Looking for: ' + (d.lookingFor ?? []).join(', '));
    lines.push('');
  }
  if (d.relationships.length > 0) {
    lines.push('Relationship experience');
    d.relationships.forEach((r) => {
      lines.push(`  ${r.title} ${r.startYear}${r.endYear != null ? ` – ${r.endYear}` : r.isOngoing ? ' – present' : ''}`);
      (r.lessonsLearned ?? []).forEach((l) => lines.push(`    • ${l}`));
    });
    lines.push('');
  }
  lines.push('Skills');
  if ((d.skills.expert?.length ?? 0) > 0) lines.push('  Expert: ' + (d.skills.expert ?? []).join(', '));
  if ((d.skills.proficient?.length ?? 0) > 0) lines.push('  Proficient: ' + (d.skills.proficient ?? []).join(', '));
  if ((d.skills.developing?.length ?? 0) > 0) lines.push('  Developing: ' + (d.skills.developing ?? []).join(', '));
  if (d.goodToKnow && ((d.goodToKnow.threeThingsToKnow?.length ?? 0) > 0 || d.goodToKnow.attachmentStyle || (d.goodToKnow.coreValues?.length ?? 0) > 0)) {
    lines.push('');
    lines.push('Good to Know');
    (d.goodToKnow.threeThingsToKnow ?? []).forEach((t) => lines.push('  • ' + t));
    if (d.goodToKnow.attachmentStyle) lines.push('  Attachment: ' + d.goodToKnow.attachmentStyle);
    if ((d.goodToKnow.coreValues?.length ?? 0) > 0) lines.push('  Values: ' + (d.goodToKnow.coreValues ?? []).join(', '));
  }
  return lines.join('\n');
}

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init, update } = useDatesumeStore();

  const [isPublic, setIsPublic] = useState(false);
  const [showRealNames, setShowRealNames] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const d = useDatesumeStore.getState().datesume;
    if (d) {
      setIsPublic(d.isPublic);
      setShowRealNames(d.showRealNames);
    }
  }, [datesume?.id, datesume?.updatedAt]);

  const updatePrivacy = (patch: { isPublic?: boolean; showRealNames?: boolean }) => {
    update(patch);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCopyText = async () => {
    const d = useDatesumeStore.getState().datesume;
    if (!d) return;
    const text = buildPlainText(d);
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Copied', 'Resume text copied to clipboard.');
  };

  const handleShare = async () => {
    const d = useDatesumeStore.getState().datesume;
    if (!d) return;
    const text = buildPlainText(d);
    try {
      await Share.share({ message: text, title: 'My Datésumé' });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Privacy</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Profile is public</Text>
        <Switch value={isPublic} onValueChange={(v) => { setIsPublic(v); if (!v) setShowRealNames(false); updatePrivacy({ isPublic: v, showRealNames: v ? showRealNames : false }); }} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Show real names in shared version</Text>
        <Switch value={showRealNames} onValueChange={(v) => { setShowRealNames(v); updatePrivacy({ showRealNames: v }); }} trackColor={{ false: COLORS.surfaceElevated, true: ACCENT }} thumbColor="#fff" disabled={!isPublic} />
      </View>

      <Text style={styles.sectionTitle}>Share</Text>
      <Pressable style={styles.actionBtn} onPress={handleCopyText}>
        <Text style={styles.actionBtnText}>Copy resume as text</Text>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={handleShare}>
        <Text style={styles.actionBtnText}>Share via…</Text>
      </Pressable>

      <Text style={styles.note}>Sharing is local only. No link or server is used; you copy or share the text yourself.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { fontSize: 15, color: COLORS.text, flex: 1 },
  actionBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  note: { fontSize: 13, color: COLORS.textMuted, marginTop: 16 },
});
