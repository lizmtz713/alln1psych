import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getPersonality, getRelationshipDynamic } from '../../src/services/personology';
import { sendMessageWithSystemPrompt } from '../../src/services/ai';
import { useCircleStore } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';

type RelType = 'romantic' | 'family' | 'friendship' | 'work';

export default function RelationshipCheck() {
  const router = useRouter();
  const userBirthday = useUserStore((s) => s.birthday);
  const [myBirthday, setMyBirthday] = useState('');
  const [theirBirthday, setTheirBirthday] = useState('');
  const [theirName, setTheirName] = useState('');
  const [relType, setRelType] = useState<RelType | null>(null);
  const [result, setResult] = useState<{ me: any; them: any; dynamic: any; myIso: string; theirIso: string } | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userBirthday && !myBirthday) {
      const d = new Date(userBirthday);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        setMyBirthday(`${mm}/${dd}/${yyyy}`);
      }
    }
  }, [userBirthday, myBirthday]);

  function formatBirthday(text: string, setter: (v: string) => void) {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) setter(cleaned);
    else if (cleaned.length <= 4) setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
    else setter(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
  }

  function parseBirthday(mmddyyyy: string): string {
    const parts = mmddyyyy.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return '';
  }

  async function handleCheck() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const myIso = parseBirthday(myBirthday);
    const theirIso = parseBirthday(theirBirthday);
    if (!myIso || !theirIso) return;
    const me = getPersonality(myIso);
    const them = getPersonality(theirIso);
    const dynamic = getRelationshipDynamic(myIso, theirIso);
    setResult({ me, them, dynamic, myIso, theirIso });
    setLoading(true);
    try {
      const name = theirName.trim() || 'them';
      const response = await sendMessageWithSystemPrompt(
        [{ role: 'user', content: `My personality: ${me?.name} (${me?.communicationStyle}). Their personality: ${them?.name} (${them?.communicationStyle}). Relationship: ${relType}. Their name: ${name}. Give me a relationship insight.` }],
        `You are Psych, a relationship intelligence companion. Based on two personality profiles and their relationship type, give a warm, specific, insightful reading.\n\nFor ROMANTIC: Chemistry, communication differences, what makes them click, what could pull them apart, one tip for long-term success.\nFor FAMILY: Generational dynamics, communication gaps, unspoken expectations, how to bridge differences.\nFor FRIENDSHIP: What drew them together, what keeps it strong, what could cause drift, how to maintain it.\nFor WORK: Professional communication styles, collaboration strengths, potential friction, how to get the best from each other.\n\nBe specific to THEIR combination. Use "you" and "${name}". Keep it 4-6 sentences. End with one surprising insight they probably have not considered. Be warm and real, not clinical.`
      );
      setAiInsight(response ?? '');
    } catch (e) {
      if (__DEV__) console.warn('Relationship check AI failed:', e);
      setAiInsight('');
    }
    setLoading(false);
  }

  function handleAddToCircle() {
    if (!result || !theirName.trim()) return;
    useCircleStore.getState().addMember({
      name: theirName.trim(),
      relationship: 'friend',
      contactMethod: '',
      sharingLevel: 'full',
      birthday: result.theirIso,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleTryAnother() {
    setMyBirthday(userBirthday ? (() => { const d = new Date(userBirthday); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`; })() : '');
    setTheirBirthday('');
    setTheirName('');
    setRelType(null);
    setResult(null);
    setAiInsight('');
  }

  const canCheck = myBirthday.length === 10 && theirBirthday.length === 10 && relType !== null;
  const relTypes: { type: RelType; icon: string; label: string }[] = [
    { type: 'romantic', icon: '💕', label: 'Romantic' },
    { type: 'family', icon: '👨‍👩‍👧', label: 'Family' },
    { type: 'friendship', icon: '🤝', label: 'Friendship' },
    { type: 'work', icon: '💼', label: 'Work' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090F' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <Pressable onPress={() => router.back()}><Text style={{ color: '#8888A0', fontSize: 16 }}>← Back</Text></Pressable>
        <Text style={{ color: '#F0F0F5', fontSize: 18, fontWeight: '600' }}>Relationship Check</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <Text style={{ color: '#8888A0', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>Enter two birthdays. Understand the dynamic.</Text>
            <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 6 }}>Your birthday</Text>
            <TextInput style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} placeholder="MM/DD/YYYY" placeholderTextColor="#55556A" value={myBirthday} onChangeText={(t) => formatBirthday(t, setMyBirthday)} keyboardType="number-pad" maxLength={10} />
            <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 6 }}>Their name (optional)</Text>
            <TextInput style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} placeholder="e.g. Alex, Mom, my boss" placeholderTextColor="#55556A" value={theirName} onChangeText={setTheirName} />
            <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 6 }}>Their birthday</Text>
            <TextInput style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20 }} placeholder="MM/DD/YYYY" placeholderTextColor="#55556A" value={theirBirthday} onChangeText={(t) => formatBirthday(t, setTheirBirthday)} keyboardType="number-pad" maxLength={10} />
            <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 8 }}>What's the relationship?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {relTypes.map((r) => (
                <Pressable key={r.type} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRelType(r.type); }} style={{ backgroundColor: relType === r.type ? 'rgba(124,77,255,0.15)' : '#111118', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: relType === r.type ? '#7C4DFF' : 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ color: relType === r.type ? '#7C4DFF' : '#8888A0', fontSize: 14 }}>{r.icon} {r.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={handleCheck} disabled={!canCheck} style={{ backgroundColor: canCheck ? '#7C4DFF' : '#2A2A3A', borderRadius: 14, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: canCheck ? '#fff' : '#55556A', fontSize: 17, fontWeight: '600' }}>Check It</Text>
            </Pressable>
            <Text style={{ color: '#55556A', fontSize: 11, textAlign: 'center', marginTop: 16, lineHeight: 16 }}>Personality insights are based on psychological frameworks and increase self-awareness. They are not deterministic. Your choices and growth matter more than any profile.</Text>
          </>
        ) : (
          <>
            {result.them && (
              <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#7C4DFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{theirName.trim() || 'Them'}: {result.them.name}</Text>
                <Text style={{ color: '#B0B0C0', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>{result.them.communicationStyle}</Text>
                <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 4 }}>Strengths: {result.them.strengths.join(', ')}</Text>
                <Text style={{ color: '#8888A0', fontSize: 13, marginBottom: 4 }}>Under stress: {result.them.stressResponse}</Text>
                <Text style={{ color: '#8888A0', fontSize: 13 }}>Needs: {result.them.needsInRelationships}</Text>
              </View>
            )}
            {result.dynamic && (
              <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#7C4DFF', fontSize: 15, fontWeight: '600', marginBottom: 10 }}>Your Dynamic</Text>
                <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Strengths</Text>
                {result.dynamic.strengths.map((s: string, i: number) => <Text key={i} style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18, marginBottom: 3, marginLeft: 8 }}>• {s}</Text>)}
                <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Watch For</Text>
                {result.dynamic.frictionPoints.map((f: string, i: number) => <Text key={i} style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18, marginBottom: 3, marginLeft: 8 }}>• {f}</Text>)}
                <Text style={{ color: '#F0F0F5', fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 }}>Communication Tip</Text>
                <Text style={{ color: '#B0B0C0', fontSize: 13, lineHeight: 18 }}>{result.dynamic.communicationTip}</Text>
              </View>
            )}
            {loading && <ActivityIndicator color="#7C4DFF" style={{ marginVertical: 20 }} />}
            {aiInsight ? (
              <View style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124,77,255,0.3)' }}>
                <Text style={{ color: '#7C4DFF', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Psych says</Text>
                <Text style={{ color: '#E0E0E0', fontSize: 15, lineHeight: 22 }}>{aiInsight}</Text>
              </View>
            ) : null}
            <View style={{ gap: 10, marginTop: 8 }}>
              {theirName.trim().length > 0 && (
                <Pressable onPress={handleAddToCircle} style={{ backgroundColor: '#7C4DFF', borderRadius: 14, padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add {theirName.trim()} to Circle</Text>
                </Pressable>
              )}
              <Pressable onPress={handleTryAnother} style={{ backgroundColor: '#111118', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#8888A0', fontSize: 16 }}>Try Another</Text>
              </Pressable>
              <Pressable onPress={() => router.back()} style={{ padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#55556A', fontSize: 14 }}>Done</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
