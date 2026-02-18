import { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore, type AgeRange, type TherapyExperience, type Pronouns } from '../../src/stores/userStore';

const ALL_STEP_INDICES = [0, 1, 2, 3, 4, 5, 6, 7] as const; // name, age, pronouns, culture, family, language, strength, therapy

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: 'teen', label: 'Teen (13-17)' },
  { value: 'young-adult', label: 'Young Adult (18-25)' },
  { value: 'adult', label: 'Adult (26-45)' },
  { value: 'midlife', label: 'Midlife (46-60)' },
  { value: 'older-adult', label: 'Older Adult (60+)' },
];

const PRONOUN_OPTIONS: { value: 'she/her' | 'he/him' | 'they/them'; label: string }[] = [
  { value: 'she/her', label: 'she/her' },
  { value: 'he/him', label: 'he/him' },
  { value: 'they/them', label: 'they/them' },
];

const FAMILY_OPTIONS: { value: string }[] = [
  { value: 'Two parents' },
  { value: 'Single mom' },
  { value: 'Single dad' },
  { value: 'Grandparents' },
  { value: 'Foster/adopted' },
  { value: 'Other family' },
  { value: "It's complicated" },
];

const LANGUAGE_OPTIONS: { value: string }[] = [
  { value: 'English' },
  { value: 'Spanish' },
  { value: 'Both' },
  { value: 'Other' },
];

const STRENGTH_OPTIONS: { value: string }[] = [
  { value: 'Stay quiet and push through' },
  { value: 'Express everything — let it out' },
  { value: 'Protect others before yourself' },
  { value: "Handle it alone — don't burden anyone" },
  { value: "I'm still figuring that out" },
];

const THERAPY_OPTIONS: { value: TherapyExperience; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'tried-it', label: 'Tried it, didn\'t stick' },
  { value: 'currently', label: 'Currently in therapy' },
  { value: 'positive', label: 'Had a good experience' },
  { value: 'negative', label: 'Had a bad experience' },
];

const pillBase = {
  backgroundColor: '#111118',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
} as const;
const pillSelected = {
  borderColor: '#7C4DFF',
  backgroundColor: 'rgba(124,77,255,0.1)',
};

function isStepFilled(stepIndex: number, user: ReturnType<typeof useUserStore.getState>): boolean {
  switch (stepIndex) {
    case 0: return (user.name ?? '').trim() !== '';
    case 1: return user.ageRange != null;
    case 2: return user.pronouns != null;
    case 3: return (user.culturalBackgroundText ?? '').trim() !== '';
    case 4: return (user.familyStructure ?? '').trim() !== '';
    case 5: return (user.languageOfEmotion ?? '').trim() !== '';
    case 6: return (user.strengthMeaning ?? '').trim() !== '';
    case 7: return user.therapyExperience != null;
    default: return false;
  }
}

