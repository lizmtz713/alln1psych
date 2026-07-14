import { View, Text, StyleSheet } from 'react-native';
import { EVIDENCE_LABELS, type EvidenceLevel } from '../types/evidence';
import { COLORS } from '../lib/constants';

export function EvidenceBadge({ level, showDescription = false }: { level: EvidenceLevel; showDescription?: boolean }) {
  const copy = EVIDENCE_LABELS[level];
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{copy.label}</Text>
      {showDescription ? <Text style={styles.description}>{copy.description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', gap: 5 },
  label: { color: COLORS.textMuted, borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: '700' },
  description: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, maxWidth: 340 },
});
