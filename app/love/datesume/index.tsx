import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../src/lib/constants';
import { useDatesumeStore } from '../../../src/stores/datesumeStore';
import { RELATIONSHIP_STATUS_LABELS } from '../../../src/types/datesume';

const ACCENT = '#EC4899';

export default function DatesumeIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datesume, init } = useDatesumeStore();

  useEffect(() => {
    init();
  }, [init]);

  const d = datesume;
  if (!d) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header card */}
      <Pressable style={styles.card} onPress={() => router.push('/love/datesume/edit-header')}>
        <View style={styles.headerRow}>
          {d.photoUri ? (
            <Image source={{ uri: d.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.displayName}>{d.displayName || 'Your name'}</Text>
            {(d.age != null || d.location) && (
              <Text style={styles.meta}>
                {[d.age != null ? `${d.age}` : null, d.location].filter(Boolean).join(' · ')}
              </Text>
            )}
            {d.tagline ? <Text style={styles.tagline}>{d.tagline}</Text> : null}
            <Text style={styles.status}>{RELATIONSHIP_STATUS_LABELS[d.relationshipStatus]}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </Pressable>

      {/* Summary */}
      <SectionCard
        title="Summary"
        onPress={() => router.push('/love/datesume/edit-summary')}
        preview={d.summary || 'Add a short summary'}
      />

      {/* Relationship experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relationship experience</Text>
        {d.relationships.length === 0 ? (
          <Pressable style={styles.addCard} onPress={() => router.push('/love/datesume/add-relationship')}>
            <Ionicons name="add-circle-outline" size={28} color={ACCENT} />
            <Text style={styles.addCardText}>Add experience</Text>
          </Pressable>
        ) : (
          <>
            {d.relationships.map((r) => (
              <Pressable
                key={r.id}
                style={styles.jobCard}
                onPress={() => router.push(`/love/datesume/${r.id}`)}
              >
                <Text style={styles.jobTitle}>{r.title} {r.partnerName && !r.isAnonymous ? `— ${r.partnerName}` : ''}</Text>
                <Text style={styles.jobYears}>{r.startYear}{r.endYear != null ? ` – ${r.endYear}` : r.isOngoing ? ' – present' : ''}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} style={styles.cardChevron} />
              </Pressable>
            ))}
            <Pressable style={styles.addRow} onPress={() => router.push('/love/datesume/add-relationship')}>
              <Ionicons name="add" size={20} color={ACCENT} />
              <Text style={styles.addRowText}>Add experience</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Skills */}
      <SectionCard
        title="Skills"
        onPress={() => router.push('/love/datesume/edit-skills')}
        preview={
          [...d.skills.expert, ...d.skills.proficient, ...d.skills.developing].length === 0
            ? 'Expert, proficient, developing'
            : `${d.skills.expert.length + d.skills.proficient.length + d.skills.developing.length} skills`
        }
      />

      {/* Growth */}
      <SectionCard
        title="Growth & education"
        onPress={() => router.push('/love/datesume/edit-growth')}
        preview={d.growthJourney.length === 0 ? 'Therapy, books, experiences' : `${d.growthJourney.length} entries`}
      />

      {/* Milestones */}
      <SectionCard
        title="Milestones"
        onPress={() => router.push('/love/datesume/edit-milestones')}
        preview={d.milestones.length === 0 ? 'Relationship milestones' : `${d.milestones.length} milestones`}
      />

      {/* Style */}
      <SectionCard
        title="Style"
        onPress={() => router.push('/love/datesume/edit-style')}
        preview={d.attachmentStyle || d.loveLanguages?.length ? 'Attachment, love languages' : 'Attachment & love languages'}
      />

      {/* Offerings */}
      <SectionCard
        title="What I offer"
        onPress={() => router.push('/love/datesume/edit-offerings')}
        preview="Daily life, adventures, tough times, fun"
      />

      {/* Testimonials */}
      <SectionCard
        title="Testimonials"
        onPress={() => router.push('/love/datesume/edit-testimonials')}
        preview={d.testimonials.length === 0 ? 'What others say about you' : `${d.testimonials.length} testimonials`}
      />

      {/* Logistics */}
      <SectionCard
        title="Logistics"
        onPress={() => router.push('/love/datesume/edit-logistics')}
        preview="LDR, travel, kids, marriage"
      />

      {/* Good to Know */}
      <SectionCard
        title="Good to Know"
        onPress={() => router.push('/love/datesume/edit/good-to-know')}
        preview={
          !d.goodToKnow
            ? 'Attachment, values, conflict, love style'
            : [
                d.goodToKnow.attachmentStyle,
                (d.goodToKnow.coreValues?.length ?? 0) > 0 && 'Values',
                (d.goodToKnow.threeThingsToKnow?.length ?? 0) > 0 && '3 things',
              ]
                .filter(Boolean)
                .join(' · ') || 'Compatibility & lifestyle'
        }
      />

      <Pressable style={styles.primaryBtn} onPress={() => router.push('/love/datesume/preview')}>
        <Text style={styles.primaryBtnText}>Preview & share</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionCard({
  title,
  onPress,
  preview,
}: {
  title: string;
  onPress: () => void;
  preview: string;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </View>
      <Text style={styles.cardPreview} numberOfLines={2}>{preview}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  muted: { fontSize: 14, color: COLORS.textMuted, padding: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  headerText: { flex: 1, marginLeft: 14 },
  displayName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },
  status: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  section: { marginTop: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10 },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.input,
    gap: 8,
  },
  addCardText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  jobYears: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  cardChevron: { position: 'absolute', right: 8, top: 14 },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  addRowText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardPreview: { fontSize: 14, color: COLORS.textMuted, marginTop: 6 },
  primaryBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});