export default function IdentitySetupScreen() {
  const router = useRouter();
  const user = useUserStore();
  const setName = useUserStore((s) => s.setName);
  const setAgeRange = useUserStore((s) => s.setAgeRange);
  const setPronouns = useUserStore((s) => s.setPronouns);
  const setCustomPronouns = useUserStore((s) => s.setCustomPronouns);
  const setCulturalBackgroundText = useUserStore((s) => s.setCulturalBackgroundText);
  const setFamilyStructure = useUserStore((s) => s.setFamilyStructure);
  const setLanguageOfEmotion = useUserStore((s) => s.setLanguageOfEmotion);
  const setStrengthMeaning = useUserStore((s) => s.setStrengthMeaning);
  const setTherapyExperience = useUserStore((s) => s.setTherapyExperience);

  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState('');
  const [ageRange, setLocalAgeRange] = useState<AgeRange | null>(null);
  const [pronoun, setLocalPronoun] = useState<Pronouns | null>(null);
  const [pronounsCustom, setPronounsCustom] = useState('');
  const [culturalBackgroundText, setLocalCultural] = useState('');
  const [familyStructure, setLocalFamily] = useState('');
  const [languageOfEmotion, setLocalLanguage] = useState('');
  const [languageOther, setLanguageOther] = useState('');
  const [strengthMeaning, setLocalStrength] = useState('');
  const [therapyExperience, setLocalTherapy] = useState<TherapyExperience | null>(null);

  const visibleStepIndices = useMemo(
    () => ALL_STEP_INDICES.filter((i) => !isStepFilled(i, user)),
    [user.name, user.ageRange, user.pronouns, user.culturalBackgroundText, user.familyStructure, user.languageOfEmotion, user.strengthMeaning, user.therapyExperience]
  );

  useEffect(() => {
    const u = useUserStore.getState();
    setLocalName(u.name ?? '');
    setLocalAgeRange(u.ageRange ?? null);
    setLocalPronoun(u.pronouns ?? null);
    setPronounsCustom(u.customPronouns ?? '');
    setLocalCultural(u.culturalBackgroundText?.trim() ?? '');
    setLocalFamily(u.familyStructure?.trim() ?? '');
    setLocalLanguage(u.languageOfEmotion?.trim() ?? '');
    setLocalStrength(u.strengthMeaning?.trim() ?? '');
    setLocalTherapy(u.therapyExperience ?? null);
  }, []);

  const realStep = visibleStepIndices[step] ?? 0;
  const totalVisibleSteps = visibleStepIndices.length;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (totalVisibleSteps === 0) {
      handleComplete();
      return;
    }
    if (step < totalVisibleSteps - 1) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (totalVisibleSteps === 0) {
      handleComplete();
      return;
    }
    if (step < totalVisibleSteps - 1) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    if (localName.trim()) setName(localName.trim());
    setAgeRange(ageRange);
    setPronouns(pronoun === 'other' ? 'other' : pronoun);
    if (pronoun === 'other') setCustomPronouns(pronounsCustom.trim());
    setCulturalBackgroundText(culturalBackgroundText.trim());
    setFamilyStructure(familyStructure);
    setLanguageOfEmotion(languageOfEmotion === 'Other' ? languageOther.trim() || 'Other' : languageOfEmotion);
    setStrengthMeaning(strengthMeaning);
    setTherapyExperience(therapyExperience);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  const canProceed =
    realStep === 0 ? localName.trim().length > 0 :
    realStep === 1 ? true :
    realStep === 2 ? true :
    realStep === 3 ? true :
    realStep === 4 ? true :
    realStep === 5 ? (languageOfEmotion !== 'Other' || languageOther.trim().length > 0) :
    realStep === 6 ? true :
    realStep === 7 ? true : true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090F' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={{ color: '#8888A0', fontSize: 16 }}>← Back</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {totalVisibleSteps > 0 && Array.from({ length: totalVisibleSteps }).map((_, i) => (
            <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === step ? '#7C4DFF' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </View>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={{ color: '#8888A0', fontSize: 16 }}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Screen 0: Age */}
        {totalVisibleSteps === 0 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              You're all set.
            </Text>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleComplete(); }} style={{ marginTop: 32, backgroundColor: '#7C4DFF', borderRadius: 14, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Done</Text>
            </Pressable>
          </>
        )}
        {/* Screen 0: Name */}
        {totalVisibleSteps > 0 && realStep === 0 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              What should I call you?
            </Text>
            <TextInput
              style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 16, fontSize: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}
              placeholder="Your name"
              placeholderTextColor="#55556A"
              value={localName}
              onChangeText={setLocalName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </>
        )}

        {/* Screen 1: Age */}
        {totalVisibleSteps > 0 && realStep === 1 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              So Psych can speak your language —
            </Text>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              What stage of life are you in?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {AGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalAgeRange(opt.value); }}
                  style={[pillBase, ageRange === opt.value && pillSelected]}
                >
                  <Text style={{ color: ageRange === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 15 }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Screen 2: Pronouns */}
        {totalVisibleSteps > 0 && realStep === 2 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              What pronouns should Psych use for you?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {PRONOUN_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalPronoun(opt.value); }}
                  style={[pillBase, pronoun === opt.value && pillSelected]}
                >
                  <Text style={{ color: pronoun === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 15 }}>{opt.label}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalPronoun('other'); }}
                style={[pillBase, pronoun === 'other' && pillSelected]}
              >
                <Text style={{ color: pronoun === 'other' ? '#7C4DFF' : '#B0B0C0', fontSize: 15 }}>Something else</Text>
              </Pressable>
            </View>
            {pronoun === 'other' && (
              <TextInput
                style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }}
                placeholder="e.g. ze/zir"
                placeholderTextColor="#55556A"
                value={pronounsCustom}
                onChangeText={setPronounsCustom}
              />
            )}
            <Text style={{ color: '#8888A0', fontSize: 13, marginTop: 8 }}>This helps Psych talk to you naturally.</Text>
          </>
        )}

        {/* Screen 3: Cultural Background */}
        {totalVisibleSteps > 0 && realStep === 3 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
              What's your cultural background?
            </Text>
            <Text style={{ color: '#8888A0', fontSize: 14, marginBottom: 16 }}>
              This isn't about demographics — it's about understanding. Family, connection, and emotions look different in every culture.
            </Text>
            <TextInput
              style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }}
              placeholder="e.g. Mexican-American, Korean, Black, Southern, Military family..."
              placeholderTextColor="#55556A"
              value={culturalBackgroundText}
              onChangeText={setLocalCultural}
            />
            <Text style={{ color: '#8888A0', fontSize: 13 }}>You can be as specific or general as you want. This helps Psych understand your world.</Text>
          </>
        )}

        {/* Screen 4: Family Structure */}
        {totalVisibleSteps > 0 && realStep === 4 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
              Who raised you?
            </Text>
            <Text style={{ color: '#8888A0', fontSize: 14, marginBottom: 16 }}>
              This shapes how you learned about emotions, connection, and strength.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {FAMILY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalFamily(opt.value); }}
                  style={[pillBase, familyStructure === opt.value && pillSelected]}
                >
                  <Text style={{ color: familyStructure === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 15 }}>{opt.value}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Screen 5: Language of Emotion */}
        {totalVisibleSteps > 0 && realStep === 5 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              What language do you think and feel in?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalLanguage(opt.value); }}
                  style={[pillBase, languageOfEmotion === opt.value && pillSelected]}
                >
                  <Text style={{ color: languageOfEmotion === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 15 }}>{opt.value}</Text>
                </Pressable>
              ))}
            </View>
            {languageOfEmotion === 'Other' && (
              <TextInput
                style={{ backgroundColor: '#111118', color: '#F0F0F5', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 8 }}
                placeholder="e.g. Korean, Tagalog..."
                placeholderTextColor="#55556A"
                value={languageOther}
                onChangeText={setLanguageOther}
              />
            )}
            <Text style={{ color: '#8888A0', fontSize: 13, marginTop: 8 }}>
              Bilingual people often process emotions differently in each language. This helps Psych understand which words actually land for you.
            </Text>
          </>
        )}

        {/* Screen 6: What Strength Means */}
        {totalVisibleSteps > 0 && realStep === 6 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
              In your family, what did "being strong" mean?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {STRENGTH_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalStrength(opt.value); }}
                  style={[pillBase, strengthMeaning === opt.value && pillSelected]}
                >
                  <Text style={{ color: strengthMeaning === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 14 }}>{opt.value}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: '#8888A0', fontSize: 13 }}>
              There's no right answer. This helps Psych understand what you were taught — so we can figure out what actually works for YOU.
            </Text>
          </>
        )}

        {/* Screen 7: Therapy Experience */}
        {totalVisibleSteps > 0 && realStep === 7 && (
          <>
            <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              Have you ever been to therapy?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {THERAPY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocalTherapy(opt.value); }}
                  style={[pillBase, therapyExperience === opt.value && pillSelected]}
                >
                  <Text style={{ color: therapyExperience === opt.value ? '#7C4DFF' : '#B0B0C0', fontSize: 14 }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: '#8888A0', fontSize: 13 }}>
              No judgment either way. This helps Psych know how to talk to you — whether to explain basics or go deeper.
            </Text>
          </>
        )}

        {totalVisibleSteps > 0 && (
          <Pressable
            onPress={handleNext}
            style={{ marginTop: 32, backgroundColor: '#7C4DFF', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>{step === totalVisibleSteps - 1 ? 'Done' : 'Next'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
