import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import * as Haptics from 'expo-haptics';
import {
  useUserStore,
  type Pronouns,
  type AgeGroup,
  type CommunicationPreference,
  type LoveLanguage,
  type CircleInvite,
  type LearningStyle,
} from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';
import { useSettingsStore } from '../../src/stores/settingsStore';
import {
  registerForPushNotifications,
  scheduleDailyCheckin,
  scheduleEveningReflection,
} from '../../src/services/notifications';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/sensitiveTopics';
import {
  CULTURAL_BACKGROUND_OPTIONS,
  ENVIRONMENT_UPBRINGING_OPTIONS,
  CULTURAL_VALUES_OPTIONS,
} from '../../src/lib/culturalOptions';

const TOTAL_STEPS = 10;

const LEARNING_STYLE_OPTIONS: { value: LearningStyle; label: string; emoji: string }[] = [
  { value: 'reading', label: 'Reading — I like to read and reflect', emoji: '📖' },
  { value: 'listening', label: 'Listening — I learn by hearing', emoji: '🎧' },
  { value: 'doing', label: 'Doing — I learn by trying things', emoji: '🎮' },
  { value: 'talking', label: 'Talking — I learn by discussing', emoji: '💬' },
];

const PRONOUN_OPTIONS: { value: Pronouns; label: string }[] = [
  { value: 'she/her', label: 'she/her' },
  { value: 'he/him', label: 'he/him' },
  { value: 'they/them', label: 'they/them' },
  { value: 'he/they', label: 'he/they' },
  { value: 'she/they', label: 'she/they' },
  { value: 'any', label: 'any pronouns' },
  { value: 'other', label: 'other' },
];

const AGE_OPTIONS: { value: AgeGroup; label: string; emoji: string }[] = [
  { value: 'under13', label: 'Under 13', emoji: '🌱' },
  { value: '13-17', label: '13–17', emoji: '✨' },
  { value: '18-25', label: '18–25', emoji: '🌟' },
  { value: '26-40', label: '26–40', emoji: '🌿' },
  { value: '41-60', label: '41–60', emoji: '🌙' },
  { value: '60+', label: '60+', emoji: '🕯️' },
];

const LOVE_LANGUAGE_OPTIONS: { value: LoveLanguage; label: string; sublabel: string }[] = [
  { value: 'words', label: 'Words of encouragement', sublabel: 'Words of Affirmation' },
  { value: 'quality-time', label: 'Quality time together', sublabel: 'Quality Time' },
  { value: 'acts-of-service', label: 'Thoughtful gestures', sublabel: 'Acts of Service' },
  { value: 'physical-touch', label: 'A warm hug', sublabel: 'Physical Touch' },
  { value: 'gifts', label: 'A small gift or surprise', sublabel: 'Gifts' },
  { value: 'unknown', label: "I'm not sure yet ✨", sublabel: '' },
];

