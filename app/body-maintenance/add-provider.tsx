import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useBodyMaintenanceStore } from '../../src/stores/bodyMaintenanceStore';
import type { ProviderType, PaymentMethod, PaymentMethodType, Frequency } from '../../src/types/bodyMaintenance';

const PROVIDER_TYPES: { type: ProviderType; emoji: string }[] = [
  { type: 'hair', emoji: '💇' },
  { type: 'nails', emoji: '💅' },
  { type: 'spa', emoji: '🧖' },
  { type: 'dentist', emoji: '🦷' },
  { type: 'brows', emoji: '👁️' },
  { type: 'skincare', emoji: '🧴' },
  { type: 'tailor', emoji: '👔' },
  { type: 'cleaning', emoji: '🧹' },
  { type: 'other', emoji: '✨' },
];

const PAYMENT_OPTIONS: PaymentMethodType[] = ['cash', 'card', 'zelle', 'venmo', 'paypal', 'cashapp', 'applepay', 'other'];

export default function AddProviderScreen() {
  const router = useRouter();
  const addProvider = useBodyMaintenanceStore((s) => s.addProvider);

  const [type, setType] = useState<ProviderType>('hair');
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentDetails, setPaymentDetails] = useState('');
  const [typicalCost, setTypicalCost] = useState('');
  const [notes, setNotes] = useState('');
  const [frequencyType, setFrequencyType] = useState<'weekly' | 'monthly' | 'quarterly' | 'custom'>('monthly');
  const [customWeeks, setCustomWeeks] = useState('6');
  const [lastVisit, setLastVisit] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const togglePayment = (method: PaymentMethodType) => {
    setPaymentMethods((prev) => {
      const exists = prev.find((p) => p.type === method);
      if (exists) return prev.filter((p) => p.type !== method);
      return [...prev, { type: method, details: method === 'zelle' || method === 'venmo' ? paymentDetails : undefined }];
    });
  };

  const frequency: Frequency | undefined = frequencyType === 'custom'
    ? { type: 'every_x_days', value: Math.max(1, parseInt(customWeeks, 10) * 7) ?? 42 }
    : frequencyType === 'weekly'
      ? { type: 'weekly' }
      : frequencyType === 'monthly'
        ? { type: 'monthly' }
        : { type: 'quarterly' };

  const nextDue = lastVisit && frequency
    ? (() => {
        const d = new Date(lastVisit);
        if (frequency.type === 'weekly') d.setDate(d.getDate() + 7);
        else if (frequency.type === 'monthly') d.setMonth(d.getMonth() + 1);
        else if (frequency.type === 'quarterly') d.setMonth(d.getMonth() + 3);
        else if (frequency.type === 'every_x_days' && frequency.value) d.setDate(d.getDate() + frequency.value);
        return d.toISOString().slice(0, 10);
      })()
    : undefined;

  const handleSave = () => {
    addProvider({
      type,
      businessName: businessName.trim() || 'Provider',
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      paymentMethods: paymentMethods.length ? paymentMethods : [{ type: 'cash' }],
      typicalCost: typicalCost.trim() || undefined,
      frequency,
      lastVisit: lastVisit || undefined,
      nextDue,
      reminderEnabled,
      notes: notes.trim() || undefined,
    });
    router.back();
  };

  const canSave = businessName.trim().length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Type</Text>
      <View style={styles.chipRow}>
        {PROVIDER_TYPES.map((p) => (
          <Pressable
            key={p.type}
            style={[styles.chip, type === p.type && styles.chipSelected]}
            onPress={() => setType(p.type)}
          >
            <Text style={styles.chipText}>{p.emoji} {p.type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Details</Text>
      <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Name / Business" placeholderTextColor={COLORS.textMuted} />
      <TextInput style={styles.input} value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person (optional)" placeholderTextColor={COLORS.textMuted} />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={COLORS.textMuted} />
      <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="Website / Booking link (optional)" placeholderTextColor={COLORS.textMuted} keyboardType="url" />

      <Text style={styles.sectionTitle}>Payment</Text>
      <View style={styles.chipRow}>
        {PAYMENT_OPTIONS.map((pm) => (
          <Pressable key={pm} style={[styles.chip, paymentMethods.some((p) => p.type === pm) && styles.chipSelected]} onPress={() => togglePayment(pm)}>
            <Text style={styles.chipText}>{pm}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput style={styles.input} value={paymentDetails} onChangeText={setPaymentDetails} placeholder="Zelle/Venmo details (e.g. email or @user)" placeholderTextColor={COLORS.textMuted} />
      <TextInput style={styles.input} value={typicalCost} onChangeText={setTypicalCost} placeholder="Typical cost (e.g. $75 + tip)" placeholderTextColor={COLORS.textMuted} />

      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={COLORS.textMuted} multiline />

      <Text style={styles.sectionTitle}>Scheduling</Text>
      <Text style={styles.label}>How often do you go?</Text>
      <View style={styles.chipRow}>
        {(['weekly', 'monthly', 'quarterly', 'custom'] as const).map((f) => (
          <Pressable key={f} style={[styles.chip, frequencyType === f && styles.chipSelected]} onPress={() => setFrequencyType(f)}>
            <Text style={styles.chipText}>{f === 'custom' ? 'Every X weeks' : f}</Text>
          </Pressable>
        ))}
      </View>
      {frequencyType === 'custom' && (
        <TextInput style={styles.input} value={customWeeks} onChangeText={setCustomWeeks} placeholder="Weeks (e.g. 6)" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
      )}
      <TextInput style={styles.input} value={lastVisit} onChangeText={setLastVisit} placeholder="Last visit (YYYY-MM-DD)" placeholderTextColor={COLORS.textMuted} />
      <Pressable style={styles.switchRow} onPress={() => setReminderEnabled(!reminderEnabled)}>
        <Text style={styles.switchLabel}>Remind me when due</Text>
        <View style={[styles.toggle, reminderEnabled && styles.toggleOn]}>
          <View style={[styles.toggleThumb, reminderEnabled && styles.toggleThumbOn]} />
        </View>
      </Pressable>

      <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} onPress={handleSave} disabled={!canSave}>
        <Text style={styles.saveBtnText}>Save Provider</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.card },
  chipSelected: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.text },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.input, padding: 14, fontSize: 16, color: COLORS.text, marginBottom: 12 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  switchLabel: { fontSize: 15, color: COLORS.text },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', paddingHorizontal: 4 },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.textMuted },
  toggleThumbOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },
  saveBtn: { marginTop: 24, backgroundColor: COLORS.accent, padding: 16, borderRadius: BORDER_RADIUS.button, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
