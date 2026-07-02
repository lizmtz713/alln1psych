/**
 * Datésumé — Read-only resume-style preview.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { RELATIONSHIP_STATUS_LABELS } from '../../../src/types/datesume';
import { COLORS, BORDER_RADIUS } from '../../../src/lib/constants';

const ACCENT = '#EC4899';

export default function PreviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init } = useDatesumeStore();

  useEffect(() => {
    init();
  }, [init]);

  const d = datesume;
  if (!d) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{d.displayName || 'Your name'}</Text>
        <View style={styles.metaRow}>
          {d.age != null && <Text style={styles.meta}>{d.age}</Text>}
          {d.location && <Text style={styles.meta}>{d.location}</Text>}
          <Text style={styles.meta}>{RELATIONSHIP_STATUS_LABELS[d.relationshipStatus]}</Text>
        </View>
        {d.tagline ? <Text style={styles.tagline}>{d.tagline}</Text> : null}
      </View>

      {d.summary ? (
        <Section title="Summary">
          <Text style={styles.body}>{d.summary}</Text>
        </Section>
      ) : null}

      {(d.lookingFor?.length ?? 0) > 0 && (
        <Section title="Looking for">
          <Text style={styles.body}>{(d.lookingFor ?? []).join(' · ')}</Text>
        </Section>
      )}

      {d.relationships.length > 0 && (
        <Section title="Relationship experience">
          {d.relationships.map((r) => (
            <View key={r.id} style={styles.job}>
              <Text style={styles.jobTitle}>{r.title}{r.partnerName && !r.isAnonymous ? ' — ' + r.partnerName : ''}</Text>
              <Text style={styles.jobYears}>{r.startYear}{r.endYear != null ? ' – ' + r.endYear : r.isOngoing ? ' – present' : ''}</Text>
              {(r.wins?.length ?? 0) > 0 && <Text style={styles.jobWins}>Wins: {(r.wins ?? []).join(', ')}</Text>}
              {(r.lessonsLearned?.length ?? 0) > 0 && <Text style={styles.jobLessons}>Lessons: {(r.lessonsLearned ?? []).join(', ')}</Text>}
            </View>
          ))}
        </Section>
      )}

      <Section title="Skills">
        {(d.skills.expert?.length ?? 0) > 0 && <Text style={styles.skillTier}>Expert: {(d.skills.expert ?? []).join(', ')}</Text>}
        {(d.skills.proficient?.length ?? 0) > 0 && <Text style={styles.skillTier}>Proficient: {(d.skills.proficient ?? []).join(', ')}</Text>}
        {(d.skills.developing?.length ?? 0) > 0 && <Text style={styles.skillTier}>Developing: {(d.skills.developing ?? []).join(', ')}</Text>}
      </Section>

      {d.growthJourney.length > 0 && (
        <Section title="Growth & education">
          {d.growthJourney.map((g) => (
            <View key={g.id} style={styles.growthItem}>
              <Text style={styles.growthTitle}>{g.title}</Text>
              <Text style={styles.growthMeta}>{g.type}{g.year ? ' · ' + g.year : ''}{g.ongoing ? ' · Ongoing' : ''}</Text>
              {(g.insights?.length ?? 0) > 0 && (g.insights ?? []).map((ins, i) => <Text key={i} style={styles.insight}>• {ins}</Text>)}
            </View>
          ))}
        </Section>
      )}

      {d.milestones.length > 0 && (
        <Section title="Milestones">
          <View style={styles.milestoneRow}>
            {d.milestones.map((m) => (
              <Text key={m.id} style={styles.milestone}>{m.emoji} {m.title}{m.year ? ' (' + m.year + ')' : ''}</Text>
            ))}
          </View>
        </Section>
      )}

      {(d.attachmentStyle || (d.loveLanguages?.length ?? 0) > 0) && (
        <Section title="Style">
          {d.attachmentStyle && <Text style={styles.body}>Attachment: {d.attachmentStyle}</Text>}
          {(d.loveLanguages?.length ?? 0) > 0 && <Text style={styles.body}>Love languages: {(d.loveLanguages ?? []).join(', ')}</Text>}
        </Section>
      )}

      {d.goodToKnow && (d.goodToKnow.attachmentStyle || (d.goodToKnow.coreValues?.length ?? 0) > 0 || (d.goodToKnow.threeThingsToKnow?.length ?? 0) > 0 || (d.goodToKnow.loveLanguages?.length ?? 0) > 0 || d.goodToKnow.energy || d.goodToKnow.schedule) && (
        <Section title="Good to Know">
          {(d.goodToKnow.threeThingsToKnow?.length ?? 0) > 0 && (
            <View style={styles.goodToKnowBlock}>
              {(d.goodToKnow.threeThingsToKnow ?? []).map((t, i) => (
                <Text key={i} style={styles.insight}>• {t}</Text>
              ))}
            </View>
          )}
          {(d.goodToKnow.attachmentStyle || d.goodToKnow.energy || d.goodToKnow.schedule) && (
            <Text style={styles.body}>
              {[d.goodToKnow.attachmentStyle && 'Attachment: ' + d.goodToKnow.attachmentStyle, d.goodToKnow.energy && 'Energy: ' + d.goodToKnow.energy, d.goodToKnow.schedule && 'Schedule: ' + d.goodToKnow.schedule].filter(Boolean).join(' · ')}
            </Text>
          )}
          {(d.goodToKnow.coreValues?.length ?? 0) > 0 && <Text style={styles.body}>Values: {(d.goodToKnow.coreValues ?? []).join(', ')}</Text>}
          {(d.goodToKnow.loveLanguages?.length ?? 0) > 0 && <Text style={styles.body}>Love languages: {(d.goodToKnow.loveLanguages ?? []).join(', ')}</Text>}
          {d.goodToKnow.howIFight && <Text style={styles.body}>Conflict: {d.goodToKnow.howIFight}</Text>}
          {d.goodToKnow.qualityTimeStyle && <Text style={styles.body}>Quality time: {d.goodToKnow.qualityTimeStyle}</Text>}
        </Section>
      )}

      {d.testimonials.length > 0 && (
        <Section title="Testimonials">
          {d.testimonials.map((t) => (
            <View key={t.id} style={styles.testimonial}>
              <Text style={styles.quote}>{'"' + t.quote + '"'}</Text>
              <Text style={styles.source}>— {t.source}</Text>
            </View>
          ))}
        </Section>
      )}

      <Section title="Logistics">
        {d.logistics?.openToLDR != null && <Text style={styles.body}>Open to LDR: {d.logistics.openToLDR ? 'Yes' : 'No'}</Text>}
        {d.logistics?.willingToTravel != null && <Text style={styles.body}>Willing to travel: {d.logistics.willingToTravel ? 'Yes' : 'No'}</Text>}
        {d.logistics?.wantsKids && <Text style={styles.body}>Kids: {d.logistics.wantsKids.replace('_', ' ')}</Text>}
        {d.logistics?.openToMarriage != null && <Text style={styles.body}>Open to marriage: {d.logistics.openToMarriage ? 'Yes' : 'No'}</Text>}
      </Section>

      <Pressable style={styles.shareBtn} onPress={() => router.push('/love/datesume/share')}>
        <Text style={styles.shareBtnText}>Share</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { fontSize: 14, color: COLORS.textMuted },
  header: { marginBottom: 24 },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  meta: { fontSize: 14, color: COLORS.textMuted },
  tagline: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: ACCENT, marginBottom: 10, letterSpacing: 0.5 },
  body: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  job: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  jobTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  jobYears: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  jobWins: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  jobLessons: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  skillTier: { fontSize: 14, color: COLORS.text, marginBottom: 6 },
  growthItem: { marginBottom: 12 },
  goodToKnowBlock: { marginBottom: 8 },
  growthTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  growthMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  insight: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  milestoneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  milestone: { fontSize: 14, color: COLORS.text },
  testimonial: { marginBottom: 12 },
  quote: { fontSize: 15, color: COLORS.text, fontStyle: 'italic' },
  source: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  shareBtn: { backgroundColor: ACCENT, paddingVertical: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center', marginTop: 16 },
  shareBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
