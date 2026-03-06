import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useLightsStore } from '../../src/stores/lightsStore';
import type { LightTier } from '../../src/types/lights';
import { TIER_LABELS } from '../../src/types/lights';
import type { RelationshipType } from '../../src/stores/circleStore';
import { pickContact, type PickedContact } from '../../src/services/contactsService';

const TIERS: { value: LightTier; label: string; hint: string }[] = [
  { value: 'five', label: 'Your 5', hint: 'Closest (weekly contact)' },
  { value: 'fifteen', label: 'Your 15', hint: 'Close friends (bi-weekly)' },
  { value: 'fifty', label: 'Your 50', hint: 'Friends (monthly)' },
  { value: 'network', label: 'Your 150', hint: 'Acquaintances (quarterly)' },
];

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: 'friend', label: 'Friend' },
  { value: 'partner', label: 'Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'other', label: 'Other' },
];

export default function AddLightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addLight = useLightsStore((s) => s.addLight);
  const [pickedContact, setPickedContact] = useState<PickedContact | null>(null);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<LightTier>('five');
  const [relationship, setRelationship] = useState<RelationshipType>('friend');
  const [howWeMet, setHowWeMet] = useState('');
  const [notes, setNotes] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const handleImportContacts = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContactLoading(true);
    try {
      const contact = await pickContact();
      if (contact) {
        setPickedContact(contact);
        setName(contact.name);
      } else {
        Alert.alert(
          'Contacts',
          'No contact was selected, or access was denied. You can add this person manually below.'
        );
      }
    } catch (e) {
      Alert.alert('Contacts', 'Could not open contacts. Add this person manually below.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLight({
      name: trimmed,
      relationship,
      contactMethod: pickedContact?.phone ?? pickedContact?.email ?? '',
      sharingLevel: 'full',
      birthday: pickedContact?.birthday ?? undefined,
      tier,
      howWeMet: howWeMet.trim() || undefined,
      notes: notes.trim() || undefined,
      contactId: pickedContact?.contactId ?? undefined,
      phone: pickedContact?.phone ?? undefined,
      email: pickedContact?.email ?? undefined,
      address: pickedContact?.address ?? undefined,
      photoUri: pickedContact?.photoUri ?? undefined,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Add a Light</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Add a Light</Text>
      <Text style={styles.subtitle}>Who is becoming part of your world?</Text>

      <View style={styles.divider} />

      <Pressable
        style={styles.importCard}
        onPress={handleImportContacts}
        disabled={contactLoading}
      >
        <Ionicons name="person-add" size={24} color={COLORS.accent} />
        <View style={styles.importText}>
          <Text style={styles.importTitle}>Import from Contacts</Text>
          <Text style={styles.importSub}>Pull name, photo, birthday, etc.</Text>
        </View>
        {contactLoading ? (
          <Text style={styles.importChevron}>...</Text>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        )}
      </Pressable>

      <Text style={styles.orDivider}>— or —</Text>

      {pickedContact ? (
        <View style={styles.contactSummary}>
          {pickedContact.photoUri ? (
            <Image source={{ uri: pickedContact.photoUri }} style={styles.contactPhoto} />
          ) : (
            <View style={styles.contactPhotoPlaceholder}>
              <Text style={styles.contactPhotoEmoji}>👤</Text>
            </View>
          )}
          <View style={styles.contactFields}>
            <Text style={styles.contactFieldLabel}>Name</Text>
            <Text style={styles.contactFieldValue}>{name} ✓ from contacts</Text>
            {pickedContact.phone ? (
              <>
                <Text style={styles.contactFieldLabel}>Phone</Text>
                <Text style={styles.contactFieldValue}>{pickedContact.phone} ✓</Text>
              </>
            ) : null}
            {pickedContact.email ? (
              <>
                <Text style={styles.contactFieldLabel}>Email</Text>
                <Text style={styles.contactFieldValue}>{pickedContact.email} ✓</Text>
              </>
            ) : null}
            {pickedContact.birthday ? (
              <>
                <Text style={styles.contactFieldLabel}>Birthday</Text>
                <Text style={styles.contactFieldValue}>{pickedContact.birthday} ✓</Text>
              </>
            ) : null}
            {pickedContact.address ? (
              <>
                <Text style={styles.contactFieldLabel}>Address</Text>
                <Text style={styles.contactFieldValue} numberOfLines={2}>{pickedContact.address} ✓</Text>
              </>
            ) : null}
          </View>
        </View>
      ) : null}

      <Text style={styles.label}>Their name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Which tier?</Text>
      {TIERS.map((t) => (
        <Pressable
          key={t.value}
          style={[styles.tierOption, tier === t.value && styles.tierOptionSelected]}
          onPress={() => setTier(t.value)}
        >
          <View style={styles.tierRadio}>
            {tier === t.value ? <View style={styles.tierRadioInner} /> : null}
          </View>
          <Text style={styles.tierLabel}>{TIER_LABELS[t.value]}</Text>
          <Text style={styles.tierHint}>{t.hint}</Text>
        </Pressable>
      ))}

      <Text style={styles.label}>How do you know them?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {RELATIONSHIPS.map((r) => (
            <Pressable
              key={r.value}
              style={[styles.chip, relationship === r.value && styles.chipSelected]}
              onPress={() => setRelationship(r.value)}
            >
              <Text style={[styles.chipText, relationship === r.value && styles.chipTextSelected]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.label}>How did you meet? (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. College roommate, 2018"
        placeholderTextColor={COLORS.textMuted}
        value={howWeMet}
        onChangeText={setHowWeMet}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Anything that helps you love them well"
        placeholderTextColor={COLORS.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>INVITE TO INGAUGE (optional)</Text>
      <Text style={styles.hint}>
        If they join, you can see their temperature (with permission), send Mind Mail, and know when they need support.
      </Text>
      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Send invite link</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable style={styles.primaryButton} onPress={handleAdd}>
        <Text style={styles.primaryButtonText}>Add Light</Text>
      </Pressable>

      <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  tierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierOptionSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  tierRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tierRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  tierLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tierHint: { fontSize: 13, color: COLORS.textMuted, marginLeft: 8 },
  chipScroll: { marginHorizontal: -24, marginBottom: 20 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text },
  chipTextSelected: { color: COLORS.accent, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16, lineHeight: 20 },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 15, color: COLORS.accent },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: BORDER_RADIUS.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  importText: { flex: 1, marginLeft: 14 },
  importTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  importSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  importChevron: { fontSize: 14, color: COLORS.textMuted },
  orDivider: { textAlign: 'center', fontSize: 14, color: COLORS.textMuted, marginVertical: 16 },
  contactSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  contactPhoto: { width: 64, height: 64, borderRadius: 32 },
  contactPhotoPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  contactPhotoEmoji: { fontSize: 28 },
  contactFields: { flex: 1, marginLeft: 16 },
  contactFieldLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 8 },
  contactFieldValue: { fontSize: 14, color: COLORS.text, marginTop: 2 },
});
