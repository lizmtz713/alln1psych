import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../src/lib/supabase';
import { useUserStore } from '../../src/stores/userStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { COLORS } from '../../src/lib/constants';

type SendType = 'open' | 'anonymous' | 'soft_share';

export default function HeartMailComposeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const profile = useUserStore((s) => s.profile);
  const members = useCircleStore((s) => s.members);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const userName = profile?.name || 'Someone';

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendType, setSendType] = useState<SendType>('open');
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleBack = () => {
    if (content.trim()) {
      Alert.alert('Discard?', 'You have unsaved changes.', [
        { text: 'Keep Writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSend = async () => {
    if (!content.trim() || !user?.id || !selectedRecipient) {
      if (!selectedRecipient) setShowPicker(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSending(true);

    try {
      const { error } = await supabase.from('heart_messages').insert({
        from_user_id: user.id,
        from_name: sendType === 'anonymous' ? 'Someone who cares' : userName,
        to_user_id: selectedRecipient.id,
        type: sendType,
        content: content.trim(),
        read: false,
        status: sendType === 'soft_share' ? 'pending' : 'sent',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Sent!', `Message sent to ${selectedRecipient.name}`);
      router.back();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Heart Mail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Pressable style={styles.row} onPress={() => setShowPicker(true)}>
          <Ionicons name="person" size={20} color={COLORS.accent} />
          <Text style={styles.rowLabel}>To:</Text>
          <Text style={styles.rowValue}>{selectedRecipient?.name || 'Choose...'}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        <View style={styles.typeRow}>
          {(['open', 'anonymous', 'soft_share'] as SendType[]).map((type) => (
            <Pressable
              key={type}
              style={[styles.typeBtn, sendType === type && styles.typeBtnActive]}
              onPress={() => setSendType(type)}
            >
              <Text style={[styles.typeBtnText, sendType === type && styles.typeBtnTextActive]}>
                {type === 'open' ? 'Open' : type === 'anonymous' ? 'Anon' : 'Soft'}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write from the heart..."
          placeholderTextColor={COLORS.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
        />

        <Pressable
          style={[styles.sendBtn, (!content.trim() || !selectedRecipient || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!content.trim() || !selectedRecipient || sending}
        >
          <Ionicons name="heart" size={20} color="#fff" />
          <Text style={styles.sendText}>{sending ? 'Sending...' : 'Send'}</Text>
        </Pressable>
      </ScrollView>

      {showPicker && (
        <View style={styles.picker}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose recipient</Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>
          <ScrollView>
            {members.map((m) => (
              <Pressable
                key={m.id}
                style={styles.pickerRow}
                onPress={() => {
                  setSelectedRecipient({ id: m.id, name: m.name });
                  setShowPicker(false);
                }}
              >
                <Text style={styles.pickerName}>{m.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 12, gap: 10 },
  rowLabel: { color: COLORS.textSecondary },
  rowValue: { flex: 1, color: COLORS.text, fontSize: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center' },
  typeBtnActive: { backgroundColor: COLORS.accent },
  typeBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, color: COLORS.text, fontSize: 16, minHeight: 150, textAlignVertical: 'top', marginBottom: 16 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, padding: 16, borderRadius: 12, gap: 8 },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  picker: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%', paddingBottom: 40 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  pickerRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerName: { fontSize: 16, color: COLORS.text },
});