const RELATIONSHIP_OPTIONS: { value: CircleInvite['relationship']; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [justSelected, setJustSelected] = useState(false);

  const { user } = useAuth();
  const {
    name,
    pronouns,
    customPronouns,
    ageGroup,
    communicationPreference,
    loveLanguage,
    circleInvite,
    sensitiveTopics,
    learningStyle,
    culturalBackground,
    environmentUpbringing,
    culturalValues,
    setName,
    setPronouns,
    setCustomPronouns,
    setAgeGroup,
    setCommunicationPreference,
    setLoveLanguage,
    setCircleInvite,
    setSensitiveTopics,
    setLearningStyle,
    setCulturalBackground,
    setEnvironmentUpbringing,
    setCulturalValues,
    culturalBackgroundOther,
    setCulturalBackgroundOther,
    completeOnboarding,
  } = useUserStore();

  const [inviteName, setInviteName] = useState(circleInvite?.name ?? '');
  const [inviteRelationship, setInviteRelationship] = useState<CircleInvite['relationship']>(
    circleInvite?.relationship ?? 'friend'
  );
  const [wantsToInvite, setWantsToInvite] = useState<boolean | null>(null);
  const [nameInputFocused, setNameInputFocused] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const setNotificationsCheckIn = useSettingsStore((s) => s.setNotificationsCheckIn);
  const stepOpacity = useRef(new Animated.Value(1)).current;

  const finishOnboarding = async () => {
    if (wantsToInvite === true && inviteName.trim()) {
      setCircleInvite({ name: inviteName.trim(), relationship: inviteRelationship });
    } else {
      setCircleInvite(null);
    }
    if (user?.id) {
      await completeOnboardingDb(user.id, {
        name: name.trim(),
        pronouns: pronouns ?? undefined,
        age_group: ageGroup,
        communication_preference: communicationPreference,
        love_language: loveLanguage,
      });
    }
    completeOnboarding();
    router.replace('/(modals)/identity-setup');
  };

  const runFadeThen = (next: () => void) => {
    Animated.timing(stepOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      next();
      stepOpacity.setValue(0);
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const goNext = () => {
    if (step >= TOTAL_STEPS) {
      setShowNotificationPrompt(true);
      return;
    }
    runFadeThen(() => setStep((s) => s + 1));
  };

  const goBack = () => {
    if (step <= 1) return;
    runFadeThen(() => setStep((s) => s - 1));
  };

  const handleChoiceThenNext = (setValue: () => void) => {
    setValue();
    setJustSelected(true);
    setTimeout(() => {
      setJustSelected(false);
      goNext();
    }, 800);
  };

  const handleNotificationPromptYes = async () => {
    setShowNotificationPrompt(false);
    await registerForPushNotifications();
    setNotificationsCheckIn(true);
    await scheduleDailyCheckin(9, 0).catch(() => {});
    await scheduleEveningReflection(21, 0).catch(() => {});
    await finishOnboarding();
  };

  const handleNotificationPromptLater = async () => {
    setShowNotificationPrompt(false);
    await finishOnboarding();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return name.trim().length > 0 && pronouns !== null;
      case 3:
        return ageGroup !== null;
      case 4:
        return communicationPreference !== null;
      case 5:
        return loveLanguage !== null;
      case 6:
        return true; // sensitive topics — optional
      case 7:
        return true; // cultural context — optional
      case 8:
        return true; // learning style — optional
      case 9:
        return wantsToInvite !== null && (wantsToInvite === false || inviteName.trim().length > 0);
      case 10:
        return true;
      default:
        return false;
    }
  };

  const handleSkip = () => {
    setWantsToInvite(false);
    setCircleInvite(null);
    goNext();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Modal
        visible={showNotificationPrompt}
        transparent
        animationType="fade"
        onRequestClose={handleNotificationPromptLater}
      >
        <View style={styles.notificationPromptOverlay}>
          <View style={styles.notificationPromptCard}>
            <Text style={styles.notificationPromptTitle}>
              Can Psych send you a daily check-in reminder?
            </Text>
            <Text style={styles.notificationPromptSub}>
              It's a gentle nudge to check in with yourself.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={handleNotificationPromptYes}
            >
              <Text style={styles.primaryButtonText}>Yes, remind me</Text>
            </Pressable>
            <Pressable style={styles.skipButton} onPress={handleNotificationPromptLater}>
              <Text style={styles.skipText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Back + Progress dots + step label */}
      <View style={styles.progressWrap}>
        {step > 1 ? (
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i + 1 === step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step} of {TOTAL_STEPS}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.stepContent, { opacity: stepOpacity }]}>
            {/* STEP 1 — Welcome */}
            {step === 1 && (
              <View style={styles.step}>
                <Text style={styles.welcomeTitle}>Welcome to your space.</Text>
                <Text style={styles.welcomeSub}>
                  Everything here is private. Everything here is just for you.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    goNext();
                  }}
                >
                  <Text style={styles.primaryButtonText}>Let's get to know each other</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2 — Name & Pronouns */}
            {step === 2 && (
              <View style={styles.step}>
                <Text style={styles.question}>What should I call you?</Text>
                <TextInput
                  style={[
                    styles.input,
                    nameInputFocused && styles.inputFocused,
                  ]}
                  placeholder="Your name"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameInputFocused(true)}
                  onBlur={() => setNameInputFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Text style={[styles.question, styles.questionMargin]}>And your pronouns?</Text>
                <View style={styles.chipRow}>
                  {PRONOUN_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.chip,
                        pronouns === opt.value && styles.chipSelected,
                      ]}
                      onPress={() => setPronouns(opt.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          pronouns === opt.value && styles.chipTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {pronouns === 'other' && (
                  <TextInput
                    style={[styles.input, styles.inputMargin]}
                    placeholder="Type your pronouns (e.g. ze/zir)"
                    placeholderTextColor={COLORS.textMuted}
                    value={customPronouns}
                    onChangeText={setCustomPronouns}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
                <Text style={styles.pronounHint}>You can change this anytime in settings.</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    !canProceed() && styles.primaryButtonDisabled,
                  ]}
                  onPress={goNext}
                  disabled={!canProceed()}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 3 — Age Group */}
            {step === 3 && (
              <View style={styles.step}>
                <Text style={styles.question}>This helps me speak your language.</Text>
                <View style={styles.cardGrid}>
                  {AGE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.ageCard,
                        ageGroup === opt.value && styles.ageCardSelected,
                      ]}
                      onPress={() => handleChoiceThenNext(() => setAgeGroup(opt.value))}
                    >
                      <Text style={styles.ageEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.ageLabel,
                          ageGroup === opt.value && styles.ageLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 4 — How You Communicate */}
            {step === 4 && (
              <View style={styles.step}>
                <Text style={styles.question}>Do you prefer to talk or type?</Text>
                <Pressable
                  style={[
                    styles.commCard,
                    communicationPreference === 'voice' && styles.commCardSelected,
                  ]}
                  onPress={() => handleChoiceThenNext(() => setCommunicationPreference('voice'))}
                >
                  <Ionicons
                    name="mic"
                    size={40}
                    color={communicationPreference === 'voice' ? COLORS.accent : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.commCardText,
                      communicationPreference === 'voice' && styles.commCardTextSelected,
                    ]}
                  >
                    I'd rather talk — like a real conversation
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.commCard,
                    communicationPreference === 'text' && styles.commCardSelected,
                  ]}
                  onPress={() => handleChoiceThenNext(() => setCommunicationPreference('text'))}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={40}
                    color={communicationPreference === 'text' ? COLORS.accent : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.commCardText,
                      communicationPreference === 'text' && styles.commCardTextSelected,
                    ]}
                  >
                    I'd rather type — I like to think before I share
                  </Text>
                </Pressable>
                <Text style={styles.note}>You can always switch anytime.</Text>
              </View>
            )}

            {/* STEP 5 — Love Language */}
            {step === 5 && (
              <View style={styles.step}>
                <Text style={styles.question}>How do you feel most cared for?</Text>
                <View style={styles.loveCardList}>
                  {LOVE_LANGUAGE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.loveCard,
                        loveLanguage === opt.value && styles.loveCardSelected,
                      ]}
                      onPress={() => handleChoiceThenNext(() => setLoveLanguage(opt.value))}
                    >
                      <Text
                        style={[
                          styles.loveCardLabel,
                          loveLanguage === opt.value && styles.loveCardLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {opt.sublabel ? (
                        <Text style={styles.loveCardSublabel}>{opt.sublabel}</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.loveLanguageNote}>
                  No worries — I'll learn what makes you feel cared for as we talk.
                </Text>
              </View>
            )}

            {/* STEP 6 — Sensitive Topics (optional) */}
            {step === 6 && (
              <View style={styles.step}>
                <Text style={styles.question}>Is there anything Psych should be extra gentle about?</Text>
                <Text style={styles.explain}>
                  This is optional. Skip anything you're not ready to share. It helps Psych use trauma-informed language and never push you.
                </Text>
                <View style={styles.chipRow}>
                  {SENSITIVE_TOPIC_OPTIONS.map((opt) => {
                    const isNone = opt.value === 'none';
                    const isSelected = isNone ? sensitiveTopics.length === 0 : sensitiveTopics.includes(opt.value);
                    const toggle = () => {
                      if (isNone) setSensitiveTopics([]);
                      else if (sensitiveTopics.includes(opt.value))
                        setSensitiveTopics(sensitiveTopics.filter((t) => t !== opt.value));
                      else setSensitiveTopics([...sensitiveTopics.filter((t) => t !== 'none'), opt.value]);
                    };
                    return (
                      <Pressable
                        key={opt.value}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={toggle}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={goNext}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 7 — Cultural context (optional) */}
            {step === 7 && (
              <View style={styles.step}>
                <Pressable style={styles.skipButton} onPress={goNext}>
                  <Text style={styles.skipText}>Skip</Text>
                </Pressable>
                <Text style={styles.question}>Where are you coming from?</Text>
                <Text style={styles.explain}>
                  This helps Psych understand your world — not just your words.
                </Text>
                <Text style={styles.smallLabel}>Which of these feel like part of your identity?</Text>
                <View style={styles.chipRow}>
                  {CULTURAL_BACKGROUND_OPTIONS.map((opt) => {
                    const isSelected = culturalBackground.includes(opt);
                    const toggle = () => {
                      if (isSelected) setCulturalBackground(culturalBackground.filter((c) => c !== opt));
                      else setCulturalBackground([...culturalBackground, opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.smallLabel}>What shaped how you grew up?</Text>
                <View style={styles.chipRow}>
                  {ENVIRONMENT_UPBRINGING_OPTIONS.map((opt) => {
                    const isSelected = environmentUpbringing.includes(opt);
                    const toggle = () => {
                      if (isSelected) setEnvironmentUpbringing(environmentUpbringing.filter((e) => e !== opt));
                      else setEnvironmentUpbringing([...environmentUpbringing, opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.smallLabel}>Which of these matter in your world?</Text>
                <View style={styles.chipRow}>
                  {CULTURAL_VALUES_OPTIONS.map((opt) => {
                    const isSelected = culturalValues.includes(opt);
                    const toggle = () => {
                      if (isSelected) setCulturalValues(culturalValues.filter((v) => v !== opt));
                      else setCulturalValues([...culturalValues, opt]);
                    };
                    return (
                      <Pressable key={opt} style={[styles.chip, isSelected && styles.chipSelected]} onPress={toggle}>
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {culturalBackground.includes('Other') && (
                  <TextInput
                    style={[styles.input, styles.inputMargin]}
                    placeholder="Describe (e.g. Southeast Asian, biracial...)"
                    placeholderTextColor={COLORS.textMuted}
                    value={culturalBackgroundOther}
                    onChangeText={setCulturalBackgroundOther}
                  />
                )}
                <Text style={styles.pronounHint}>You can change this anytime in settings.</Text>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={goNext}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 8 — Learning Style (optional) */}
            {step === 8 && (
              <View style={styles.step}>
                <Text style={styles.question}>How do you learn best?</Text>
                <Text style={styles.explain}>Optional — we'll tailor your manual and activities.</Text>
                <View style={styles.loveCardList}>
                  {LEARNING_STYLE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.loveCard, learningStyle === opt.value && styles.loveCardSelected]}
                      onPress={() => handleChoiceThenNext(() => setLearningStyle(opt.value))}
                    >
                      <Text style={styles.loveCardLabel}>{opt.emoji} {opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={goNext}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 9 — First Connection */}
            {step === 9 && (
              <View style={styles.step}>
                <Text style={styles.question}>
                  Would you like to connect someone who cares about you?
                </Text>
                <Text style={styles.explain}>
                  They'll see how you're doing (green / yellow / orange / red) but NEVER what
                  you've said here. You control everything.
                </Text>
                <View style={styles.twoOptions}>
                  <Pressable
                    style={[
                      styles.optionCard,
                      wantsToInvite === true && styles.optionCardSelected,
                    ]}
                    onPress={() => setWantsToInvite(true)}
                  >
                    <Text
                      style={[
                        styles.optionCardText,
                        wantsToInvite === true && styles.optionCardTextSelected,
                      ]}
                    >
                      Yes, invite someone
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.optionCard,
                      wantsToInvite === false && styles.optionCardSelected,
                    ]}
                    onPress={() => handleChoiceThenNext(() => {
                      setWantsToInvite(false);
                      setCircleInvite(null);
                    })}
                  >
                    <Text
                      style={[
                        styles.optionCardText,
                        wantsToInvite === false && styles.optionCardTextSelected,
                      ]}
                    >
                      Maybe later
                    </Text>
                  </Pressable>
                </View>
                {wantsToInvite === true && (
                  <View style={styles.inviteFields}>
                    <TextInput
                      style={styles.input}
                      placeholder="Their name"
                      placeholderTextColor={COLORS.textMuted}
                      value={inviteName}
                      onChangeText={setInviteName}
                    />
                    <Text style={styles.smallLabel}>Relationship</Text>
                    <View style={styles.chipRow}>
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <Pressable
                          key={opt.value}
                          style={[
                            styles.chip,
                            inviteRelationship === opt.value && styles.chipSelected,
                          ]}
                          onPress={() => setInviteRelationship(opt.value)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              inviteRelationship === opt.value && styles.chipTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    !canProceed() && styles.primaryButtonDisabled,
                  ]}
                  onPress={goNext}
                  disabled={!canProceed()}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </Pressable>
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 10 — Promise (last step: open notification modal directly) */}
            {step === 10 && (
              <View style={styles.step}>
                <Text style={styles.question}>Here's my promise to you:</Text>
                <View style={styles.promiseList}>
                  <Text style={styles.promiseLine}>I'll never judge you.</Text>
                  <Text style={styles.promiseLine}>I'll never share what you tell me.</Text>
                  <Text style={styles.promiseLine}>I'll always be here when you need me.</Text>
                  <Text style={[styles.promiseLine, styles.promiseLast]}>
                    You are not alone.
                  </Text>
                </View>
                <Text style={styles.disclaimerText}>
                  AllN1 Psych is an emotional wellness tool, not a medical device. It does not diagnose, treat, or cure any mental health condition. If you are in crisis, please contact 988 (Suicide & Crisis Lifeline), text HOME to 741741, or call 911. By using this app, you agree to our{' '}
                  <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://alln1network.com/terms')}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://alln1network.com/privacy')}>Privacy Policy</Text>.
                </Text>
                <Text style={styles.dataRetentionText}>
                  Your conversations and data are stored securely and encrypted. Only you can access your personal data. We never sell individual data. You can export or delete your data anytime from Settings.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                  onPress={() => setShowNotificationPrompt(true)}
                >
                  <Text style={styles.primaryButtonText}>I'm ready</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: { flex: 1 },
  progressWrap: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContent: {
    minHeight: 400,
  },
  step: {
    paddingTop: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 40,
  },
  welcomeSub: {
    fontSize: 18,
    color: COLORS.textMuted,
    lineHeight: 26,
    marginBottom: 48,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonPressed: { opacity: 0.9 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  questionMargin: { marginTop: 28, marginBottom: 12 },
  input: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: COLORS.accent,
  },
  inputMargin: { marginTop: 12, marginBottom: 4 },
  pronounHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  ageCard: {
    width: '30%',
    minWidth: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.inputSurface,
  },
  ageEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  ageLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  ageLabelSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  commCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  commCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.inputSurface,
  },
  commCardText: {
    fontSize: 16,
    color: COLORS.textMuted,
    flex: 1,
  },
  commCardTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  note: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 8,
  },
  loveCardList: { gap: 10, marginBottom: 12 },
  loveLanguageNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  loveCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  loveCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.inputSurface,
  },
  loveCardLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  loveCardLabelSelected: {
    color: COLORS.accentMuted,
  },
  loveCardSublabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  explain: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  twoOptions: { gap: 12, marginBottom: 20 },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.inputSurface,
  },
  optionCardText: {
    fontSize: 17,
    color: COLORS.textMuted,
  },
  optionCardTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  inviteFields: {
    marginBottom: 24,
  },
  smallLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  notificationPromptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notificationPromptCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 28,
    width: '100%',
    maxWidth: 340,
  },
  notificationPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  notificationPromptSub: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  promiseList: {
    marginBottom: 40,
  },
  promiseLine: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  promiseLast: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accentMuted,
    marginTop: 8,
    marginBottom: 0,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  disclaimerLink: {
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  dataRetentionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 24,
  },
});
